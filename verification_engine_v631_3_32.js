(function(root){'use strict';
const P=root.CASPhysics329||(typeof require==='function'?require('./physics_engine_v631_3_29.js'):null);
const E=root.CASEngineering331||(typeof require==='function'?require('./engineering_core_v631_3_31.js'):null);
function check(v,m){if(!v)throw Error(m)}
function finite(x){return typeof x==='number'&&Number.isFinite(x)}
const units={m:{m:1},s:{s:1},kg:{kg:1},N:{kg:1,m:1,s:-2},J:{kg:1,m:2,s:-2},'m/s':{m:1,s:-1},'m/s^2':{m:1,s:-2},'N/s':{kg:1,m:1,s:-3}};
function unitExpression(s){check(typeof s==='string'&&s.length<=60,'Invalid unit');if(units[s])return {...units[s]};let dims={};let matches=[...s.matchAll(/([*/]?)(kg|m|s|N|J)(?:\^(-?\d+))?/g)];check(matches.length>0&&matches.map(x=>x[0]).join('')===s,'Unsupported unit expression');for(const x of matches){const factor=units[x[2]],power=(x[1]==='/'?-1:1)*Number(x[3]||1);check(Math.abs(power)<=8,'Exponent out of range');for(const [k,v] of Object.entries(factor))dims[k]=(dims[k]||0)+v*power}return Object.fromEntries(Object.entries(dims).filter(([,v])=>v!==0))}
function compatible(a,b){return JSON.stringify(Object.entries(unitExpression(a)).sort())===JSON.stringify(Object.entries(unitExpression(b)).sort())}
function dimensionalChecks(){return [{equation:'F = m*a',left:'N',right:'kg*m/s^2',pass:compatible('N','kg*m/s^2')},{equation:'x = v*t',left:'m',right:'m/s*s',pass:compatible('m','m/s*s')},{equation:'E = 0.5*m*v^2',left:'J',right:'kg*m^2/s^2',pass:compatible('J','kg*m^2/s^2')} ]}
function tolerance(a,b,abs=1e-6,rel=1e-5){return Math.abs(a-b)<=abs+rel*Math.max(Math.abs(a),Math.abs(b))}
function verifyPhysics(kind,params){check(['robot','orbit'].includes(kind),'Unsupported physics model');check(params&&typeof params==='object','Parameters required');const p={...params},r=kind==='robot'?P.robot(p):P.orbit(p),conv=P.convergence(kind,p),checks=[];
if(kind==='robot'){
 const constant=(p.force_rate_N_s??0)===0&&(p.linear_drag_N_per_m_s??0)===0;
 if(constant){const expected=(p.position_m??0)+(p.velocity_m_s??0)*p.duration_s+(p.force_N??0)*p.duration_s**2/(2*p.mass_kg);checks.push({name:'Independent constant-force analytic endpoint',pass:tolerance(r.final[0],expected),expected,observed:r.final[0],units:'m'})}
 else checks.push({name:'Analytical benchmark',pass:null,reason:'Not applicable to variable force or drag'});
 const hist=r.history;checks.push({name:'Finite trajectory states',pass:hist.every(q=>finite(q.position_m)&&finite(q.velocity_m_s))});
 }else{
 const h=r.history,first=h[0],last=h[h.length-1],energy=Math.abs((last.specific_energy_J_kg-first.specific_energy_J_kg)/first.specific_energy_J_kg),angular=Math.abs((last.specific_angular_momentum_m2_s-first.specific_angular_momentum_m2_s)/first.specific_angular_momentum_m2_s);
 checks.push({name:'Two-body specific energy drift < 0.1%',pass:energy<0.001,observed:energy});checks.push({name:'Two-body angular momentum drift < 0.1%',pass:angular<0.001,observed:angular});
 const v0=p.initial_speed_m_s??r.circular_speed_m_s;if(tolerance(v0,r.circular_speed_m_s,1e-9,1e-10)){const r0=P.constants.RADII[r.body]+p.altitude_m,period=2*Math.PI*Math.sqrt(r0**3/P.constants.MU[r.body]);checks.push({name:'Circular-orbit radius stability < 0.1%',pass:h.every(q=>Math.abs(Math.hypot(q.x_m,q.y_m)-r0)/r0<0.001),period_s:period})}
 }
 const scale=kind==='robot'?Math.max(1,Math.abs(r.final[0])):Math.max(1,Math.hypot(r.final.x_m,r.final.y_m));const diff=conv.endpoint_difference_m;checks.push({name:'Step-halving endpoint difference < 0.01% scale',pass:diff/scale<1e-4,observed_difference_m:diff,relative_difference:diff/scale,coarse_steps:conv.coarse_steps,fine_steps:conv.fine_steps});
 return {version:'631.3.32',kind,checks,passed:checks.filter(x=>x.pass===true).length,failed:checks.filter(x=>x.pass===false).length,not_applicable:checks.filter(x=>x.pass===null).length,assumptions:r.assumptions,scope:'Numerical and analytical checks of idealized models only. Not a guarantee of real-world predictive accuracy.'}
}
function report(project){E.validate(project);const checks=dimensionalChecks();let physics=null;if(project.mode==='physics')physics=verifyPhysics(project.physics.kind,project.physics.params);else{const units=E.verify(project);return {version:'631.3.32',mode:'mission',dimensional_equation_checks:checks,existing_unit_validation:units,scope:'Equation identity examples and existing stage-schema checks; not full symbolic verification or independent physics validation'}}return {version:'631.3.32',mode:'physics',dimensional_equation_checks:checks,physics,verified_at:new Date().toISOString()}}
root.CASVerification332={unitExpression,compatible,dimensionalChecks,verifyPhysics,report};if(typeof module!=='undefined')module.exports=root.CASVerification332;
})(typeof globalThis!=='undefined'?globalThis:this);
