const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript');
const root=__dirname, app=path.join(root,'apps/mobile/src');
let count=0, diagnostics=[], importMissing=[], routes={};
function walk(dir){for(let e of fs.readdirSync(dir,{withFileTypes:true})){let p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(/\.(tsx?|jsx?)$/.test(p)){count++;const s=fs.readFileSync(p,'utf8');const source=ts.createSourceFile(p,s,ts.ScriptTarget.Latest,true,p.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);for(const d of source.parseDiagnostics)diagnostics.push(p+': '+ts.flattenDiagnosticMessageText(d.messageText,' '));for(const m of s.matchAll(/from\s+["'](@\/[\w\/-]+|\.{1,2}\/[\w\/-]+)["']/g)){let spec=m[1], dir=spec.startsWith('@/')?path.join(app,spec.slice(2)):path.resolve(path.dirname(p),spec);let candidates=[dir,dir+'.ts',dir+'.tsx',dir+'.js',dir+'.json',path.join(dir,'index.ts'),path.join(dir,'index.tsx')];if(!candidates.some(fs.existsSync))importMissing.push(p+' -> '+spec)}}}}
walk(app);
function routeScan(dir){for(let x of fs.readdirSync(dir,{withFileTypes:true})){let p=path.join(dir,x.name);if(x.isDirectory())routeScan(p);else if(x.name.endsWith('.tsx') && !x.name.startsWith('_')){let rel=path.relative(path.join(app,'app'),p).replaceAll('\\','/');let uri='/'+rel.replace(/\.tsx$/,'').split('/').filter(s=>!s.startsWith('(')).join('/');uri=uri.replace(/\/index$/,'')||'/';(routes[uri]??=[]).push(rel)}}}
routeScan(path.join(app,'app'));
const collisions=Object.entries(routes).filter(([k,v])=>v.length>1);
let palette=require('./apps/mobile/design-tokens.json');
for (const [k,hex] of Object.entries({canvas:'#f5f7fb',surface:'#fff',ink:'#1d2e42',muted:'#74849a',line:'#e6ebf1',brand:'#186956','brand-soft':'#e4f3ed','hero-start':'#154d47','hero-end':'#1d8067'})){
 let value=palette[k].toLowerCase(),normalized=hex==='#fff'?'#ffffff':hex;
 if(value!==normalized)diagnostics.push('Palette differs from prototype for '+k+': '+value+' vs '+normalized)
}
const allTsx=[];function tsx(d){for(let e of fs.readdirSync(d,{withFileTypes:true})){let f=path.join(d,e.name);if(e.isDirectory())tsx(f);else if(f.endsWith('.tsx'))allTsx.push(f)}}tsx(app);
let uiClasses=allTsx.reduce((n,f)=>n+(fs.readFileSync(f,'utf8').match(/className=/g)||[]).length,0);
let output={scannedFiles:count,jsxFiles:allTsx.length,nativewindClassProps:uiClasses,syntaxErrors:diagnostics,missingLocalImports:importMissing,routeCollisions:collisions};
console.log('Static checks:',JSON.stringify(output,null,2));
// Runtime smoke-test Zustand business logic without requiring Metro or external deps.
function transpiled(src){return ts.transpileModule(fs.readFileSync(src,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText}
const sourceMock=path.join(root,'packages/shared/src/mocks/rentals.ts');
const fakeData={exports:{}};
new Function('module','exports','require',transpiled(sourceMock))(fakeData,fakeData.exports,()=>({}));
const storeFile=path.join(app,'features/rentals/store/rental.store.ts');
const storeMod={exports:{}};
const fakeZustand={create:()=>fn=>{let state;const set=(update)=>{state={...state,...(typeof update==='function'?update(state):update)}};const get=()=>state;state=fn(set,get,{});const hook=(selector)=>selector(state);hook.getState=()=>state;hook.setState=set;return hook}};
const fakePersist={persist:(fn)=>fn,createJSONStorage:()=>({})};
const fakeReq=(name)=>name==='zustand'?fakeZustand:name==='zustand/middleware'?fakePersist:name==='@package/shared'?fakeData.exports:name==='@/i18n/core'?{getIntlLocale:()=> 'vi-VN'}:{};
new Function('module','exports','require',transpiled(storeFile))(storeMod,storeMod.exports,fakeReq);
const state=()=>storeMod.exports.useRentalStore.getState();
function assert(ok,msg){if(!ok)throw Error(msg)};
function success(r,label){assert(r.ok,`${label} failed: ${r.error}`);return r.id};
const rentId=success(state().addResident({fullName:'Test resident A',phone:'',email:'',emergencyContact:'',notes:''}),'create resident A');
const rentId2=success(state().addResident({fullName:'Test resident B',phone:'',email:'',emergencyContact:'',notes:''}),'create resident B');
let before=state().occupancies.length;
success(state().recordMoveIns([rentId,rentId2],'unit-5','2026-10-15'),'bulk move in');
assert(state().occupancies.length===before+2,'bulk occupancy not atomic');
const rentId3=success(state().addResident({fullName:'Test resident C',phone:'',email:'',emergencyContact:'',notes:''}),'create resident C');
assert(!state().recordMoveIns([rentId3],'unit-5','2026-10-15').ok,'capacity must prevent extra tenant');
assert(state().occupancies.length===before+2,'capacity failure mutated occupancies');
let unit=state().units.find(x=>x.id==='unit-5');
success(state().updateUnit(unit.id,{...unit,monthlyRent:unit.monthlyRent+100000}),'change room price');
assert(state().unitHistory.some(x=>x.unitId==='unit-5'&&x.kind==='UNIT_UPDATED'),'room price not tracked');
let utilityId=success(state().addUtility({name:'Water unit test',chargeOnce:false,inputUnit:'m3',unitPrice:10000,currencyCode:'VND'}),'create utility');
success(state().updateUtility(utilityId,{name:'Water unit test',chargeOnce:false,inputUnit:'m3',unitPrice:12000,currencyCode:'VND'}),'update utility');
let newUnit={...state().units.find(x=>x.id==='unit-5'),utilityIds:[utilityId]};
success(state().updateUnit('unit-5',newUnit),'assign utility');
assert(state().units.find(x=>x.id==='unit-5').utilityIds.includes(utilityId),'utility not attached');
success(state().archiveUtility(utilityId),'archive utility');
assert(!state().units.find(x=>x.id==='unit-5').utilityIds.includes(utilityId),'utility not unassigned');
assert(state().unitHistory.some(x=>x.unitId==='unit-5'&&x.kind==='UTILITY_REMOVED'),'utility changes not in unit history');
console.log('Business store smoke tests: PASS (bulk occupancy, capacity, rent history, utility editing + removal).');
if(diagnostics.length||importMissing.length||collisions.length)process.exitCode=1;
