
/**
 * Defines categories of HTML elements for content enhancement.
 */
const enhancerCategories = {
  "brödtext": ['p', 'div', 'span'],
  "rubriker": ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  "länkar": ['a']
}

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

// Generates the most unique possible selector for an element
function getBestSelector(element) {
  if (element.id) {
    return `#${element.id}`
  }
  if (element.className) {
    return `.${element.className}`
  }
  return element.tagName.toLowerCase()
}

// Highlights an element based on its type: 'selected', 'excluded', or 'hover'
function highlightElement(element, type) {
  element.classList.remove('enhancer-selected', 'enhancer-hover-add', 'enhancer-hover-remove')
  if (type) element.classList.add(`enhancer-${type}`)
}

// Gets elements by category and filters out those without visible text
function getElementsByCategories(category) {
  const tags = enhancerCategories[category] || []
  return Array.from(document.querySelectorAll(tags.join(',')))
  .filter(element => element.innerText.trim().length > 0)
}

// Listens for messages from the extension's background or popup scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'addCategory') {
    const elements = getElementsByCategories(request.category)
    elements.forEach(element => {
      selectedElements.add(element)
      elementsToEnhance.add(element.tagName.toLowerCase())
      highlightElement(element, 'selected')
    })
  }

  // Adds a specific element to selections
  if (request.action === 'addOneExtra') {
    const element = document.querySelector(request.selector)
    if (!element) {
      return
    }
    const selector = getBestSelector(element)
    elementsToEnhance.add(selector)

    const matches = document.querySelectorAll(selector)
    matches.forEach(match => {
      selectedElements.add(match)
      highlightElement(match, 'selected')
    })
  }

  // Adds all similar elements to selections
  if (request.action === 'addSimilar') {
    const element = document.querySelector(request.selector)
    if (!element) {
      return
    }

    const tag = element.tagName.toLowerCase()
    elementsToEnhance.add(tag)

    const matches = document.querySelectorAll(tag)
    matches.forEach(match => {
      selectedElements.add(match)
      highlightElement(match, 'selected')
    })
  }

  // Handles removing one specific element from selections
  if (request.action === 'removeElement') {
    const element = document.querySelector(request.selector)
    if (!element) {
      return
    }

    const selector = getBestSelector(element)
    elementsToEnhance.delete(selector)

    const matches = document.querySelectorAll(selector)
    matches.forEach(match => {
      selectedElements.delete(match)
      highlightElement(match, null)
    })
  }

  // Removes all similar elements from selections
  if (request.action === 'removeSimilar') {
    const element = document.querySelector(request.selector)
    if (!element) {
      return
    }

    const tag = element.tagName.toLowerCase()
    elementsToEnhance.delete(tag)

    const matches = document.querySelectorAll(tag)
    matches.forEach(match => {
      selectedElements.delete(match)
      highlightElement(match, null)
    })
  }

  // Removes all elements of a category from selections
  if (request.action === 'removeCategory') {
    const elements = getElementsByCategory(request.category)
    elements.forEach(element => {
      selectedElements.delete(element)
      elementsToEnhance.delete(element.tagName.toLowerCase())
      highlightElement(element, null)
    })
  }

  // Handles visualization of target element on hover
  if (request.action === 'hoverPreview') {
    const element = document.querySelector(request.selector)
    if (!element) {
      return
    }

    const selector = request.similar ? element.tagName.toLowerCase() : getBestSelector(element)
    const matches = document.querySelectorAll(selector)

    matches.forEach(match => {
      if (request.mode === 'add' && !selectedElements.has(match)) {
        highlightElement(match, 'hover-add')
      }
      if (request.mode === 'remove' && selectedElements.has(match)) {
        highlightElement(match, 'hover-remove')
      }
    })
  }

  // Clears hover highlights
  if (request.action === 'clearHover') {
    document.querySelectorAll('.enhancer-hover-add, .enhancer-hover-remove').forEach(element => 
      element.classList.remove('enhancer-hover-add', 'enhancer-hover-remove'))
  }

  // Exits selection mode and clears all highlights
  if (request.action === 'exitSelectionMode') {
    document.querySelectorAll('.enhancer-selected, .enhancer-hover-add, .enhancer-hover-remove')
    .forEach(element => element.classList.remove('enhancer-selected', 'enhancer-hover-add', 'enhancer-hover-remove'))
    selectedElements.clear()
    elementsToEnhance.clear()
  }

  if (request.action === 'applyEnhancements') {
    const selectorList = Array.from(elementsToEnhance)
    if (typeof increaseTextSize === 'function') {
      increaseTextSize(selectorList)
      decreaseTextSize(selectorList)
      setToMax(selectorList)
      changeBackgroundColor(selectorList, request.color)
    }
  }
})
