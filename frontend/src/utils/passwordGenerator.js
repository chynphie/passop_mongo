// src/utils/passphraseGenerator.js
// A combinatorics-based passphrase generator offering optimized secure passphrases
// tailored to user-specified entropy goals.

// Example wordlist: you should replace this with a larger, more comprehensive list.
// You can import an EFF wordlist JSON or text file as needed.
const wordlist = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '=', '+', '[', ']', '{', '}', ';', ':', '\'', '"', ',', '.', '<', '>', '/', '?', '\\', '|', '`', '~'
];

/**
 * Calculate bits of entropy per word: log2(wordlist.length)
 */
function entropyPerWord(listLength) {
  return Math.log2(listLength);
}

/**
 * Generate a passphrase meeting or exceeding the target entropy in bits.
 * @param {number} targetBits - desired entropy (e.g., 64, 80)
 * @param {object} [options]
 * @param {string[]} [options.list] - custom wordlist
 * @param {string} [options.separator] - string between words
 * @returns {string} passphrase
 */
export function generatePassphrase(targetBits, options = {}) {
  console.log('!Number.isFinite(targetBits)',!Number.isFinite(targetBits));
  
  const list = options.list || wordlist;
  const sep = options.separator ?? '-';
  targetBits = Number(targetBits);
  if (!Number.isFinite(targetBits) || targetBits <= 0) {
    throw new Error('targetBits must be a positive number');
  }

  const perWord = entropyPerWord(list.length);
  // number of words needed = ceil(targetBits / perWord)
  const count = Math.ceil(targetBits / perWord);

  const passwords = [];
  for (let i = 0; i < count; i++) {
    const idx = crypto.getRandomValues(new Uint32Array(1))[0] % list.length;
    passwords.push(list[idx]);
  }
  console.log('the generated password', passwords.join(''));
  
  return passwords.join('');
}

/**
 * Calculate how many words are required for a given entropy.
 * @param {number} targetBits
 * @param {number} listLength
 * @returns {number}
 */
export function wordsRequired(targetBits, listLength = wordlist.length) {
  console.log(Math.ceil(targetBits / entropyPerWord(listLength)));
  
  return Math.ceil(targetBits / entropyPerWord(listLength));
}

// Example usage:
// import { generatePassphrase, wordsRequired } from '@/utils/passphraseGenerator';
// const phrase = generatePassphrase(80, { separator: ' ' });
// console.log(`Your passphrase: ${phrase}`);
