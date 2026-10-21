(function(root){'use strict';
function finite(v){if(!Number.isFinite(v))throw Error('Function is undefined or non-finite near this point');return v}
function vec(a,b){return a.map((v,i)=>v-b[i])}
function norm(a){return Math.hypot(...a)}
function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]}
function curve(fs,t){const h=1e-4*Math.max(1,Math.abs(t)),p=u=>fs.map(f=>finite(f(u,0))),m=p(t-h),c=p(t),q=p(t+h),v=vec(q,m).map(x=>x/(2*h)),a=q.map((x,i)=>(x-2*c[i]+m[i])/(h*h)),speed=norm(v),curvature=speed>1e-10?norm(cross(v,a))/Math.pow(speed,3):null;return {point:c,tangent:v,unitTangent:speed>1e-10?v.map(x=>x/speed):null,speed,curvature,method:'central finite differences; numerical estimate'} }
function surface(f,x,z){let hx=1e-4*Math.max(1,Math.abs(x)),hz=1e-4*Math.max(1,Math.abs(z)),y=finite(f(x,z)),dx=(finite(f(x+hx,z))-finite(f(x-hx,z)))/(2*hx),dz=(finite(f(x,z+hz))-finite(f(x,z-hz)))/(2*hz),n=[-dx,1,-dz],length=norm(n);return {point:[x,y,z],gradient:[dx,dz],unitNormal:n.map(v=>v/length),method:'central finite differences; numerical estimate'}}
const api={curve,surface};root.casAnalysisV631229=api;if(typeof module!=='undefined')module.exports=api;
if(typeof document==='undefined')return;
const $=id=>document.getElementById(id);let btn=$('casAnalyzeCurve');if(!btn)return;
const compile=root.casGraphV631227&&root.casGraphV631227.compile;
function output(v){$('casAnalysisOutput').textContent=JSON.stringify(v,null,2)}
btn.onclick=()=>{try{if(!compile)throw Error('Graph expression parser unavailable');let fs=['casPX','casPY','casPZ'].map(id=>compile($(id).value)),t=Number($('casAnalyzeT').value);if(!Number.isFinite(t))throw Error('Enter a finite parameter');output(curve(fs,t))}catch(e){$('casAnalysisOutput').textContent='Error: '+e.message}};
$('casAnalyzeSurface').onclick=()=>{try{if(!compile)throw Error('Graph expression parser unavailable');let f=compile($('casSurfaceFormula').value),x=Number($('casSurfaceX').value),z=Number($('casSurfaceZ').value);if(!Number.isFinite(x)||!Number.isFinite(z))throw Error('Enter finite coordinates');output(surface(f,x,z))}catch(e){$('casAnalysisOutput').textContent='Error: '+e.message}};
})(typeof window!=='undefined'?window:globalThis);
