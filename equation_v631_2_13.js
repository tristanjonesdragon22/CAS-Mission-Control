/* CAS V631.2.13 bounded offline equation solver; no eval. */
(function(root){'use strict';
function solve(input,variable='x'){
 if(typeof input!=='string'||input.length>600)throw Error('Equation too long');
 if(!/^[a-zA-Z]$/.test(variable))throw Error('Variable must be one letter');
 let s=input.replace(/\s+/g,'').replace(/−/g,'-').replace(/²/g,'^2').replace(/³/g,'^3');
 if(!/^[0-9a-zA-Z.+*^()=\/-]+$/.test(s))throw Error('Unsupported characters');
 if((s.match(/=/g)||[]).length!==1)throw Error('Enter exactly one = sign');
 let parts=s.split('=');
 function parse(source){let i=0,depth=0;const peek=()=>source[i];
 const add=(a,b,k=1)=>{let c=a.map((v,j)=>v+k*b[j]);if(c.some(v=>!Number.isFinite(v)))throw Error('Overflow');return c};
 const mul=(a,b)=>{let c=[0,0,0];for(let j=0;j<3;j++)for(let k=0;k<3;k++)if(a[j]&&b[k]){if(j+k>2)throw Error('Only quadratic equations supported');c[j+k]+=a[j]*b[k]}return c};
 function atom(){if(++depth>80)throw Error('Expression nesting too deep');let r;if(peek()==='+'){i++;r=atom()}else if(peek()==='-'){i++;r=atom().map(x=>-x)}else if(peek()==='('){i++;r=expr();if(peek()!==')')throw Error('Missing )');i++}else if(peek()===variable){i++;r=[0,1,0]}else{let m=source.slice(i).match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/);if(!m)throw Error('Unsupported token near '+source.slice(i,i+12));i+=m[0].length;r=[Number(m[0]),0,0]}depth--;return r}
 function power(){let a=atom();if(peek()==='^'){i++;let m=source.slice(i).match(/^\d+/);if(!m)throw Error('Exponent must be nonnegative integer');i+=m[0].length;let n=Number(m[0]);if(n>2)throw Error('Maximum exponent is 2');let r=[1,0,0];for(let j=0;j<n;j++)r=mul(r,a);return r}return a}
 function term(){let a=power();while(peek()==='*'||peek()==='/'){let op=source[i++],b=power();if(op==='*')a=mul(a,b);else{if(b[1]||b[2]||b[0]===0)throw Error('Division requires a nonzero constant');a=a.map(x=>x/b[0])}}return a}
 function expr(){let a=term();while(peek()==='+'||peek()==='-'){let op=source[i++];a=add(a,term(),op==='+'?1:-1)}return a}
 let result=expr();if(i!==source.length)throw Error('Unexpected character at position '+(i+1));return result}
 let l=parse(parts[0]),r=parse(parts[1]),[c,b,a]=l.map((v,i)=>v-r[i]);let eps=1e-11*Math.max(1,Math.abs(a),Math.abs(b),Math.abs(c));
 let fmt=n=>Number(n.toPrecision(12)).toString();
 if(Math.abs(a)<=eps){if(Math.abs(b)<=eps)return Math.abs(c)<=eps?'All real numbers satisfy the equation':'No solution';return variable+' = '+fmt(-c/b)}
 let d=b*b-4*a*c;if(Math.abs(d)<=eps)return variable+' = '+fmt(-b/(2*a));
 if(d>0){let sq=Math.sqrt(d),q=-0.5*(b+Math.sign(b||1)*sq);let x1=q/a,x2=c/q;return variable+' = '+[x1,x2].sort((x,y)=>x-y).map(fmt).join(' or '+variable+' = ')}
 let real=fmt(-b/(2*a)),imag=fmt(Math.sqrt(-d)/(2*Math.abs(a)));return variable+' = '+real+' + '+imag+'i or '+variable+' = '+real+' - '+imag+'i';
}
root.casSolveEquation=solve;if(typeof module!=='undefined')module.exports={solve};
})(typeof globalThis!=='undefined'?globalThis:this);
