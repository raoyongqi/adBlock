let blocking = true;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleBlocking") {
    blocking = message.value;
  }
});

function updateAdBlocking() {
  if (blocking) {
    const url = chrome.runtime.getURL("ad_blocking_rules.json");
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        chrome.declarativeNetRequest.updateDynamicRules({
          addRules: data,
          removeRuleIds: [],
        });
      })
      .catch((err) => console.error("Error loading ad blocking rules", err));
  } else {
    chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [],
      removeRuleIds: [],
    });
  }
}
