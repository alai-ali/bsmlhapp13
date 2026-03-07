var U={name:’’,huid:’’,photo:’’,qrt:0.01,qrnc:0,invs:[],lv:1,dark:false,hasChip:false};
var qrStream=null, qrInterval=null;

// РЕГИСТРАЦИЯ
function toggleLang(e){if(e)e.stopPropagation();var m=document.getElementById(‘l-menu’);m.style.display=m.style.display===‘flex’?‘none’:‘flex’;}
function setLang(l){document.getElementById(‘reg-t’).innerText=(l===‘RU’?‘РЕГИСТРАЦИЯ’:l===‘EN’?‘REGISTRATION’:‘ТІРКЕЛУ’);toggleLang();}

function startCam(){
var nameVal=document.getElementById(‘in-f’).value.trim();
if(!nameVal){alert(‘Введите имя’);return;}
U.name=nameVal;
document.getElementById(‘scr-reg’).classList.remove(‘active’);
if(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia){
document.getElementById(‘scr-scan’).classList.add(‘active’);
var ct=setTimeout(function(){
document.getElementById(‘scr-scan’).classList.remove(‘active’);
document.getElementById(‘scr-chip’).classList.add(‘active’);
},3000);
navigator.mediaDevices.getUserMedia({video:{facingMode:‘user’}})
.then(function(s){clearTimeout(ct);document.getElementById(‘video-feed’).srcObject=s;})
.catch(function(){clearTimeout(ct);document.getElementById(‘scr-scan’).classList.remove(‘active’);document.getElementById(‘scr-chip’).classList.add(‘active’);});
}else{
document.getElementById(‘scr-chip’).classList.add(‘active’);
}
}

function takePhoto(){
const v=document.getElementById(‘video-feed’),c=document.getElementById(‘photo-canvas’);
c.width=v.videoWidth;c.height=v.videoHeight;
c.getContext(‘2d’).drawImage(v,0,0);
U.photo=c.toDataURL();
v.srcObject.getTracks().forEach(t=>t.stop());
document.getElementById(‘scr-scan’).classList.remove(‘active’);
document.getElementById(‘scr-chip’).classList.add(‘active’);
}

// ЧИП
async function activateChip(){
var btn=document.getElementById(‘chip-btn’);
var beam=document.getElementById(‘reg-beam’);
var st=document.getElementById(‘chip-status’);
if(!(‘NDEFReader’ in window)){
st.innerText=‘⚠️ NFC не поддерживается браузером’;
st.style.color=’#ff6b6b’;
return;
}
btn.disabled=true;
btn.innerText=‘Сканирование…’;
beam.classList.add(‘active’);
st.innerText=‘Поднесите BSMLH CHIP…’;
st.style.color=‘var(–neon)’;
try{
const ndef=new NDEFReader();
await ndef.scan();
var timeout=setTimeout(function(){
beam.classList.remove(‘active’);
btn.disabled=false;
btn.innerText=‘АКТИВИРОВАТЬ ЧИП’;
st.innerText=‘⚠️ Чип не найден. Попробуйте снова’;
st.style.color=’#ff6b6b’;
},5000);
ndef.onreading=function(){
clearTimeout(timeout);
beam.classList.remove(‘active’);
st.innerText=‘✅ Чип активирован!’;
st.style.color=‘var(–green)’;
U.hasChip=true;
setTimeout(toApp,1000);
};
}catch(e){
beam.classList.remove(‘active’);
btn.disabled=false;
btn.innerText=‘АКТИВИРОВАТЬ ЧИП’;
st.innerText=‘⚠️ Разрешите доступ к NFC’;
st.style.color=’#ff6b6b’;
}
}

function showSMS(){
document.getElementById(‘scr-chip’).classList.remove(‘active’);
document.getElementById(‘scr-sms’).classList.add(‘active’);
}

function sendSMS(){
var p=document.getElementById(‘sms-phone’).value;
if(!p){T(‘⚠️ Введите номер’);return;}
document.getElementById(‘sms-step1’).style.display=‘none’;
document.getElementById(‘sms-step2’).style.display=‘block’;
T(‘📱 Код отправлен’);
}

function verifySMS(){
var code=document.getElementById(‘sms-code’).value;
if(code===‘1234’){U.hasChip=false;toApp();}
else{T(‘❌ Неверный код’);}
}

function toApp(){
// Генерация HUID
var chars=‘ABCDEFGHJKLMNPQRSTUVWXYZ23456789’;
var uid=’’;
for(var i=0;i<16;i++)uid+=chars[Math.floor(Math.random()*chars.length)];
U.huid=‘BSMLH-2026-’+uid;

document.getElementById(‘u-name’).innerText=U.name;
document.getElementById(‘u-huid’).innerText=U.huid;
document.getElementById(‘set-name’).innerText=U.name;
document.getElementById(‘set-huid’).innerText=U.huid;
document.getElementById(‘c-name’).innerText=U.name.toUpperCase();
document.getElementById(‘c-huid-card’).innerText=U.huid;

// Статус чипа
var cs=document.getElementById(‘chip-status-set’);
if(U.hasChip){cs.innerText=‘Активен’;cs.className=‘wc-val gr’;}
else{cs.innerText=‘Не активен’;cs.className=‘wc-val rd’;}
document.getElementById(‘chip-info-status’).innerText=’Статус: ’+(U.hasChip?‘✅ Активен’:‘❌ Не активен’);

if(U.photo){
document.getElementById(‘user-photo’).src=U.photo;
document.getElementById(‘set-av’).innerHTML=’<img src="'+U.photo+'" style="width:100%;height:100%;object-fit:cover;border-radius:8px">’;
}

var qd=encodeURIComponent(‘BSMLH:’+U.huid+’:’+U.name);
document.getElementById(‘qr-img’).src=‘https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=’+qd;
document.getElementById(‘qr-txt’).innerText=U.huid;

// Карта
var last4=Math.floor(1000+Math.random()*9000).toString();
var now=new Date();
var exp=((now.getMonth()+1).toString().padStart(2,‘0’))+’/’+(now.getFullYear()+2).toString().substr(2);
if(document.getElementById(‘c-last4’))document.getElementById(‘c-last4’).innerText=last4;
if(document.getElementById(‘c-expiry’))document.getElementById(‘c-expiry’).innerText=exp;
document.querySelectorAll(’.screen’).forEach(s=>s.style.display=‘none’);
document.getElementById(‘app’).style.display=‘flex’;
loadChats();upd();
}

// ВЫХОД
function exitApp(){
document.getElementById(‘app’).style.display=‘none’;
document.querySelectorAll(’.screen’).forEach(s=>{s.style.display=‘none’;s.classList.remove(‘active’);});
document.getElementById(‘scr-reg’).style.display=’’;
document.getElementById(‘scr-reg’).classList.add(‘active’);
document.getElementById(‘in-f’).value=’’;
document.getElementById(‘sms-step1’).style.display=‘block’;
document.getElementById(‘sms-step2’).style.display=‘none’;
document.getElementById(‘chip-status’).innerText=’’;
document.getElementById(‘chip-btn’).disabled=false;
document.getElementById(‘chip-btn’).innerText=‘АКТИВИРОВАТЬ ЧИП’;
U={name:’’,huid:’’,photo:’’,qrt:0.01,qrnc:0,invs:[],lv:1,dark:false,hasChip:false};
T(‘👋 До свидания!’);
}

// НАВИГАЦИЯ
function tab(t,title){
[‘chat’,‘maps’,‘hub’,‘prof’].forEach(id=>{
document.getElementById(‘view-’+id).style.display=id===t?‘block’:‘none’;
document.getElementById(‘n-’+id).classList.toggle(‘on’,id===t);
});
}
function P(id){
document.querySelectorAll(’.pg,.modal’).forEach(function(el){el.classList.remove(‘on’);});
document.getElementById(id).classList.add(‘on’);
}
function C(id){document.getElementById(id).classList.remove(‘on’);}

// ЧАТ
function loadChats(){
var d=[{n:‘Alex Chen’,a:‘🤖’,m:‘Secure connection active’,t:‘14:23’},{n:‘Sarah Kim’,a:‘🎨’,m:‘Patent approved! 🎉’,t:‘12:41’},{n:‘Ahmed’,a:‘🌙’,m:‘Готов к лицензированию’,t:‘11:05’},{n:‘Li Wei’,a:‘🐲’,m:‘BSMLH is amazing!’,t:‘Вчера’},{n:‘Oracle’,a:‘🛡️’,m:‘Система работает’,t:‘Вчера’}];
document.getElementById(‘view-chat’).innerHTML=d.map(x=>`<div class="chat-item" onclick="T('💬 ${x.n}')"><div class="chat-av">${x.a}</div><div style="flex:1"><div style="display:flex;justify-content:space-between"><span style="font-weight:500;font-size:15px">${x.n}</span><span style="font-size:11px;color:#bbb">${x.t}</span></div><div style="font-size:13px;color:#bbb">${x.m}</div></div></div>`).join(’’);
}

// ПАТЕНТ – попытка фиксации
async function tryFixInv(){
var t=document.getElementById(‘inv-t’).value.trim();
var n=document.getElementById(‘inv-niche’).value;
if(!n){T(‘⚠️ Выберите нишу’);return;}
if(!t){T(‘⚠️ Введите название’);return;}
if(!U.hasChip){
var overlay=document.getElementById(‘chip-scan-overlay’);
overlay.classList.add(‘on’);
document.getElementById(‘patent-chip-status’).innerText=‘❌ Фиксация невозможна’;
document.getElementById(‘patent-chip-sub’).innerText=‘Пожалуйста, пройдите идентификацию через BSMLH CHIP’;
document.getElementById(‘pat-beam’).classList.remove(‘active’);
setTimeout(()=>overlay.classList.remove(‘on’),3000);
return;
}
if(!(‘NDEFReader’ in window)){
T(‘⚠️ NFC не поддерживается’);return;
}
var overlay=document.getElementById(‘chip-scan-overlay’);
var ps=document.getElementById(‘patent-chip-status’);
var pb=document.getElementById(‘patent-chip-sub’);
overlay.classList.add(‘on’);
ps.innerText=‘Сканирование чипа…’;
pb.innerText=‘Поднесите BSMLH CHIP к телефону’;
document.getElementById(‘pat-beam’).classList.add(‘active’);
try{
const ndef=new NDEFReader();
await ndef.scan();
var sec=5;
ps.innerText=’Сканирование… ’+sec+‘с’;
var iv=setInterval(function(){
sec–;
ps.innerText=’Сканирование… ’+sec+‘с’;
if(sec<=0){
clearInterval(iv);
document.getElementById(‘pat-beam’).classList.remove(‘active’);
overlay.classList.remove(‘on’);
T(‘⚠️ Чип не найден. Попробуйте снова’);
}
},1000);
ndef.onreading=function(){
clearInterval(iv);
document.getElementById(‘pat-beam’).classList.remove(‘active’);
ps.innerText=‘✅ Чип считан!’;
setTimeout(function(){
overlay.classList.remove(‘on’);
fixInv();
},800);
};
}catch(e){
document.getElementById(‘pat-beam’).classList.remove(‘active’);
overlay.classList.remove(‘on’);
T(‘⚠️ Разрешите доступ к NFC’);
}
}

function slv(n){U.lv=n;[1,2,3].forEach(i=>document.getElementById(‘lv’+i).classList.toggle(‘s’,i===n));}

function fixInv(){
var t=document.getElementById(‘inv-t’).value.trim();
var desc=document.getElementById(‘inv-d’).value.trim();
var niche=document.getElementById(‘inv-niche’).value;
var q=[0.99,9.99,49.99][U.lv-1];
var niches={‘IT’:‘💻 IT’,‘MED’:‘🏥 Медицина’,‘AGR’:‘🌾 Сельское хозяйство’,‘ENE’:‘⚡ Энергетика’,‘TRN’:‘🚗 Транспорт’,‘ECO’:‘🌍 Экология’,‘EDU’:‘📚 Образование’,‘FIN’:‘💰 Финансы’,‘OTH’:‘🔧 Другое’};
var inv={t,desc,lv:U.lv,niche:niches[niche]||niche,date:new Date().toLocaleString(‘ru-RU’),id:‘BSMLH-INV-’+Math.random().toString(36).substr(2,10).toUpperCase()};
U.invs.unshift(inv);
U.qrt=Math.round((U.qrt+q)*100)/100;
document.getElementById(‘inv-t’).value=’’;
document.getElementById(‘inv-d’).value=’’;
document.getElementById(‘inv-niche’).value=’’;
document.getElementById(‘inv-list’).innerHTML=U.invs.map(x=>`<div class="ii"><span class="ib">L${x.lv}</span><h4 style="font-size:14px;margin:4px 0 2px;color:#000">${x.t}</h4><p style="font-size:12px;color:#888">${x.id}</p></div>`).join(’’);
U.qrnc=Math.round((U.qrnc+0.01)*100)/100;
upd();
var h=document.getElementById(‘hist-list’),d=document.createElement(‘div’);
d.className=‘hist-row’;d.innerHTML=`<span>🛠 ${inv.t}</span><span class="gr">+0.01 QRT</span>`;
h.insertBefore(d,h.firstChild);
showCert(inv);
}

// СЕРТИФИКАТ
function showCert(inv){
document.getElementById(‘cert-author’).innerText=U.name;
document.getElementById(‘cert-huid’).innerText=U.huid;
document.getElementById(‘cert-title-txt’).innerText=inv.t;
document.getElementById(‘cert-desc’).innerText=inv.desc||’–’;
document.getElementById(‘cert-niche’).innerText=inv.niche;
document.getElementById(‘cert-level’).innerText=‘Level ‘+inv.lv+’ – ‘+[‘Timestamp $0.99’,‘Prior Art $9.99’,‘Certificate $49.99’][inv.lv-1];
document.getElementById(‘cert-inv-id’).innerText=inv.id;
document.getElementById(‘cert-time’).innerText=inv.date;
var qd=encodeURIComponent(‘BSMLH-CERT:’+inv.id+’:’+U.huid);
document.getElementById(‘cert-qr-img’).src=‘https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=’+qd;
document.getElementById(‘cert-page’).style.display=‘block’;
}

// QR СКАНЕР
function startQRScan(){
P(‘modal-scan’);
navigator.mediaDevices.getUserMedia({video:{facingMode:‘environment’}}).then(s=>{
qrStream=s;
var v=document.getElementById(‘qr-video’);
v.srcObject=s;
v.play();
T(‘📷 Наведите на QR код’);
}).catch(()=>T(‘❌ Камера недоступна’));
}

function stopQRScan(){
if(qrInterval)clearInterval(qrInterval);
if(qrStream)qrStream.getTracks().forEach(t=>t.stop());
qrStream=null;qrInterval=null;
C(‘modal-scan’);
}

// HUMANITY FUND
function doFund(msg){
var pts=parseInt(msg.match(/+(\d+)/)[1]);
U.qrnc+=pts;
U.qrt=Math.round((U.qrt+0.01)*100)/100;
U.qrnc=Math.round((U.qrnc+0.01)*100)/100;
upd();
var h=document.getElementById(‘hist-list’),d=document.createElement(‘div’);
d.className=‘hist-row’;
d.innerHTML=’<span>🌱 ‘+msg.split(’!’)[0].replace(‘✅ ‘,’’)+’</span><span class="gr">+0.01 QRT</span>’;
h.insertBefore(d,h.firstChild);
T(’✅ ’+msg);
}

// БАЛАНСЫ
function upd(){
var q=U.qrt.toFixed(2),r=U.qrnc;
var ti=r===0?‘⚪ Новый’:r<=100?‘🟢 Активный’:r<=500?‘🔵 Надёжный’:r<=2000?‘🟣 Доверенный’:‘⭐ Легенда’;
document.getElementById(‘m-qrt’).innerText=q;
document.getElementById(‘m-qrnc’).innerText=r;
document.getElementById(‘m-tier’).innerText=ti;
document.getElementById(‘w-qrt’).innerText=q;
document.getElementById(‘w-qrnc’).innerText=r;
document.getElementById(‘c-bal’).innerText=q;
document.getElementById(‘c-mini’).innerText=q+’ QRT’;
document.getElementById(‘qrnc-bar’).style.width=Math.min((r/2000)*100,100)+’%’;
}

// ТЁМНАЯ ТЕМА
function tDark(){U.dark=!U.dark;document.getElementById(‘app’).style.background=U.dark?’#1a1a1a’:’#ededed’;document.getElementById(‘dark-v’).innerText=U.dark?‘Вкл’:‘Выкл’;T(U.dark?‘🌙 Тёмная тема’:‘☀️ Светлая тема’);}

// ТОСТ
var tt;function T(m){var e=document.getElementById(‘toast’);e.innerText=m;e.classList.add(‘on’);clearTimeout(tt);tt=setTimeout(()=>e.classList.remove(‘on’),2500);}

document.addEventListener(‘click’,e=>{if(!e.target.closest(’.globe-wrap’))document.getElementById(‘l-menu’).style.display=‘none’;});
