import type { AlertButton, AlertOptions } from "react-native";
// DOM dialog avoids blocking the browser event loop and works in embedded browsers.
// Text is never interpreted as HTML. Native continues to use React Native Alert.
const queue:Array<()=>void>=[];
let showing=false;
export const Alert={
 alert(title:string,message?:string,buttons?:AlertButton[],options?:AlertOptions){
  queue.push(()=>{
   const previous=document.activeElement as HTMLElement|null;
   const overlay=document.createElement("div"),dialog=document.createElement("div");
   overlay.style.cssText="position:fixed;inset:0;z-index:2147483647;background:#0007;display:flex;align-items:center;justify-content:center;padding:16px";
   dialog.style.cssText="background:white;color:#18251a;border-radius:18px;padding:24px;max-width:440px;width:100%;max-height:90vh;overflow:auto;font:16px system-ui";
   dialog.setAttribute("role","alertdialog");dialog.setAttribute("aria-modal","true");dialog.setAttribute("aria-label",title);
   const heading=document.createElement("h2");heading.textContent=title;heading.style.cssText="margin:0 0 16px;font-size:22px";
   dialog.append(heading);
   if(message){const text=document.createElement("p");text.textContent=message;text.style.whiteSpace="pre-wrap";dialog.append(text);}
   const actions=buttons?.length?buttons:[{text:"OK"}];
   const row=document.createElement("div");row.style.cssText="display:flex;flex-wrap:wrap;gap:12px;justify-content:flex-end";
   let closed=false;
   const finish=(action?:AlertButton)=>{if(closed)return;closed=true;overlay.remove();document.removeEventListener("keydown",keydown,true);previous?.focus();showing=false;action?.onPress?.();next();};
   const cancel=actions.find(b=>b.style==="cancel");
   const keydown=(event:KeyboardEvent)=>{
    if(event.key==="Escape"&&options?.cancelable!==false){event.preventDefault();event.stopPropagation();finish(cancel);options?.onDismiss?.();}
    if(event.key==="Tab"){const controls=Array.from(dialog.querySelectorAll("button"));const first=controls[0],last=controls[controls.length-1];
     if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
     else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
   };
   actions.forEach(action=>{const button=document.createElement("button");button.type="button";button.textContent=action.text||"OK";
    button.style.cssText="min-height:48px;padding:12px 18px;border:0;border-radius:12px;cursor:pointer;font:600 15px system-ui;background:"+(action.style==="cancel"?"#e7f1dd;color:#355623":"#4d8900;color:white");
    button.onclick=()=>finish(action);row.append(button);});
   dialog.append(row);overlay.append(dialog);document.body.append(overlay);document.addEventListener("keydown",keydown,true);
   (cancel?row.children[actions.indexOf(cancel)]:row.firstElementChild as HTMLElement)?.scrollIntoView({block:"nearest"});
   ((cancel?row.children[actions.indexOf(cancel)]:row.firstElementChild) as HTMLElement|null)?.focus();
  });next();
 }
};
function next(){if(showing||!queue.length)return;showing=true;queue.shift()!();}
