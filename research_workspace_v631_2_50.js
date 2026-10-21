(function(root){'use strict';
const KEY='cas_research_v631_2_50', MAX=30;
function validate(x){if(!x||typeof x!=='object'||typeof x.title!=='string'||!x.title.trim()||x.title.length>100)throw Error('Project title must contain 1–100 characters');if(!Array.isArray(x.entries)||x.entries.length>100)throw Error('Invalid entries');return {title:x.title.trim(),entries:x.entries.map(e=>{if(!e||typeof e.note!=='string'||e.note.length>4000||typeof e.type!=='string'||!['note','calculation','experiment'].includes(e.type))throw Error('Invalid entry');return {type:e.type,note:e.note}})}}
function load(storage){try{const data=JSON.parse(storage.getItem(KEY)||'[]');return Array.isArray(data)?data.slice(0,MAX).map(validate):[]}catch(e){return []}}
function save(storage,projects){if(!Array.isArray(projects)||projects.length>MAX)throw Error('Maximum 30 projects');storage.setItem(KEY,JSON.stringify(projects.map(validate)));return projects.length}
function add(projects,title){if(projects.length>=MAX)throw Error('Maximum 30 projects');return [...projects,validate({title,entries:[]})]}
function entry(projects,index,type,note){if(!Number.isInteger(index)||index<0||index>=projects.length)throw Error('Select a project');const copy=projects.map(p=>({title:p.title,entries:p.entries.slice()}));copy[index].entries.push({type,note});copy[index]=validate(copy[index]);return copy}
function importJSON(text){const parsed=JSON.parse(text);if(!Array.isArray(parsed)||parsed.length>MAX)throw Error('Expected a project array (up to 30)');return parsed.map(validate)}
const api={validate,load,save,add,entry,importJSON,exportJSON:projects=>JSON.stringify(projects.map(validate),null,2)};root.casResearchV631250=api;
if(typeof document==='undefined')return;
const el=id=>document.getElementById(id);if(!el('casResearchPanel'))return;
let projects=load(root.localStorage),selected=-1;
function status(s){el('casResearchStatus').textContent=s}
function refresh(){const sel=el('casResearchSelect');sel.replaceChildren();projects.forEach((p,i)=>{const option=document.createElement('option');option.value=i;option.textContent=p.title+' ('+p.entries.length+' entries)';sel.appendChild(option)});selected=projects.length?Math.min(Math.max(0,selected),projects.length-1):-1;sel.value=selected<0?'':String(selected);render()}
function render(){el('casResearchEntries').textContent=selected<0?'Create a project to begin.':projects[selected].entries.map((e,i)=>`${i+1}. [${e.type}] ${e.note}`).join('\n\n')||'No entries yet.'}
function commit(next){save(root.localStorage,next);projects=next;refresh()}
el('casResearchCreate').onclick=()=>{try{commit(add(projects,el('casResearchTitle').value));selected=projects.length-1;refresh();status('Project created and saved locally.')}catch(e){status(e.message)}};
el('casResearchSelect').onchange=()=>{selected=Number(el('casResearchSelect').value);render()};
el('casResearchAdd').onclick=()=>{try{commit(entry(projects,selected,el('casResearchType').value,el('casResearchNote').value));el('casResearchNote').value='';status('Entry saved locally.')}catch(e){status(e.message)}};
el('casResearchExport').onclick=()=>{try{const blob=new Blob([api.exportJSON(projects)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='cas-research-projects.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status('Exported research projects.')}catch(e){status(e.message)}};
el('casResearchImport').onchange=async ev=>{try{const file=ev.target.files[0];if(!file)return;const imported=importJSON(await file.text());commit(imported);status('Imported '+imported.length+' projects (replaced local workspace).')}catch(e){status('Import failed: '+e.message)}};
refresh();
})(typeof globalThis!=='undefined'?globalThis:this);
