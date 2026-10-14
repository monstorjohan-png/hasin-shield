/* حصن v3.1 — إصلاح شامل: نقاط عادلة بسقوف يومية، صوت متين، تواريخ محلية، بلا تجميد */
(function(){
"use strict";
var $=function(id){return document.getElementById(id)};
var store={
  get:function(k,d){try{var v=localStorage.getItem("hasin_"+k);return v==null?d:JSON.parse(v)}catch(e){return d}},
  set:function(k,v){try{localStorage.setItem("hasin_"+k,JSON.stringify(v))}catch(e){}},
  del:function(k){try{localStorage.removeItem("hasin_"+k)}catch(e){}}
};
$("ver").textContent="v3.1 • offline-first";
/* التاريخ بتوقيت جهازك المحلي (لا UTC) حتى لا تنكسر السلسلة بعد منتصف الليل */
function dayK(d){d=d||new Date();var m=String(d.getMonth()+1),dd=String(d.getDate());
  return d.getFullYear()+"-"+(m.length<2?"0"+m:m)+"-"+(dd.length<2?"0"+dd:dd)}
function vib(p){if(store.get("vib",true)===false)return;if("vibrate" in navigator)try{navigator.vibrate(p)}catch(e){}}

/* محرك الصوت: يعمل بعد أول لمسة (شرط المتصفح)، نغمات مميزة، زر تجربة */
var AC=null;
function ensureAC(){try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume()}catch(e){}return AC}
function tone(f,t0,dur,type){try{var ac=ensureAC();if(!ac||ac.state!=="running")return;
  var o=ac.createOscillator(),g=ac.createGain();o.type=type||"sine";o.frequency.value=f;
  var t=ac.currentTime+(t0||0);g.gain.setValueAtTime(0.0001,t);
  g.gain.exponentialRampToValueAtTime(0.08,t+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+dur+0.05)}catch(e){}}
function soundOn(){return store.get("sound",true)!==false}
function beep(f,d){if(!soundOn())return;tone(f||660,0,d||0.15)}
function melody(kind){if(!soundOn())return;
  if(kind==="win"){tone(523,0,.14);tone(659,.13,.14);tone(784,.26,.24)}
  else if(kind==="badge"){tone(880,0,.18);tone(1174,.15,.28)}
  else if(kind==="bad"){tone(300,0,.25,"triangle")}
  else if(kind==="tick"){tone(800,0,.07)}
  else if(kind==="alarm"){tone(440,0,.2,"triangle");tone(440,.3,.2,"triangle")}}
["pointerdown","keydown","touchstart"].forEach(function(ev){addEventListener(ev,function(){ensureAC()},{once:true,passive:true})});
function paintSound(){$("toggleSound").textContent=soundOn()?"🔔 صوت: يعمل":"🔕 صوت: متوقف"}
$("toggleSound").onclick=function(){store.set("sound",!soundOn());paintSound();if(soundOn())melody("tick");else toast("🔕 الصوت متوقف")};
paintSound();
if($("sndTest"))$("sndTest").onclick=function(){melody("win");vib(60);toast(soundOn()?"🔊 الصوت يعمل":"🔕 فعّل الصوت أولا")};

/* تنبيه + احتفال */
var toastT=null;
function toast(m){$("toastText").textContent=m;$("toast").classList.add("show");clearTimeout(toastT);toastT=setTimeout(function(){$("toast").classList.remove("show")},2600)}
function celebrate(){melody("win");
  if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  var c=$("confetti"),x=c.getContext("2d");c.style.display="block";c.width=innerWidth;c.height=innerHeight;
  var ps=[],cols=["#0E7C6B","#2dd4a8","#5b5bd6","#e8b45a","#c0392b"];
  for(var i=0;i<90;i++)ps.push({x:Math.random()*c.width,y:-20-Math.random()*c.height*0.3,w:5+Math.random()*6,h:8+Math.random()*8,vy:2+Math.random()*3,vx:-1.5+Math.random()*3,r:Math.random()*6.28,vr:-0.1+Math.random()*0.2,col:cols[i%cols.length]});
  var t0=Date.now();
  (function f(){var t=Date.now()-t0;x.clearRect(0,0,c.width,c.height);
    ps.forEach(function(p){p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.col;x.fillRect(-p.w/2,-p.h/2,p.w,p.h);x.restore()});
    if(t<2400)requestAnimationFrame(f);else c.style.display="none"})()}

/* آيات */
var VERSES=["﴿قُل لِّلْمُؤْمِنِينَ يَغُضُّوا مِنْ أَبْصَارِهِمْ وَيَحْفَظُوا فُرُوجَهُمْ ۚ ذَٰلِكَ أَزْكَىٰ لَهُمْ﴾ — النور 30","﴿وَلَا تَقْرَبُوا الزِّنَا ۖ إِنَّهُ كَانَ فَاحِشَةً وَسَاءَ سَبِيلًا﴾ — الإسراء 32","﴿وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا﴾ — العنكبوت 69","﴿إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيَحِبُّ الْمُتَطَهِّرِينَ﴾ — البقرة 222","«ومن لم يستطع فعليه بالصوم فإنه له وجاء» — متفق عليه","«احفظ الله يحفظك» — الترمذي"];
$("verseText").textContent=VERSES[new Date().getDate()%VERSES.length];

/* المظهر */
function applyTheme(t){document.documentElement.dataset.theme=t;$("themeBtn").textContent=t==="dark"?"☀️":"🌙";store.set("theme",t)}
function autoTheme(){var h=new Date().getHours();applyTheme((h>=19||h<6)?"dark":"light")}
if(store.get("themeAuto",true)===false)applyTheme(store.get("theme","light"));else autoTheme();
$("themeBtn").onclick=function(){store.set("themeAuto",false);applyTheme(document.documentElement.dataset.theme==="dark"?"light":"dark")};
$("autoThemeBtn").onclick=function(){store.set("themeAuto",true);autoTheme();toast("🌗 المظهر التلقائي مفعّل")};

/* التثبيت */
var deferred=null;
function doInstall(){if(deferred){deferred.prompt();deferred.userChoice.then(function(){deferred=null;$("installBtn").hidden=true})}
  else if(/iPhone|iPad|iPod/.test(navigator.userAgent)){alert("على آيفون: زر المشاركة ⎙ ← إضافة إلى الشاشة الرئيسية")}
  else{alert("من Chrome: ⋮ ← تثبيت التطبيق / إضافة للشاشة الرئيسية")}}
addEventListener("beforeinstallprompt",function(e){e.preventDefault();deferred=e;$("installBtn").hidden=false});
$("installBtn").onclick=doInstall;$("installBtn2").onclick=doInstall;
addEventListener("appinstalled",function(){$("installBtn").hidden=true;toast("تم التثبيت ✅");log("تثبيت كتطبيق ✅")});

/* السجل */
function log(m){var l=store.get("log",[]);l.push(new Date().toLocaleString("ar")+" — "+m);if(l.length>300)l=l.slice(-300);store.set("log",l);renderLog()}
function renderLog(){var l=store.get("log",[]),b=$("logBox");b.innerHTML=l.length?"":"<div>لا نشاط بعد.</div>";
  l.slice().reverse().forEach(function(x){var d=document.createElement("div");d.textContent=x;b.appendChild(d)})}

/* النقاط: منح خام + منح مسقوف يوميا (ضد تكرار الضغط) + تنظيف السقوف القديمة */
var LEVELS=[[0,"بداية الغيث"],[100,"تائب"],[300,"ثابت"],[600,"مصابر"],[1000,"حصين"],[2000,"قدوة"]];
function levelOf(xp){var n=LEVELS[0][1],nx=null,cur=0;
  for(var i=0;i<LEVELS.length;i++){if(xp>=LEVELS[i][0]){n=LEVELS[i][1];cur=LEVELS[i][0]}else{nx=LEVELS[i];break}}
  return{name:n,next:nx,cur:cur}}
function addXP(n){var x=store.get("xp",0)+n;store.set("xp",x);renderLevel();checkBadges()}
function award(kind,pts,cap){cap=(cap==null)?1:cap;var k="xpday_"+dayK()+"_"+kind;
  var n=store.get(k,0);if(n>=cap)return 0;store.set(k,n+1);addXP(pts);return pts}
function pruneCaps(){try{var cut="hasin_xpday_"+dayK(new Date(Date.now()-3*864e5));
  for(var i=localStorage.length-1;i>=0;i--){var k=localStorage.key(i);
    if(k&&k.indexOf("hasin_xpday_")===0&&k<cut)localStorage.removeItem(k)}}catch(e){}}
pruneCaps();
function renderLevel(){var xp=store.get("xp",0),L=levelOf(xp);
  $("levelName").textContent=L.name;
  var pct=L.next?Math.round((xp-L.cur)/(L.next[0]-L.cur)*100):100;
  $("xpBar").style.width=Math.min(100,pct)+"%";
  $("xpText").textContent=xp+" نقطة"+(L.next?(" • تبقى "+(L.next[0]-xp)+" لمستوى «"+L.next[1]+"»"):" • القمة 👑")}
/* الشارات: تُحفظ أولا ثم تُمنح النقاط — بلا استدعاء متبادل (كان يجمّد الصفحة) */
var BADGES=[
 {id:"first",t:"🌱 أول يوم",c:function(){return store.get("streak",[]).length>0}},
 {id:"week",t:"🔥 أسبوع",c:function(){return store.get("best",0)>=7}},
 {id:"month",t:"🛡️ 30 يوما",c:function(){return store.get("best",0)>=30}},
 {id:"focus",t:"🎯 100 دقيقة تركيز",c:function(){return store.get("focusMin",0)>=100}},
 {id:"resist",t:"💪 10 مقاومات",c:function(){return store.get("trigs",[]).filter(function(x){return x.r===1}).length>=10}},
 {id:"tasbih",t:"📿 1000 استغفار",c:function(){return store.get("tasbihTotal",0)>=1000}},
 {id:"chal",t:"👑 إتمام تحدٍّ",c:function(){var ch=store.get("chal",null);return ch&&streakNow()>=ch.len}}];
var BADGE_BUSY=false;
function checkBadges(){if(BADGE_BUSY)return;BADGE_BUSY=true;
  try{var won=store.get("badgesWon",[]),fresh=[];
    BADGES.forEach(function(b){try{if(won.indexOf(b.id)<0&&b.c()){won.push(b.id);fresh.push(b)}}catch(e){}});
    if(fresh.length){store.set("badgesWon",won);
      fresh.forEach(function(b){toast("🏅 شارة جديدة: "+b.t);addXP(25)});
      melody("badge")}
    renderBadges();renderLevel()}finally{BADGE_BUSY=false}}
function renderBadges(){var won=store.get("badgesWon",[]),box=$("badgeRow");box.innerHTML="";
  BADGES.forEach(function(b){var s=document.createElement("span");s.className="bdg"+(won.indexOf(b.id)>-1?" won":"");s.textContent=b.t;box.appendChild(s)})}

/* تحية + هجري */
function renderHead(){var h=new Date().getHours(),n=store.get("name","صديقي");
  var g=h<5?"ليلاً طيباً":h<12?"صباح الثبات":h<17?"نهار القوة":h<22?"مساء العزيمة":"ليل الحصن";
  $("greet").textContent=g+"، "+n+" 👋";
  try{$("hijriDate").textContent=new Intl.DateTimeFormat("ar-SA-u-ca-islamic",{day:"numeric",month:"long",year:"numeric"}).format(new Date())+" • "+new Date().toLocaleDateString("ar",{weekday:"long"})}catch(e){$("hijriDate").textContent=new Date().toLocaleDateString("ar",{weekday:"long",day:"numeric",month:"long"})}}
renderHead();setInterval(renderHead,60000);

/* التهيئة الأولى */
function showOb(id){["ob1","ob2","ob3"].forEach(function(s){$(s).classList.remove("on")});$(id).classList.add("on")}
if(!store.get("profile_done",false)){$("onboard").classList.add("open")}
$("obGo2").onclick=function(){if(!$("obName").value.trim()){toast("اكتب اسمك أولا");return}showOb("ob2")};
$("obBack1").onclick=function(){showOb("ob1")};
$("obGo3").onclick=function(){showOb("ob3")};
$("obSkip").onclick=function(){store.set("profile_done",true);$("onboard").classList.remove("open");$("lockScreen").classList.remove("open")};
$("obFinish").onclick=function(){
  store.set("name",$("obName").value.trim()||"صديقي");store.set("goal",$("obGoal").value);
  store.set("danger0",$("obTrig").value);log("⚠️ أخطر محفز: "+$("obTrig").value);
  var bed=$("obBed").value||"23:00";
  var r=store.get("rules",[]);
  if(!r.length){r.push({name:"📵 الهاتف ليلا (وقت الخطر)",from:bed,to:"06:00",days:"daily"});store.set("rules",r)}
  var pin=$("obPin").value.trim();
  if(/^\d{4}$/.test(pin)){store.set("pin",hash(pin));pinHash=store.get("pin")}
  store.set("profile_done",true);$("onboard").classList.remove("open");$("lockScreen").classList.remove("open");
  renderHead();renderRules();addXP(20);log("🚀 اكتملت البداية: "+store.get("name"));
  toast("أهلا "+store.get("name")+"! حصنك جاهز 🛡️");celebrate()};
$("saveName").onclick=function(){var v=$("setName").value.trim();if(!v)return;store.set("name",v);renderHead();toast("حُفظ الاسم ✅")};
$("setName").value=store.get("name","");

/* قفل PIN (يظهر فقط عند وجود رمز) */
function hash(s){var h=5381;for(var i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))>>>0;return "h"+h}
var pinHash=store.get("pin",null),pinBuf="";
function paintPin(){var d=$("pinDots").querySelectorAll("i");for(var i=0;i<4;i++)d[i].className=i<pinBuf.length?"f":""}
if(pinHash){$("lockScreen").classList.add("open");$("firstPinBox").hidden=true;$("pinPad").style.display="grid"}
else{$("lockScreen").classList.remove("open")}
$("pinPad").addEventListener("click",function(e){
  var b=e.target.closest("button");if(!b||!$("lockScreen").classList.contains("open"))return;
  if(!$("firstPinBox").hidden)return;
  var k=b.getAttribute("data-k");
  if(k==="clear")pinBuf=pinBuf.slice(0,-1);
  else if(k==="ok"){if(hash(pinBuf)===pinHash){pinBuf="";$("lockScreen").classList.remove("open");log("🔓 فُتح التطبيق")}else{pinBuf="";vib([80,40,80]);melody("bad");$("lockHint").textContent="رمز خاطئ";log("⚠️ رمز خاطئ")}}
  else if(pinBuf.length<4){pinBuf+=b.textContent.trim();
    if(pinBuf.length===4){if(hash(pinBuf)===pinHash){pinBuf="";$("lockScreen").classList.remove("open");log("🔓 فُتح التطبيق");melody("tick")}
      else{var bad=store.get("badPin",0)+1;store.set("badPin",bad);pinBuf="";vib([80,40,80]);melody("bad");$("lockHint").textContent="رمز خاطئ ("+bad+")";log("⚠️ رمز خاطئ #"+bad)}}}
  paintPin()});
$("savePin").onclick=function(){var v=$("newPin").value.trim();if(!/^\d{4}$/.test(v)){toast("4 أرقام بالضبط");return}
  store.set("pin",hash(v));pinHash=hash(v);$("lockScreen").classList.remove("open");log("🔒 عُيّن PIN")};
$("skipPin").onclick=function(){$("lockScreen").classList.remove("open")};
$("saveSetPin").onclick=function(){var v=$("setPin").value.trim();
  if(!v){store.del("pin");pinHash=null;toast("أُلغي القفل ✅");return}
  if(!/^\d{4}$/.test(v)){toast("4 أرقام");return}
  store.set("pin",hash(v));pinHash=hash(v);$("setPin").value="";toast("حُفظ PIN ✅")};
$("toggleVib").onclick=function(){var v=store.get("vib",true)===false;store.set("vib",v);$("toggleVib").textContent=v?"📳 اهتزاز: يعمل":"📳 متوقف"};
$("toggleVib").textContent=(store.get("vib",true)!==false)?"📳 اهتزاز: يعمل":"📳 متوقف";

/* الجدولة */
var rules=store.get("rules",[]);
function toMin(t){var p=String(t).split(":");return(+p[0])*60+(+p[1])}
function isActive(r,cur,day){if(r.days==="weekdays"&&(day===5||day===6))return false;
  if(r.days==="weekend"&&!(day===5||day===6))return false;
  var a=toMin(r.from),b=toMin(r.to);return a<=b?(cur>=a&&cur<b):(cur>=a||cur<b)}
function renderRules(){var box=$("rulesList");box.innerHTML="";
  if(!rules.length)box.innerHTML='<p class="desc">لا قواعد بعد.</p>';
  var n=new Date(),cur=n.getHours()*60+n.getMinutes();
  rules.forEach(function(r,i){var a=isActive(r,cur,n.getDay());
    var d=document.createElement("div");d.className="rule"+(a?" active":"");
    var m=document.createElement("div");m.className="meta";
    var b=document.createElement("b");b.textContent=(a?"⛔ ":"✅ ")+r.name;
    var s=document.createElement("span");s.textContent=r.from+" ← "+r.to+" • "+({daily:"يوميا",weekdays:"العمل",weekend:"العطلة"}[r.days]||r.days)+(a?" • الآن":"");
    m.appendChild(b);m.appendChild(s);d.appendChild(m);
    var del=document.createElement("button");del.className="icon-btn";del.textContent="🗑️";del.setAttribute("aria-label","حذف");
    del.onclick=function(){rules.splice(i,1);store.set("rules",rules);renderRules();log("حُذفت قاعدة")};
    d.appendChild(del);box.appendChild(d)});
  var act=rules.filter(function(r){return isActive(r,cur,n.getDay())});
  $("activeRuleNow").textContent=act.length?("⛔ محظور الآن: "+act.map(function(r){return r.name}).join("، ")):"✅ لا حظر نشط.";
  if(act.length){$("nightBanner").hidden=false;$("nightText").textContent=": "+act.map(function(r){return r.name}).join("، ")}else $("nightBanner").hidden=true}
$("addRule").onclick=function(){var n=$("appName").value.trim();if(!n){toast("اكتب الاسم أولا");return}
  rules.push({name:n,from:$("fromT").value||"22:00",to:$("toT").value||"06:00",days:$("days").value});
  store.set("rules",rules);$("appName").value="";renderRules();log("قاعدة: "+n);award("rule",5,3)};
renderRules();setInterval(renderRules,30000);
var lastAlert="";setInterval(function(){var n=new Date(),c=n.getHours()*60+n.getMinutes();
  var act=rules.filter(function(r){return isActive(r,c,n.getDay())});
  var key=act.map(function(r){return r.name}).join(",");
  if(key&&key!==lastAlert){lastAlert=key;log("⛔ بدأ الحجب: "+key);vib(200);melody("alarm");
    if("Notification" in window&&Notification.permission==="granted"){try{new Notification("حصن: بدأ الحجب ⛔",{body:key})}catch(e){}}}
  if(!key)lastAlert=""},20000);
if("Notification" in window&&Notification.permission==="default"){try{Notification.requestPermission()}catch(e){}}
$("nightFocus").onclick=function(){$("focusMin").value=25;$("focusMin").oninput();$("startFocus").click()};

/* التركيز */
var fInt=null,fEnd=0,fTotal=1;
document.querySelectorAll("[data-preset]").forEach(function(b){b.onclick=function(){$("focusMin").value=b.getAttribute("data-preset");$("focusMin").oninput();melody("tick")}});
$("focusMin").oninput=function(){$("focusPreview").textContent=String($("focusMin").value||25).padStart(2,"0")+":00"};
$("focusMin").oninput();
function focusStats(){$("focusTotal").textContent=store.get("focusMin",0);$("breakCount").textContent=store.get("breaks",0)}
focusStats();
$("startFocus").onclick=function(){var m=Math.max(1,Math.min(480,+($("focusMin").value||25)));
  fTotal=m*60;fEnd=Date.now()+fTotal*1000;$("focusOverlay").classList.add("open");
  $("focusMsg").textContent="مقفل "+m+" دقيقة — الخروج يُسجل.";
  try{document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen()}catch(e){}
  log("🔒 تركيز "+m+"د");clearInterval(fInt);
  fInt=setInterval(function(){var left=Math.max(0,Math.round((fEnd-Date.now())/1000));
    $("focusTimer").textContent=String(Math.floor(left/60)).padStart(2,"0")+":"+String(left%60).padStart(2,"0");
    var p=((1-left/fTotal)*100)+"%";$("focusBar").style.width=p;$("dayProgress").style.width=p;
    if(left<=0){clearInterval(fInt);$("focusOverlay").classList.remove("open");
      try{document.exitFullscreen&&document.exitFullscreen()}catch(e){}
      store.set("focusMin",store.get("focusMin",0)+m);focusStats();
      var g=award("focus",Math.min(m,90),6);log("✅ تركيز "+m+"د");celebrate();
      toast(g>0?("اكتمل التركيز +"+g+" XP"):"اكتمل التركيز ✅");checkBadges()}},500)};
$("exitFocus").onclick=function(){var bc=store.get("breaks",0)+1;store.set("breaks",bc);focusStats();
  clearInterval(fInt);$("focusOverlay").classList.remove("open");
  try{document.exitFullscreen&&document.exitFullscreen()}catch(e){}
  log("⚠️ كُسر التركيز #"+bc);vib(150)};
$("quickFocus").onclick=function(){$("focusMin").value=25;$("focusMin").oninput();document.getElementById("focus").scrollIntoView({behavior:"smooth"});setTimeout(function(){$("startFocus").click()},600)};

/* الفاحص (نص آمن بلا حقن HTML) */
var DOMAINS=["pornhub","xvideos","xnxx","xhamster","redtube","youporn","tube8","spankbang","onlyfans","chaturbate","stripchat","camsoda","erome","hentai","rule34","xxx","adult","camgirl","escort","beeg","brazzers","bangbros","playboy","livejasmin","bongacams","fapello","fansly","eporner","motherless","pornpics"];
var AR=["اباح","جنس","عري","عاري","سكس","نيك","لحس","مؤخر","صدرها","مثير","اغراء","شذوذ","لواط","سحاق","استمناء","عاده سريه","عادة سرية","فاضح","مخله","رقص","شاطئ","عرايا","خلاع","تهييج","شهو","سرير","قبله"];
var EN=["porn","nude","naked","explicit","erotic","fetish","bdsm","escort","hookup","milf","hentai","blowjob","orgasm","masturbat","horny","threesome","hardcore","camshow","sexting","striptease"];
function scan(s){s=(s||"").toLowerCase();
  var d=DOMAINS.find(function(x){return s.indexOf(x)>-1});if(d)return{lv:2,t:"نطاق إباحي ("+d+")"};
  var all=AR.concat(EN,store.get("words",[]).map(function(w){return String(w).toLowerCase()}));
  var hits=all.filter(function(w){return w&&w.length>1&&s.indexOf(w)>-1});
  if(hits.length>=2)return{lv:2,t:"كلمات مثيرة: "+hits.slice(0,3).join("، ")};
  if(hits.length===1)return{lv:1,t:"كلمة حساسة: «"+hits[0]+"»"};
  if(/bit\.ly|t\.co|tinyurl|goo\.gl|tiktok.com\/t\//.test(s))return{lv:1,t:"رابط مختصر/مقترحات — المقترحات أخطر"};
  return{lv:0,t:"لا إشارات ظاهرة (الحذر واجب)"}}
$("checkUrl").onclick=function(){var src=($("urlInput").value+" "+$("txtInput").value).trim();
  if(!src){toast("الصق شيئا أولا");return}
  var r=scan(src),box=$("urlResult");
  if(r.lv===2){box.textContent="⛔ ممنوع. "+r.t;box.style.color="var(--danger)";log("⛔ مُنع محتوى");vib([100,50,100]);melody("bad")}
  else if(r.lv===1){box.textContent="⚠️ مشبوه. "+r.t;box.style.color="var(--warn)";melody("tick")}
  else{box.textContent="✅ سليم ظاهريا. "+r.t;box.style.color="var(--accent)";melody("tick")}};
$("openSafe").onclick=function(){var u=$("urlInput").value.trim();
  if(u&&scan(u).lv===2){toast("ممنوع حماية لك");return}
  open("https://search.brave.com/search?q="+encodeURIComponent(u||"")+"&safesearch=strict","_blank")};
$("saveWords").onclick=function(){var w=$("customWords").value.split(/[،,]/).map(function(s){return s.trim()}).filter(Boolean);
  store.set("words",w);log("💾 "+w.length+" كلمات فلترة");toast("حُفظت ✅")};
$("customWords").value=store.get("words",[]).join("، ");

/* العفة */
function streakNow(){var a=store.get("streak",[]),s=0,cur=new Date();while(a.indexOf(dayK(cur))>-1){s++;cur.setDate(cur.getDate()-1)}return s}
function renderStreak(){var days=store.get("streak",[]),bad=store.get("bad",[]);
  var box=$("streakDays");box.innerHTML="";
  for(var i=6;i>=0;i--){var d=new Date();d.setDate(d.getDate()-i);var k=dayK(d);
    var el=document.createElement("div");
    el.className="day"+(days.indexOf(k)>-1?" ok":bad.indexOf(k)>-1?" bad":"");
    el.textContent=days.indexOf(k)>-1?"✓":bad.indexOf(k)>-1?"×":d.getDate();el.title=k;box.appendChild(el)}
  var s=streakNow();
  $("streakText").textContent=s>0?("🔥 "+s+(s===1?" يوم":s===2?" يومان":" أيام")+" — لا تكسرها!"):"ابدأ الليلة قبل النوم.";
  var best=store.get("best",0);if(s>best){best=s;store.set("best",best)}
  var C=326.7,ms=[7,30,90],tgt=ms.find(function(m){return s<m})||90;
  $("ringFg").style.strokeDashoffset=C*(1-Math.min(1,s/tgt));$("ringNum").textContent=s;
  renderHeat();renderChal();renderLevel()}
function doClean(){var k=dayK(),a=store.get("streak",[]);
  if(a.indexOf(k)<0){a.push(k);store.set("streak",a);log("🌱 يوم نظيف");award("clean",50,1);celebrate();toast("يوم نظيف +50 XP 🌱")}
  else toast("مسجل مسبقا ✅");
  renderStreak();drawReport();checkBadges()}
$("markClean").onclick=doClean;$("quickClean").onclick=doClean;
$("markBad").onclick=function(){if(!confirm("تسجيل صادق؟ لا جلد للذات — نتعلم وننهض."))return;
  var k=dayK(),b=store.get("bad",[]);if(b.indexOf(k)<0){b.push(k);store.set("bad",b)}
  store.set("streak",[]);log("📝 تعثر — بدء جديد");renderStreak();drawReport();
  alert("﴿إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ﴾ — توضأ وصلِّ ركعتين 💚")};
function renderHeat(){var box=$("heatMap");box.innerHTML="";
  var days=store.get("streak",[]),bad=store.get("bad",[]);
  for(var i=89;i>=0;i--){var d=new Date();d.setDate(d.getDate()-i);var k=dayK(d);
    var el=document.createElement("i");
    if(days.indexOf(k)>-1)el.className="c2";else if(bad.indexOf(k)>-1)el.className="b";
    else if((store.get("hab_"+k,[])||[]).length>0)el.className="c1";
    el.title=k;box.appendChild(el)}}
renderStreak();

/* التحدي */
$("challengeSel").value=String((store.get("chal",{len:30}).len)||30);
function renderChal(){var ch=store.get("chal",null),s=streakNow();
  if(!ch){$("challengeText").textContent="اختر تحديا وابدأ — التقدم = سلسلتك الحالية.";$("challengeBar").style.width="0%";return}
  var p=Math.min(100,Math.round(s/ch.len*100));$("challengeBar").style.width=p+"%";
  $("challengeText").textContent="تحدي "+ch.len+" يوما: "+s+"/"+ch.len+" ("+p+"%)"+(s>=ch.len?" — أتممته 👑 أسطورة!":"");
  if(s>=ch.len&&!ch.done){ch.done=true;store.set("chal",ch);addXP(200);celebrate();log("👑 أُتم تحدي "+ch.len)}}
$("startChallenge").onclick=function(){var len=+($("challengeSel").value);
  store.set("chal",{len:len,start:dayK()});renderChal();log("⚔️ بدأ تحدي "+len);toast("بدأ التحدي! بالتوفيق ⚔️");checkBadges()};
renderChal();

/* العادات + المزاج + المذكرة */
var HABITS=[["fajr","🕌 الفجر في وقته",10],["quran","📖 ورد قرآن",10],["sport","🏃 رياضة 20 دقيقة",10],["sleep","🌙 نوم قبل 11",10],["phone","📵 ساعة بلا هاتف",10]];
function renderHabits(){var today=dayK(),done=store.get("hab_"+today,[]);
  var box=$("habitList");box.innerHTML="";
  HABITS.forEach(function(h){var on=done.indexOf(h[0])>-1;
    var d=document.createElement("label");d.className="habit"+(on?" done":"");
    var c=document.createElement("input");c.type="checkbox";c.checked=on;
    c.onchange=function(){var arr=store.get("hab_"+today,[]);
      if(c.checked&&arr.indexOf(h[0])<0){arr.push(h[0]);award("hab_"+h[0],h[2],1);melody("tick")}
      if(!c.checked)arr=arr.filter(function(x){return x!==h[0]});
      store.set("hab_"+today,arr);renderHabits();drawReport()};
    var t=document.createElement("span");t.textContent=h[1];
    var p=document.createElement("span");p.className="pts";p.textContent="+"+h[2];
    d.appendChild(c);d.appendChild(t);d.appendChild(p);box.appendChild(d)});
  var pct=Math.round(done.length/HABITS.length*100);
  $("habitBar").style.width=pct+"%";$("habitText").textContent="اليوم: "+done.length+"/"+HABITS.length+" ("+pct+"%)"}
renderHabits();
function todayMood(){return store.get("mood_"+dayK(),null)}
function paintMood(){var m=todayMood();document.querySelectorAll("#moodRow button").forEach(function(b){b.classList.toggle("sel",b.getAttribute("data-mood")===m)})}
paintMood();
document.querySelectorAll("#moodRow button").forEach(function(b){b.onclick=function(){store.set("mood_"+dayK(),b.getAttribute("data-mood"));paintMood();melody("tick")}});
$("diaryText").value=store.get("diary_"+dayK(),"");
$("saveDay").onclick=function(){var k=dayK();
  store.set("diary_"+k,$("diaryText").value.trim());
  log("📓 حفظ اليوم (مزاج "+(todayMood()||"—")+")");
  var g=award("diary",5,1);toast(g>0?"حُفظ يومك +5 XP":"حُفظ يومك ✅");drawReport()};
/* انقلب اليوم والساعة مفتوحة؟ حدّث واجهة اليوم */
var loadedDay=dayK();
document.addEventListener("visibilitychange",function(){if(document.hidden)return;
  var k=dayK();if(k!==loadedDay){loadedDay=k;renderHead();paintMood();
    $("diaryText").value=store.get("diary_"+k,"");renderHabits();renderStreak();drawReport()}});

/* المحفزات */
$("saveTrig").onclick=function(){saveT(true)};$("saveTrigFail").onclick=function(){saveT(false)};
function saveT(ok){var a=store.get("trigs",[]);
  a.push({t:new Date().toISOString(),h:new Date().getHours(),w:$("trWhere").value,f:$("trFeel").value,g:$("trTrig").value,r:ok?1:0});
  if(a.length>300)a=a.slice(-300);store.set("trigs",a);
  log(ok?"💪 مقاومة مسجلة":"📝 سقوط بعد رغبة");trigInsight();drawReport();checkBadges();
  if(ok){var g=award("resist",30,5);celebrate();toast(g>0?"مقاومة بطولية +30 XP 💪":"مقاومة بطولية 💪")}else melody("bad")}
function trigInsight(){var a=store.get("trigs",[]);
  if(!a.length){$("trigInsight").textContent="";return}
  var byH={},byF={};a.forEach(function(x){byH[x.h]=(byH[x.h]||0)+1;byF[x.f]=(byF[x.f]||0)+1});
  var hk=Object.keys(byH).sort(function(x,y){return byH[y]-byH[x]})[0];
  var fk=Object.keys(byF).sort(function(x,y){return byF[y]-byF[x]})[0];
  var wr=a.filter(function(x){return x.r===1}).length;
  $("trigInsight").textContent="📊 "+a.length+" رغبات • أخطر ساعة "+hk+":00 • أخطر شعور: "+fk+" • مقاومة "+Math.round(wr/a.length*100)+"%"}
trigInsight();

/* المسبحة */
var tasbih=0;
function renderTas(){$("tasbihCount").textContent=tasbih;$("tasbihTotal").textContent=store.get("tasbihTotal",0)}
renderTas();
$("tasbihTap").onclick=function(){tasbih++;store.set("tasbihTotal",store.get("tasbihTotal",0)+1);
  var tgt=+($("tasbihTarget").value);vib(15);if(tasbih%10===0)melody("tick");
  if(tasbih>=tgt){var g=award("tasbih",10,10);tasbih=0;celebrate();checkBadges();
    toast(g>0?("تقبل الله! أتممت "+tgt+" 📿 +10 XP"):("تقبل الله! أتممت "+tgt+" 📿"))}
  renderTas()};
$("tasbihReset").onclick=function(){tasbih=0;renderTas()};

/* التقرير */
function drawReport(){var days=store.get("streak",[]),bad=store.get("bad",[]);
  var vals=[];
  for(var j=29;j>=0;j--){var dd=new Date();dd.setDate(dd.getDate()-j);var kk=dayK(dd);
    vals.push(days.indexOf(kk)>-1?2:bad.indexOf(kk)>-1?-1:(store.get("hab_"+kk,[])||[]).length>0?1:0)}
  var cv=$("chart"),ctx=cv.getContext("2d"),W=cv.width,H=cv.height;ctx.clearRect(0,0,W,H);
  var bw=W/30,dark=document.documentElement.dataset.theme==="dark";
  vals.forEach(function(v,i){var h=v===2?H*0.85:v===1?H*0.4:v===-1?H*0.55:4;
    var y=v===-1?H/2:H-h-8;
    ctx.fillStyle=v===2?(dark?"#2dd4a8":"#0E7C6B"):v===1?(dark?"#1d5c4e":"#9fd8cb"):v===-1?"#c0392b":(dark?"#2a332e":"#dfe3df");
    var x=i*bw+2;ctx.beginPath();
    if(ctx.roundRect)ctx.roundRect(x,v===-1?H/2:y,bw-4,v===-1?H*0.25:h,3);else ctx.rect(x,y,bw-4,h);ctx.fill()});
  var clean=vals.filter(function(v){return v===2}).length;
  $("stClean").textContent=Math.round(clean/30*100)+"%";$("stFocus").textContent=store.get("focusMin",0);
  $("stBest").textContent=store.get("best",0);
  var hb=0;for(var q=29;q>=0;q--){var d2=new Date();d2.setDate(d2.getDate()-q);hb+=(store.get("hab_"+dayK(d2),[])||[]).length}
  $("stHabit").textContent=Math.round(hb/(30*HABITS.length)*100)+"%";
  var falls=store.get("trigs",[]).filter(function(x){return x.r===0}).length;
  $("reportText").textContent="30 يوما: "+clean+" نظيفا • "+store.get("focusMin",0)+"د تركيز • "+falls+" سقوطا. "+(clean>=20?"ممتاز — ثبّت روتينك.":clean>=10?"تقدم حقيقي — احمِ أخطر ساعة.":"ابدأ بعادة واحدة: النوم المبكر.")}
drawReport();
$("copyReport").onclick=function(){var t="تقريري (حصن): نظافة "+$("stClean").textContent+" • تركيز "+$("stFocus").textContent+"د • أطول سلسلة "+$("stBest").textContent+" • مستوى "+$("levelName").textContent+" ("+store.get("xp",0)+" XP). "+$("reportText").textContent;
  try{navigator.clipboard.writeText(t);toast("نُسخ ✅")}catch(e){prompt("انسخه:",t)}};
$("dlBackup").onclick=function(){var data={};for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf("hasin_")===0)data[k]=localStorage.getItem(k)}
  var b=new Blob([JSON.stringify(data)],{type:"application/json"});var a=document.createElement("a");
  a.href=URL.createObjectURL(b);a.download="hasin-backup-"+dayK()+".json";a.click();log("💾 نسخة احتياطية")};
$("upBackup").onchange=function(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();
  r.onload=function(){try{var d=JSON.parse(r.result);Object.keys(d).forEach(function(k){localStorage.setItem(k,d[k])});alert("استُعيدت — سيُعاد التحميل");location.reload()}catch(err){toast("ملف غير صالح")}};
  r.readAsText(f)};

/* الطوارئ */
var sosInt=null,sosEnd=0;
$("sosBtn").onclick=function(){$("sosOverlay").classList.add("open");sosEnd=Date.now()+5*60*1000;clearInterval(sosInt);
  log("🆘 طوارئ");melody("alarm");
  sosInt=setInterval(function(){var l=Math.max(0,Math.round((sosEnd-Date.now())/1000));
    $("sosTimer").textContent=String(Math.floor(l/60)).padStart(2,"0")+":"+String(l%60).padStart(2,"0");
    if(l<=0){clearInterval(sosInt);$("sosTimer").textContent="انتهت الموجة ✅"}},500);breath()};
function breath(){var c=$("breathCircle"),ph=0,ps=["شهيق…","احبس…","زفير…"];
  (function n(){if(!$("sosOverlay").classList.contains("open"))return;
    c.textContent=ps[ph%3];c.style.transform=ph%3===2?"scale(.8)":"scale(1.15)";if(ph%3===0)tone(520,0,.15);ph++;setTimeout(n,4000)})()}
$("sosClose").onclick=function(){$("sosOverlay").classList.remove("open");clearInterval(sosInt)};
$("sosWin").onclick=function(){$("sosOverlay").classList.remove("open");clearInterval(sosInt);
  var a=store.get("trigs",[]);a.push({t:new Date().toISOString(),h:new Date().getHours(),w:"طوارئ",f:"حاد",g:"موجة",r:1});store.set("trigs",a);
  trigInsight();drawReport();var g=award("resist",30,5);log("🏆 نجاة من موجة");celebrate();
  toast(g>0?"بطل! +30 XP 🏆":"بطل! نجوت 🏆");checkBadges()};

/* مسح + تصدير */
$("wipeAll").onclick=function(){if(prompt("للمسح اكتب: مسح")!=="مسح"){toast("أُلغي");return}
  Object.keys(localStorage).filter(function(k){return k.indexOf("hasin_")===0}).forEach(function(k){localStorage.removeItem(k)});
  alert("مُسح كل شيء.");location.reload()};
$("exportLog").onclick=function(){var t=store.get("log",[]).join("\n")||"لا سجل";
  try{navigator.clipboard.writeText("سجل التزامي (حصن):\n"+t);toast("نُسخ ✅")}catch(e){prompt("انسخه:",t)}};

renderLog();renderLevel();renderBadges();checkBadges();
})();
