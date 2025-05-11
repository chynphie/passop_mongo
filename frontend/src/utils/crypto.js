// src/utils/crypto.js
import { argon2id } from "hash-wasm";
// Removed Node.js crypto import as it is not compatible with the browser

// decode hex, Base64, or URL-safe Base64 → Uint8Array
export function decodeToBytes(base64Str) {
  const binaryStr = atob(base64Str);
  const len = binaryStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes;
}

// derive Argon2id key as hex string
export async function deriveKey(password, saltBase64) {
  const saltBytes = Uint8Array.from(atob(saltBase64), (c) => c.charCodeAt(0));
  const hashHex = await argon2id({
    password, // string
    iterations: 3, // time cost
    salt: saltBytes, // Uint8Array
    memorySize: 1 << 16, // 64 MiB
    parallelism: 1, // p=1
    hashLength: 32, // 32 bytes = 256 bits
  });
  return hashHex; // hex string
}

// AES-GCM encrypt / decrypt
export async function encryptVault(vaultObj, keyHex) {
  const keyBuffer = new Uint8Array(
    keyHex.match(/.{1,2}/g).map((b) => parseInt(b, 16))
  ).slice(0, 32); // Ensure the key is 256 bits (32 bytes)
  const cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    keyBuffer,
    "AES-GCM",
    false,
    ["encrypt"]
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(vaultObj));
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    encoded
  );

  return {
    encryptedVault: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

export async function decryptAESGCM(encryptedStr, keyHex, ivStr) {
  // 1) Turn your hex-string key into raw bytes
  const keyBytes = Uint8Array.from(
    keyHex.match(/.{1,2}/g).map((b) => parseInt(b, 16))
  ).slice(0, 32); // Ensure the key is 256 bits (32 bytes)
  if (keyBytes.length !== 32) {
    throw new Error("Derived key must be 256 bits (32 bytes)");
  }
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes.buffer,
    "AES-GCM",
    false,
    ["decrypt"]
  );

  // 2) Decode the IV (initialization vector) and ciphertext
  const ivBytes = decodeToBytes(ivStr); // Uint8Array
  const dataBytes = decodeToBytes(encryptedStr); // Uint8Array

  // 3) Perform the actual AES-GCM decryption
  const plainBuffer = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes },
    cryptoKey,
    dataBytes
  );

  // 4) Convert decrypted bytes back into a JS object
  const json = new TextDecoder().decode(plainBuffer);
  return JSON.parse(json);
}

export function generateSalt(length = 16) {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array)); // Base64 encoded salt
}
