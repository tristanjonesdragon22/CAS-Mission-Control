/* CAS V631.2.21 offline multivariable polynomial calculus. No eval. */
(function(root){'use strict';
function parse(input){let s=input.replace(/\s+/g,'').replace(/−/g,'-');if(!s||s.length>1000)throw Error('Enter a polynomial under 1000 characters');let i=0,terms={};
function add(a,b,k=1){let c={...a};for(let key in b)c[key]=(c[key]||0)+k*b[key];return clean(c)}
function clean(a){for(let k in a)if(Math.abs(a[k])<1e-12)delete a[k];return a}
function mul(a,b){let c={};for(let ka in a)for(let kb in b){let e=ka.split(',').map(Number).map((v,i)=>v+Number(kb.split(',')[i]));if(e.some(v=>v>20)||e.reduce((x,y)=>x+y,0)>20)throw Error('Maximum total degree is 20');let key=e.join(',');c[key]=(c[key]||0)+a[ka]*b[kb]}return clean(c)}
function atom(){if(s[i]==='('){i++;let a=expr();if(s[i++]!==')')throw Error('Missing closing parenthesis');return a}let v=s[i];if(/[xyz]/.test(v||'')&&v){i++;let a={};a[({x:'1,0,0',y:'0,1,0',z:'0,0,1'})[v]]=1;return a}let m=s.slice(i).match(/^(?:\d+(?:\.\d*)?|\.\d+)/);if(!m)throw Error('Invalid token at '+(i+1));i+=m[0].length;return {'0,0,0':Number(m[0])}}
function power(){let a=atom();if(s[i]==='^'){i++;let m=s.slice(i).match(/^\d+/);if(!m)throw Error('Exponent must be a nonnegative integer');i+=m[0].length;let n=Number(m[0]);if(n>20)throw Error('Maximum exponent is 20');let r={'0,0,0':1};for(let j=0;j<n;j++)r=mul(r,a);return r}return a}
function factor(){if(s[i]==='+'){i++;return factor()}if(s[i]==='-'){i++;return mul({'0,0,0':-1},factor())}return power()}
function term(){let a=factor();while(s[i]==='*'){i++;a=mul(a,factor())}return a}
function expr(){let a=term();while(s[i]==='+'||s[i]==='-'){let op=s[i++];a=add(a,term(),op==='+'?1:-1)}return a}
let a=expr();if(i!==s.length)throw Error('Unexpected token at '+(i+1)+'; use * for multiplication');return a}
function fmt(n){return String(Number(n.toPrecision(12)))}
function show(a){let entries=Object.entries(a).filter(([,c])=>Math.abs(c)>1e-12).sort((a,b)=>{let x=a[0].split(',').map(Number),y=b[0].split(',').map(Number);return y.reduce((s,v)=>s+v,0)-x.reduce((s,v)=>s+v,0)||y[0]-x[0]||y[1]-x[1]||y[2]-x[2]});if(!entries.length)return '0';return entries.map(([key,c],i)=>{let e=key.split(',').map(Number),v=e.map((n,j)=>n?('xyz'[j]+(n===1?'':'^'+n)):'').filter(Boolean).join('*');let sign=c<0?'-':(i?'+':'');let mag=Math.abs(c),coeff=v&&Math.abs(mag-1)<1e-12?'':fmt(mag);return sign+coeff+(coeff&&v?'*':'')+v}).join('')}
function derivative(s,v){if(!'xyz'.includes(v)||v.length!==1)throw Error('Variable must be x, y or z');let a=parse(s),b={},idx='xyz'.indexOf(v);for(let [k,c] of Object.entries(a)){let e=k.split(',').map(Number);if(e[idx]){let n=e[idx];e[idx]--;let key=e.join(',');b[key]=(b[key]||0)+c*n}}return show(b)}
function gradient(s){return ['x','y','z'].map(v=>'∂/∂'+v+': '+derivative(s,v)).join('\n')}
function evaluate(s,values){let a=parse(s),sum=0;for(let [k,c] of Object.entries(a)){let ex=k.split(',').map(Number);sum+=c*ex.reduce((p,n,i)=>p*Math.pow(values['xyz'[i]]||0,n),1)}return sum}
function verify(s,v,point){let h=1e-5*Math.max(1,Math.abs(point[v]||0)),left={...point,[v]:(point[v]||0)-h},right={...point,[v]:(point[v]||0)+h};let numerical=(evaluate(s,right)-evaluate(s,left))/(2*h),symbolic=evaluate(derivative(s,v),point),tol=1e-5*Math.max(1,Math.abs(numerical),Math.abs(symbolic));return {symbolic,numerical,passed:Math.abs(symbolic-numerical)<=tol}}
root.casMultivariableCalculusV631221={parse,derivative,gradient,evaluate,verify};if(typeof module!=='undefined')module.exports=root.casMultivariableCalculusV631221;
})(typeof globalThis!=='undefined'?globalThis:this);
