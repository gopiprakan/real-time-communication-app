import CryptoJS from 'crypto-js';

const SECRET_KEY = 'nexus-secret-key-123'; // In production, use an environment variable

export const encryptData = (data: string) => {
    return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
};

export const decryptData = (ciphertext: string) => {
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (err) {
        console.error('Decryption failed', err);
        return '';
    }
};
