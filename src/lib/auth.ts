// Auth abstraction for Special Minds student identity.
//
// Currently reads from localStorage (username prompt UI).
//
// TODO: replace with MSAL / Microsoft Entra ID
// Hook point: replace the body of `getUser()` with an MSAL silent token
// acquisition. The rest of the app imports only from this file, so swapping
// auth requires changing only this module.
//
// Example MSAL replacement:
//   import { PublicClientApplication } from '@azure/msal-browser';
//   const msalInstance = new PublicClientApplication({ auth: { clientId: '...' } });
//   export async function getUser() {
//     const accounts = msalInstance.getAllAccounts();
//     if (accounts.length === 0) await msalInstance.loginPopup();
//     return { username: msalInstance.getAllAccounts()[0].username };
//   }

const STORAGE_KEY = 'sm_user';

export function getStoredUser(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function setStoredUser(username: string): void {
  localStorage.setItem(STORAGE_KEY, username);
}

export function clearStoredUser(): void {
  localStorage.removeItem(STORAGE_KEY);
}
