/* CAS V631.2.15: independent matrix operations; no eval or network. */
(function(root){'use strict';
function parse(s){let a=s.trim().split(/\s*;\s*/).map(r=>r.split(/\s*,\s*/).map(x=>{x=x.trim();if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(x))throw Error('Invalid matrix number');let v=Number(x);if(!Number.isFinite(v))throw Error('Nonfinite number');return v}));if(!a.length||a.length>4||!a[0].length||a[0].length>4||a.some(r=>r.length!==a[0].length))throw Error('Use a rectangular matrix up to 4 by 4');return a}
function fmt(n){return String(Number((Math.abs(n)<1e-11?0:n).toPrecision(12)))}
function show(a){return a.map(r=>r.map(fmt).join(', ')).join('; ')}
function transpose(s){let a=parse(s);return show(a[0].map((_,j)=>a.map(r=>r[j])))}
function combine(s,sign){let p=s.split('|');if(p.length!==2)throw Error('Separate two matrices using |');let a=parse(p[0]),b=parse(p[1]);if(a.length!==b.length||a[0].length!==b[0].length)throw Error('Matrices must have matching dimensions');return show(a.map((r,i)=>r.map((v,j)=>v+sign*b[i][j])))}
function inverse(s){let a=parse(s),n=a.length;if(a[0].length!==n)throw Error('Inverse requires square matrix');let m=a.map((r,i)=>r.concat(Array.from({length:n},(_,j)=>+(i===j))));for(let k=0;k<n;k++){let p=k;for(let i=k+1;i<n;i++)if(Math.abs(m[i][k])>Math.abs(m[p][k]))p=i;if(Math.abs(m[p][k])<1e-12)throw Error('Singular matrix has no inverse');[m[k],m[p]]=[m[p],m[k]];let v=m[k][k];for(let j=0;j<2*n;j++)m[k][j]/=v;for(let i=0;i<n;i++)if(i!==k){let f=m[i][k];for(let j=0;j<2*n;j++)m[i][j]-=f*m[k][j]}}return show(m.map(r=>r.slice(n)))}
function eigen2(s){let a=parse(s);if(a.length!==2||a[0].length!==2)throw Error('Eigenvalues currently support 2 by 2 matrices');let t=a[0][0]+a[1][1],d=a[0][0]*a[1][1]-a[0][1]*a[1][0],disc=t*t-4*d;if(disc>=0){let q=Math.sqrt(disc);return 'λ = '+fmt((t+q)/2)+', '+fmt((t-q)/2)}return 'λ = '+fmt(t/2)+' ± '+fmt(Math.sqrt(-disc)/2)+'i'}
function run(op,s){if(op==='transpose')return transpose(s);if(op==='matadd')return combine(s,1);if(op==='matsub')return combine(s,-1);if(op==='inverse')return inverse(s);if(op==='eigen2')return eigen2(s);throw Error('Unknown matrix operation')}
root.casMatrixV631215={run,transpose,add:s=>combine(s,1),subtract:s=>combine(s,-1),inverse,eigen2};if(typeof module!=='undefined')module.exports=root.casMatrixV631215;
})(typeof globalThis!=='undefined'?globalThis:this);
