// Keep only the existing bearer token. Identity and permissions are always validated by the API.
const KEY="hospeasy.session.v2";
export async function readToken() {
    const token=window.localStorage.getItem(KEY) ?? window.sessionStorage.getItem(KEY);
    if(token) {
        try {
            const encoded=token.split(".")[1].replace(/-/g,"+").replace(/_/g,"/");
            const payload=JSON.parse(atob(encoded));
            if(typeof payload.exp==="number" && payload.exp*1000<=Date.now()) { await clearToken();return null; }
        } catch { await clearToken();return null; }
    }
    if(token) { window.localStorage.setItem(KEY,token); window.sessionStorage.removeItem(KEY); }
    return token;
}
export async function writeToken(token:string) { window.localStorage.setItem(KEY,token); window.sessionStorage.removeItem(KEY); }
export async function clearToken() { window.localStorage.removeItem(KEY); window.sessionStorage.removeItem(KEY); }
export function onStoredSessionChange(callback:()=>void) {
    const listener=(event:StorageEvent)=>{if(event.storageArea===window.localStorage && (event.key===KEY || event.key===null))callback();};
    window.addEventListener("storage",listener);
    return ()=>window.removeEventListener("storage",listener);
}
