(function () {
    var isSteamStore = location.hostname === 'store.steampowered.com';
    var isWishlist = isSteamStore && /\/wishlist\//.test(location.pathname);
    var APP_ID = (window.location.pathname.match(/\/app\/(\d+)/) || [])[1];
    if (!isSteamStore && !APP_ID) return;

    var HIZ_URL = 'https://hizsearch.pages.dev';
    var openInDefaultBrowser = true;
    var currentSite = isSteamStore ? 'store' : 'steamdb';
    chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
        if (msg.action === 'getSite') sendResponse({ site: currentSite });
    });

    var sitePlaces = {
        store: [
            { id: 'other-site-info', selector: '.apphub_OtherSiteInfo', method: 'append' },
            { id: 'left-of-cart', selector: '.game_purchase_action', method: 'prependWrap', wrapperClass: 'game_purchase_action_bg' },
            { id: 'below-dev-pub', selector: '.glance_ctn_responsive_left', method: 'append' }
        ],
        steamdb: [
            { id: 'app-links', selector: '.pagehead-actions.app-links', method: 'append' }
        ]
    };

    function getPlace(placeId) {
        var places = sitePlaces[currentSite];
        for (var i = 0; i < places.length; i++) {
            if (places[i].id === placeId) return places[i];
        }
        return null;
    }

    function isSteamClient() {
        return /Valve Steam|SteamClient/i.test(navigator.userAgent);
    }

    function openHiz(newTab, appId) {
        var url = HIZ_URL + '/?q=' + (appId || APP_ID);
        if (isSteamClient() && openInDefaultBrowser) {
            window.location.href = 'steam://openurl_external/' + url;
        } else if (newTab) {
            window.open(url, '_blank');
        } else {
            window.location.href = url;
        }
    }

    function clean() {
        var old = document.getElementById('hizsearch-btn');
        if (old) {
            var parent = old.parentNode;
            old.remove();
            if (parent && parent.getAttribute('data-hizwrap') === '') parent.remove();
        }
        var oldStyle = document.getElementById('hizsearch-style');
        if (oldStyle) oldStyle.remove();
    }

    function injectAtPlace(btn, place) {
        var target = document.querySelector(place.selector);
        if (!target) return false;

        var node = btn;
        if (place.method === 'prependWrap') {
            var wrapper = document.createElement('div');
            if (place.wrapperClass) wrapper.className = place.wrapperClass;
            wrapper.setAttribute('data-hizwrap', '');
            wrapper.style.cssText = 'position:relative;z-index:1;display:inline-flex;background:none;border:none;box-shadow:none;';
            if (!document.getElementById('hizsearch-wrapper-style')) {
                var wrapStyle = document.createElement('style');
                wrapStyle.id = 'hizsearch-wrapper-style';
                wrapStyle.textContent = '[data-hizwrap]::before{content:"";position:absolute;inset:-1px;background:#000;border-radius:2px;z-index:-1;}';
                document.head.appendChild(wrapStyle);
            }
            wrapper.appendChild(btn);
            node = wrapper;
        }

        switch (place.method) {
            case 'append':
                target.appendChild(node);
                break;
            case 'prepend':
            case 'prependWrap':
                target.insertBefore(node, target.firstChild);
                break;
        }
        return true;
    }

    function getWishlistAppId(row) {
        var drag = row.getAttribute('data-rfd-draggable-id') || '';
        var m = drag.match(/^WishlistItem-(\d+)-/);
        if (m) return m[1];
        var link = row.querySelector('a[href*="/app/"]');
        if (link) {
            var m2 = (link.href.match(/\/app\/(\d+)/) || [])[1];
            if (m2) return m2;
        }
        return null;
    }

    function findActionPriceLink(row) {
        var links = row.querySelectorAll('a[href*="/app/"]');
        for (var i = links.length - 1; i >= 0; i--) {
            var link = links[i];
            if (link.querySelector('img')) continue;
            if (link.parentElement && link.parentElement.querySelector('button')) return link;
        }
        return null;
    }

    function getNonImageAppLink(row) {
        var links = row.querySelectorAll('a[href*="/app/"]');
        for (var i = 0; i < links.length; i++) {
            if (!links[i].querySelector('img')) return links[i];
        }
        return null;
    }

    function buildWishlistButton(newTab, appId) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'hizsearch-btn';
        btn.style.cssText =
            'cursor:pointer;' +
            'padding:0 21px;height:32px;' +
            'background:#67C1F5CC;color:#fff;' +
            'border-radius:2px;text-align:center;' +
            'font-family:"Motiva Sans",sans-serif;' +
            'font-size:14px;display:inline-flex;align-items:center;gap:4px;' +
            'line-height:32px;border:0;position:relative;' +
            'flex-shrink:0;margin:0 3px 0 0;' +
            'transition:all 0.2s ease;' +
            'user-select:none;';

        var label = document.createElement('span');
        label.textContent = 'HizSearch';
        btn.appendChild(label);

        btn.addEventListener('mouseenter', function () {
            btn.style.background = 'linear-gradient(-60deg, #417a9b 5%, #67c1f5 95%)';
        });
        btn.addEventListener('mouseleave', function () {
            btn.style.background = '#67C1F5CC';
        });
        btn.addEventListener('click', function () {
            openHiz(newTab, appId);
        });

        return btn;
    }

    function cleanWishlist() {
        var btns = document.querySelectorAll('.hizsearch-btn');
        for (var i = 0; i < btns.length; i++) btns[i].remove();
        var rows = document.querySelectorAll('[data-rfd-draggable-id^="WishlistItem-"][data-hiz]');
        for (var j = 0; j < rows.length; j++) rows[j].removeAttribute('data-hiz');
    }

    var wishlistTimer = null;
    var wishlistObserver = null;

    function scanWishlist(newTab) {
        var rows = document.querySelectorAll('[data-rfd-draggable-id^="WishlistItem-"]');
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            if (row.hasAttribute('data-hiz')) continue;
            var appId = getWishlistAppId(row);
            if (!appId) continue;

            var priceLink = findActionPriceLink(row);
            var btn = buildWishlistButton(newTab, appId);
            if (priceLink) {
                var box = priceLink.parentElement;
                box.parentElement.insertBefore(btn, box);
            } else {
                var titleLink = getNonImageAppLink(row);
                if (!titleLink) continue;
                titleLink.parentElement.insertBefore(btn, titleLink.nextSibling);
            }
            row.setAttribute('data-hiz', '');
        }
    }

    function renderWishlist(newTab) {
        cleanWishlist();
        scanWishlist(newTab);

        if (wishlistObserver) wishlistObserver.disconnect();
        wishlistObserver = new MutationObserver(function () {
            clearTimeout(wishlistTimer);
            wishlistTimer = setTimeout(function () {
                scanWishlist(newTab);
            }, 100);
        });
        wishlistObserver.observe(document.body, { childList: true, subtree: true });
    }

    var hizNewTab = true;
    var pendingAppId = null;
    var capsuleTimer = null;
    var capsuleObserver = null;

    function addMenuOption(tip) {
        if (tip.querySelector('[data-hiz-menu]')) return;
        var opt = document.createElement('div');
        opt.className = 'option';
        opt.setAttribute('data-hiz-menu', '');
        opt.textContent = 'HizSearch';
        opt.style.cursor = 'pointer';
        opt.addEventListener('click', function () {
            if (pendingAppId) openHiz(hizNewTab, pendingAppId);
            try {
                if (tip.hidePopover) tip.hidePopover();
            } catch (e) {}
        });
        tip.appendChild(opt);
    }

    function injectMenuOption() {
        var tips = document.querySelectorAll('.ds_options_tooltip');
        for (var i = 0; i < tips.length; i++) addMenuOption(tips[i]);
    }

    function initCapsuleMenu() {
        document.addEventListener('click', function (e) {
            var cap = e.target.closest('[data-ds-appid]');
            if (cap) pendingAppId = cap.getAttribute('data-ds-appid');
        }, true);

        capsuleObserver = new MutationObserver(function () {
            clearTimeout(capsuleTimer);
            capsuleTimer = setTimeout(injectMenuOption, 50);
        });
        capsuleObserver.observe(document.body, { childList: true, subtree: true });
        injectMenuOption();
    }

    function buildSteamNativeButton(newTab, place) {
        var btn;

        if (place && (place.id === 'other-site-info' || place.id === 'below-dev-pub')) {
            btn = document.createElement('a');
            btn.className = 'btnv6_blue_hoverfade btn_medium';
            btn.href = '#';
            btn.id = 'hizsearch-btn';

            var span = document.createElement('span');
            span.appendChild(document.createTextNode('HizSearch'));
            btn.appendChild(span);

            btn.addEventListener('click', function (e) {
                e.preventDefault();
                openHiz(newTab);
            });

            return btn;
        }

        btn = document.createElement('div');
        btn.id = 'hizsearch-btn';
        btn.style.cssText =
            'cursor:pointer;' +
            'padding:0 13px;height:32px;' +
            'background:#67C1F5CC;color:#fff;' +
            'border-radius:2px;text-align:center;' +
            'font-family:"Motiva Sans",sans-serif;' +
            'font-size:14px;display:inline-flex;align-items:center;gap:4px;' +
            'line-height:32px;border:0;position:relative;' +
            'transition:all 0.2s ease;' +
            'user-select:none;';

        var label = document.createElement('span');
        label.textContent = 'HizSearch';
        btn.appendChild(label);

        btn.addEventListener('mouseenter', function () {
            btn.style.background = 'linear-gradient(-60deg, #417a9b 5%, #67c1f5 95%)';
        });
        btn.addEventListener('mouseleave', function () {
            btn.style.background = '#67C1F5CC';
        });
        btn.addEventListener('click', function () {
            openHiz(newTab);
        });

        return btn;
    }

    function buildSteamdbNativeButton(newTab) {
        var btn = document.createElement('a');
        btn.id = 'hizsearch-btn';
        btn.className = 'btn';
        btn.style.fontWeight = '400';
        btn.href = '#';
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            openHiz(newTab);
        });

        btn.appendChild(document.createTextNode('HizSearch'));
        return btn;
    }

    function renderFloating(position, newTab) {
        clean();
        var btn = document.createElement('div');
        btn.id = 'hizsearch-btn';

        var label = document.createElement('span');
        label.textContent = 'Search on Hiz';
        btn.appendChild(label);

        btn.addEventListener('click', function () {
            openHiz(newTab);
        });

        var isRight = position === 'floating-right';

        var style = document.createElement('style');
        style.id = 'hizsearch-style';
        style.textContent = [
            '#hizsearch-btn{',
            'position:fixed;',
            'bottom:20px;',
            isRight ? 'right:20px;' : 'left:20px;',
            'z-index:999999;',
            'display:flex;align-items:center;gap:8px;',
            'padding:10px 18px;',
            'background:rgba(0,0,0,0.3);',
            'backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);',
            'border:1px solid rgba(255,255,255,0.1);',
            'color:rgba(255,255,255,0.6);',
            'font-family:"JetBrains Mono","Consolas",monospace;',
            'font-size:0.7rem;font-weight:500;',
            'letter-spacing:0.08em;text-transform:uppercase;',
            'cursor:pointer;user-select:none;',
            'transition:all 0.25s ease;',
            '}',
            '#hizsearch-btn:hover{',
            'border-color:rgba(16,185,129,0.4);',
            'color:#10b981;',
            'background:rgba(16,185,129,0.05);',
            'transform:translateY(-2px);',
            'box-shadow:0 10px 20px -10px rgba(16,185,129,0.15);',
            '}',
            '#hizsearch-btn:active{transform:translateY(0);}'
        ].join('');

        document.head.appendChild(style);
        document.body.appendChild(btn);
    }

    function render(placeId, newTab) {
        clean();

        if (placeId.indexOf('floating-') === 0) {
            renderFloating(placeId, newTab);
            return;
        }

        var place = getPlace(placeId);
        if (!place) place = sitePlaces[currentSite][0];

        if (currentSite === 'steamdb') {
            var dbBtn = buildSteamdbNativeButton(newTab);
            injectAtPlace(dbBtn, place);
            return;
        }

        var btn = buildSteamNativeButton(newTab, place);

        if (place.id === 'other-site-info') {
            var container = document.querySelector(place.selector);
            if (!container) {
                var observer = new MutationObserver(function () {
                    var c = document.querySelector(place.selector);
                    if (c) {
                        observer.disconnect();
                        container = c;
                        container.appendChild(btn);
                    }
                });
                observer.observe(document.body, { childList: true, subtree: true });
                return;
            }
            container.appendChild(btn);
            return;
        }

        injectAtPlace(btn, place);
    }

    var storageKey = currentSite === 'store' ? 'place_store' : 'place_steamdb';
    var defaultPlace = currentSite === 'store' ? 'other-site-info' : 'app-links';

    if (isSteamStore) initCapsuleMenu();

    chrome.storage.sync.get(['position', 'place_store', 'place_steamdb', 'newTab', 'openInDefaultBrowser'], function (data) {
        openInDefaultBrowser = data.openInDefaultBrowser !== false;
        if ('position' in data && !('place_store' in data) && !('place_steamdb' in data)) {
            var migrate = data.position;
            if (migrate === 'native' || migrate === 'steam-native') {
                migrate = defaultPlace;
            }
            var obj = {};
            obj.place_store = migrate;
            obj.place_steamdb = migrate;
            chrome.storage.sync.set(obj);
            chrome.storage.sync.remove('position');
        }

        var newTab = 'newTab' in data ? data.newTab : !isSteamClient();
        hizNewTab = newTab;
        if (isWishlist) {
            renderWishlist(newTab);
            return;
        }
        if (!APP_ID) return;

        var placeId = data[storageKey] || defaultPlace;
        render(placeId, newTab);
    });

    chrome.storage.onChanged.addListener(function (changes, area) {
        if (area !== 'sync') return;
        if (changes.openInDefaultBrowser) {
            openInDefaultBrowser = changes.openInDefaultBrowser.newValue !== false;
        }
        var hit = false;
        for (var key in changes) {
            if (key === storageKey || key === 'newTab') { hit = true; break; }
        }
        if (!hit) return;
        chrome.storage.sync.get([storageKey, 'newTab'], function (data) {
            var newTab = 'newTab' in data ? data.newTab : !isSteamClient();
            hizNewTab = newTab;
            if (isWishlist) {
                renderWishlist(newTab);
                return;
            }
            if (!APP_ID) return;
            var placeId = data[storageKey] || defaultPlace;
            render(placeId, newTab);
        });
    });
})();
