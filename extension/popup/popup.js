document.addEventListener('DOMContentLoaded', function () {
    var sitePlaces = {
        store: [
            { id: 'floating-right', label: 'Floating Right' },
            { id: 'floating-left', label: 'Floating Left' },
            { id: 'other-site-info', label: 'Community Hub area' },
            { id: 'left-of-cart', label: 'Left of Add to Cart' },
            { id: 'below-dev-pub', label: 'Below Developer/Publisher' }
        ],
        steamdb: [
            { id: 'floating-right', label: 'Floating Right' },
            { id: 'floating-left', label: 'Floating Left' },
            { id: 'app-links', label: 'App Links' }
        ]
    };

    var siteLabel = document.getElementById('siteLabel');
    var placeOptions = document.getElementById('placeOptions');
    var showIconCheck = document.getElementById('showIcon');
    var newTabCheck = document.getElementById('newTab');

    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        var tabId = tabs && tabs[0] && tabs[0].id;
        if (!tabId) { renderConfig('store'); return; }

        chrome.tabs.sendMessage(tabId, {action: 'getSite'}, function (response) {
            if (chrome.runtime.lastError) { /* no content script */ }
            renderConfig((response && response.site) || 'store');
        });
    });

    function renderConfig(currentSite) {
        var storageKey = currentSite === 'store' ? 'place_store' : 'place_steamdb';
        siteLabel.textContent = currentSite === 'store' ? 'Steam Store' : 'SteamDB';

        chrome.storage.sync.get(['position', 'place_store', 'place_steamdb', 'showIcon', 'newTab'], function (data) {
            if ('position' in data && !('place_store' in data) && !('place_steamdb' in data)) {
                var migrate = data.position;
                if (migrate === 'native' || migrate === 'steam-native') {
                    migrate = 'other-site-info';
                }
                chrome.storage.sync.set({ place_store: migrate, place_steamdb: migrate });
                chrome.storage.sync.remove('position');
            }

            var selectedPlace = data[storageKey] || (currentSite === 'store' ? 'other-site-info' : 'app-links');

            var places = sitePlaces[currentSite];
            var html = '<div class="place-label">Places</div>';
            for (var i = 0; i < places.length; i++) {
                var checked = places[i].id === selectedPlace ? ' checked' : '';
                html += '<label><input type="radio" name="place" value="' + places[i].id + '"' + checked + '> ' + places[i].label + '</label>';
            }
            placeOptions.innerHTML = html;

            var radios = placeOptions.querySelectorAll('input[name="place"]');
            for (var j = 0; j < radios.length; j++) {
                radios[j].addEventListener('change', function () {
                    if (this.checked) {
                        chrome.storage.sync.set({ [storageKey]: this.value });
                    }
                });
            }

            showIconCheck.checked = data.showIcon !== false;
            newTabCheck.checked = data.newTab !== false;
        });
    }

    showIconCheck.addEventListener('change', function () {
        chrome.storage.sync.set({ showIcon: this.checked });
    });

    newTabCheck.addEventListener('change', function () {
        chrome.storage.sync.set({ newTab: this.checked });
    });
});
