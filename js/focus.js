// 新标签页中转页
// Chromium 新标签页默认把焦点给地址栏。
// 先加载这个页面，再立即跳到真正的主页，主页的搜索框更容易拿到焦点。
location.replace('index.html');
