/**
 * Defines categories of HTML elements for content enhancement.
 */
export const selectorMap = {
  bodyText: ['p', 'span', 'div:not([role])', '[class*="text"]', 'strong'],
  headings: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  links: ['a']
}

/**
 * Generates the most unique selector for an element.
 * Prioritizes ID, then class, then tag name.
 */
export function getBestSelector(element) {
  if (element.id) {
    return `#${element.id}`
  }
  if (element.className) {
    return `.${element.className}`
  }
  return element.tagName.toLowerCase()
}

/**
 * Highlights an element based on its type: 'selected', 'excluded', or 'hover'
 * Types: 'selected'- green, 'hover-add'- blue, 'hover-remove'- red
 */
export function highlightElement(element, type) {
  element.classList.remove('enhancer-selected', 'enhancer-hover-add', 'enhancer-hover-remove')
  if (type) element.classList.add(`enhancer-${type}`)
}


/**
 * Returns all elements matching a semantic category.
 * Filters out elements without visible text.
 */
export function getElementsByCategories(category) {
  const tags = selectorMap[category] || []
  return Array.from(document.querySelectorAll(tags.join(',')))
  .filter(element => element.innerText.trim().length > 0)
}

/**
 * Applies a function to all elements matching a selector
 */
export function applyToMatches(selector, func) {
  document.querySelectorAll(selector).forEach(func)
}