// =========================================================
// 时钟、搜索、键盘
// =========================================================

(() => {
    'use strict';

    // -----------------------------------------------------
    // 时钟
    // -----------------------------------------------------

    const clockElement = document.getElementById('clock');
    const timeElement = document.getElementById('clock-time');
    const dateElement = document.getElementById('clock-date');

    const weekdays = [
        '星期日',
        '星期一',
        '星期二',
        '星期三',
        '星期四',
        '星期五',
        '星期六',
    ];

    function pad(value) {
        return String(value).padStart(2, '0');
    }

    function updateClock() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const hours = pad(now.getHours());
        const minutes = pad(now.getMinutes());

        timeElement.textContent = `${hours}:${minutes}`;
        dateElement.textContent = `${month}月${day}日${weekdays[now.getDay()]}`;
        clockElement.dateTime =
            `${year}-${pad(month)}-${pad(day)}T${hours}:${minutes}`;
    }

    // -----------------------------------------------------
    // 搜索引擎
    // -----------------------------------------------------

    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-bar');
    const engineButton = document.getElementById('engine-button');
    const engineIcon = document.getElementById('engine-icon');
    const engineMenu = document.getElementById('engine-menu');
    const enginePicker = document.querySelector('.engine-picker');

    const engines = CONFIG.engines;
    const ENGINE_SHORTCUT_KEY = 'F2';

    let savedEngine = null;
    try {
        savedEngine = localStorage.getItem('searchEngine');
    } catch {
        savedEngine = null;
    }

    let currentEngineId = savedEngine || CONFIG.defaultEngine;
    if (!engines.some((engine) => engine.id === currentEngineId)) {
        currentEngineId = CONFIG.defaultEngine;
    }

    let menuOpen = false;

    function getEngine(id = currentEngineId) {
        return (
            engines.find((engine) => engine.id === id) ||
            engines.find((engine) => engine.id === CONFIG.defaultEngine) ||
            engines[0]
        );
    }

    function buildSearchUrl(engine, query) {
        return `${engine.url}?${engine.param}=${encodeURIComponent(query)}`;
    }

    function applyEngine(id, { persist = true } = {}) {
        const engine = getEngine(id);
        currentEngineId = engine.id;

        engineIcon.src = engine.icon;
        engineIcon.alt = '';
        engineButton.setAttribute(
            'aria-label',
            `当前搜索引擎：${engine.name}，点击选择`
        );
        searchForm.action = engine.url;
        searchInput.name = engine.param;

        if (persist) {
            try {
                localStorage.setItem('searchEngine', engine.id);
            } catch {
                // localStorage 不可用时，这次选择只在当前页面有效
            }
        }

        for (const option of engineMenu.querySelectorAll('.engine-option')) {
            option.setAttribute(
                'aria-checked',
                String(option.dataset.engine === engine.id)
            );
        }
    }

    function renderEngineMenu() {
        engineMenu.replaceChildren();

        for (const engine of engines) {
            const option = document.createElement('button');
            option.type = 'button';
            option.className = 'engine-option';
            option.dataset.engine = engine.id;
            option.setAttribute('role', 'menuitemradio');
            option.setAttribute('aria-label', engine.name);
            option.setAttribute(
                'aria-checked',
                String(engine.id === currentEngineId)
            );

            const image = document.createElement('img');
            image.src = engine.icon;
            image.alt = '';
            image.width = 20;
            image.height = 20;

            option.append(image);
            option.addEventListener('click', () => {
                applyEngine(engine.id);
                closeEngineMenu({ focusButton: true });
            });

            engineMenu.append(option);
        }
    }

    function openEngineMenu() {
        if (menuOpen) return;

        menuOpen = true;
        engineMenu.hidden = false;
        engineButton.setAttribute('aria-expanded', 'true');

        const selected =
            engineMenu.querySelector('[aria-checked="true"]') ||
            engineMenu.firstElementChild;

        selected?.focus({ preventScroll: true });
    }

    function closeEngineMenu({ focusButton = false } = {}) {
        if (!menuOpen) return;

        menuOpen = false;
        engineMenu.hidden = true;
        engineButton.setAttribute('aria-expanded', 'false');

        if (focusButton) {
            engineButton.focus({ preventScroll: true });
        }
    }

    function toggleEngineMenu() {
        if (menuOpen) {
            closeEngineMenu();
        } else {
            openEngineMenu();
        }
    }

    function cycleEngine() {
        const index = engines.findIndex(
            (engine) => engine.id === currentEngineId
        );
        const next = engines[(index + 1) % engines.length];

        if (!next) return;

        if (menuOpen) {
            closeEngineMenu({ focusButton: true });
        }

        applyEngine(next.id);
    }

    engineButton.addEventListener('click', toggleEngineMenu);
    engineButton.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            openEngineMenu();
        }
    });

    engineMenu.addEventListener('keydown', (event) => {
        const options = [...engineMenu.querySelectorAll('.engine-option')];
        const index = options.indexOf(document.activeElement);

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            options[(index + 1) % options.length]?.focus();
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            options[(index - 1 + options.length) % options.length]?.focus();
        } else if (event.key === 'Home') {
            event.preventDefault();
            options[0]?.focus();
        } else if (event.key === 'End') {
            event.preventDefault();
            options[options.length - 1]?.focus();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            closeEngineMenu({ focusButton: true });
        } else if (event.key === 'Tab') {
            event.preventDefault();
            const next = event.shiftKey ? engineButton : searchInput;
            closeEngineMenu();
            next.focus({ preventScroll: true });
        }
    });

    document.addEventListener('pointerdown', (event) => {
        if (menuOpen && !enginePicker.contains(event.target)) {
            closeEngineMenu();
        }
    });

    // -----------------------------------------------------
    // 搜索
    // -----------------------------------------------------

    let composing = false;

    searchInput.addEventListener('compositionstart', () => {
        composing = true;
    });

    searchInput.addEventListener('compositionend', () => {
        composing = false;
    });

    // 搜索框为空时按 : 打开书签查找
    searchInput.addEventListener('keydown', (event) => {
        if (
            event.key === ':' &&
            !event.ctrlKey &&
            !event.altKey &&
            !event.metaKey &&
            !searchInput.value.trim() &&
            !document.querySelector('dialog[open]')
        ) {
            event.preventDefault();
            document.dispatchEvent(new CustomEvent('open-bookmark-finder'));
        }
    });

    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // 中文输入法正在选词时，不要把回车当成提交
        if (composing) return;

        const query = searchInput.value.trim();
        if (!query) return;

        if (/^https?:\/\//i.test(query)) {
            window.location.href = query;
            return;
        }

        // 搜索在新标签页打开，起始页保持在原地
        window.open(
            buildSearchUrl(getEngine(), query),
            '_blank',
            'noopener,noreferrer'
        );
    });

    // -----------------------------------------------------
    // 全局键盘
    // -----------------------------------------------------

    function isEditableElement(element) {
        if (!element) return false;

        const tag = element.tagName;
        return (
            tag === 'INPUT' ||
            tag === 'TEXTAREA' ||
            tag === 'SELECT' ||
            element.isContentEditable
        );
    }

    document.addEventListener('keydown', (event) => {
        if (event.isComposing || event.keyCode === 229) return;

        // 按 F2 在 Bing / Google 之间循环
        if (
            event.key === ENGINE_SHORTCUT_KEY &&
            !event.ctrlKey &&
            !event.altKey &&
            !event.metaKey
        ) {
            event.preventDefault();
            cycleEngine();
            return;
        }

        // 不在输入框里时，按 : 打开书签查找
        if (
            event.key === ':' &&
            !event.ctrlKey &&
            !event.altKey &&
            !event.metaKey &&
            !isEditableElement(document.activeElement) &&
            !document.querySelector('dialog[open]')
        ) {
            event.preventDefault();
            if (menuOpen) closeEngineMenu();
            document.dispatchEvent(new CustomEvent('open-bookmark-finder'));
            return;
        }

        // 按 / 快速回到搜索框
        if (
            event.key === '/' &&
            !event.ctrlKey &&
            !event.altKey &&
            !event.metaKey
        ) {
            if (isEditableElement(document.activeElement)) return;
            if (document.querySelector('dialog[open]')) return;

            event.preventDefault();
            if (menuOpen) closeEngineMenu();
            searchInput.focus({ preventScroll: true });
            searchInput.select();
            return;
        }

        if (event.key === 'Escape') {
            if (menuOpen) {
                event.preventDefault();
                closeEngineMenu({ focusButton: true });
                return;
            }

            if (document.activeElement === searchInput) {
                if (searchInput.value) {
                    searchInput.value = '';
                } else {
                    searchInput.blur();
                }
            }
        }
    });

    // -----------------------------------------------------
    // 聚焦搜索框
    // -----------------------------------------------------

    function focusSearch() {
        if (document.querySelector('dialog[open]')) return;
        searchInput.focus({ preventScroll: true });
    }

    // 只在页面本身没有明确聚焦到别的东西时接管焦点
    function focusSearchIfIdle() {
        if (document.querySelector('dialog[open]')) return;
        if (!document.hasFocus()) return;

        const active = document.activeElement;
        if (
            !active ||
            active === document.body ||
            active === document.documentElement
        ) {
            focusSearch();
        }
    }

    function focusSearchWhenReady() {
        focusSearchIfIdle();
        window.setTimeout(focusSearchIfIdle, 50);
        window.setTimeout(focusSearchIfIdle, 200);
    }

    window.addEventListener('load', focusSearchWhenReady);
    window.addEventListener('pageshow', focusSearchWhenReady);
    window.addEventListener('focus', focusSearchIfIdle);

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) focusSearchIfIdle();
    });

    // 点击页面空白处也把光标送回搜索框
    document.addEventListener('pointerdown', (event) => {
        if (document.querySelector('dialog[open]')) return;
        if (
            event.target.closest(
                'a, button, input, select, textarea, dialog'
            )
        ) {
            return;
        }

        focusSearch();
    });

    // -----------------------------------------------------
    // 启动
    // -----------------------------------------------------

    function init() {
        renderEngineMenu();
        applyEngine(currentEngineId, { persist: false });
        updateClock();
        window.setInterval(updateClock, 1000);
        focusSearchWhenReady();
    }

    init();
})();
