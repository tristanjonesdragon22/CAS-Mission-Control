/* V631.2.9: polynomial expansion with bounded recursive descent; no eval. */
(function(root){'use strict';
const old=root.offlineIndependent;
function expand(input,variable){
 if(typeof input!=='string'||input.length>500)throw Error('Expression too long');
 if(!/^[a-zA-Z]$/.test(variable))throw Error('Use a single-letter variable');
 let s=input.replace(/\s/g,'').replace(/−/g,'-').replace(/\*\*/g,'^'),i=0;
 function skip(c){if(s[i]===c){i++;return true}return false}
 function add(a,b,sign=1){let r=new Map(a);for(const [k,v] of b)r.set(k,(r.get(k)||0)+sign*v);return r}
 function mul(a,b){let r=new Map();for(const [x,y] of a)for(const [u,v] of b){if(x+u>100)throw Error('Degree limit 100');r.set(x+u,(r.get(x+u)||0)+y*v)}return r}
 function atom(){if(skip('(')){let p=sum();if(!skip(')'))throw Error('Missing )');return p}if(s[i]===variable){i++;return new Map([[1,1]])}let m=s.slice(i).match(/^(?:\d+(?:\.\d*)?|\.\d+)/);if(!m)throw Error('Expected a number, variable or ( at '+i);i+=m[0].length;return new Map([[0,Number(m[0])]])}
 function pow(){let p=atom();if(skip('^')){let m=s.slice(i).match(/^\d+/);if(!m)throw Error('Expected integer exponent');i+=m[0].length;let n=Number(m[0]);if(n>100)throw Error('Exponent limit 100');let r=new Map([[0,1]]);for(let k=0;k<n;k++)r=mul(r,p);return r}return p}
 function signed(){if(skip('+'))return signed();if(skip('-'))return mul(new Map([[0,-1]]),signed());return pow()}
 function product(){let r=signed();while(skip('*'))r=mul(r,signed());return r}
 function sum(){let r=product();while(i<s.length&&(s[i]==='+'||s[i]==='-')){let sign=s[i++]==='+'?1:-1;r=add(r,product(),sign)}return r}
 let p=sum();if(i!==s.length)throw Error('Unexpected character at '+i);
 let entries=[...p].filter(([,c])=>Math.abs(c)>1e-11).sort((a,b)=>b[0]-a[0]);if(!entries.length)return '0';
 return entries.map(([n,c],idx)=>{let sign=c<0?'-':idx?'+':'';let a=Number(Math.abs(c).toPrecision(12));return sign+(n===0?String(a):(a===1?'':a+'*')+variable+(n===1?'':'^'+n))}).join(' ');
}
root.casExpandPolynomial=expand;
root.offlineIndependent=function(op,s,v){if(op==='expand')return expand(s,v||'x');return old(op,s,v)};
if(typeof module!=='undefined')module.exports={expand,offlineIndependent:root.offlineIndependent};
})(typeof globalThis!=='undefined'?globalThis:this);
