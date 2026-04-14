/**
 * Generates a consistent, human-readable unique ID with a prefix.
 * Format: PREFIX-XXXXXX (where X is a random alphanumeric character)
 */
const generateCustomId = (prefix) => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Omitted similar looking chars (0, O, 1, I)
  let result = '';
  const length = 7; // e.g. PROP-A8B3C9X
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return `${prefix}-${result}`;
};

module.exports = { generateCustomId };
