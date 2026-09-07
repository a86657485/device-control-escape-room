/* Shared control rules. Illustrative game states are not physical measurements. */
const EscapeCore = (() => {
const initial=()=>({lamp:false,projector:false,curtain:false,audio:false,volume:0,fan:false,speed:0,timer:0,washer:false,wmode:'未选择',cooker:false,cmode:'未选择',role:'未选择',vehicle:false,signal:'全部停止',street:false,key:'未选择',oldOpen:false,code:'',smartOpen:false,evolution:'未选择'});
const rooms=[
 {name:'光影入口',tag:'LIGHT & SOUND',icon:'◈',key:'光之晶',color:'#f3ce86',intro:'门上写着：先让房间回应你。灯光、影像与声音里，藏着第一枚晶石。',tasks:[
 {title:'照亮调查台',goal:'打开照明灯，找出暗处的调查笔记。',device:'照明灯',method:'按照明开关',effect:'灯亮，提供照明',expect:'暗处会变亮'},
 {title:'让隐藏图案显现',goal:'启动投影，合上窗帘，并关闭照明灯，让幕布上的图案清楚显现。',device:'投影设备、照明灯、窗帘',method:'打开投影，合上窗帘，关闭照明',effect:'幕布图案更清晰',expect:'投影图案更容易看清'},
 {title:'听见房间的回应',goal:'打开音频播放器，把音量设为 2 格，让线索广播清楚播放。声音也有可见提示。',device:'播放器',method:'开启播放，音量设为 2 格',effect:'播放线索音频',expect:'播放器开始播放'}],
 hints:['先读任务中“要发生什么变化”，再找相应设备。','电源、模式、环境条件可能都要调整，单开电源不一定够。','第1步开灯；第2步投影开、窗帘合、灯关；第3步播放开、音量2。'],
 question:{title:'为什么启动投影后，还要调整窗帘和照明？',options:['为了减少环境光对观看投影的影响','因为窗帘可以给投影设备供电','因为所有设备必须同时打开'],correct:0,explain:'控制设备要服务于具体需要。投影负责显示，窗帘和照明调整观看环境。'}},
 {name:'风力机关室',tag:'WIND MECHANISM',icon:'✧',key:'风之晶',color:'#77d5c3',intro:'一枚晶石困在风力机关中。试试风速、开关和定时如何改变风扇的工作。',tasks:[
 {title:'推动重型叶轮',goal:'开启风扇，风速设为 3 挡，让模拟叶轮转起来。',device:'电风扇',method:'开启电源，风速3挡',effect:'较强气流推动模拟叶轮',expect:'叶轮转动加快'},
 {title:'轻送线索羽片',goal:'风太大会吹走羽片。保持风扇运行，把风速减到 1 挡。',device:'电风扇',method:'把风速减到1挡',effect:'风速减小，羽片平稳移动',expect:'气流变弱'},
 {title:'设置自动停机',goal:'保持 1 挡，定时 30 分钟。试运行会快进时间，观察到时是否停止。',device:'电风扇',method:'保持1挡，定时30分钟',effect:'到设定时间后停止',expect:'30分钟后停止转动'}],
 hints:['观察风扇状态、风速和定时三个位置。','不同任务需要不同风速；定时控制的是停止工作的时间。','第1步风扇开、3挡；第2步改1挡；第3步仍开、1挡、定时30分钟。'],
 question:{title:'风扇这一组操作说明了什么？',options:['风速越大，任何任务都完成得越好','控制方法要与需要实现的功能相对应','风扇能像空调制冷一样直接降低室温'],correct:1,explain:'风速和定时分别满足不同需求。风扇促进空气流动，不能把它当作空调制冷。'}},
 {name:'模式密码间',tag:'MODE WORKSHOP',icon:'▧',key:'序之晶',color:'#bca7ea',intro:'不同模式会唤醒不同机关。读懂任务，分清“设备启动了”和“功能选对了”。',tasks:[
 {title:'取出脱水图案',goal:'衣服已经洗好，只需要脱水。启动洗衣机，选择合适模式。',device:'洗衣机',method:'开启电源，选择脱水',effect:'执行脱水功能',expect:'洗衣机执行脱水'},
 {title:'唤醒快洗符号',goal:'另一份任务需要快洗。保持洗衣机启动，改用快洗模式。',device:'洗衣机',method:'选择快洗模式',effect:'执行快洗功能',expect:'洗衣机执行快洗'},
 {title:'选对早餐任务',goal:'任务写着“今天煮粥”。启动电饭锅，选择对应功能。',device:'电饭锅',method:'开启电源，选择煮粥',effect:'执行煮粥功能',expect:'电饭锅执行煮粥'}],
 hints:['每个面板都有电源和模式，两者都要检查。','同一台洗衣机可以执行不同功能，电饭锅也是如此。','洗衣机开+脱水；随后改快洗；最后电饭锅开+煮粥。'],
 question:{title:'为什么“洗衣机已通电”还不能证明任务完成？',options:['通电就一定进入所需模式','所有模式的作用都相同','还要选对模式，检查是否实现所需功能'],correct:2,explain:'电源开启不等于模式正确。要根据需求选择控制方法，并观察工作结果。'}},
 {name:'城市控制舱',tag:'CITY OBSERVATORY',icon:'⌘',key:'城之晶',color:'#9fcbe8',intro:'透过观察窗，城市正有序运行。找到谁在控制什么，完成三份模拟调度任务。',tasks:[
 {title:'驾驶员出发',goal:'选择“驾驶员”角色，启动模拟车辆，让车辆出发。',device:'车辆',method:'驾驶员控制车辆启动',effect:'车辆出发',expect:'模拟车辆移动'},
 {title:'东西方向通行',goal:'切换为交通管理部门，把模拟交通信号设为“东西通行”。',device:'交通信号灯',method:'交通管理部门设置信号灯',effect:'东西方向通行，南北方向停止',expect:'东西车辆有序通行'},
 {title:'提供夜间照明',goal:'切换为城市管理部门，打开路灯，为夜间通行提供照明。',device:'路灯',method:'城市管理部门控制路灯',effect:'街道得到照明',expect:'路灯亮起'}],
 hints:['先确定任务里的使用者或管理者，再选择设备。','车辆负责出行、信号灯组织通行、路灯提供照明。','驾驶员+车辆启动；交通管理部门+东西通行；城市管理部门+路灯开启。'],
 question:{title:'这些设备为什么都可以在本阶段看作控制系统？',options:['只有能够上网的设备才是控制系统','它们由部件组成，按一定规则运行并实现功能','因为它们必须由同一个人操作'],correct:1,explain:'生活中的很多设备都可以看作控制系统。它们按一定规则工作，完成相应功能，不要求必须联网。'}},
 {name:'时间锁档案室',tag:'TIME ARCHIVE',icon:'⌛',key:'时之晶',color:'#efb987',intro:'一边是机械钥匙，一边是电子密码。体验不同控制方式，找出改变与保留。',tasks:[
 {title:'开启机械门锁',goal:'查看锁孔提示，选择匹配的齿形钥匙，再按“转动钥匙”。',device:'机械门锁',method:'匹配的齿形钥匙插入并转动',effect:'机械门锁打开',expect:'匹配钥匙使锁打开'},
 {title:'开启智能门锁',goal:'前三枚晶石各有一个数字。在线索簿中按获得顺序组合，输入后按“验证开锁”。',device:'智能门锁',method:'输入正确密码并验证',effect:'智能门锁打开',expect:'正确密码验证后开锁'},
 {title:'保存发展档案',goal:'比较两次开锁，选择最符合观察结果的一条档案结论。',device:'门锁的发展',method:'比较机械钥匙和电子密码操作',effect:'发现控制方式变化与功能延续',expect:'控制方式变化，基本功能保留'}],
 hints:['旧锁孔旁有形状提示；智能锁密码藏在前三枚晶石上。','机械锁需要匹配钥匙；智能锁输入完成后还要验证。','齿形钥匙并转动；输入246并验证；选择“控制方法改变，开门功能保留”。'],
 question:{title:'从机械门锁到智能门锁，哪种认识更合理？',options:['控制方式发展带来便利，仍需考虑适用条件','智能门锁在所有情况下都更安全','出现智能门锁后机械门锁就没有用途'],correct:0,explain:'科技发展改进控制方式、带来便利。不同形式可以并存，选择还要考虑供电、使用条件与安全需求。'}},
 {name:'终局 · 出口控制台',tag:'THE FINAL GATE',icon:'⬡',key:'探索者印记',color:'#f3ce86',intro:'五枚晶石已经点亮出口。把掌握的控制方法迁移到新任务，让大门真正回应你。',tasks:[
 {title:'显示出口地图',goal:'让地图投影清楚显示：投影开、窗帘合、照明关。',device:'投影设备、照明灯、窗帘',method:'按观看地图需要组合控制',effect:'显示清晰出口地图',expect:'地图清晰显示'},
 {title:'运送出口钥匙',goal:'模拟传送机关需要风扇 2 挡，并定时 30 分钟停止。启动风扇并完成设置。',device:'电风扇',method:'启动，设置2挡和定时30分钟',effect:'传送钥匙后按时停止',expect:'以2挡运行并在30分钟后停止'},
 {title:'播放轻声通行提示',goal:'打开播放器，把音量设为 1 格，让出口提示轻声播放。',device:'播放器',method:'开启播放，音量1格',effect:'轻声播放通行提示',expect:'播放器以较低音量播放'}],
 hints:['每个任务都可以在前面的控制线索簿中找到类似经历。','根据新需求调整数值：这里风速2挡，音量1格。','投影开+窗帘合+灯关；风扇开+2挡+定时30；播放开+音量1。'],
 question:{title:'如果遇到一个没用过的设备，你会怎样开始？',options:['把所有按钮都按一遍，不看变化','先了解需要的功能与控制方法，再操作并观察结果','只记住设备名称就可以了'],correct:1,explain:'先明确需求，再选择控制方法，通过观察结果验证是否实现功能。这种方法可以迁移到新设备。'}}
];
const finalAssessment=[
 {id:'deviceFunction',label:'设备—功能—控制方法',prompt:'洗衣机已经通电，衣物需要脱水，下一步应怎样做？',options:['只等待设备自己改变模式','选择“脱水”模式并观察是否执行','把电饭锅切换到煮粥'],correct:1,evidence:'能根据需要选择设备功能和控制方法。'},
 {id:'controlNeed',label:'根据需要调整',prompt:'轻羽片容易被吹走时，哪种控制更合适？',options:['风速越大越好','减小风速，并根据需要设置定时','只要打开电源就完成'],correct:1,evidence:'能让控制方法服务于具体任务。'},
 {id:'publicDevice',label:'街道上的设备',prompt:'为了让十字路口车辆有序通行，谁控制什么设备？',options:['驾驶员控制路灯','交通管理部门控制交通信号灯','任何路人都可以修改信号灯'],correct:1,evidence:'能把公共场景中的角色、设备和功能对应起来。'},
 {id:'observeResult',label:'观察与调整',prompt:'按下设备按钮后，怎样判断控制是否有效？',options:['按钮按下就算完成','观察设备结果是否满足任务，再决定是否调整','不需要观察结果'],correct:1,evidence:'能用“控制—观察—调整”验证功能。'},
 {id:'evolution',label:'设备的发展',prompt:'从机械钥匙门锁到智能门锁，哪种说法更合理？',options:['智能门锁出现后机械锁就没有用途','控制方式发生变化，开门功能基本保留','两种门锁的控制方法完全相同'],correct:1,evidence:'能说明控制方式发展与功能延续。'}
];
function scoreAssessment(answers={}){
 const details=finalAssessment.map(item=>({id:item.id,correct:answers[item.id]===item.correct}));
 const score=details.filter(item=>item.correct).length;
 const transferKeys=['transferDevice','transferFunction','transferMethod','transferEvidence'];
 const transferComplete=transferKeys.every(key=>typeof answers[key]==='string'&&answers[key].trim());
 const transfer=transferComplete?{complete:true,sentence:`我会控制${answers.transferDevice}，让它${answers.transferFunction}。我会${answers.transferMethod}，并通过${answers.transferEvidence}判断是否成功。`}:{complete:false,sentence:''};
 const ready=details.every(item=>answers[item.id]!==undefined)&&transfer.complete;
 return {ready,complete:details.every(item=>item.correct)&&transfer.complete,score,max:finalAssessment.length,details,transfer};
}
function check(r,s,c){
 const yes=()=>({ok:true,text:rooms[r].tasks[s].effect});
 const no=text=>({ok:false,text});
 if(r===0||r===5){
  if(s===0&&r===0)return c.lamp?yes():no('房间仍然昏暗。照明灯还没有打开，试试照明开关。');
  if(s===(r===0?1:0))return !c.projector?no('投影还没启动，幕布上没有影像。'):!c.curtain?no('窗外光线仍在影响观看，试着合上窗帘。'):c.lamp?no('照明灯仍然亮着，调整照明再观察。'):yes();
  if(s===2)return !c.audio?no('播放器尚未播放。先开启播放。'):c.volume!==(r===0?2:1)?no(`播放器已启动，但任务要求音量 ${r===0?2:1} 格。`):yes();
 }
 if(r===1||(r===5&&s===1)){
  const target=r===5?2:s===0?3:1;
  if(!c.fan)return no('风扇没有运行，请打开电源。');
  if(c.speed!==target)return no(`风扇在 ${c.speed} 挡。观察任务需要：本次需要 ${target} 挡。`);
  if((s===2||r===5)&&c.timer!==30)return no(`定时为 ${c.timer||'未设置'}${c.timer?'分钟':''}，还不能在任务要求的30分钟后停止。`);
  return yes();
 }
 if(r===2){const dev=s===2?'cooker':'washer',mode=s===2?'煮粥':s===1?'快洗':'脱水';return !c[dev]?no('设备还未启动，先检查相应电源。'):c[s===2?'cmode':'wmode']!==mode?no(`设备已启动，但模式不符合任务。本次需要“${mode}”。`):yes();}
 if(r===3){const roles=['驾驶员','交通管理部门','城市管理部门'];if(c.role!==roles[s])return no(`先想一想：谁负责这项工作？本任务由${roles[s]}控制相应设备。`);return (s===0?c.vehicle:s===1?c.signal==='东西通行':c.street)?yes():no(['车辆还未启动。','信号状态还不符合东西方向通行的要求。','路灯还未打开，夜间照明任务未完成。'][s]);}
 if(r===4)return (s===0?c.key==='齿形钥匙'&&c.oldOpen:s===1?c.code==='246'&&c.smartOpen:c.evolution==='控制方法改变，开门功能保留')?yes():no(['需要匹配的齿形钥匙，并实际转动钥匙。','输入246后，还要按验证开锁；输错可以清除重来。','回想两种操作：开门的基本功能保留，控制方法发生了变化。'][s]);
 return no('请回到当前任务重新观察。');
}
return {rooms,initial,check,finalAssessment,scoreAssessment};
})();
if(typeof module!=='undefined')module.exports=EscapeCore;
