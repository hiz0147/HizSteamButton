(function () {
    var APP_ID = (window.location.pathname.match(/\/app\/(\d+)/) || [])[1];
    if (!APP_ID) return;

    var HIZ_URL = 'https://hizsearch.pages.dev';
    var isSteamStore = location.hostname === 'store.steampowered.com';
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

    function openHiz(newTab) {
        var url = HIZ_URL + '/?q=' + APP_ID;
        if (newTab) {
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
            wrapper.style.cssText = 'background:none;border:none;box-shadow:none;';
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

    function buildSteamNativeButton(showIcon, newTab, place) {
        var btn;

        if (place && (place.id === 'other-site-info' || place.id === 'below-dev-pub')) {
            btn = document.createElement('a');
            btn.className = 'btnv6_blue_hoverfade btn_medium';
            btn.href = '#';
            btn.id = 'hizsearch-btn';

            var span = document.createElement('span');
            if (showIcon) {
                var icon = document.createElement('img');
                icon.src = HIZ_URL + '/favicon-32x32.png';
                icon.alt = '';
                icon.style.cssText = 'width:16px;height:16px;vertical-align:middle;margin-right:6px;';
                span.appendChild(icon);
            }
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

        if (showIcon) {
            var icon = document.createElement('img');
            icon.src = HIZ_URL + '/favicon-32x32.png';
            icon.alt = '';
            icon.style.cssText = 'width:12px;height:12px;flex-shrink:0;';
            btn.appendChild(icon);
        }

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

    function buildSteamdbNativeButton(showIcon, newTab) {
        var btn = document.createElement('a');
        btn.id = 'hizsearch-btn';
        btn.className = 'btn';
        btn.style.fontWeight = '400';
        btn.href = '#';
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            openHiz(newTab);
        });

        if (showIcon) {
            var icon = document.createElement('img');
            icon.src = HIZ_URL + '/favicon-32x32.png';
            icon.alt = '';
            icon.style.cssText = 'width:16px;height:16px;vertical-align:middle;margin-right:4px;';
            btn.appendChild(icon);
        }

        btn.appendChild(document.createTextNode('HizSearch'));
        return btn;
    }

    function renderFloating(position, showIcon, newTab) {
        clean();
        var btn = document.createElement('div');
        btn.id = 'hizsearch-btn';

        if (showIcon) {
            var icon = document.createElement('img');
            icon.src = HIZ_URL + '/favicon-32x32.png';
            icon.alt = '';
            icon.className = 'hiz-icon';
            btn.appendChild(icon);
        }

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
            '#hizsearch-btn:active{transform:translateY(0);}',
            showIcon ? '#hizsearch-btn .hiz-icon{width:18px;height:18px;flex-shrink:0;}' : ''
        ].join('');

        document.head.appendChild(style);
        document.body.appendChild(btn);
    }

    function render(placeId, showIcon, newTab) {
        clean();

        if (placeId.indexOf('floating-') === 0) {
            renderFloating(placeId, showIcon, newTab);
            return;
        }

        var place = getPlace(placeId);
        if (!place) place = sitePlaces[currentSite][0];

        if (currentSite === 'steamdb') {
            var dbBtn = buildSteamdbNativeButton(showIcon, newTab);
            injectAtPlace(dbBtn, place);
            return;
        }

        var btn = buildSteamNativeButton(showIcon, newTab, place);

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

    chrome.storage.sync.get(['position', 'place_store', 'place_steamdb', 'showIcon', 'newTab'], function (data) {
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

        var placeId = data[storageKey] || defaultPlace;
        var newTab = 'newTab' in data ? data.newTab : !isSteamClient();
        render(placeId, data.showIcon !== false, newTab);
    });

    chrome.storage.onChanged.addListener(function (changes, area) {
        if (area === 'sync') {
            for (var key in changes) {
                if (key === storageKey || key === 'showIcon' || key === 'newTab') {
                    chrome.storage.sync.get([storageKey, 'showIcon', 'newTab'], function (data) {
                        var placeId = data[storageKey] || defaultPlace;
                        var newTab = 'newTab' in data ? data.newTab : !isSteamClient();
                        render(placeId, data.showIcon !== false, newTab);
                    });
                    return;
                }
            }
        }
    });
})();
