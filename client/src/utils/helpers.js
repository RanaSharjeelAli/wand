/**
 * Utility function to format dates consistently
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Generate unique ID for messages/items
 * @returns {string} Unique ID
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Scroll to element smoothly
 * @param {React.RefObject} ref - Reference to element
 */
export const scrollToElement = (ref) => {
  ref?.current?.scrollIntoView({ behavior: 'smooth' });
};

/**
 * Clean text from markdown formatting
 * @param {string} text - Text to clean
 * @returns {string} Cleaned text
 */
export const cleanMarkdown = (text) => {
  if (!text) return '';
  return text
    .replace(/\*\*\*/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

/**
 * Debounce function to limit execution rate
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};
