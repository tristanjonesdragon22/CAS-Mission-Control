/* V631.2.45: explainable simulated mission decision engine; offline, no hardware control. */
(function(root){'use strict';
const recovery=root.casSelfRecoveryV631244;
function finite(v,name,min,max){if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)throw Error(name+' must be between '+min+' and '+max);return v}
function analyze(input={}){
 if(!recovery||typeof recovery.simulate!=='function')throw Error('V631.2.44 recovery engine is required');
 const hours=finite(input.hours??24,'hours',1,240),initialWh=finite(input.initialWh??2000,'initialWh',0,2400),solarW=finite(input.solarW??400,'solarW',0,100000),ambientC=finite(input.ambientC??-30,'ambientC',-200,200),signalQuality=finite(input.signalQuality??.9,'signalQuality',0,1);
 const candidates=[
 {name:'STANDARD',baseW:180,payloadW:80,heaterW:120,lowThreshold:.30,recoverThreshold:.55,priority:'Scientific payload and normal operations'},
 {name:'POWER_SAVING',baseW:140,payloadW:35,heaterW:120,lowThreshold:.35,recoverThreshold:.60,priority:'Preserve battery and reduced payload'},
 {name:'SURVIVAL',baseW:105,payloadW:0,heaterW:120,lowThreshold:.40,recoverThreshold:.65,priority:'Protect core systems; payload unavailable'}
 ];
 const options=candidates.map(c=>{
 const result=recovery.simulate({hours,initialWh,solarW,ambientC,signalQuality,baseW:c.baseW,payloadW:c.payloadW,heaterW:c.heaterW,lowThreshold:c.lowThreshold,recoverThreshold:c.recoverThreshold});
 const minBatteryFraction=Math.min(initialWh/2400,...result.history.map(h=>h.batteryFraction));
 const thermalViolations=result.history.filter(h=>h.temperatureC < -10 || h.temperatureC > 60).length;
 const safeHours=result.history.filter(h=>h.mode==='SAFE').length;
 const commWarnings=signalQuality<.2?1:0;
 const score=Math.round(100*Math.max(0,Math.min(1,minBatteryFraction)))-thermalViolations*3-safeHours*2-commWarnings*10+(c.name==='STANDARD'?10:c.name==='POWER_SAVING'?5:0);
 return {name:c.name,priority:c.priority,score,minBatteryFraction:+minBatteryFraction.toFixed(4),finalBatteryWh:result.summary.finalBatteryWh,finalTemperatureC:result.summary.finalTemperatureC,finalMode:result.summary.finalMode,thermalViolations,safeCheckpoints:safeHours,verifiedRecoveries:result.summary.verifiedRecoveries,eventCount:result.summary.eventCount,events:result.events.slice(0,12)};
 });
 options.sort((a,b)=>b.score-a.score||b.minBatteryFraction-a.minBatteryFraction);
 const recommended=options[0];const alerts=[];
 if(recommended.minBatteryFraction<.15)alerts.push('CRITICAL: projected battery drops below 15%');
 if(recommended.thermalViolations)alerts.push('THERMAL: forecast exceeds operating temperature bounds');
 if(signalQuality<.2)alerts.push('COMMS: predicted store-and-retry mode');
 if(recommended.safeCheckpoints)alerts.push('SAFE: projected emergency operating checkpoints');
 if(!alerts.length)alerts.push('No modeled critical conditions under the selected scenario');
 return {recommended:recommended.name,reason:'Highest heuristic score among three simulated configurations; not a globally optimal control policy.',alerts,options,inputs:{hours,initialWh,solarW,ambientC,signalQuality},limitations:'Educational forecast and advisory only. Scores are heuristics; simplified thermal/power models and sampled checkpoints can miss hazards. No live telemetry or hardware commands.'};
}
root.casDecisionEngineV631245={analyze};if(typeof module!=='undefined'&&module.exports)module.exports=root.casDecisionEngineV631245;
if(typeof document!=='undefined'){
 const el=id=>document.getElementById(id),button=el('casDecisionRun');if(button)button.addEventListener('click',()=>{try{
 const result=analyze({hours:Number(el('casDecisionHours').value),initialWh:Number(el('casDecisionBattery').value),solarW:Number(el('casDecisionSolar').value),ambientC:Number(el('casDecisionAmbient').value),signalQuality:Number(el('casDecisionSignal').value)});
 el('casDecisionOutput').textContent='RECOMMENDED SIMULATED CONFIGURATION: '+result.recommended+'\n'+result.reason+'\n\nALERTS\n'+result.alerts.join('\n')+'\n\nCOMPARISON\n'+result.options.map(o=>o.name+' | score '+o.score+' | min battery '+(100*o.minBatteryFraction).toFixed(1)+'% | final '+o.finalBatteryWh+' Wh | thermal warnings '+o.thermalViolations+' | SAFE checkpoints '+o.safeCheckpoints).join('\n')+'\n\n'+result.limitations;
 }catch(e){el('casDecisionOutput').textContent='Error: '+e.message}});
}
})(typeof globalThis!=='undefined'?globalThis:this);
