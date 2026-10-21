/* V631.2.44 simulated autonomous recovery; educational, no hardware access. */
(function(root){'use strict';
const fault=root.casFaultRecoveryV631243;
function num(v,name,min,max){if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)throw Error(name+' out of range');return v}
function simulate(o={}){
 const hours=num(o.hours??24,'hours',1,240),stepMinutes=num(o.stepMinutes??10,'stepMinutes',1,60),capacity=num(o.capacityWh??2400,'capacityWh',1,1e8),solar=num(o.solarW??400,'solarW',0,1e6),base=num(o.baseW??180,'baseW',0,1e6),payload=num(o.payloadW??80,'payloadW',0,1e6),heater=num(o.heaterW??120,'heaterW',0,1e6),ambient=num(o.ambientC??-30,'ambientC',-200,200),signal=num(o.signalQuality??.9,'signalQuality',0,1),sunFraction=num(o.sunFraction??.6,'sunFraction',0,1),period=num(o.periodHours??1.5,'periodHours',.1,100),initial=num(o.initialWh??2000,'initialWh',0,capacity),initialTemp=num(o.initialTempC??20,'initialTempC',-200,200);
 const low=num(o.lowThreshold??.3,'lowThreshold',.05,.8),recover=num(o.recoverThreshold??.55,'recoverThreshold',.1,.95);if(recover<=low)throw Error('recovery threshold must exceed low threshold');
 const steps=Math.ceil(hours*60/stepMinutes);if(steps>14400)throw Error('too many simulation steps');
 let energy=initial,temp=initialTemp,mode='NORMAL',comm='NORMAL',payloadEnabled=true,heaterEnabled=false,restarts=0,stable=0;const history=[],events=[];
 function event(time,code,message){if(events.length<2000)events.push({hour:+time.toFixed(3),code,message})}
 for(let i=0;i<steps;i++){
  const t=i*stepMinutes/60,dt=Math.min(stepMinutes/60,hours-t);if(dt<=0)break;
  const sun=(t%period)<period*sunFraction;const generated=sun?solar:0;
  const fraction=energy/capacity;
  // Emergency response is simulated only; protective loads cannot be shed.
  if(fraction<=.15&&mode!=='SAFE'){mode='SAFE';stable=0;event(t,'SAFE_ENTER','Emergency power conservation')}
  else if(fraction<=low&&mode==='NORMAL'){mode='CONSERVE';stable=0;event(t,'CONSERVE_ENTER','Nonessential payload suspended')}
  if(mode!=='NORMAL'&&fraction>=recover&&temp>=-10&&temp<=60){stable++;if(stable>=3){mode='NORMAL';stable=0;restarts++;event(t,'RECOVERY_VERIFIED','Three consecutive healthy checkpoints')}}else stable=0;
  payloadEnabled=mode==='NORMAL';heaterEnabled=temp<5&&energy>0;
  const demand=base+(payloadEnabled?payload:0)+(heaterEnabled?heater:0);
  energy=Math.max(0,Math.min(capacity,energy+(generated-demand)*dt));
  // Simplified first-order temperature response; heater adds warming.
  temp+=dt*((ambient-temp)*.08+(heaterEnabled?heater*.018:0)+(sun?.6:0));
  if(signal<.2&&comm!=='STORE_AND_RETRY'){comm='STORE_AND_RETRY';event(t,'COMMS_STORE','Telemetry buffered locally')}
  else if(signal>=.5&&comm!=='NORMAL'){comm='NORMAL';event(t,'COMMS_RECOVER','Simulated communications restored')}
  const diagnosis=fault.diagnose({batteryFraction:energy/capacity,temperatureC:temp,generationW:generated,demandW:demand,signalQuality:signal});
  if(i===0||i===steps-1||i%Math.max(1,Math.ceil(60/stepMinutes))===0)history.push({hour:+(t+dt).toFixed(3),batteryWh:+energy.toFixed(3),batteryFraction:+(energy/capacity).toFixed(5),temperatureC:+temp.toFixed(3),mode,comms:comm,payloadEnabled,heaterEnabled,faults:diagnosis.faults.map(f=>f.code)});
 }
 return {summary:{hours,finalBatteryWh:+energy.toFixed(3),finalTemperatureC:+temp.toFixed(3),finalMode:mode,verifiedRecoveries:restarts,eventCount:events.length},events,history,limitations:'Simulated discrete-time response only. No spacecraft commands, real telemetry, hardware restart, or guaranteed recovery.'};
}
root.casSelfRecoveryV631244={simulate};if(typeof module!=='undefined'&&module.exports)module.exports=root.casSelfRecoveryV631244;
if(typeof document!=='undefined'){
 const get=id=>document.getElementById(id),btn=get('casRecoveryRun');if(btn)btn.addEventListener('click',()=>{try{const opt={hours:Number(get('casRecoveryHours').value),initialWh:Number(get('casRecoveryBattery').value),solarW:Number(get('casRecoverySolar').value),ambientC:Number(get('casRecoveryAmbient').value),signalQuality:Number(get('casRecoverySignal').value)};const result=simulate(opt),out=get('casRecoveryOutput');out.textContent=JSON.stringify(result.summary,null,2)+'\n\nRECOVERY EVENTS\n'+result.events.map(e=>e.hour+' h — '+e.code+': '+e.message).join('\n')+'\n\n'+result.limitations;
 const c=get('casRecoveryCanvas'),ctx=c.getContext('2d'),w=c.width,h=c.height;ctx.clearRect(0,0,w,h);ctx.fillStyle='#101d30';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#4de2bb';ctx.lineWidth=2;ctx.beginPath();result.history.forEach((r,i)=>{const x=20+(w-40)*r.hour/result.summary.hours,y=h-20-(h-40)*r.batteryFraction;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();ctx.fillStyle='#fff';ctx.font='14px sans-serif';ctx.fillText('Battery fraction over mission time',20,20);
 }catch(e){get('casRecoveryOutput').textContent='Error: '+e.message}});
}
})(typeof globalThis!=='undefined'?globalThis:this);
