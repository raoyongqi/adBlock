document.getElementById("toggle").addEventListener("click", function () {
  chrome.storage.sync.get("blocking", function (data) {
    const newValue = !data.blocking;
    chrome.storage.sync.set({ blocking: newValue }, function () {
      document.getElementById("status").textContent = newValue ? "On" : "Off";
      chrome.runtime.sendMessage({ action: "toggleBlocking", value: newValue });
    });
  });
});

chrome.storage.sync.get("blocking", function (data) {
  document.getElementById("status").textContent = data.blocking ? "On" : "Off";
});
