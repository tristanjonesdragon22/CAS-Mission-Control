/* V631.2.10 bounded offline elementary symbolic calculus; no eval. */
(function(root){'use strict';
const previous=root.offlineIndependent;
function calculus(op,input,variable){
 const v=variable||'x';if(!/^[A-Za-z]$/.test(v))throw Error('Use one-letter variable');
 const s=input.replace(/\s+/g,'').replace(/−/g,'-').replace(/\*\*/g,'^');
 if(!s||s.length>500)throw Error('Expression empty or too long');
 // Recognize a linear argument a*x+b (including x, -x, x+b).
 const escaped=v.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const argRe=new RegExp('^([+-]?(?:(?:\\d+(?:\\.\\d*)?|\\.\\d+)\\*?)?)'+escaped+'([+-](?:\\d+(?:\\.\\d*)?|\\.\\d+))?$');
 function linear(arg){const m=arg.match(argRe);if(!m)throw Error('Supported function arguments are linear, such as 2*'+v+'+1');let a=m[1];a=(a===''||a==='+')?1:a==='-'?-1:Number(a.replace(/\*$/,''));if(!Number.isFinite(a)||a===0)throw Error('Invalid linear coefficient');return a}
 const match=s.match(/^(sin|cos|exp|ln|log|sqrt)\(([^()]*)\)$/);
 if(!match)throw Error('Supported elementary forms: sin(a*x+b), cos(a*x+b), exp(a*x+b), ln(a*x+b), sqrt(a*x+b)');
 const fn=match[1],arg=match[2],a=linear(arg);const coef=n=>String(Number(n.toPrecision(12)));
 if(op==='diff'){
  if(fn==='sin')return coef(a)+'*cos('+arg+')';
  if(fn==='cos')return coef(-a)+'*sin('+arg+')';
  if(fn==='exp')return coef(a)+'*exp('+arg+')';
  if(fn==='ln')return coef(a)+'/('+arg+')';
  if(fn==='log')return coef(a)+'/((ln(10))*('+arg+'))';
  if(fn==='sqrt')return coef(a)+'/(2*sqrt('+arg+'))';
 }
 if(op==='integrate'){
  if(fn==='sin')return coef(-1/a)+'*cos('+arg+') + C';
  if(fn==='cos')return coef(1/a)+'*sin('+arg+') + C';
  if(fn==='exp')return coef(1/a)+'*exp('+arg+') + C';
  if(fn==='ln')return '(('+arg+')*ln('+arg+')-('+arg+'))/'+coef(a)+' + C (real domain: '+arg+'>0)';
  if(fn==='sqrt')return coef(2/(3*a))+'*('+arg+')^(3/2) + C (real domain: '+arg+'>=0)';
  throw Error('Integration of log base 10 not yet supported');
 }
 throw Error('Unsupported operation');
}
root.casElementaryCalculus=calculus;
root.offlineIndependent=function(op,s,v){if(op==='diff'||op==='integrate'){try{return previous(op,s,v)}catch(e){return calculus(op,s,v)}}return previous(op,s,v)};
if(typeof module!=='undefined')module.exports={calculus};
})(typeof globalThis!=='undefined'?globalThis:this);
