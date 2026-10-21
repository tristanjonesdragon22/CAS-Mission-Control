(function(root){'use strict';
const G=6.67430e-11,TAU=2*Math.PI;
function positive(x,label){if(!Number.isFinite(x)||x<=0)throw Error(label+' must be positive and finite');return x}
function vector(v,label){if(!Array.isArray(v)||v.length!==3||v.some(x=>!Number.isFinite(x)))throw Error(label+' must be a finite 3-vector');return v}
function dot(a,b){return a.reduce((s,x,i)=>s+x*b[i],0)}
function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]}
function norm(a){return Math.hypot(...a)}
function circularSpeed(m,r){return Math.sqrt(G*positive(m,'mass')/positive(r,'radius'))}
function escapeSpeed(m,r){return Math.sqrt(2*G*positive(m,'mass')/positive(r,'radius'))}
function orbitalPeriod(m,a){return TAU*Math.sqrt(positive(a,'semimajor axis')**3/(G*positive(m,'mass')))}
function potential(m,r){return -G*positive(m,'mass')/positive(r,'radius')}
function elements(m,r,v){positive(m,'central mass');vector(r,'position');vector(v,'velocity');let R=norm(r);positive(R,'position magnitude');let mu=G*m,V2=dot(v,v),h=cross(r,v),H=norm(h);if(H<1e-15*R*Math.max(1,norm(v)))throw Error('Radial trajectory: orbital plane undefined');let ev=cross(v,h).map((x,i)=>x/mu-r[i]/R),e=norm(ev),specificEnergy=V2/2-mu/R,semiMajorAxis=Math.abs(specificEnergy)<1e-14*mu/R?null:-mu/(2*specificEnergy),inclination=Math.acos(Math.max(-1,Math.min(1,h[2]/H)));let periapsis=H*H/(mu*(1+e)),apoapsis=e<1?H*H/(mu*(1-e)):null;return {eccentricity:e,semiMajorAxis,periapsis,apoapsis,inclinationRadians:inclination,specificEnergy,specificAngularMomentum:H,classification:e<1-1e-8?'elliptic':e>1+1e-8?'hyperbolic':'near-parabolic',periodSeconds:semiMajorAxis>0&&e<1?TAU*Math.sqrt(semiMajorAxis**3/mu):null}}
root.casOrbitalV631232={G,circularSpeed,escapeSpeed,orbitalPeriod,potential,elements};
if(typeof document==='undefined')return;let btn=document.getElementById('casOrbitalAnalyze');if(!btn)return;btn.addEventListener('click',()=>{let output=document.getElementById('casOrbitalResult');try{let data=JSON.parse(document.getElementById('casOrbitalInput').value),m=data.centralMass,r=data.position,v=data.velocity,orb=elements(m,r,v),radius=norm(r);output.textContent=JSON.stringify({orbit:orb,circularSpeedMS:circularSpeed(m,radius),escapeSpeedMS:escapeSpeed(m,radius),potentialJPerKg:potential(m,radius)},null,2)}catch(e){output.textContent='Error: '+e.message}})
})(typeof window!=='undefined'?window:globalThis);
