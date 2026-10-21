/* CAS V631.2.24: numeric 3D geometry with explicit degeneracy checks. */
(function(root){'use strict';
const V=root.casVector3DV631223;if(!V)throw Error('V631.2.23 vector engine required');
const eps=1e-12;
function vec(x){return V.vector(x)}
function sub(a,b){a=vec(a);b=vec(b);return a.map((x,i)=>x-b[i])}
function add(a,b){a=vec(a);b=vec(b);return a.map((x,i)=>x+b[i])}
function scale(a,s){a=vec(a);s=Number(s);if(!Number.isFinite(s))throw Error('Scalar must be finite');return a.map(x=>x*s)}
function distance(a,b){return V.magnitude(sub(a,b))}
function angle(a,b){let m=V.magnitude(a)*V.magnitude(b);if(m<eps)throw Error('Angle undefined for zero vector');return Math.acos(Math.max(-1,Math.min(1,V.dot(a,b)/m)))}
function line(point,direction){let p=vec(point),d=vec(direction);if(V.magnitude(d)<eps)throw Error('Line direction cannot be zero');return {point:p,direction:d,description:`(${p.join(',')}) + t*(${d.join(',')})`}}
function plane(point,normal){let p=vec(point),n=vec(normal);if(V.magnitude(n)<eps)throw Error('Plane normal cannot be zero');return {normal:n,constant:V.dot(n,p),description:`${n[0]}*x + ${n[1]}*y + ${n[2]}*z = ${V.dot(n,p)}`}}
function pointPlaneDistance(point,planePoint,normal){let n=vec(normal);let m=V.magnitude(n);if(m<eps)throw Error('Plane normal cannot be zero');return Math.abs(V.dot(sub(point,planePoint),n))/m}
function sphere(center,radius){let c=vec(center),r=Number(radius);if(!Number.isFinite(r)||r<0)throw Error('Radius must be nonnegative and finite');return {center:c,radius:r,volume:4*Math.PI*r**3/3,surfaceArea:4*Math.PI*r*r}}
function linePlaneIntersection(point,direction,planePoint,normal){let l=line(point,direction),p=vec(planePoint),n=vec(normal);if(V.magnitude(n)<eps)throw Error('Plane normal cannot be zero');let denom=V.dot(l.direction,n),num=V.dot(sub(p,l.point),n);if(Math.abs(denom)<eps)return {status:Math.abs(num)<eps?'contained':'parallel'};let t=num/denom;return {status:'intersect',parameter:t,point:add(l.point,scale(l.direction,t))}}
const api={distance,angle,line,plane,pointPlaneDistance,sphere,linePlaneIntersection};root.casGeometryV631224=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
