import {
  getBestSelector,
  highlightElement,
  getElementsByCategories,
  applyToMatches
} from '../utils/helpers.js'
import { createTextEnhancer } from 'text-enhancer'

console.log('Text Enhancer content script loaded')
// Initialize the Text Enhancer with default settings
const enhancer = createTextEnhancer({
  selectors: [],
  step: 2,
  minSize: 8,
  maxSize: 40,
  root: document
})

// Sets to track selected elements for highlighting.
const selectedElements = new Set()
// Set to track element identifiers for enhancement.
const elementsToEnhance = new Set()

const styles = document.createElement('style')
styles.textContent = `
  .enhancer-selected {
    outline: 2px solid green;
    background-color: #cdffcdff;
  }
  .enhancer-hover-add {
    outline: 2px solid blue;
    background-color: #cdcdff;
  }
  .enhancer-hover-remove {
    outline: 2px solid red;
    background-color: #ffcdcdff;
  }
`
document.head.appendChild(styles)

let lastEnhancerSelectors = []
/**
 * Syncs the current set of selectors with the enhancer model if there are changes.
 * If no changes, does nothing.
 */
function syncEnhancerSelectors() {
  const currentSelectors = Array.from(elementsToEnhance)
  const hasChanged = 
  currentSelectors.length !== lastEnhancerSelectors.length ||
  currentSelectors.some((selector, i) => selector !== lastEnhancerSelectors[i])

  if (hasChanged) {
    enhancer.updateTarget(currentSelectors)
    lastEnhancerSelectors = currentSelectors
  }
}

/** 
 * Safely removes a selector from the enhancer and resets its styles.
 * Prevents situations where removed selectors remain enhanced 
 * without possibility of restoration.
 */
function safelyRemoveSelector(selector) {
  enhancer.updateTarget([selector])
  enhancer.restoreTextSize()
  enhancer.restoreFontFamily()
  enhancer.restoreColors()
  elementsToEnhance.delete(selector)
  syncEnhancerSelectors()
}


// Listens for messages from the extension's background or popup scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    // Adds all elements of a category to selections
    case 'addCategory': {
      const elements = getElementsByCategories(request.category)
      elements.forEach(element => {
        selectedElements.add(element)
        elementsToEnhance.add(element.tagName.toLowerCase())
        highlightElement(element, 'selected')
        console.log('Added element:', element)
      })
      break
    }
    // Adds one specific element to selections
    case 'addOneExtra': {
      const element = document.querySelector(request.selector)
      if (!element) {
        return
      }
      const selector = getBestSelector(element)
      elementsToEnhance.add(selector)
      applyToMatches(selector, (match) => {
        selectedElements.add(match)
        highlightElement(match, 'selected')
        console.log('Added:', getBestSelector(element), element)

      })
      break
    }
    // Adds all similar elements to selections
    case 'addSimilar': {
      const element = document.querySelector(request.selector)
      if (!element) {
        return
      }
      const tag = element.tagName.toLowerCase()
      elementsToEnhance.add(tag)
      applyToMatches(tag, (match) => {
        selectedElements.add(match)
        highlightElement(match, 'selected')
      })
      break
    }

    // Handles removing one specific element from selections
    case 'removeElement': {
      const element = document.querySelector(request.selector)
      if (!element) {
        return
      }
      const selector = getBestSelector(element)
      safelyRemoveSelector(selector)
      applyToMatches(selector, (match) => {
        selectedElements.delete(match)
        highlightElement(match, null)
      })
      break
    }

    // Removes all similar elements from selections
    case 'removeSimilar': {
      const element = document.querySelector(request.selector)
      if (!element) {
        return
      }
      const tag = element.tagName.toLowerCase()
      safelyRemoveSelector(tag)
      applyToMatches(tag, (match) => {
        selectedElements.delete(match)
        highlightElement(match, null)
      })
      break
    }

    // Removes all elements of a category from selections
    case 'removeCategory': {
      const elements = getElementsByCategory(request.category)
      const tagsToRemove = new Set()
      elements.forEach(element => {
        selectedElements.delete(element)
        tagsToRemove.add(element.tagName.toLowerCase())
        highlightElement(element, null)
      })
      tagsToRemove.forEach(tag => safelyRemoveSelector(tag))
      break
    }

    // Handles visualization of target element on hover
    case 'hoverPreview': {
      const element = document.querySelector(request.selector)
      if (!element) {
        return
      }
      const selector = request.similar ? element.tagName.toLowerCase() : getBestSelector(element)
      applyToMatches(selector, (match) => {
        if (request.mode === 'add' && !selectedElements.has(match)) {
          highlightElement(match, 'hover-add')
        }
        if (request.mode === 'remove' && selectedElements.has(match)) {
          highlightElement(match, 'hover-remove')
        }
      })
      break
    }

    // Clears hover highlights
    case 'clearHover': {
      document.querySelectorAll('.enhancer-hover-add, .enhancer-hover-remove').forEach(element =>
        element.classList.remove('enhancer-hover-add', 'enhancer-hover-remove'))
      break
    }

    // Exits selection mode and clears all highlights
    case 'exitSelectionMode': {
      applyToMatches('.enhancer-selected, .enhancer-hover-add, .enhancer-hover-remove', elements =>
        element.classList.remove('enhancer-selected', 'enhancer-hover-add', 'enhancer-hover-remove'))
        .forEach(element => element.classList.remove('enhancer-selected', 'enhancer-hover-add', 'enhancer-hover-remove'))
      selectedElements.clear()
      elementsToEnhance.clear()
      break
    }

    // Applies selected enhancements to selected elements
    // Text size adjustments:
    case 'setTextToMin': {
      syncEnhancerSelectors()
      enhancer.setTextToMin()
      break
    }
    case 'decreaseTextSize': {
      syncEnhancerSelectors()
      enhancer.decreaseTextSize()
      break
    }
    case 'increaseTextSize': {
      syncEnhancerSelectors()
      enhancer.increaseTextSize()
      break
    }
    case 'setTextToMax': {
      syncEnhancerSelectors()
      enhancer.setTextToMax()
      break
    }
    case 'restoreTextSize': {
      syncEnhancerSelectors()
      enhancer.restoreTextSize()
      break
    }
    // Font family adjustments:
    case 'cycleFont': {
      syncEnhancerSelectors()
      enhancer.cycleFontFamily()
      break
    }
    case 'restoreFontFamily': {
      syncEnhancerSelectors()
      enhancer.restoreFontFamily()
      break
    }
    // Color theme adjustments:
    case 'setColorScheme': {
      syncEnhancerSelectors()
      enhancer.applyColorTheme(request.themeName)
      break
    }
    case 'changeTextColor': {
      syncEnhancerSelectors()
      enhancer.changeTextColor(request.color)
      break
    }
    case 'changeBackgroundColor': {
      syncEnhancerSelectors()
      enhancer.changeBackgroundColor(request.color)
      break
    }
    case 'restoreColors': {
      syncEnhancerSelectors()
      enhancer.restoreColors()
      break
    }
    // Resets all enhancements on selected elements
    case 'resetAll': {
      syncEnhancerSelectors()
      enhancer.restoreTextSize()
      enhancer.restoreFontFamily()
      enhancer.restoreColors()
      applyToMatches('.enhancer-selected', elements =>
        highlightElement(elements, 'selected'))
      break
    }
  }
})