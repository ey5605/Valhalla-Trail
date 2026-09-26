const SHELL='valhalla-launcher-61de2063d8a1';
const HOME=new URL('./index.html',self.registration.scope).href;
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const response=await fetch(HOME,{cache:'no-store'});if(!response.ok)throw Error('Launcher unavailable');
 const cache=await caches.open(SHELL);await cache.put(HOME,response);await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url),root=new URL(self.registration.scope);
 if(event.request.method!=='GET'||event.request.mode!=='navigate'||url.origin!==root.origin||!(url.pathname===root.pathname||url.href.split('?')[0]===HOME))return;
 event.respondWith((async()=>{const cache=await caches.open(SHELL);return await cache.match(HOME)||fetch(event.request);})());
});

