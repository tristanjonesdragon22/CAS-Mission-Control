/* V631.2.25 spatial mathematics: radians for rotation, degrees for angle output. */
(function(root){'use strict';
const G=root.casGeometryV631224, V=root.casVector3DV631223;if(!G||!V)throw Error('Previous 3D engines required');
const vec=x=>V.vector(x);const dot=(a,b)=>V.dot(a,b);const cross=(a,b)=>V.cross(a,b);const norm=a=>V.magnitude(a);
function number(x){let n=Number(x);if(!Number.isFinite(n))throw Error('Expected finite number');return n}
function matrix(axis,angle){let a=String(axis).toLowerCase(),t=number(angle),c=Math.cos(t),s=Math.sin(t);if(a==='x')return [[1,0,0],[0,c,-s],[0,s,c]];if(a==='y')return [[c,0,s],[0,1,0],[-s,0,c]];if(a==='z')return [[c,-s,0],[s,c,0],[0,0,1]];throw Error('Axis must be x, y or z')}
function apply(m,p){p=vec(p);if(!Array.isArray(m)||m.length!==3||m.some(r=>!Array.isArray(r)||r.length!==3))throw Error('Expected 3x3 matrix');return m.map(row=>row.reduce((s,x,i)=>s+number(x)*p[i],0))}
function rotate(p,axis,degrees){return apply(matrix(axis,number(degrees)*Math.PI/180),p)}
function translate(p,delta){p=vec(p);delta=vec(delta);return p.map((x,i)=>x+delta[i])}
function scale(p,factor){p=vec(p);let f=number(factor);return p.map(x=>x*f)}
function lineLineDistance(p,d,q,e){p=vec(p);d=vec(d);q=vec(q);e=vec(e);if(norm(d)<1e-12||norm(e)<1e-12)throw Error('Line direction cannot be zero');let n=cross(d,e),w=q.map((x,i)=>x-p[i]);if(norm(n)<1e-12)return norm(cross(w,d))/norm(d);return Math.abs(dot(w,n))/norm(n)}
function verifyRotation(p,axis,degrees,tol=1e-9){let q=rotate(p,axis,degrees);return {originalMagnitude:norm(vec(p)),rotatedMagnitude:norm(q),preserved:Math.abs(norm(vec(p))-norm(q))<=tol*Math.max(1,norm(vec(p)))}}
const api={rotationMatrix:matrix,applyMatrix:apply,rotate,translate,scale,lineLineDistance,verifyRotation};root.casSpatialV631225=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
