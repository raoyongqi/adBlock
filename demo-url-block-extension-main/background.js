// 函数辅助获取所有现有的动态规则ID
async function getAllRuleIds() {
  const rules = await chrome.declarativeNetRequest.getDynamicRules();
  return rules.map(rule => rule.id);
}

function extractDomainFromRule(urlPattern) {
  const regex = /\|\|([^/]+)\//;
  const match = urlPattern.match(regex);
  return match ? match[1] : urlPattern;
}

async function block(urls) {
  try {
      const rules = urls.map((url, index) => ({
          id: index + 1, // 每个规则的唯一标识符
          priority: 1,
          action: {
              type: 'redirect', // 动作类型：重定向
              redirect: {
                  extensionPath: '/403.html?url=' + extractDomainFromRule(url) // 本地重定向页面的路径
              }
          },
          condition: {
              urlFilter: url, // 每个要阻止/重定向的URL
              resourceTypes: ["main_frame", "sub_frame"]
          }
      }));

      // 移除任何具有相同ID的现有规则并添加新规则
      await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: (await getAllRuleIds()), // 移除所有以前的规则
          addRules: rules // 添加新规则
      });

      console.log('阻止规则成功应用。');
  } catch (error) {
      console.error('应用阻止规则时出错：', error);
  }
}

// 要阻止的URL列表
const staticUrls = [
  '||bing.com/' // 仅阻止 bing.com
];

// 调用函数以阻止域
block(staticUrls);

// 设置每分钟触发一次的警报（1分钟 = 60,000毫秒）
chrome.alarms.create('updateUrlsBlockedForUser', { periodInMinutes: 1 });

// 当警报触发时的监听器
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'updateUrlsBlockedForUser') {
      // 如果不需要定期更新，可以移除此部分
      // updateUrlsBlockedForUser();
  }
});
