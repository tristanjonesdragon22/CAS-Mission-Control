/* CAS V631.2.41: educational spacecraft power, battery, thermal, and subsystem resource forecast. */
(function(root){'use strict';
const num=(v,name,min,max)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)throw Error(name+' must be finite, between '+min+' and '+max);return v};
function simulate(o={}){
 const hours=num(o.hours??48,'Duration hours',.1,8760),step=num(o.stepHours??.25,'Step hours',.01,24);
 const capacity=num(o.capacityWh??2400,'Battery capacity Wh',1,1e9),initial=num(o.initialWh??2000,'Initial charge Wh',0,capacity);
 const solar=num(o.solarW??450,'Solar watts',0,1e7),base=num(o.baseW??180,'Base load watts',0,1e7),payload=num(o.payloadW??80,'Payload watts',0,1e7),heater=num(o.heaterW??120,'Heater watts',0,1e7);
 const sunlight=num(o.sunlightFraction??.6,'Sunlight fraction',0,1),period=num(o.orbitPeriodHours??1.5,'Cycle hours',.1,10000);
 const ambient=num(o.ambientC??-30,'Ambient temperature',-273.15,1000),initialTemp=num(o.initialTempC??20,'Initial temperature',-273.15,1000),thermalMass=num(o.thermalCapacityJPerC??50000,'Thermal capacity',1,1e12),conductance=num(o.conductanceWPerC??2,'Thermal conductance',0,1e7),heatFraction=num(o.heatFraction??.8,'Waste heat fraction',0,1);
 const low=num(o.lowBatteryFraction??.2,'Low battery threshold',0,1),minTemp=num(o.minTempC??0,'Minimum temperature',-273.15,1000),maxTemp=num(o.maxTempC??60,'Maximum temperature',-273.15,1000);
 if(minTemp>=maxTemp)throw Error('Minimum temperature must be less than maximum');
 let charge=initial,temp=initialTemp,minCharge=charge,maxTemperature=temp,minTemperature=temp,unservedWh=0,spilledWh=0,generatedWh=0,consumedWh=0,lowCount=0,thermalCount=0;const series=[];
 const n=Math.ceil(hours/step);if(n>100000)throw Error('Too many simulation steps');
 for(let i=0;i<n;i++){
  const t=i*step,dt=Math.min(step,hours-t);if(dt<=0)break;
  // Sunlight is a rectangular periodic duty cycle, not a real orbital eclipse prediction.
  const phase=(t%period)/period,inSun=phase<sunlight;
  const heating=temp<minTemp+5,heaterOn=heating;
  const load=base+payload+(heaterOn?heater:0),production=inSun?solar:0;
  const before=charge,available=before+production*dt,requested=load*dt;
  charge=Math.min(capacity,Math.max(0,available-requested));
  unservedWh+=Math.max(0,requested-available);spilledWh+=Math.max(0,available-requested-capacity);
  generatedWh+=production*dt;consumedWh+=requested;
  // Lumped thermal model; substep thermal integration for numerical stability.
  let sub=Math.max(1,Math.ceil(dt*3600/Math.max(1,thermalMass/Math.max(conductance,1e-12)*.2)));
  for(let k=0;k<sub;k++){let dts=dt*3600/sub;let waste=heatFraction*load;temp+=(waste-conductance*(temp-ambient))*dts/thermalMass;if(!Number.isFinite(temp))throw Error('Thermal calculation diverged')}
  minCharge=Math.min(minCharge,charge);maxTemperature=Math.max(maxTemperature,temp);minTemperature=Math.min(minTemperature,temp);
  if(charge/capacity<low)lowCount++;if(temp<minTemp||temp>maxTemp)thermalCount++;
  if(i%Math.max(1,Math.floor(n/120))===0||i===n-1)series.push({hour:Math.min(hours,t+dt),batteryWh:charge,temperatureC:temp,sunlight:inSun});
 }
 const alerts=[];if(unservedWh>1e-8)alerts.push('POWER SHORTFALL: load was not fully supplied');if(lowCount)alerts.push('LOW BATTERY during '+lowCount+' simulation steps');if(thermalCount)alerts.push('TEMPERATURE outside configured limits during '+thermalCount+' steps');if(!alerts.length)alerts.push('No threshold violations in this simplified model');
 return {hours,finalBatteryWh:charge,minBatteryWh:minCharge,finalTemperatureC:temp,minTemperatureC:minTemperature,maxTemperatureC:maxTemperature,generatedWh,consumedWh,unservedWh,spilledWh,alerts,series,assumptions:'Periodic sunlight duty cycle, fixed solar output, fixed loads, thermostat heater, lumped thermal model; not real orbital eclipse, hardware or spacecraft telemetry.'};
}
root.casSpacecraftSystemsV631241={simulate};if(typeof module!=='undefined'&&module.exports)module.exports=root.casSpacecraftSystemsV631241;
if(typeof document!=='undefined'){
 const get=id=>document.getElementById(id),button=get('casSystemsRun');
 if(button)button.addEventListener('click',()=>{const out=get('casSystemsOutput');try{
 const ids={hours:'casSysHours',capacityWh:'casSysCapacity',initialWh:'casSysInitial',solarW:'casSysSolar',baseW:'casSysBase',payloadW:'casSysPayload',heaterW:'casSysHeater',sunlightFraction:'casSysSun',orbitPeriodHours:'casSysPeriod',ambientC:'casSysAmbient',initialTempC:'casSysTemp'};
 const opts={};for(const [key,id] of Object.entries(ids))opts[key]=Number(get(id).value);
 const r=simulate(opts);const round=n=>Number(n.toFixed(2));out.textContent=JSON.stringify({durationHours:r.hours,finalBatteryWh:round(r.finalBatteryWh),minimumBatteryWh:round(r.minBatteryWh),generatedWh:round(r.generatedWh),requestedWh:round(r.consumedWh),unservedWh:round(r.unservedWh),finalTemperatureC:round(r.finalTemperatureC),temperatureRangeC:[round(r.minTemperatureC),round(r.maxTemperatureC)],alerts:r.alerts,assumptions:r.assumptions},null,2);
 const canvas=get('casSystemsCanvas'),ctx=canvas&&canvas.getContext('2d');if(!ctx)return;const W=canvas.width,H=canvas.height;ctx.clearRect(0,0,W,H);ctx.fillStyle='#0d1728';ctx.fillRect(0,0,W,H);ctx.strokeStyle='#7d8da8';ctx.strokeRect(45,15,W-65,H-45);const pts=r.series;if(pts.length<2)return;const plot=(fn,color)=>{ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=2;pts.forEach((p,i)=>{const x=45+p.hour/r.hours*(W-65),y=15+(1-Math.max(0,Math.min(1,fn(p))))*(H-45);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke()};plot(p=>p.batteryWh/opts.capacityWh,'#65d6a6');plot(p=>(p.temperatureC+100)/200,'#ffb86b');ctx.fillStyle='#ffffff';ctx.font='13px sans-serif';ctx.fillText('Battery fraction (green); temperature -100 to +100 °C (orange)',50,H-9);
 }catch(e){out.textContent='Error: '+e.message}});
}
})(typeof globalThis!=='undefined'?globalThis:this);
