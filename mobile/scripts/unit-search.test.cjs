const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
const context={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/utils/unitSearch.ts','utf8'),{
 compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}
}).outputText,context);
const search=context.exports.correspondeBuscaUnidade;
const unit=endereco=>({nome:'Hospital Central',endereco});
test('CEP com ou sem hífen encontra ambos os formatos e preserva zero inicial',()=>{
 for(const address of ['Avenida Paulista, CEP 01310-100, São Paulo','Avenida Paulista, 01310100'])
  for(const query of ['01310-100','01310100',' CEP: 01310-100 ']) assert.equal(search(unit(address),query),true);
});
test('mantém buscas por nome e endereço, ignorando caixa e espaços externos',()=>{
 assert.equal(search(unit('Rua das Flores, 10'),' CENTRAL '),true);
 assert.equal(search(unit('Rua das Flores, 10'),'rua das flores'),true);
 assert.equal(search(unit('Rua das Flores, 10'),''),true);
});
test('não inventa CEP juntando números nem encontra CEP dentro de número maior',()=>{
 for(const address of ['Rua 01310, número 100','Rua 101310100','Rua 013101009','Rua sem CEP'])
  assert.equal(search(unit(address),'01310100'),false);
 assert.equal(search(unit('CEP 01310-101'),'01310-100'),false);
});
