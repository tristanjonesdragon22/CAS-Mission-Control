/* V631.2.43: educational spacecraft fault diagnosis and recovery supervisor */
(function(root){'use strict';
const finite=(v,k,min,max)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)throw Error(k+' must be within '+min+' to '+max);return v};
function diagnose(o={}){
 const battery=finite(o.batteryFraction??.7,'batteryFraction',0,1),temperature=finite(o.temperatureC??20,'temperatureC',-273.15,1000),generation=finite(o.generationW??400,'generationW',0,1e8),demand=finite(o.demandW??240,'demandW',0,1e8),signal=finite(o.signalQuality??.9,'signalQuality',0,1),critical=finite(o.criticalBattery??.15,'criticalBattery',.01,.5),low=finite(o.lowBattery??.3,'lowBattery',critical,.9),cold=finite(o.coldLimitC??-10,'coldLimitC',-200,200),hot=finite(o.hotLimitC??60,'hotLimitC',-100,500),reserve=finite(o.reserveW??25,'reserveW',0,1e8);
 if(cold>=hot)throw Error('coldLimitC must be less than hotLimitC');
 const faults=[],actions=[],priority=[];
 const add=(code,severity,message,action)=>{faults.push({code,severity,message});actions.push(action);priority.push(severity)};
 if(battery<=critical)add('CRITICAL_BATTERY','CRITICAL','Battery below emergency threshold','ENTER_SAFE_MODE');
 else if(battery<=low)add('LOW_BATTERY','WARNING','Battery below conservation threshold','SHED_PAYLOAD');
 if(temperature>hot)add('OVERHEAT','CRITICAL','Temperature exceeds upper limit','REDUCE_LOAD_AND_COOL');
 if(temperature<cold)add('TOO_COLD','CRITICAL','Temperature below lower limit','ACTIVATE_HEATER_IF_POWER_AVAILABLE');
 if(generation+Math.max(0,reserve)<demand)add('POWER_DEFICIT','WARNING','Demand exceeds generation plus reserve allowance','SHED_NONESSENTIAL_LOAD');
 if(signal<.2)add('COMMS_LOSS','CRITICAL','Communications quality very low','STORE_TELEMETRY_AND_RETRY');
 else if(signal<.5)add('COMMS_DEGRADED','WARNING','Communications quality degraded','REDUCE_TELEMETRY_RATE');
 const mode=priority.includes('CRITICAL')?'SAFE':priority.includes('WARNING')?'CONSERVE':'NORMAL';
 if(mode==='SAFE'&&!actions.includes('ENTER_SAFE_MODE'))actions.unshift('ENTER_SAFE_MODE');
 if(!faults.length)actions.push('CONTINUE_NOMINAL_OPERATIONS');
 return {mode,faults,actions:[...new Set(actions)],faultCount:faults.length,assumptions:'Rule-based simulated diagnosis; no hardware access, real telemetry, or guaranteed recovery.'};
}
function recoveryPlan(o={}){
 const d=diagnose(o),steps=d.actions.map((action,i)=>({order:i+1,action,status:'RECOMMENDED_NOT_EXECUTED'}));
 return {...d,steps,automaticExecution:false};
}
root.casFaultRecoveryV631243={diagnose,recoveryPlan};if(typeof module!=='undefined'&&module.exports)module.exports=root.casFaultRecoveryV631243;
if(typeof document!=='undefined'){
 const el=id=>document.getElementById(id),b=el('casFaultRun');if(b)b.addEventListener('click',()=>{const out=el('casFaultOutput');try{const opts={batteryFraction:Number(el('casFaultBattery').value),temperatureC:Number(el('casFaultTemp').value),generationW:Number(el('casFaultGeneration').value),demandW:Number(el('casFaultDemand').value),signalQuality:Number(el('casFaultSignal').value)};out.textContent=JSON.stringify(recoveryPlan(opts),null,2)}catch(e){out.textContent='Error: '+e.message}});
}
})(typeof globalThis!=='undefined'?globalThis:this);
