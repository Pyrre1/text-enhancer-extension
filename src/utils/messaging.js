export const sendMessage = async (action, payload = {}) => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    
    if (!tab?.id) {
      console.error('No active tab found')
      return
    }

    // Send message to content script
    await chrome.tabs.sendMessage(tab.id, { action, ...payload })
    console.log(`Message sent: ${action}`, payload)
  } catch (error) {
    console.error('Error sending message to content script:', error)
    
    // If content script isn't loaded, try to inject it
    if (error.message?.includes('Could not establish connection')) {
      console.error('Content script is not loaded, attempting to inject...')
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        })
        
        // Retry sending the message after injection
        setTimeout(async () => {
          await chrome.tabs.sendMessage(tab.id, { action, ...payload })
        }, 300)
      } catch (injectError) {
        console.error('Error injecting content script:', injectError)
      }
    }
  }
}