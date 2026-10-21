(function(root){'use strict';
function plan(config,compile,investigate){
 if(typeof compile!=='function'||typeof investigate!=='function')throw Error('Research engines unavailable');
 const expression=String(config.expression||'').trim(),start=Number(config.start),end=Number(config.end),count=Number(config.count),rounds=Number(config.rounds),tol=Number(config.tolerance),growth=Number(config.growth);
 if(!expression||!Number.isFinite(start)||!Number.isFinite(end)||end<=start)throw Error('Invalid expression or interval');
 if(!Number.isInteger(count)||count<16||count>501||!Number.isInteger(rounds)||rounds<1||rounds>8||!Number.isFinite(tol)||tol<0||!Number.isFinite(growth)||growth<=0||growth>1)throw Error('Invalid experiment settings');
 const fn=compile(expression),history=[];let lo=start,hi=end;
 for(let round=0;round<rounds;round++){
  const rows=[];for(let i=0;i<count;i++){const x=lo+(hi-lo)*i/(count-1),y=fn(x,0);if(!Number.isFinite(y))throw Error('Non-finite value near x='+x);rows.push({x,y});}
  const result=investigate(rows,{tolerance:tol});if(!Array.isArray(result.modelComparisons)||!result.modelComparisons.length)throw Error('Invalid investigation result');
  const models=result.modelComparisons.slice().sort((a,b)=>a.rmse-b.rmse||a.degree-b.degree),best=models[0];
  const scale=Math.max(1,...rows.map(r=>Math.abs(r.y)));const tied=models.filter(m=>m.rmse<=best.rmse+1e-10*scale).sort((a,b)=>a.degree-b.degree)[0];
  const record={round:round+1,interval:[lo,hi],candidateDegree:tied.degree,holdoutRMSE:best.rmse,normalizedError:result.normalizedHoldoutError,supportedNumerically:result.supportedNumerically,modelComparisons:models,proposedProbes:result.proposedNextMeasurements};history.push(record);
  // Always challenge the hypothesis on a wider interval; the interval is deterministic and recorded.
  const delta=(hi-lo)*growth/2;lo-=delta;hi+=delta;
 }
 const consistent=history.every(h=>h.candidateDegree===history[0].candidateDegree),supported=history.every(h=>h.supportedNumerically);
 const score=history.reduce((s,h)=>s+h.normalizedError,0)/history.length;
 const next={interval:[lo,hi],samples:count,reason:consistent&&supported?'Challenge the stable candidate outside prior sampling intervals':'Collect more samples to investigate instability or high prediction error'};
 return {version:'V631.2.58',expression,settings:{start,end,count,rounds,tolerance:tol,growth},history,stableCandidate:consistent,supportedAcrossRounds:supported,averageNormalizedError:score,nextExperiment:next,conclusion:consistent&&supported?'Numerically consistent candidate across tested intervals':'Candidate not consistently supported',limitations:'Generated deterministic samples from one formula; model selection is heuristic and not proof, independent evidence, or autonomous AI discovery.'};
}
root.casResearchPlannerV631258={plan};
if(typeof document==='undefined')return;
const el=id=>document.getElementById(id),run=el('casResearch58Run');if(!run)return;let last=null;
run.addEventListener('click',()=>{try{last=plan({expression:el('casResearch58Expression').value,start:el('casResearch58Start').value,end:el('casResearch58End').value,count:el('casResearch58Count').value,rounds:el('casResearch58Rounds').value,tolerance:el('casResearch58Tolerance').value,growth:el('casResearch58Growth').value},root.casGraphV631227?.compile,root.casResearchV631256?.investigate);el('casResearch58Output').textContent=JSON.stringify(last,null,2);try{const key='cas_research_planner_58',items=JSON.parse(localStorage.getItem(key)||'[]');items.push({time:new Date().toISOString(),expression:last.expression,conclusion:last.conclusion,score:last.averageNormalizedError});localStorage.setItem(key,JSON.stringify(items.slice(-30)));}catch(_){/* private browsing may deny storage */}}catch(e){last=null;el('casResearch58Output').textContent='Research planning error: '+e.message}});
el('casResearch58Export').addEventListener('click',()=>{if(!last){el('casResearch58Output').textContent='Run a plan before exporting.';return;}const url=URL.createObjectURL(new Blob([JSON.stringify(last,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='cas_v631_2_58_research_plan.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
el('casResearch58History').addEventListener('click',()=>{try{el('casResearch58Output').textContent=JSON.stringify(JSON.parse(localStorage.getItem('cas_research_planner_58')||'[]'),null,2)}catch(e){el('casResearch58Output').textContent='History unavailable: '+e.message}});
})(typeof window!=='undefined'?window:globalThis);
