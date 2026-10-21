/* V631.2.7 safe offline expression parser: no eval or dynamic code execution. */
(function(root){'use strict';
const previous=root.offlineIndependent;
function evaluate(source){
 if(typeof source!=='string'||source.length>500)throw Error('Expression must be 1–500 characters');
 const s=source.replace(/π/g,'pi').replace(/−/g,'-').replace(/×/g,'*').replace(/÷/g,'/').replace(/\*\*/g,'^');
 const tokens=[];let i=0;while(i<s.length){if(/\s/.test(s[i])){i++;continue}let m=s.slice(i).match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/);if(m){tokens.push({type:'num',value:Number(m[0])});i+=m[0].length;continue}m=s.slice(i).match(/^[a-zA-Z]+/);if(m){tokens.push({type:'name',value:m[0].toLowerCase()});i+=m[0].length;continue}if('+-*/^(),'.includes(s[i])){tokens.push({type:s[i]});i++;continue}throw Error('Unsupported character: '+s[i])}
 let pos=0,depth=0;function peek(){return tokens[pos]?.type}function take(t){if(peek()!==t)throw Error('Expected '+t);pos++}function expression(){let v=term();while(peek()==='+'||peek()==='-'){let op=tokens[pos++].type,w=term();v=op==='+'?v+w:v-w}return v}
 function term(){let v=unary();while(peek()==='*'||peek()==='/'){let op=tokens[pos++].type,w=unary();if(op==='/'&&w===0)throw Error('Division by zero');v=op==='*'?v*w:v/w}return v}
 function unary(){if(peek()==='+'){pos++;return unary()}if(peek()==='-'){pos++;return -unary()}return power()}
 function power(){let v=primary();if(peek()==='^'){pos++;v=Math.pow(v,unary())}return v}
 const funcs={sin:Math.sin,cos:Math.cos,tan:Math.tan,asin:Math.asin,acos:Math.acos,atan:Math.atan,sqrt:Math.sqrt,abs:Math.abs,exp:Math.exp,ln:Math.log,log:Math.log10,log10:Math.log10,floor:Math.floor,ceil:Math.ceil};
 function primary(){if(++depth>80)throw Error('Expression nesting limit exceeded');try{let t=tokens[pos++];if(!t)throw Error('Incomplete expression');if(t.type==='num')return t.value;if(t.type==='('){let v=expression();take(')');return v}if(t.type==='name'){if(t.value==='pi')return Math.PI;if(t.value==='e')return Math.E;if(!(t.value in funcs))throw Error('Unknown function or constant: '+t.value);take('(');let arg=expression();take(')');return funcs[t.value](arg)}throw Error('Unexpected token: '+t.type)}finally{depth--}}
 if(!tokens.length)throw Error('Empty expression');let result=expression();if(pos!==tokens.length)throw Error('Unexpected trailing input');if(!Number.isFinite(result))throw Error('Result is undefined or outside supported range');return String(Number(result.toPrecision(13)))}
 function run(op,s,v){if(op==='expression'||op==='calculate'||op==='trig')return evaluate(s);return previous(op,s,v)}
 root.offlineIndependent=run;root.casExpressionEvaluate=evaluate;if(typeof module!=='undefined')module.exports={evaluate,offlineIndependent:run};
})(typeof globalThis!=='undefined'?globalThis:this);
