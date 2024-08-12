chrome.runtime.onStartup.addListener(() => {
  console.log("!!!");
});

const naver = "https://www.naver.com";

function runInterval() {
  const INTERVAL_TIME = 3_000;

  window.refreshIntervalId = setInterval(() => {
    window.location.reload();
  }, INTERVAL_TIME);
}
function removeInterval() {
  clearInterval(window.refreshIntervalId);
}

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url.startsWith(naver)) {
    // Retrieve the action badge to check if the extension is 'ON' or 'OFF'
    const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
    // Next state will always be the opposite
    const nextState = prevState === "ON" ? "OFF" : "ON";

    // Set the action badge to the next state
    await chrome.action.setBadgeText({
      tabId: tab.id,
      text: nextState,
    });

    if (nextState === "ON") {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: runInterval,
      });
    } else {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: removeInterval,
      });
    }
  }
});
