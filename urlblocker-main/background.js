// 在扩展程序安装时读取文件内容并存储
chrome.runtime.onInstalled.addListener(() => {
  fetch('urls/phishing-filter-domains.txt')
    .then(response => response.text())
    .then(text => {
      const data = text.split('\n')
        .filter(line => line && !line.startsWith('!') && !line.startsWith('['))
        .map(url => url.trim());
      chrome.storage.local.set({ phishingUrls: data });

      // 安装后立即更新 URL 列表
      fetchURLList();
    })
    .catch(err => console.error('Error reading phishing URL file:', err));
});

// 从 storage 中读取内容并创建规则
async function fetchURLList() {
  try {
    const { phishingUrls } = await chrome.storage.local.get('phishingUrls');
    if (!phishingUrls) {
      console.error('No phishing URLs found in storage');
      return;
    }

    // 正常化数据
    const normalizedData = phishingUrls.map(url => {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `*://${url}/*`;
      }
      return url;
    });

    // 添加重定向规则来阻止对 bing.com 的访问
    const additionalRules = [
      {
        id: normalizedData.length + 1, // 唯一 ID
        priority: 1,
        action: { type: 'redirect', redirect: { extensionPath: '/blocked.html' } },
        condition: {
          urlFilter: '*://*.bing.com/*',
          resourceTypes: ["main_frame"]
        }
      }
    ];

    // 生成规则
    const rules = normalizedData.map((url, index) => ({
      id: index + 1,
      priority: 1,
      action: { type: 'redirect', redirect: { extensionPath: '/blocked.html' } },
      condition: {
        urlFilter: url,
        resourceTypes: ["main_frame"]
      }
    }));

    // 合并额外规则
    const allRules = [...rules, ...additionalRules];

    console.log("Generated rules:", allRules);

    // 更新动态规则
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: allRules.map(rule => rule.id),
      addRules: allRules
    });

    chrome.storage.local.set({ isActive: true });
  } catch (error) {
    console.error('Failed to fetch URL list:', error);
  }
}

// 处理存储变化
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.isActive !== undefined) {
    const isActive = changes.isActive.newValue;
    if (!isActive) {
      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] // 移除所有现有规则
      });
    } else {
      fetchURLList(); // 重新创建规则
    }
  }
});
