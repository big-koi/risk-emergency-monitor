import CryptoJS from 'crypto-js';

const ALGORITHM = 'AES';
const SECRET_KEY = 'YourSecretKey123'; // 16字节的密钥

export function encrypt(plainText) {
  const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);
  const encrypted = CryptoJS.AES.encrypt(plainText, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.toString();
}