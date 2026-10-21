(function(root){'use strict';
// Exact polynomial arithmetic with rational BigInt coefficients; no eval.
const gcd=(a,b)=>{a=a<0n?-a:a;b=b<0n?-b:b;while(b){let t=a%b;a=b;b=t;}return a||1n};
function rat(n,d=1n){if(!d)throw Error('Division by zero');if(d<0n){n=-n;d=-d}let g=gcd(n,d);return [n/g,d/g]}
const add=(a,b)=>rat(a[0]*b[1]+b[0]*a[1],a[1]*b[1]);
const mul=(a,b)=>rat(a[0]*b[0],a[1]*b[1]);
const neg=a=>[-a[0],a[1]];
function number(s){let negSign=s[0]==='-';if(negSign)s=s.slice(1);let [whole,frac='']=s.split('.');let n=BigInt((whole||'0')+frac),d=10n**BigInt(frac.length);return rat(negSign?-n:n,d)}
const trim=p=>{while(p.length>1&&p.at(-1)[0]===0n)p.pop();return p};
function plus(a,b){let out=[];for(let i=0;i<Math.max(a.length,b.length);i++)out.push(add(a[i]||[0n,1n],b[i]||[0n,1n]));return trim(out)}
function times(a,b){if(a.length+b.length>34)throw Error('Polynomial degree limit is 32');let out=Array.from({length:a.length+b.length-1},()=>[0n,1n]);for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)out[i+j]=add(out[i+j],mul(a[i],b[j]));return trim(out)}
function parse(source){if(typeof source!=='string'||source.length>350)throw Error('Expression must be 350 characters or fewer');let tokens=source.replace(/\s+/g,'').match(/(?:\d+(?:\.\d*)?|\.\d+)|[a-zA-Z]+|[()+*^/\-]/g)||[];if(tokens.join('')!==source.replace(/\s+/g,''))throw Error('Unsupported character');let i=0;const peek=()=>tokens[i],take=()=>tokens[i++];function primary(){if(peek()==='('){take();let v=expr();if(take()!==')')throw Error('Expected )');return v}let t=take();if(t==='x')return [[0n,1n],[1n,1n]];if(t&&/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(t))return [number(t)];throw Error('Only rational polynomials in x are supported')}
function power(){let v=primary();if(peek()==='^'){take();let e=take();if(!/^\d+$/.test(e||'')||Number(e)>32)throw Error('Exponent must be integer 0–32');let n=Number(e),out=[[1n,1n]];for(let j=0;j<n;j++)out=times(out,v);return out}return v}
function unary(){if(peek()==='+'){take();return unary()}if(peek()==='-'){take();return times([[-1n,1n]],unary())}return power()}
function term(){let v=unary();while(peek()==='*'||peek()==='/'){let op=take(),b=unary();if(op==='*')v=times(v,b);else{if(b.length!==1||b[0][0]===0n)throw Error('Division by a variable or zero is not supported');v=times(v,[rat(b[0][1],b[0][0])])}}return v}
function expr(){let v=term();while(peek()==='+'||peek()==='-'){let op=take(),b=term();v=plus(v,op==='-'?times([[-1n,1n]],b):b)}return v}
let out=expr();if(i!==tokens.length)throw Error('Unexpected token: '+peek());return out}
function stringify(p){return p.map(([n,d],i)=>({power:i,coefficient:d===1n?String(n):String(n)+'/'+String(d)}))}
function verify(left,right){try{let a=parse(left),b=parse(right),delta=plus(a,times([[-1n,1n]],b));let equal=delta.length===1&&delta[0][0]===0n;return {verdict:equal?'PROVEN equivalent (rational polynomials)':'PROVEN not equivalent (rational polynomials)',method:'Exact rational polynomial coefficient comparison',leftCoefficients:stringify(a),rightCoefficients:stringify(b),differenceCoefficients:stringify(delta),scope:'Only rational polynomial expressions in x, using +, -, *, constant division, and nonnegative integer powers.'}}catch(e){return {verdict:'UNSUPPORTED — no symbolic conclusion',reason:String(e.message),scope:'Try the V631.2.64 numerical tester for non-polynomial functions; numerical agreement is not proof.'}}}
function derivative(expression){let p=parse(expression),d=p.length===1?[[0n,1n]]:p.slice(1).map((c,i)=>mul(c,[BigInt(i+1),1n]));return {method:'Exact polynomial differentiation',coefficients:stringify(trim(d))}}
const api={verify,derivative,parse};root.casSymbolicV631265=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(typeof document==='undefined')return;const el=id=>document.getElementById(id),button=el('casSymbolic65Verify');if(!button)return;button.addEventListener('click',()=>{let r=verify(el('casSymbolic65Left').value,el('casSymbolic65Right').value);el('casSymbolic65Output').textContent=JSON.stringify(r,null,2)});el('casSymbolic65Derivative').addEventListener('click',()=>{try{el('casSymbolic65Output').textContent=JSON.stringify(derivative(el('casSymbolic65Left').value),null,2)}catch(e){el('casSymbolic65Output').textContent=e.message}});
})(typeof window!=='undefined'?window:globalThis);
