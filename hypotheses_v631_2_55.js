(function(root){'use strict';
const api=root.casDiscoveryV631254;
function check(rows,opts={}){
 if(!api)throw Error('V631.2.54 discovery engine is required');
 if(!Array.isArray(rows)||rows.length<12||rows.length>501)throw Error('Provide 12–501 samples');
 const cleaned=rows.map(r=>({x:Number(r.x),y:Number(r.y)}));
 if(cleaned.some(r=>!Number.isFinite(r.x)||!Number.isFinite(r.y)))throw Error('Samples must be finite');
 const ordered=[...cleaned].sort((a,b)=>a.x-b.x);
 if(ordered.some((r,i)=>i&&r.x===ordered[i-1].x))throw Error('Duplicate x coordinates are not supported');
 const cutoff=Math.floor(ordered.length*.7),train=ordered.slice(0,cutoff),test=ordered.slice(cutoff);
 const candidates=[];
 for(let d=0;d<=3;d++){
  const model=api.fit(train,d),errors=test.map(r=>r.y-model.predict(r.x));
  const rmse=Math.sqrt(errors.reduce((s,v)=>s+v*v,0)/errors.length);
  const mae=errors.reduce((s,v)=>s+Math.abs(v),0)/errors.length;
  candidates.push({degree:d,model,rmse,mae});
 }
 candidates.sort((a,b)=>a.rmse-b.rmse||a.degree-b.degree);
 const best=candidates[0],tolerance=Number(opts.tolerance??0.01);
 if(!Number.isFinite(tolerance)||tolerance<0)throw Error('Tolerance must be nonnegative');
 const ySpan=Math.max(...ordered.map(r=>r.y))-Math.min(...ordered.map(r=>r.y));
 const normalizedError=best.rmse/Math.max(ySpan,1e-12);
 const outliers=ordered.map((r,i)=>({index:i,x:r.x,residual:r.y-best.model.predict(r.x)})).filter(r=>Math.abs(r.residual)>Math.max(3*best.rmse,1e-9));
 return {hypothesis:`Polynomial relationship of degree ${best.degree}`,status:normalizedError<=tolerance?'supported numerically within tolerance':'not supported within tolerance',normalizedError,validationRMSE:best.rmse,validationMAE:best.mae,tolerance,trainingSamples:train.length,validationSamples:test.length,alternatives:candidates.map(c=>({degree:c.degree,rmse:c.rmse,mae:c.mae})),possibleOutliers:outliers.slice(0,20),limitations:'Heuristic model fitting on sampled values; ordered holdout may involve extrapolation. No statistical significance, causal inference, or mathematical proof.'};
}
function propose(rows){const r=check(rows);return {hypothesis:r.hypothesis,followUp:r.status.startsWith('supported')?'Test a wider x range, new sample points, and independent measurements.':'Try a wider family of models or inspect residuals and discontinuities.',analysis:r}}
root.casHypothesesV631255={check,propose};
if(typeof document==='undefined')return;
const el=id=>document.getElementById(id),button=el('casHypothesisRun');if(!button)return;
button.addEventListener('click',()=>{const out=el('casHypothesisOutput');try{const compile=root.casGraphV631227?.compile,engine=root.casExperimentsV631253;if(!compile||!engine)throw Error('Earlier graphing/experiment engine unavailable');const cfg={expression:el('casHypothesisExpression').value,start:el('casHypothesisStart').value,end:el('casHypothesisEnd').value,count:el('casHypothesisCount').value,z:0};const experiment=engine.run(cfg,compile);out.textContent=JSON.stringify(propose(experiment.rows),null,2)}catch(e){out.textContent='Hypothesis error: '+e.message}});
})(typeof window!=='undefined'?window:globalThis);
