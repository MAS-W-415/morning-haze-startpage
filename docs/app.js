// =========================================================
// 安装页的链接都在这里生成
// =========================================================

(() => {
    'use strict';

    const config = window.START_PAGE_CONFIG || {};
    const owner = String(config.githubOwner || '').trim();
    const repo = String(config.githubRepo || '').trim();
    const storeUrl = String(config.storeUrl || '').trim();
    const configured = Boolean(
        owner && repo && !owner.includes('YOUR_') && !repo.includes('YOUR_')
    );

    const repoUrl = configured
        ? `https://github.com/${owner}/${repo}`
        : 'https://github.com';
    const downloadUrl = configured
        ? `${repoUrl}/releases/latest/download/morning-haze-startpage.zip`
        : '#install';

    function setHref(selector, href) {
        for (const link of document.querySelectorAll(selector)) {
            link.href = href;
        }
    }

    setHref('.js-repo-link', repoUrl);
    setHref('.js-issues-link', `${repoUrl}/issues`);
    setHref('.js-license-link', `${repoUrl}/blob/main/LICENSE`);
    setHref(
        '.js-notices-link',
        `${repoUrl}/blob/main/THIRD_PARTY_NOTICES.md`
    );
    setHref('.js-download-link', downloadUrl);

    for (const element of document.querySelectorAll('.js-store-link')) {
        if (storeUrl) {
            element.href = storeUrl;
            element.hidden = false;
        } else {
            element.hidden = true;
        }
    }

    for (const element of document.querySelectorAll('.js-store-pending')) {
        element.hidden = Boolean(storeUrl);
    }

    for (const element of document.querySelectorAll('.js-store-ready')) {
        element.hidden = !storeUrl;
    }

    if (!configured) {
        console.warn(
            '还没有填写 docs/config.js 里的 GitHub 用户名和仓库名，下载链接暂时不可用。'
        );
    }
})();
