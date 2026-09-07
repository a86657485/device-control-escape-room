const {test}=require('node:test');
const assert=require('node:assert/strict');
const {rooms,initial,check}=require('./core.js');
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
