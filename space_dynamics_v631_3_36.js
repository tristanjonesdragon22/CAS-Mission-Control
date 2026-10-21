(function(root){'use strict';
const P=typeof module==='object'&&module.exports?require('./physics_3d_v631_3_35.js'):root.CASPhysics335;
const G0=9.80665;
function finite(x,n){if(typeof x!=='number'||!Number.isFinite(x))throw Error(n+' must be finite');return x}
function pos(x,n){finite(x,n);if(x<=0)throw Error(n+' must be positive');return x}
function vec(x,n){return P.vector(x,n)}
function add(a,b){return a.map((x,i)=>x+b[i])}
function mul(a,s){return a.map(x=>x*s)}
function norm(a){return P.norm(a)}
function rk4(f,t,y,h){let a=f(t,y),b=f(t+h/2,add(y,mul(a,h/2))),c=f(t+h/2,add(y,mul(b,h/2))),d=f(t+h,add(y,mul(c,h)));return y.map((v,i)=>v+h*(a[i]+2*b[i]+2*c[i]+d[i])/6)}
function simulate(o){o=o||{};let body=String(o.body??'earth').toLowerCase();if(!Object.hasOwn(P.mu,body))throw Error('Unknown body');let mu=P.mu[body],radius=P.radii[body],alt=pos(o.altitude_m??400000,'altitude_m'),r0=radius+alt;
let r=vec(o.position_m??[r0,0,0],'position_m'),v=vec(o.velocity_m_s??[0,Math.sqrt(mu/r0),0],'velocity_m_s');if(norm(r)<=radius)throw Error('Initial collision');
let mass=pos(o.initial_mass_kg??1000,'initial_mass_kg'),dry=pos(o.dry_mass_kg??600,'dry_mass_kg');if(dry>mass)throw Error('Dry mass exceeds initial mass');
let duration=pos(o.duration_s??120,'duration_s'),steps=o.steps??300;if(!Number.isInteger(steps)||steps<2||steps>10000)throw Error('steps must be 2..10000');
let burns=(o.burns??[]).map((b,i)=>{let start=finite(b.start_s,'burn start'),end=finite(b.end_s,'burn end'),thrust=pos(b.thrust_N,'thrust_N'),isp=pos(b.isp_s,'isp_s'),direction=vec(b.direction??[0,1,0],'direction'),n=norm(direction);if(start<0||end<=start||end>duration||n===0)throw Error('Invalid burn window or direction');return {start_s:start,end_s:end,thrust_N:thrust,isp_s:isp,direction:mul(direction,1/n)}});if(burns.length>16)throw Error('Too many burns');
let others=(o.perturbers??[]).map(p=>{let m=pos(p.mu_m3_s2,'perturber mu'),p0=vec(p.position_m,'perturber position'),vel=vec(p.velocity_m_s??[0,0,0],'perturber velocity');return {mu:m,position:p0,velocity:vel}});if(others.length>8)throw Error('Too many perturbers');
// Burn boundaries are split exactly to avoid RK4 integrating across discontinuous thrust windows.
let boundaries=[0,duration,...burns.flatMap(b=>[b.start_s,b.end_s])].sort((a,b)=>a-b).filter((x,i,a)=>i===0||x>a[i-1]);
let y=[...r,...v,mass],hist=[{t_s:0,position_m:r,velocity_m_s:v,mass_kg:mass,altitude_m:norm(r)-radius}],maxSteps=steps+2*burns.length+2,used=0;
function deriv(t,s,active){let rr=s.slice(0,3),vv=s.slice(3,6),m=s[6],d=norm(rr);if(d<=radius||m<dry-1e-5)throw Error('Impact or exhausted fuel');let acc=mul(rr,-mu/d**3),flow=0;
for(let p of others){let delta=add(add(p.position,mul(p.velocity,t)),mul(rr,-1)),dist=norm(delta);if(dist<1)throw Error('Perturber singularity');acc=add(acc,mul(delta,p.mu/dist**3))}
for(let b of active){acc=add(acc,mul(b.direction,b.thrust_N/m));flow+=b.thrust_N/(b.isp_s*G0)}return [...vv,...acc,-flow]}
for(let j=0;j<boundaries.length-1;j++){let a=boundaries[j],b=boundaries[j+1],mid=(a+b)/2,active=burns.filter(q=>q.start_s<=mid&&q.end_s>=mid),flow=active.reduce((s,q)=>s+q.thrust_N/(q.isp_s*G0),0),n=Math.max(1,Math.ceil((b-a)/duration*steps));if(used+n>maxSteps)throw Error('Step limit');let h=(b-a)/n;
// A constant-flow segment is allowed only when the propellant is sufficient for the entire segment.
if(y[6]-flow*(b-a)<dry-1e-8)throw Error('Insufficient propellant for burn');
for(let k=0;k<n;k++){let t=a+k*h;y=rk4((time,state)=>deriv(time,state,active),t,y,h);if(y.some(x=>!Number.isFinite(x)))throw Error('Numerical divergence');let rr=y.slice(0,3);if(norm(rr)<=radius)throw Error('Central body impact');let time=a+(k+1)*h;hist.push({t_s:time,position_m:rr,velocity_m_s:y.slice(3,6),mass_kg:y[6],altitude_m:norm(rr)-radius});used++}}let first=hist[0],last=hist.at(-1),fuel=first.mass_kg-last.mass_kg,impulse=burns.reduce((s,b)=>s+b.thrust_N*(b.end_s-b.start_s),0);
return {model:'3D powered two-body spacecraft with prescribed moving perturbers',body,assumptions:['Newtonian point-mass gravity','Prescribed straight-line perturber positions (not self-consistent N-body)','Fixed inertial thrust direction for each burn','Constant thrust and Isp per burn','No atmosphere or attitude dynamics','Burns cannot consume below dry mass'],history:hist,final:last,diagnostics:{fuel_used_kg:fuel,remaining_propellant_kg:last.mass_kg-dry,total_commanded_impulse_N_s:impulse,steps:used,perturbers:others.length,burns:burns.length}}}
function optimize(o,search){search=search||{};let min=pos(search.min_thrust_N,'min_thrust_N'),max=pos(search.max_thrust_N,'max_thrust_N'),target=pos(search.target_altitude_m,'target_altitude_m'),count=search.samples??9;if(max<min||!Number.isInteger(count)||count<2||count>40)throw Error('Invalid search range');if(!o||!Array.isArray(o.burns)||o.burns.length===0)throw Error('At least one burn required');let trials=[],best=null;for(let i=0;i<count;i++){let thrust=min+(max-min)*i/(count-1);try{let burns=o.burns.map((b,j)=>j===0?{...b,thrust_N:thrust}:b),res=simulate({...o,burns}),error=Math.abs(res.final.altitude_m-target),trial={thrust_N:thrust,final_altitude_m:res.final.altitude_m,error_m:error,fuel_used_kg:res.diagnostics.fuel_used_kg};trials.push(trial);if(!best||error<best.error_m)best=trial}catch(e){trials.push({thrust_N:thrust,error:e.message})}}return {target_altitude_m:target,best,trials,method:'bounded grid search over first burn thrust; not global optimum'}}
const api={simulate,optimize};if(typeof module==='object'&&module.exports)module.exports=api;root.CASSpaceDynamics336=api;
})(typeof globalThis!=='undefined'?globalThis:this);
