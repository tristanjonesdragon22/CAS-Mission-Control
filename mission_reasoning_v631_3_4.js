(function(root){'use strict';
const G=root.CASMissionGraph303;
function parse(text){
 const t=String(text).toLowerCase();const get=(re,def)=>{let m=t.match(re);return m?Number(m[1]):def};
 const mass=get(/(?:mass|weigh(?:s|ing)?)\s*(?:of|=|:)??\s*(\d+(?:\.\d+)?)\s*(?:kg|kilograms?)/,10);
 const force=get(/(?:force|thrust)\s*(?:of|=|:)??\s*(\d+(?:\.\d+)?)\s*(?:n|newtons?)/,20);
 const time=get(/(?:duration|time|for)\s*(?:of|=|:)??\s*(\d+(?:\.\d+)?)\s*(?:s|seconds?)/,10);
 const target=get(/(?:target|goal)\s*(?:distance)?\s*(?:of|=|:)??\s*(\d+(?:\.\d+)?)\s*(?:m|meters?)/,100);
 if(!/(robot|vehicle|cart|accelerat|force|motion)/.test(t))throw Error('Currently supports constant-force linear motion missions only.');
 if(!(mass>0&&force>=0&&time>=0&&target>=0))throw Error('Mass must be positive and other parameters nonnegative.');
 return {mass,force,time,target,assumptions:['Constant applied force','No friction or air resistance','Starts from rest','One-dimensional motion'],source:text};
}
function build(p){return {stages:[
 {id:'mass',op:'constant',inputs:[],value:p.mass,unit:'kg'},
 {id:'force',op:'constant',inputs:[],value:p.force,unit:'N'},
 {id:'time',op:'constant',inputs:[],value:p.time,unit:'s'},
 {id:'acceleration',op:'divide',inputs:['force','mass'],unit:'m/s^2'},
 {id:'velocity',op:'multiply',inputs:['acceleration','time'],unit:'m/s'},
 {id:'half',op:'constant',inputs:[],value:0.5,unit:'1'},
 {id:'half_acceleration',op:'scale',inputs:['acceleration'],value:0.5,unit:'m/s^2'},
 {id:'time_squared',op:'multiply',inputs:['time','time'],unit:'s^2'},
 {id:'distance',op:'multiply',inputs:['half_acceleration','time_squared'],unit:'m'}]};}
// Existing graph unit vocabulary lacks s^2. Implement explicit dimensional checks in the new engine.
const units={kg:{M:1},N:{M:1,L:1,T:-2},s:{T:1},'s^2':{T:2},'m/s^2':{L:1,T:-2},'m/s':{L:1,T:-1},m:{L:1},'1':{}};
function equal(a,b){return ['M','L','T'].every(k=>(a[k]||0)===(b[k]||0));}
function evaluate(graph){let vals={},dims={};for(const s of graph.stages){if(Object.prototype.hasOwnProperty.call(vals,s.id))throw Error('Duplicate stage');if(!units[s.unit])throw Error('Unknown unit '+s.unit);let x=s.inputs.map(id=>{if(!Object.prototype.hasOwnProperty.call(vals,id))throw Error('Missing dependency '+id);return vals[id]});let d=s.inputs.map(id=>dims[id]),expected=null,v;switch(s.op){case 'constant':if(s.inputs.length)throw Error('Constant inputs');v=s.value;break;case 'scale':if(x.length!==1)throw Error('Scale arity');expected=d[0];v=x[0]*s.value;break;case 'multiply':case 'divide':if(x.length!==2)throw Error('Binary arity');expected={};for(const k of ['M','L','T'])expected[k]=(d[0][k]||0)+(s.op==='multiply'?1:-1)*(d[1][k]||0);if(s.op==='divide'&&x[1]===0)throw Error('Division by zero');v=s.op==='multiply'?x[0]*x[1]:x[0]/x[1];break;default:throw Error('Unsupported operation');}if(expected&&!equal(expected,units[s.unit]))throw Error('Unit mismatch '+s.id);if(!Number.isFinite(v))throw Error('Nonfinite result');vals[s.id]=v;dims[s.id]=units[s.unit];}return vals;}
function run(text){const p=parse(text),graph=build(p),values=evaluate(graph);return {parameters:p,graph,results:{distance_m:values.distance,velocity_m_s:values.velocity,acceleration_m_s2:values.acceleration},target_error_m:Math.abs(values.distance-p.target)};}
function optimize(text){const p=parse(text);let trials=[];for(let i=0;i<=40;i++){let f=p.force*(0.25+1.5*i/40);if(p.force===0)f=i;let r=run(`robot mass ${p.mass} kg force ${f} N duration ${p.time} seconds target ${p.target} meters`);trials.push({force_N:f,distance_m:r.results.distance_m,error_m:r.target_error_m});}trials.sort((a,b)=>a.error_m-b.error_m);return {best:trials[0],tested:trials.length,top_five:trials.slice(0,5),method:'bounded grid search; not global optimization'};}
root.CASMissionReasoning304={parse,build,evaluate,run,optimize};if(typeof module!=='undefined')module.exports=root.CASMissionReasoning304;
})(typeof globalThis!=='undefined'?globalThis:this);