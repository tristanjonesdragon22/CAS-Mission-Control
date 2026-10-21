(function(root){'use strict';
function runSequence(config, compile, investigator){
 if(typeof compile!=='function'||typeof investigator!=='function')throw Error('Research engines unavailable');
 const expression=String(config.expression||'').trim(),start=Number(config.start),end=Number(config.end),count=Number(config.count),rounds=Number(config.rounds),tol=Number(config.tolerance);
 if(!expression||!Number.isFinite(start)||!Number.isFinite(end)||end<=start)throw Error('Enter a valid expression and increasing interval');
 if(!Number.isInteger(count)||count<16||count>501||!Number.isInteger(rounds)||rounds<1||rounds>8||!Number.isFinite(tol)||tol<0)throw Error('Invalid samples, rounds, or tolerance');
 const f=compile(expression),reports=[];let lo=start,hi=end;
 for(let r=0;r<rounds;r++){
  const rows=[];for(let i=0;i<count;i++){const x=lo+(hi-lo)*i/(count-1),y=f(x,0);if(!Number.isFinite(y))throw Error('Non-finite result near x='+x);rows.push({x,y});}
  const result=investigator(rows,{tolerance:tol});
  // Treat floating-point roundoff as a tie; prefer the simplest comparable model.
  const bestError=Math.min(...result.modelComparisons.map(m=>m.rmse));
  const comparable=result.modelComparisons.filter(m=>m.rmse<=bestError+1e-10*Math.max(1,...rows.map(v=>Math.abs(v.y))));
  const candidate=comparable.reduce((a,b)=>a.degree<b.degree?a:b);
  reports.push({round:r+1,interval:[lo,hi],samples:count,hypothesis:`Degree ${candidate.degree} polynomial candidate`,supportedNumerically:result.supportedNumerically,normalizedHoldoutError:result.normalizedHoldoutError,holdoutRMSE:result.holdoutRMSE,modelComparisons:result.modelComparisons,probes:result.proposedNextMeasurements});
  // Each next round samples a slightly wider interval, independently generated from the expression.
  const expansion=(hi-lo)*.15;lo-=expansion;hi+=expansion;
 }
 const stable=reports.every(r=>r.hypothesis===reports[0].hypothesis),supported=reports.every(r=>r.supportedNumerically);
 return {expression,rounds:reports,stableHypothesis:stable,supportedInEveryRound:supported,conclusion:stable&&supported?'Candidate consistent across tested intervals':'Candidate unstable or insufficiently supported',limitations:'Deterministic numerical samples from one expression; repeated rounds are not independent experimental evidence or a formal proof.'};
}
root.casResearchSequencesV631257={runSequence};
if(typeof document==='undefined')return;
const el=id=>document.getElementById(id),button=el('casResearch57Run');if(!button)return;
let last=null;
button.addEventListener('click',()=>{try{last=runSequence({expression:el('casResearch57Expression').value,start:el('casResearch57Start').value,end:el('casResearch57End').value,count:el('casResearch57Count').value,rounds:el('casResearch57Rounds').value,tolerance:el('casResearch57Tolerance').value},root.casGraphV631227?.compile,root.casResearchV631256?.investigate);el('casResearch57Output').textContent=JSON.stringify(last,null,2)}catch(e){last=null;el('casResearch57Output').textContent='Experiment error: '+e.message}});
el('casResearch57Export').addEventListener('click',()=>{if(!last){el('casResearch57Output').textContent='Run an experiment first.';return}const url=URL.createObjectURL(new Blob([JSON.stringify(last,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='cas_v631_2_57_research_report.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
})(typeof window!=='undefined'?window:globalThis);
