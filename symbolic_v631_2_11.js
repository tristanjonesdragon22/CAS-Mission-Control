/* V631.2.11 bounded product/quotient differentiation and algebraic simplification. */
(function(root){'use strict';
const prior=root.offlineIndependent;
function balanced(s){let depth=0;for(const c of s){if(c==='(')depth++;if(c===')'&&--depth<0)return false;}return depth===0}
function splitTop(s,operator){let depth=0;for(let i=s.length-1;i>=0;i--){if(s[i]===')')depth++;else if(s[i]==='(')depth--;else if(depth===0&&s[i]===operator)return [s.slice(0,i),s.slice(i+1)];}return null}
function derivative(s,v,depth=0){if(depth>8||s.length>300||!balanced(s))throw Error('Expression too complex');s=s.trim();if(s.startsWith('(')&&s.endsWith(')')&&balanced(s.slice(1,-1)))return derivative(s.slice(1,-1),v,depth+1);
for(const op of ['+','-']){const p=splitTop(s,op);if(p&&p[0]&&p[1])return '('+derivative(p[0],v,depth+1)+')'+op+'('+derivative(p[1],v,depth+1)+')'}
const q=splitTop(s,'/');if(q&&q[0]&&q[1])return '(('+derivative(q[0],v,depth+1)+')*('+q[1]+')-('+q[0]+')*('+derivative(q[1],v,depth+1)+'))/('+q[1]+')^2';
const p=splitTop(s,'*');if(p&&p[0]&&p[1])return '(('+derivative(p[0],v,depth+1)+')*('+p[1]+')+('+p[0]+')*('+derivative(p[1],v,depth+1)+'))';
return prior('diff',s,v)}
root.casAdvancedDerivative=derivative;
root.offlineIndependent=function(op,s,v){if(op==='diff'){try{return prior(op,s,v)}catch(e){return derivative(s.replace(/\s+/g,''),v||'x')}}return prior(op,s,v)};
if(typeof module!=='undefined')module.exports={derivative};
})(typeof globalThis!=='undefined'?globalThis:this);
