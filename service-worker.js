// Network-first HTML: index-only releases no longer require a cache version bump.
const CACHE='valhalla-trail-live-v3';
const HOME=new URL('./index.html',self.registration.scope).href;
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const names=await caches.keys();
  const legacy=names.includes('valhalla-trail-v2');
  await Promise.all(names.filter(name=>name.startsWith('valhalla-trail-')&&name!==CACHE).map(name=>caches.delete(name)));
  await self.clients.claim();
  // One-time recovery for pages still served by the old cache-first worker.
  if(legacy){
    const clients=await self.clients.matchAll({type:'window'});
    await Promise.all(clients.filter(client=>client.url.startsWith(self.registration.scope)).map(client=>client.navigate(client.url).catch(()=>{})));
  }
})()));
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
  if(request.mode!=='navigate'&&!url.pathname.endsWith('.html'))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    try{
      const response=await fetch(request,{cache:'no-store'});
      if(!response.ok)throw new Error('Game page unavailable');
      try{await cache.put(request,response.clone());}catch(_){}
      return response;
    }catch(_){
      return (await cache.match(request))||(await cache.match(HOME))||(await cache.match(self.registration.scope))||new Response('Connect to the internet to load Valhalla Trail.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
    }
  })());
});
