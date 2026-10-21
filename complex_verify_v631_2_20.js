/* CAS V631.2.20: transparent independent complex quadratic verification. */
(function(root){'use strict';
const finite=x=>Number.isFinite(x);
function complex(re,im=0){if(!finite(re)||!finite(im))throw Error('Non-finite complex number');return {re,im}}
function add(a,b){return complex(a.re+b.re,a.im+b.im)}
function mul(a,b){return complex(a.re*b.re-a.im*b.im,a.re*b.im+a.im*b.re)}
function magnitude(a){return Math.hypot(a.re,a.im)}
function verifyQuadratic(a,b,c,roots,tolerance=1e-8){
 if(![a,b,c].every(finite)||a===0)throw Error('Requires finite quadratic coefficients and a nonzero leading coefficient');
 if(!Array.isArray(roots)||!roots.length)throw Error('Provide candidate complex roots');
 const checks=roots.map(r=>{const z=complex(r.re,r.im||0);const residual=add(add(mul(complex(a),mul(z,z)),mul(complex(b),z)),complex(c));const scale=Math.max(1,Math.abs(a)*magnitude(z)**2+Math.abs(b)*magnitude(z)+Math.abs(c));return {root:z,residual:magnitude(residual),verified:magnitude(residual)<=tolerance*scale}});
 return {status:checks.every(x=>x.verified)?'verified':'failed',checks,method:'Complex substitution with scaled numerical tolerance (not a proof)'};
}
function solveQuadratic(a,b,c){
 if(![a,b,c].every(finite)||a===0)throw Error('Requires finite quadratic coefficients and a nonzero leading coefficient');
 const discriminant=b*b-4*a*c;
 const roots=discriminant>=0?[complex((-b+Math.sqrt(discriminant))/(2*a)),complex((-b-Math.sqrt(discriminant))/(2*a))]:[complex(-b/(2*a),Math.sqrt(-discriminant)/(2*a)),complex(-b/(2*a),-Math.sqrt(-discriminant)/(2*a))];
 return {roots,discriminant,verification:verifyQuadratic(a,b,c,roots)};
}
function parseCoefficients(s){const values=String(s).trim().split(/[;,\s]+/).map(Number);if(values.length!==3||!values.every(finite))throw Error('Enter three coefficients: a,b,c (for ax²+bx+c=0)');return values}
root.casComplexV631220={complex,add,mul,verifyQuadratic,solveQuadratic,parseCoefficients};
if(typeof module!=='undefined')module.exports=root.casComplexV631220;
})(typeof globalThis!=='undefined'?globalThis:this);
