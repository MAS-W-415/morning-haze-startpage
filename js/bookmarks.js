// =========================================================
// 收藏夹栏
// 主页只保留右下角入口，浮层里逐层查看
// =========================================================

(() => {
    'use strict';

    // -----------------------------------------------------
    // DOM
    // -----------------------------------------------------

    const statusElement = document.getElementById('bookmarks-status');
    const searchInput = document.getElementById('search-bar');
    const bookmarkLauncher = document.getElementById('bookmark-launcher');

    const folderDialog = document.getElementById('folder-dialog');
    const folderBackButton = document.getElementById('folder-back');
    const folderSearchButton = document.getElementById('folder-search');
    const folderCloseButton = document.getElementById('folder-close');
    const folderDialogTitle = document.getElementById('folder-dialog-title');
    const folderDialogDot = document.getElementById('folder-dialog-dot');
    const folderDialogCount = document.getElementById('folder-dialog-count');
    const folderBreadcrumbElement = document.getElementById('folder-breadcrumb');
    const folderBodyElement = document.getElementById('folder-dialog-body');

    const finderDialog = document.getElementById('bookmark-finder');
    const finderInput = document.getElementById('bookmark-finder-input');
    const finderCloseButton = document.getElementById('bookmark-finder-close');
    const finderResultsElement = document.getElementById('bookmark-finder-results');
    const finderSummaryElement = document.getElementById('bookmark-finder-summary');
    const finderEmptyElement = document.getElementById('bookmark-finder-empty');

    const FAVICON_SIZE = 32;
    const USAGE_KEY = 'bookmarkUsage.v1';

    const BOOKMARK_EVENTS = [
        'onCreated',
        'onRemoved',
        'onChanged',
        'onMoved',
        'onChildrenReordered',
    ];

    // -----------------------------------------------------
    // 状态
    // -----------------------------------------------------

    let refreshTimer = null;
    let tiles = [];
    let flatBookmarks = [];
    let folderStack = [];
    let folderReturnFocus = null;

    let finderItems = [];
    let finderIndex = -1;
    let finderReturnFocus = null;

    let usage = loadUsage();

    // -----------------------------------------------------
    // 读取数据
    // -----------------------------------------------------

    function hasBookmarksApi() {
        return (
            typeof chrome !== 'undefined' &&
            chrome.bookmarks &&
            typeof chrome.bookmarks.getTree === 'function'
        );
    }

    function getBookmarksTree() {
        return new Promise((resolve, reject) => {
            chrome.bookmarks.getTree((tree) => {
                const error = chrome.runtime.lastError;
                if (error) {
                    reject(new Error(error.message));
                    return;
                }
                resolve(tree);
            });
        });
    }

    // Chromium 134+ 用 folderType 标记收藏夹栏；
    // 旧版本没有 folderType，就退回 id === '1' 或标题匹配。
    function findBookmarksBars(tree) {
        const root = tree && tree[0];
        const children = root && Array.isArray(root.children) ? root.children : [];

        let bars = children.filter((node) => node.folderType === 'bookmarks-bar');

        if (bars.length === 0) {
            bars = children.filter(
                (node) =>
                    node.id === '1' ||
                    /bookmarks bar|favorites bar|收藏夹栏/i.test(node.title || '')
            );
        }

        return bars;
    }

    function sortByIndex(nodes) {
        return [...nodes].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    }

    // 某些 Edge 配置里可能同时存在同步和不同步的收藏夹栏，
    // 这里合并它们，并按 URL 去掉重复书签。
    function mergeBarChildren(bars) {
        const merged = [];
        const seenUrls = new Set();

        for (const bar of bars) {
            for (const node of sortByIndex(bar.children || [])) {
                if (node.url) {
                    if (seenUrls.has(node.url)) continue;
                    seenUrls.add(node.url);
                }
                merged.push(node);
            }
        }

        return merged;
    }

    // -----------------------------------------------------
    // 工具
    // -----------------------------------------------------

    function isSafeUrl(url) {
        return typeof url === 'string' && /^https?:\/\//i.test(url);
    }

    function getHostname(url) {
        try {
            return new URL(url).hostname.replace(/^www\./i, '');
        } catch {
            return '';
        }
    }

    function hashString(value) {
        let hash = 0;
        const text = String(value || '');

        for (let index = 0; index < text.length; index += 1) {
            hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
        }

        return hash;
    }

    function colorFor(value) {
        const colors = CONFIG.folderColors;
        return colors[hashString(value) % colors.length];
    }

    function loadUsage() {
        try {
            const raw = localStorage.getItem(USAGE_KEY);
            if (!raw) return {};

            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
                ? parsed
                : {};
        } catch {
            return {};
        }
    }

    function saveUsage() {
        try {
            localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
        } catch {
            // localStorage 不可用时，使用记录只在当前页面有效
        }
    }

    function recordBookmarkUsage(url) {
        if (!isSafeUrl(url)) return;

        // 可能有多个新标签页同时开着，写之前先读一次最新记录
        usage = loadUsage();

        const current = usage[url];
        const entry =
            current && typeof current.count === 'number'
                ? current
                : { count: 0, lastUsed: 0 };

        entry.count += 1;
        entry.lastUsed = Date.now();
        usage[url] = entry;
        saveUsage();
    }

    function folderTitle(node) {
        return (node.title && node.title.trim()) || '未命名文件夹';
    }

    function countBookmarks(node) {
        if (node.url) {
            return isSafeUrl(node.url) ? 1 : 0;
        }

        return (node.children || []).reduce(
            (sum, child) => sum + countBookmarks(child),
            0
        );
    }

    // path 是当前文件夹的完整路径，例如 ['开发工具', '项目']
    function collectBookmarks(folder, path, output) {
        for (const child of sortByIndex(folder.children || [])) {
            if (child.url) {
                if (!isSafeUrl(child.url)) continue;

                const title =
                    (child.title && child.title.trim()) ||
                    getHostname(child.url) ||
                    child.url;

                output.push({
                    id: child.id,
                    title,
                    url: child.url,
                    path: [...path],
                    pathText: path.join(' / '),
                    order: output.length,
                });
                continue;
            }

            if (Array.isArray(child.children)) {
                collectBookmarks(child, [...path, folderTitle(child)], output);
            }
        }
    }

    function buildData(children) {
        const nextTiles = [];
        const flat = [];

        const folders = children.filter(
            (node) => !node.url && Array.isArray(node.children)
        );
        const looseBookmarks = children.filter(
            (node) => node.url && isSafeUrl(node.url)
        );

        // 顶层文件夹 → 一个磁贴
        for (const folder of folders) {
            const count = countBookmarks(folder);
            if (!count) continue;

            const title = folderTitle(folder);
            nextTiles.push({
                id: folder.id,
                title,
                node: folder,
                count,
            });
            collectBookmarks(folder, [title], flat);
        }

        // 正常情况下不会出现散书签；如果出现，放进“未分类”，避免丢失
        if (looseBookmarks.length) {
            const node = {
                id: '__uncategorized__',
                title: '未分类',
                children: looseBookmarks,
                synthetic: true,
            };
            const count = countBookmarks(node);

            if (count) {
                nextTiles.push({
                    id: node.id,
                    title: node.title,
                    node,
                    count,
                });
                collectBookmarks(node, [node.title], flat);
            }
        }

        return { tiles: nextTiles, flat };
    }

    function buildFallbackData() {
        const children = (CONFIG.fallbackLinks || [])
            .filter((link) => link && isSafeUrl(link.url))
            .map((link, index) => ({
                id: `__fallback_${index}__`,
                title:
                    (link.title && link.title.trim()) ||
                    getHostname(link.url) ||
                    link.url,
                url: link.url,
            }));

        if (!children.length) {
            return { tiles: [], flat: [] };
        }

        const node = {
            id: '__fallback__',
            title: '备用链接',
            children,
            synthetic: true,
        };
        const flat = [];
        collectBookmarks(node, [node.title], flat);

        return {
            tiles: [
                {
                    id: node.id,
                    title: node.title,
                    node,
                    count: children.length,
                },
            ],
            flat,
        };
    }

    // -----------------------------------------------------
    // favicon
    // -----------------------------------------------------

    function createFallbackIcon(label) {
        const icon = document.createElement('span');
        const text = (label || '?').trim();

        icon.className = 'bookmark-fallback';
        icon.textContent = (text[0] || '?').toUpperCase();
        icon.style.setProperty('--avatar-color', colorFor(text || '?'));
        icon.setAttribute('aria-hidden', 'true');

        return icon;
    }

    function createBookmarkIcon(bookmark) {
        const hostname = getHostname(bookmark.url);
        const label = hostname || bookmark.title || '?';

        if (!hasBookmarksApi() || !chrome.runtime || !chrome.runtime.id) {
            return createFallbackIcon(label);
        }

        const image = document.createElement('img');
        image.className = 'bookmark-icon';
        image.width = 18;
        image.height = 18;
        image.alt = '';
        image.loading = 'lazy';
        image.decoding = 'async';
        image.referrerPolicy = 'no-referrer';

        try {
            image.src = chrome.runtime.getURL(
                `_favicon/?pageUrl=${encodeURIComponent(bookmark.url)}&size=${FAVICON_SIZE}`
            );
        } catch {
            return createFallbackIcon(label);
        }

        image.addEventListener(
            'error',
            () => {
                image.replaceWith(createFallbackIcon(label));
            },
            { once: true }
        );

        return image;
    }

    function createFolderDot(title) {
        const dot = document.createElement('span');
        dot.className = 'folder-dot';
        dot.style.setProperty('--dot-color', colorFor(title || 'folder'));
        dot.setAttribute('aria-hidden', 'true');
        return dot;
    }

    // -----------------------------------------------------
    // 收藏夹入口
    // -----------------------------------------------------

    function openBookmarksRoot() {
        folderReturnFocus = bookmarkLauncher;
        folderStack = [];

        if (!folderDialog.open) {
            folderDialog.showModal();
        }

        renderFolderDialog();
    }

    bookmarkLauncher.addEventListener('click', openBookmarksRoot);

    function closeFolderDialog() {
        if (folderDialog.open) {
            folderDialog.close();
        } else {
            folderStack = [];
        }
    }

    function navigateUp() {
        if (folderStack.length > 0) {
            const popped = folderStack.pop();
            renderFolderDialog({ focusFolderId: popped.id });
        } else {
            closeFolderDialog();
        }
    }

    function createFolderRow(node) {
        const title = folderTitle(node);
        const count = countBookmarks(node);

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'dialog-row folder-row';
        button.dataset.row = 'true';
        button.dataset.folderId = node.id;
        button.setAttribute('aria-label', `${title}，${count} 个书签`);

        const name = document.createElement('span');
        name.className = 'folder-name';
        name.textContent = title;

        const countElement = document.createElement('span');
        countElement.className = 'folder-count';
        countElement.textContent = String(count);

        const arrow = document.createElement('span');
        arrow.className = 'dialog-arrow';
        arrow.textContent = '›';
        arrow.setAttribute('aria-hidden', 'true');

        button.append(createFolderDot(title), name, countElement, arrow);
        button.addEventListener('click', () => {
            folderStack.push(node);
            renderFolderDialog();
        });

        return button;
    }

    function createBookmarkRow(bookmark) {
        if (!isSafeUrl(bookmark.url)) return null;

        const link = document.createElement('a');
        link.className = 'dialog-row bookmark-row';
        link.href = bookmark.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.dataset.row = 'true';
        link.dataset.bookmarkUrl = bookmark.url;

        const title =
            (bookmark.title && bookmark.title.trim()) ||
            getHostname(bookmark.url) ||
            bookmark.url;

        const text = document.createElement('span');
        text.className = 'bookmark-title';
        text.textContent = title;

        const rememberUsage = () => recordBookmarkUsage(bookmark.url);
        link.addEventListener('click', rememberUsage);
        link.addEventListener('auxclick', (event) => {
            if (event.button === 1) rememberUsage();
        });

        link.append(createBookmarkIcon(bookmark), text);
        return link;
    }

    function updateBreadcrumb() {
        folderBreadcrumbElement.replaceChildren();

        const root = document.createElement('button');
        root.type = 'button';
        root.className = 'crumb';
        root.textContent = '收藏夹栏';
        if (folderStack.length === 0) {
            root.setAttribute('aria-current', 'page');
        }
        root.addEventListener('click', () => {
            folderStack = [];
            renderFolderDialog();
        });
        folderBreadcrumbElement.append(root);

        folderStack.forEach((node, index) => {
            const separator = document.createElement('span');
            separator.className = 'crumb-sep';
            separator.textContent = '/';

            const crumb = document.createElement('button');
            crumb.type = 'button';
            crumb.className = 'crumb';
            crumb.textContent = folderTitle(node);
            if (index === folderStack.length - 1) {
                crumb.setAttribute('aria-current', 'page');
            }
            crumb.addEventListener('click', () => {
                folderStack = folderStack.slice(0, index + 1);
                renderFolderDialog();
            });

            folderBreadcrumbElement.append(separator, crumb);
        });
    }

    function renderFolderDialog({
        focusFolderId = null,
        focusBookmarkUrl = null,
    } = {}) {
        const isRoot = folderStack.length === 0;
        const current = isRoot ? null : folderStack[folderStack.length - 1];

        const currentTitle = isRoot ? '收藏夹栏' : folderTitle(current);
        const currentCount = isRoot
            ? tiles.reduce((sum, tile) => sum + tile.count, 0)
            : countBookmarks(current);

        folderDialogTitle.textContent = currentTitle;
        folderDialogCount.textContent = String(currentCount);
        folderDialogDot.hidden = isRoot;
        folderDialogDot.style.setProperty(
            '--dot-color',
            colorFor(currentTitle)
        );
        folderBackButton.hidden = isRoot;

        updateBreadcrumb();
        folderBreadcrumbElement.hidden = isRoot;

        const rows = [];

        if (isRoot) {
            for (const tile of tiles) {
                rows.push(createFolderRow(tile.node));
            }
        } else {
            for (const child of sortByIndex(current.children || [])) {
                if (child.url) {
                    const row = createBookmarkRow(child);
                    if (row) rows.push(row);
                } else if (
                    Array.isArray(child.children) &&
                    countBookmarks(child) > 0
                ) {
                    rows.push(createFolderRow(child));
                }
            }
        }

        folderBodyElement.replaceChildren();

        if (rows.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'dialog-empty';
            empty.textContent = isRoot
                ? '收藏夹栏是空的。'
                : '这个文件夹是空的。';
            folderBodyElement.append(empty);
        } else {
            const list = document.createElement('ul');
            list.className = 'dialog-list';

            for (const row of rows) {
                const item = document.createElement('li');
                item.append(row);
                list.append(item);
            }

            folderBodyElement.append(list);
        }

        if (!folderDialog.open) return;

        const folderTarget = focusFolderId
            ? folderBodyElement.querySelector(
                  `[data-folder-id="${CSS.escape(focusFolderId)}"]`
              )
            : null;
        const bookmarkTarget = focusBookmarkUrl
            ? [...folderBodyElement.querySelectorAll('.bookmark-row')].find(
                  (row) => row.dataset.bookmarkUrl === focusBookmarkUrl
              )
            : null;
        const focusTarget =
            folderTarget ||
            bookmarkTarget ||
            folderBodyElement.querySelector('.dialog-row') ||
            folderCloseButton;

        focusTarget.focus({ preventScroll: true });

        // 某些浏览器在 showModal() 后还会把焦点放回关闭按钮，
        // 这里补一次，确保打开文件夹后键盘直接落在第一行。
        window.setTimeout(() => {
            if (
                folderDialog.open &&
                (document.activeElement === folderCloseButton ||
                    document.activeElement === folderBackButton)
            ) {
                focusTarget.focus({ preventScroll: true });
            }
        }, 0);
    }

    folderBackButton.addEventListener('click', navigateUp);
    folderCloseButton.addEventListener('click', closeFolderDialog);

    folderSearchButton.addEventListener('click', () => {
        closeFolderDialog();
        openFinder();
        finderReturnFocus = bookmarkLauncher;
    });

    folderDialog.addEventListener('cancel', (event) => {
        event.preventDefault();
        navigateUp();
    });

    folderDialog.addEventListener('click', (event) => {
        if (event.target === folderDialog) {
            closeFolderDialog();
        }
    });

    folderDialog.addEventListener('keydown', (event) => {
        if (event.key === 'Backspace') {
            event.preventDefault();
            navigateUp();
            return;
        }

        if (!folderBodyElement.contains(document.activeElement)) return;

        const rows = [...folderBodyElement.querySelectorAll('.dialog-row')];
        if (!rows.length) return;

        const index = rows.indexOf(document.activeElement);

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            rows[(index + 1) % rows.length]?.focus();
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            rows[(index - 1 + rows.length) % rows.length]?.focus();
        } else if (event.key === 'Home') {
            event.preventDefault();
            rows[0]?.focus();
        } else if (event.key === 'End') {
            event.preventDefault();
            rows[rows.length - 1]?.focus();
        }
    });

    folderDialog.addEventListener('close', () => {
        folderStack = [];

        const target = folderReturnFocus;
        folderReturnFocus = null;

        // 等浏览器完成 dialog 的默认焦点恢复后，再把焦点放回入口
        window.setTimeout(() => {
            if (folderDialog.open || finderDialog.open) return;

            if (target && target.isConnected) {
                target.focus({ preventScroll: true });
            } else {
                searchInput.focus({ preventScroll: true });
            }
        }, 0);
    });

    // -----------------------------------------------------
    // 书签查找
    // -----------------------------------------------------

    function openFinder() {
        if (finderDialog.open || folderDialog.open) return;

        usage = loadUsage();
        finderReturnFocus = document.activeElement;
        finderDialog.showModal();
        finderInput.value = '';
        finderInput.setAttribute('aria-expanded', 'true');
        renderFinder('');
        finderInput.focus({ preventScroll: true });
    }

    function closeFinder() {
        if (finderDialog.open) {
            finderDialog.close();
        } else {
            finderItems = [];
            finderIndex = -1;
        }
    }

    function matchQuality(item, query) {
        const title = item.title.toLowerCase();

        if (title === query) return 4;
        if (title.startsWith(query)) return 3;
        if (title.includes(query)) return 2;
        if (item.pathText.toLowerCase().includes(query)) return 1;
        if (item.url.toLowerCase().includes(query)) return 1;
        return 0;
    }

    function compareCandidates(a, b) {
        if (b.quality !== a.quality) return b.quality - a.quality;
        if (b.count !== a.count) return b.count - a.count;
        if (b.lastUsed !== a.lastUsed) return b.lastUsed - a.lastUsed;
        return a.item.order - b.item.order;
    }

    // 维护一个固定大小的有序数组，只保留前 K 个候选
    function topK(items, k, compare) {
        const result = [];

        for (const item of items) {
            let low = 0;
            let high = result.length;

            while (low < high) {
                const middle = (low + high) >> 1;
                if (compare(item, result[middle]) < 0) {
                    high = middle;
                } else {
                    low = middle + 1;
                }
            }

            if (low < k) {
                result.splice(low, 0, item);
                if (result.length > k) result.pop();
            }
        }

        return result;
    }

    function keepFinderItemVisible(item) {
        const box = finderResultsElement;
        const boxRect = box.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();
        const padding = 6;

        if (itemRect.top < boxRect.top + padding) {
            box.scrollTop -= boxRect.top + padding - itemRect.top;
        } else if (itemRect.bottom > boxRect.bottom - padding) {
            box.scrollTop += itemRect.bottom - (boxRect.bottom - padding);
        }
    }

    function updateFinderSummary({ query, total, shown, hasUsage }) {
        if (total === 0) {
            finderSummaryElement.textContent = '';
            finderSummaryElement.hidden = true;
            return;
        }

        let text = query
            ? `共 ${total} 条匹配`
            : `${hasUsage ? '常用书签' : '书签'} · 共 ${total} 条`;

        if (total > shown) {
            text += `，显示前 ${shown} 条`;
        }

        finderSummaryElement.textContent = text;
        finderSummaryElement.hidden = false;
    }

    function renderFinder(query) {
        const normalized = query.trim().toLowerCase();

        const candidates = [];
        for (const item of flatBookmarks) {
            const quality = normalized ? matchQuality(item, normalized) : 0;
            if (normalized && quality === 0) continue;

            const record = usage[item.url];
            candidates.push({
                item,
                quality,
                count:
                    record && Number.isFinite(record.count)
                        ? record.count
                        : 0,
                lastUsed:
                    record && Number.isFinite(record.lastUsed)
                        ? record.lastUsed
                        : 0,
            });
        }

        const limit = Math.max(1, Number(CONFIG.finderLimit) || 12);
        const ranked = topK(candidates, limit, compareCandidates);
        const hasUsage = candidates.some((candidate) => candidate.count > 0);

        finderItems = ranked.map((entry) => entry.item);
        finderIndex = finderItems.length ? 0 : -1;

        updateFinderSummary({
            query: normalized,
            total: candidates.length,
            shown: finderItems.length,
            hasUsage,
        });

        const buttons = finderItems.map((item, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'finder-result';
            button.id = `bookmark-finder-result-${index}`;
            button.setAttribute('role', 'option');
            button.setAttribute('aria-selected', 'false');
            button.tabIndex = -1;
            button.append(createBookmarkIcon(item));

            const text = document.createElement('span');
            text.className = 'finder-result-text';

            const title = document.createElement('span');
            title.className = 'finder-result-title';
            title.textContent = item.title;

            const path = document.createElement('span');
            path.className = 'finder-result-path';
            path.textContent = item.pathText;

            text.append(title, path);
            button.append(text);
            button.addEventListener('click', () => openFinderResult(index));
            button.addEventListener('auxclick', (event) => {
                if (event.button !== 1) return;
                event.preventDefault();
                recordBookmarkUsage(item.url);
                window.open(item.url, '_blank', 'noopener,noreferrer');
                closeFinder();
            });

            return button;
        });

        finderResultsElement.replaceChildren(...buttons);
        finderResultsElement.hidden = finderItems.length === 0;
        finderEmptyElement.hidden = finderItems.length !== 0;
        finderResultsElement.scrollTop = 0;
        updateFinderSelection();
    }

    function updateFinderSelection() {
        const options = [
            ...finderResultsElement.querySelectorAll('.finder-result'),
        ];

        if (!options.length) {
            finderInput.removeAttribute('aria-activedescendant');
            return;
        }

        finderIndex = Math.max(0, Math.min(finderIndex, options.length - 1));

        options.forEach((option, index) => {
            const active = index === finderIndex;
            option.classList.toggle('is-active', active);
            option.setAttribute('aria-selected', String(active));
        });

        const active = options[finderIndex];
        finderInput.setAttribute('aria-activedescendant', active.id);
        keepFinderItemVisible(active);
    }

    function openFinderResult(index) {
        const item = finderItems[index];
        if (!item) return;

        recordBookmarkUsage(item.url);
        window.open(item.url, '_blank', 'noopener,noreferrer');
        closeFinder();
    }

    finderInput.addEventListener('input', () => {
        renderFinder(finderInput.value);
    });

    finderInput.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (!finderItems.length) return;
            finderIndex = (finderIndex + 1) % finderItems.length;
            updateFinderSelection();
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (!finderItems.length) return;
            finderIndex =
                (finderIndex - 1 + finderItems.length) % finderItems.length;
            updateFinderSelection();
        } else if (event.key === 'Home') {
            event.preventDefault();
            if (!finderItems.length) return;
            finderIndex = 0;
            updateFinderSelection();
        } else if (event.key === 'End') {
            event.preventDefault();
            if (!finderItems.length) return;
            finderIndex = finderItems.length - 1;
            updateFinderSelection();
        } else if (event.key === 'Enter') {
            event.preventDefault();
            openFinderResult(finderIndex);
        } else if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            closeFinder();
        }
    });

    finderCloseButton.addEventListener('click', closeFinder);

    finderDialog.addEventListener('cancel', (event) => {
        event.preventDefault();
        closeFinder();
    });

    finderDialog.addEventListener('click', (event) => {
        if (event.target === finderDialog) {
            closeFinder();
        }
    });

    finderDialog.addEventListener('close', () => {
        finderInput.setAttribute('aria-expanded', 'false');
        finderInput.value = '';
        finderItems = [];
        finderIndex = -1;

        const target = finderReturnFocus;
        finderReturnFocus = null;

        if (
            target &&
            target.isConnected &&
            target !== document.body &&
            typeof target.focus === 'function'
        ) {
            target.focus({ preventScroll: true });
        } else {
            searchInput.focus({ preventScroll: true });
        }
    });

    document.addEventListener('open-bookmark-finder', openFinder);

    // -----------------------------------------------------
    // 刷新与自动同步
    // -----------------------------------------------------

    function showStatus(message) {
        statusElement.textContent = message;
        statusElement.hidden = false;
    }

    function hideStatus() {
        statusElement.textContent = '';
        statusElement.hidden = true;
    }

    function indexFolderNodes(nodes, map) {
        for (const node of nodes) {
            if (!node || node.url) continue;

            map.set(node.id, node);

            if (Array.isArray(node.children)) {
                indexFolderNodes(node.children, map);
            }
        }
    }

    // 收藏夹变化时，尽量留在原来的文件夹和原来的那一行
    function refreshFolderDialog() {
        if (!folderDialog.open) return;

        const active = document.activeElement;
        const focusFolderId = active?.classList?.contains('folder-row')
            ? active.dataset.folderId
            : null;
        const focusBookmarkUrl = active?.classList?.contains('bookmark-row')
            ? active.dataset.bookmarkUrl
            : null;

        const folderMap = new Map();
        indexFolderNodes(
            tiles.map((tile) => tile.node),
            folderMap
        );

        const nextStack = [];
        for (const node of folderStack) {
            const fresh = folderMap.get(node.id);
            if (!fresh) break;
            nextStack.push(fresh);
        }
        folderStack = nextStack;

        renderFolderDialog({ focusFolderId, focusBookmarkUrl });
    }

    async function refreshBookmarks() {
        if (!hasBookmarksApi()) {
            const data = buildFallbackData();
            tiles = data.tiles;
            flatBookmarks = data.flat;
            refreshFolderDialog();
            showStatus(
                '请通过 Edge 扩展加载此页面，才能读取收藏夹栏。当前显示备用链接。'
            );
            return;
        }

        try {
            const tree = await getBookmarksTree();
            const bars = findBookmarksBars(tree);

            if (bars.length === 0) {
                tiles = [];
                flatBookmarks = [];
                refreshFolderDialog();
                hideStatus();
                return;
            }

            const children = mergeBarChildren(bars);

            if (children.length === 0) {
                tiles = [];
                flatBookmarks = [];
                refreshFolderDialog();
                hideStatus();
                return;
            }

            const data = buildData(children);
            tiles = data.tiles;
            flatBookmarks = data.flat;
            refreshFolderDialog();
            hideStatus();

            if (finderDialog.open) {
                renderFinder(finderInput.value);
            }
        } catch (error) {
            console.error('读取收藏夹失败：', error);

            const data = buildFallbackData();
            tiles = data.tiles;
            flatBookmarks = data.flat;
            refreshFolderDialog();
            showStatus(
                '读取收藏夹失败。请在 edge://extensions 中允许“读取和更改你的收藏夹”，然后刷新页面。当前显示备用链接。'
            );

            if (finderDialog.open) {
                renderFinder(finderInput.value);
            }
        }
    }

    function scheduleRefresh() {
        window.clearTimeout(refreshTimer);
        refreshTimer = window.setTimeout(refreshBookmarks, 150);
    }

    if (hasBookmarksApi()) {
        for (const eventName of BOOKMARK_EVENTS) {
            const event = chrome.bookmarks[eventName];
            if (event && typeof event.addListener === 'function') {
                event.addListener(scheduleRefresh);
            }
        }
    }

    refreshBookmarks();
})();
