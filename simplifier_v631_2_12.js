/* V631.2.12 bounded symbolic cleanup: formatting identities, not general CAS canonicalization. */
(function(root){'use strict';
function simplify(input){
 if(typeof input!=='string'||input.length>1500)throw Error('Expression too long');
 let s=input.replace(/\s+/g,'').replace(/−/g,'-');
 if(!/^[0-9a-zA-Z_+*/^().,-]+$/.test(s))throw Error('Unsupported symbols');
 let old;
 for(let pass=0;pass<20;pass++){
 old=s;
 s=s.replace(/\(0\)/g,'0').replace(/\(1\)/g,'1');
 s=s.replace(/\b1\*\(?([a-zA-Z][a-zA-Z0-9_]*)\)?/g,'$1');
 s=s.replace(/\b0\*\(?[a-zA-Z][a-zA-Z0-9_]*\)?/g,'0');
 s=s.replace(/\(([a-zA-Z][a-zA-Z0-9_]*)\)\*1\b/g,'$1');
 s=s.replace(/\b([a-zA-Z][a-zA-Z0-9_]*)\*1\b/g,'$1');
 s=s.replace(/\+0(?=\)|$|[+-])/g,'').replace(/\b0\+(?=[a-zA-Z(0-9])/g,'');
 s=s.replace(/\b([a-zA-Z][a-zA-Z0-9_]*)\^1\b/g,'$1');
 s=s.replace(/\b([a-zA-Z][a-zA-Z0-9_]*)\^0\b/g,'1');
 s=s.replace(/\(\(([a-zA-Z][a-zA-Z0-9_]*)\)\)/g,'($1)');
 if(s===old)break;
 }
 return s||'0';
}
root.casSimplifyResult=simplify;
if(typeof module!=='undefined')module.exports={simplify};
})(typeof globalThis!=='undefined'?globalThis:this);
