const {chromium}=require('playwright');
const {rooms}=require('./core.js');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const {pathToFileURL}=require('node:url');
const root=path.dirname(__dirname),out=path.join(__dirname,'浏览器验证');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,channel:process.env.PLAYWRIGHT_CHANNEL||undefined});try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});const p=await context.newPage(),errors=[],requests=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});p.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url())});
 await p.goto(pathToFileURL(path.join(root,'index.html')).href);await p.screenshot({path:path.join(out,'01-首页.png'),fullPage:true});
 assert.ok((await p.locator('.landing').evaluate(el=>getComputedStyle(el).backgroundImage)).includes('data:image/webp'));
 await p.getByRole('button',{name:'进入密室'}).click();assert.equal(await p.locator('.room-btn:disabled').count(),5);
 await p.getByRole('button',{name:'启动试运行'}).click();assert.match(await p.locator('.feedback').innerText(),/先选一个预测/);
 await p.locator('#prediction').selectOption({index:1});await p.getByRole('button',{name:'启动试运行'}).click();await p.locator('.feedback').filter({hasText:'昏暗'}).waitFor();assert.equal(await p.locator('[data-action="next-step"]').count(),0);
 await p.locator('[data-action="hint"]').click();assert.match(await p.locator('.hint-box').innerText(),/先读任务/);
 const toggle=async(k,v)=>{const el=p.locator(`[data-action="toggle"][data-key="${k}"]`);if((await el.getAttribute('aria-checked')==='true')!==v)await el.click();};
 const set=async(k,v)=>p.locator(`[data-action="set"][data-key="${k}"][data-value="${v}"]`).click();
 for(let r=0;r<6;r++){
  for(let s=0;s<3;s++){
   if(r===0){if(s===0)await toggle('lamp',true);if(s===1){await toggle('lamp',false);await toggle('projector',true);await toggle('curtain',true);}if(s===2){await toggle('audio',true);await set('volume',2);}}
   if(r===1){await toggle('fan',true);await set('speed',s===0?3:1);if(s===2)await set('timer',30);}
   if(r===2){if(s<2){await toggle('washer',true);await set('wmode',s===0?'脱水':'快洗');}else{await toggle('cooker',true);await set('cmode','煮粥');}}
   if(r===3){if(s===1){assert.equal(await p.locator('.moving-car').count(),0);await set('signal','南北通行');assert.equal(await p.locator('.moving-car').count(),0);}await set('role',['驾驶员','交通管理部门','城市管理部门'][s]);if(s===0)await toggle('vehicle',true);if(s===1)await set('signal','东西通行');if(s===2)await toggle('street',true);}
   if(r===4){if(s===0){await set('key','齿形钥匙');await p.locator('[data-action="old-lock"]').click();}if(s===1){await p.locator('.topbar [data-action="notebook"]').click();assert.match(await p.locator('#modal-body').innerText(),/光之晶：2 → 风之晶：4 → 序之晶：6/);await p.getByRole('button',{name:'关闭对话框',exact:true}).click();for(const n of [2,4,6]){const key=p.locator(`[data-action="digit"][data-digit="${n}"]`);await key.focus();await p.keyboard.press('Enter');assert.equal(await p.evaluate(()=>document.activeElement.dataset.focus),'digit-'+n);}await p.locator('[data-action="smart-lock"]').click();}if(s===2)await set('evolution','控制方法改变，开门功能保留');}
   if(r===5){if(s===0){await toggle('lamp',false);await toggle('projector',true);await toggle('curtain',true);}if(s===1){await toggle('fan',true);await set('speed',2);await set('timer',30);}if(s===2){await toggle('audio',true);await set('volume',1);}}
   await p.locator('#prediction').selectOption(rooms[r].tasks[s].expect);await p.locator('[data-action="run"]').click();await p.locator('[data-action="next-step"]').waitFor();
   if(r===1&&s===2){assert.match(await p.locator('.feedback').innerText(),/风扇停止/);await p.reload();await p.locator('[data-action="next-step"]').waitFor();}
   if(s===1)await p.screenshot({path:path.join(out,`房间${r+1}.png`),fullPage:true});
   await p.locator('[data-action="next-step"]').click();
  }
  const wrong=(rooms[r].question.correct+1)%3;await p.locator(`[data-answer="${wrong}"]`).click();assert.equal(await p.locator('.complete-panel').count(),0);
  await p.locator(`[data-answer="${rooms[r].question.correct}"]`).click();await p.locator('[data-action="next-room"]').waitFor();await p.locator('[data-action="next-room"]').click();
 }
 await p.getByText('出口已开启，探索还在继续。').waitFor();await p.screenshot({path:path.join(out,'08-通关成果.png'),fullPage:true});
 await p.locator('[data-action="creator"]').click();await p.locator('#challenge-reason').fill('羽片较轻，用小风，并按时停止。');await p.locator('[data-action="save-challenge"]').click();
 await p.locator('[data-action="peer-run"]').click();assert.match(await p.locator('#peer-result').innerText(),/还没有满足/);
 await p.locator('[data-action="peer-power"]').click();await p.locator('#peer-speed').selectOption('1');await p.locator('#peer-timer').selectOption('30');await p.locator('[data-action="peer-run"]').click();
 await p.locator('[data-action="peer-start"]').click();await p.locator('[data-action="peer-power"]').click();await p.locator('#peer-speed').selectOption('1');await p.locator('#peer-timer').selectOption('30');await p.locator('[data-action="peer-run"]').click();await p.locator('#peer-feedback').fill('任务清楚，可以增加羽片重量提示。');
 await p.locator('#modal [data-action="creator"]').click();await p.locator('#challenge-revision').fill('补充羽片较轻的说明。');await p.locator('[data-action="save-challenge"]').click();
 await p.getByRole('button',{name:'关闭对话框',exact:true}).click();await p.locator('.topbar [data-action="notebook"]').click();await p.locator('#team-name').fill('星光测试组');await p.locator('#reflection').fill('我用开关启动风扇，再选风速，并观察气流变化。');
 const downloadPromise=p.waitForEvent('download');await p.locator('#modal [data-action="export"]').click();const dl=await downloadPromise;await dl.saveAs(path.join(out,'学习证据报告-测试.html'));const report=fs.readFileSync(path.join(out,'学习证据报告-测试.html'),'utf8');assert.match(report,/同伴试验1次；通过是/);assert.match(report,/星光测试组/);
 await p.getByRole('button',{name:'关闭对话框',exact:true}).click();await p.reload();await p.getByText('出口已开启，探索还在继续。').waitFor();
 for(const width of [390,768]){await p.setViewportSize({width,height:900});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await p.locator('[data-action="review"]').click();await p.screenshot({path:path.join(out,`窄屏-${width}.png`),fullPage:true});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await p.locator('[data-action="room"][data-room="5"]').click();await p.locator('[data-action="next-room"]').click();}
 const noStorage=await browser.newContext({viewport:{width:390,height:844}});await noStorage.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked')}})});const ns=await noStorage.newPage();await ns.goto(pathToFileURL(path.join(root,'index.html')).href);assert.ok(await ns.locator('.save-warning').isVisible());await ns.getByRole('button',{name:'进入密室'}).click();await noStorage.close();
 assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);fs.writeFileSync(path.join(out,'测试结果.json'),JSON.stringify({result:'PASS',mainTasks:18,explanationChecks:6,wrongOperationBlocked:true,wrongExplanationBlocked:true,timerStops:true,refreshResumesPending:true,keyboardCodeFocus:true,trafficAnimationObeysSignal:true,peerEvidenceSurvivesNoteEdit:true,exportVerified:true,viewports:[1440,768,390],storageFailureHandled:true,externalRequests:requests,pageErrors:errors},null,2));console.log('PASS: 18操作/6解释，错误分支、定时停止、刷新恢复、键盘、同伴验证、导出、窄屏、禁用存储、零外部请求。');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
