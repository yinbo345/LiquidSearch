// background.js — 监听扩展安装/更新事件

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // 1. 打开欢迎页面
    chrome.tabs.create({
      url: chrome.runtime.getURL('welcome.html')
    });

    // 2. 发送 Chrome 系统通知
    chrome.notifications.create('ls-install-tip', {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icon_128.png'),
      title: 'LiquidSearch 液态搜索增强',
      message: '推荐使用 Microsoft Bing 搜索引擎，液态玻璃效果最佳。其他引擎可能会有显示问题。',
      priority: 1,
      buttons: [
        { title: '去 Bing 看看' }
      ],
      requireInteraction: true,
    }, (notificationId) => {
      if (chrome.runtime.lastError) {
        console.warn('[LS] 通知创建失败:', chrome.runtime.lastError.message);
      }
    });
  }
});

// 通知按钮点击：打开 Bing
chrome.notifications.onButtonClicked.addListener((notifId, btnIdx) => {
  if (notifId === 'ls-install-tip' && btnIdx === 0) {
    chrome.tabs.create({ url: 'https://www.bing.com/' });
    chrome.notifications.clear(notifId);
  }
});

// 点击通知正文也打开 Bing
chrome.notifications.onClicked.addListener((notifId) => {
  if (notifId === 'ls-install-tip') {
    chrome.tabs.create({ url: 'https://www.bing.com/' });
    chrome.notifications.clear(notifId);
  }
});

// 接收来自 welcome.html 的消息，打开新标签页 / 关闭欢迎页
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'openTab' && msg.url) {
    chrome.tabs.create({ url: msg.url });
  }
  if (msg.action === 'closeTab' && sender.tab && sender.tab.id) {
    chrome.tabs.remove(sender.tab.id);
  }
});
