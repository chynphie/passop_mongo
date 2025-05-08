import { argon2id } from "hash-wasm";
/**
 * Derive a 256-bit AES key from the master password + salt.
 * Returns a CryptoKey usable for AES-GCM decryption.
 */
export async function deriveKey(masterPassword, saltHex) {
  // 1) Argon2id → 32-byte hash (hex)
  const keyHex = await argon2id({
    password: masterPassword,
    salt: saltHex,
    timeCost: 3,
    memoryCost: 1 << 16,
    parallelism: 1,
    hashLength: 32,
  });

  // 2) Hex string → Uint8Array
  const keyBytes = new Uint8Array(
    keyHex.match(/.{2}/g).map((b) => parseInt(b, 16))
  );

  // 3) Import into WebCrypto
  return crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, [
    "decrypt",
  ]);
}

/**
 * Decrypts AES-GCM ciphertext+authTag given a CryptoKey and hex inputs.
 * Returns the parsed JSON vault object.
 */
export async function decryptVault(key, ivHex, cipherHex, authTagHex) {
  // Convert hex strings → Uint8Arrays
  const toBytes = (hex) =>
    new Uint8Array(hex.match(/.{2}/g).map((b) => parseInt(b, 16)));
  const iv = toBytes(ivHex);
  const cipher = toBytes(cipherHex);
  const authTag = toBytes(authTagHex);
  const combined = new Uint8Array(cipher.length + authTag.length);
  combined.set(cipher, 0);
  combined.set(authTag, cipher.length);

  // WebCrypto decrypt
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv, tagLength: 128 },
    key,
    combined
  );

  // ArrayBuffer → UTF-8 string → JSON
  const decoder = new TextDecoder();
  return JSON.parse(decoder.decode(decryptedBuffer));
}
