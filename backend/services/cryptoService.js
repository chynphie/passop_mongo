// /services/cryptoService.js
const argon2 = require('argon2');
const crypto = require('crypto');

async function deriveKey(masterPassword, salt) {
  return await argon2.hash(masterPassword + salt, {
    type: argon2.argon2id,
    hashLength: 32,
    raw: true,
  });
}

function decryptVault(cipherText, key, iv) {
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  let decrypted = decipher.update(cipherText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = { deriveKey, decryptVault };
