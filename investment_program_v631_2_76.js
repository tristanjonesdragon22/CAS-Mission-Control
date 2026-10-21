(function(root){'use strict';
const market=typeof module!=='undefined'&&module.exports?require('./market_research_v631_2_68.js'):root.casMarketResearchV631268;
const custom=typeof module!=='undefined'&&module.exports?require('./custom_investment_v631_2_75.js'):root.casCustomInvestmentV631275;
function parse(text,tickers){
 if(typeof text!=='string'||!text.trim()||text.length>4000)throw Error('Describe a method in 4000 characters or less.');
 if(!Array.isArray(tickers)||!tickers.length)throw Error('Import historical prices first.');
 const original=text.trim();let s=original.toLowerCase();
 const cap=s.match(/(?:invest|start with|starting with)\s*\$?([\d,]+(?:\.\d+)?)/);const capital=cap?Number(cap[1].replaceAll(',','')):10000;
 const fm=s.match(/(?:fee|transaction cost)\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*%/);const fee=fm?Number(fm[1])/100:0.001;
 const bm=s.match(/(?:buy|invest)\s+(\d+(?:\.\d+)?)\s*%\s+(?:of\s+)?(?:my\s+)?(?:available\s+)?(?:cash|money|capital)\s+(?:per\s+purchase|each\s+(?:time|purchase))?/);
 const sm=s.match(/sell\s+(\d+(?:\.\d+)?)\s*%\s+(?:of\s+)?(?:my\s+)?(?:held\s+)?(?:shares|position|holdings)\s+(?:per\s+sale|each\s+(?:time|sale))?/);
 const buyFraction=bm?Number(bm[1])/100:1,sellFraction=sm?Number(sm[1])/100:1;
 if(!Number.isFinite(capital)||capital<=0||capital>1e10)throw Error('Invalid investment amount.');
 if(!Number.isFinite(fee)||fee<0||fee>=1)throw Error('Invalid trading fee.');
 if(![buyFraction,sellFraction].every(v=>Number.isFinite(v)&&v>0&&v<=1))throw Error('Purchase and sale percentages must be above 0 and at most 100%.');
 const stock=s.match(/(?:stock|ticker|shares of)\s+([a-z][a-z0-9._-]*)/);
 let selected=stock?[tickers.find(t=>t.toLowerCase()===stock[1].replace(/\.$/,''))]:tickers.slice();
 if(selected.some(x=>!x))throw Error('Specified ticker is not in the imported CSV.');
 // Conditions must be explicitly assigned to BUY or SELL; OR and AND work inside each action.
 const clauses=s.split(/(?<!\d)\.(?!\d)|\bthen\b/).map(x=>x.trim()).filter(Boolean);
 const actions={buy:[],sell:[]};let recognized=[];
 const rulePatterns=[
  {kind:'drop',re:/^(?:the\s+)?price\s+(?:drops?|falls?|declines?)\s+(?:by\s+)?(\d+(?:\.\d+)?)\s*%\s*(?:in|over)\s+(\d+)\s+days?$/},
  {kind:'rise',re:/^(?:the\s+)?price\s+(?:rises?|gains?|increases?)\s+(?:by\s+)?(\d+(?:\.\d+)?)\s*%\s*(?:in|over)\s+(\d+)\s+days?$/},
  {kind:'average',re:/^(?:the\s+)?price\s+(?:is\s+)?(above|below)\s+(?:its\s+|the\s+)?(\d+)\s*[- ]?day\s+(?:moving\s+)?average$/},
  {kind:'cross',re:/^(?:the\s+)?(\d+)\s*[- ]?day\s+(?:moving\s+)?average\s+(?:is\s+)?(above|below)\s+(?:the\s+)?(\d+)\s*[- ]?day\s+(?:moving\s+)?average$/}
 ];
 for(let clause of clauses){clause=clause.replace(/(?:invest|start with|starting with)\s*\$?[\d,]+(?:\.\d+)?/g,'').replace(/(?:fee|transaction cost)\s*(?:of\s*)?\d+(?:\.\d+)?\s*%/g,'').replace(/(?:stock|ticker|shares of)\s+[a-z][a-z0-9._-]*/g,'').replace(/(?:buy|invest)\s+\d+(?:\.\d+)?\s*%\s+(?:of\s+)?(?:my\s+)?(?:available\s+)?(?:cash|money|capital)\s+(?:per\s+purchase|each\s+(?:time|purchase))?/g,'').replace(/sell\s+\d+(?:\.\d+)?\s*%\s+(?:of\s+)?(?:my\s+)?(?:held\s+)?(?:shares|position|holdings)\s+(?:per\s+sale|each\s+(?:time|sale))?/g,'').replace(/\b(?:and|with|use|a|an|for|my|strategy|method|please|i want to|i would like to)\b\s*$/g,'').replace(/^[\s.,;]+|[\s.,;]+$/g,'').trim();
  if(!clause||/^(?:and|with|use|a|an|for|my|strategy|method|please|in|the|i want to|i would like to|\s)+$/.test(clause))continue;
  const match=clause.match(/\b(buy|sell)\s+(?:when|if)\s+/);if(!match)throw Error('Unrecognized instruction: '+clause);
  const action=match[1],prefix=clause.slice(0,match.index).trim();if(prefix&&!/^(?:and|also|please)\s*$/.test(prefix))throw Error('Unrecognized instruction: '+prefix);
  const condition=clause.slice(match.index+match[0].length).trim();
  const pieces=condition.split(/\s+(and|or)\s+/).map(x=>x.trim()).filter(Boolean);if(!pieces.length||pieces.length%2===0)throw Error('Incomplete condition: '+condition);
  let group=[];for(let i=0;i<pieces.length;i+=2){const p=pieces[i];let rule=null;for(const pattern of rulePatterns){const m=p.match(pattern.re);if(!m)continue;if(pattern.kind==='drop'||pattern.kind==='rise')rule={kind:pattern.kind,pct:Number(m[1]),days:Number(m[2])};else if(pattern.kind==='average')rule={kind:'average',direction:m[1],days:Number(m[2])};else rule={kind:'cross',fast:Number(m[1]),direction:m[2],slow:Number(m[3])};break;}
   if(!rule)throw Error('Unsupported '+action.toUpperCase()+' condition: '+p);
   if((rule.pct!==undefined&&(!(rule.pct>0)||rule.pct>100))||[rule.days,rule.fast,rule.slow].filter(v=>v!==undefined).some(v=>!Number.isInteger(v)||v<1||v>250)||((rule.kind==='average'||rule.kind==='cross')&&[rule.days,rule.fast,rule.slow].filter(v=>v!==undefined).some(v=>v<2)))throw Error('Invalid condition range.');
   if(i>0&&pieces[i-1]==='or'){actions[action].push(group);group=[];}group.push(rule);
  }actions[action].push(group);recognized.push(action+' when '+condition);
 }
 if(!actions.buy.length||!actions.sell.length)throw Error('Describe at least one BUY and one SELL rule.');
 return {version:'V631.2.76',tickers:selected,capital,fee,buyFraction,sellFraction,buy:actions.buy,sell:actions.sell,recognized,execution:'Prior closing-price signal, next closing-price fill',logic:'OR between groups; AND within each group',warning:'Historical research only; no live orders, taxes, spreads, or forecasts.'};
}
function matches(groups,prices,i){return groups.some(group=>group.every(rule=>custom.signal(rule,prices,i)));}
function simulate(csv,description){const data=market.prices(csv),plan=parse(description,data.tickers);const indexes=plan.tickers.map(t=>data.tickers.indexOf(t));let cash=plan.capital,shares=Array(indexes.length).fill(0),trades=[],curve=[plan.capital],peak=plan.capital,dd=0,fees=0;
 for(let i=1;i<data.rows.length;i++){const prices=indexes.map(j=>data.rows.map(row=>row.values[j]));const today=prices.map(p=>p[i]);
 // Sell before buying; portfolio remains cash-constrained; only one transaction per ticker per day.
 for(let j=0;j<indexes.length;j++){if(shares[j]>1e-12&&matches(plan.sell,prices[j],i-1)){const quantity=shares[j]*plan.sellFraction,gross=quantity*today[j],fee=gross*plan.fee;shares[j]-=quantity;cash+=gross-fee;fees+=fee;trades.push({date:data.rows[i].date,ticker:plan.tickers[j],action:'SELL',quantity,price:today[j],fee});}}
 const eligible=[];for(let j=0;j<indexes.length;j++)if(matches(plan.buy,prices[j],i-1))eligible.push(j);
 // Equal cash budget among all eligible symbols, no dependence on ticker ordering.
 const budget=cash*plan.buyFraction/(eligible.length||1);for(const j of eligible){const spend=Math.min(budget,cash),fee=spend*plan.fee,quantity=(spend-fee)/today[j];if(quantity<=1e-12)continue;shares[j]+=quantity;cash-=spend;fees+=fee;trades.push({date:data.rows[i].date,ticker:plan.tickers[j],action:'BUY',quantity,price:today[j],fee});}
 const equity=cash+shares.reduce((sum,q,j)=>sum+q*today[j],0);curve.push(equity);peak=Math.max(peak,equity);dd=Math.min(dd,equity/peak-1);
 }
 const final=curve.at(-1);return {version:'V631.2.76',plan,observations:data.rows.length,results:{final,returnPct:(final/plan.capital-1)*100,maxDrawdownPct:dd*100,feesPaid:fees,trades,curve,remainingCash:cash,remainingShares:Object.fromEntries(plan.tickers.map((t,i)=>[t,shares[i]]))},warning:'Historical closing-price simulation; same-price close execution after prior close signal, fractional shares, no slippage, liquidity constraints, dividends or taxes. Not a forecast.'};}
const api={parse,matches,simulate};root.casInvestmentProgramV631276=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(typeof document==='undefined')return;const $=id=>document.getElementById(id),out=$('cas76Output');if(!out)return;let latest=null;function csv(){const v=$('cas76CSV').value.trim()||$('cas75CSV')?.value.trim()||$('cas69CSV')?.value.trim();if(!v)throw Error('Paste historical CSV prices first.');return v;}function show(fn){try{latest=fn();out.textContent=JSON.stringify(latest,null,2);localStorage.setItem('cas-v631-2-76-last',JSON.stringify({description:$('cas76Description').value,report:latest}));}catch(e){out.textContent='No simulation: '+e.message;}}$('cas76Preview').onclick=()=>show(()=>parse($('cas76Description').value,market.prices(csv()).tickers));$('cas76Run').onclick=()=>show(()=>simulate(csv(),$('cas76Description').value));$('cas76Restore').onclick=()=>{try{const v=JSON.parse(localStorage.getItem('cas-v631-2-76-last'));$('cas76Description').value=v.description;latest=v.report;out.textContent=JSON.stringify(latest,null,2);}catch(e){out.textContent='No saved report.';}};$('cas76Export').onclick=()=>{if(!latest)return out.textContent='Run or preview first.';const url=URL.createObjectURL(new Blob([JSON.stringify(latest,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='cas-v631-2-76-investment.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
})(typeof globalThis!=='undefined'?globalThis:this);
