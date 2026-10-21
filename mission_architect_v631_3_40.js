(function(root){'use strict';
const P=root.CASMissionPlanner339||(typeof require==='function'?require('./mission_planner_v631_3_39.js'):null);
const E=root.CASEngineering331||(typeof require==='function'?require('./engineering_core_v631_3_31.js'):null);
const C=root.CASConnectedEquations334||(typeof require==='function'?require('./connected_equations_v631_3_34.js'):null);
const VERSION='631.3.40';
function assert(v,m){if(!v)throw Error(m)}
function clone(v){return JSON.parse(JSON.stringify(v))}
function finite(v){return typeof v==='number'&&Number.isFinite(v)}
function plan(project){P.validate(project);const desc=project.description,domains=project.planning.domains;const suggestions=[];
 if(domains.includes('robotics')||/\b(vehicle|acceleration|force)\b/i.test(desc))suggestions.push({tool:'connected-equations',title:'Solve connected 1D motion equations',required:['mass (kg)','acceleration (m/s²)','duration (s)'],scope:'Idealized frictionless constant acceleration'});
 if(domains.includes('robotics')||domains.includes('space'))suggestions.push({tool:'engineering-simulation',title:'Simulate supported natural-language mission',required:['Supported mission description with mass, force and duration'],scope:'Predefined simulation models; no automatic physical validation'});
 return {version:VERSION,suggestions,questions:P.guide(project).questions,limitations:['Tool selection is deterministic and rule-based','Only supported models can be executed','Simulation results do not establish real-world safety or feasibility']}}
function run(project,request){P.validate(project);assert(request&&typeof request==='object','Provide an experiment request');let result,inputs,tool=request.tool;
 if(tool==='connected-equations'){
  assert(request.values&&typeof request.values==='object','Equation values required');const values=clone(request.values);assert(Object.values(values).every(finite),'Values must be finite');const equations=request.equations||['force','velocity','motion','kinetic'];assert(Array.isArray(equations)&&equations.length<=10,'Invalid equations');result=C.analyze({equations,values});inputs={equations,values};
 }else if(tool==='engineering-simulation'){
  const description=request.description||project.description;assert(typeof description==='string'&&description.length<10000,'Invalid description');const engineering=E.make(description);assert(engineering.mission,'Mission could not be constructed: '+engineering.issues.join('; '));const executed=E.execute(engineering);result={model:E.inspect(engineering),simulation:executed.result,verification:E.verify(engineering),issues:engineering.issues};inputs={description};
 }else throw Error('Unsupported engineering tool');
 const record={id:'eng-'+Date.now()+'-'+Math.floor(Math.random()*1e6),at:new Date().toISOString(),tool,inputs,result,limitations:['Model-specific calculation; inspect assumptions','Numerical results require independent validation before real-world use']};const next=clone(project);next.engineering=next.engineering||{version:VERSION,runs:[]};assert(Array.isArray(next.engineering.runs)&&next.engineering.runs.length<100,'Engineering history full');next.engineering.runs.push(record);next.history.push({at:record.at,action:'engineering-run',id:record.id});return {project:next,record};}
function attach(project,runId,taskId,notes){P.validate(project);assert(project.engineering&&Array.isArray(project.engineering.runs),'No engineering results');const r=project.engineering.runs.find(x=>x.id===runId);assert(r,'Unknown engineering run');assert(typeof notes==='string'&&notes.length<=2000,'Invalid notes');const task=project.tasks.find(x=>x.id===taskId);assert(task,'Unknown task');const next=clone(project),t=next.tasks.find(x=>x.id===taskId);t.evidence.push({type:'engineering-result',runId,tool:r.tool,notes,recorded:new Date().toISOString()});next.history.push({at:new Date().toISOString(),action:'attached-engineering-evidence',taskId,runId});return next}
function report(project){P.validate(project);return {version:VERSION,mission:P.guide(project),engineeringRuns:project.engineering?.runs||[],limitations:['Results from idealized mathematical models only','Human review required for acceptance and physical implementation']}}
const api={VERSION,plan,run,attach,report};if(typeof module==='object'&&module.exports)module.exports=api;root.CASMissionArchitect340=api;
})(typeof globalThis!=='undefined'?globalThis:this);
