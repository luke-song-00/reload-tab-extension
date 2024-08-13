const naver = "https://www.naver.com";

function runInterval(intervalTime) {
  const INTERVAL_TIME = 3_000;

  window.refreshIntervalId = setInterval(() => {
    window.location.reload();
  }, intervalTime || INTERVAL_TIME);
}
function removeInterval() {
  clearInterval(window.refreshIntervalId);
}

const STORAGE_KEY = "REFRESH_EXT_STATE";

function executeScriptByState(state, tab) {
  if (state === "ON") {
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

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!tab.url.startsWith(naver)) return;

  if (changeInfo.status == "complete") {
    // do your things
    const storage = await chrome.storage.session.get();
    const prevState = storage[STORAGE_KEY] || "OFF";

    await chrome.action.setBadgeText({
      tabId: tab.id,
      text: prevState,
    });

    executeScriptByState(prevState, tab);
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url.startsWith(naver)) {
    // Retrieve the action badge to check if the extension is 'ON' or 'OFF'
    const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
    // Next state will always be the opposite
    const nextState = prevState === "ON" ? "OFF" : "ON";
    // set sessionStorage.
    await chrome.storage.session.set({ [STORAGE_KEY]: nextState });

    // Set the action badge to the next state
    await chrome.action.setBadgeText({
      tabId: tab.id,
      text: nextState,
    });

    executeScriptByState(nextState, tab);
  }
});
