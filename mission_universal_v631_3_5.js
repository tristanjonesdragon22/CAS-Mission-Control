(function(root){'use strict';
const old=root.CASMissionReasoning304;
function num(t,key,def){const m=t.match(new RegExp('(?:'+key+')\\s*(?:of|=|:)?\\s*(-?\\d+(?:\\.\\d+)?)','i'));return m?Number(m[1]):def;}
function interpret(description){const t=String(description).toLowerCase();let kind;
if(/projectile|launch angle|ballistic/.test(t))kind='projectile';
else if(/spring|oscillat|harmonic/.test(t))kind='spring';
else if(/pendulum/.test(t))kind='pendulum';
else if(/robot|vehicle|cart|accelerat|force|motion/.test(t))kind='linear';
else throw Error('Unsupported mission. Try robot, projectile, spring, or pendulum.');
const p={kind,description};
if(kind==='linear'){const m=old.parse(description);Object.assign(p,m);p.friction=num(t,'friction(?: coefficient)?|mu',0);if(p.friction<0)throw Error('Friction must be nonnegative');}
if(kind==='projectile'){p.speed=num(t,'speed|velocity',20);p.angle=num(t,'angle',45);p.gravity=num(t,'gravity|g',9.80665);p.height=num(t,'height',0);if(p.speed<0||p.gravity<=0||p.height<0)throw Error('Invalid projectile inputs');}
if(kind==='spring'){p.mass=num(t,'mass',1);p.k=num(t,'stiffness|spring constant|k',10);p.amplitude=num(t,'amplitude',1);p.damping=num(t,'damping',0);if(p.mass<=0||p.k<=0||p.damping<0)throw Error('Invalid spring inputs');}
if(kind==='pendulum'){p.length=num(t,'length',1);p.gravity=num(t,'gravity|g',9.80665);p.angle=num(t,'angle',10);if(p.length<=0||p.gravity<=0||Math.abs(p.angle)>20)throw Error('Small-angle pendulum requires |angle| <= 20 degrees');}
return p;}
function simulate(desc){const p=typeof desc==='string'?interpret(desc):desc;let results,assumptions,equations;
if(p.kind==='linear'){const acceleration=(p.force-p.friction*p.mass*9.80665)/p.mass;const v=acceleration*p.time;const distance=.5*acceleration*p.time*p.time;results={acceleration_m_s2:acceleration,velocity_m_s:v,distance_m:distance,target_error_m:Math.abs(distance-p.target)};equations=['a=(F-mu*m*g)/m','v=a*t','x=0.5*a*t^2'];assumptions=['Constant force and friction','One-dimensional motion','Starts from rest','No aerodynamic drag'];}
else if(p.kind==='projectile'){const theta=p.angle*Math.PI/180,vx=p.speed*Math.cos(theta),vy=p.speed*Math.sin(theta),flight=(vy+Math.sqrt(vy*vy+2*p.gravity*p.height))/p.gravity;results={flight_time_s:flight,range_m:vx*flight,max_height_m:p.height+vy*vy/(2*p.gravity)};equations=['x=v*cos(theta)*t','y=h+v*sin(theta)*t-0.5*g*t^2'];assumptions=['Flat ground','Constant gravity','No air resistance'];}
else if(p.kind==='spring'){const omega=Math.sqrt(p.k/p.mass),zeta=p.damping/(2*Math.sqrt(p.k*p.mass));results={natural_angular_frequency_rad_s:omega,undamped_period_s:2*Math.PI/omega,damping_ratio:zeta,initial_energy_J:.5*p.k*p.amplitude*p.amplitude};equations=['omega=sqrt(k/m)','zeta=c/(2*sqrt(k*m))','E=0.5*k*A^2'];assumptions=['Linear Hooke law','Lumped mass'];}
else if(p.kind==='pendulum'){results={small_angle_period_s:2*Math.PI*Math.sqrt(p.length/p.gravity),initial_angle_rad:p.angle*Math.PI/180};equations=['T=2*pi*sqrt(L/g)'];assumptions=['Small-angle approximation','No damping'];}
else throw Error('Unsupported model');
for(const x of Object.values(results))if(!Number.isFinite(x))throw Error('Nonfinite result');return {model:p.kind,parameters:p,equations,assumptions,results,limitations:'Idealized educational model; not validated for safety-critical mission design.'};}
function optimize(desc,options){const p=interpret(desc);if(p.kind!=='linear')throw Error('Optimization currently supports linear missions only');const o=options||{},target=Number(o.target===undefined?p.target:o.target),forceRange=o.forceRange||[Math.max(0,p.force*.25),Math.max(1,p.force*1.75)],massRange=o.massRange||[p.mass*.75,p.mass*1.25],n=Math.min(41,Math.max(2,Math.floor(o.steps||11)));if(!(target>=0&&forceRange[0]>=0&&forceRange[1]>=forceRange[0]&&massRange[0]>0&&massRange[1]>=massRange[0]))throw Error('Invalid optimization bounds');let best=null,count=0;for(let i=0;i<n;i++)for(let j=0;j<n;j++){const q={...p,force:forceRange[0]+(forceRange[1]-forceRange[0])*i/(n-1),mass:massRange[0]+(massRange[1]-massRange[0])*j/(n-1)};const r=simulate(q);const error=Math.abs(r.results.distance_m-target);count++;if(!best||error<best.error_m)best={force_N:q.force,mass_kg:q.mass,distance_m:r.results.distance_m,error_m:error};}return {best,trials:count,objective:'Minimize absolute distance error',method:'Bounded two-variable grid search; not a global optimum',target_m:target};}
root.CASUniversalMission305={interpret,simulate,optimize};if(typeof module!=='undefined')module.exports=root.CASUniversalMission305;
})(typeof globalThis!=='undefined'?globalThis:this);
