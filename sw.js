const VER='cover-v1';
const CORE=['./','index.html','manifest.webmanifest',
 'icons/icon-192.png','icons/icon-512.png','icons/maskable-192.png','icons/maskable-512.png','icons/apple-touch-icon.png',
 'bg/bg1-playground.jpg','bg/bg2-outdoor.jpg','bg/bg3-toys.jpg','bg/bg4-space.jpg','bg/bg5-train.jpg',
 'bg/bg1-playground-thumb.jpg','bg/bg2-outdoor-thumb.jpg','bg/bg3-toys-thumb.jpg','bg/bg4-space-thumb.jpg','bg/bg5-train-thumb.jpg'];
const LIBS=['https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'];

self.addEventListener('install',e=>{
  e.waitUntil((async()=>{
    const c=await caches.open(VER);
    await c.addAll(CORE);
    await Promise.all(LIBS.map(u=>fetch(u).then(r=>r.ok&&c.put(u,r)).catch(()=>{})));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    for(const k of await caches.keys()) if(k!==VER) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  // 頁面：網路優先（有更新就拿新版），離線用快取
  if(req.mode==='navigate'){
    e.respondWith((async()=>{
      try{const r=await fetch(req);const c=await caches.open(VER);c.put('index.html',r.clone());return r}
      catch(_){return (await caches.match('index.html'))||(await caches.match('./'))}
    })());
    return;
  }
  // 其他（本站檔案、Google 字體、CDN 函式庫）：快取優先 + 背景更新
  e.respondWith((async()=>{
    const c=await caches.open(VER);
    const hit=await c.match(req,{ignoreSearch:true});
    const net=fetch(req).then(r=>{if(r&&(r.ok||r.type==='opaque'))c.put(req,r.clone());return r}).catch(()=>hit);
    return hit||net;
  })());
});
