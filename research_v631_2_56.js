(function(root){'use strict';
const hypo=root.casHypothesesV631255,discovery=root.casDiscoveryV631254;
function investigate(rows,opts={}){
 if(!hypo||!discovery)throw Error('Previous hypothesis and discovery engines required');
 if(!Array.isArray(rows)||rows.length<16||rows.length>501)throw Error('Need 16–501 samples');
 const sorted=rows.map(r=>({x:Number(r.x),y:Number(r.y)})).sort((a,b)=>a.x-b.x);
 if(sorted.some((r,i)=>!Number.isFinite(r.x)||!Number.isFinite(r.y)||(i>0&&r.x<=sorted[i-1].x)))throw Error('Coordinates must be finite and unique');
 const primary=hypo.check(sorted,{tolerance:opts.tolerance??.01});
 // Interleaved holdout probes interpolation, unlike the original sorted extrapolation holdout.
 const train=sorted.filter((_,i)=>i%4!==0),holdout=sorted.filter((_,i)=>i%4===0);
 const alternatives=[];
 for(let degree=0;degree<=3;degree++){
  const model=discovery.fit(train,degree),residuals=holdout.map(r=>r.y-model.predict(r.x));
  const rmse=Math.sqrt(residuals.reduce((s,e)=>s+e*e,0)/residuals.length);
  alternatives.push({degree,rmse,mae:residuals.reduce((s,e)=>s+Math.abs(e),0)/residuals.length});
 }
 alternatives.sort((a,b)=>a.rmse-b.rmse||a.degree-b.degree);
 const best=alternatives[0],span=Math.max(...sorted.map(r=>r.y))-Math.min(...sorted.map(r=>r.y));
 const relative=best.rmse/Math.max(span,1e-12),tolerance=Number(opts.tolerance??.01);
 if(!Number.isFinite(tolerance)||tolerance<0)throw Error('Tolerance must be finite and nonnegative');
 const fit=discovery.fit(sorted,best.degree),low=sorted[0].x,high=sorted[sorted.length-1].x,delta=(high-low)*.2;
 const probes=[low-delta,low+(high-low)*.125,(low+high)/2,high-(high-low)*.125,high+delta].map(x=>({x,predicted:fit.predict(x),type:x<low||x>high?'extrapolation':'interpolation'}));
 return {hypothesis:`Degree ${best.degree} polynomial candidate`,supportedNumerically:relative<=tolerance,normalizedHoldoutError:relative,holdoutRMSE:best.rmse,holdoutMAE:best.mae,holdoutSamples:holdout.length,modelComparisons:alternatives,originalOrderedValidation:primary,proposedNextMeasurements:probes,limitations:'Numerical heuristics only; held-out points are from the same sampled dataset. Extrapolation suggestions are unverified. No formal proof, causal inference, or statistical significance.'};
}
root.casResearchV631256={investigate};
if(typeof document==='undefined')return;
const el=id=>document.getElementById(id),button=el('casResearch56Run');if(!button)return;
button.addEventListener('click',()=>{const out=el('casResearch56Output');try{const compile=root.casGraphV631227?.compile,engine=root.casExperimentsV631253;if(!compile||!engine)throw Error('Earlier experiment engine unavailable');const result=engine.run({expression:el('casResearch56Expression').value,start:el('casResearch56Start').value,end:el('casResearch56End').value,count:el('casResearch56Count').value,z:0},compile);out.textContent=JSON.stringify(investigate(result.rows,{tolerance:el('casResearch56Tolerance').value}),null,2)}catch(e){out.textContent='Research error: '+e.message}});
})(typeof window!=='undefined'?window:globalThis);
