/* CAS V631.2.23: 3D vectors and polynomial triple integration. */
(function(root){'use strict';
const poly=root.casMultivariableCalculusV631221;
if(!poly)throw Error('Multivariable calculus engine required');
function vector(value){let a=Array.isArray(value)?value:String(value).split(',');if(a.length!==3)throw Error('Enter exactly three comma-separated components');return a.map(x=>{let n=Number(String(x).trim());if(!Number.isFinite(n))throw Error('Vector components must be finite numbers');return n})}
function fmt(n){return Number(n.toPrecision(12))}
function dot(a,b){a=vector(a);b=vector(b);return a.reduce((s,v,i)=>s+v*b[i],0)}
function cross(a,b){a=vector(a);b=vector(b);return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]].map(fmt)}
function magnitude(a){return Math.hypot(...vector(a))}
function normalize(a){a=vector(a);let m=Math.hypot(...a);if(m===0)throw Error('Zero vector cannot be normalized');return a.map(v=>fmt(v/m))}
function tripleIntegral(expression,bounds){if(!Array.isArray(bounds)||bounds.length!==3)throw Error('Specify [[xlow,xhigh],[ylow,yhigh],[zlow,zhigh]]');let b=bounds.map(pair=>{if(!Array.isArray(pair)||pair.length!==2)throw Error('Each axis needs two bounds');let x=pair.map(Number);if(x.some(n=>!Number.isFinite(n)))throw Error('Bounds must be finite');return x});let sum=0;for(let [key,coef] of Object.entries(poly.parse(String(expression)))){let ex=key.split(',').map(Number);let term=coef;for(let i=0;i<3;i++){let n=ex[i]+1;term*=(Math.pow(b[i][1],n)-Math.pow(b[i][0],n))/n}sum+=term}if(!Number.isFinite(sum))throw Error('Integral overflow');return fmt(sum)}
const api={vector,dot,cross,magnitude,normalize,tripleIntegral};root.casVector3DV631223=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
