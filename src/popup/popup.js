import { sendMessage } from '../utils/messaging.js'

// Toggle selectors for body text, headings, and/or links
const toggleSelector = (btnId, selector) => {
  const button = document.getElementById(btnId)
  button.addEventListener('click', () => {
    button.classList.toggle('active')
    sendMessage('toggleSelector', { selector })
  })
}

toggleSelector('toggle-body', 'bodyText')
toggleSelector('toggle-headings', 'headings')
toggleSelector('toggle-links', 'links')

// Text size adjustment
document.getElementById('min').addEventListener('click', () => {
  sendMessage('setTextToMin')
})
document.getElementById('decrease').addEventListener('click', () => {
  sendMessage('decreaseTextSize')
})
document.getElementById('increase').addEventListener('click', () => {
  sendMessage('increaseTextSize')
})
document.getElementById('max').addEventListener('click', () => {
  sendMessage('setTextToMax')
})
document.getElementById('restoreSize').addEventListener('click', () => {
  sendMessage('restoreTextSize')
})

// Font family adjustment
document.getElementById('cycleFont').addEventListener('click', () => {
  sendMessage('cycleFont')
})
document.getElementById('restoreFont').addEventListener('click', () => {
  sendMessage('restoreFontFamily')
})

// Color scheme adjustment
document.getElementById('theme-light').addEventListener('click', () => {
  sendMessage('setColorScheme', { themeName: 'light' })
})
document.getElementById('theme-dark').addEventListener('click', () => {
  sendMessage('setColorScheme', { themeName: 'dark' })
})
document.getElementById('theme-contrast').addEventListener('click', () => {
  sendMessage('setColorScheme', { themeName: 'contrast' })
})
// More granular color adjustments
let textColorTimeout, backgroundColorTimeout
document.getElementById('textColor').addEventListener('input', (e) => {
  clearTimeout(textColorTimeout)
  textColorTimeout = setTimeout(() => {
    sendMessage('changeTextColor', { color: e.target.value })
  }, 500)
})
document.getElementById('backgroundColor').addEventListener('input', (e) => {
  clearTimeout(backgroundColorTimeout)
  backgroundColorTimeout = setTimeout(() => {
    sendMessage('changeBackgroundColor', { color: e.target.value })
  }, 500)
})
document.getElementById('restoreColors').addEventListener('click', () => {
  sendMessage('restoreColors')
})

// Reset all enhancements
document.getElementById('resetAll').addEventListener('click', () => {
  sendMessage('resetTextSize')
  sendMessage('restoreFontFamily')
  sendMessage('restoreColors')
})