import CryptoJS from 'crypto-js';

const STORAGE_KEY = 'vjp_entries';
const HASH_KEY = 'vjp_hash';

export const hashPassword = (password: string): string => {
  return CryptoJS.SHA256(password + 'vault_journal_salt_2024').toString();
};

export const encryptData = (data: string, password: string): string => {
  return CryptoJS.AES.encrypt(data, password).toString();
};

export const decryptData = (encrypted: string, password: string): string | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, password);
    const result = bytes.toString(CryptoJS.enc.Utf8);
    if (!result) return null;
    return result;
  } catch {
    return null;
  }
};

export const saveEntries = (entries: object[], password: string): void => {
  const json = JSON.stringify(entries);
  const encrypted = encryptData(json, password);
  localStorage.setItem(STORAGE_KEY, encrypted);
};

export const loadEntries = (password: string): object[] | null => {
  const encrypted = localStorage.getItem(STORAGE_KEY);
  if (!encrypted) return [];
  const decrypted = decryptData(encrypted, password);
  if (!decrypted) return null;
  try {
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
};

export const savePasswordHash = (password: string): void => {
  localStorage.setItem(HASH_KEY, hashPassword(password));
};

export const verifyPassword = (password: string): boolean => {
  const stored = localStorage.getItem(HASH_KEY);
  if (!stored) return false;
  return stored === hashPassword(password);
};

export const hasStoredPassword = (): boolean => {
  return !!localStorage.getItem(HASH_KEY);
};
