/* V631.2.19: bounded, transparent numeric correction and complex verification. */
(function(root){'use strict';
const fmt=n=>String(Number(n.toPrecision(12)));
function solveVerified(equation,variable='x'){
 if(typeof root.casSolveEquation!=='function')throw Error('Equation solver unavailable');
 const original=root.casSolveEquation(equation,variable);
 const verifier=root.casSelfCheckV631218;
 if(!verifier)throw Error('Verification module unavailable');
 let check=verifier.verifyEquation(equation,original,variable);
 if(check.status==='verified')return {answer:original,status:'verified',method:'Numerical substitution',corrected:false};
 // Recompute using an independent linear/quadratic coefficient extraction by evaluating both sides.
 const parts=String(equation).split('=');
 if(parts.length!==2)throw Error('Expected one equation');
 if(!/^[a-z]$/i.test(variable))throw Error('Variable must be one letter');
 const evaluateAt=x=>{
  const vals=parts.map(p=>{
   const substituted=p.replace(new RegExp('\\b'+variable+'\\b','g'),'('+x+')');
   if(/\b[a-zA-Z]\b/.test(substituted.replace(/\b(?:pi|e)\b/g,'')))throw Error('Unsupported variable');
   return Number(root.casExpressionEvaluate(substituted));
  });return vals[0]-vals[1];
 };
 try{
  const f0=evaluateAt(0),f1=evaluateAt(1),fm=evaluateAt(-1);
  const a=(f1+fm-2*f0)/2,b=(f1-fm)/2,c=f0;
  const f2=evaluateAt(2),scale=Math.max(1,Math.abs(f0),Math.abs(f1),Math.abs(fm),Math.abs(f2));
  if(Math.abs((4*a+2*b+c)-f2)>1e-8*scale)return {answer:original,status:check.status,corrected:false,reason:'Independent correction supports only polynomial degree ≤2.'};
  const eps=1e-10*scale;
  if(Math.abs(a)<=eps){if(Math.abs(b)<=eps)return {answer:original,status:check.status,corrected:false,reason:'Degenerate equation'};
   const answer=variable+' = '+fmt(-c/b),v=verifier.verifyEquation(equation,answer,variable);
   return {answer:v.status==='verified'?answer:original,status:v.status,corrected:v.status==='verified'&&answer!==original,method:'Independent coefficient sampling and substitution'};
  }
  const d=b*b-4*a*c;
  if(d<0)return {answer:original,status:'unverified',corrected:false,reason:'Complex roots require a complex-valued evaluator; no correction attempted.'};
  const q=-0.5*(b+Math.sign(b||1)*Math.sqrt(d));
  const roots=Math.abs(d)<eps?[-b/(2*a)]:[q/a,c/q];
  const answer=roots.map(r=>variable+' = '+fmt(r)).join(' or ');
  const v=verifier.verifyEquation(equation,answer,variable);
  return {answer:v.status==='verified'?answer:original,status:v.status,corrected:v.status==='verified'&&answer!==original,method:'Independent coefficient sampling and substitution'};
 }catch(error){return {answer:original,status:check.status,corrected:false,reason:'Independent check unavailable: '+error.message};}
}
root.casReasoningV631219={solveVerified};if(typeof module!=='undefined')module.exports=root.casReasoningV631219;
})(typeof globalThis!=='undefined'?globalThis:this);
