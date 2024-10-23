function updateAdBlocking() {
  const adBlockingRules = [
    {
      "id": 1,
      "priority": 1, // High priority
      "action": {
        "type": "redirect",
        "redirect": {
          "regexSubstitution": chrome.runtime.getURL("local_file.html") // Replace with your actual HTML file
        }
      },
      "condition": {
        "urlFilter": "*://*.bing.com/*"
      }
    },
    {
      "id": 2,
      "priority": 2,
      "action": {
        "type": "block"
      },
      "condition": {
        "urlFilter": "*://*.adserver.com/*"
      }
    },
    {
      "id": 3,
      "priority": 3,
      "action": {
        "type": "block"
      },
      "condition": {
        "urlFilter": "*://*.doubleclick.net/*"
      }
    }
  ];

  if (blocking) {
    // Use the ad blocking rules directly
    chrome.declarativeNetRequest.updateDynamicRules({
      addRules: adBlockingRules,
      removeRuleIds: [],
    });
  } else {
    chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [],
      removeRuleIds: [],
    });
  }
}
