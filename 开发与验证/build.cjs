const fs=require('node:fs'),path=require('node:path');
const root=path.dirname(__dirname);
const img=name=>'data:image/webp;base64,'+fs.readFileSync(path.join(root,'美术素材',name)).toString('base64');
const css=fs.readFileSync(path.join(__dirname,'style.css'),'utf8').replace('__HERO__',img('探险搭档与密室.webp')).replace('__ROOMS__',img('六间机关场景.webp')).replace('__GUIDE__',img('机械向导小序.webp'));
const scripts=['core.js','app.js'].map(n=>fs.readFileSync(path.join(__dirname,n),'utf8')).join('\n');
const html=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#101e25"><meta name="description" content="六年级信息科技设备控制密室闯关，观察、操作、取证与迁移。支持离线与局域网。"><title>机关密室 · 设备控制逃脱行动</title><style>${css}</style></head><body><main id="app"></main><dialog id="modal" class="modal" aria-labelledby="modal-title"><header class="modal-head"><h2 id="modal-title"></h2><button data-action="close" aria-label="关闭对话框">✕</button></header><div id="modal-body" class="modal-content"></div></dialog><div id="toast" class="toast" role="status" hidden></div><noscript>请使用启用 JavaScript 的浏览器打开游戏。</noscript><script>${scripts.replace(/<\/script/gi,'<\\/script')}</script></body></html>`;
fs.writeFileSync(path.join(root,'index.html'),html);console.log('已构建 index.html：'+(Buffer.byteLength(html)/1024/1024).toFixed(2)+' MB');
