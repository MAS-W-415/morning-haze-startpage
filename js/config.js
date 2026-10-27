// =========================================================
// 这里是你平时最常改的配置
// =========================================================

const CONFIG = {
    // 默认搜索引擎：'bing' 或 'google'
    defaultEngine: 'bing',

    // 书签查找最多显示多少条
    finderLimit: 12,

    // 搜索引擎列表
    // 以后加引擎：复制一项，改 id / name / icon / url / param
    engines: [
        {
            id: 'bing',
            name: 'Bing',
            icon: 'assets/icons/bing.svg',
            url: 'https://www.bing.com/search',
            param: 'q',
        },
        {
            id: 'google',
            name: 'Google',
            icon: 'assets/icons/google.svg',
            url: 'https://www.google.com/search',
            param: 'q',
        },
    ],

    // 文件夹标题旁边的小圆点颜色
    folderColors: [
        '#5f8fc9',
        '#d87f92',
        '#57a87a',
        '#c9932f',
        '#8b74c9',
        '#4f9fb8',
    ],

    // 只有在“不是扩展环境”或“没有收藏夹权限”时才会显示
    // 正常扩展模式下只显示 Edge 收藏夹栏
    fallbackLinks: [
        { title: 'GitHub', url: 'https://github.com' },
        { title: 'Bilibili', url: 'https://www.bilibili.com' },
        { title: 'YouTube', url: 'https://www.youtube.com' },
    ],
};
