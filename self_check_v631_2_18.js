(function(root){'use strict';
const V=root.casVerifyV631216;
function verifyEquation(input, answer, variable='x'){
 if(!V)throw Error('Verification dependency unavailable');
 if(!/^[a-z]$/i.test(variable))throw Error('Variable must be one letter');
 const parts=String(input).split('=');if(parts.length!==2)throw Error('Exactly one equals sign required');
 const escaped=variable.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const pattern=new RegExp('(?:^|\\s|,)'+escaped+'\\s*=\\s*([+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?)','gi');
 const roots=[...String(answer).matchAll(pattern)].map(m=>Number(m[1]));
 if(!roots.length)return {status:'unverified',reason:'No real numeric roots available; complex and parametric solutions are not checked.'};
 function evaluate(source,x){const expr=source.replace(new RegExp('\\b'+escaped+'\\b','g'),'('+x+')');
  if(typeof root.casExpressionEvaluate!=='function')throw Error('Numeric evaluator unavailable');
  return Number(root.casExpressionEvaluate(expr));}
 const checks=roots.map(x=>{try{const a=evaluate(parts[0],x),b=evaluate(parts[1],x);return {x,verified:V.close(a,b,1e-7),residual:a-b}}catch(e){return {x,verified:null,error:String(e.message)}}});
 return {status:checks.some(c=>c.verified===false)?'failed':checks.every(c=>c.verified===true)?'verified':'unverified',checks,method:'Numerical substitution, not formal proof'};
}
function solveAndCheck(input,variable='x'){
 if(typeof root.casSolveEquation!=='function')throw Error('Equation solver unavailable');
 const answer=root.casSolveEquation(input,variable);return {answer,verification:verifyEquation(input,answer,variable)};
}
function format(result){const v=result.verification;return result.answer+'\n\nVerification: '+v.status.toUpperCase()+(v.reason?' — '+v.reason:'')+(v.checks?'\n'+v.checks.map(c=>`${c.x}: ${c.verified===true?'pass':c.verified===false?'fail':'not checked'}${c.error?' ('+c.error+')':''}`).join('\n'):'')+'\nNumerical verification is not a proof.'}
root.casSelfCheckV631218={verifyEquation,solveAndCheck,format};if(typeof module!=='undefined')module.exports=root.casSelfCheckV631218;
})(typeof globalThis!=='undefined'?globalThis:this);
