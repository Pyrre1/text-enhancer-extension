export const sendMessage = (action, payload = {}) => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { action, ...payload })
    }
  })
}