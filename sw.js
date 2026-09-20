/* GHOST EDITZ — service worker (shows notifications; keep this file next to index.html) */
self.addEventListener('install', ()=>self.skipWaiting());
self.addEventListener('activate', e=>e.waitUntil(self.clients.claim()));
self.addEventListener('notificationclick', e=>{
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:'window', includeUncontrolled:true}).then(list=>{
    for(const c of list){
      c.postMessage({go:'updates'});
      if('focus' in c) return c.focus();
    }
    return self.clients.openWindow('./#updates');
  }));
});
