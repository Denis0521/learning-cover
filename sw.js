const VER='cover-v5';
const CORE=['./','index.html','Manifest.js',
 'icon-192.png','icon-512.png','maskable-192.png','maskable-512.png','apple-touch-icon.png',
 'bg1-playground.jpg','bg2-outdoor.jpg','bg3-toys.jpg','bg4-space.jpg','bg5-train.jpg',
 'bg1-playground-thumb.jpg','bg2-outdoor-thumb.jpg','bg3-toys-thumb.jpg','bg4-space-thumb.jpg','bg5-train-thumb.jpg',
 'bg6-sports.jpg','bg7-music.jpg','bg8-jobs.jpg','bg9-origami.jpg',
 'bg6-sports-thumb.jpg','bg7-music-thumb.jpg','bg8-jobs-thumb.jpg','bg9-origami-thumb.jpg'];
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
      try{const r=await fetch(req,{cache:'reload'});const c=await caches.open(VER);c.put('index.html',r.clone());return r}
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
