import * as SecureStore from "expo-secure-store";
const KEY="hospeasy.session.v2";
export const readToken=()=>SecureStore.getItemAsync(KEY);
export const writeToken=(token:string)=>SecureStore.setItemAsync(KEY,token,{keychainAccessible:SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY});
export const clearToken=()=>SecureStore.deleteItemAsync(KEY);
