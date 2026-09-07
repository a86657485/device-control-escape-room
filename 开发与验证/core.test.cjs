const {test}=require('node:test');
const assert=require('node:assert/strict');
const {rooms,initial,check,finalAssessment,scoreAssessment}=require('./core.js');
const solutions=[
 [{lamp:true},{lamp:false,projector:true,curtain:true},{audio:true,volume:2}],
 [{fan:true,speed:3},{fan:true,speed:1},{fan:true,speed:1,timer:30}],
 [{washer:true,wmode:'脱水'},{washer:true,wmode:'快洗'},{cooker:true,cmode:'煮粥'}],
 [{role:'驾驶员',vehicle:true},{role:'交通管理部门',signal:'东西通行'},{role:'城市管理部门',street:true}],
 [{key:'齿形钥匙',oldOpen:true},{code:'246',smartOpen:true},{evolution:'控制方法改变，开门功能保留'}],
 [{lamp:false,projector:true,curtain:true},{fan:true,speed:2,timer:30},{audio:true,volume:1}]
];
for(let r=0;r<6;r++) for(let s=0;s<3;s++){
 test(`${r+1}-${s+1} accepts correct controls and rejects initial controls`,()=>{
 assert.equal(check(r,s,{...initial(),...solutions[r][s]}).ok,true);
 assert.equal(check(r,s,initial()).ok,false);
 });
}
test('power alone cannot satisfy washer mode',()=>assert.equal(check(2,0,{...initial(),washer:true}).ok,false));
test('timer mismatch cannot pass',()=>assert.equal(check(1,2,{...initial(),fan:true,speed:1,timer:60}).ok,false));
test('correct street device with wrong operator does not pass',()=>assert.equal(check(3,2,{...initial(),street:true,role:'驾驶员'}).ok,false));
test('each room has three tasks, three hints each and a reason question',()=>{
 assert.equal(rooms.length,6); for(const r of rooms){assert.equal(r.tasks.length,3);assert.equal(r.hints.length,3);assert.ok(r.question.options[r.question.correct]);}
});
test('final assessment mirrors the task sheet and requires every compact choice',()=>{
 assert.equal(finalAssessment.length,16);
 const incomplete=scoreAssessment({});
 assert.equal(incomplete.complete,false);
 assert.equal(incomplete.score,0);
 const answers={};
 for(const item of finalAssessment) answers[item.id]=item.correct;
 const complete=scoreAssessment({...answers,transferDevice:'电风扇',transferFunction:'促进空气流动',transferMethod:'打开电源并选择风速',transferEvidence:'观察气流是否让机关移动'});
 assert.equal(complete.complete,true);
 assert.equal(complete.score,16);
 assert.equal(complete.max,16);
});
test('assessment accepts a sentence assembled from choices without free text',()=>{
 const answers={}; for(const item of finalAssessment) answers[item.id]=item.correct;
 const result=scoreAssessment({...answers,transferDevice:'路灯',transferFunction:'提供夜间照明',transferMethod:'按照明开关',transferEvidence:'观察街道是否变亮'});
 assert.equal(result.transfer.complete,true);
 assert.match(result.transfer.sentence,/我会控制路灯/);
});
test('lighting descriptions accept equivalent wording and a simple fan switch is valid',()=>{
 for(const [device,func,method,evidence] of [['路灯','提供照明','按开关','观察街道是否变亮'],['照明灯','提供夜间照明','按照明开关','观察房间是否变亮'],['电风扇','促进空气流动','按开关','观察气流是否让机关移动']]){
  assert.equal(scoreAssessment({transferDevice:device,transferFunction:func,transferMethod:method,transferEvidence:evidence}).transfer.correct,true);
 }
});
test('transfer must match the selected device before assessment is passed',()=>{
 const answers=Object.fromEntries(finalAssessment.map(item=>[item.id,item.correct]));
 const result=scoreAssessment({...answers,transferDevice:'电风扇',transferFunction:'煮粥',transferMethod:'打开电源并选择风速',transferEvidence:'观察气流是否让机关移动'});
 assert.equal(result.ready,true);
 assert.equal(result.complete,false);
 assert.equal(result.transfer.correct,false);
});
test('out-of-range answer choices do not count as a completed assessment',()=>{
 const answers=Object.fromEntries(finalAssessment.map(item=>[item.id,99]));
 const result=scoreAssessment({...answers,transferDevice:'路灯',transferFunction:'提供夜间照明',transferMethod:'按照明开关',transferEvidence:'观察街道是否变亮'});
 assert.equal(result.ready,false);
});
test('all task briefs describe effects instead of giving target settings',()=>{
 for(const room of rooms)for(const task of room.tasks){
  assert.doesNotMatch(task.title+' '+task.goal,/设为|调到|改为.*挡|投影开|窗帘合|灯关|选择脱水|需要快洗|今天煮粥|选择“驾驶员”|匹配的齿形钥匙/);
  assert.equal(task.hints.length,3);
 }
});
test('failed runs describe observed effects without giving the target answer',()=>{
 for(const [r,s,c] of [[1,0,{fan:true,speed:1}],[1,2,{fan:true,speed:1,timer:60}],[2,0,{washer:true,wmode:'快洗'}],[3,1,{role:'驾驶员',signal:'东西通行'}],[4,1,{code:'123'}]]){
  const result=check(r,s,{...initial(),...c});assert.equal(result.ok,false);
  assert.doesNotMatch(result.text,/本次需要|请打开|需要3挡|需要 3 挡|本任务由|输入246|选择脱水/);
 }
});
test('assessment samples textbook extension and distributes answer positions',()=>{
 assert.ok(finalAssessment.filter(item=>item.group>=2).length>=8);
 assert.equal(new Set(finalAssessment.map(item=>item.correct)).size,3);
 for(const item of finalAssessment)assert.ok(item.explanation&&item.source);
});
