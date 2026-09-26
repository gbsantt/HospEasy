const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');const ts=require('typescript');
const source=ts.transpileModule(fs.readFileSync('src/service/sessionStorage.web.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
function storage(){const values=new Map();return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};}
const key='hospeasy.session.v2';
const token=exp=>'header.'+Buffer.from(JSON.stringify({exp})).toString('base64url')+'.signature';
function runtime(local=storage(),session=storage()) {
 const context={exports:{},window:{localStorage:local,sessionStorage:session},atob,Date};vm.runInNewContext(source,context);return {api:context.exports,local,session};
}
test('token válido sobrevive à recriação da aplicação e fechamento da aba',async()=>{
 const first=runtime(),jwt=token(Date.now()/1000+3600);await first.api.writeToken(jwt);
 const second=runtime(first.local);assert.equal(await second.api.readToken(),jwt);
});
test('migra sessão anterior e encerra as duas formas de armazenamento',async()=>{
 const {api,local,session}=runtime(),jwt=token(Date.now()/1000+3600);session.setItem(key,jwt);
 assert.equal(await api.readToken(),jwt);assert.equal(session.getItem(key),null);assert.equal(local.getItem(key),jwt);
 await api.clearToken();assert.equal(await api.readToken(),null);
});
test('não restaura tokens vencidos ou malformados',async()=>{
 for(const value of [token(Date.now()/1000-60),'invalido']) {const {api,local}=runtime();local.setItem(key,value);assert.equal(await api.readToken(),null);assert.equal(local.getItem(key),null);}
});
