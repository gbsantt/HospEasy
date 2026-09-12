import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(process.env.WEB_DIST||'dist');
const base=(process.env.EXPO_PUBLIC_BASE_PATH||'').replace(/\/$/,'');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.ico':'image/x-icon','.svg':'image/svg+xml'};
http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(base&&pathname===base){res.writeHead(302,{Location:base+'/'});res.end();return;}
  if(base&&!pathname.startsWith(base+'/')){res.writeHead(404);res.end();return;}
  const relative=pathname.slice(base.length).replace(/^\/+/, '');
  let file=path.resolve(root,relative||'index.html');
  if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  try{if(!(await stat(file)).isFile())file=path.join(root,'index.html');}
  catch{if(path.extname(relative)){res.writeHead(404);res.end();return;}file=path.join(root,'index.html');}
  const content=await readFile(file);
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  res.end(content);
 }catch{if(!res.headersSent)res.writeHead(400);res.end();}
}).listen(Number(process.env.WEB_PORT||8081),'127.0.0.1',()=>console.log('Preview local em loopback; não é servidor de produção.'));
