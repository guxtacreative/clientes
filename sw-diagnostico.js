/* Deixa o app do diagnóstico abrir mesmo com internet fraca na rua.
   Só cuida dos arquivos abaixo; o resto do Hub passa direto, sem cache. */
const CACHE="diag-v1";
const ARQ=["diagnostico.html","catalogo.js","devolutiva.html","app-192.png","app-512.png","apple-touch-icon.png","icone.png","diagnostico.webmanifest"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ARQ)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("diag-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const u=new URL(e.request.url);if(u.origin!==location.origin)return;
  const nome=u.pathname.split("/").pop();if(!ARQ.includes(nome))return;
  /* rede primeiro (sempre a versão nova); sem internet, usa a cópia guardada */
  e.respondWith(fetch(e.request).then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c))}return r})
    .catch(()=>caches.match(e.request,{ignoreSearch:true})));
});
