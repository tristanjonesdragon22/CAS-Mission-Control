(function(g){'use strict';
const previous=g.CASMission94||(typeof require==='function'?require('./mission_scientific_intelligence_v631_2_94.js'):null);
function finite(v,name){v=Number(v);if(!Number.isFinite(v))throw Error('Invalid '+name);return v;}
function discover(description,options={}){
 if(typeof description!=='string'||!description.trim())throw Error('Mission description required');
 const parameters=options.parameters||((/robot/i.test(description))?['force','mass']:['departureDeltaV','phaseDeg']);
 if(!Array.isArray(parameters)||parameters.length<1||parameters.length>3||parameters.some(p=>!['force','mass','departureDeltaV','phaseDeg'].includes(p)))throw Error('Choose 1-3 supported parameters');
 const rounds=Math.min(5,Math.max(1,Math.floor(finite(options.rounds??3,'rounds'))));
 const base={force:20,mass:10,departureDeltaV:2945,phaseDeg:44,...options};
 let centers={};for(const p of parameters){centers[p]=finite(base[p],p);if((p==='mass'||p==='force'||p==='departureDeltaV')&&centers[p]<=0)throw Error(p+' must be positive');}
 const history=[];let spread=finite(options.spread??0.2,'spread');if(spread<=0||spread>0.9)throw Error('spread must be >0 and <=0.9');
 for(let round=0;round<rounds;round++){
  let improved=false;
  for(const parameter of parameters){
   const study=previous.runStudy(description,{...base,...centers,parameter,spread,trials:options.trials??7});
   history.push({round:round+1,parameter,centerBefore:centers[parameter],study});
   if(study.best){const candidate=study.best.value;if(candidate!==centers[parameter])improved=true;centers[parameter]=candidate;}
  }
  spread/=2;
 }
 const ranked=history.filter(h=>h.study.best);
 return {version:'631.2.95',description,parameters,rounds,history,parametersRecommended:centers,status:ranked.length?'candidate_found':'insufficient_numeric_evidence',bestObserved:ranked.length?ranked.reduce((a,b)=>a.study.best.metric<=b.study.best.metric?a:b).study.best:null,limitations:['Coordinate-wise local search, not machine learning or global optimization','Results depend on the existing simplified simulation models','No numerical evidence means no validated improvement']};
}
function save(record,storage){storage=storage||g.localStorage;if(!storage)throw Error('Storage unavailable');const key='cas_mission_research_v95';const list=JSON.parse(storage.getItem(key)||'[]');list.push({savedAt:new Date().toISOString(),record});storage.setItem(key,JSON.stringify(list.slice(-50)));return list.length;}
function load(storage){storage=storage||g.localStorage;return storage?JSON.parse(storage.getItem('cas_mission_research_v95')||'[]'):[];}
const api={discover,save,load};g.CASMission95=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
