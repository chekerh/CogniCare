/**
 * End-to-End Encryption for Private Messaging
 * Uses libsodium-wrappers for X25519 key exchange and encryption
 */

import _sodium from 'libsodium-wrappers';

let sodium: typeof _sodium;

/**
 * Initialize libsodium
 */
export async function initEncryption(): Promise<void> {
  if (!sodium) {
    await _sodium.ready;
    sodium = _sodium;
  }
}

/**
 * Generate a key pair for a user
 */
export async function generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
  await initEncryption();
  
  const keypair = sodium.crypto_box_keypair();
  
  return {
    publicKey: sodium.to_base64(keypair.publicKey, sodium.base64_variants.ORIGINAL),
    privateKey: sodium.to_base64(keypair.privateKey, sodium.base64_variants.ORIGINAL),
  };
}

/**
 * Derive shared secret from two public keys
 */
export async function deriveSharedSecret(
  myPrivateKey: string,
  theirPublicKey: string
): Promise<string> {
  await initEncryption();
  
  const myPrivate = sodium.from_base64(myPrivateKey, sodium.base64_variants.ORIGINAL);
  const theirPublic = sodium.from_base64(theirPublicKey, sodium.base64_variants.ORIGINAL);
  
  const sharedSecret = sodium.crypto_box_beforenm(theirPublic, myPrivate);
  
  return sodium.to_base64(sharedSecret, sodium.base64_variants.ORIGINAL);
}

/**
 * Encrypt a message
 */
export async function encryptMessage(
  message: string,
  sharedSecret: string,
  nonce?: string
): Promise<{ encrypted: string; nonce: string }> {
  await initEncryption();
  
  const secret = sodium.from_base64(sharedSecret, sodium.base64_variants.ORIGINAL);
  const msgBytes = sodium.from_string(message);
  
  const nonceBytes = nonce
    ? sodium.from_base64(nonce, sodium.base64_variants.ORIGINAL)
    : sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
  
  const encrypted = sodium.crypto_box_afternm(msgBytes, nonceBytes, secret);
  
  return {
    encrypted: sodium.to_base64(encrypted, sodium.base64_variants.ORIGINAL),
    nonce: sodium.to_base64(nonceBytes, sodium.base64_variants.ORIGINAL),
  };
}

/**
 * Decrypt a message
 */
export async function decryptMessage(
  encrypted: string,
  sharedSecret: string,
  nonce: string
): Promise<string> {
  await initEncryption();
  
  const secret = sodium.from_base64(sharedSecret, sodium.base64_variants.ORIGINAL);
  const encryptedBytes = sodium.from_base64(encrypted, sodium.base64_variants.ORIGINAL);
  const nonceBytes = sodium.from_base64(nonce, sodium.base64_variants.ORIGINAL);
  
  const decrypted = sodium.crypto_box_open_afternm(encryptedBytes, nonceBytes, secret);
  
  return sodium.to_string(decrypted);
}

/**
 * Store private key securely (in localStorage for now, should use secure storage in production)
 */
export function storePrivateKey(userId: string, privateKey: string): void {
  localStorage.setItem(`encryption_key_${userId}`, privateKey);
}

/**
 * Retrieve private key
 */
export function getPrivateKey(userId: string): string | null {
  return localStorage.getItem(`encryption_key_${userId}`);
}

