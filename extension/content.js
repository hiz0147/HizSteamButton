(function () {
    var APP_ID = (window.location.pathname.match(/\/app\/(\d+)/) || [])[1];
    if (!APP_ID) return;

    var HIZ_URL = 'https://hizsearch.pages.dev';
    var isSteamStore = location.hostname === 'store.steampowered.com';

    function openHiz(newTab) {
        var url = HIZ_URL + '/?q=' + APP_ID;
        if (newTab) {
            window.open(url, '_blank');
        } else {
            window.location.href = url;
        }
    }

    function buildButton(showIcon, newTab) {
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

        return btn;
    }

    function clean() {
        var old = document.getElementById('hizsearch-btn');
        if (old) old.remove();
        var oldStyle = document.getElementById('hizsearch-style');
        if (oldStyle) oldStyle.remove();
    }

    function renderFloating(position, showIcon, newTab) {
        clean();
        var btn = buildButton(showIcon, newTab);
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

    function renderSteamNative(showIcon, newTab) {
        var container = document.querySelector('.apphub_OtherSiteInfo');
        if (!container) {
            var observer = new MutationObserver(function () {
                var c = document.querySelector('.apphub_OtherSiteInfo');
                if (c) {
                    observer.disconnect();
                    renderSteamNative(showIcon);
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
            return;
        }

        clean();
        var btn = document.createElement('div');
        btn.id = 'hizsearch-btn';

        btn.style.cssText =
            'cursor:pointer;' +
            'padding:5px 13px;margin:2px 0;' +
            'background:#67C1F533;color:#67c1f5;' +
            'border-radius:2px;text-align:center;' +
            'font-family:"Motiva Sans",sans-serif;' +
            'font-size:15px;display:inline-flex;align-items:center;gap:4px;' +
            'line-height:normal;border:0;position:relative;' +
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
            btn.style.color = '#fff';
        });
        btn.addEventListener('mouseleave', function () {
            btn.style.background = '#67C1F533';
            btn.style.color = '#67c1f5';
        });
        btn.addEventListener('click', function () {
            openHiz(newTab);
        });

        container.appendChild(btn);
    }

    function renderSteamdbNative(showIcon, newTab) {
        var container = document.querySelector('.pagehead-actions.app-links');
        if (!container) return;

        clean();
        var btn = document.createElement('a');
        btn.id = 'hizsearch-btn';
        btn.className = 'btn';
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
        container.appendChild(btn);
    }

    function render(position, showIcon, newTab) {
        clean();
        if (position === 'native' || position === 'steam-native') {
            if (isSteamStore) {
                renderSteamNative(showIcon, newTab);
            } else {
                renderSteamdbNative(showIcon, newTab);
            }
        } else {
            renderFloating(position, showIcon, newTab);
        }
    }

    chrome.storage.sync.get(['position', 'showIcon', 'newTab'], function (data) {
        render(data.position || 'floating-right', data.showIcon !== false, data.newTab !== false);
    });

    chrome.storage.onChanged.addListener(function (changes, area) {
        if (area === 'sync' && (changes.position || changes.showIcon || changes.newTab)) {
            chrome.storage.sync.get(['position', 'showIcon', 'newTab'], function (data) {
                render(data.position || 'floating-right', data.showIcon !== false, data.newTab !== false);
            });
        }
    });
})();
