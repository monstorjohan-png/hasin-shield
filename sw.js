/* حصن — Service Worker: يعمل دون إنترنت */
var CACHE="hasin-v6";
var FILES=["./","./index.html","./styles.css","./app.js","./manifest.webmanifest","./icon-192.png","./icon-512.png"];
self.addEventListener("install",function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(FILES)}).then(function(){return self.skipWaiting()}));
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.map(function(k){return k!==CACHE?caches.delete(k):null}))}).then(function(){return self.clients.claim()}));
});
self.addEventListener("fetch",function(e){
  if(e.request.method!=="GET")return;
  e.respondWith(caches.match(e.request).then(function(hit){return hit||fetch(e.request).then(function(res){
    var copy=res.clone();caches.open(CACHE).then(function(c){c.put(e.request,copy)});return res;
  }).catch(function(){return caches.match("./index.html")})}));
});
