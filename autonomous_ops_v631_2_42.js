/* V631.2.42 educational closed-loop spacecraft power and thermal controller */
(function(root){'use strict';
const finite=(x,name,lo,hi)=>{if(typeof x!=='number'||!Number.isFinite(x)||x<lo||x>hi)throw Error(name+' must be between '+lo+' and '+hi);return x};
function control(o={}){
 const hours=finite(o.hours??48,'hours',.1,1000),step=finite(o.stepHours??.1,'stepHours',.01,2),capacity=finite(o.capacityWh??2400,'capacityWh',1,1e8),initial=finite(o.initialWh??2000,'initialWh',0,capacity);
 const solar=finite(o.solarW??450,'solarW',0,1e7),base=finite(o.baseW??180,'baseW',0,1e7),payload=finite(o.payloadW??80,'payloadW',0,1e7),heater=finite(o.heaterW??120,'heaterW',0,1e7);
 const sun=finite(o.sunlightFraction??.6,'sunlightFraction',0,1),period=finite(o.periodHours??1.5,'periodHours',.1,1000),ambient=finite(o.ambientC??-30,'ambientC',-273.15,500),initialTemp=finite(o.initialTempC??20,'initialTempC',-273.15,500);
 const low=finite(o.lowFraction??.3,'lowFraction',.05,.9),recover=finite(o.recoverFraction??.55,'recoverFraction',low,1),minTemp=finite(o.minTempC??0,'minTempC',-200,500),maxTemp=finite(o.maxTempC??60,'maxTempC',-200,500);
 if(minTemp>=maxTemp)throw Error('minTempC must be less than maxTempC');
 const thermalMass=finite(o.thermalCapacityJPerC??50000,'thermalCapacityJPerC',1,1e12),conductance=finite(o.conductanceWPerC??2,'conductanceWPerC',0,1e7);
 const n=Math.ceil(hours/step);if(n>100000)throw Error('Too many steps');
 let battery=initial,temp=initialTemp,mode='NORMAL',shedHours=0,shortfallWh=0,generatedWh=0,loadWh=0,minBattery=initial,maximumTemp=temp,minimumTemp=temp,heaterHours=0,transitions=[];const series=[];
 for(let i=0;i<n;i++){
  const time=i*step,dt=Math.min(step,hours-time);if(dt<=0)break;
  const fraction=battery/capacity;
  const next=mode==='NORMAL'?(fraction<=low?'CONSERVE':'NORMAL'):(fraction>=recover?'NORMAL':'CONSERVE');
  if(next!==mode){transitions.push({hour:time,from:mode,to:next});mode=next}
  const payloadOn=mode==='NORMAL',heaterOn=temp<minTemp+5;
  const solarOn=((time%period)/period)<sun,produced=(solarOn?solar:0)*dt,required=(base+(payloadOn?payload:0)+(heaterOn?heater:0))*dt;
  const available=battery+produced;shortfallWh+=Math.max(0,required-available);battery=Math.min(capacity,Math.max(0,available-required));
  generatedWh+=produced;loadWh+=required;if(!payloadOn)shedHours+=dt;if(heaterOn)heaterHours+=dt;
  const thermalPower=.8*(base+(payloadOn?payload:0)+(heaterOn?heater:0));
  // Exact solution of the constant-forcing lumped thermal ODE for each time step.
  const sec=dt*3600;
  if(conductance>0){const equilibrium=ambient+thermalPower/conductance;temp=equilibrium+(temp-equilibrium)*Math.exp(-conductance*sec/thermalMass)}
  else temp+=thermalPower*sec/thermalMass;
  if(!Number.isFinite(temp))throw Error('Thermal calculation diverged');
  minBattery=Math.min(minBattery,battery);minimumTemp=Math.min(minimumTemp,temp);maximumTemp=Math.max(maximumTemp,temp);
  if(i%Math.max(1,Math.floor(n/150))===0||i===n-1)series.push({hour:time+dt,batteryWh:battery,temperatureC:temp,mode,payloadOn,heaterOn});
 }
 const alerts=[];if(shortfallWh>1e-7)alerts.push('POWER SHORTFALL');if(minBattery/capacity<low)alerts.push('LOW BATTERY');if(minimumTemp<minTemp)alerts.push('COLD LIMIT EXCEEDED');if(maximumTemp>maxTemp)alerts.push('HOT LIMIT EXCEEDED');if(!alerts.length)alerts.push('No modeled limit violations');
 return {hours,finalBatteryWh:battery,minBatteryWh:minBattery,finalTemperatureC:temp,minimumTempC:minimumTemp,maximumTempC:maximumTemp,generatedWh,requestedWh:loadWh,shortfallWh,shedHours,heaterHours,transitions,alerts,series,assumptions:'Educational closed-loop model; simulated solar duty cycle, battery hysteresis, automatic payload shedding and thermostat heater; not real telemetry or flight control.'};
}
root.casAutonomousOpsV631242={control};if(typeof module!=='undefined'&&module.exports)module.exports=root.casAutonomousOpsV631242;
if(typeof document!=='undefined'){
 const get=id=>document.getElementById(id),btn=get('casOpsRun');if(btn)btn.addEventListener('click',()=>{const out=get('casOpsOutput');try{
  const ids={hours:'casOpsHours',capacityWh:'casOpsCapacity',initialWh:'casOpsInitial',solarW:'casOpsSolar',baseW:'casOpsBase',payloadW:'casOpsPayload',heaterW:'casOpsHeater',lowFraction:'casOpsLow',recoverFraction:'casOpsRecover',sunlightFraction:'casOpsSun',ambientC:'casOpsAmbient'};
  const opts={};for(const [k,id] of Object.entries(ids))opts[k]=Number(get(id).value);
  const r=control(opts),round=n=>+n.toFixed(2);out.textContent=JSON.stringify({finalBatteryWh:round(r.finalBatteryWh),minimumBatteryWh:round(r.minBatteryWh),finalTemperatureC:round(r.finalTemperatureC),temperatureRangeC:[round(r.minimumTempC),round(r.maximumTempC)],shortfallWh:round(r.shortfallWh),payloadShedHours:round(r.shedHours),heaterHours:round(r.heaterHours),modeChanges:r.transitions,alerts:r.alerts,assumptions:r.assumptions},null,2);
  const c=get('casOpsCanvas'),ctx=c&&c.getContext('2d');if(!ctx)return;const W=c.width,H=c.height;ctx.clearRect(0,0,W,H);ctx.fillStyle='#0e1b2d';ctx.fillRect(0,0,W,H);ctx.strokeStyle='#9bb0c8';ctx.strokeRect(45,15,W-65,H-48);
  for(const [fn,color] of [[p=>p.batteryWh/opts.capacityWh,'#5ce6aa'],[p=>p.mode==='CONSERVE'?.9:.1,'#ffc65a']]){ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=2;r.series.forEach((p,i)=>{const x=45+p.hour/r.hours*(W-65),y=15+(1-fn(p))*(H-48);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke()}
  ctx.fillStyle='#fff';ctx.font='13px sans-serif';ctx.fillText('Battery fraction (green); conservation mode (yellow)',48,H-10);
 }catch(e){out.textContent='Error: '+e.message}});
}
})(typeof globalThis!=='undefined'?globalThis:this);
