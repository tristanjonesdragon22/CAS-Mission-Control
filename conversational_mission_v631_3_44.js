(function(root){'use strict';
const P=root.CASMissionPlanner339||(typeof require==='function'?require('./mission_planner_v631_3_39.js'):null);
const B=root.CASMissionDirector338||(typeof require==='function'?require('./mission_director_v631_3_38.js'):null);
const D=root.CASEngineeringDesign343||(typeof require==='function'?require('./engineering_design_v631_3_43.js'):null);
const VERSION='631.3.44';
function check(v,m){if(!v)throw Error(m)}
function init(description){check(typeof description==='string'&&description.trim().length>=8,'Describe a mission (at least 8 characters)');let p=D.state(P.create(description));p.conversation={version:VERSION,messages:[],activeQuestion:null};return p}
function state(project){let p=D.state(project);if(!p.conversation)p.conversation={version:VERSION,messages:[],activeQuestion:null};check(Array.isArray(p.conversation.messages),'Invalid conversation');return p}
function status(project){let p=state(project),g=P.guide(p),n=B.next(p);return {version:VERSION,mission:p.description,progress:n.progress,nextTask:n.next,unanswered:g.questions,design:D.report(p).summary,limitations:['Offline rule-based command assistant; no general AI model','Does not independently certify engineering or complete physical tasks']}}
function respond(project,message){let p=state(project);check(typeof message==='string'&&message.trim()&&message.length<=2500,'Enter a message up to 2500 characters');let s=message.trim(),lower=s.toLowerCase(),answer='',kind='guidance';let g=P.guide(p),n=B.next(p);
if(p.conversation.activeQuestion!==null && !/^(next|status|progress|help|questions|design|skip|cancel|done|complete)\b/i.test(s)){
 const index=p.conversation.activeQuestion;p=P.answer(p,index,s);p.conversation.activeQuestion=null;answer='Saved your answer. '+(P.guide(p).questions.length?'There are more unanswered planning questions.':'Planning questions are answered. Ask for the next step.');kind='answer';
}else if(/\b(help|commands)\b/.test(lower)){answer='Try: next step, questions, status, design, complete step, or add note: [text]. I can guide existing mission tasks and record your answers, but cannot reason freely offline.'}
else if(/\b(questions?|clarif|ask me)\b/.test(lower)){const q=g.questions[0];if(q){const index=p.planning.questions.findIndex(x=>x.question===q.question&&!x.answer);p.conversation.activeQuestion=index;answer=q.question;kind='question'}else answer='No unanswered planning questions. Ask for the next step.'}
else if(/^(done|complete step|mark complete|finished)$/i.test(s)){if(!n.next)answer='No available task to complete.';else{p=B.edit(p,n.next.id,{status:'done',notes:'Marked complete by user through conversational assistant'});answer='Marked "'+n.next.title+'" complete based on your confirmation. This does not independently verify its acceptance criteria.';kind='task-update'}}
else if(/^add note\s*:/i.test(s)){let note=s.replace(/^add note\s*:/i,'').trim();check(note.length>0,'Note required');if(!n.next)answer='No active task for a note.';else{p=B.edit(p,n.next.id,{notes:note});answer='Saved your note on task: '+n.next.title;kind='task-note'}}
else if(/\b(status|progress)\b/.test(lower)){answer='Progress: '+n.progress.done+' of '+n.progress.total+' tasks completed. '+(n.next?'Next: '+n.next.title+'.':'No available task.');kind='status'}
else if(/\b(design|component|requirement)\b/.test(lower)){let d=D.report(p).summary;answer='Engineering design currently has '+d.requirements+' requirements, '+d.components+' components, and '+d.prototypeSteps+' prototype steps. Open the engineering design laboratory to add detailed specifications.';kind='design'}
else if(/\b(next|start|step|what should i do|guide)\b/.test(lower)){if(g.questions.length)answer='Before proceeding, consider answering: '+g.questions[0].question+' Say "questions" to answer it.';else if(n.next)answer='Next task: '+n.next.title+'. '+n.next.instructions+' Acceptance criterion: '+n.next.acceptance+'. Tell me when it is complete, and retain evidence.';else answer='All tasks are complete or blocked. Review mission status and evidence.';kind='next-step'}
else{answer='I can guide this mission through its existing tasks. Try "next step" or "questions". Your message was not interpreted as an engineering instruction; no task was changed.';kind='fallback'}
p.conversation.messages.push({role:'user',text:s},{role:'assistant',text:answer,kind});if(p.conversation.messages.length>100)p.conversation.messages=p.conversation.messages.slice(-100);return {project:p,reply:answer,kind,overview:status(p)}}
function exportJSON(p){return JSON.stringify(state(p),null,2)}
function importJSON(s){check(typeof s==='string'&&s.length<=2000000,'Invalid JSON size');return state(JSON.parse(s))}
const api={VERSION,init,state,status,respond,exportJSON,importJSON};if(typeof module==='object'&&module.exports)module.exports=api;root.CASConversationalMission344=api;
})(typeof globalThis!=='undefined'?globalThis:this);
