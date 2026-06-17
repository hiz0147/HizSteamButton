// ==UserScript==
// @name         HizSearch Steam Button
// @namespace    https://hizsearch.pages.dev/
// @version      1.0.0
// @description  Search the current game on HizSearch
// @author       HizSearch
// @match        https://store.steampowered.com/app/*
// @icon         https://hizsearch.pages.dev/favicon.ico
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    var APP_ID = window.location.pathname.match(/\/app\/(\d+)/);
    if (!APP_ID) return;
    APP_ID = APP_ID[1];

    var HIZ_URL = 'https://hizsearch.pages.dev';

    var btn = document.createElement('div');
    btn.id = 'hizsearch-btn';

    var icon = document.createElement('img');
    icon.src = HIZ_URL + '/favicon-32x32.png';
    icon.alt = '';
    icon.className = 'hiz-icon';

    var label = document.createElement('span');
    label.textContent = 'Search on Hiz';

    btn.appendChild(icon);
    btn.appendChild(label);

    btn.addEventListener('click', function () {
        window.open(HIZ_URL + '/?q=' + APP_ID + '&utm_source=hizsearch-steam-button', '_blank');
    });

    var style = document.createElement('style');
    style.textContent =
        '#hizsearch-btn{' +
        'position:fixed;' +
        'bottom:20px;right:20px;' +
        'z-index:999999;' +
        'display:flex;' +
        'align-items:center;' +
        'gap:8px;' +
        'padding:10px 18px;' +
        'background:rgba(0,0,0,0.3);' +
        'backdrop-filter:blur(8px);' +
        '-webkit-backdrop-filter:blur(8px);' +
        'border:1px solid rgba(255,255,255,0.1);' +
        'color:rgba(255,255,255,0.6);' +
        'font-family:"JetBrains Mono","Consolas",monospace;' +
        'font-size:0.7rem;' +
        'font-weight:500;' +
        'letter-spacing:0.08em;' +
        'text-transform:uppercase;' +
        'cursor:pointer;' +
        'user-select:none;' +
        'transition:all 0.25s ease;' +
        '}' +
        '#hizsearch-btn:hover{' +
        'border-color:rgba(16,185,129,0.4);' +
        'color:#10b981;' +
        'background:rgba(16,185,129,0.05);' +
        'transform:translateY(-2px);' +
        'box-shadow:0 10px 20px -10px rgba(16,185,129,0.15);' +
        '}' +
        '#hizsearch-btn:active{' +
        'transform:translateY(0);' +
        '}' +
        '#hizsearch-btn .hiz-icon{' +
        'width:18px;height:18px;' +
        'flex-shrink:0;' +
        '}';

    document.head.appendChild(style);
    document.body.appendChild(btn);
})();
