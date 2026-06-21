document.addEventListener('DOMContentLoaded', function () {
    var radios = document.querySelectorAll('input[name="pos"]');
    var showIconCheck = document.getElementById('showIcon');

    chrome.storage.sync.get(['position', 'showIcon'], function (data) {
        var currentPos = data.position || 'floating-right';
        for (var i = 0; i < radios.length; i++) {
            if (radios[i].value === currentPos) {
                radios[i].checked = true;
                break;
            }
        }
        showIconCheck.checked = data.showIcon !== false;
    });

    for (var i = 0; i < radios.length; i++) {
        radios[i].addEventListener('change', function () {
            if (this.checked) {
                chrome.storage.sync.set({ position: this.value });
            }
        });
    }

    showIconCheck.addEventListener('change', function () {
        chrome.storage.sync.set({ showIcon: this.checked });
    });
});
