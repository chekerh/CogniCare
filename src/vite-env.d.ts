/// <reference types="vite/client" />

declare module 'libsodium-wrappers' {
  export function ready(): Promise<void>;
  export function crypto_box_keypair(): { publicKey: Uint8Array; privateKey: Uint8Array };
  export function crypto_box_easy(message: Uint8Array, nonce: Uint8Array, publicKey: Uint8Array, privateKey: Uint8Array): Uint8Array;
  export function crypto_box_open_easy(ciphertext: Uint8Array, nonce: Uint8Array, publicKey: Uint8Array, privateKey: Uint8Array): Uint8Array;
  export function crypto_scalarmult_base(privateKey: Uint8Array): Uint8Array;
  export function randombytes_buf(length: number): Uint8Array;
  export function to_base64(bytes: Uint8Array): string;
  export function from_base64(base64: string): Uint8Array;
}
