(function(root){'use strict';
const samplePoints=[-4,-2.5,-1.25,-0.5,0,0.3,0.9,1.7,2.8,4.1,6.2];
function testIdentity(left,right,options={}){
 const compiler=options.compile||(root.casGraphV631227&&root.casGraphV631227.compile);
 if(typeof compiler!=='function')throw Error('Safe mathematical expression parser unavailable');
 const a=compiler(left),b=compiler(right),tol=options.tolerance===undefined?1e-8:Number(options.tolerance);
 if(!Number.isFinite(tol)||tol<=0||tol>0.1)throw Error('Tolerance must be between 0 and 0.1');
 const points=options.points||samplePoints; if(!Array.isArray(points)||points.length<3||points.length>200)throw Error('Invalid sample points');
 let tested=0,skipped=0,maxError=0;const counterexamples=[];
 for(const x of points){if(!Number.isFinite(x))throw Error('Nonfinite sample point');let u,v;try{u=a(x,0),v=b(x,0)}catch(e){skipped++;continue}
 if(!Number.isFinite(u)||!Number.isFinite(v)){skipped++;continue}
 tested++;const error=Math.abs(u-v),limit=tol*Math.max(1,Math.abs(u),Math.abs(v));maxError=Math.max(maxError,error);
 if(error>limit)counterexamples.push({x,left:u,right:v,error});}
 return {left,right,tested,skipped,maxError,counterexamples,verdict:counterexamples.length?'counterexample found':tested<3?'inconclusive':'supported on tested points',warning:'Numerical testing is not a symbolic proof. Singularities and untested inputs may invalidate the identity.'};
}
function investigate(expression,options={}){
 if(typeof expression!=='string'||expression.length>500)throw Error('Expression too long');
 const candidates=[['Double-angle sine','2*sin(x)*cos(x)','sin(2*x)'],['Pythagorean identity','sin(x)^2+cos(x)^2','1'],['Square expansion','(x+1)^2','x^2+2*x+1']];
 return {expression,comparisons:candidates.map(([name,a,b])=>({name,...testIdentity(a,b,options)}))};
}
const api={testIdentity,investigate,samplePoints};root.casIdentityV631264=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(typeof document==='undefined')return;
const el=id=>document.getElementById(id),btn=el('casIdentity64Run');if(!btn)return;
btn.addEventListener('click',()=>{try{const result=testIdentity(el('casIdentity64Left').value,el('casIdentity64Right').value);el('casIdentity64Output').textContent=JSON.stringify(result,null,2);root.casIdentity64Last=result}catch(e){el('casIdentity64Output').textContent='Error: '+e.message}});
const exportBtn=el('casIdentity64Export');exportBtn.addEventListener('click',()=>{if(!root.casIdentity64Last)return;const blob=new Blob([JSON.stringify(root.casIdentity64Last,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='cas_identity_v631_2_64.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
})(typeof globalThis!=='undefined'?globalThis:this);
