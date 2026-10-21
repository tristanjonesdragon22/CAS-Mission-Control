(function(root){'use strict';
function makeWorkflow(config,plan,compile,investigate){
 if(typeof plan!=='function')throw Error('Research planner unavailable');
 const expressions=String(config.expressions||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 if(!expressions.length||expressions.length>12)throw Error('Enter 1 to 12 expressions, one per line');
 const unique=[...new Set(expressions)];if(unique.length!==expressions.length)throw Error('Duplicate expressions are not allowed');
 return {version:'V631.2.59',created:new Date().toISOString(),settings:{start:config.start,end:config.end,count:config.count,rounds:config.rounds,tolerance:config.tolerance,growth:config.growth},expressions:unique,status:'pending',results:[],errors:[],completed:0,total:unique.length,limitations:'Deterministic numerical tests of supplied formulas; not formal proof or autonomous discovery.'};
}
function executeOne(workflow,plan,compile,investigate){if(workflow.status==='completed')return workflow;if(workflow.status==='cancelled')throw Error('Workflow cancelled');if(workflow.completed>=workflow.total){workflow.status='completed';return workflow;}
 const expression=workflow.expressions[workflow.completed];try{const result=plan({...workflow.settings,expression},compile,investigate);workflow.results.push({expression,result});}catch(err){workflow.errors.push({expression,error:String(err.message||err)});}
 workflow.completed++;workflow.status=workflow.completed===workflow.total?'completed':'running';return workflow;}
function summary(workflow){return {version:workflow.version,created:workflow.created,status:workflow.status,completed:workflow.completed,total:workflow.total,passed:workflow.results.length,failed:workflow.errors.length,results:workflow.results.map(x=>({expression:x.expression,conclusion:x.result.conclusion,stableCandidate:x.result.stableCandidate,supportedAcrossRounds:x.result.supportedAcrossRounds,averageNormalizedError:x.result.averageNormalizedError,nextExperiment:x.result.nextExperiment})),errors:workflow.errors,limitations:workflow.limitations};}
root.casResearchLabV631259={makeWorkflow,executeOne,summary};if(typeof document==='undefined')return;
const el=id=>document.getElementById(id),button=el('casLab59Run');if(!button)return;let active=null,timer=null;
function render(){el('casLab59Output').textContent=active?JSON.stringify(summary(active),null,2):'No workflow yet';}
button.addEventListener('click',()=>{try{if(timer)clearTimeout(timer);const planner=root.casResearchPlannerV631258?.plan,compile=root.casGraphV631227?.compile,investigate=root.casResearchV631256?.investigate;if(!planner||!compile||!investigate)throw Error('Required mathematical engines not loaded');active=makeWorkflow({expressions:el('casLab59Expressions').value,start:el('casLab59Start').value,end:el('casLab59End').value,count:el('casLab59Count').value,rounds:el('casLab59Rounds').value,tolerance:el('casLab59Tolerance').value,growth:el('casLab59Growth').value},planner,compile,investigate);render();function step(){if(active.status==='cancelled')return;executeOne(active,planner,compile,investigate);render();if(active.status==='running')timer=setTimeout(step,30);}timer=setTimeout(step,0);}catch(err){el('casLab59Output').textContent='Error: '+err.message;}});
el('casLab59Stop').addEventListener('click',()=>{if(timer)clearTimeout(timer);if(active){active.status='cancelled';render();}});
el('casLab59Export').addEventListener('click',()=>{if(!active)return;const blob=new Blob([JSON.stringify(active,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='cas-research-lab-v631-2-59.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
})(typeof window!=='undefined'?window:globalThis);
