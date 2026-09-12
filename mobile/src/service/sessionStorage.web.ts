// Tab-scoped browser storage. No permanent token in localStorage.
const KEY="hospeasy.session.v2";
export async function readToken() { return window.sessionStorage.getItem(KEY); }
export async function writeToken(token:string) { window.sessionStorage.setItem(KEY,token); }
export async function clearToken() { window.sessionStorage.removeItem(KEY); }
