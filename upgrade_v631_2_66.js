(function(root){'use strict';
const base=root.casSymbolicV631265||(typeof require==='function'?require('./symbolic_verification_v631_2_65.js'):null);
function fraction(c){return Number(c[0])/Number(c[1])}
function solve(expr){let p=base.parse(expr),a=p.map(fraction);if(a.length===1)return {kind:a[0]===0?'all real numbers':'no roots',roots:[]};if(a.length===2)return {kind:'linear',roots:[-a[0]/a[1]]};if(a.length===3){let d=a[1]*a[1]-4*a[2]*a[0];if(d<0)return {kind:'quadratic',discriminant:d,roots:[],complexRoots:[`${-a[1]/(2*a[2])} + ${Math.sqrt(-d)/(2*Math.abs(a[2]))}i`,`${-a[1]/(2*a[2])} - ${Math.sqrt(-d)/(2*Math.abs(a[2]))}i`]};return {kind:'quadratic',discriminant:d,roots:[(-a[1]+Math.sqrt(d))/(2*a[2]),(-a[1]-Math.sqrt(d))/(2*a[2])]}}return {kind:'unsupported',reason:'Exact coefficient parser supports higher degrees, but this root solver handles degrees 0–2 only.'}}
function factor(expr){let p=base.parse(expr);let roots=solve(expr);return {coefficients:p.map(([n,d],i)=>({power:i,coefficient:d===1n?String(n):`${n}/${d}`})),roots,explanation:'Numerical roots are approximations; no claim of exact symbolic factorization.'}}
const api={solve,factor,verify:(a,b)=>base.verify(a,b),differentiate:e=>base.derivative(e)};root.casMathV631266=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(typeof document==='undefined')return;const el=id=>document.getElementById(id);let btn=el('cas66Solve');if(btn)btn.onclick=()=>{try{el('cas66Result').textContent=JSON.stringify(factor(el('cas66Expression').value),null,2)}catch(e){el('cas66Result').textContent='Error: '+e.message}};
})(typeof window!=='undefined'?window:globalThis);
