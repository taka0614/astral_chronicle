{
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const cv=$('#cv'),ctx=cv.getContext('2d');
const W=240;let H=320,scene='title',B=null,time=0,page='home';
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),pick=a=>a[Math.floor(Math.random()*a.length)],clamp=(v,a,b)=>v<a?a:v>b?b:v;
const spd=()=>B?B.speed:1;
const sleep=ms=>new Promise(r=>setTimeout(r,ms/spd()));
const fmt=n=>Math.floor(n).toLocaleString('ja-JP');
let RS=3;function drawEHP(e,ex,w){const bw=Math.max(36,Math.min(110,w*.62)),bh=e.boss?4.4:3.4,x0=ex-bw/2,y0=e.y+4,r=Math.max(0,Math.min(1,e.hp/e.mhp));if(e.lag==null)e.lag=r;e.lag+= (r-e.lag)*.06;if(e.lag<r)e.lag=r;
 const rr=(x,y,w2,h2,rad)=>{ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w2,h2,rad);else ctx.rect(x,y,w2,h2)};
 ctx.save();ctx.shadowColor='rgba(0,0,0,.55)';ctx.shadowBlur=3;rr(x0-1.2,y0-1.2,bw+2.4,bh+2.4,(bh+2.4)/2);ctx.fillStyle='rgba(10,8,22,.88)';ctx.fill();ctx.restore();
 const fg=ctx.createLinearGradient(x0,0,x0+bw,0);if(e.boss){fg.addColorStop(0,'#ff3d6e');fg.addColorStop(.55,'#d42a9a');fg.addColorStop(1,'#8a3cff')}else if(r>.5){fg.addColorStop(0,'#2fd88a');fg.addColorStop(1,'#9af06a')}else if(r>.25){fg.addColorStop(0,'#f0a020');fg.addColorStop(1,'#ffe066')}else{fg.addColorStop(0,'#d81e3a');fg.addColorStop(1,'#ff6a5a')}
 ctx.save();rr(x0,y0,bw,bh,bh/2);ctx.clip();ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(x0,y0,bw,bh);if(e.lag>r){ctx.fillStyle='rgba(255,240,200,.85)';ctx.fillRect(x0,y0,bw*e.lag,bh)}ctx.fillStyle=fg;ctx.fillRect(x0,y0,bw*r,bh);
 const gl=ctx.createLinearGradient(0,y0,0,y0+bh);gl.addColorStop(0,'rgba(255,255,255,.55)');gl.addColorStop(.45,'rgba(255,255,255,.12)');gl.addColorStop(.5,'rgba(0,0,0,0)');gl.addColorStop(1,'rgba(0,0,0,.25)');ctx.fillStyle=gl;ctx.fillRect(x0,y0,bw,bh);
 if(e.boss){ctx.fillStyle='rgba(0,0,0,.35)';for(let i=1;i<10;i++)ctx.fillRect(x0+bw*i/10-.15,y0,.3,bh)}const sx=x0+bw*r;if(r>0&&r<1){const sg=ctx.createRadialGradient(sx,y0+bh/2,0,sx,y0+bh/2,bh*1.2);sg.addColorStop(0,'rgba(255,255,255,.7)');sg.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=sg;ctx.fillRect(sx-bh*1.2,y0-1,bh*2.4,bh+2)}ctx.restore();
 rr(x0-.6,y0-.6,bw+1.2,bh+1.2,(bh+1.2)/2);ctx.lineWidth=.55;ctx.strokeStyle=e.boss?'#e8c26a':'rgba(200,214,245,.85)';ctx.stroke();
 if(e.boss){ctx.save();ctx.translate(x0-1.5,y0+bh/2);ctx.rotate(Math.PI/4);ctx.fillStyle='#1a1028';ctx.fillRect(-2.6,-2.6,5.2,5.2);ctx.strokeStyle='#e8c26a';ctx.lineWidth=.6;ctx.strokeRect(-2.6,-2.6,5.2,5.2);ctx.fillStyle='#ff4a7a';ctx.fillRect(-1.2,-1.2,2.4,2.4);ctx.restore()}}
function resize(){const r=$('#stage').getBoundingClientRect();if(!r.width)return;RS=Math.min(5,Math.max(3,Math.ceil(r.width*Math.min(3,window.devicePixelRatio||1)/W)));H=Math.max(200,Math.round(W*r.height/r.width));cv.width=W*RS;cv.height=H*RS;ctx.imageSmoothingEnabled=false;ctx.imageSmoothingQuality='high'}
window.addEventListener('resize',()=>{resize();sresize()});

/* ================= AUDIO ================= */
let AC=null,master=null,muted=false,wantBGM=null,bgmTimer=null,bgmState=null;
function initAudio(){if(AC){if(AC.state==='suspended')AC.resume();return}try{AC=new(window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=.5;master.connect(AC.destination);setTimeout(()=>{loadFBGM('quest');loadFBGM('battle');loadFBGM('boss')},500);if(wantBGM)playBGM(wantBGM,true)}catch(e){AC=null}}
function tone(f,dur,type='square',vol=.2,when=0,slide=0){if(!AC||muted)return;const t=AC.currentTime+when,o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f*slide),t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.03)}
function noise(dur,vol=.3,when=0,hp=800){if(!AC||muted)return;const t=AC.currentTime+when,n=Math.floor(AC.sampleRate*dur),buf=AC.createBuffer(1,n,AC.sampleRate),d=buf.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);const s=AC.createBufferSource();s.buffer=buf;const f=AC.createBiquadFilter();f.type='highpass';f.frequency.value=hp;const g=AC.createGain();g.gain.value=vol;s.connect(f);f.connect(g);g.connect(master);s.start(t)}
const SFX={
 cur:()=>tone(1046,.04,'square',.07),ok:()=>{tone(784,.05,'square',.09);tone(1175,.07,'square',.09,.05)},ng:()=>tone(160,.15,'square',.1),
 hit:c=>{noise(.08,.28,0,700);tone(160+Math.min(40,c||0)*14,.06,'square',.08)},crit:()=>{noise(.18,.4,0,300);tone(90,.2,'sawtooth',.12,0,.4)},
 fire:()=>{noise(.4,.22,0,200);tone(200,.4,'sawtooth',.06,0,.3)},ice:()=>[1568,1760,2093].forEach((f,i)=>tone(f,.1,'triangle',.1,i*.05)),
 thunder:()=>{noise(.35,.38,0,100);tone(60,.3,'square',.1,0,.6)},water:()=>{tone(400,.3,'sine',.12,0,.4);noise(.3,.15,0,1500)},wind:()=>noise(.4,.25,0,2500),
 earth:()=>{noise(.5,.35,0,60);tone(70,.4,'square',.1,0,.5)},light:()=>[1046,1318,1568,2093].forEach((f,i)=>tone(f,.25,'sine',.1,i*.06)),
 dark:()=>{tone(220,.5,'sawtooth',.08,0,.25);tone(110,.5,'square',.06,.05,.5)},none:()=>{noise(.15,.2,0,1200)},
 heal:()=>[523,659,784,1046,1318].forEach((f,i)=>tone(f,.16,'triangle',.12,i*.05)),buff:()=>[392,523,659,784].forEach((f,i)=>tone(f,.12,'square',.07,i*.05)),
 lb:()=>{tone(220,.6,'sawtooth',.1,0,4);[523,659,784,1046].forEach((f,i)=>tone(f,.3,'square',.08,.35+i*.06));noise(.5,.3,.3,400)},
 ko:()=>tone(300,.4,'square',.08,0,.3),run:()=>[880,660,494,330].forEach((f,i)=>tone(f,.07,'square',.07,i*.05)),crys:()=>tone(1800+Math.random()*600,.05,'sine',.04),
 lvl:()=>[523,659,784,1046].forEach((f,i)=>tone(f,.14,'square',.09,i*.09)),coin:()=>{tone(1318,.06,'square',.08);tone(1760,.12,'square',.08,.06)},
 fall:()=>tone(2000,1,'sine',.08,0,.15),boom:r=>{noise(.8,.4,0,80);[r>=5?[523,784,1046,1568]:r>=4?[523,659,784]:[440,554]][0].forEach((f,i)=>tone(f,.5,'triangle',.12,.1+i*.08))},
 star:()=>tone(1760,.12,'square',.07)
};
function midi(n){const m=n.match(/^([a-g])(#?)(\d)$/);return 12*(+m[3]+1)+{c:0,d:2,e:4,f:5,g:7,a:9,b:11}[m[1]]+(m[2]?1:0)}
function parse(s){return s.trim().split(/\s+/).map(t=>{const[n,d]=t.split(':');return[n==='-'?0:midi(n),+d]})}
const SONGS={
 home:{step:.19,v:[{n:parse('c5:2 f5:2 a5:2 g5:3 f5:1 g5:2 a5:4 c6:2 a5:6 g5:2 f5:2 g5:2 a5:3 g5:1 f5:2 d5:4 e5:2 f5:6'),t:'triangle',vol:.11},{n:parse('f3:6 c4:6 f3:6 a3:6 a#2:6 c3:6 f3:6 f2:6'),t:'triangle',vol:.1}]},
 quest:{step:.16,v:[{n:parse('e5:2 g5:2 c6:4 b5:2 a5:2 g5:4 a5:2 f5:2 a5:2 c6:2 b5:4 g5:4 e5:2 g5:2 c6:4 d6:2 c6:2 b5:4 a5:2 b5:2 c6:2 a5:2 g5:8'),t:'square',vol:.04},{n:parse('c3:4 g3:4 c3:4 g3:4 f3:4 c4:4 g3:4 d3:4 c3:4 g3:4 e3:4 g3:4 f3:4 g3:4 c3:8'),t:'triangle',vol:.13}]},
 battle:{step:.11,v:[{n:parse('a4:1 c5:1 e5:1 a5:1 g5:2 e5:2 f5:1 e5:1 d5:1 c5:1 b4:2 e5:2 a4:1 c5:1 e5:1 a5:1 b5:2 c6:2 b5:1 a5:1 g#5:1 b5:1 a5:4'),t:'square',vol:.045},{n:parse('a2:1 a3:1 a2:1 a3:1 a2:1 a3:1 a2:1 a3:1 f2:1 f3:1 f2:1 f3:1 e2:1 e3:1 e2:1 e3:1 a2:1 a3:1 a2:1 a3:1 f2:1 f3:1 g2:1 g3:1 e2:1 e3:1 e2:1 e3:1 a2:1 a3:1 a2:1 a3:1'),t:'triangle',vol:.15}]},
 boss:{step:.1,v:[{n:parse('d5:1 f5:1 a5:1 d6:1 c#6:2 a5:2 a#5:1 a5:1 g5:1 f5:1 e5:2 c#5:2 d5:1 f5:1 a5:1 d6:1 e6:2 f6:2 e6:1 d6:1 c#6:1 e6:1 d6:4'),t:'sawtooth',vol:.032},{n:parse('d2:1 d3:1 d2:1 d3:1 d2:1 d3:1 d2:1 d3:1 a#1:1 a#2:1 a#1:1 a#2:1 a1:1 a2:1 a1:1 a2:1 d2:1 d3:1 d2:1 d3:1 a#1:1 a#2:1 c2:1 c3:1 a1:1 a2:1 a1:1 a2:1 d2:1 d3:1 d2:1 d3:1'),t:'triangle',vol:.16}]},
 dungeon:{step:.22,v:[{n:parse('d5:4 f5:4 e5:4 a4:4 d5:4 f5:2 g5:2 a5:8 a#5:4 a5:4 g5:4 e5:4 f5:4 e5:2 d5:2 c#5:8'),t:'square',vol:.03},{n:parse('d3:8 a2:8 d3:8 f3:8 g2:8 a2:8 d3:8 a2:8'),t:'triangle',vol:.13}]},
 summon:{step:.22,v:[{n:parse('e5:2 b5:2 a5:4 g5:2 e5:2 d5:4 e5:2 g5:2 b5:2 d6:2 c6:8'),t:'sine',vol:.1},{n:parse('a2:8 f2:8 c3:8 e3:8'),t:'triangle',vol:.1}]},
 victory:{step:.12,loop:false,v:[{n:parse('g4:1 c5:1 e5:1 g5:3 e5:1 g5:4 a5:1 g5:1 f5:1 e5:1 d5:1 e5:1 c5:6'),t:'square',vol:.07},{n:parse('c3:3 g3:3 c4:4 f3:2 g3:2 g2:2 c3:6'),t:'triangle',vol:.14}]}
};
function note(m,t,dur,type,vol){const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.value=440*Math.pow(2,(m-69)/12);g.gain.setValueAtTime(vol,t);g.gain.linearRampToValueAtTime(vol*.6,t+dur*.6);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.02)}
function playBGM(name,force){if(FBGM[name])return playFileBGM(name,force);if(wantBGM===name&&bgmTimer&&!force)return;stopSeq();wantBGM=name;if(!AC||muted||!name)return;const s=SONGS[name],t0=AC.currentTime+.06;bgmState={s,vo:s.v.map(v=>({v,i:0,t:t0}))};bgmTimer=setInterval(tickSeq,40);tickSeq()}
function stopSeq(){stopFileBGM();clearInterval(bgmTimer);bgmTimer=null;bgmState=null}
function tickSeq(){const st=bgmState;if(!st||!AC)return;const ahead=AC.currentTime+.25;let alive=false;for(const vo of st.vo){while(vo.t<ahead){if(vo.i>=vo.v.n.length){if(st.s.loop===false)break;vo.i=0}const[m,d]=vo.v.n[vo.i++];const dur=d*st.s.step;if(m)note(m,vo.t,dur*.92,vo.v.t,vo.v.vol);vo.t+=dur}if(vo.i<vo.v.n.length||st.s.loop!==false)alive=true}if(!alive)stopSeq()}
function setMute(v){muted=v;if(muted)stopSeq();else playBGM(wantBGM,true);$('#sndL').textContent='音 '+(muted?'OFF':'ON')}

/* ================= SPRITES ================= */
function mk(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;return{c,g}}
function E(g,cx,cy,rx,ry,col){g.fillStyle=col;for(let y=-ry;y<=ry;y++){const w=rx*Math.sqrt(Math.max(0,1-(y/ry)*(y/ry)));g.fillRect(Math.round(cx-w),cy+y,Math.round(w*2)||1,1)}}
function outline(src){const w=src.width,h=src.height,{c,g}=mk(w,h);const sd=src.getContext('2d').getImageData(0,0,w,h).data;const out=g.createImageData(w,h),o=out.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(sd[i+3]>100){o[i]=sd[i];o[i+1]=sd[i+1];o[i+2]=sd[i+2];o[i+3]=255}else{let n=false;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<w&&Y<h&&sd[(Y*w+X)*4+3]>100){n=true;break}}if(n){o[i]=22;o[i+1]=16;o[i+2]=32;o[i+3]=255}}}
 g.putImageData(out,0,0);return c}
const SPR={};
function chibi(p,dir,fr,pose=''){
 const key=p.id+dir+fr+pose;if(SPR[key])return SPR[key];
 const{c,g}=mk(20,22);const d=dir==='left'?'right':dir;
 const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x+2,y+4,w,h)};
 const side=d==='right',a=fr?1:0,shoe='#3a2418';
 if(p.cape&&d!=='up'){if(side)R(2,8,4,7,p.cape);else R(3,8,10,7,p.cape)}
 if(side){R(6-a,12,2,3,p.pants);R(8+a,12,2,3,p.pants);R(6-a,15,2,1,shoe);R(8+a,15,3,1,shoe)}
 else{R(5,12,2,3-a,p.pants);R(5,15-a,2,1,shoe);R(9,12,2,2+a,p.pants);R(9,14+a,2,1,shoe)}
 R(4,8,8,5,p.cloth);if(p.robe)R(4,12,8,2,p.cloth);R(4,11,8,1,p.acc);if(p.armor)R(5,8,6,2,p.armor);
 if(p.cape&&d==='up')R(3,8,10,7,p.cape);
 if(pose==='cast'){R(3,4,1,5,p.cloth);R(12,4,1,5,p.cloth);R(3,3,1,1,p.skin);R(12,3,1,1,p.skin)}
 else if(pose==='atk'&&side){R(11,9,4,2,p.cloth);R(15,9,1,2,p.skin);const w=p.wpn;
  if(w==='sword'){R(16,3,1,7,'#e4e8f4');R(17,3,1,6,'#9aa2b8');R(15,10,3,1,'#c08a30')}
  else if(w==='katana'){R(16,1,1,9,'#f0f4ff');R(15,10,3,1,'#2a2a2a')}
  else if(w==='spear'){R(16,0,1,14,'#a07a40');R(15,-2,3,3,'#e4e8f4')}
  else if(w==='staff'){R(16,1,1,12,'#a06a30');R(15,0,3,2,p.acc)}
  else if(w==='bow'){R(17,4,1,10,'#8a5a2a');R(16,3,1,1,'#8a5a2a');R(16,14,1,1,'#8a5a2a');R(15,8,2,1,'#ddd')}
  else if(w==='fist'){R(15,8,2,3,p.acc)}
  else if(w==='dsword'){R(16,2,2,8,'#6a3a8a');R(16,2,1,8,'#c8a0ff');R(15,10,4,1,'#3a1a4a')}
  else{R(16,7,1,4,'#e4e8f4');R(15,10,3,1,'#8a5a2a')}}
 else if(side){R(7+(fr?1:-1),9,2,3,p.cloth);R(7+(fr?1:-1),12,2,1,p.skin)}
 else{R(3,9,1,3,p.cloth);R(12,9,1,3,p.cloth);R(3,12,1,1,p.skin);R(12,12,1,1,p.skin)}
 R(3,1,10,7,p.skin);
 const eye=p.eye||'#2a1830';
 if(p.hat==='long'){if(d==='up')R(2,0,12,10,p.hair);else if(side)R(2,2,5,9,p.hair);else{R(2,2,2,9,p.hair);R(12,2,2,9,p.hair)}}
 if(d==='down'){R(3,0,10,3,p.hair);R(3,3,2,3,p.hair);R(11,3,2,3,p.hair);R(5,4,2,2,eye);R(9,4,2,2,eye);R(5,4,1,1,'#fff');R(9,4,1,1,'#fff')}
 else if(d==='up'){R(3,0,10,8,p.hair)}
 else{R(3,0,10,3,p.hair);R(3,3,5,4,p.hair);R(10,4,2,2,eye);R(11,4,1,1,'#fff')}
 const hc=p.hatc||'#888';
 switch(p.hat){
 case 'helm':R(2,-1,12,4,'#c8ccd8');R(2,3,2,4,'#a2a6b4');R(12,3,2,4,'#a2a6b4');R(4,0,4,1,'#f0f2ff');R(6,-3,4,2,'#d43a32');R(7,-4,3,1,'#d43a32');if(d==='up')R(3,3,10,4,'#a2a6b4');break;
 case 'witch':R(0,1,16,2,hc);R(3,-1,10,2,hc);R(5,-3,7,2,hc);R(8,-4,6,1,hc);R(3,0,10,1,p.acc);break;
 case 'hood':R(2,-1,12,3,hc);R(2,2,2,6,hc);R(12,2,2,6,hc);R(2,2,12,1,p.acc);if(d==='up')R(2,-1,12,9,hc);break;
 case 'band':R(3,0,10,2,p.hair);R(2,-1,3,2,p.hair);R(11,-1,3,2,p.hair);R(3,2,10,1,'#d43a32');if(side){R(0,2,3,1,'#d43a32');R(-1,3,2,1,'#d43a32')}if(d==='up')R(7,2,2,4,'#d43a32');break;
 case 'spiky':R(3,-1,2,2,p.hair);R(6,-2,2,3,p.hair);R(9,-2,2,3,p.hair);R(12,-1,2,2,p.hair);break;
 case 'dragoon':R(2,-1,12,4,hc);R(2,3,2,4,hc);R(12,3,2,4,hc);R(0,-3,3,3,hc);R(13,-3,3,3,hc);R(7,-4,2,3,p.acc);R(4,0,3,1,'#ffffff80');if(d==='up')R(3,3,10,4,hc);break;
 case 'ninja':R(2,-1,12,9,hc);if(d!=='up'){if(side){R(8,3,5,2,p.skin);R(10,3,2,2,eye)}else{R(4,3,8,2,p.skin);R(5,3,2,2,eye);R(9,3,2,2,eye)}}R(3,1,10,1,p.acc);if(side)R(0,1,3,1,p.acc);break;
 case 'horn':R(2,-1,12,3,hc);R(2,2,2,6,hc);R(12,2,2,6,hc);R(7,-4,2,3,'#f0e0a0');R(8,-5,1,1,'#f0e0a0');if(d==='up')R(2,-1,12,9,hc);break;
 case 'samurai':R(7,-3,3,3,p.hair);R(3,2,10,1,p.acc);break;
 case 'tiara':R(2,2,2,9,p.hair);R(12,2,2,9,p.hair);R(4,0,8,1,'#f0d040');R(7,-1,2,2,'#7ae8ff');if(d==='up')R(2,0,12,10,p.hair);break;
 case 'beret':R(2,-1,13,3,hc);R(13,-4,2,4,'#fff');R(14,-5,1,1,'#fff');break;
 case 'darkhelm':R(2,-1,12,9,hc);R(1,-3,2,3,'#ddd');R(13,-3,2,3,'#ddd');if(d!=='up'){if(side)R(8,4,5,1,'#ff3a3a');else R(4,4,8,1,'#ff3a3a')}break;
 case 'bald':R(3,0,10,2,p.skin);R(3,2,2,3,p.hair);R(11,2,2,3,p.hair);break;
 case 'cap':R(2,-1,12,3,hc);if(d==='down')R(2,2,12,1,'#fff');if(side)R(12,1,3,1,hc);break;
 }
 let out=c;if(dir==='left'){const f=mk(20,22);f.g.translate(20,0);f.g.scale(-1,1);f.g.drawImage(c,0,0);out=f.c}
 return SPR[key]=outline(out);
}
const PIMG={};
const ART={};function art(id){let im=ART[id];if(!im){im=ART[id]=new Image();im.src='img/'+id+'.webp'}return im.complete&&im.naturalWidth?im:null}
function portrait(id){return 'img/face_'+id+'.webp'}
function portraitOld(id){if(PIMG[id])return PIMG[id];const s=chibi(UNITS[id].pal,'down',0);const{c,g}=mk(16,16);g.drawImage(s,2,0,16,16,0,0,16,16);return PIMG[id]=c.toDataURL()}
const FIMG={};
function fullImg(id){return 'img/'+id+'.webp'}
function fullImgOld(id){if(FIMG[id])return FIMG[id];return FIMG[id]=chibi(UNITS[id].pal,'down',0).toDataURL()}

/* enemy art */
/* ===== 72 pillars art ===== */
const dP=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h)};
function dLine(g,x0,y0,x1,y1,t,c){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))||1;for(let i=0;i<=n;i++)dP(g,x0+(x1-x0)*i/n,y0+(y1-y0)*i/n,t,t,c)}
function dCrown(g,cx,y){const c='#f0c030';dP(g,cx-4,y+2,9,2,c);dP(g,cx-4,y,1,2,c);dP(g,cx,y-1,1,3,c);dP(g,cx+4,y,1,2,c);dP(g,cx,y+2,1,1,'#e03030')}
function dWing(g,x,y,w,h,c,dk){for(let i=0;i<w;i++){const hh=Math.max(2,h-Math.floor(i*h/(w+2)));dP(g,x-i,y-Math.floor(i*.5),1,hh,i%3===2?dk:c)}}
function dSnake(g,x,y,len,c,dir=-1){for(let i=0;i<len;i++)dP(g,x+dir*i,y+Math.round(Math.sin(i*.6)*2),2,2,c);const hx=x+dir*len;dP(g,hx-1,y-1,3,3,c);dP(g,hx+dir*2,y,2,1,'#e02020')}
function dViper(g,x,y,len,c){for(let i=0;i<len;i++)dP(g,x+Math.round(Math.sin(i*.6)*2),y-i,2,1,c);dP(g,x-1,y-len-2,4,3,c);dP(g,x+2,y-len-1,1,1,'#ffe23a');dP(g,x+3,y-len,2,1,'#e02020')}
function hLion(g,cx,cy,mane,face,eye){E(g,cx,cy,8,7,mane);dP(g,cx-7,cy-8,3,3,mane);dP(g,cx+5,cy-8,3,3,mane);E(g,cx+1,cy+1,5,4,face);dP(g,cx-1,cy-1,2,2,eye||'#ffe23a');dP(g,cx+3,cy-1,2,2,eye||'#ffe23a');dP(g,cx+2,cy+2,2,1,'#3a1a10');dP(g,cx,cy+4,5,1,'#5a1a10')}
function hHuman(g,cx,cy,o={}){const hair=o.hair||'#2a1a1a';if(o.long){dP(g,cx-5,cy-4,2,10,hair);dP(g,cx+4,cy-4,2,10,hair)}E(g,cx,cy,4,5,o.skin||'#e8c8b0');dP(g,cx-4,cy-5,9,2,hair);dP(g,cx-4,cy-3,1,3,hair);dP(g,cx+4,cy-3,1,3,hair);dP(g,cx-2,cy-1,1,1,o.eye||'#c02020');dP(g,cx+2,cy-1,1,1,o.eye||'#c02020');dP(g,cx-1,cy+3,3,1,o.lip||'#8a4a4a');if(o.crown)dCrown(g,cx,cy-9)}
function hBull(g,cx,cy,c){E(g,cx,cy,5,5,c);E(g,cx+1,cy+4,3,2,'#d8b8a0');dP(g,cx-2,cy-1,1,2,'#ff3030');dP(g,cx+3,cy-1,1,2,'#ff3030');dP(g,cx-8,cy-4,4,2,'#ece4c4');dP(g,cx-9,cy-7,2,3,'#ece4c4');dP(g,cx+5,cy-4,4,2,'#ece4c4');dP(g,cx+8,cy-7,2,3,'#ece4c4')}
function hRam(g,cx,cy,c){E(g,cx,cy,4,6,c);dP(g,cx-2,cy-1,1,1,'#ff3030');dP(g,cx+2,cy-1,1,1,'#ff3030');E(g,cx-6,cy-2,3,3,'#c8b890');E(g,cx-6,cy-2,1,1,c);E(g,cx+6,cy-2,3,3,'#c8b890');E(g,cx+6,cy-2,1,1,c)}
function hCat(g,cx,cy,c){E(g,cx,cy,5,4,c);dP(g,cx-5,cy-6,2,3,c);dP(g,cx+4,cy-6,2,3,c);dP(g,cx-3,cy-1,2,1,'#7aff3a');dP(g,cx+2,cy-1,2,1,'#7aff3a');dP(g,cx,cy+1,1,1,'#ff8aa0');dP(g,cx-7,cy+1,3,1,'#ddd');dP(g,cx+5,cy+1,3,1,'#ddd')}
function hToad(g,cx,cy){E(g,cx,cy,6,4,'#6a8a3a');E(g,cx-3,cy-4,2,2,'#8aaa4a');E(g,cx+3,cy-4,2,2,'#8aaa4a');dP(g,cx-3,cy-4,1,1,'#000');dP(g,cx+3,cy-4,1,1,'#000');dP(g,cx-4,cy+1,9,1,'#2a3a1a');dP(g,cx-2,cy-1,1,1,'#aac060');dP(g,cx+2,cy,1,1,'#aac060')}
function hBird(g,cx,cy,c,beak,eye){E(g,cx,cy,5,5,c);dP(g,cx+4,cy,6,2,beak);dP(g,cx+4,cy+2,4,1,beak);dP(g,cx+1,cy-2,2,2,eye||'#ffe23a')}
function hDog(g,cx,cy,c){E(g,cx,cy,5,4,c);dP(g,cx+3,cy+1,6,3,c);dP(g,cx+8,cy+1,1,1,'#111');dP(g,cx-3,cy-6,2,3,c);dP(g,cx,cy-6,2,3,c);dP(g,cx+1,cy-1,1,1,'#ff3030');dP(g,cx+4,cy+4,3,1,'#fff')}
function mHorse(g,x,y,c,mane){dP(g,x,y+3,3,10,mane);E(g,x+15,y+6,12,6,c);for(const[lx,d]of[[5,0],[10,1],[19,1],[24,0]]){dP(g,x+lx,y+10+d,3,12-d,c);dP(g,x+lx,y+21,3,2,'#2a2018')}dP(g,x+24,y-5,5,11,c);E(g,x+30,y-5,5,3,c);dP(g,x+33,y-6,1,1,'#111');dP(g,x+23,y-6,2,10,mane);dP(g,x+26,y-9,2,3,c)}
function mBear(g,x,y,c){E(g,x+14,y+7,13,8,c);for(const lx of[3,9,18,23])dP(g,x+lx,y+12,5,9,c);E(g,x+29,y+3,6,5,c);dP(g,x+25,y-3,3,3,c);E(g,x+34,y+5,3,2,'#c8a080');dP(g,x+36,y+4,2,1,'#111');dP(g,x+30,y+1,1,1,'#111')}
function mCamel(g,x,y,c){E(g,x+14,y+8,12,5,c);E(g,x+13,y+2,6,4,c);for(const lx of[4,9,19,23])dP(g,x+lx,y+11,2,15,c);dP(g,x+24,y-7,3,14,c);E(g,x+28,y-8,5,3,c);dP(g,x+31,y-9,1,1,'#111');dP(g,x,y+6,2,7,c)}
function mDragon(g,x,y,c,dk){dSnake(g,x+4,y+10,6,c);E(g,x+18,y+8,15,7,c);E(g,x+18,y+12,11,3,dk);for(const lx of[7,13,23,28])dP(g,x+lx,y+12,4,8,c);dP(g,x+29,y-4,5,12,c);E(g,x+36,y-5,6,4,c);dP(g,x+40,y-3,4,2,dk);dP(g,x+37,y-7,2,1,'#ff3030');dP(g,x+33,y-11,2,4,'#e8e0c0')}
function mRider(g,cx,y,c,trim,h=11){dP(g,cx-5,y,10,h,c);dP(g,cx-5,y+2,10,1,trim);dP(g,cx-1,y,2,h,trim)}
const DART={
 stolas(g){dWing(g,9,15,8,12,'#3a3a6a','#24244a');E(g,16,18,8,9,'#4a4a7a');E(g,17,21,5,5,'#9a9ac0');for(let y=19;y<26;y+=2)dP(g,14,y,6,1,'#6a6a98');E(g,16,9,7,6,'#4a4a7a');E(g,13,9,3,3,'#ffe23a');E(g,19,9,3,3,'#ffe23a');dP(g,13,9,1,2,'#000');dP(g,19,9,1,2,'#000');dP(g,16,11,2,3,'#f0a030');dCrown(g,16,1);dP(g,13,26,2,9,'#e09030');dP(g,18,26,2,9,'#e09030');dP(g,11,34,5,1,'#e09030');dP(g,17,34,5,1,'#e09030');return[30,36]},
 marbas(g){dP(g,2,10,3,10,'#c89040');E(g,3,20,2,2,'#7a4a20');E(g,20,18,14,8,'#d8a050');E(g,20,22,11,3,'#f0d090');for(const lx of[9,15,25,31]){dP(g,lx,22,4,11,'#c89040');dP(g,lx,32,5,1,'#7a4a20')}hLion(g,36,12,'#8a4a1a','#e0b060');return[46,34]},
 vine(g){mHorse(g,3,30,'#24242e','#5a5a6a');mRider(g,17,19,'#5a2a6a','#c8a040',13);dP(g,22,22,7,2,'#5a2a6a');dP(g,28,20,2,3,'#e0b060');dViper(g,29,19,10,'#3aa03a');hLion(g,17,12,'#6a3a1a','#e0b060');return[46,54]},
 aunas(g){for(const[x0,y0]of[[7,10],[13,4],[19,0],[25,5],[31,11]])for(let i=0;i<12;i++)dP(g,x0-Math.floor(i/3),y0+i,1+Math.floor(i/1.5),1,'#ff5a1a');E(g,19,31,15,12,'#c02010');E(g,19,27,12,13,'#ff5a1a');E(g,19,25,8,11,'#ffa020');E(g,19,27,4,7,'#ffe060');dP(g,13,24,4,4,'#fff');dP(g,22,24,4,4,'#fff');dP(g,15,25,2,3,'#1a0000');dP(g,24,25,2,3,'#1a0000');dP(g,15,32,9,2,'#5a0000');dP(g,16,34,7,1,'#5a0000');return[38,44]},
 alloces(g){mHorse(g,3,30,'#7a4a2a','#3a2010');for(let i=0;i<26;i++)dP(g,22+i*.8,30-i,2,1,'#c8c8d8');dP(g,42,6,3,5,'#e8e8f8');mRider(g,17,18,'#a02020','#e0a030',13);dP(g,11,18,12,3,'#c83030');dP(g,22,22,5,2,'#a02020');hLion(g,17,11,'#c03020','#e8a060','#ff8a00');return[46,54]},
 amon(g){for(let i=0;i<13;i++)dP(g,11-i,18+Math.round(Math.sin(i*.6)*3),2,2,'#3a8a3a');dP(g,-1,13,4,3,'#3a8a3a');E(g,23,20,13,7,'#4a4a5a');E(g,23,24,10,3,'#6a6a7a');for(const lx of[12,17,27,32]){dP(g,lx,24,3,10,'#3a3a4a');dP(g,lx,33,4,1,'#1a1a24')}hBird(g,37,12,'#1a1a24','#d0a020','#ff3030');E(g,49,14,4,3,'#ff5a1a');E(g,50,14,2,2,'#ffe060');dP(g,30,6,4,3,'#1a1a24');return[54,36]},
 halphas(g){E(g,13,22,9,6,'#f4f4f4');dP(g,4,19,7,7,'#1a1a1a');dP(g,4,21,9,1,'#444');dP(g,17,9,3,12,'#f4f4f4');E(g,19,7,4,3,'#f4f4f4');dP(g,17,3,4,2,'#c02020');dP(g,22,7,8,2,'#e05020');dP(g,22,9,6,1,'#c04010');dP(g,20,6,1,1,'#000');dP(g,11,28,2,17,'#e05020');dP(g,15,28,2,17,'#e05020');dP(g,8,44,6,1,'#e05020');dP(g,14,44,6,1,'#e05020');for(let i=0;i<14;i++)dP(g,2+i,30-i*0,1,1,'#ccc');dP(g,0,30,16,1,'#c8c8d8');dP(g,15,29,2,3,'#a07030');return[30,46]},
 bune(g){dWing(g,22,20,15,15,'#2e5a3a','#1e4a2a');dSnake(g,10,32,9,'#3a6a4a');E(g,24,32,16,9,'#3a6a4a');E(g,24,36,12,4,'#c8c080');for(const lx of[12,19,28,34])dP(g,lx,36,4,9,'#2e5a3a');dLine(g,34,28,38,10,3,'#3a6a4a');dLine(g,35,28,44,18,3,'#3a6a4a');dLine(g,36,30,46,30,3,'#3a6a4a');hHuman(g,38,8,{skin:'#d8c0a0',hair:'#1a1a1a',eye:'#c02020'});hDog(g,45,17,'#8a6a4a');hBird(g,47,29,'#d0a040','#f0d060','#ff3030');return[57,46]},
 forneus(g){for(let i=0;i<12;i++){dP(g,i,10+i*.7,2,24-i*1.4,'#1e5a7a')}E(g,32,22,24,13,'#2a6a8a');E(g,32,29,20,6,'#8ac8d8');for(let i=0;i<5;i++)for(let k=0;k<6;k++)dP(g,18+i*7+k*.3,9-k+1,2,1,'#1e4a6a');dP(g,22,10,22,2,'#1e4a6a');E(g,28,30,6,3,'#1e5a7a');dP(g,46,24,12,5,'#4a0a1a');for(let x=47;x<58;x+=2){dP(g,x,24,1,2,'#fff');dP(g,x+1,27,1,2,'#fff')}E(g,47,17,3,3,'#ffe23a');dP(g,48,17,1,2,'#000');for(let x=0;x<58;x+=5)dP(g,x,40+(x%10?0:1),3,2,'#9ad0ff');return[58,43]},
 marchosias(g){dWing(g,24,14,14,16,'#c8a060','#8a6a30');for(let i=0;i<10;i++)dP(g,10-i,18+Math.round(Math.sin(i*.6)*3),2,2,'#3a7a3a');dP(g,-1,13,4,3,'#3a7a3a');E(g,25,20,14,7,'#6a5a4a');E(g,25,24,10,3,'#9a8a6a');for(const lx of[13,19,29,35]){dP(g,lx,24,3,11,'#5a4a3a')}E(g,40,14,6,5,'#6a5a4a');dP(g,44,15,7,4,'#6a5a4a');dP(g,38,7,2,4,'#6a5a4a');dP(g,42,7,2,4,'#6a5a4a');dP(g,42,12,2,2,'#ffe23a');dP(g,46,19,4,1,'#fff');E(g,52,17,3,2,'#ff5a1a');return[56,38]},
 zagan(g){dWing(g,22,14,14,16,'#d8b040','#9a7820');E(g,24,22,15,8,'#5a3a2a');E(g,24,26,11,3,'#7a5a4a');for(const lx of[12,18,28,34]){dP(g,lx,26,4,10,'#4a2a1a');dP(g,lx,35,4,2,'#1a1008')}dP(g,8,18,2,10,'#4a2a1a');hBull(g,42,18,'#5a3a2a');dP(g,41,24,3,1,'#f0c030');return[54,38]},
 purson(g){mBear(g,4,36,'#6a4a2a');mRider(g,18,24,'#c8a040','#7a3a1a',12);dP(g,23,27,6,2,'#c8a040');dP(g,28,25,2,3,'#e0b060');dViper(g,29,25,11,'#3aa03a');dP(g,9,27,6,2,'#c8a040');dLine(g,8,26,2,20,2,'#f0c030');E(g,2,19,2,3,'#f0c030');hLion(g,18,16,'#9a6a20','#e8c080');dCrown(g,18,5);return[46,58]},
 eligos(g){dSnake(g,30,46,10,'#3a8a3a',-1);dP(g,13,30,5,15,'#4a5a7a');dP(g,20,30,5,15,'#4a5a7a');dP(g,12,44,7,2,'#2a3048');dP(g,19,44,7,2,'#2a3048');dP(g,10,16,18,16,'#6a7a9a');dP(g,10,16,18,2,'#9aaacc');dP(g,7,15,6,5,'#9aaacc');dP(g,25,15,6,5,'#9aaacc');dP(g,10,26,18,2,'#c8a040');dP(g,13,4,12,12,'#6a7a9a');dP(g,13,4,12,2,'#9aaacc');dP(g,15,9,9,2,'#111');dP(g,16,9,2,2,'#ff3030');dP(g,21,9,2,2,'#ff3030');dP(g,17,-1,4,6,'#c02030');dP(g,33,0,2,48,'#8a6a3a');dP(g,32,-1,4,4,'#e8e8f8');dP(g,35,4,10,7,'#c02030');dP(g,35,6,10,1,'#f0c030');dP(g,28,20,5,3,'#6a7a9a');return[46,48]},
 beleth(g){mHorse(g,3,32,'#dcdce4','#a8a8b8');dP(g,7,22,14,12,'#a02030');mRider(g,17,20,'#e8e0d0','#c8a040',12);dP(g,22,22,4,2,'#e8e0d0');dLine(g,24,21,32,17,2,'#f0c030');E(g,33,16,2,3,'#f0c030');hHuman(g,17,13,{skin:'#d8c0b0',hair:'#3a2a1a',crown:1,eye:'#ff2020'});return[46,56]},
 balam(g){mBear(g,8,38,'#4a3a2a');for(let i=0;i<12;i++)dP(g,10-i,30+Math.round(Math.sin(i*.6)*3),2,2,'#3a7a3a');mRider(g,23,24,'#4a2a5a','#c8a040',14);dP(g,28,27,8,2,'#4a2a5a');dP(g,35,25,3,3,'#d8a070');E(g,37,20,3,3,'#8a5a2a');dP(g,39,19,3,1,'#f0c030');dP(g,38,18,1,1,'#ffe23a');dP(g,34,19,3,2,'#6a4020');hBull(g,13,17,'#5a3a2a');hRam(g,33,15,'#d8d0c0');hHuman(g,23,15,{skin:'#d0b090',hair:'#2a1a1a',eye:'#ff6a00',crown:1});return[48,60]},
 astaroth(g){mDragon(g,2,38,'#3a2a4a','#6a4a7a');dWing(g,18,20,12,16,'#1a1a24','#3a3a4a');mRider(g,23,24,'#2a2a3a','#a080ff',12);dP(g,28,27,6,2,'#2a2a3a');dP(g,33,25,2,3,'#e8d0c0');dViper(g,34,25,12,'#3aa03a');hHuman(g,23,17,{skin:'#e8d8d0',hair:'#e8e8f0',eye:'#a020ff'});dP(g,18,7,11,1,'#c8a040');dP(g,19,6,2,1,'#c8a040');return[56,58]},
 belial(g){for(const[x0,y0]of[[12,18],[20,14],[30,16],[40,14],[47,19]])for(let i=0;i<10;i++)dP(g,x0-Math.floor(i/3),y0+i,1+Math.floor(i/1.5),1,'#ff6a1a');dWing(g,22,14,9,12,'#f0e8c0','#c8b880');dWing(g,36,12,9,12,'#f0e8c0','#c8b880');mRider(g,22,20,'#f4f4f4','#d0a030',8);mRider(g,36,18,'#f4f4f4','#d0a030',10);hHuman(g,22,13,{skin:'#f0dcd0',hair:'#f0d070',eye:'#c02040',long:1});hHuman(g,36,11,{skin:'#f0dcd0',hair:'#2a2a3a',eye:'#c02040',long:1});dP(g,10,28,40,12,'#8a2a1a');dP(g,10,28,40,2,'#d0a030');dP(g,10,34,40,1,'#d0a030');E(g,18,42,6,6,'#d0a030');E(g,18,42,4,4,'#5a1a10');E(g,42,42,6,6,'#d0a030');E(g,42,42,4,4,'#5a1a10');dP(g,50,32,6,2,'#d0a030');for(let x=8;x<54;x+=3)dP(g,x,40+((x*7)%5),2,3,'#ffa020');return[58,49]},
 paimon(g){mCamel(g,4,40,'#c8a060');mRider(g,17,25,'#2a7a8a','#f0c030',13);dP(g,10,26,14,3,'#f0c030');dP(g,22,28,7,2,'#2a7a8a');dP(g,28,26,3,3,'#f0dcc8');hHuman(g,17,17,{skin:'#f0dcc8',hair:'#6a3a8a',eye:'#20a0a0',long:1,lip:'#c04060',crown:1});return[48,60]},
 asmodeus(g){mDragon(g,2,40,'#7a1a1a','#c84a2a');dSnake(g,14,34,8,'#3a7a3a');mRider(g,25,26,'#222230','#c02030',14);dP(g,30,29,8,2,'#222230');dP(g,30,40,4,2,'#f09020');dP(g,22,40,4,2,'#f09020');dP(g,40,0,2,46,'#8a6a3a');dP(g,39,-1,4,4,'#e8e8f8');dP(g,42,3,9,6,'#c02030');dP(g,44,5,3,2,'#111');hBull(g,14,19,'#4a2a1a');hRam(g,36,18,'#d8d0c0');hHuman(g,25,17,{skin:'#c0a080',hair:'#1a0a0a',eye:'#ff2020',crown:1});return[56,60]},
 baal(g){for(let k=0;k<4;k++){const y=30+k*3;dLine(g,22,y,10-k*2,y-10+k*2,2,'#4a4058');dLine(g,10-k*2,y-10+k*2,2+k,y+14,2,'#4a4058');dLine(g,38,y,50+k*2,y-10+k*2,2,'#4a4058');dLine(g,50+k*2,y-10+k*2,58-k,y+14,2,'#4a4058')}E(g,30,36,13,10,'#1a1a22');E(g,30,34,9,6,'#3a2a4a');for(let i=0;i<5;i++)dP(g,26+i*2,32,1,1,'#ff2a2a');E(g,30,46,8,5,'#1a1a22');hToad(g,17,21);hCat(g,43,21,'#4a3a3a');hHuman(g,30,16,{skin:'#d8c8c0',hair:'#1a1a2a',eye:'#ff2020',crown:1});return[61,52]},
 imp(g){dWing(g,8,6,6,8,'#5a1a2a','#3a0a1a');E(g,12,14,6,6,'#c03030');E(g,12,8,5,4,'#c03030');dP(g,8,3,2,3,'#e8d0a0');dP(g,15,3,2,3,'#e8d0a0');dP(g,10,7,2,2,'#ffe23a');dP(g,14,7,2,2,'#ffe23a');dP(g,11,11,4,1,'#3a0000');dP(g,9,19,3,6,'#a02020');dP(g,13,19,3,6,'#a02020');dSnake(g,6,18,5,'#a02020');dP(g,19,2,1,22,'#5a4a3a');dP(g,17,1,1,3,'#c8c8d8');dP(g,19,0,1,3,'#c8c8d8');dP(g,21,1,1,3,'#c8c8d8');return[24,26]}
};

function enemyArt(id){
 const k='en_'+id;if(SPR[k])return SPR[k];
 const d0=ENEMIES[id];let w=24,h=24;const P=(g,x,y,ww,hh,c)=>{g.fillStyle=c;g.fillRect(x,y,ww,hh)};const c=d0.col||{};
 const draw={
 slime(g){w=24;h=20;E(g,12,11,10,7,c.c||'#4cbc4c');E(g,12,14,11,4,c.c||'#4cbc4c');E(g,12,16,9,2,c.d||'#2e8a2e');P(g,6,7,3,2,'#e8ffe8');P(g,7,10,2,3,'#111');P(g,14,10,2,3,'#111');P(g,10,15,4,1,'#222')},
 kslime(g){w=46;h=40;E(g,23,26,21,13,'#4cbc4c');E(g,23,32,22,7,'#4cbc4c');E(g,23,35,19,3,'#2e8a2e');E(g,12,18,4,2,'#e8ffe8');P(g,14,22,4,5,'#111');P(g,28,22,4,5,'#111');P(g,15,23,1,2,'#fff');P(g,29,23,1,2,'#fff');P(g,19,31,8,2,'#222');P(g,14,7,18,6,'#f0c030');P(g,14,3,3,4,'#f0c030');P(g,21,1,4,6,'#f0c030');P(g,29,3,3,4,'#f0c030');P(g,22,8,2,2,'#e03030');P(g,16,9,2,2,'#3a8ae0');P(g,28,9,2,2,'#3a8ae0')},
 bat(g){w=32;h=20;for(let i=0;i<11;i++){const hh=Math.max(2,9-Math.floor(i*.7));P(g,10-i,5+(i>>2),1,hh,c.d||'#3e2858');P(g,21+i,5+(i>>2),1,hh,c.d||'#3e2858')}E(g,16,10,5,6,c.c||'#6a4a8a');P(g,12,2,2,4,c.c||'#6a4a8a');P(g,18,2,2,4,c.c||'#6a4a8a');P(g,13,8,2,2,'#ff3a3a');P(g,17,8,2,2,'#ff3a3a');P(g,14,13,1,2,'#fff');P(g,17,13,1,2,'#fff')},
 goblin(g){w=26;h=30;P(g,20,4,3,14,'#8a5a2a');E(g,21,5,3,3,'#9a6a36');P(g,8,22,3,7,'#5a9a3c');P(g,14,22,3,7,'#5a9a3c');P(g,7,14,12,9,'#7a5230');P(g,7,17,12,1,'#4a3018');P(g,4,15,3,6,'#6ab04c');P(g,19,15,3,6,'#6ab04c');E(g,13,9,7,6,'#6ab04c');P(g,3,7,4,2,'#6ab04c');P(g,19,7,4,2,'#6ab04c');P(g,9,8,2,2,'#ffe23a');P(g,15,8,2,2,'#ffe23a');P(g,10,12,6,1,'#2a3a1a');P(g,11,13,1,1,'#fff');P(g,14,13,1,1,'#fff')},
 wolf(g){w=36;h=24;const b=c.c||'#8a8a96',dd=c.d||'#7a7a86',l=c.l||'#b4b4c0';P(g,30,6,3,7,dd);P(g,32,4,2,3,dd);E(g,20,13,11,6,b);E(g,20,16,9,2,l);P(g,11,17,3,6,dd);P(g,16,17,3,6,dd);P(g,23,17,3,6,dd);P(g,28,17,3,6,dd);E(g,9,10,6,5,b);P(g,1,10,6,4,b);P(g,0,10,2,2,'#222');P(g,8,3,2,4,dd);P(g,12,4,2,4,dd);P(g,6,8,3,2,'#ffe23a');P(g,2,14,5,1,'#fff')},
 skel(g){w=24;h=34;P(g,19,6,2,16,'#c8ccd8');P(g,17,21,6,2,'#b07a2a');E(g,12,7,6,6,'#eeeeea');P(g,8,6,3,3,'#111');P(g,13,6,3,3,'#111');P(g,9,12,6,2,'#d8d8d4');P(g,11,14,2,10,'#d8d8d4');for(const y of[15,17,19])P(g,7,y,10,1,'#eeeeea');P(g,8,23,8,2,'#d8d8d4');P(g,8,25,2,8,'#d8d8d4');P(g,14,25,2,8,'#d8d8d4');P(g,5,15,2,8,'#d8d8d4');P(g,17,15,2,8,'#d8d8d4')},
 crab(g){w=34;h=24;E(g,17,14,11,7,'#c84030');E(g,17,11,9,3,'#e05a40');P(g,13,3,1,6,'#c84030');P(g,20,3,1,6,'#c84030');P(g,12,2,3,3,'#fff');P(g,19,2,3,3,'#fff');P(g,13,3,1,1,'#000');P(g,20,3,1,1,'#000');E(g,4,9,4,5,'#d04a36');E(g,30,9,4,5,'#d04a36');g.clearRect(2,4,3,3);g.clearRect(29,4,3,3);for(const x of[8,12,21,25])P(g,x,19,2,4,'#a83020')},
 golem(g){w=48;h=52;P(g,13,36,9,15,'#7a746a');P(g,26,36,9,15,'#7a746a');P(g,10,15,28,22,'#8a8478');P(g,10,15,28,3,'#a49e92');P(g,2,15,8,22,'#7a746a');P(g,38,15,8,22,'#7a746a');P(g,1,35,10,9,'#5e584e');P(g,37,35,10,9,'#5e584e');P(g,17,4,14,12,'#9a9488');P(g,17,4,14,2,'#b4aea2');P(g,20,9,3,2,'#4ff4ff');P(g,26,9,3,2,'#4ff4ff');P(g,21,22,6,6,'#3a3630');P(g,22,23,4,4,'#4ff4ff');P(g,14,19,1,7,'#5a5448');P(g,33,27,1,6,'#5a5448');for(const[x,y]of[[12,30],[30,17],[4,20],[40,28],[28,40]])P(g,x,y,3,2,'#5a8a3a')},
 kraken(g){w=52;h=56;for(let k=0;k<6;k++){const x0=5+k*8;for(let y=26;y<55;y++){const x=x0+Math.round(Math.sin(y*.25+k)*3);P(g,x,y,y>46?4:5,1,'#a83a78');if(y%4===0)P(g,x+1,y,2,1,'#f0a0c8')}}E(g,26,17,17,16,'#c04a8a');E(g,22,8,6,3,'#d868a8');P(g,16,8,3,2,'#e070a8');P(g,32,10,3,2,'#e070a8');E(g,19,21,4,4,'#fff');E(g,33,21,4,4,'#fff');P(g,18,20,3,4,'#111');P(g,32,20,3,4,'#111');P(g,14,15,8,1,'#6a1a48');P(g,30,15,8,1,'#6a1a48')},
 wyvern(g){w=58;h=46;const b=c.b,dd=c.d,l=c.l,wg=c.w;for(let i=0;i<17;i++){P(g,22+i,2+Math.floor(i*.35),1,18-i,wg)}P(g,22,2,17,1,dd);for(let i=0;i<14;i++)P(g,44+i,27+Math.floor(i*.5),2,Math.max(1,4-Math.floor(i/4)),b);E(g,31,27,13,8,b);E(g,31,30,10,4,l);P(g,12,14,13,7,b);E(g,10,14,7,5,b);P(g,1,14,8,4,b);P(g,2,18,7,2,dd);P(g,3,18,1,1,'#fff');P(g,6,18,1,1,'#fff');P(g,8,12,2,2,'#ffe23a');P(g,12,6,2,5,'#e8e0c0');P(g,15,7,2,4,'#e8e0c0');P(g,24,33,4,9,dd);P(g,35,33,4,9,dd);P(g,23,42,6,2,'#e8e0c0');P(g,34,42,6,2,'#e8e0c0');if(c.horns){P(g,10,4,2,4,'#e8e0c0');P(g,14,3,2,5,'#e8e0c0');for(let i=0;i<5;i++)P(g,24+i*4,20,2,3,'#e8e0c0')}},
 garg(g){w=36;h=32;E(g,7,12,7,10,'#4e4e5e');E(g,29,12,7,10,'#4e4e5e');P(g,1,6,3,2,'#4e4e5e');P(g,32,6,3,2,'#4e4e5e');E(g,18,18,8,9,'#7a7a8a');P(g,11,25,4,6,'#6a6a7a');P(g,21,25,4,6,'#6a6a7a');P(g,10,30,6,2,'#5a5a6a');P(g,20,30,6,2,'#5a5a6a');E(g,18,8,6,5,'#7a7a8a');P(g,12,1,2,5,'#d8d0b0');P(g,22,1,2,5,'#d8d0b0');P(g,15,7,2,2,'#ff3030');P(g,20,7,2,2,'#ff3030');P(g,16,11,4,1,'#fff')},
 wraith(g){w=30;h=36;E(g,15,13,10,11,'#5a4a8a');for(let y=22;y<35;y++){const ww=10-Math.floor((y-22)*.6);P(g,15-ww+((y%4<2)?1:-1),y,ww*2,1,'#4a3a7a')}E(g,15,11,6,6,'#140a20');P(g,12,10,2,2,'#7ff4ff');P(g,17,10,2,2,'#7ff4ff');P(g,2,17,5,2,'#d0d0d8');P(g,23,17,5,2,'#d0d0d8');P(g,1,16,1,4,'#d0d0d8');P(g,28,16,1,4,'#d0d0d8')},
 dknight(g){w=30;h=38;P(g,7,13,16,22,'#5a1020');P(g,24,2,3,22,'#d0d4e0');P(g,25,2,1,22,'#fff');P(g,21,22,9,2,'#c09020');P(g,10,26,4,11,'#2a2a3a');P(g,16,26,4,11,'#2a2a3a');P(g,8,13,14,14,'#2e2e40');P(g,8,13,14,2,'#4a4a60');P(g,4,12,6,5,'#4a4a60');P(g,20,12,6,5,'#4a4a60');P(g,10,2,10,11,'#3a3a4c');P(g,10,2,10,2,'#55556c');P(g,12,6,7,2,'#ff2a2a');P(g,7,0,3,4,'#55556c');P(g,20,0,3,4,'#55556c')},
 zald(g){w=50;h=54;E(g,25,34,22,19,'#2a0a30');P(g,15,20,20,33,'#3c1254');P(g,24,20,2,33,'#d0a830');P(g,15,30,20,2,'#d0a830');P(g,9,19,8,5,'#5c2278');P(g,33,19,8,5,'#5c2278');P(g,8,18,2,2,'#d0a830');P(g,40,18,2,2,'#d0a830');E(g,25,12,7,8,'#d0c4dc');P(g,18,4,14,5,'#24102e');P(g,18,9,2,7,'#24102e');P(g,30,9,2,7,'#24102e');for(let i=0;i<7;i++){P(g,17-i,6-Math.floor(i*.8),2,2,'#ece4c4');P(g,31+i,6-Math.floor(i*.8),2,2,'#ece4c4')}P(g,21,12,3,1,'#ff1a1a');P(g,27,12,3,1,'#ff1a1a');P(g,23,17,5,1,'#5a3a6a');E(g,43,33,4,4,'#c040ff');E(g,43,33,2,2,'#f0c0ff');P(g,38,31,3,4,'#d0c4dc')}
 };
 const tmp=mk(80,80);const rr=(draw[d0.art]||DART[d0.art])(tmp.g);if(Array.isArray(rr)){w=rr[0];h=rr[1]}
 const o=mk(w+2,h+2);o.g.drawImage(tmp.c,0,0,w,h,1,1,w,h);
 return SPR[k]=outline(o.c);
}

/* ================= DATA ================= */
const EL={fire:'炎',ice:'氷',thunder:'雷',water:'水',wind:'風',earth:'土',light:'光',dark:'闇'};
const ELC={fire:'#ff6a2a',ice:'#8ae8ff',thunder:'#ffe84a',water:'#4a9aff',wind:'#8aff9a',earth:'#c8a060',light:'#fffbe0',dark:'#b050ff'};
const ROLES={
 sword:{hp:130,mp:26,atk:32,def:16,mag:10,spr:12},mage:{hp:88,mp:46,atk:12,def:9,mag:36,spr:16},healer:{hp:98,mp:46,atk:14,def:11,mag:22,spr:32},
 monk:{hp:135,mp:22,atk:30,def:12,mag:8,spr:10},archer:{hp:105,mp:30,atk:30,def:11,mag:14,spr:12},tank:{hp:165,mp:26,atk:24,def:26,mag:10,spr:20},
 dragoon:{hp:125,mp:30,atk:35,def:15,mag:10,spr:12},dark:{hp:140,mp:28,atk:36,def:13,mag:18,spr:10},ninja:{hp:110,mp:30,atk:31,def:12,mag:16,spr:12},
 bard:{hp:108,mp:40,atk:20,def:12,mag:24,spr:24},summoner:{hp:95,mp:48,atk:12,def:10,mag:35,spr:20},priest:{hp:105,mp:50,atk:14,def:12,mag:28,spr:36},
 mknight:{hp:125,mp:36,atk:32,def:14,mag:30,spr:14},samurai:{hp:125,mp:28,atk:37,def:14,mag:10,spr:12},timemage:{hp:92,mp:50,atk:12,def:10,mag:36,spr:22},
 paladin:{hp:170,mp:32,atk:30,def:26,mag:16,spr:24}
};
const RARM={3:1,4:1.22,5:1.45},MAXLV={3:40,4:60,5:80};
const UNITS={
 allen:{name:'アレン',job:'星の剣士',rar:5,role:'sword',hits:2,abil:[['cross',1],['brave',1],['wide',12],['hblade',20]],lb:{n:'アストラルブレード',d:'敵単体に光属性の8連続攻撃',t:'enemy',k:'phys',el:'light',m:5,hits:8,c:24},pal:{id:'allen',hair:'#e4e6ee',skin:'#f6c9a0',cloth:'#1e2a5c',acc:'#d8b060',pants:'#2a2a34',hat:'spiky',wpn:'sword',cape:'#2a3c94',armor:'#b8bcc8'}},
 gard:{name:'ガルド',job:'炎斧の戦士',rar:5,role:'tank',hits:2,abil:[['provoke',1],['abreak',1],['wide',10],['fblade',18]],lb:{n:'紅蓮竜斧',d:'敵全体に炎属性の強力な物理攻撃＋敵の攻撃を引きつける',t:'enemies',k:'phys',el:'fire',m:3.6,hits:4,then:{t:'self',k:'buff',buff:{def:.5},provoke:1,turns:3},c:24},pal:{id:'gard',hair:'#1c1616',skin:'#d8a880',cloth:'#5e1c1c',acc:'#8a6a3a',pants:'#2a2020',hat:'spiky',wpn:'sword',cape:'#7a1a1a',armor:'#5a4a4a'}},
 sion:{name:'シオン',job:'翠玉の魔導士',rar:5,role:'mage',hits:1,abil:[['blaze',1],['frost',1],['bolt',4],['sylph',10],['blazeall',16]],lb:{n:'エメラルド・テンペスト',d:'敵全体に風属性の8連続魔法攻撃',t:'enemies',k:'mag',el:'wind',m:3.4,hits:8,c:26},pal:{id:'sion',hair:'#cac6de',skin:'#f6c9a0',cloth:'#1e4a32',acc:'#c8c8b8',pants:'#1a2a20',hat:'long',robe:1,wpn:'staff'}},
 stella:{name:'ステラ',job:'星詠みの巫女',rar:5,role:'priest',hits:2,abil:[['heal',1],['sheal',6],['holy',8],['revive',10],['protect',14]],lb:{n:'スターライト・ブレス',d:'味方全体のHP超回復・戦闘不能を全快＋防御アップ',t:'allies',k:'heal',m:2.5,revive:1,then:{t:'allies',k:'buff',buff:{def:.3,spr:.3},turns:3},c:30},pal:{id:'stella',hair:'#f0d080',skin:'#fae0cc',cloth:'#f4f2ea',acc:'#3a5aa8',pants:'#e8e4d8',hat:'long',robe:1,wpn:'staff',cape:'#fbfaf4'}},
 fio:{name:'フィオ',job:'風の狩人',rar:5,role:'archer',hits:2,abil:[['nerai',1],['arrowrain',1],['kagenui',12]],lb:{n:'疾風千矢',d:'敵全体に風属性の6連続物理攻撃',t:'enemies',k:'phys',el:'wind',m:3,hits:6,c:24},pal:{id:'fio',hair:'#2a9090',skin:'#f0c098',cloth:'#3a5a2a',acc:'#6a4a2a',pants:'#4a2a1a',hat:'band',wpn:'bow',cape:'#3e6030'}},
 shino:{name:'シノ',job:'妖刀の剣士',rar:5,role:'samurai',hits:3,abil:[['iai',1],['bsword',1],['zantetsu',12]],lb:{n:'妖刀・紫雲閃',d:'敵単体に闇属性の究極の物理攻撃',t:'enemy',k:'phys',el:'dark',m:8,hits:6,c:30},pal:{id:'shino',hair:'#e8e8ee',skin:'#f6d0b0',cloth:'#1c161a',acc:'#b02232',pants:'#1c161a',hat:'long',robe:1,wpn:'dagger'}}
};
const ABIL={
 cross:{n:'クロススラッシュ',mp:8,t:'enemy',k:'phys',m:1.8,hits:3,d:'敵単体に3連続の物理攻撃'},
 brave:{n:'ブレイブハート',mp:10,t:'self',k:'buff',buff:{atk:.5},turns:3,d:'自分の攻撃力50%アップ（3T）'},
 wide:{n:'ワイドブレイク',mp:14,t:'enemies',k:'phys',m:1,hits:2,d:'敵全体に物理攻撃'},
 blaze:{n:'ブレイズ',mp:8,t:'enemy',k:'mag',m:1.6,el:'fire',hits:2,d:'敵単体に炎属性の魔法攻撃'},
 frost:{n:'フロスト',mp:8,t:'enemy',k:'mag',m:1.6,el:'ice',hits:2,d:'敵単体に氷属性の魔法攻撃'},
 bolt:{n:'ライトニング',mp:12,t:'enemy',k:'mag',m:2,el:'thunder',hits:3,d:'敵単体に雷属性の魔法攻撃'},
 heal:{n:'ヒール',mp:6,t:'ally',k:'heal',m:1,d:'味方単体のHPを回復'},
 healall:{n:'ヒールオール',mp:14,t:'allies',k:'heal',m:.7,d:'味方全体のHPを回復'},
 revive:{n:'リバイブ',mp:18,t:'dead',k:'revive',p:.5,d:'戦闘不能を回復（HP50%）'},
 renken:{n:'れんぞくけん',mp:10,t:'enemy',k:'phys',m:2,hits:6,d:'敵単体に6連続の物理攻撃'},
 chakra:{n:'チャクラ',mp:4,t:'self',k:'heal',pct:.3,mpgain:8,d:'自分のHP30%・MP8回復'},
 nerai:{n:'ねらいうち',mp:8,t:'enemy',k:'phys',m:2,hits:2,d:'敵単体に強力な物理攻撃'},
 arrowrain:{n:'アローレイン',mp:14,t:'enemies',k:'phys',m:1,hits:4,d:'敵全体に4連続の物理攻撃'},
 provoke:{n:'ガードマスター',mp:10,t:'self',k:'buff',buff:{def:.6,spr:.6},provoke:1,turns:3,d:'自分の防御・精神60%アップ＆敵の攻撃を引きつける'},
 abreak:{n:'アーマーブレイク',mp:10,t:'enemy',k:'phys',m:1.2,hits:1,debuff:{def:.35},turns:3,d:'物理攻撃＋敵単体の防御35%ダウン（3T）'},
 jump:{n:'ハイジャンプ',mp:16,t:'enemy',k:'phys',m:3.2,hits:1,fx:'jump',d:'敵単体に強力な物理攻撃'},
 bsword:{n:'ブラッドソード',mp:10,t:'enemy',k:'phys',m:1.8,hits:2,el:'dark',drain:.3,d:'闇属性の物理攻撃＋HP吸収'},
 darkwave:{n:'ダークウェーブ',mp:16,t:'enemies',k:'phys',m:1.1,hits:3,el:'dark',d:'敵全体に闇属性の物理攻撃'},
 shuriken:{n:'しゅりけん',mp:8,t:'enemy',k:'phys',m:1.9,hits:6,d:'敵単体に6連続の物理攻撃'},
 kagenui:{n:'かげぬい',mp:10,t:'enemy',k:'phys',m:1.4,hits:2,debuff:{atk:.3},turns:3,d:'物理攻撃＋敵単体の攻撃30%ダウン（3T）'},
 song:{n:'ブレイブソング',mp:14,t:'allies',k:'buff',buff:{atk:.4,mag:.4},turns:3,d:'味方全体の攻撃・魔力40%アップ（3T）'},
 healsong:{n:'いやしのうた',mp:12,t:'allies',k:'heal',m:.55,mpgain:6,d:'味方全体のHP回復＋MP6回復'},
 protect:{n:'プロテクション',mp:12,t:'allies',k:'buff',buff:{def:.4,spr:.4},turns:3,d:'味方全体の防御・精神40%アップ（3T）'},
 sylph:{n:'シルフ召喚',mp:22,t:'enemies',k:'mag',m:1.4,el:'wind',hits:5,d:'敵全体に風属性の5連続魔法攻撃'},
 blazeall:{n:'ブレイズストーム',mp:20,t:'enemies',k:'mag',m:1.2,el:'fire',hits:3,d:'敵全体に炎属性の魔法攻撃'},
 sheal:{n:'セイントヒール',mp:16,t:'allies',k:'heal',m:1,d:'味方全体のHPを大回復'},
 holy:{n:'ホーリーレイ',mp:14,t:'enemy',k:'mag',m:2.4,el:'light',hits:3,d:'敵単体に光属性の強力な魔法攻撃'},
 fblade:{n:'まほうけん・炎',mp:12,t:'enemy',k:'hyb',m:2,el:'fire',hits:4,d:'敵単体に炎属性の4連続攻撃（物理＋魔法）'},
 darkall:{n:'ダークネス',mp:18,t:'enemies',k:'mag',m:1.4,el:'dark',hits:3,d:'敵全体に闇属性の魔法攻撃'},
 iai:{n:'いあいぎり',mp:14,t:'enemies',k:'phys',m:1.3,hits:3,d:'敵全体に3連続の物理攻撃'},
 zantetsu:{n:'ざんてつけん',mp:16,t:'enemy',k:'phys',m:2.8,hits:3,d:'敵単体に強力な物理攻撃'},
 grav:{n:'グラビトン',mp:14,t:'enemy',k:'grav',p:.25,d:'敵単体の現在HPの25%ダメージ（ボスには効果小）'},
 accel:{n:'タイムアクセル',mp:18,t:'allies',k:'lbfill',p:.3,d:'味方全体のLBゲージを30%増加'},
 comet:{n:'コメット',mp:16,t:'enemy',k:'mag',m:2.4,hits:5,d:'敵単体に5連続の無属性魔法攻撃'},
 hblade:{n:'ホーリーブレード',mp:12,t:'enemy',k:'phys',m:2,hits:3,el:'light',d:'敵単体に光属性の物理攻撃'}
};
const ITEMS={
 potion:{n:'ポーション',price:60,use:'hp',p:.35,d:'HPを35%回復',ic:'#6ad46a'},
 hipotion:{n:'ハイポーション',price:300,use:'hp',p:.8,d:'HPを80%回復',ic:'#2aa8e0'},
 ether:{n:'エーテル',price:400,use:'mp',p:.4,d:'MPを40%回復',ic:'#a06aff'},
 feather:{n:'復活の羽',price:800,use:'revive',p:.5,d:'戦闘不能をHP50%で回復',ic:'#ff8a5a'},
 elixir:{n:'エリクサー',price:0,use:'full',d:'HP・MPを全回復',ic:'#ffe04a'},
 exs:{n:'経験値の結晶・小',price:500,use:'exp',v:400,d:'ユニット強化用（EXP+400）',ic:'#7ae0ff',noBattle:1},
 exm:{n:'経験値の結晶・中',price:2500,use:'exp',v:2500,d:'ユニット強化用（EXP+2500）',ic:'#4a8aff',noBattle:1},
 exl:{n:'経験値の結晶・大',price:0,use:'exp',v:12000,d:'ユニット強化用（EXP+12000）',ic:'#ff7ad8',noBattle:1}
};
const ENEMIES={
 slime:{n:'スライム',art:'slime',hp:60,atk:18,def:6,mag:10,spr:6,weak:['fire']},
 bat:{n:'コウモリ',art:'bat',hp:48,atk:20,def:4,mag:6,spr:6,weak:['wind']},
 goblin:{n:'ゴブリン',art:'goblin',hp:80,atk:23,def:8,mag:6,spr:6,weak:['fire'],sk:[{n:'こんぼう',k:'phys',m:1.5,t:'one'}],rate:.2},
 wolf:{n:'グレイウルフ',art:'wolf',hp:72,atk:25,def:6,mag:6,spr:6,weak:['fire']},
 bat2:{n:'ブラッドバット',art:'bat',col:{c:'#a83a4a',d:'#6a1a2a'},hp:60,atk:24,def:6,mag:8,spr:8,weak:['wind'],sk:[{n:'きゅうけつ',k:'drain',m:1.2,t:'one'}],rate:.25},
 skeleton:{n:'スケルトン',art:'skel',hp:90,atk:26,def:12,mag:6,spr:8,weak:['light','fire']},
 crab:{n:'ロッククラブ',art:'crab',hp:100,atk:24,def:20,mag:6,spr:8,weak:['thunder']},
 bslime:{n:'アクアスライム',art:'slime',col:{c:'#4a7af0',d:'#2a4ab8'},hp:70,atk:18,def:8,mag:24,spr:14,weak:['thunder'],resist:['water'],sk:[{n:'アクアショット',k:'mag',m:1.3,t:'one',el:'water'}],rate:.4},
 gargoyle:{n:'ガーゴイル',art:'garg',hp:120,atk:30,def:18,mag:10,spr:12,weak:['thunder']},
 wraith:{n:'レイス',art:'wraith',hp:95,atk:20,def:10,mag:32,spr:22,weak:['light','fire'],sk:[{n:'シャドウボール',k:'mag',m:1.4,t:'one',el:'dark'}],rate:.5},
 hound:{n:'ヘルハウンド',art:'wolf',col:{c:'#a83a2a',d:'#6a1a14',l:'#e0a070'},hp:95,atk:30,def:10,mag:20,spr:10,weak:['ice'],resist:['fire'],sk:[{n:'ほのおのキバ',k:'phys',m:1.5,t:'one',el:'fire'}],rate:.3},
 dknight:{n:'ダークナイト',art:'dknight',hp:140,atk:34,def:18,mag:10,spr:12,weak:['light'],sk:[{n:'ダークスラッシュ',k:'phys',m:1.7,t:'one',el:'dark'}],rate:.3},
};

const PILLARS=[
 {id:'stolas',n:'ストラス',rank:36,title:'君主',L:1,hpM:.55,acts:1,seal:3,weak:['thunder'],sk:[{n:'ほしよみの呪い',k:'mag',m:1,t:'one',el:'dark'},{n:'つばさの嵐',k:'phys',m:.6,t:'all',el:'wind'}],rate:.35},
 {id:'marbas',n:'マルバス',rank:5,title:'総裁',L:2,hpM:.7,acts:1,seal:3,weak:['fire'],sk:[{n:'獅子の爪',k:'phys',m:1.6,t:'one'},{n:'病の咆哮',k:'mag',m:.7,t:'all',el:'dark'}],rate:.4},
 {id:'vine',n:'ヴィネ',rank:45,title:'王',L:4,hpM:.9,seal:3,weak:['ice'],sk:[{n:'毒蛇の牙',k:'phys',m:1.5,t:'one'},{n:'塔崩しの嵐',k:'mag',m:.8,t:'all',el:'wind'}],rate:.45},
 {id:'aunas',n:'アウナス',rank:58,title:'総裁',L:6,seal:3,weak:['ice'],resist:['fire'],sk:[{n:'劫火',k:'mag',m:.9,t:'all',el:'fire'},{n:'炎の抱擁',k:'drain',m:1.2,t:'one'}],rate:.5},
 {id:'alloces',n:'アラケス',rank:52,title:'公爵',L:8,seal:3,weak:['ice'],sk:[{n:'獅子将の槍',k:'phys',m:1.8,t:'one'},{n:'炎眼の一閃',k:'phys',m:.9,t:'all',el:'fire'},{n:'戦陣の号令',k:'buff'}],rate:.5},
 {id:'amon',n:'アモン',rank:7,title:'侯爵',L:10,hpM:1.1,seal:4,weak:['ice'],resist:['fire'],sk:[{n:'業火の吐息',k:'mag',m:1,t:'all',el:'fire'},{n:'蛇尾の打撃',k:'phys',m:1.6,t:'one'},{n:'カラスの啄み',k:'drain',m:1.2,t:'one'}],rate:.55},
 {id:'halphas',n:'ハルファス',rank:38,title:'伯爵',L:12,seal:3,weak:['thunder'],sk:[{n:'くちばしの剣',k:'phys',m:1.6,t:'one'},{n:'しわがれた雄叫び',k:'mag',m:.8,t:'all',el:'wind'},{n:'兵団召集',k:'summon',id:'skeleton'}],rate:.5},
 {id:'bune',n:'ブネ',rank:26,title:'公爵',L:14,seal:4,weak:['light'],sk:[{n:'三首のかみつき',k:'phys',m:.8,t:'all'},{n:'死霊の息吹',k:'mag',m:1,t:'all',el:'dark'},{n:'竜の爪',k:'phys',m:1.8,t:'one'}],rate:.55},
 {id:'forneus',n:'フォルネウス',rank:30,title:'侯爵',L:16,hpM:1.1,seal:4,weak:['thunder'],resist:['water'],sk:[{n:'水流のむち',k:'mag',m:.8,t:'all',el:'water'},{n:'深淵の顎',k:'phys',m:1.9,t:'one'},{n:'大海嘯',k:'mag',m:1.2,t:'all',el:'water',below:1}],rate:.55},
 {id:'marchosias',n:'マルコシアス',rank:35,title:'侯爵',L:18,seal:3,weak:['ice'],sk:[{n:'炎の咆哮',k:'mag',m:.9,t:'all',el:'fire'},{n:'狼の牙',k:'phys',m:1.8,t:'one'},{n:'グリフォンの翼',k:'phys',m:.8,t:'all',el:'wind'}],rate:.55},
 {id:'zagan',n:'ザガン',rank:61,title:'王',L:20,seal:4,weak:['wind'],sk:[{n:'猛牛の突進',k:'phys',m:2,t:'one'},{n:'錬金の雨',k:'mag',m:.9,t:'all',el:'earth'},{n:'血と酒の変転',k:'drain',m:1.3,t:'one'}],rate:.55},
 {id:'purson',n:'プルソン',rank:20,title:'王',L:22,hpM:.95,seal:4,weak:['wind'],sk:[{n:'大地のラッパ',k:'mag',m:1,t:'all',el:'earth'},{n:'熊王の一撃',k:'phys',m:1.9,t:'one'},{n:'毒蛇の牙',k:'drain',m:1.2,t:'one'}],rate:.55},
 {id:'eligos',n:'エリゴス',rank:15,title:'公爵',L:24,seal:3,weak:['light'],sk:[{n:'魔槍の突撃',k:'phys',m:2,t:'one'},{n:'戦旗の号令',k:'buff'},{n:'千騎の進軍',k:'phys',m:.9,t:'all'}],rate:.55},
 {id:'beleth',n:'ベレト',rank:13,title:'王',L:26,seal:4,weak:['light'],sk:[{n:'蒼白の騎行',k:'phys',m:1,t:'all'},{n:'滅びのラッパ',k:'mag',m:1,t:'all',el:'dark'},{n:'王の怒り',k:'phys',m:2,t:'one'}],rate:.6},
 {id:'balam',n:'バラム',rank:51,title:'王',L:28,hpM:1.1,seal:4,weak:['ice'],sk:[{n:'三首の業火',k:'mag',m:1.1,t:'all',el:'fire'},{n:'鷹の急襲',k:'phys',m:1.8,t:'one',el:'wind'},{n:'蛇尾のしめつけ',k:'drain',m:1.3,t:'one'}],rate:.6},
 {id:'astaroth',n:'アスタロト',rank:29,title:'公爵',L:30,seal:4,weak:['light'],sk:[{n:'毒の吐息',k:'mag',m:1,t:'all',el:'dark'},{n:'堕天の槍',k:'phys',m:2,t:'one'},{n:'竜獣のふみつけ',k:'phys',m:1,t:'all',el:'earth'}],rate:.6},
 {id:'belial',n:'ベリアル',rank:68,title:'王',L:32,seal:4,weak:['ice'],resist:['fire'],sk:[{n:'炎の戦車',k:'phys',m:1,t:'all',el:'fire'},{n:'堕天使の誘惑',k:'mag',m:1.1,t:'all',el:'dark'},{n:'虚偽の光',k:'drain',m:1.4,t:'one'},{n:'偽りの加護',k:'buff'}],rate:.6},
 {id:'paimon',n:'パイモン',rank:9,title:'王',L:34,hpM:.95,seal:4,weak:['thunder'],sk:[{n:'魔の旋律',k:'mag',m:1.1,t:'all',el:'dark'},{n:'王の号令',k:'summon',id:'imp'},{n:'砂嵐',k:'mag',m:.9,t:'all',el:'earth'},{n:'ひとこぶの突進',k:'phys',m:2,t:'one'}],rate:.6},
 {id:'asmodeus',n:'アスモデウス',rank:32,title:'王',L:37,hpM:1,seal:4,weak:['ice'],resist:['fire'],sk:[{n:'色欲の炎',k:'mag',m:1.1,t:'all',el:'fire'},{n:'魔竜の牙',k:'phys',m:2.1,t:'one'},{n:'三首の咆哮',k:'phys',m:1,t:'all'},{n:'破滅の槍',k:'phys',m:1.5,t:'all',below:1}],rate:.6},
 {id:'baal',n:'バアル',rank:1,title:'王',L:40,hpM:1.35,acts:2,seal:4,scale:1.15,weak:['light'],resist:['dark'],sk:[{n:'三王の呪詛',k:'mag',m:1.1,t:'all',el:'dark'},{n:'蜘蛛の大顎',k:'drain',m:1.5,t:'one'},{n:'千本足',k:'phys',m:1,t:'all'},{n:'透明化',k:'buff'},{n:'序列第一位の威光',k:'mag',m:1.7,t:'all',el:'dark',below:1}],rate:.6}
];
for(const b of PILLARS){const L=b.L,m=b.hpM||1;ENEMIES[b.id]={n:b.n,art:b.id,boss:1,pillar:1,rank:b.rank,title:b.title,seal:b.seal,scale:b.scale,hp:Math.round((450+30*L)*m),atk:Math.round(21+.5*L),def:Math.round(8+.42*L),mag:Math.round(18+.75*L),spr:Math.round(8+.45*L),weak:b.weak,resist:b.resist,acts:b.acts||2,sk:b.sk,rate:Math.min(.48,b.rate)}}
ENEMIES.imp={n:'インプ',art:'imp',hp:70,atk:24,def:8,mag:20,spr:10,weak:['light'],sk:[{n:'ファイアボール',k:'mag',m:1.2,t:'one',el:'fire'}],rate:.35};
const TOTAL_SEAL=PILLARS.reduce((a,b)=>a+b.seal,0);

const CHAPTERS=[
 {name:'第1章 封印の綻び',bg:'forest',c1:'#2a7a3a',c2:'#14402a',stages:[
  {id:'1-1',name:'森の入口',lv:1,waves:[['slime','slime'],['stolas']],pre:[['N','はるか昔、賢王ソロモンは七十二柱の魔神を指輪に封じた。\nそれから三千年――'],['N','ある夜、封印の指輪がくだけ散り、魔神たちが世界に解き放たれた。'],['allen','森の様子がおかしい……空の色まで変わってる。'],['sion','アレン、気をつけろ。王都への道はこの森を抜けるしかない。'],['sion','ガルド、構えろ。魔物が来るぞ。'],['gard','おう、腕が鳴るぜ！']],
   btalk:[['stolas','ホウ……人の子か。我は序列三十六位、君主ストラス。星の知恵を喰らう者。'],['allen','フクロウがしゃべった！？'],['sion','ただのフクロウではない……とんでもない魔力だ！']],
   post:[['stolas','ホウ……指輪のかけらの気配……いずれ、あの方が……'],['N','ストラスは黒い霧となって消えた。'],['sion','あれが……古文書にある「七十二柱」か。']]},
  {id:'1-2',name:'木漏れ日の小道',lv:2,waves:[['goblin','slime'],['bat','bat','bat'],['marbas']],pre:[['?','……たすけて。星の声が、きこえなくなるの……'],['allen','女の子の声……？ 森の奥からだ！']],
   btalk:[['marbas','序列五位、総裁マルバス。病も癒しも、我が爪ひとつよ。'],['gard','でっかいライオンだな……燃えてきたぜ！']],
   post:[['N','マルバスは咆哮を残して消えた。'],['allen','急ごう、声の主が危ない！']]},
  {id:'1-3',name:'青く光る泉',lv:4,waves:[['wolf','goblin'],['slime','wolf','bat'],['vine']],pre:[['sion','泉のほとりに少女が……魔物に囲まれている！']],
   btalk:[['vine','我は序列四十五位、王ヴィネ。その娘の持つ指輪のかけら、渡してもらおう。'],['stella','だめ……これは、魔神をふたたび封じるための……！']],
   post:[['stella','ありがとう……わたしはステラ。ソロモンの指輪を守ってきた、星詠みの巫女です。'],['stella','このかけらの光で、弱った魔神を封じることができます。\nいまのヴィネも……ほら。'],['N','ステラがかけらをかざすと、ヴィネの影が光の中に吸いこまれていった。'],['stella','お願いです。七十二柱すべてを封じる旅に、力を貸してください！'],['allen','もちろんだ。行こう、みんな！']]}]},
 {name:'第2章 業火の洞窟',bg:'cave',c1:'#8a3a1a',c2:'#3a140a',stages:[
  {id:'2-1',name:'熱風の坑道',lv:6,waves:[['bat2','imp'],['skeleton','bat2'],['aunas']],pre:[['stella','東の洞窟から、強い炎の気配がします。'],['sion','熱い……壁まで燃えているとは。']],
   btalk:[['aunas','序列五十八位、総裁アウナス……燃えろ……すべて燃えてしまえ……'],['stella','炎そのものが、魔神……！？']],
   post:[['N','アウナスの炎は、かけらの光に吸いこまれていった。'],['stella','炎は氷に弱いはず。この先も、相手の弱点を見きわめましょう。']]},
  {id:'2-2',name:'獅子将の陣',lv:8,waves:[['skeleton','skeleton'],['hound','imp','hound'],['alloces']],pre:[['allen','奥に兵隊みたいな骸骨がずらりと……陣を敷いてるのか？']],
   btalk:[['alloces','序列五十二位、公爵アラケス！ 我が軍団の前に、ひれ伏すがよい！'],['gard','赤いライオンの騎士……相手にとって不足なしだ！']],
   post:[['alloces','見事……。だが、アモン殿は甘くないぞ……'],['N','アラケスは光の中に封じられた。']]},
  {id:'2-3',name:'業火の底',lv:10,waves:[['hound','skeleton','hound'],['imp','imp','bat2'],['amon']],pre:[['stella','洞窟の底……この章の炎のみなもとです。']],
   btalk:[['amon','序列七位、侯爵アモン。過去も未来も見通す我に、勝てると思うてか。'],['fio','狼に、カラスの頭に、蛇のしっぽ……ぜんぶ盛り！？']],
   post:[['N','アモンは炎とともにかけらへ吸いこまれた。'],['?','フン……やるじゃないか。'],['xenon','俺はゼノン。指輪を砕いたのは……この俺だ。'],['allen','なんだって！？'],['xenon','知りたければ港まで来い。'],['N','ゼノンは闇の中へ消えた。']]}]},
 {name:'第3章 蒼の港町',bg:'sea',c1:'#2a6aa8',c2:'#14305a',stages:[
  {id:'3-1',name:'港町マリナ',lv:12,waves:[['bslime','bslime'],['skeleton','bslime'],['halphas']],pre:[['stella','港町が……骸骨の兵隊に占領されています！']],
   btalk:[['halphas','ガァ！ 序列三十八位、伯爵ハルファス！ 町は我が兵の砦となった！'],['gard','コウノトリが兵隊を率いてんのかよ！']],
   post:[['N','ハルファスが封じられると、骸骨の兵たちも崩れ去った。'],['allen','町の人たちは無事みたいだ。']]},
  {id:'3-2',name:'嵐の桟橋',lv:14,waves:[['wraith','skeleton'],['bslime','crab','bslime'],['bune']],pre:[['stella','海から……三つの首を持つ竜の気配。']],
   btalk:[['bune','序列二十六位、公爵ブネ。三つの首が、汝らの三つの死をうたう。'],['fio','人と犬と鳥の頭……気持ち悪っ！']],
   post:[['N','ブネは三つの声で嘆きながら封じられた。']]},
  {id:'3-3',name:'深海の門',lv:16,waves:[['crab','bslime','crab'],['wraith','skeleton','wraith'],['forneus']],pre:[['xenon','来たか。……海の主を相手に、どこまでやれるかな。'],['allen','ゼノン！ 待て！']],
   btalk:[['forneus','序列三十位、侯爵フォルネウス。深き海へ、沈むがよい！'],['shino','大きい……船ごと呑まれそうね。']],
   post:[['N','巨大な海の魔神も、かけらの光に封じられた。'],['xenon','……なかなかやる。次は竜の山脈だ。'],['stella','あの人……どうして悲しそうな目をしているの？']]}]},
 {name:'第4章 竜の山脈',bg:'mountain',c1:'#a84a2a',c2:'#4a1a10',stages:[
  {id:'4-1',name:'山麓の道',lv:18,waves:[['hound','hound'],['gargoyle','hound'],['marchosias']],pre:[['stella','山脈に、翼をもつ獣の魔神がいます。']],
   btalk:[['marchosias','序列三十五位、侯爵マルコシアス。……かつては天の戦士だった我も、今は獣よ。'],['allen','天の戦士……？']],
   post:[['marchosias','いつか……玉座に戻れる日が……'],['N','マルコシアスは静かに封じられた。']]},
  {id:'4-2',name:'溶岩の谷',lv:20,waves:[['hound','gargoyle','hound'],['wraith','gargoyle'],['zagan']],pre:[['fio','空気が熱い……溶岩のにおいがする！']],
   btalk:[['zagan','序列六十一位、王ザガン！ 水は酒に、血は油に、そして汝らは灰に！'],['gard','翼の生えた牛！？ なんでもアリだな魔神ってのは！']],
   post:[['N','ザガンは封じられた。']]},
  {id:'4-3',name:'竜の巣',lv:22,waves:[['gargoyle','hound','gargoyle'],['hound','wraith','hound'],['purson']],pre:[['allen','ラッパの音……？ 山の上から聞こえる。']],
   btalk:[['purson','序列二十位、王プルソン。熊にまたがり、ラッパを鳴らし、隠されし宝を知る者なり。'],['fio','王様っぽい……強そう……！']],
   post:[['N','プルソンは封じられた。'],['xenon','……なぜだ。なぜお前たちは、そこまで戦える。'],['allen','守りたいものがあるからだ。お前にもあったはずだろう、ゼノン！'],['xenon','……。']]}]},
 {name:'第5章 亡国の戦場',bg:'ruins',c1:'#6a5a4a',c2:'#2a2018',stages:[
  {id:'5-1',name:'朽ちた城門',lv:24,waves:[['skeleton','dknight'],['gargoyle','skeleton','gargoyle'],['eligos']],pre:[['stella','ここは魔神たちに滅ぼされた国……。']],
   btalk:[['eligos','序列十五位、公爵エリゴス。戦の行方を知り、騎士を率いる者。'],['allen','騎士の魔神……正々堂々、勝負だ！']],
   post:[['N','エリゴスは槍をおさめ、封じられた。']]},
  {id:'5-2',name:'王家の墓所',lv:26,waves:[['dknight','dknight'],['gargoyle','wraith','gargoyle'],['beleth']],pre:[['shino','どこからかラッパの音が……不気味ね。']],
   btalk:[['beleth','序列十三位、王ベレト。蒼白の馬に乗り、楽の音とともに来たる。ひざまずけ！'],['gard','誰がひざまずくかよ！']],
   post:[['N','ベレトは怒りの声とともに封じられた。']]},
  {id:'5-3',name:'玉座跡',lv:28,waves:[['dknight','gargoyle','dknight'],['wraith','dknight','wraith'],['balam']],pre:[['stella','玉座の跡に……三つの首をもつ王が。']],
   btalk:[['balam','序列五十一位、王バラム。過去、現在、未来……汝らの運命は、すでに見えておる。'],['sion','三つの頭で未来を見ても、我々の勝利は見えないらしいな。']],
   post:[['N','バラムは封じられた。'],['xenon','……真実を話そう。'],['xenon','俺の妹は、魔神アスタロトに魂を奪われた。\n「指輪を砕けば返す」と言われ……俺はそれを信じた。'],['stella','そんな……'],['xenon','だが、すべてはバアルの策略だった。……俺は外から神殿の結界を崩す。中は頼んだぞ。']]}]},
 {name:'第6章 堕天の神殿',bg:'temple',c1:'#5a2a8a',c2:'#20103a',stages:[
  {id:'6-1',name:'神殿の回廊',lv:30,waves:[['wraith','imp','wraith'],['dknight','gargoyle'],['astaroth']],pre:[['xenon','この奥にアスタロトがいる。……妹の魂も、ここに。']],
   btalk:[['astaroth','序列二十九位、公爵アスタロト。ふふ……裏切り者の魔剣士も一緒とはね。'],['xenon','妹を……返してもらう！']],
   post:[['N','アスタロトが封じられると、小さな光がゼノンの手に降りてきた。'],['xenon','……ありがとう。これで、妹は眠れる。'],['allen','ゼノン、これからはずっと仲間だ。']]},
  {id:'6-2',name:'炎の聖堂',lv:32,waves:[['imp','imp','imp'],['dknight','wraith','dknight'],['belial']],pre:[['stella','美しい……でも、とても冷たい気配。']],
   btalk:[['belial','序列六十八位、王ベリアル。われらは天にあって最も美しき者……さあ、こちらへおいで。'],['stella','だまされないで！ あの炎は、すべて偽りです！']],
   post:[['N','ベリアルの炎の戦車は砕け、二人の天使は光に溶けた。']]},
  {id:'6-3',name:'神殿の最奥',lv:34,waves:[['gargoyle','imp','gargoyle'],['dknight','wraith','dknight'],['paimon']],pre:[['allen','音楽……？ 誰かが歌ってる。']],
   btalk:[['paimon','序列九位、王パイモン。わが楽団の調べとともに、闇へ沈みなさい。'],['fio','ラクダに乗った王様！？ ……って、見とれてる場合じゃないね！']],
   post:[['N','パイモンは封じられた。'],['stella','残る大きな気配は、あと二つ……アスモデウス、そしてバアル。'],['allen','行こう。最後の戦いだ！']]}]},
 {name:'終章 魔神の玉座',bg:'abyss',c1:'#8a1a2a',c2:'#2a0410',stages:[
  {id:'7-1',name:'奈落の門',lv:37,waves:[['dknight','gargoyle','dknight'],['imp','wraith','imp'],['asmodeus']],pre:[['stella','門の向こうに、ものすごい魔力が……！']],
   btalk:[['asmodeus','序列三十二位、王アスモデウス。牛と人と羊の頭、すべてが汝らを嗤っておる。'],['gard','笑ってられるのも、今のうちだぜ！']],
   post:[['N','アスモデウスは竜とともに封じられた。'],['stella','あとひとつ……序列第一位、バアル。']]},
  {id:'7-2',name:'魔神の玉座',lv:40,waves:[['dknight','gargoyle','dknight'],['baal']],pre:[['allen','ここが……最後の場所だ。']],
   btalk:[['baal','よくぞ来た、人の子らよ。我こそは序列第一位、東方を統べる王バアル。'],['baal','七十二柱を解き放ったのは、この世界を我が手に取りもどすため。\nソロモンの指輪ごと、消えるがよい！'],['allen','みんな……全力でいくぞ！']],
   post:[['baal','ば、ばかな……三千年の時を経て、また……人の子に……'],['N','バアルの影が、指輪の光に吸いこまれていく――'],['stella','……ソロモンの指輪が、元の形にもどりました！'],['N','七十二柱すべての魔神は、ふたたび指輪の中で眠りについた。'],['N','こうして、世界に朝が戻った。\n――アストラル・クロニクル　完――']]}]}
];
const STAGES={};CHAPTERS.forEach((ch,ci)=>ch.stages.forEach((s,si)=>{s.ci=ci;s.si=si;s.cost=ch.cost;s.bg=s.bg||ch.bg;s.exp=Math.round(25*Math.pow(s.lv,1.6))+40;s.gil=60*s.lv+100;s.gems=s.gems||(s.waves.some(w=>w.some(e=>ENEMIES[e].boss))?100:50);STAGES[s.id]=s}));
const STAGE_ORDER=Object.keys(STAGES);
const BANNER={feat:['stella','xenon'],pool:{3:['mina','rita','gou','kyle','gard'],4:['allen','vice','lucia','shino','noa','el'],5:['stella','xenon','murakumo','chronoa','astrea']}};

/* ================= PLAYER ================= */
const SKEY='astral_rpg_v1';let P=null;
const START=['allen','stella','gard'];
const JOIN={'1-3':'sion','2-1':'fio','3-2':'shino'};
const JOINLINE={sion:'私の魔法と知識、存分に使ってくれ。',stella:'わたしも一緒に行きます。指輪のかけらで、魔神たちを封じてみせます！',fio:'風の狩人フィオだよ！ 魔神退治、あたしの弓も混ぜてよね！',shino:'……妖刀・紫雲のシノ。魔神を斬るのが、私の務め。共に行こう。'};
function newPlayer(){P={gil:300,units:[],party:[],items:{potion:5,ether:1,feather:1},cleared:{},uidN:1,tipQ:0,bspd:1,st:{},lastTown:0,scene:'town',town:0,wpos:null,started:0};for(const id of START)P.party.push(addUnit(id,1).uid);healAll()}
function save(){try{localStorage.setItem(SKEY,JSON.stringify(P))}catch(e){}}
function load(){try{const d=JSON.parse(localStorage.getItem(SKEY));if(d&&d.units){P=d;return true}}catch(e){}return false}
function addUnit(id,lv){const ex=P.units.find(u=>u.id===id);if(ex)return ex;const u={uid:P.uidN++,id,lv:lv||1,exp:0,lb:0};P.units.push(u);return u}
const uById=uid=>P.units.find(u=>u.uid===uid);
function ustat(u){const d=UNITS[u.id],r=ROLES[d.role],m=RARM[d.rar]*(1+.04*(u.lv-1)),o={};for(const k in r)o[k]=Math.round(r[k]*m);const eb=eqBonus(u);for(const k in eb)o[k]=(o[k]||0)+eb[k];return o}
const maxLv=u=>99;
const uNext=lv=>Math.floor(12*Math.pow(lv,1.6))+10;
function gainUExp(u,x){const ml=maxLv(u);let ups=0;if(u.lv>=ml)return 0;u.exp+=x;while(u.lv<ml&&u.exp>=uNext(u.lv)){u.exp-=uNext(u.lv);u.lv++;ups++}if(u.lv>=ml)u.exp=0;return ups}
const uAbils=u=>UNITS[u.id].abil.filter(a=>u.lv>=a[1]).map(a=>a[0]);
function power(u){const s=ustat(u);return Math.round(s.hp/4+s.mp/2+s.atk+s.def+s.mag+s.spr)}
function stageOpen(id){const i=STAGE_ORDER.indexOf(id);const st=STAGES[id];if(i<=0)return true;return!!P.cleared[STAGE_ORDER[i-1]]}

/* ================= UI ================= */
function toast(t,ms=1800){const e=$('#toast');e.textContent=t;e.style.opacity=1;clearTimeout(toast.t);toast.t=setTimeout(()=>e.style.opacity=0,ms)}
function modal(html,btns=[{l:'OK',c:'g'}],o={}){return new Promise(res=>{const m=$('#modal');m.innerHTML=`<div class="mcard ${o.cls||''}">${html}<div class="mbtns">${btns.map((b,i)=>`<button class="btn ${b.c||''}" data-i="${i}" ${b.dis?'disabled':''}>${b.l}</button>`).join('')}</div></div>`;m.style.display='flex';
 m.querySelectorAll('.mbtns button').forEach(b=>b.onclick=()=>{SFX.ok();m.style.display='none';m.innerHTML='';res(+b.dataset.i)});if(o.onOpen)o.onOpen(m)})}
function sealed(){let n=0;for(const id of STAGE_ORDER)if(P.cleared[id])for(const w of STAGES[id].waves)for(const e of w)if(ENEMIES[e].pillar)n+=ENEMIES[e].seal;return n}
function updTop(){const n=STAGE_ORDER.filter(id=>P.cleared[id]).length;const nx=STAGE_ORDER.find(id=>!P.cleared[id]);$('#tCh').textContent=nx?CHAPTERS[STAGES[nx].ci].name.split(' ')[0]:'全章クリア';const sl=sealed();$('#tPr').textContent=`　封印 ${sl}/${TOTAL_SEAL}柱`;$('#tPrB').style.width=sl/TOTAL_SEAL*100+'%';$('#tGil').textContent=fmt(P.gil)}
function fade(on){$('#fade').style.opacity=on?1:0;return new Promise(r=>setTimeout(r,260))}
function showPage(p){page=p;$$('.page').forEach(e=>e.style.display='none');const el=$('#'+p);if(el)el.style.display='block';$$('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.p===p));
 if(p==='quest')renderQuest();if(p==='units')renderUnits();if(p==='shop')renderShop();if(p==='home')renderHome();
 playBGM(p==='summon'?'summon':p==='quest'?'quest':'home')}
$$('#nav button').forEach(b=>b.onclick=()=>{initAudio();SFX.cur();showPage(b.dataset.p)});

/* ---- home ---- */
function renderHome(){const nx=STAGE_ORDER.find(id=>!P.cleared[id]&&stageOpen(id));$('#hNext').textContent=nx?`つぎ：${nx} ${STAGES[nx].name}`:'全ステージクリア！'}
$('#hQuest').onclick=()=>{SFX.ok();showPage('quest')};
$('#hParty').onclick=()=>{SFX.ok();unitTab='party';showPage('units')};$('#hSound').onclick=()=>{initAudio();setMute(!muted)};

/* ---- quest ---- */
function renderQuest(){const el=$('#quest');let h='<h2>ストーリークエスト</h2>';
 CHAPTERS.forEach(ch=>{const open=stageOpen(ch.stages[0].id);if(ch.trial&&!open){h+=`<div class="chap" style="--c1:#333;--c2:#111"><div class="ct">${ch.name}<small>第5章クリアで解放</small></div></div>`;return}
  h+=`<div class="chap" style="--c1:${ch.c1};--c2:${ch.c2}"><div class="ct">${ch.name}<small>${ch.stages.filter(s=>P.cleared[s.id]).length}/${ch.stages.length}</small></div>`+ch.stages.map(s=>{const op=stageOpen(s.id),cl=P.cleared[s.id],boss=s.waves.some(w=>w.some(e=>ENEMIES[e].boss));
  return `<button class="stg ${op?'':'lock'}" data-s="${s.id}"><span class="no">${s.id}</span><span class="nm">${s.name}${boss?'<span class="boss">'+(s.waves.flat().map(e=>ENEMIES[e]).find(e=>e.pillar)?'序列'+s.waves.flat().map(e=>ENEMIES[e]).find(e=>e.pillar).rank+'位':'BOSS')+'</span>':''}${cl?'<span class="clr">CLEAR</span>':''}<small>推奨Lv ${s.lv}　${(()=>{const pl=s.waves.flat().map(e=>ENEMIES[e]).find(e=>e.pillar);return pl?(cl?'封印済み：':'ボス：')+pl.n:''})()}${JOIN[s.id]&&!cl?'　仲間加入':''}</small></span><span class="nr">${op?'出発 ▶':''}</span></button>`}).join('')+'</div>'});
 el.innerHTML=h;CHAPTERS.forEach((ch,ci)=>{const lb=el.querySelector(`[data-s="${ch.stages[ch.stages.length-1].id}"]`);if(!lb||!stageOpen(ch.stages[0].id))return;const op=dungeonOpen(ci),m=genMaze(ci),cl=P.dclear&&P.dclear[ci];lb.insertAdjacentHTML('beforebegin',`<button class="stg dg ${op?'':'lock'}" data-d="${ci}"><span class="no">3D</span><span class="nm">${DUN[ci].name}${cl?'<span class="clr">踏破</span>':''}<small>探索ダンジョン　推奨Lv ${dLv(ci)}　宝箱 ${dLootCount(ci)}/${m.chests.length}</small></span><span class="nr">${op?'探索 ▶':''}</span></button>`)});
 el.querySelectorAll('.stg.dg').forEach(b=>b.onclick=e=>{e.stopImmediatePropagation();const ci=+b.dataset.d;if(!dungeonOpen(ci)){SFX.ng();toast('前のステージをクリアしよう');return}SFX.ok();prepDungeon(ci)});
 el.querySelectorAll('.stg:not(.dg)').forEach(b=>b.onclick=()=>{const s=STAGES[b.dataset.s];if(!stageOpen(s.id)){SFX.ng();toast(s.si===CHAPTERS[s.ci].stages.length-1&&P.cleared[STAGE_ORDER[STAGE_ORDER.indexOf(s.id)-1]]?'3Dダンジョンの最深部にたどり着こう':'前のステージをクリアしよう');return}SFX.ok();prepQuest(s)})}
async function prepQuest(s){const party=P.party.map(uById).filter(Boolean);
 const c=await modal(`<h3>${s.id} ${s.name}</h3><p style="text-align:center;font-size:13px">推奨Lv ${s.lv}　BATTLE ${s.waves.length}</p>`+party.map(u=>{const d=UNITS[u.id];return `<div class="op" style="pointer-events:none"><img src="${portrait(u.id)}" style="width:34px;height:34px;object-fit:cover;border-radius:5px"><span>${d.name}<small>${d.job}　Lv${u.lv}</small></span></div>`}).join(''),[{l:'出発する',c:'g'},{l:'編成する'},{l:'もどる'}]);
 if(c===0)await startQuest(s);else if(c===1){unitTab='party';showPage('units')}}

/* ---- units ---- */
let unitTab='list';
function renderUnits(){const el=$('#units');
 const tabs=`<div class="tabs"><button data-t="list" class="${unitTab==='list'?'on':''}">ユニット一覧</button><button data-t="party" class="${unitTab==='party'?'on':''}">パーティ編成</button><button data-t="enh" class="${unitTab==='enh'?'on':''}">アイテム</button></div>`;
 let h=tabs;
 if(unitTab==='list'){const list=[...P.units].sort((a,b)=>power(b)-power(a));h+=`<p class="pow">仲間 <b>${P.units.length}</b> 人</p><div class="grid">`+list.map(u=>cardHTML(u)).join('')+'</div>'}
 else if(unitTab==='party'){const tot=P.party.reduce((s,uid)=>s+power(uById(uid)),0);
  h+=`<p class="pow">総戦力 <b>${fmt(tot)}</b>　（左端がリーダー）</p><div class="pslots">`+[0,1,2,3,4,5].map(i=>{const u=uById(P.party[i]);return u?cardHTML(u,{slot:i,ld:i===0}):`<button class="empty" data-slot="${i}">＋</button>`}).join('')+`</div><div class="row"><button class="btn g" id="autoP">おまかせ編成</button></div><p style="font-size:12px;color:#9ab;line-height:1.7">ユニットをタップすると入れ替えできます。パーティは最大6人です。パーティから外れている仲間も、クエストクリアでEXPの半分を受け取ります。</p>`}
 else{h+=`<p class="pow">強化アイテム・消費アイテム</p>`+Object.keys(ITEMS).map(k=>`<div class="shop"><div class="ic" style="--ic:${ITEMS[k].ic};background:#0008"><i></i></div><div class="nm">${ITEMS[k].n}<small>${ITEMS[k].d}</small></div><div class="hv">×${P.items[k]||0}</div></div>`).join('')+'<p style="font-size:12px;color:#9ab">経験値の結晶はユニット詳細の「強化」で使えます。</p>'}
 el.innerHTML=h;
 el.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{SFX.cur();unitTab=b.dataset.t;renderUnits()});
 el.querySelectorAll('.card').forEach(b=>b.onclick=()=>{SFX.ok();const u=uById(+b.dataset.uid);if(b.dataset.slot!=null)pickForSlot(+b.dataset.slot);else unitDetail(u)});
 el.querySelectorAll('.empty').forEach(b=>b.onclick=()=>{SFX.ok();pickForSlot(+b.dataset.slot)});
 const ap=$('#autoP');if(ap)ap.onclick=()=>{SFX.ok();P.party=[...P.units].sort((a,b)=>power(b)-power(a)).slice(0,6).map(u=>u.uid);save();renderUnits();toast('戦力の高い順に編成しました')};
}
function cardHTML(u,o={}){const d=UNITS[u.id];return `<button class="card r4" data-uid="${u.uid}" ${o.slot!=null?`data-slot="${o.slot}"`:''}><img src="${fullImg(u.id)}" alt="">${o.ld?'<span class="ld">LEADER</span>':P.party.includes(u.uid)&&o.slot==null?'<span class="in">PT</span>':''}${o.nw?'<span class="nw">NEW</span>':''}<span class="st">${d.job}</span><span class="lv">${o.nw!=null?d.name:'Lv'+u.lv+(u.lb?' +'+u.lb:'')}</span></button>`}
async function pickForSlot(i){const list=[...P.units].sort((a,b)=>power(b)-power(a));
 const c=await modal(`<h3>スロット${i+1}に入れるユニット</h3><div class="grid">`+list.map(u=>cardHTML(u)).join('')+'</div>',[{l:'はずす',dis:!P.party[i]||P.party.length<=1},{l:'とじる'}],{onOpen:m=>m.querySelectorAll('.card').forEach(b=>b.onclick=()=>{SFX.ok();const uid=+b.dataset.uid;const j=P.party.indexOf(uid);if(j>=0){P.party[j]=P.party[i];}P.party[i]=uid;P.party=P.party.filter(x=>x!=null&&x!==undefined);save();m.style.display='none';m.innerHTML='';renderUnits()})});
 if(c===0){P.party.splice(i,1);save();renderUnits()}}
async function unitDetail(u){
 while(true){const d=UNITS[u.id],s=ustat(u),ab=d.abil,ml=maxLv(u);
  const html=`<div class="ud r4"><div class="big"><img src="${fullImg(u.id)}" alt=""></div><div><div class="nm">${d.name}</div><div class="jb">${d.job}</div><div style="font-size:14px;margin-top:4px">Lv <b>${u.lv}</b> / ${ml}</div><div class="xp" style="width:150px"><i style="width:${u.lv>=ml?100:u.exp/uNext(u.lv)*100}%"></i></div><div style="font-size:11px;color:#9ab">${u.lv>=ml?'レベル最大':'つぎまで '+fmt(uNext(u.lv)-u.exp)}</div></div></div>
  <div class="stt"><span><em>HP</em>${s.hp}</span><span><em>MP</em>${s.mp}</span><span><em>攻撃</em>${s.atk}</span><span><em>防御</em>${s.def}</span><span><em>魔力</em>${s.mag}</span><span><em>精神</em>${s.spr}</span></div>
  ${ab.map(([id,l])=>{const a=ABIL[id];return `<div class="ab ${u.lv<l?'lk':''}"><b>${a.n}</b>　<span style="color:#7ae0ff;font-size:12px">MP ${a.mp}</span>${u.lv<l?`<span style="font-size:11px;color:#f88"> Lv${l}で習得</span>`:''}<small>${a.d}</small></div>`}).join('')}
  <div class="ab lb"><b>LB：${d.lb.n}</b>　<span style="color:#ffe04a;font-size:12px">クリスタル ${d.lb.c}</span><small>${d.lb.d}</small></div>`;
  const exItems=['exs','exm','exl'].filter(k=>P.items[k]>0);
  const c=await modal(html,[{l:'強化する',c:'g',dis:!exItems.length||u.lv>=ml},{l:'とじる'}]);
  if(c!==0)return;
  const k=await modal(`<h3>${d.name}を強化</h3><p style="text-align:center">使用する結晶を選んでください</p>`,[...exItems.map(k=>({l:`${ITEMS[k].n.replace('経験値の結晶・','結晶')}（${P.items[k]}）`,c:'g'})),{l:'もどる'}]);
  if(k>=0&&k<exItems.length){const key=exItems[k];P.items[key]--;const up=gainUExp(u,ITEMS[key].v);save();if(up){SFX.lvl();toast(`${d.name}　Lv${u.lv} にアップ！`)}else{SFX.coin();toast('EXP +'+fmt(ITEMS[key].v))}}
 }}

/* ---- shop ---- */

/* ---- story talk ---- */
function speaker(k){if(k==='N')return{n:'',img:null};if(NPCN[k])return{n:NPCN[k],img:null,ic:(k==='kaguya'||k==='lyra')?'img/face_'+k+'.webp':NTY[k]?npcPic(NTY[k]):null};if(k==='lucifer')return{n:'ルシファー',img:null,ic:'img/face_lucifer.webp'};if(k==='?')return{n:'？？？',img:null};if(k==='xenon')return{n:'ゼノン',img:null,ic:'img/face_xenon.webp'};if(UNITS[k])return{n:UNITS[k].name,img:null,ic:'img/face_'+k+'.webp'};if(ENEMIES[k])return{n:ENEMIES[k].n,img:null,ic:ENEMIES[k].pillar?'img/face_'+k+'.webp':enemyArt(k).toDataURL()};{const nn=(typeof D!=='undefined'&&D&&D.npcs)?D.npcs.find(n=>n.name===k):null;const t=nn?npcType(nn):NTY[k];return{n:k,img:null,ic:t?npcPic(t):null}}}
function talk(lines){return new Promise(res=>{if(!lines||!lines.length)return res();const el=$('#talk'),who=el.querySelector('.who'),tx=el.querySelector('.tx'),pt=el.querySelector('.pt');el.style.display='block';let i=0,iv=null,done=false;
 const show=()=>{const[k,t]=lines[i];const s=speaker(k);who.style.display=s.n?'block':'none';who.textContent=s.n;if(s.img){pt.src=s.img;pt.style.display='block';el.querySelector('.box').style.paddingLeft='92px'}else{pt.style.display='none';el.querySelector('.box').style.paddingLeft='16px'}{const ic=el.querySelector('.ic');if(s.ic){ic.onerror=()=>{ic.style.display='none';el.querySelector('.box').style.paddingLeft='16px'};ic.src=s.ic;ic.classList.toggle('px',s.ic.startsWith('data:'));ic.style.display='block';pt.style.display='none';el.querySelector('.box').style.paddingLeft='96px'}else ic.style.display='none'}let c=0;done=false;tx.textContent='';clearInterval(iv);iv=setInterval(()=>{c++;tx.textContent=t.slice(0,c);if(c>=t.length){clearInterval(iv);done=true}},26)};
 const end=()=>{clearInterval(iv);el.style.display='none';el.onclick=null;el.querySelector('.skip').onclick=null;res()};
 el.onclick=()=>{if(!done){clearInterval(iv);tx.textContent=lines[i][1];done=true;return}SFX.cur();i++;if(i>=lines.length)end();else show()};
 el.querySelector('.skip').onclick=e=>{e.stopPropagation();SFX.cur();end()};show()})}

/* ================= BATTLE ================= */
const ELAY={1:[[.3,.66]],2:[[.22,.48],[.38,.74]],3:[[.16,.42],[.38,.56],[.18,.8]],4:[[.13,.4],[.37,.46],[.15,.74],[.4,.82]]};
const BOSSADD=[[.12,.36],[.48,.4],[.5,.86],[.1,.88]];
const esc=()=>{};
function upos(i){const col=i%2,row=Math.floor(i/2);return{x:W*(col?.88:.7),y:H*(.36+row*.2+col*.06)}}
function bsc(){return H>=300?2:1.6}
function mkBU(u,idx,support){const d=UNITS[u.id],s=ustat(u);return{idx,uid:u.uid,id:u.id,d,pal:d.pal,name:d.name,lv:u.lv,mhp:s.hp,hp:s.hp,mmp:s.mp,mp:s.mp,atk:s.atk,def:s.def,mag:s.mag,spr:s.spr,hits:d.hits,lbg:0,lbc:d.lb.c,buffs:{},prov:0,acted:false,acting:false,queued:null,ko:false,ox:0,oxT:0,pose:'',flash:0,guard:false,support,abil:uAbils(u)}}
function mkEnemy(id,L,pos,i,cnt,idxMap){const d=ENEMIES[id],m=(1+.034*(L-1))*1.3,hm=(1+.04*(L-1))*(d.boss?1.7:1.5),dm=(1+.034*(L-1))*1.15;idxMap[id]=(idxMap[id]||0)+1;const sfx=cnt[id]>1?String.fromCharCode(64+idxMap[id]):'';
 return{...d,id,en:true,name:d.n+sfx,mhp:Math.round(d.hp*hm),hp:Math.round(d.hp*hm),atk:Math.round(d.atk*m),def:Math.round(d.def*dm),mag:Math.round(d.mag*m),spr:Math.round(d.spr*dm),buffs:{},debuffs:{},x:W*(pos[0]+.16),y:H*pos[1],fx:pos[0],fy:pos[1],ox:0,oxT:0,enter:1,flash:0,alive:true,die:0,scale:d.scale||1,used:{},pops:0}}
function spawnWave(){const ids=B.stage.waves[B.wave];const cnt={};ids.forEach(i=>cnt[i]=(cnt[i]||0)+1);const im={};const boss=ids.length===1&&ENEMIES[ids[0]].boss;
 B.ens=ids.map((id,i)=>mkEnemy(id,B.stage.lv,boss?[.3,.7]:ELAY[Math.min(4,ids.length)][i],i,cnt,im));B.target=B.ens[0];B.isBoss=!!boss;
 if(boss){playBGM('boss',true)}else if(B.wave===0)playBGM('battle',true)}
const aliveE=()=>B.ens.filter(e=>e.alive),aliveU=()=>B.units.filter(u=>!u.ko);
function eff(x,k){const b=(x.buffs[k]?.v||0)-((x.debuffs&&x.debuffs[k]?.v)||0);return x[k]*Math.max(.2,1+b)}
function bigBanner(t){B.banner={t,a:0}}
/* panels */
function buildPanels(){const g=$('#pgrid');g.innerHTML=B.units.map((u,i)=>`<div class="up" data-i="${i}"><img class="fc" src="${portrait(u.id)}" alt="" draggable="false"><div class="inf"><div class="nm"><span>${u.name}</span><span class="q"></span></div><div class="hb"><i></i></div><div class="nums"><span class="h"></span><span class="m"></span></div><div class="mb"><i></i></div><div class="lbb"><i></i></div></div>${u.support?'<span class="sp">SUPPORT</span>':''}</div>`).join('');
 for(let i=B.units.length;i<6;i++)g.insertAdjacentHTML('beforeend','<div></div>');
 g.querySelectorAll('.up').forEach(el=>bindPanel(el,+el.dataset.i));B.pcache={}}
function updPanels(){const g=$('#pgrid');B.units.forEach((u,i)=>{const el=g.children[i];if(!el)return;const cur=B.ci===i&&!!B.cmdMode;const key=[u.hp,u.mp,u.lbg,u.acted,u.ko,u.queued&&u.queued.label,B.phase==='player',cur].join('|');if(B.pcache[i]===key)return;B.pcache[i]=key;
 el.querySelector('.hb i').style.width=u.hp/u.mhp*100+'%';el.querySelector('.hb').classList.toggle('low',u.hp<u.mhp*.3);el.querySelector('.mb i').style.width=(u.mmp?u.mp/u.mmp*100:0)+'%';el.querySelector('.lbb i').style.width=Math.min(100,u.lbg/u.lbc*100)+'%';
 el.querySelector('.h').textContent=u.hp;el.querySelector('.m').textContent='MP '+u.mp;el.querySelector('.q').textContent=u.queued?u.queued.label:'';
 el.classList.toggle('acted',u.acted&&!u.ko);el.classList.toggle('ko',u.ko);el.classList.toggle('lbf',u.lbg>=u.lbc&&!u.ko);el.classList.toggle('qd',!!u.queued);el.classList.toggle('cur',cur);if(u.flash>.2&&!el._hit){el._hit=1;el.classList.remove('hit');void el.offsetWidth;el.classList.add('hit');setTimeout(()=>el._hit=0,350)}})}
function canAct(u){return B&&B.phase==='player'&&!u.ko&&!u.acted&&!u.acting&&aliveE().length}
function tapUnit(i){const u=B.units[i];if(!canAct(u)){SFX.ng();return}unitAct(u)}
function quickDefend(i){const u=B.units[i];if(!canAct(u)){SFX.ng();return}u.queued={k:'defend',label:'ぼうぎょ'};unitAct(u)}
/* sheet */
let sheetTab='abil';
function closeSheet(){$('#sheet').style.display='none';if(B)B.sheetU=null}
function openSheet(i){const u=B.units[i];if(!canAct(u)){SFX.ng();return}SFX.ok();B.sheetU=u;renderSheet(u)}
function renderSheet(u,allyFor){const sh=$('#sheet');sh.style.display='flex';
 let body='';
 if(allyFor){const cands=B.units.filter(x=>allyFor.t==='dead'?x.ko:!x.ko);body=`<div style="font-size:12px;color:#9ab;padding:4px 2px">${allyFor.label} をだれに使う？</div>`+cands.map(x=>`<button class="op" data-a="${x.idx}"><span>${x.name}<small>HP ${x.hp}/${x.mhp}　MP ${x.mp}/${x.mmp}</small></span></button>`).join('')+(cands.length?'':'<p style="font-size:13px;color:#9ab">対象がいません</p>');}
 else if(sheetTab==='abil'){const lbOk=u.lbg>=u.lbc;body=`<button class="op lb" data-lb="1" ${lbOk?'':'disabled'}><span>LB：${u.d.lb.n}<small>${u.d.lb.d}</small></span><em style="color:#ffe04a">${Math.min(u.lbg,u.lbc)}/${u.lbc}</em></button>`+u.abil.map(id=>{const a=ABIL[id];return `<button class="op" data-ab="${id}" ${u.mp<a.mp?'disabled':''}><span>${a.n}<small>${a.d}</small></span><em>MP ${a.mp}</em></button>`}).join('')+`<button class="op" data-def="1"><span>ぼうぎょ<small>受けるダメージ半減＋MP少し回復</small></span></button>`}
 else{const ks=Object.keys(P.items).filter(k=>P.items[k]>0&&!ITEMS[k].noBattle);body=ks.map(k=>`<button class="op" data-it="${k}"><span>${ITEMS[k].n}<small>${ITEMS[k].d}</small></span><em>×${P.items[k]}</em></button>`).join('')||'<p style="font-size:13px;color:#9ab;padding:6px">使えるアイテムがありません</p>'}
 sh.innerHTML=`<div class="sh"><img src="${portrait(u.id)}" style="width:28px;height:28px;object-fit:cover;border-radius:4px">${u.name}<small>HP ${u.hp}/${u.mhp}　MP ${u.mp}/${u.mmp}</small><button class="btn" id="shX" style="min-height:34px;padding:0 12px;margin-left:6px">とじる</button></div>`+(allyFor?'':`<div class="tabs"><button data-t="abil" class="${sheetTab==='abil'?'on':''}">アビリティ</button><button data-t="item" class="${sheetTab==='item'?'on':''}">アイテム</button></div>`)+`<div class="sl">${body}</div>`;
 $('#shX').onclick=()=>{SFX.cur();closeSheet()};
 sh.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{SFX.cur();sheetTab=b.dataset.t;renderSheet(u)});
 const queue=cmd=>{u.queued=cmd;closeSheet();SFX.ok();if(P.tipQ<2){P.tipQ++;toast('パネルをタップで発動！')}};
 sh.querySelectorAll('[data-lb]').forEach(b=>b.onclick=()=>queue({k:'lb',label:'LB '+u.d.lb.n}));
 sh.querySelectorAll('[data-def]').forEach(b=>b.onclick=()=>{u.queued={k:'defend',label:'ぼうぎょ'};closeSheet();unitAct(u)});
 sh.querySelectorAll('[data-ab]').forEach(b=>b.onclick=()=>{const a=ABIL[b.dataset.ab];const cmd={k:'abil',id:b.dataset.ab,label:a.n};if(a.t==='ally'||a.t==='dead'){SFX.cur();renderSheet(u,{t:a.t,label:a.n,cmd})}else queue(cmd)});
 sh.querySelectorAll('[data-it]').forEach(b=>b.onclick=()=>{const it=ITEMS[b.dataset.it];SFX.cur();renderSheet(u,{t:it.use==='revive'?'dead':'ally',label:it.n,cmd:{k:'item',id:b.dataset.it,label:it.n}})});
 sh.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const cmd=Object.assign({},allyFor.cmd,{ally:+b.dataset.a});queue(cmd)});
}
/* actions */
async function unitAct(u){
 if(!canAct(u))return;
 const cmd=u.queued||{k:'attack'};u.queued=null;u.acted=true;u.acting=true;
 if(!B.turnStart)B.turnStart=performance.now();B.log.push({i:u.idx,cmd:Object.assign({},cmd),t:performance.now()-B.turnStart});
 if(B.sheetU===u)closeSheet();
 try{await perform(u,cmd)}catch(err){console.error(err)}finally{u.acting=false;u.pose='';u.oxT=0;flow()}
}
async function perform(u,cmd){
 if(cmd.k==='defend'){u.guard=true;u.mp=Math.min(u.mmp,u.mp+Math.ceil(u.mmp*.08));pop(u,'GUARD','#9ad0ff');SFX.buff();await sleep(300);return}
 if(cmd.k==='abil'){const a=ABIL[cmd.id];if(u.mp<a.mp){toast('MPが足りない');return perform(u,{k:'attack'})}u.mp-=a.mp;showName(a.n);await exec(u,a,cmd);return}
 if(cmd.k==='lb'){if(u.lbg<u.lbc)return perform(u,{k:'attack'});u.lbg=0;SFX.lb();B.cut={u,t:0,name:u.d.lb.n};await sleep(950);B.cut=null;await exec(u,u.d.lb,cmd);return}
 if(cmd.k==='item'){const it=ITEMS[cmd.id];if(!(P.items[cmd.id]>0)){toast('アイテムがない');return}const t=B.units[cmd.ally];if(!t||(it.use==='revive')!==t.ko){toast('効果がなかった');return}P.items[cmd.id]--;showName(it.n);u.oxT=-8;await sleep(150);
  fxHeal([t]);if(it.use==='hp')healU(t,t.mhp*it.p);else if(it.use==='mp'){const v=Math.round(t.mmp*it.p);t.mp=Math.min(t.mmp,t.mp+v);pop(t,'MP+'+v,'#8ac8ff')}else if(it.use==='revive')reviveU(t,it.p);else{healU(t,t.mhp);t.mp=t.mmp}await sleep(350);return}
 await strike(u,{k:'phys',m:1,hits:u.hits,t:'enemy',el:null,normal:1},null);
}
function showName(n){B.aname={t:n,a:0}}
async function exec(u,a,cmd){
 if(a.k==='phys'||a.k==='mag'||a.k==='hyb')await strike(u,a,cmd);
 else if(a.k==='grav'){const e=validTarget();if(e){u.pose='cast';u.oxT=-6;await sleep(250);fxElem('dark',[e]);await sleep(300);const d=Math.max(1,Math.floor(e.hp*(e.boss?a.p*.3:a.p)));chainHit(u);dmgEnemy(u,e,d,'#d0a0ff');await sleep(350)}}
 else{u.pose='cast';u.oxT=-8;await sleep(240);const T=allyT(u,a,cmd);
  if(a.k==='heal'){fxHeal(T);for(const t of T){if(t.ko){if(a.revive)reviveU(t,a.revive);continue}if(a.pct)healU(t,t.mhp*a.pct);else healU(t,healAmt(u,a.m));if(a.mpgain){t.mp=Math.min(t.mmp,t.mp+a.mpgain)}}}
  else if(a.k==='revive'){for(const t of T)if(t.ko){fxHeal([t]);reviveU(t,a.p)}}
  else if(a.k==='buff'){SFX.buff();for(const t of T){for(const k in a.buff)t.buffs[k]={v:a.buff[k],t:a.turns};fxBuff(t,'#ffd04a')}if(a.provoke){u.prov=a.turns;pop(u,'挑発','#ffb04a')}}
  else if(a.k==='lbfill'){SFX.buff();for(const t of T){if(t.ko)continue;t.lbg=Math.min(t.lbc,t.lbg+Math.ceil(t.lbc*a.p));fxBuff(t,'#ffa03a')}}
  await sleep(480);u.pose='';u.oxT=0;await sleep(140)}
 if(a.then)await exec(u,a.then,cmd);
}
function allyT(u,a,cmd){if(a.t==='self')return[u];if(a.t==='ally'||a.t==='dead'){const t=B.units[cmd.ally];if(t)return[t];return[aliveU().sort((x,y)=>x.hp/x.mhp-y.hp/y.mhp)[0]].filter(Boolean)}return a.revive||a.k==='revive'?B.units.slice():aliveU()}
function healAmt(u,m){return(eff(u,'spr')*1.2+eff(u,'mag')*.4)*m*(.95+Math.random()*.1)}
function healU(t,v){if(t.ko)return;const b=t.hp;t.hp=Math.min(t.mhp,Math.round(t.hp+v));pop(t,'+'+(t.hp-b),'#8fff9a')}
function reviveU(t,p){if(!t.ko)return;t.ko=false;t.hp=Math.max(1,Math.round(t.mhp*p));pop(t,'ふっかつ','#8fff9a')}
function validTarget(){if(B.target&&B.target.alive)return B.target;const a=aliveE();if(a.length)B.target=a[0];return a[0]}
async function strike(u,a,cmd){
 const isMag=a.k==='mag';u.pose=isMag?'cast':'atk';u.oxT=isMag?-6:-18;
 if(isMag||a.k==='hyb')B.fx.push({type:'circle',u,t:0,dur:.7,col:a.el?ELC[a.el]:'#cfe0ff'});
 if(a.fx==='jump'){u.jump=1;await sleep(300)}
 await sleep(isMag?260:140);
 const hits=a.hits||1,gap=hits>10?50:hits>5?70:105;let drained=0;
 for(let h=0;h<hits;h++){
  const T=(a.t==='enemies'?aliveE():[validTarget()]).filter(Boolean);if(!T.length)break;
  for(const e of T)drained+=dealHit(u,e,a,hits);
  hitFx(a,T,h);
  await sleep(gap);
 }
 if(a.fx==='jump')u.jump=0;
 if(a.debuff)for(const e of(a.t==='enemies'?aliveE():[validTarget()]).filter(Boolean)){for(const k in a.debuff)e.debuffs[k]={v:a.debuff[k],t:a.turns||3};pop(e,'ダウン','#ff9aff')}
 if(drained>0&&!u.ko)healU(u,drained);
 await sleep(150);u.pose='';u.oxT=0;await sleep(110);
}
function dealHit(u,e,a,hits){
 const mult=chainHit(u);let base;
 if(a.k==='mag')base=eff(u,'mag')-eff(e,'spr')*.5;else if(a.k==='hyb')base=(eff(u,'atk')+eff(u,'mag'))/2-(eff(e,'def')+eff(e,'spr'))/4;else base=eff(u,'atk')-eff(e,'def')*.5;
 base=Math.max(base,(a.k==='mag'?eff(u,'mag'):eff(u,'atk'))*.12);
 let el=1;if(a.el){if(e.weak&&e.weak.includes(a.el))el=1.5;else if(e.resist&&e.resist.includes(a.el))el=.5}
 const crit=a.k!=='mag'&&Math.random()<.06?1.5:1;
 const d=Math.max(1,Math.round(base*(a.m||1)/hits*mult*el*crit*(.95+Math.random()*.1)));
 dmgEnemy(u,e,d,el>1?'#ffb040':el<1?'#9ab':crit>1?'#ffe04a':'#fff',el>1);
 if(Math.random()<.5)spawnCrys(e,u);
 return a.drain?d*a.drain:0;
}
function dmgEnemy(u,e,d,col,weak){e.hp-=d;e.flash=.1;pop(e,d,col,weak?'WEAK':null);if(e.hp<=0&&e.alive)killEnemy(e,u)}
function killEnemy(e,u){e.alive=false;e.hp=0;e.die=0;SFX.ko();for(let i=0;i<4;i++)spawnCrys(e,pick(aliveU())||u);if(B.target===e)validTarget();
 const dr=dropFor(B.stage);if(dr&&Math.random()<.35)B.drops.push(dr)}
function dropFor(s){const ci=s.ci;const t=['potion','potion','ether'];if(ci>=1)t.push('exs','exs','ether');if(ci>=2)t.push('hipotion','feather','exs');if(ci>=3)t.push('exm','hipotion');if(ci>=4)t.push('exm','exm');return pick(t)}
function flow(){
 if(!B||B.phase!=='player'||B.busy)return;
 if(B.units.some(u=>u.acting))return;
 if(!aliveE().length){B.busy=true;waveClear();return}
 if(B.units.every(u=>u.ko||u.acted)){B.busy=true;enemyPhase()}
}
async function waveClear(){B.phase='trans';closeSheet();await sleep(600);
 if(B.wave+1<B.stage.waves.length){B.wave++;B.run=1;B.units.forEach(u=>{u.acted=false;u.guard=false;u.queued=null});await sleep(800);B.run=0;spawnWave();if(B.isBoss&&B.stage.btalk&&!P.cleared[B.stage.id]&&!B.retry){await sleep(500);await talk(B.stage.btalk)}const bd=B.ens[0];bigBanner(B.isBoss&&bd.pillar?`序列${bd.rank}位 ${bd.title} ${bd.n}`:`BATTLE ${B.wave+1}/${B.stage.waves.length}`);$('#bwave').textContent=`BATTLE ${B.wave+1}/${B.stage.waves.length}`;await sleep(700);newTurn()}
 else victory()}
async function enemyPhase(){B.phase='enemy';closeSheet();await sleep(380);
 for(const e of aliveE()){let n=e.acts||1;if(e.boss&&e.hp<e.mhp*.5)n++;for(let k=0;k<n;k++){if(!aliveU().length||!e.alive)break;await enemyAct(e)}if(!aliveU().length)break}
 if(!aliveU().length){await sleep(500);gameOver();return}
 newTurn()}
function autoFire(){if(!B||B.phase!=='player')return;let k=0;for(const u of B.units){if(u.ko||u.acted||u.acting)continue;u.queued=null;setTimeout(()=>{if(B&&canAct(u))unitAct(u)},(k++*85)/spd())}}
function doRepeat(){if(!B||B.phase!=='player')return;const log=B.lastLog;if(!log||!log.length){toast('くりかえす行動がありません');return}SFX.ok();
 for(const L of log){setTimeout(()=>{if(!B)return;const u=B.units[L.i];if(!u||!canAct(u))return;let c=Object.assign({},L.cmd);
  if(c.k==='abil'&&u.mp<ABIL[c.id].mp)c={k:'attack'};if(c.k==='lb'&&u.lbg<u.lbc)c={k:'attack'};if(c.k==='item'&&!(P.items[c.id]>0))c={k:'attack'};
  if(c.ally!=null){const t=B.units[c.ally];const needDead=(c.k==='abil'&&ABIL[c.id].t==='dead')||(c.k==='item'&&ITEMS[c.id].use==='revive');if(!t||t.ko!==needDead){if(needDead){const d=B.units.find(x=>x.ko);if(d)c.ally=d.idx;else c={k:'attack'}}else{c.ally=aliveU().sort((x,y)=>x.hp/x.mhp-y.hp/y.mhp)[0].idx}}}
  u.queued=c;unitAct(u)},L.t/spd())}}
function pickUnitT(){const al=aliveU();const pv=al.filter(u=>u.prov>0);if(pv.length&&Math.random()<.75)return pick(pv);return pick(al)}
async function enemyAct(e){
 const below=e.hp<e.mhp*.5;const pool=(e.sk||[]).filter(s=>!s.below||below);let sk=null;if(pool.length&&Math.random()<(e.rate||.3))sk=pick(pool);
 if(sk&&sk.k==='summon'&&aliveE().length>=4)sk=null;
 e.oxT=14;e.flash=.25;await sleep(200);
 if(!sk){const t=pickUnitT();slashFx([t],false);SFX.hit();enemyHit(e,t,{k:'phys',m:1})}
 else{showName(sk.n);await sleep(250);
  if(sk.k==='summon'){const used=B.ens.map(x=>x.fx+','+x.fy);const pos=BOSSADD.find(p=>!used.includes(p.join(',')))||BOSSADD[0];const n=mkEnemy(sk.id,B.stage.lv,pos,0,{},{});n.name=ENEMIES[sk.id].n;B.ens.push(n);SFX.buff()}
  else if(sk.k==='buff'){e.buffs.def={v:.5,t:3};e.buffs.spr={v:.5,t:3};fxBuff(e,'#b050ff');pop(e,'防御UP','#d0a0ff');SFX.dark()}
  else{const T=sk.t==='all'?aliveU():[pickUnitT()];if(sk.k==='mag'||sk.el)fxElem(sk.el||'none',T);else slashFx(T,true);(sk.k==='phys'?SFX.crit:()=>{})();await sleep(380);for(const t of T)enemyHit(e,t,sk)}}
 await sleep(320);e.oxT=0;await sleep(240)}
function enemyHit(e,t,sk){if(t.ko)return;let base=sk.k==='mag'?eff(e,'mag')-eff(t,'spr')*.5:eff(e,'atk')-eff(t,'def')*.5;base=Math.max(base,(sk.k==='mag'?e.mag:e.atk)*.1);let d=base*(sk.m||1)*(.92+Math.random()*.16);if(t.guard)d*=.5;d=Math.max(1,Math.round(d));
 t.hp-=d;t.flash=.3;pop(t,d,'#ff8a8a');t.lbg=Math.min(t.lbc,t.lbg+1);B.shake=.12;if(sk.k==='drain'&&e.alive){e.hp=Math.min(e.mhp,e.hp+d);pop(e,'+'+d,'#8fff9a')}
 if(t.hp<=0){t.hp=0;t.ko=true;t.queued=null;t.buffs={};t.prov=0;pop(t,'KO','#ff6a6a');SFX.ko()}}
async function endBattleQuiet(){B=null;closeSheet()}
$('#bAuto').onclick=()=>{if(!B)return;B.auto=!B.auto;$('#bAuto').classList.toggle('on',B.auto);SFX.cur();if(B.auto&&B.phase==='player'&&B.cmdMode&&!B.busy)autoTurn()};
$('#bSpd').onclick=()=>{if(!B)return;B.speed=B.speed===1?2:1;P.bspd=B.speed;$('#bSpd').textContent='×'+B.speed;SFX.cur()};
$('#bMenu').onclick=async()=>{if(!B||B.phase==='end'||B.phase==='over')return;SFX.ok();const c=await modal(`<h3>メニュー</h3>`,[{l:'バトルにもどる',c:'g'},{l:'にげる',c:'r',dis:!!(B.isBoss||B.stage.boss)},{l:'サウンド '+(muted?'ON にする':'OFF にする')}]);if(c===1){if(B.phase==='player'&&!B.busy)tryEscape();else toast('いまは逃げられない')}else if(c===2)setMute(!muted)};
cv.addEventListener('pointerdown',e=>{if(scene==='title'){initAudio();startFromTitle();return}if(scene!=='battle'||!B)return;const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*H/r.height;const sc=bsc();
 for(const en of aliveE()){const dm=eDim(en),w=dm.w,h=dm.h;if(x>=en.x-w/2-4&&x<=en.x+w/2+4&&y>=en.y-h-4&&y<=en.y+6){B.target=en;SFX.cur();if(B.cmdMode==='target')cmdQueue(Object.assign({},B.tgtCmd,{tgt:en}));return}}});
/* fx */
const MONI={},MONS={slime:.2,bat:.24,goblin:.27,wolf:.24,bat2:.27,imp:.27,hound:.27,skeleton:.3,bslime:.27,crab:.26,wraith:.31,gargoyle:.31,dknight:.36};function monArt(id){if(!MONS[id])return null;let im=MONI[id];if(!im){im=MONI[id]=new Image();im.src='img/mon/'+id+'.webp'}return im.complete&&im.naturalWidth?im:null}
function eDim(e){const d=ENEMIES[e.id];{const a=!d.pillar&&monArt(e.id);if(a){const h=H*MONS[e.id]*(e.scale||1),w=h*a.naturalWidth/a.naturalHeight;return{img:a,w,h,sw:a.naturalWidth,sh:a.naturalHeight,smooth:1}}}if(d.pillar){const a=art(e.id);if(a){const h=H*.5*(e.scale||1);return{img:a,w:h*a.naturalWidth/a.naturalHeight,h,sw:a.naturalWidth,sh:a.naturalHeight,smooth:1}}}const img=enemyArt(e.id),s=bsc()*e.scale;return{img,w:img.width*s,h:img.height*s,sw:img.width,sh:img.height}}
function ucenter(x){if(x.en){return{x:x.x+x.ox,y:x.y-eDim(x).h/2}}const p=upos(x.idx);return{x:p.x+x.ox,y:p.y-H*.09}}
function pop(x,txt,col,sub){const c=ucenter(x);x.pops=(x.pops||0)+1;const off=(x.pops%4)*7;B.pops.push({x:c.x+(x.en?(Math.random()*16-8):0),y:c.y-off,txt:String(txt),col,t:0,sub});setTimeout(()=>{x.pops=Math.max(0,(x.pops||0)-1)},500)}
function burst(x,n,cols,o={}){const c=ucenter(x);for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=(o.speed||40)*(.4+Math.random());B.parts.push({x:c.x+(Math.random()-.5)*(o.spread||16),y:c.y+(Math.random()-.5)*(o.spread||16),vx:Math.cos(a)*s+(o.vx||0),vy:Math.sin(a)*s+(o.vy||0),g:o.g||0,life:(o.life||.6)*(.6+Math.random()*.6),max:o.life||.6,c:pick(cols),s:o.size||2})}}
function slashFx(T,big){for(const t of T){const c=ucenter(t);B.fx.push({type:'slash',x:c.x,y:c.y,t:0,dur:.2,big,rot:Math.random()});burst(t,big?10:5,['#fff','#ffe0a0'],{speed:60,life:.3})}}
function hitFx(a,T,h){if(a.el&&(a.k!=='phys'||h%2===0))fxElem(a.el,T,true);else if(a.k==='mag'){for(const t of T)burst(t,8,['#cfe0ff','#fff','#9ab8ff'],{life:.4,speed:50});if(h===0)SFX.none()}if(a.k!=='mag'){slashFx(T,a.m>=2&&!a.normal);SFX.hit(B.chain)}}
function fxElem(el,T,light){if(!light||Math.random()<.5)(SFX[el]||SFX.none)();const col=ELC[el]||'#fff';
 for(const t of T){const c=ucenter(t);
  if(el==='fire')burst(t,light?10:22,['#ff4a1a','#ffa01a','#ffe04a'],{vy:-40,speed:30,life:.6,size:3});
  else if(el==='ice'){for(let i=0;i<(light?5:10);i++)B.parts.push({x:c.x+(Math.random()-.5)*30,y:c.y-40-Math.random()*20,vx:0,vy:100,life:.45,max:.45,c:pick(['#bff4ff','#6ad4ff','#fff']),s:3})}
  else if(el==='thunder'){B.fx.push({type:'bolt',x:c.x,y:c.y,t:0,dur:.25});burst(t,8,['#fff6a0','#ffe040'],{life:.35,speed:60})}
  else if(el==='light'){B.fx.push({type:'ring',x:c.x,y:c.y,t:0,dur:.5,col:'#fff'});burst(t,12,['#fff','#fffbd0'],{vy:-30,life:.7})}
  else if(el==='dark'){B.fx.push({type:'ring',x:c.x,y:c.y,t:0,dur:.5,col:'#b040ff',inv:1});burst(t,14,['#7a20c0','#c060ff','#2a0a40'],{speed:20,life:.6,size:3})}
  else if(el==='earth'){for(let i=0;i<5;i++)B.parts.push({x:c.x+(Math.random()-.5)*28,y:c.y-60-Math.random()*30,vx:0,vy:140,g:200,life:.45,max:.45,c:pick(['#8a6a44','#6a4e30','#a08060']),s:4});B.shake=.25}
  else if(el==='water'){B.fx.push({type:'ring',x:c.x,y:c.y,t:0,dur:.45,col:'#4a9aff'});burst(t,14,['#4a9aff','#9ad0ff','#fff'],{vy:-20,speed:40,life:.5})}
  else if(el==='wind'){for(let i=0;i<8;i++)B.parts.push({x:c.x-30,y:c.y+(Math.random()-.5)*30,vx:160,vy:(Math.random()-.5)*30,life:.35,max:.35,c:pick(['#8aff9a','#dfffe8']),s:2})}
  else burst(t,12,['#fff','#ffd',col],{life:.5,speed:50})}}
function fxHeal(T){SFX.heal();for(const t of T){const c=ucenter(t);for(let i=0;i<12;i++)B.parts.push({x:c.x+(Math.random()-.5)*20,y:c.y+12,vx:0,vy:-30-Math.random()*30,life:.8,max:.8,c:pick(['#9fffb0','#ffffff','#7ae0ff']),s:2})}}
function fxBuff(t,col){const c=ucenter(t);for(let i=0;i<6;i++)B.parts.push({x:c.x+(Math.random()-.5)*20,y:c.y+10,vx:0,vy:-50,life:.6,max:.6,c:col,s:2,arrow:1})}
function spawnCrys(e,u){if(!u)return;const c=ucenter(e);const a=Math.random()*Math.PI*2;B.crys.push({x:c.x,y:c.y,vx:Math.cos(a)*60,vy:Math.sin(a)*60-30,t:0,u})}

/* ================= RENDER ================= */
const BBI={};function bbImg(k){if(!['field','forest','cave','sea','mountain','ruins','temple','abyss'].includes(k))return null;let im=BBI[k];if(!im){im=BBI[k]=new Image();im.src='img/bb/'+k+'.webp'}return im.complete&&im.naturalWidth?im:null}
function drawBG(bg,scroll){{const im=bbImg(bg);if(im){const s=Math.max(W/im.naturalWidth,H/im.naturalHeight),w=im.naturalWidth*s,h=im.naturalHeight*s;ctx.imageSmoothingEnabled=true;ctx.drawImage(im,(W-w)/2,Math.min(0,(H-h)*.35),w,h);ctx.imageSmoothingEnabled=false;return}}const g=ctx,hz=Math.round(H*.36);let sky,gr;
 const S={forest:[['#5aa0e8','#cfe8ff'],['#4a9a38','#22561c']],cave:[['#1a120c','#3a2a1c'],['#4a3a2a','#22180e']],sea:[['#4a90e0','#e0f0ff'],['#e8d494','#b8a060']],mountain:[['#3a1010','#e0603a'],['#4a2a22','#1a0c08']],tower:[['#0e0820','#2a1850'],['#2e2648','#141024']],throne:[['#1a0410','#4a0a2a'],['#2a1030','#100410']],abyss:[['#0a0004','#3a0810'],['#200408','#080002']],ruins:[['#4a3a4a','#c0806a'],['#5a4a3a','#2a2018']],temple:[['#1a0a2a','#5a3a7a'],['#3a2a4a','#1a1024']],home:[['#2a3a8a','#f0a0a0'],['#3a6a3a','#1a3a1a']]};
 [sky,gr]=S[bg]||S.forest;let l=g.createLinearGradient(0,0,0,hz);l.addColorStop(0,sky[0]);l.addColorStop(1,sky[1]);g.fillStyle=l;g.fillRect(0,0,W,hz);
 const par=(sp,f)=>{const o=(scroll*sp)%W;g.save();g.translate(-o,0);f(0);f(W);g.restore()};
 if(bg==='forest'||bg==='home'){g.fillStyle='rgba(255,255,255,.75)';for(const[cx,cy,w]of[[40,22,30],[150,14,40],[210,30,24]]){const x=((cx+time*4)%(W+60))-30;g.fillRect(x,cy,w,5);g.fillRect(x+6,cy-3,w-12,3)}
  par(.3,ox=>{g.fillStyle='#6a8ab8';for(let x=0;x<W;x+=2){const h=10+Math.sin((x+ox)*.05)*6;g.fillRect(x+ox,hz-h,2,h)}});
  par(.7,ox=>{g.fillStyle='#1e5a20';for(let x=-6;x<W;x+=12){g.fillRect(ox+x+4,hz-24,4,24);for(let k=0;k<4;k++)g.fillRect(ox+x+4-k*2,hz-26+k*5,4+k*4,4)}})}
 if(bg==='cave'){par(.5,ox=>{g.fillStyle='#120c08';for(let x=0;x<W;x+=14){const h=8+((x*7)%13);for(let k=0;k<h;k++)g.fillRect(ox+x+k/3,k,7-k*7/h*.9,1)}});g.fillStyle='#4ae8ff';for(let i=0;i<6;i++)if(Math.sin(time*3+i)>.6)g.fillRect((i*47+13)%W,hz-10-(i*13)%30,2,2)}
 if(bg==='sea'){g.fillStyle='#2a6ac8';g.fillRect(0,hz-26,W,26);g.fillStyle='#9ad0ff';for(let i=0;i<12;i++){const x=((i*31+time*10)%(W+20))-10;g.fillRect(x,hz-22+(i%4)*6,8,1)}par(.8,ox=>{g.fillStyle='#6a4a2a';for(let x=10;x<W;x+=60)g.fillRect(ox+x,hz-36,4,40)})}
 if(bg==='mountain'){par(.3,ox=>{g.fillStyle='#2a1010';for(let x=0;x<W;x+=2){const h=40+Math.abs(Math.sin((x+ox)*.02))*30;g.fillRect(x+ox,hz-h,2,h)}});g.fillStyle='#ff8a3a';for(let i=0;i<10;i++){const y=(H*.4-(time*20+i*37)%(H*.4));g.fillRect((i*29)%W,y,1,2)}}
 if(bg==='ruins'){par(.3,ox=>{g.fillStyle='#5a4050';for(let x=0;x<W;x+=2){const h=14+Math.sin((x+ox)*.03)*6;g.fillRect(x+ox,hz-h,2,h)}});par(.7,ox=>{g.fillStyle='#3a2a2a';for(let x=6;x<W;x+=38){const hh=26+(x*7)%22;g.fillRect(ox+x,hz-hh,10,hh);g.fillRect(ox+x-2,hz-hh,14,3)}});g.fillStyle='#ff8a5a';for(let i=0;i<8;i++){const y=(hz-(time*12+i*41)%hz);g.fillRect((i*31)%W,y,1,1)}}
 if(bg==='temple'){par(.6,ox=>{for(let x=8;x<W;x+=40){g.fillStyle='#2a1a3a';g.fillRect(ox+x,0,12,hz);g.fillStyle='#c8a040';g.fillRect(ox+x-2,8,16,2);g.fillRect(ox+x-2,hz-4,16,2);g.fillStyle='#a060ff';g.fillRect(ox+x+5,hz*.45+Math.sin(time*4+x),2,3)}})}
 if(bg==='tower'||bg==='throne'||bg==='abyss'){par(.6,ox=>{g.fillStyle=bg==='tower'?'#1a1234':'#3a0a20';for(let x=10;x<W;x+=46)g.fillRect(ox+x,0,14,hz);g.fillStyle=bg==='tower'?'#a060ff':'#ff4a3a';for(let x=17;x<W;x+=46)g.fillRect(ox+x-1,hz*.4+Math.sin(time*5+x),3,4)})}
 l=g.createLinearGradient(0,hz,0,H);l.addColorStop(0,gr[0]);l.addColorStop(1,gr[1]);g.fillStyle=l;g.fillRect(0,hz,W,H-hz);
 g.fillStyle='rgba(0,0,0,.12)';for(let i=1;i<9;i++){const y=hz+(H-hz)*Math.pow(i/9,1.6);g.fillRect(0,Math.round(y),W,1)}
 g.fillStyle='rgba(255,255,255,.06)';const so=(scroll*1.4)%24;for(let x=-24;x<W+24;x+=24)g.fillRect(x-so,H*.62,10,1)}
function drawText(t,x,y,col,size=10,align='center'){ctx.font=`800 ${size}px 'M PLUS 1p', sans-serif`;ctx.textAlign=align;ctx.lineJoin='round';ctx.lineWidth=Math.max(1.6,size*.26);ctx.strokeStyle='rgba(0,0,0,.85)';ctx.strokeText(t,x,y);ctx.fillStyle=col;ctx.fillText(t,x,y)}
function updateBattle(dt){
 const bdt=dt*B.speed;
 for(const p of B.parts){p.x+=p.vx*bdt;p.y+=p.vy*bdt;p.vy+=(p.g||0)*bdt;p.life-=bdt}B.parts=B.parts.filter(p=>p.life>0);
 for(const f of B.fx)f.t+=bdt;B.fx=B.fx.filter(f=>f.t<f.dur);
 for(const p of B.pops)p.t+=bdt;B.pops=B.pops.filter(p=>p.t<1);
 for(const e of B.ens){e.ox+=(e.oxT-e.ox)*Math.min(1,bdt*14);if(e.flash>0)e.flash-=bdt;if(!e.alive&&e.die<1)e.die+=bdt*1.8;if(e.enter>0)e.enter=Math.max(0,e.enter-bdt*2.2)}
 for(const u of B.units){u.ox+=(u.oxT-u.ox)*Math.min(1,bdt*16);if(u.flash>0)u.flash-=bdt}
 for(const c of B.crys){c.t+=bdt;if(c.t<.3){c.x+=c.vx*bdt;c.y+=c.vy*bdt;c.vx*=.9;c.vy*=.9}else{const p=ucenter(c.u);const k=Math.min(1,(c.t-.3)*5*bdt*10);c.x+=(p.x-c.x)*k;c.y+=(p.y-c.y)*k;if(Math.hypot(p.x-c.x,p.y-c.y)<5||c.t>1.4){c.done=1;if(!c.u.ko){c.u.lbg=Math.min(c.u.lbc,c.u.lbg+1);if(Math.random()<.3)SFX.crys()}}}}B.crys=B.crys.filter(c=>!c.done);
 if(B.shake>0)B.shake-=bdt;B.chainT+=bdt;
 if(B.run)B.scroll+=bdt*120;
 if(B.banner){B.banner.a+=bdt;if(B.banner.a>1.9)B.banner=null}
 if(B.aname){B.aname.a+=bdt;if(B.aname.a>1.1)B.aname=null}
 if(B.cut)B.cut.t+=bdt;
 updPanels();
}
function drawBattle(){
 const sk=B.shake>0?[Math.round((Math.random()-.5)*5),Math.round((Math.random()-.5)*3)]:[0,0];ctx.save();ctx.translate(sk[0],sk[1]);
 drawBG(B.stage.bg==='throne'&&!B.isBoss?'tower':B.stage.bg,B.scroll);const sc=bsc();
 // magic circles
 for(const f of B.fx)if(f.type==='circle'){const p=upos(f.u.idx);const k=f.t/f.dur;ctx.globalAlpha=1-k;ctx.strokeStyle=f.col;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(p.x+f.u.ox,p.y,14+k*6,4+k*2,0,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.ellipse(p.x+f.u.ox,p.y,9+k*4,2.5+k,0,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1}
 // enemies
 for(const e of B.ens){if(!e.alive&&e.die>=1)continue;const dm=eDim(e),img=dm.img,w=dm.w,h=dm.h;ctx.imageSmoothingEnabled=!!dm.smooth;const ex=e.x+e.ox-e.enter*90;
  ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(Math.round(ex-w*.35),Math.round(e.y-2),Math.round(w*.7),4);
  const bob=e.art==='bat'||e.art==='wraith'||e.art==='wyvern'?Math.sin(time*5+e.x)*3:0;
  ctx.globalAlpha=(!e.alive?Math.max(0,1-e.die):1)*(e.art==='wraith'?.88:1);
  if(!e.alive){ctx.drawImage(img,0,0,dm.sw,dm.sh*(1-e.die*.5),Math.round(ex-w/2),Math.round(e.y-h+h*e.die*.5+bob),w,h*(1-e.die*.5));for(let i=0;i<3;i++){ctx.fillStyle='#b080ff';ctx.fillRect(ex+(Math.random()-.5)*w,e.y-Math.random()*h,2,2)}}
  else{ctx.drawImage(img,Math.round(ex-w/2),Math.round(e.y-h+bob),Math.round(w),Math.round(h));if(e.flash>0){ctx.globalAlpha=.6;ctx.globalCompositeOperation='lighter';ctx.drawImage(img,Math.round(ex-w/2),Math.round(e.y-h+bob),Math.round(w),Math.round(h));ctx.globalCompositeOperation='source-over'}}
  ctx.globalAlpha=1;ctx.imageSmoothingEnabled=false;
  if(e.alive&&(B.phase==='player'||e.boss))drawEHP(e,ex,w)
  if(e===B.target&&e.alive&&B.phase==='player'){const ty=e.y-h-6+Math.sin(time*8)*2;ctx.fillStyle='#ff3a5a';ctx.beginPath();ctx.moveTo(ex-5,ty-6);ctx.lineTo(ex+5,ty-6);ctx.lineTo(ex,ty);ctx.fill()}}
 // units
 B.units.forEach((u,i)=>{if(1)return;const p=upos(i);let x=p.x+u.ox,y=p.y;
  if(B.run&&!u.ko)x+=Math.sin(time*20+i)*1;
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(x,y,12,3,0,0,7);ctx.fill();
  if(u.flash>0&&Math.floor(u.flash*24)%2)return;
  const ai=art(u.id),hh=H*.21;
  if(u.ko){ctx.save();ctx.translate(Math.round(x),Math.round(y-4));ctx.rotate(-Math.PI/2);ctx.globalAlpha=.55;if(ai){ctx.imageSmoothingEnabled=true;const ww=hh*.8*ai.naturalWidth/ai.naturalHeight;ctx.drawImage(ai,-hh*.4,-ww/2,hh*.8,ww)}else{const img=chibi(u.pal,'down',0);ctx.drawImage(img,-11*sc,-10*sc,20*sc,22*sc)}ctx.restore();ctx.imageSmoothingEnabled=false;return}
  let pose=u.pose,fr=Math.floor(time*3+i)%2;if(B.run)fr=Math.floor(time*10)%2;
  if(pose==='win'){pose=Math.floor(time*3+i)%2?'cast':'';y-=Math.abs(Math.sin(time*6+i))*4}
  if(u.jump)y-=60;
  if(u.hp<u.mhp*.25&&!pose)y+=2;
  if(ai){const h2=hh*(pose==='atk'?1.04:1),ww=h2*ai.naturalWidth/ai.naturalHeight;if(pose==='cast'){const gr=ctx.createRadialGradient(x,y-h2*.5,2,x,y-h2*.5,h2*.6);gr.addColorStop(0,'rgba(160,220,255,.55)');gr.addColorStop(1,'rgba(160,220,255,0)');ctx.fillStyle=gr;ctx.fillRect(x-h2,y-h2*1.1,h2*2,h2*1.2)}ctx.imageSmoothingEnabled=true;ctx.drawImage(ai,x-ww/2,y-h2+(fr&&!pose?0:0),ww,h2);ctx.imageSmoothingEnabled=false}
  else{const img=chibi(u.pal,'left',pose?0:fr,pose==='atk'||pose==='cast'?pose:'');ctx.drawImage(img,Math.round(x-10*sc),Math.round(y-19*sc),Math.round(20*sc),Math.round(22*sc))}
  if(u.guard){ctx.strokeStyle='#9ad0ff';ctx.globalAlpha=.6;ctx.beginPath();ctx.arc(x,y-10*sc,12*sc,Math.PI*.6,Math.PI*1.4);ctx.stroke();ctx.globalAlpha=1}
  const bx=[];if(Object.keys(u.buffs).length)bx.push('#ffd04a');if(u.prov>0)bx.push('#ff8a3a');bx.forEach((c,k)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x+8*sc+k*4),Math.round(y-20*sc),3,3)});
  if(B.phase==='player'&&!u.acted&&u.queued&&Math.floor(time*4)%2){ctx.fillStyle='#7ae0ff';ctx.fillRect(Math.round(x-2),Math.round(y-22*sc),4,4)}
 });
 // particles
 for(const p of B.parts){ctx.globalAlpha=Math.max(0,Math.min(1,p.life/p.max*1.5));ctx.fillStyle=p.c;ctx.fillRect(Math.round(p.x),Math.round(p.y),p.s,p.s);if(p.arrow){ctx.fillRect(Math.round(p.x)-1,Math.round(p.y)+1,4,1)}}ctx.globalAlpha=1;
 for(const c of B.crys){const s=c.t<.3?3:2;ctx.fillStyle=Math.floor(time*20+c.x)%2?'#ffe04a':'#ff9a3a';ctx.beginPath();ctx.moveTo(c.x,c.y-s);ctx.lineTo(c.x+s,c.y);ctx.lineTo(c.x,c.y+s);ctx.lineTo(c.x-s,c.y);ctx.fill()}
 for(const f of B.fx){const k=f.t/f.dur;
  if(f.type==='slash'){ctx.strokeStyle='#fff';ctx.lineWidth=f.big?3:2;const L=f.big?22:14,dir=f.rot>.5?1:-1;ctx.globalAlpha=1-k;ctx.beginPath();ctx.moveTo(f.x-L,f.y-L*dir);const q=Math.min(1,k*3);ctx.lineTo(f.x-L+L*2*q,f.y-L*dir+L*2*dir*q);ctx.stroke();ctx.globalAlpha=1}
  else if(f.type==='bolt'){ctx.strokeStyle='#fff6a0';ctx.lineWidth=3;ctx.beginPath();let x=f.x+(Math.random()-.5)*10,y=0;ctx.moveTo(x,y);while(y<f.y){y+=10;x+=(Math.random()-.5)*14;ctx.lineTo(x,y)}ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.stroke()}
  else if(f.type==='ring'){ctx.strokeStyle=f.col;ctx.globalAlpha=1-k;ctx.lineWidth=3;ctx.beginPath();ctx.arc(f.x,f.y,f.inv?28*(1-k)+2:4+k*30,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1}}
 for(const p of B.pops){const by=p.t<.3?-Math.sin(p.t/.3*Math.PI)*9:0;ctx.globalAlpha=p.t>.75?(1-p.t)*4:1;drawText(p.txt,p.x,p.y+by-p.t*6,p.col,p.txt.length>4?9:11);if(p.sub)drawText(p.sub,p.x,p.y+by-p.t*6-10,'#ff9a3a',7)}ctx.globalAlpha=1;
 ctx.restore();
 // chain
 if(B.chain>1&&B.chainT<1.4){const s=1+Math.max(0,.3-B.chainT)*1.2;ctx.save();ctx.translate(8,56);ctx.scale(s,s);drawText(B.chain+' CHAIN',0,0,B.chain>=10?'#ffe04a':'#fff',14,'left');drawText('×'+Math.min(4,1+(B.chain-1)*.1).toFixed(1),2,13,'#ffb04a',9,'left');ctx.restore()}
 if(B.aname){const a=B.aname.a;ctx.globalAlpha=a>.9?(1.1-a)*5:1;const tw=Math.min(W-20,B.aname.t.length*11+24);ctx.fillStyle='rgba(8,12,40,.85)';ctx.fillRect(W/2-tw/2,26,tw,18);ctx.fillStyle='#e8c66a';ctx.fillRect(W/2-tw/2,26,tw,1);ctx.fillRect(W/2-tw/2,43,tw,1);drawText(B.aname.t,W/2,39,'#fff',11);ctx.globalAlpha=1}
 if(B.banner){const a=B.banner.a;const x=a<.3?W*(1-a/.3)*.8:a>1.6?-W*(a-1.6)/.3*.8:0;ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(0,H*.42,W,28);drawText(B.banner.t,W/2+x,H*.42+20,'#ffe680',B.banner.t.length>10?13:17)}
 if(B.cut){const t=B.cut.t,k=Math.min(1,t/.25);ctx.fillStyle=`rgba(0,0,0,${.6*k})`;ctx.fillRect(0,0,W,H);const y0=H*.32;ctx.save();ctx.beginPath();ctx.moveTo(0,y0+10);ctx.lineTo(W,y0-10);ctx.lineTo(W,y0+80);ctx.lineTo(0,y0+100);ctx.closePath();const lg=ctx.createLinearGradient(0,y0,W,y0);lg.addColorStop(0,'#ff9a3a');lg.addColorStop(.5,'#ffe04a');lg.addColorStop(1,'#ff7ad8');ctx.fillStyle=lg;ctx.globalAlpha=.85*k;ctx.fill();ctx.clip();ctx.globalAlpha=1;
  for(let i=0;i<14;i++){ctx.fillStyle='rgba(255,255,255,.5)';ctx.fillRect(((i*37+t*600)%(W+40))-20,y0+(i*13)%90,30,1)}
  const ca=art(B.cut.u.id);const xx=W*.66-Math.max(0,.3-t)*300;if(ca){ctx.imageSmoothingEnabled=true;const ch=150,cw=ch*ca.naturalWidth/ca.naturalHeight;ctx.drawImage(ca,xx-cw/2,y0-40,cw,ch);ctx.imageSmoothingEnabled=false}else{const img=chibi(B.cut.u.pal,'left',0,'atk');ctx.drawImage(img,xx-50,y0-14,100,110)}ctx.restore();
  drawText(B.cut.name,W*.36,y0+60,'#fff',13);drawText('LIMIT BURST',W*.36,y0+40,'#3a1a00',9)}
}

/* ================= HOME / TITLE CANVAS ================= */
const STARS=Array.from({length:70},()=>[Math.random(),Math.random(),Math.random()]);
function drawHome(){drawBG('home',time*6);const lead=uById(P.party[0]);
 ctx.fillStyle='#2a2a5a';const cx=W*.5,by=H*.36;ctx.fillRect(cx-30,by-46,60,46);for(const dx of[-38,24])ctx.fillRect(cx+dx,by-64,14,64);ctx.fillRect(cx-8,by-80,16,34);ctx.fillStyle='#3a3a7a';for(const dx of[-38,24])ctx.fillRect(cx+dx,by-68,14,4);ctx.fillStyle='#ffe08a';for(const[dx,dy]of[[-20,-30],[10,-30],[-4,-60],[-34,-50],[28,-50]])if(Math.sin(time*2+dx)>-.6)ctx.fillRect(cx+dx,by+dy,3,4);ctx.fillStyle='#c83a3a';ctx.fillRect(cx-1,by-92,2,12);ctx.fillRect(cx+1,by-92,8,5);
 const cy=H*.2+Math.sin(time*1.5)*3;const gl=ctx.createRadialGradient(W*.18,cy,2,W*.18,cy,30);gl.addColorStop(0,'rgba(140,220,255,.6)');gl.addColorStop(1,'rgba(140,220,255,0)');ctx.fillStyle=gl;ctx.fillRect(0,0,W,H);ctx.fillStyle='#7ae8ff';ctx.beginPath();ctx.moveTo(W*.18,cy-12);ctx.lineTo(W*.18+7,cy);ctx.lineTo(W*.18,cy+12);ctx.lineTo(W*.18-7,cy);ctx.fill();
 if(lead){ctx.imageSmoothingEnabled=true;const xs=[.16,.84,.3,.7,.03];P.party.slice(1,6).forEach((uid,i)=>{const u=uById(uid);const a2=u&&art(u.id);if(!a2)return;const h=H*.3,w=h*a2.naturalWidth/a2.naturalHeight;ctx.globalAlpha=.92;ctx.drawImage(a2,W*xs[i]-w/2,H*.64-h-(i>1?14:0),w,h)});ctx.globalAlpha=1;
  const a=art(lead.id);if(a){const h=H*.46,w=h*a.naturalWidth/a.naturalHeight;ctx.drawImage(a,W*.5-w/2,H*.7-h+Math.sin(time*2)*1.5,w,h)}ctx.imageSmoothingEnabled=false;
  ctx.globalAlpha=.9;drawText(UNITS[lead.id].name+'  Lv'+lead.lv,W*.5,H*.73,'#fff',10);ctx.globalAlpha=1}}
function drawTitle(){const g=ctx;let l=g.createLinearGradient(0,0,0,H);l.addColorStop(0,'#05061a');l.addColorStop(.7,'#1a1650');l.addColorStop(1,'#4a2a6a');g.fillStyle=l;g.fillRect(0,0,W,H);
 for(const[x,y,s]of STARS){g.globalAlpha=.4+.6*Math.abs(Math.sin(time*(1+s*2)+s*10));g.fillStyle='#fff';g.fillRect(Math.floor(x*W),Math.floor(y*H*.8),s>.85?2:1,s>.85?2:1)}g.globalAlpha=1;
 g.fillStyle='#120e30';for(let x=0;x<W;x+=2){const h=20+Math.sin(x*.04)*10+Math.sin(x*.11)*5;g.fillRect(x,H-h,2,h)}
 const cx=W/2,cy=H*.3+Math.sin(time*1.5)*4,s=24;const gl=g.createRadialGradient(cx,cy,4,cx,cy,80);gl.addColorStop(0,'rgba(255,160,240,.45)');gl.addColorStop(1,'rgba(140,200,255,0)');g.fillStyle=gl;g.fillRect(0,0,W,H);
 const cols=['#ff7ad8','#ffe04a','#7ae8ff','#8aff9a','#b080ff'];for(let i=0;i<5;i++){const a=time*.8+i*Math.PI*2/5;const x=cx+Math.cos(a)*44,y=cy+Math.sin(a)*14;g.fillStyle=cols[i];g.beginPath();g.moveTo(x,y-7);g.lineTo(x+4,y);g.lineTo(x,y+7);g.lineTo(x-4,y);g.fill()}
 g.fillStyle='#5ab4ff';g.beginPath();g.moveTo(cx,cy-s*1.4);g.lineTo(cx+s*.7,cy);g.lineTo(cx,cy+s*1.4);g.lineTo(cx-s*.7,cy);g.fill();g.fillStyle='#bfe6ff';g.beginPath();g.moveTo(cx,cy-s*1.4);g.lineTo(cx+s*.7,cy);g.lineTo(cx,cy);g.fill();
 g.textAlign='center';const ty=H*.3+62;g.font='bold 21px DotGothic16, monospace';g.fillStyle='#000';g.fillText('アストラル',cx+2,ty+2);g.fillText('クロニクル',cx+2,ty+27);const tg=g.createLinearGradient(0,ty-20,0,ty+30);tg.addColorStop(0,'#fff6c0');tg.addColorStop(1,'#e0a830');g.fillStyle=tg;g.fillText('アストラル',cx,ty);g.fillText('クロニクル',cx,ty+25);
 drawText('B R A V E',cx,ty+46,'#ff9ae8',13);drawText('〜ソロモン七十二柱〜',cx,ty+62,'#cfd8ff',8);
 if(Math.floor(time*2)%2)drawText('TAP TO START',cx,H*.86,'#fff',11)}

/* ================= SUMMON ================= */
const scv=$('#scv'),sctx=scv.getContext('2d');let SH=400;
function sresize(){const r=$('#wrap').getBoundingClientRect();SH=Math.round(240*r.height/Math.max(1,r.width));scv.width=240;scv.height=SH;sctx.imageSmoothingEnabled=false}
function renderSummon(){const el=$('#summon');el.innerHTML=`<h2>召喚</h2><div class="sban"><canvas id="banCv" width="160" height="100"></canvas><div class="tx"><b>星詠みの巫女 ステラ ＆ 魔剣士 ゼノン</b><small>ピックアップ召喚　★5出現率 5%（うち50%がピックアップ）</small></div></div>
 <div class="sbtns"><button class="s1" id="s1">1回召喚<small>魔石 250</small></button><button class="s10" id="s10">10連召喚<small>魔石 2,500　★4以上1体確定</small></button></div>
 <div class="rates">提供割合　★5：5%　★4：25%　★3：70%<br>★5ラインナップ：${BANNER.pool[5].map(i=>UNITS[i].name).join('・')}<br>★4ラインナップ：${BANNER.pool[4].map(i=>UNITS[i].name).join('・')}<br>同じユニットが出ると「限界突破」でレベル上限が+5されます（最大4回）。</div>`;
 const bc=$('#banCv').getContext('2d');bc.imageSmoothingEnabled=false;const lg=bc.createLinearGradient(0,0,160,100);lg.addColorStop(0,'#3a1660');lg.addColorStop(1,'#0a4a8a');bc.fillStyle=lg;bc.fillRect(0,0,160,100);for(let i=0;i<40;i++){bc.fillStyle=`rgba(255,255,255,${Math.random()*.8})`;bc.fillRect(Math.random()*160,Math.random()*100,1,1)}
 const rg=bc.createRadialGradient(80,50,4,80,50,70);rg.addColorStop(0,'rgba(255,220,120,.5)');rg.addColorStop(1,'rgba(255,220,120,0)');bc.fillStyle=rg;bc.fillRect(0,0,160,100);
 bc.drawImage(chibi(UNITS.xenon.pal,'down',0),88,10,60,66);bc.drawImage(chibi(UNITS.stella.pal,'down',0),26,6,66,72);
 $('#s1').onclick=()=>doSummon(1);$('#s10').onclick=()=>doSummon(10)}
function roll(guar){let r=Math.random();let rar=r<.05?5:r<.3?4:3;if(guar&&rar<4)rar=Math.random()<.16?5:4;let id;if(rar===5&&Math.random()<.5)id=pick(BANNER.feat);else id=pick(BANNER.pool[rar]);return id}
async function doSummon(n){initAudio();const cost=n===1?250:2500;if(P.gems<cost){SFX.ng();await modal(`<h3>魔石が足りません</h3><p style="text-align:center">必要：${fmt(cost)}　所持：${fmt(P.gems)}\n魔石はクエスト初回クリアやログインボーナスで手に入ります。</p>`);return}
 const c=await modal(`<h3>${n===1?'1回召喚':'10連召喚'}</h3><p style="text-align:center">魔石 ${fmt(cost)} を使って召喚しますか？\n（所持 ${fmt(P.gems)}）</p>`,[{l:'やめる'},{l:'召喚する',c:'g'}]);if(c!==1)return;
 P.gems-=cost;const res=[];for(let i=0;i<n;i++){const id=roll(n===10&&i===9&&!res.some(r=>UNITS[r.id].rar>=4));const a=addUnit(id);res.push({id,dup:a.dup,lbUp:a.lbUp})}save();updTop();
 await playSummon(res);
 await modal(`<h3>召喚結果</h3><div class="grid">${res.map(r=>{const u=P.units.find(x=>x.id===r.id);return cardHTML(u,{nw:!r.dup})}).join('')}</div><p style="font-size:12px;color:#9ab;margin-top:8px">${res.some(r=>r.dup)?'重複したユニットは限界突破しました（上限到達時は経験値の結晶・中に変換）':''}</p>`,[{l:'OK',c:'g'}]);
 renderSummon()}
function playSummon(res){return new Promise(resolve=>{const el=$('#sum');el.style.display='block';sresize();playBGM('summon',true);let i=0,t=0,stage=0,skip=false,last=performance.now(),raf=0;
 const sp=[];for(let k=0;k<80;k++)sp.push([Math.random()*240,Math.random()*SH,Math.random()]);
 const next=()=>{i++;t=0;played={};if(i>=res.length||skip){cancelAnimationFrame(raf);el.style.display='none';el.onclick=null;playBGM('summon',true);resolve()}};
 el.onclick=e=>{if(e.target.id==='sSkip')return;if(t>2.6)next();else if(t>.2)t=Math.max(t,2.1)};
 $('#sSkip').onclick=e=>{e.stopPropagation();skip=true;next()};
 let played={};
 const frame=now=>{const dt=Math.min(.05,(now-last)/1000);last=now;t+=dt;const r=res[i];if(!r)return;const d=UNITS[r.id],rar=d.rar,g=sctx;
  g.fillStyle='#04030c';g.fillRect(0,0,240,SH);for(const[x,y,s]of sp){g.globalAlpha=.3+s*.7;g.fillStyle='#fff';g.fillRect(x,(y+t*20*s)%SH,1,1)}g.globalAlpha=1;
  const col=rar===5?`hsl(${(t*200)%360},90%,65%)`:rar===4?'#ffd04a':'#5aa8ff';const fake=rar>3&&(i%3===1);const showCol=fake&&t<1.3?'#5aa8ff':col;
  const cx=120,cy=SH*.45;
  if(t<1.3){if(!played.f){played.f=1;SFX.fall()}const k=Math.min(1,t/1.2);const y=-20+(cy+20)*k*k;g.fillStyle=showCol;g.globalAlpha=.4;g.fillRect(cx-1,y-80*k,2,80*k);g.globalAlpha=1;g.beginPath();g.moveTo(cx,y-12);g.lineTo(cx+7,y);g.lineTo(cx,y+12);g.lineTo(cx-7,y);g.fill();g.fillStyle='#fff';g.fillRect(cx-1,y-6,2,6)}
  else if(t<2.2){if(!played.b){played.b=1;SFX.boom(rar)}const k=(t-1.3)/.9;g.fillStyle=`rgba(255,255,255,${Math.max(0,1-k*2)})`;g.fillRect(0,0,240,SH);for(let j=0;j<3;j++){g.strokeStyle=col;g.lineWidth=3-j;g.globalAlpha=1-k;g.beginPath();g.ellipse(cx,cy,(20+k*120)*(1+j*.3),(8+k*40)*(1+j*.3),0,0,Math.PI*2);g.stroke()}g.globalAlpha=1;
   for(let j=0;j<16;j++){const a=j/16*Math.PI*2+k;g.strokeStyle=col;g.globalAlpha=(1-k)*.8;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(a)*200*k,cy+Math.sin(a)*200*k);g.stroke()}g.globalAlpha=1}
  else{const k=Math.min(1,(t-2.2)/.4);const rg=g.createRadialGradient(cx,cy,4,cx,cy,110);rg.addColorStop(0,rar===5?'rgba(255,200,255,.6)':rar===4?'rgba(255,220,120,.5)':'rgba(120,180,255,.4)');rg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=rg;g.fillRect(0,0,240,SH);
   for(let j=0;j<12;j++){const a=j/12*Math.PI*2+t*.3;g.strokeStyle=col;g.globalAlpha=.25;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(a)*240,cy+Math.sin(a)*240);g.stroke()}g.globalAlpha=1;
   const img=chibi(d.pal,'down',Math.floor(t*2)%2);const s=5*k;if(s>0)g.drawImage(img,Math.round(cx-10*s),Math.round(cy+30-22*s),Math.round(20*s),Math.round(22*s));
   for(let j=0;j<rar;j++){const st=2.5+j*.18;if(t>st){if(!played['s'+j]){played['s'+j]=1;SFX.star()}const x=cx-(rar-1)*9+j*18;drawStar(g,x,cy+48,6,rar===5?`hsl(${(j*60+t*120)%360},90%,65%)`:rar===4?'#ffd04a':'#c88a5a')}}
   if(t>2.5+rar*.18){g.textAlign='center';g.font='bold 15px DotGothic16, monospace';g.fillStyle='#000';g.fillText(d.name,cx+1,cy+77);g.fillStyle='#fff';g.fillText(d.name,cx,cy+76);g.font='9px DotGothic16, monospace';g.fillStyle='#cfd8ff';g.fillText(d.job,cx,cy+90);
    if(!r.dup){g.fillStyle='#ff3a7a';g.fillRect(cx-18,cy-82,36,13);g.fillStyle='#fff';g.font='bold 9px DotGothic16, monospace';g.fillText('NEW!',cx,cy-72)}else{g.fillStyle='#e8c66a';g.font='bold 9px DotGothic16, monospace';g.fillText(r.lbUp?'限界突破！':'結晶に変換',cx,cy-72)}
    if(Math.floor(t*2)%2){g.fillStyle='#aab';g.font='8px DotGothic16, monospace';g.fillText(`${i+1}/${res.length}　タップで次へ`,cx,SH-24)}}}
  raf=requestAnimationFrame(frame)};
 raf=requestAnimationFrame(frame)})}
function drawStar(g,x,y,r,col){g.fillStyle=col;g.beginPath();for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,rr=k%2?r*.45:r;g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}g.closePath();g.fill();g.strokeStyle='#0008';g.lineWidth=1;g.stroke()}

/* ================= 3D DUNGEON (oblique WebGL, random encounters) ================= */
const DUN_OLD=[
 {name:'迷いの樹海',n:5,theme:'forest',seed:11,loot:[['potion',3],['ether',1],['gil',500],['exs',2]],gl:[['stella','この奥から……ヴィネの気配がします！'],['allen','樹海を抜けたぞ。行こう！']]},
 {name:'灼熱の坑道',n:6,theme:'cave',seed:23,loot:[['hipotion',1],['ether',2],['gil',1200],['exs',3]],gl:[['stella','炎の奥に、アモンの気配……！'],['gard','熱いのは嫌いじゃねえ！']]},
 {name:'沈没船の迷宮',n:6,theme:'sea',seed:37,loot:[['hipotion',2],['feather',1],['gil',2500],['exm',1]],gl:[['stella','深海の門は、この先です。'],['fio','水の音……ここから先は海の底だね。']]},
 {name:'竜骨の洞',n:7,theme:'mountain',seed:41,loot:[['hipotion',2],['ether',3],['gil',4000],['exm',1]],gl:[['stella','竜の巣……プルソンのラッパが聞こえます。']]},
 {name:'亡国の地下墓所',n:7,theme:'ruins',seed:53,loot:[['feather',2],['hipotion',3],['gil',6000],['exm',2]],gl:[['stella','玉座跡はこの真上です。バラムが待っています。']]},
 {name:'堕天の回廊',n:8,theme:'temple',seed:67,loot:[['elixir',1],['exm',2],['gil',8000],['feather',2]],gl:[['stella','神殿の最奥……パイモンの歌が聞こえます。']]},
 {name:'奈落の螺旋',n:8,theme:'abyss',seed:79,loot:[['elixir',2],['exl',1],['gil',12000],['exm',3]],gl:[['stella','この扉の向こうに……バアルが。'],['allen','みんな、準備はいいか！']]}
];
const DXY=[[1,0],[0,1],[-1,0],[0,-1]],DNAME=['東','南','西','北'];
function srng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function bfsFrom(w,h,g,start,block){const dist=new Int32Array(w*h).fill(-1),prev=new Int32Array(w*h).fill(-1),q=[start];dist[start]=0;let qi=0;while(qi<q.length){const c=q[qi++];const x=c%w,y=(c/w)|0;for(const[dx,dy]of DXY){const nc=(y+dy)*w+x+dx;if(!g[nc]&&dist[nc]<0&&nc!==block){dist[nc]=dist[c]+1;prev[nc]=c;q.push(nc)}}}return{dist,prev}}
const MAZES={};
function genMaze(ci){if(MAZES[ci])return MAZES[ci];const def=DUN[ci],n=def.n,r=srng(def.seed),w=n*2+1,h=w,g=new Uint8Array(w*h).fill(1);
 const st=[[1,1]];g[w+1]=0;while(st.length){const[x,y]=st[st.length-1];const nb=DXY.map(([dx,dy])=>[x+dx*2,y+dy*2,dx,dy]).filter(([nx,ny])=>nx>0&&ny>0&&nx<w-1&&ny<h-1&&g[ny*w+nx]);if(!nb.length){st.pop();continue}const[nx,ny,dx,dy]=nb[Math.floor(r()*nb.length)];g[(y+dy)*w+x+dx]=0;g[ny*w+nx]=0;st.push([nx,ny])}
 for(let k=0;k<Math.floor(n/2);k++){const x=1+Math.floor(r()*(w-2)),y=1+Math.floor(r()*(h-2));if(g[y*w+x]&&((x%2===0&&y%2===1)||(x%2===1&&y%2===0)))g[y*w+x]=0}
 const S=w+1;const{dist,prev}=bfsFrom(w,h,g,S,-1);
 let G=0;for(let i=0;i<w*h;i++)if(dist[i]>dist[G])G=i;
 const path=[];for(let c=G;c>=0;c=prev[c])path.push(c);path.reverse();const onP=new Set(path);
 let spring=path[Math.floor(path.length*.5)];
 let gate=-1;for(let k=Math.floor(path.length*.85);k>Math.floor(path.length*.58);k--){const c=path[k];if(c===spring||c===G)continue;if(bfsFrom(w,h,g,S,c).dist[G]<0){gate=c;break}}
 const pre=gate>=0?bfsFrom(w,h,g,S,gate).dist:dist;
 const deg=i=>{const x=i%w,y=(i/w)|0;return DXY.filter(([dx,dy])=>!g[(y+dy)*w+x+dx]).length};
 const free=i=>!g[i]&&i!==S&&i!==G&&i!==spring&&i!==gate;
 const cand=[];for(let i=0;i<w*h;i++)if(free(i)&&!onP.has(i))cand.push(i);cand.sort((a,b)=>(deg(a)-deg(b))||(dist[b]-dist[a]));
 const far=(c,list)=>list.every(o=>Math.abs(o%w-c%w)+Math.abs(((o/w)|0)-((c/w)|0))>2);
 let key=-1;for(const c of cand)if(pre[c]>=0&&dist[c]>4){key=c;break}if(key<0&&gate>=0){for(let k=Math.floor(path.length*.3);k<path.length;k++){const c=path[k];if(free(c)&&pre[c]>=0){key=c;break}}}
 const chests=[];for(const c of cand){if(chests.length>=def.loot.length)break;if(c!==key&&far(c,chests.concat(key>=0?[key]:[])))chests.push(c)}for(const c of cand){if(chests.length>=def.loot.length)break;if(c!==key&&!chests.includes(c))chests.push(c)}
 const T=new Uint8Array(w*h);chests.forEach(c=>T[c]=2);T[spring]=3;T[G]=4;if(gate>=0)T[gate]=5;if(key>=0)T[key]=6;
 const bosses=[{c:G,si:DUN[ci].si}];const bossAt=new Int8Array(w*h).fill(-1);bosses.forEach(b=>bossAt[b.c]=b.si);
 return MAZES[ci]={w,h,g,T,S,G,chests,spring,gate,key,path,dist,len:path.length,bosses,bossAt}}
/* ---- realistic procedural textures ---- */
const TX=128;
function pnoise(seed,per){const r=srng(seed),v=new Float32Array(per*per);for(let i=0;i<v.length;i++)v[i]=r();const at=(x,y)=>v[(((y%per)+per)%per)*per+(((x%per)+per)%per)];return(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;const a=at(xi,yi),b=at(xi+1,yi),c=at(xi,yi+1),d=at(xi+1,yi+1);const u=xf*xf*(3-2*xf),w=yf*yf*(3-2*yf);return a+(b-a)*u+(c-a)*w+(a-b-c+d)*u*w}}
function fbmMaker(seed){const L=[4,8,16,32,64].map((p,i)=>[pnoise(seed+i*101,p),p,Math.pow(.55,i)]);const tot=L.reduce((a,l)=>a+l[2],0);return(x,y)=>{let s=0;for(const[n,p,a]of L)s+=n(x/TX*p,y/TX*p)*a;return s/tot}}
const mixc=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t],mulc=(a,k)=>[a[0]*k,a[1]*k,a[2]*k];
const pk=(r,g,b)=>0xff000000|(clamp(b|0,0,255)<<16)|(clamp(g|0,0,255)<<8)|clamp(r|0,0,255);
const DPAL={
 ruins:{pa:[176,150,104],pb:[150,152,124],mold:[78,98,80],stone:[150,138,112],cob:[128,132,120],fog:[30,50,46],amb:[.17,.22,.21],lamp:[1.0,.72,.38]},
 forest:{pa:[140,146,100],pb:[110,130,96],mold:[54,96,52],stone:[120,126,100],cob:[100,116,92],fog:[52,84,60],amb:[.36,.5,.34],lamp:[1.0,.8,.45]},
 cave:{pa:[170,120,84],pb:[146,104,78],mold:[96,66,50],stone:[140,100,76],cob:[120,96,80],fog:[44,24,16],amb:[.2,.14,.11],lamp:[1.0,.6,.28]},
 sea:{pa:[132,148,142],pb:[110,132,134],mold:[60,96,96],stone:[116,128,126],cob:[100,116,118],fog:[16,36,48],amb:[.13,.19,.23],lamp:[.95,.8,.5]},
 mountain:{pa:[176,118,86],pb:[150,104,82],mold:[100,70,58],stone:[150,104,84],cob:[124,96,84],fog:[40,22,18],amb:[.2,.14,.12],lamp:[1.0,.62,.3]},
 temple:{pa:[178,166,184],pb:[150,140,170],mold:[96,80,124],stone:[160,150,172],cob:[120,112,136],fog:[30,22,44],amb:[.18,.15,.24],lamp:[1.0,.78,.55]},
 abyss:{pa:[126,64,58],pb:[100,50,52],mold:[60,22,32],stone:[110,60,60],cob:[90,50,52],fog:[26,6,10],amb:[.17,.08,.09],lamp:[1.0,.45,.25]}
};
function texWall(pal,variant,seed,dark){const t=new Uint32Array(TX*TX),em=new Uint8Array(TX*TX);const f1=fbmMaker(seed),f2=fbmMaker(seed+7),f3=fbmMaker(seed+13),r=srng(seed+99);
 for(let y=0;y<TX;y++)for(let x=0;x<TX;x++){const n1=f1(x,y),n2=f2(x,y),n3=f3(x,y);let c=mixc(pal.pa,pal.pb,clamp((n1-.35)*2.2,0,1));
  c=mulc(c,.84+f2(x*.25,y*3)*.32);const mold=clamp((n2+y/TX*.35-.6)*4,0,1);c=mixc(c,pal.mold,mold*.75);
  if(n3>.64&&y<108){const row=Math.floor(y/14),ox=(row%2)*12,bx=(x+ox)%24,by=y%14;const id=row*7+Math.floor((x+ox)/24)*3;c=(bx<2||by<2)?mulc(pal.stone,.42):mulc(pal.stone,.78+(id%5)*.06);if(n3<.67)c=mulc(c,.7)}
  if(y>=108){c=mulc(mixc(pal.stone,pal.mold,.25),.72);if(y<110||x%32<2)c=mulc(c,.6);if(y===110)c=mulc(pal.stone,1.05)}
  c=mulc(c,.9+r()*.18);if(dark)c=mulc(c,dark);
  if(variant==='arch'){const dx=x-64,inA=x>=34&&x<=94&&y<=107&&(y>=60||Math.hypot(dx,y-60)<=30),ring=x>=28&&x<=100&&y<=107&&(y>=60?(x<34||x>94):Math.hypot(dx,y-60)<=36)&&!inA;
   if(ring){const sg=Math.floor(Math.atan2(y-60,dx)*5)+(y>60?Math.floor(y/12):0);c=mulc(pal.stone,.95+(sg%3)*.07);if((x+y)%11===0)c=mulc(c,.7)}
   if(inA){const depth=y<60?1-(60-y)/30:1;c=mulc(mixc(c,pal.mold,.35),.38+.08*depth);if(y>100)c=mulc(pal.stone,.5)}}
  if(variant==='door'){const fr=x>=38&&x<=90&&y>=16&&y<=108,inn=x>=44&&x<=84&&y>=22&&y<=108;if(fr&&!inn){c=mulc(pal.stone,1.0+((y>>3)%2)*.06)}
   if(inn){const pl=(x-44)%10;c=pl<1?[28,18,12]:[78+((x>>2)%3)*6,52,34];c=mulc(c,.8+f1(x*3,y*.4)*.4);if(y%30<2)c=[40,30,22];if(x>=76&&x<=79&&y>=60&&y<=70)c=[30,30,34]}}
  if(variant==='lamp'){const d=Math.hypot(x-64,y-46);c=mixc(c,mulc(c,1.15),clamp(1-d/40,0,1)*.6);if(Math.hypot(x-64,y-74)<6||(Math.abs(x-64)<2&&y>58&&y<74)||(y>=58&&y<=61&&x>56&&x<72))c=[34,30,28];
   if(Math.abs(x-64)<=6&&y>=36&&y<=56){const gl=1-Math.abs(x-64)/7;c=[255,200+gl*50,110+gl*110];em[y*TX+x]=1}if(Math.abs(x-64)<=4&&y>=31&&y<36)c=[40,34,30]}
  t[y*TX+x]=pk(c[0],c[1],c[2])}
 for(let k=0;k<3;k++){let x=r()*TX,y=r()*60;for(let i=0;i<60;i++){x+=(r()-.5)*2.4;y+=r()*1.3;const X=(x|0)&127,Y=(y|0)&127;const o=t[Y*TX+X];t[Y*TX+X]=pk((o&255)*.55,((o>>8)&255)*.55,((o>>16)&255)*.55)}}
 return{t,em}}
function texCobble(pal,seed){const t=new Uint32Array(TX*TX),r=srng(seed),N=8,cs=TX/N,pts=[],tint=[];for(let i=0;i<N*N;i++){pts.push([r()*cs*.8+cs*.1,r()*cs*.8+cs*.1]);tint.push([.8+r()*.35,r()])}const fn=fbmMaker(seed+3);
 for(let y=0;y<TX;y++)for(let x=0;x<TX;x++){const cx=Math.floor(x/cs),cy=Math.floor(y/cs);let d1=1e9,d2=1e9,id=0;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const gx=cx+i,gy=cy+j,wx=((gx%N)+N)%N,wy=((gy%N)+N)%N;const p=pts[wy*N+wx];const px=gx*cs+p[0],py=gy*cs+p[1];const d=Math.hypot(x-px,y-py);if(d<d1){d2=d1;d1=d;id=wy*N+wx}else if(d<d2)d2=d}
  let c;if(d2-d1<1.8){c=mixc(mulc(pal.cob,.32),pal.mold,.35)}else{const[k,tn]=tint[id];c=mulc(mixc(pal.cob,tn>.7?pal.pa:pal.cob,.35),k*(.86+clamp(1-d1/12,0,1)*.28));c=mulc(c,.88+fn(x,y)*.24+(r()-.5)*.08)}
  t[y*TX+x]=pk(c[0],c[1],c[2])}return{t,em:new Uint8Array(TX*TX)}}
function texGate(){const t=new Uint32Array(TX*TX);for(let y=0;y<TX;y++)for(let x=0;x<TX;x++){let c=[10,12,12];const bx=x%16;if(bx<5)c=[60-bx*6,62-bx*6,66-bx*6].map(v=>v+30);if([18,19,20,21,62,63,64,65,106,107,108,109].includes(y))c=[78,76,80];if(bx<5&&[18,62,106].some(v=>Math.abs(y-v-1)<2)&&bx===2)c=[140,130,110];t[y*TX+x]=pk(...c)}return{t,em:new Uint8Array(TX*TX)}}
function faceKind(fx,fy,k){const h=((fx*73856093)^(fy*19349663)^((k+1)*83492791))>>>0;const v=h%23;return v<3?'lamp':v<5?'arch':v===5?'door':(h>>5)%2?'plain2':'plain'}

let D=null;
const dcv=$('#dcv');
/* ---- WebGL oblique renderer v2 ---- */
let GL=null,GLP=null,GLB={},GLT={},D_ATLAS=null;
const dov=$('#dov'),octx=dov.getContext('2d');let OW=300,OH=480;
function dResize(){const r=$('#stage').getBoundingClientRect();if(!r.width)return;const dpr=Math.min(2,window.devicePixelRatio||1);dcv.width=Math.round(r.width*dpr);dcv.height=Math.round(r.height*dpr);OW=300;OH=Math.round(300*r.height/r.width);dov.width=OW;dov.height=OH;if(GL)GL.viewport(0,0,dcv.width,dcv.height)}
const VS=`attribute vec3 aP;attribute vec3 aN;attribute vec2 aU;attribute float aA;uniform mat4 uVP;varying vec3 vP;varying vec3 vN;varying vec2 vU;varying float vA;void main(){vP=aP;vN=aN;vU=aU;vA=aA;gl_Position=uVP*vec4(aP,1.);}`;
const FS=`precision mediump float;varying vec3 vP;varying vec3 vN;varying vec2 vU;varying float vA;uniform sampler2D uT;uniform vec3 uAmb;uniform vec3 uFog;uniform vec3 uLc;uniform vec3 uPl;uniform vec3 uL[12];uniform int uLn;uniform float uFl;uniform float uMode;uniform vec2 uCut;uniform vec4 uTint;uniform float uTop;uniform vec2 uFogR;uniform float uSun;uniform float uDith;uniform float uCutOn;uniform float uTime;
void main(){vec4 t=texture2D(uT,vU);
 if(uMode>5.5){gl_FragColor=vec4(t.rgb*uTint.rgb,t.a*uTint.a);return;}
 if(uMode>4.5){if(t.a<.45)discard;gl_FragColor=uTint;return;}
 if(uMode>3.5){gl_FragColor=vec4(0.,0.,0.,t.a*.55);return;}
 if(uMode>2.5){gl_FragColor=vec4(t.rgb*uTint.rgb*t.a*uTint.a,1.);return;}
 if(uMode>1.5){if(t.a<.45)discard;if(uDith>.5&&vP.z>uCut.y+.55&&vP.z<uCut.y+3.2&&abs(vP.x-uCut.x)<1.7&&vP.y>.25){if(mod(floor(gl_FragCoord.x)+floor(gl_FragCoord.y),2.)<1.)discard;}}
 if(uMode>.5&&uMode<1.5&&uCutOn>.5){if(vP.z>uCut.y+.45&&vP.z<uCut.y+2.6&&abs(vP.x-uCut.x)<1.6&&vP.y>.12){if(mod(floor(gl_FragCoord.x)+floor(gl_FragCoord.y),2.)<1.)discard;}}
 vec3 n=normalize(vN);float em=uMode<1.5?step(t.a,.6):0.;
 vec3 L=uAmb;
 for(int i=0;i<12;i++){if(i>=uLn)break;vec3 d=uL[i]-vP;float dd=dot(d,d);float nd=uMode>1.5?.8:max(dot(n,normalize(d)),0.)*.75+.25;L+=uLc*(1.6/(1.+dd*1.5))*nd*uFl;}
 vec3 d=uPl-vP;float dd=dot(d,d);float nd=uMode>1.5?.6:max(dot(n,normalize(d)),0.)*.55+.45;L+=vec3(1.,.86,.68)*(.85/(1.+dd*.42))*nd;
 L+=vec3(1.,.95,.84)*uSun*(uMode>1.5?.75:max(dot(n,normalize(vec3(.35,1.,.6))),0.));
 if(uMode>1.5&&uMode<2.5)L=uAmb+vec3(uSun>0.?.42:.62)+vec3(1.,.95,.84)*uSun*.75;
 vec3 c=t.rgb*L*vA;c=c*1.3/(1.+c*.38);c=mix(c,t.rgb*1.15,em);
 if(uMode<1.5&&n.y>.5&&vP.y>.5)c*=uTop;
 if(uSun>0.&&uMode<1.5){float cl=sin(vP.x*.31+uTime*.11)*sin(vP.z*.23-uTime*.07)+sin((vP.x+vP.z)*.17+uTime*.05);c*=1.-.14*smoothstep(.5,1.4,cl);}
 if(uSun>0.)c*=vec3(1.04,1.,.95);
 float vis=1.-smoothstep(uFogR.x,uFogR.y,distance(vP.xz,uCut));
 gl_FragColor=vec4(mix(uFog,c,vis),1.);}`;
function glInit(){if(GL)return true;GL=dcv.getContext('webgl',{antialias:true,alpha:false})||dcv.getContext('experimental-webgl');if(!GL)return false;const g=GL;
 const sh=(t,s)=>{const o=g.createShader(t);g.shaderSource(o,s);g.compileShader(o);if(!g.getShaderParameter(o,g.COMPILE_STATUS))console.error(g.getShaderInfoLog(o));return o};
 const p=g.createProgram();g.attachShader(p,sh(g.VERTEX_SHADER,VS));g.attachShader(p,sh(g.FRAGMENT_SHADER,FS));g.linkProgram(p);g.useProgram(p);GLP={p,aP:g.getAttribLocation(p,'aP'),aN:g.getAttribLocation(p,'aN'),aU:g.getAttribLocation(p,'aU'),aA:g.getAttribLocation(p,'aA')};
 for(const u of['uVP','uT','uAmb','uFog','uLc','uPl','uL','uLn','uFl','uMode','uCut','uTint','uTop','uFogR','uSun','uDith','uCutOn','uTime'])GLP[u]=g.getUniformLocation(p,u);
 g.enable(g.DEPTH_TEST);g.clearColor(0,0,0,1);GLB.dyn=g.createBuffer();return true}
function glTexFromPixels(u8,w,h){const g=GL,t=g.createTexture();g.bindTexture(g.TEXTURE_2D,t);g.pixelStorei(g.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);g.texImage2D(g.TEXTURE_2D,0,g.RGBA,w,h,0,g.RGBA,g.UNSIGNED_BYTE,u8);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.LINEAR);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MAG_FILTER,g.LINEAR);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_S,g.CLAMP_TO_EDGE);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_T,g.CLAMP_TO_EDGE);return t}
function glTexFromImg(img){const g=GL,t=g.createTexture();g.bindTexture(g.TEXTURE_2D,t);g.pixelStorei(g.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);g.texImage2D(g.TEXTURE_2D,0,g.RGBA,g.RGBA,g.UNSIGNED_BYTE,img);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.LINEAR);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MAG_FILTER,g.LINEAR);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_S,g.CLAMP_TO_EDGE);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_T,g.CLAMP_TO_EDGE);return t}

/* ---- themed tile sets (wall,wall2,arch,door,lamp,gate,floor,ceiling) ---- */
function TT(){return{t:new Uint32Array(TX*TX),em:new Uint8Array(TX*TX)}}
function tset(o,x,y,c,e){x=((x%TX)+TX)%TX;y=((y%TX)+TX)%TX;o.t[y*TX+x]=pk(c[0],c[1],c[2]);if(e)o.em[y*TX+x]=1}
function tget(o,x,y){const c=o.t[(((y%TX)+TX)%TX)*TX+(((x%TX)+TX)%TX)];return[c&255,(c>>8)&255,(c>>16)&255]}
function tfill(o,f){for(let y=0;y<TX;y++)for(let x=0;x<TX;x++){const c=f(x,y);if(c)tset(o,x,y,c)}}
function tlantern(o,cx,cy,frame,glow){for(let y=cy-24;y<cy-8;y++)tset(o,cx,y,[30,28,26]);for(let y=cy-8;y<cy+10;y++)for(let x=cx-7;x<=cx+7;x++){const edge=Math.abs(x-cx)>=6||y===cy-8||y===cy+9;if(edge)tset(o,x,y,frame);else{const g=1-Math.abs(x-cx)/7;tset(o,x,y,[glow[0],glow[1]*(0.8+g*.2),glow[2]*(0.6+g*.4)],1)}}for(let x=cx-4;x<=cx+4;x++){tset(o,x,cy-10,frame);tset(o,x,cy+11,frame)}}
function ttorch(o,cx,cy){for(let y=cy;y<cy+22;y++)for(let x=cx-2;x<=cx+2;x++)tset(o,x,y,[70,45,25]);for(let x=cx-6;x<=cx+6;x++)tset(o,x,cy+20,[40,36,34]);for(let y=cy-14;y<cy;y++){const w=Math.round((y-cy+14)/14*5);for(let x=cx-w;x<=cx+w;x++){const k=1-Math.abs(x-cx)/(w+1);tset(o,x,y,[255,150+k*100,40+k*120],1)}}}
function themeTiles(theme){const p=DPAL[theme];
 if(theme==='town'){
  const plaster=(win,seed)=>{const o=TT(),f1=fbmMaker(seed),r=srng(seed);tfill(o,(x,y)=>{let c=mulc([232,220,194],.84+f1(x,y)*.24);if(f1(x*3,y*3)>.7)c=mulc(c,.92);return mulc(c,.96+r()*.06)});
   const beam=(x0,y0,x1,y1,wd)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let i=0;i<=n;i++){const x=Math.round(x0+(x1-x0)*i/n),y=Math.round(y0+(y1-y0)*i/n);for(let a=0;a<wd;a++)for(let b=0;b<wd;b++)tset(o,x+a,y+b,mulc([92,60,36],.8+f1(x*4,y)*.4))}};
   beam(0,0,0,127,7);beam(121,0,121,127,7);beam(0,0,127,0,7);beam(0,58,127,58,6);
   if(!win){beam(8,64,60,118,5);beam(119,64,66,118,5)}
   else{for(let y=18;y<54;y++)for(let x=36;x<92;x++){const fr=x<40||x>87||y<22||y>49||Math.abs(x-64)<2||Math.abs(y-35)<2;tset(o,x,y,fr?[240,236,226]:mixc([60,96,150],[150,200,240],clamp((54-y)/40+(x-36)/120,0,1)))}for(let y=18;y<54;y++)for(let x=24;x<36;x++)tset(o,x,y,mulc([70,110,70],.8+((x-24)%4===0?-.3:0)));for(let y=18;y<54;y++)for(let x=92;x<104;x++)tset(o,x,y,mulc([70,110,70],.8+((x-92)%4===0?-.3:0)));
    for(let y=52;y<58;y++)for(let x=34;x<94;x++)tset(o,x,y,[110,70,40]);for(let k=0;k<30;k++){tset(o,36+r()*56|0,48+r()*5|0,pick([[230,60,80],[250,200,60],[250,250,250]]))}}
   for(let y=108;y<TX;y++)for(let x=0;x<TX;x++){const row=Math.floor(y/10),bx=(x+(row%2)*14)%28;tset(o,x,y,(bx<2||y%10===0)?[90,86,80]:mulc([150,144,132],.8+f1(x*3,y)*.3))}
   return o};
  const stone=(win,seed)=>{const o=TT(),f1=fbmMaker(seed),r=srng(seed);tfill(o,(x,y)=>{const row=Math.floor(y/16),bx=(x+(row%2)*20)%40,by=y%16;let c=(bx<2||by<2)?[96,92,88]:mulc([176,170,158],.78+f1(x,y)*.3+((row*7+Math.floor((x+(row%2)*20)/40))%4)*.03);if(f1(x*2,y*2)>.72)c=mixc(c,[110,130,90],.35);return mulc(c,.95+r()*.08)});
   if(win){for(let y=20;y<88;y++)for(let x=50;x<78;x++){const inA=y>34?true:Math.hypot(x-64,y-34)<14;if(!inA)continue;const fr=x<54||x>73||(y<38&&Math.hypot(x-64,y-34)>10);tset(o,x,y,fr?[200,196,186]:mixc([30,40,70],[90,120,170],(88-y)/70))}
    for(let y=92;y<118;y++)for(let x=46;x<82;x++)tset(o,x,y,(x-46)%12<6?[180,40,40]:[230,190,70])}
   return o};
  const roof=(base,seed,slate)=>{const o=TT(),f1=fbmMaker(seed),r=srng(seed);tfill(o,(x,y)=>{const row=y>>4,sh=y%16,col=(x+(row%2)*8)%16;let c=mulc(base,.72+f1(x,y)*.3+(row%3)*.04);
   if(slate){if(sh>13||col===0)c=mulc(c,.55)}else{const cv=Math.sin((col/16)*Math.PI);c=mulc(c,.62+cv*.45-(sh/16)*.18);if(sh>14)c=mulc(c,.5)}return mulc(c,.95+r()*.1)});return o};
  const door=()=>{const o=plaster(false,31);for(let y=36;y<TX;y++)for(let x=30;x<98;x++){const inA=y>64?true:Math.hypot(x-64,y-64)<34;if(!inA)continue;const fr=y>64?(x<36||x>91):Math.hypot(x-64,y-64)>28;
    tset(o,x,y,fr?mulc([160,150,136],.85+((x+y)%7===0?-.2:0)):mulc([120,76,40],.7+((x-36)%9<1?-.35:0)+Math.sin(y*.3)*.03))}for(let y=80;y<88;y++)for(let x=80;x<85;x++)tset(o,x,y,[230,200,90]);for(let x=36;x<92;x++)for(const y of[78,104])tset(o,x,y,[50,40,36]);return o};
  const cob=()=>{const o=texCobble({cob:[168,160,146],mold:[120,124,108],pa:[184,174,150]},61);return o};
  const grass=()=>{const o=TT(),f1=fbmMaker(61),f2=fbmMaker(67),r=srng(61);tfill(o,(x,y)=>{let c=mixc([72,126,48],[120,168,70],f1(x,y));if(f2(x,y)>.64)c=mixc(c,[160,176,84],.35);return mulc(c,.88+r()*.24)});for(let k=0;k<90;k++){const x=r()*TX|0,y=r()*TX|0;tset(o,x,y,[58,98,40]);tset(o,x,y+1,[52,90,36])}return o};
  const dirt=()=>{const o=TT(),f1=fbmMaker(71),r=srng(71);tfill(o,(x,y)=>mulc([170,136,96],(.8+f1(x,y)*.34)*(.92+r()*.16)));for(let k=0;k<120;k++){const x=r()*TX|0,y=r()*TX|0;tset(o,x,y,mulc([130,112,90],.8+r()*.5))}return o};
  const water=()=>{const o=TT(),f1=fbmMaker(91),f2=fbmMaker(97);tfill(o,(x,y)=>{let c=mixc([40,100,160],[80,160,210],f1(x,y));const wv=Math.sin(x*.19+y*.07+f2(x,y)*7);if(wv>.88)c=mixc(c,[220,240,255],(wv-.88)*6);return c});return o};
  const carpet=()=>{const o=TT(),f1=fbmMaker(121);tfill(o,(x,y)=>{let c=mulc([170,30,40],.82+f1(x,y)*.22);if((x+y)%32<2||(x-y+256)%32<2)c=mulc(c,.8);return c});return o};
  const ifloor=()=>{const o=TT(),f1=fbmMaker(131);tfill(o,(x,y)=>{const ch=((x>>5)+(y>>5))%2;let c=ch?mulc([210,200,180],.85+f1(x,y)*.2):mulc([150,138,120],.85+f1(x,y)*.25);if(x%32===0||y%32===0)c=[110,100,90];return c});return o};
  const plank=()=>{const o=TT(),f1=fbmMaker(101);tfill(o,(x,y)=>{const pl=y>>4;if(y%16<2)return[50,34,22];return mulc([156,112,70],.72+Math.sin(x*.05+pl*2+f1(x,y)*5)*.12+(pl%3)*.05)});return o};
  const brick=(win,seed)=>{const o=TT(),f1=fbmMaker(seed),r=srng(seed);tfill(o,(x,y)=>{const row=Math.floor(y/10),bx=(x+(row%2)*12)%24;return(bx<2||y%10<2)?[190,180,166]:mulc([168,84,58],.75+f1(x,y)*.3+r()*.08)});
   if(win){for(let y=18;y<58;y++)for(let x=38;x<90;x++){const fr=x<42||x>85||y<22||Math.abs(x-64)<2;tset(o,x,y,fr?[240,236,226]:mixc([60,96,150],[160,210,240],(58-y)/40))}for(let y=58;y<63;y++)for(let x=34;x<94;x++)tset(o,x,y,[200,196,186])}
   for(let y=110;y<TX;y++)for(let x=0;x<TX;x++)tset(o,x,y,mulc([140,134,124],.8+f1(x*3,y)*.3));return o};
  return[plaster(false,5),plaster(true,17),roof([186,76,50],41),door(),stone(false,51),roof([70,98,152],57,1),cob(),grass(),dirt(),water(),stone(true,63),carpet(),ifloor(),plank(),(()=>{const o=stone(false,83);for(let y=20;y<TX;y++)for(let x=22;x<106;x++){const inA=y>62?true:Math.hypot(x-64,y-62)<42;if(!inA)continue;const fr=y>62?(x<30||x>97):Math.hypot(x-64,y-62)>34;tset(o,x,y,fr?mulc([200,194,182],.85+((x*3+y)%11===0?-.25:0)):(Math.abs(x-64)<2?[40,26,16]:mulc([110,70,36],.68+((x-30)%10<1?-.35:0)+Math.sin(y*.25)*.04)))}for(let x=30;x<98;x++)for(const y of[70,96])for(let k=0;k<3;k++)tset(o,x,y+k,[60,56,56]);for(const x of[56,70])for(let y=82;y<88;y++)tset(o,x,y,[230,200,90]);return o})(),brick(true,77)]}
 if(theme==='field'){
  const rock=seed=>{const o=TT(),f1=fbmMaker(seed),f2=fbmMaker(seed+5),r=srng(seed);tfill(o,(x,y)=>{const n=f1(x,y);let c=mulc([146,128,106],.58+n*.62);const band=Math.sin(y*.16+f2(x,y)*6);c=mulc(c,.86+band*.12);if(f2(x*2,y*2)>.68)c=mixc(c,[84,118,60],.45);if(Math.abs(Math.sin(x*.18+f2(x*.6,y*.6)*9))<.04)c=mulc(c,.55);return mulc(c,.92+r()*.16)});for(let x=0;x<TX;x++){const hh=3+Math.floor(f2(x*3,7)*8);for(let y=0;y<hh;y++)tset(o,x,y,mulc([92,136,58],.75+r()*.4))}return o};
  const grass=()=>{const o=TT(),f1=fbmMaker(61),f2=fbmMaker(67),r=srng(61);tfill(o,(x,y)=>{const n=f1(x,y);let c=mixc([74,124,48],[122,166,70],n);if(f2(x,y)>.64)c=mixc(c,[160,176,84],.35);return mulc(c,.88+r()*.24)});for(let k=0;k<90;k++){const x=r()*TX|0,y=r()*TX|0;tset(o,x,y,mulc([60,100,40],.8));tset(o,x,y+1,mulc([60,100,40],.7))}for(let k=0;k<26;k++){const x=r()*TX|0,y=r()*TX|0;tset(o,x,y,pick([[250,236,120],[255,255,255],[240,150,180]]))}return o};
  const road=()=>{const o=TT(),f1=fbmMaker(71),f2=fbmMaker(75),r=srng(71);tfill(o,(x,y)=>{let c=mulc([176,144,100],.8+f1(x,y)*.34);if(f2(x*2,y*2)>.7)c=mulc(c,.85);return mulc(c,.92+r()*.16)});for(let k=0;k<140;k++){const x=r()*TX|0,y=r()*TX|0;tset(o,x,y,mulc([130,112,90],.8+r()*.5))}return o};
  const sand=()=>{const o=TT(),f1=fbmMaker(81),r=srng(81);tfill(o,(x,y)=>{let c=mulc([222,202,146],.86+f1(x,y)*.22);const rp=Math.sin(y*.35+f1(x*2,y)*8);if(rp>.86)c=mulc(c,1.07);if(rp<-.9)c=mulc(c,.9);return mulc(c,.95+r()*.1)});return o};
  const water=()=>{const o=TT(),f1=fbmMaker(91),f2=fbmMaker(97);tfill(o,(x,y)=>{const n=f1(x,y);let c=mixc([34,86,150],[70,140,200],n);const wv=Math.sin(x*.19+y*.07+f2(x,y)*7);if(wv>.9)c=mixc(c,[210,236,255],(wv-.9)*7);return c});return o};
  const bridge=()=>{const o=TT(),f1=fbmMaker(101),r=srng(101);tfill(o,(x,y)=>{const pl=y>>4;if(y%16<2)return[40,28,18];let c=mulc([150,106,64],.7+Math.sin(x*.05+pl*2+f1(x,y)*5)*.12+(pl%3)*.05);if(x<10||x>117)c=mulc([110,76,46],.8+r()*.2);if((x===14||x===113)&&y%16===8)c=[40,40,44];return c});return o};
  const rtop=()=>{const o=TT(),f1=fbmMaker(111),f2=fbmMaker(117),r=srng(111);tfill(o,(x,y)=>{let c=mulc([150,138,120],.6+f1(x,y)*.55);if(f2(x,y)>.6)c=mixc(c,[96,134,64],clamp((f2(x,y)-.6)*4,0,.9));if(f1(x*2,y*2)>.74)c=mixc(c,[240,244,250],.8);return mulc(c,.92+r()*.16)});return o};
  return[rock(5),rock(17),water(),road(),sand(),bridge(),grass(),rtop()]}
 if(theme==='forest'){
  const wall=(seed,variant)=>{const o=TT(),f1=fbmMaker(seed),f2=fbmMaker(seed+5),f3=fbmMaker(seed+9),r=srng(seed);
   tfill(o,(x,y)=>{const n=f1(x,y),h=f2(x,y);let c=mixc([16,34,16],[52,98,40],clamp((n-.3)*2,0,1));if(h>.6)c=mixc(c,[110,160,70],clamp((h-.6)*4,0,1));if(f3(x*2,y*2)>.7)c=mulc(c,.6);return c});
   const trunks=variant==='arch'?[[20,16],[108,16]]:[[r()*40+8,14+r()*8],[r()*40+70,12+r()*8]];
   for(const[tx,tw]of trunks)for(let y=0;y<TX;y++){const flare=y>100?(y-100)*.6:0,w=tw+flare;for(let x=Math.floor(tx-w/2);x<tx+w/2;x++){const u=(x-(tx-w/2))/w;const g=Math.sin((x*1.7)+f1(x*3,y*.3)*10)*.5+.5;let c=mulc([78,56,38],.55+g*.35+(1-Math.abs(u-.45)*2)*.25);if(y>96&&f2(x*3,y*3)>.55)c=mixc(c,[60,96,44],.6);tset(o,x,y,c)}}
   if(variant==='arch'){for(let y=30;y<TX;y++)for(let x=40;x<88;x++){const d=((x-64)/24)**2+((y-62)/34)**2;if(y>62?Math.abs(x-64)<24:d<1)tset(o,x,y,mulc(tget(o,x,y),.25))}}
   if(variant==='door'){for(let k=0;k<160;k++){const x=r()*TX|0,y=r()*TX|0;tset(o,x,y,r()<.5?[230,120,170]:[245,240,220])}for(let s=0;s<5;s++){let x=r()*TX;for(let y=0;y<TX;y++){x+=Math.sin(y*.15+s)*.8;tset(o,x|0,y,[40,90,40]);tset(o,(x|0)+1,y,[60,120,50])}}}
   if(variant==='lamp'){for(let x=30;x<100;x++)for(let y=14;y<20;y++)tset(o,x,y+Math.round(Math.sin(x*.05)*2),[70,50,32]);tlantern(o,64,46,[40,36,30],[255,200,110])}
   for(let x=0;x<TX;x++){const h=4+Math.floor(f3(x*4,0)*10);for(let y=TX-h;y<TX;y++)tset(o,x,y,mulc([70,120,50],.7+r()*.5))}
   return o};
  const floor=()=>{const o=TT(),f1=fbmMaker(61),f2=fbmMaker(67),r=srng(61);tfill(o,(x,y)=>{const n=f1(x,y);let c=mixc([40,74,30],[88,128,52],n);if(f2(x,y)>.62)c=mixc(c,[96,74,50],clamp((f2(x,y)-.62)*5,0,1));return mulc(c,.85+r()*.3)});
   for(let k=0;k<70;k++){const x=r()*TX|0,y=r()*TX|0,c=pick([[180,120,40],[200,160,60],[140,80,30]]);tset(o,x,y,c);tset(o,x+1,y,c);tset(o,x,y+1,mulc(c,.8))}for(let k=0;k<25;k++){const x=r()*TX|0,y=r()*TX|0;tset(o,x,y,[240,240,220]);tset(o,x+1,y,[250,230,120])}return o};
  const ceil=()=>{const o=TT(),f1=fbmMaker(73),f2=fbmMaker(79);tfill(o,(x,y)=>{const n=f1(x,y);return mixc([10,24,10],[40,78,32],n)});for(let y=0;y<TX;y++)for(let x=0;x<TX;x++)if(f2(x,y)>.7){const k=clamp((f2(x,y)-.7)*6,0,1);tset(o,x,y,mixc([60,100,50],[220,240,210],k),k>.5)}return o};
  const gate=()=>{const o=TT();tfill(o,(x,y)=>{const bx=x%18;return bx<12?mulc([96,70,44],.7+Math.sin(bx*.5)*.3):[8,14,8]});for(let x=0;x<TX;x++)for(const y of[30,90])for(let k=0;k<3;k++)tset(o,x,y+k,[150,130,80]);for(let i=0;i<7;i++)for(let y=0;y<8;y++)for(let x=i*18;x<i*18+12;x++)if(Math.abs(x-i*18-6)<y*.8)tset(o,x,y,[0,0,0]);return o};
  return[wall(5,''),wall(17,''),wall(29,'arch'),wall(41,'door'),wall(53,'lamp'),gate(),floor(),ceil()]}
 if(theme==='cave'||theme==='mountain'||theme==='abyss'){
  const base=theme==='cave'?[96,64,50]:theme==='mountain'?[150,88,62]:[110,30,40],vein=theme==='abyss'?[255,40,40]:[255,140,40];
  const wall=(seed,variant)=>{const o=TT(),f1=fbmMaker(seed),f2=fbmMaker(seed+5),r=srng(seed);
   tfill(o,(x,y)=>{const n=f1(x,y);let c=mulc(base,.55+n*.7);if(theme==='mountain'){const band=Math.sin(y*.18+f2(x,y)*5);c=mulc(c,.85+band*.15)}if(theme==='abyss'){const v=Math.abs(Math.sin(x*.12+f2(x,y)*9));if(v<.08)c=[60,6,12]}const cr=Math.abs(Math.sin(x*.21+f2(x*.7,y*.7)*12));if(cr<.035&&theme!=='mountain')return null;return mulc(c,.9+r()*.2)});
   if(theme!=='mountain')for(let y=0;y<TX;y++)for(let x=0;x<TX;x++){const cr=Math.abs(Math.sin(x*.21+f2(x*.7,y*.7)*12));if(cr<.035)tset(o,x,y,vein,1)}
   if(variant==='arch'){if(theme==='mountain'){for(let k=0;k<5;k++){const cy=30+k*16;for(let x=24;x<104;x++){const y=cy+Math.round(((x-64)/40)**2*-10);for(let d=0;d<4;d++)tset(o,x,y+d,[230,220,190])}}}else if(theme==='abyss'){for(let y=34;y<94;y++)for(let x=34;x<94;x++){const d=Math.hypot((x-64)/30,(y-64)/18);if(d<1){const ir=Math.hypot(x-64,y-64);tset(o,x,y,ir<12?(ir<5?[10,0,0]:[255,60,40]):[230,210,200],ir<12)}}}else{for(let y=30;y<TX;y++)for(let x=36;x<92;x++){const d=((x-64)/28)**2+((y-70)/40)**2;if(d<1)tset(o,x,y,mulc(tget(o,x,y),.22))}}}
   if(variant==='door'){if(theme==='cave'){for(const bx of[24,94])for(let y=10;y<TX;y++)for(let x=bx;x<bx+10;x++)tset(o,x,y,mulc([110,76,46],.7+Math.sin(x*1.4)*.2));for(let y=10;y<20;y++)for(let x=24;x<104;x++)tset(o,x,y,mulc([110,76,46],.8))}else if(theme==='abyss'){for(let k=0;k<6;k++){const cy=24+k*16;for(let x=20;x<108;x++){const y=cy+Math.round(Math.abs(x-64)*.18);for(let d=0;d<4;d++)tset(o,x,y+d,[220,205,190])}}for(let y=20;y<120;y++)for(let x=62;x<67;x++)tset(o,x,y,[200,190,175])}else{for(let y=24;y<100;y++)for(let x=34;x<94;x++){const e=x<38||x>89||y<28||y>95;tset(o,x,y,e?[90,60,44]:mulc([170,120,90],.8+((x+y)%9===0?-.3:0)))}for(let k=0;k<5;k++)for(let x=44;x<84;x++)tset(o,x,40+k*12,[255,170,80],1)}}
   if(variant==='lamp'){if(theme==='cave')tlantern(o,64,46,[50,44,38],[255,180,90]);else if(theme==='abyss')tlantern(o,64,46,[200,190,170],[255,70,50]);else ttorch(o,64,40)}
   return o};
  const floor=()=>{const o=TT(),f1=fbmMaker(61),r=srng(61);tfill(o,(x,y)=>mulc(base,.38+f1(x,y)*.45+r()*.08));if(theme!=='mountain'){const f2=fbmMaker(66);for(let y=0;y<TX;y++)for(let x=0;x<TX;x++){if(Math.abs(Math.sin(x*.19+f2(x,y)*10))<.03)tset(o,x,y,mulc(vein,.8),1)}}else for(let k=0;k<200;k++){const x=r()*TX|0,y=r()*TX|0;tset(o,x,y,mulc(base,.9+r()*.4))}return o};
  const ceil=()=>{const o=TT(),f1=fbmMaker(73);tfill(o,(x,y)=>mulc(base,.25+f1(x,y)*.35));return o};
  return[wall(5,''),wall(17,''),wall(29,'arch'),wall(41,'door'),wall(53,'lamp'),texGate(),floor(),ceil()]}
 if(theme==='sea'){
  const wall=(seed,variant)=>{const o=TT(),f1=fbmMaker(seed),r=srng(seed);
   tfill(o,(x,y)=>{const row=y>>4,seam=y%16===0;const g=Math.sin(x*.08+row*3+f1(x,y)*6)*.5+.5;let c=seam?[36,26,18]:mulc([112,80,52],.6+g*.35+((row*7)%3)*.05);if((x+row*37)%64===0)c=[40,30,22];if(y>100)c=mixc(c,[40,80,70],clamp((y-100)/40+f1(x*2,y)*.4-.2,0,.8));return c});
   for(let k=0;k<6;k++){let x=r()*TX;for(let y=TX-1;y>70+r()*30;y--){x+=Math.sin(y*.2+k)*.6;tset(o,x|0,y,[40,110,70]);tset(o,(x|0)+1,y,[30,90,60])}}
   for(let k=0;k<40;k++){const x=r()*TX|0,y=108+r()*18|0;tset(o,x,y,[190,190,170]);tset(o,x+1,y,[150,150,140])}
   if(variant==='arch'){for(let y=26;y<80;y++)for(let x=38;x<90;x++){const d=Math.hypot(x-64,y-52);if(d<26){if(d>20)tset(o,x,y,mulc([200,160,70],.7+((x+y)%5)*.06));else{const k=1-d/20;tset(o,x,y,[40+k*60,120+k*80,150+k*80],1)}}}}
   if(variant==='door'){for(let y=18;y<TX;y++)for(let x=40;x<88;x++){const e=x<44||x>83||y<22;tset(o,x,y,e?[60,42,28]:mulc([96,66,40],.75+((x-44)%8<1?-.4:0)))}for(let y=62;y<70;y++)for(let x=76;x<80;x++)tset(o,x,y,[210,170,70])}
   if(variant==='lamp')tlantern(o,64,46,[190,150,60],[255,210,130]);
   return o};
  const floor=()=>{const o=TT(),f1=fbmMaker(61),f2=fbmMaker(66);tfill(o,(x,y)=>{const pl=x>>4;let c=x%16===0?[34,24,16]:mulc([100,72,48],.65+Math.sin(y*.05+pl*2+f1(x,y)*5)*.15+(pl%3)*.04);if(f2(x,y)>.62)c=mixc(c,[70,110,120],clamp((f2(x,y)-.62)*5,0,.8));return c});return o};
  const ceil=()=>{const o=TT(),f1=fbmMaker(73);tfill(o,(x,y)=>{const beam=(x%32)<10;return beam?mulc([80,56,36],.6+f1(x,y)*.2):mulc([46,32,22],.6+f1(x,y)*.3)});return o};
  const gate=()=>{const o=TT();tfill(o,(x,y)=>{const bx=x%20;return bx<13?mulc([90,64,40],.75+Math.sin(bx*.5)*.2):[6,14,18]});for(let x=0;x<TX;x++)for(const y of[24,100])for(let k=0;k<4;k++)tset(o,x,y+k,[60,60,64]);return o};
  return[wall(5,''),wall(17,''),wall(29,'arch'),wall(41,'door'),wall(53,'lamp'),gate(),floor(),ceil()]}
 if(theme==='temple'){
  const wall=(seed,variant)=>{const o=TT(),f1=fbmMaker(seed),f2=fbmMaker(seed+3);
   tfill(o,(x,y)=>{const row=Math.floor(y/32),bx=(x+(row%2)*24)%48,by=y%32;let c=mulc([196,184,210],.78+f1(x,y)*.25);const v=Math.abs(Math.sin(x*.06+y*.03+f2(x,y)*8));if(v<.04)c=mulc(c,.7);if(bx<2||by<2)c=[96,84,110];if(y<6||(y>=100&&y<106))c=mulc([220,180,80],.8+f1(x*3,y)*.3);if(y>=106)c=mulc([120,100,140],.7+f1(x,y)*.2);return c});
   if(variant==='door'){for(let y=10;y<100;y++)for(let x=40;x<88;x++){const tip=y>90&&Math.abs(x-64)>(100-y)*2.4;if(tip)continue;let c=mulc([110,40,150],.7+Math.sin(x*.3)*.1);if(x<43||x>84)c=[220,180,80];if(Math.hypot(x-64,y-46)<10&&Math.hypot(x-64,y-46)>6)c=[230,190,90];tset(o,x,y,c)}}
   if(variant==='arch'){for(let y=20;y<100;y++)for(let x=38;x<90;x++){const d=((x-64)/26)**2+((y-50)/30)**2;const inA=y>50?Math.abs(x-64)<26:d<1;if(!inA)continue;let c=[34,22,48];const sx=Math.abs(x-64),sy=y;if((sy>38&&sy<46&&sx<6)||(sy>=46&&sy<92&&sx<10-((sy-46)/10)))c=[200,196,210];tset(o,x,y,c)}}
   if(variant==='lamp'){for(let y=60;y<70;y++)for(let x=52;x<77;x++)if(Math.abs(x-64)<(y-56))tset(o,x,y,[210,170,70]);for(let y=70;y<78;y++)for(let x=61;x<68;x++)tset(o,x,y,[180,140,60]);for(let y=40;y<60;y++){const w=Math.round((y-40)/20*7);for(let x=64-w;x<=64+w;x++)tset(o,x,y,[255,190+(1-Math.abs(x-64)/8)*60,90],1)}}
   return o};
  const floor=()=>{const o=TT(),f1=fbmMaker(61);tfill(o,(x,y)=>{const ch=((x>>5)+(y>>5))%2;let c=ch?mulc([210,200,220],.8+f1(x,y)*.2):mulc([60,36,80],.8+f1(x,y)*.3);if(x%32===0||y%32===0)c=[200,160,70];return c});return o};
  const ceil=()=>{const o=TT(),f1=fbmMaker(73);tfill(o,(x,y)=>{const bx=x%32,by=y%32;let c=mulc([46,30,64],.6+f1(x,y)*.3);if(bx<3||by<3)c=[160,128,60];return c});return o};
  return[wall(5,''),wall(17,''),wall(29,'arch'),wall(41,'door'),wall(53,'lamp'),texGate(),floor(),ceil()]}
 // ruins (default plaster)
 return[texWall(p,'',5),texWall(p,'',17),texWall(p,'arch',29),texWall(p,'door',41),texWall(p,'lamp',53),texGate(),texCobble(p,61),texWall(p,'',73,.5)]}

const TILE={plain:0,plain2:1,arch:2,door:3,lamp:4,gate:5,floor:6,top:7};
function buildAtlas(theme){const tiles=themeTiles(theme);
 const AW=512,AH=512,u8=new Uint8Array(AW*AH*4);tiles.forEach((tt,i)=>{const ox=(i%4)*128,oy=Math.floor(i/4)*128;for(let y=0;y<128;y++)for(let x=0;x<128;x++){const c=tt.t[y*128+x],o=((oy+y)*AW+ox+x)*4;u8[o]=c&255;u8[o+1]=(c>>8)&255;u8[o+2]=(c>>16)&255;u8[o+3]=tt.em[y*128+x]?40:255}});return glTexFromPixels(u8,AW,AH)}
function tuv(t){const c=t%4,r=Math.floor(t/4);return[(c*128+1)/512,((c+1)*128-1)/512,(r*128+1)/512,((r+1)*128-1)/512]}
function pushQ(a,A,Bq,C,Dq,n,t,ao){const[u0,u1,v0,v1]=tuv(t);ao=ao||[1,1,1,1];const V=(p,u,v,o)=>a.push(p[0],p[1],p[2],n[0],n[1],n[2],u,v,o);V(A,u0,v1,ao[0]);V(Bq,u1,v1,ao[1]);V(C,u1,v0,ao[2]);V(A,u0,v1,ao[0]);V(C,u1,v0,ao[2]);V(Dq,u0,v0,ao[3])}
let WH=1.15;
function buildMesh(){const m=D.m,fl=[],wl=[],gt=[];const isW=(x,y)=>x<0||y<0||x>=m.w||y>=m.h||m.g[y*m.w+x];
 const cAO=(x,y)=>{let w=0;for(const[i,j]of[[-1,-1],[0,-1],[-1,0],[0,0]])if(isW(x+i,y+j))w++;return 1-w*.16};
 for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){if(!isW(x,y)){pushQ(fl,[x,0,y+1],[x+1,0,y+1],[x+1,0,y],[x,0,y],[0,1,0],TILE.floor,[cAO(x,y+1),cAO(x+1,y+1),cAO(x+1,y),cAO(x,y)]);continue}
  let near=false;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)if(!isW(x+i,y+j))near=true;if(!near)continue;
  pushQ(wl,[x,WH,y+1],[x+1,WH,y+1],[x+1,WH,y],[x,WH,y],[0,1,0],DUN[D.ci].theme==='forest'?TILE.top:TILE.plain2);
  for(let k=0;k<4;k++){const nx=x+DXY[k][0],ny=y+DXY[k][1];if(isW(nx,ny))continue;const t=TILE[faceKind(nx,ny,(k+2)%4)];
   let L,R,n;if(k===0){L=[x+1,y+1];R=[x+1,y];n=[1,0,0]}else if(k===2){L=[x,y];R=[x,y+1];n=[-1,0,0]}else if(k===1){L=[x,y+1];R=[x+1,y+1];n=[0,0,1]}else{L=[x+1,y];R=[x,y];n=[0,0,-1]}
   pushQ(wl,[L[0],0,L[1]],[R[0],0,R[1]],[R[0],WH,R[1]],[L[0],WH,L[1]],n,t,[.62,.62,1,1])}}
 if(m.gate>=0){const x=m.gate%m.w,y=(m.gate/m.w)|0,h=WH*.9,i=.06;for(let k=0;k<4;k++){const nx=x+DXY[k][0],ny=y+DXY[k][1];if(isW(nx,ny))continue;let L,R,n;if(k===0){L=[x+1-i,y+1];R=[x+1-i,y];n=[1,0,0]}else if(k===2){L=[x+i,y];R=[x+i,y+1];n=[-1,0,0]}else if(k===1){L=[x,y+1-i];R=[x+1,y+1-i];n=[0,0,1]}else{L=[x+1,y+i];R=[x,y+i];n=[0,0,-1]}pushQ(gt,[L[0],0,L[1]],[R[0],0,R[1]],[R[0],h,R[1]],[L[0],h,L[1]],n,TILE.gate,[.7,.7,1,1])}}
 const mk=a=>{const b=GL.createBuffer();GL.bindBuffer(GL.ARRAY_BUFFER,b);GL.bufferData(GL.ARRAY_BUFFER,new Float32Array(a),GL.STATIC_DRAW);return{b,n:a.length/9}};GLB.floor=mk(fl);GLB.wall=mk(wl);GLB.gate=gt.length?mk(gt):null}
function glDraw(buf,n){const g=GL,P_=GLP;g.bindBuffer(g.ARRAY_BUFFER,buf);g.enableVertexAttribArray(P_.aP);g.vertexAttribPointer(P_.aP,3,g.FLOAT,false,36,0);g.enableVertexAttribArray(P_.aN);g.vertexAttribPointer(P_.aN,3,g.FLOAT,false,36,12);g.enableVertexAttribArray(P_.aU);g.vertexAttribPointer(P_.aU,2,g.FLOAT,false,36,24);g.enableVertexAttribArray(P_.aA);g.vertexAttribPointer(P_.aA,1,g.FLOAT,false,36,32);g.drawArrays(g.TRIANGLES,0,n)}
/* sprites */
const SPRC={};
function sprCanvas(kind){if(SPRC[kind])return SPRC[kind];const tall=kind==='tree'||kind==='pine'||kind==='lamppost'||kind==='banner';const c=document.createElement('canvas');c.width=128;c.height=tall?224:128;const g=c.getContext('2d');const S=128/64;g.scale(S,S);
 const lg=(y0,y1,a,b)=>{const l=g.createLinearGradient(0,y0,0,y1);l.addColorStop(0,a);l.addColorStop(1,b);return l};const rg=(x,y,r,a,b)=>{const l=g.createRadialGradient(x-r*.3,y-r*.3,1,x,y,r);l.addColorStop(0,a);l.addColorStop(1,b);return l};
 const blob=(x,y,r,a,b)=>{g.fillStyle=rg(x,y,r,a,b);g.beginPath();g.arc(x,y,r,0,7);g.fill()};
 switch(kind){
 case'chest':case'keychest':case'chesto':{const iron=kind==='keychest';g.fillStyle=lg(34,62,iron?'#8a8a90':'#8a5a32',iron?'#3a3a40':'#4a2a14');g.fillRect(10,36,44,26);
  if(kind!=='chesto'){g.fillStyle=lg(22,38,iron?'#a8a8b0':'#a06a3a',iron?'#5a5a62':'#5a3418');g.beginPath();g.moveTo(10,38);g.quadraticCurveTo(32,18,54,38);g.closePath();g.fill()}else{g.fillStyle='#1a0e06';g.fillRect(12,34,40,6);g.fillStyle=lg(10,34,'#7a4a24','#3a200e');g.fillRect(10,12,44,22)}
  g.fillStyle='#2a2a2e';for(const x of[16,44])g.fillRect(x,26,4,36);g.fillStyle='#c8a040';g.fillRect(29,40,6,8);break}
 case'spring':g.fillStyle=lg(44,62,'#9a958a','#4a4842');g.beginPath();g.ellipse(32,52,27,9,0,0,7);g.fill();g.fillStyle='#2a6aa8';g.beginPath();g.ellipse(32,49,22,6,0,0,7);g.fill();g.fillStyle='rgba(150,230,255,.95)';g.beginPath();g.ellipse(32,48,15,4,0,0,7);g.fill();for(let i=0;i<9;i++){g.fillStyle='rgba(190,245,255,.95)';g.fillRect(31-i*.4,10+i*4,2+i*.8,4)}break;
 case'goal':g.fillStyle=lg(4,62,'#a49a88','#5a544a');g.fillRect(8,6,48,56);g.fillStyle=lg(10,60,'#e0a0ff','#4a1080');g.beginPath();g.moveTo(14,62);g.lineTo(14,28);g.arc(32,28,18,Math.PI,0);g.lineTo(50,62);g.fill();g.fillStyle='rgba(255,240,255,.95)';g.beginPath();g.ellipse(32,40,7,16,0,0,7);g.fill();break;
 case'stair':for(let i=0;i<5;i++){g.fillStyle=i%2?'#7a7468':'#9a9284';g.fillRect(8+i*3,30+i*6,48-i*6,6)}break;
 case'tree':g.fillStyle=lg(60,112,'#6a4a30','#3a2618');g.fillRect(28,62,9,50);g.fillRect(24,104,17,8);for(const[x,y,r]of[[32,62,20],[20,52,15],[44,52,15],[32,38,18],[24,28,13],[40,26,13],[32,16,12]])blob(x,y,r,'#4e8a3a','#0e2a10');for(let i=0;i<60;i++){const x=12+Math.random()*40,y=6+Math.random()*70;g.fillStyle=`rgba(${120+Math.random()*60|0},${170+Math.random()*50|0},90,.35)`;g.fillRect(x,y,2,1.5)}break;
 case'pine':g.fillStyle='#4a3020';g.fillRect(29,90,6,22);for(let i=0;i<5;i++){const y=14+i*16,w=10+i*5;g.fillStyle=lg(y,y+22,'#2e5e30','#0c2410');g.beginPath();g.moveTo(32,y-6);g.lineTo(32+w,y+20);g.lineTo(32-w,y+20);g.fill()}break;
 case'bush':blob(22,44,14,'#6aa848','#1e4a1e');blob(40,42,15,'#7ab858','#245a24');blob(31,34,14,'#8ac868','#2a6a2a');for(let i=0;i<6;i++){g.fillStyle=Math.random()<.5?'#ff8ab0':'#fff0f0';g.fillRect(16+Math.random()*30,30+Math.random()*20,2,2)}break;
 case'mush':for(const[x,s]of[[22,1],[38,.8],[30,.6]]){g.fillStyle='#e8e0c8';g.fillRect(x-2*s,48-10*s,4*s,12*s+6);g.fillStyle=rg(x,46-12*s,9*s,'#9affe8','#1a8a90');g.beginPath();g.ellipse(x,48-12*s,9*s,5*s,0,Math.PI,0);g.fill()}break;
 case'flowers':for(let i=0;i<14;i++){const x=10+Math.random()*44,y=40+Math.random()*16;g.fillStyle='#3a7a2a';g.fillRect(x,y,1,8);g.fillStyle=pick(['#ffd040','#ff7aa0','#ffffff','#b080ff']);g.beginPath();g.arc(x,y,2.5,0,7);g.fill()}break;
 case'rock':blob(28,46,14,'#9a958a','#3a3834');blob(42,50,9,'#8a857a','#34322e');break;
 case'crystal':for(const[x,h,w]of[[26,30,7],[36,22,6],[44,16,5]]){g.fillStyle=lg(56-h,56,'#c0f8ff','#2a8ab8');g.beginPath();g.moveTo(x,56-h);g.lineTo(x+w,56-h*.6);g.lineTo(x+w*.6,56);g.lineTo(x-w*.6,56);g.lineTo(x-w,56-h*.6);g.fill()}break;
 case'barrel':g.fillStyle=lg(20,60,'#9a6a3a','#4a2a14');g.beginPath();g.ellipse(32,40,14,20,0,0,7);g.fill();g.fillStyle='#3a3a40';for(const y of[26,40,54])g.fillRect(18,y,28,2);break;
 case'crate':g.fillStyle=lg(24,60,'#a07a4a','#5a3a1a');g.fillRect(14,26,36,34);g.strokeStyle='#3a2410';g.lineWidth=2;g.strokeRect(15,27,34,32);g.beginPath();g.moveTo(15,27);g.lineTo(49,59);g.stroke();break;
 case'bones':g.fillStyle='#e8e0c8';g.beginPath();g.ellipse(26,46,8,7,0,0,7);g.fill();g.fillStyle='#1a1410';g.fillRect(22,44,3,3);g.fillRect(28,44,3,3);g.fillStyle='#d8d0b8';g.fillRect(34,52,18,3);g.fillRect(12,56,16,3);break;
 case'urn':g.fillStyle=lg(24,60,'#c08a5a','#5a3a24');g.beginPath();g.moveTo(26,24);g.lineTo(38,24);g.quadraticCurveTo(52,40,40,60);g.lineTo(24,60);g.quadraticCurveTo(12,40,26,24);g.fill();g.fillStyle='#3a2414';g.fillRect(25,22,14,4);break;
 case'candle':g.fillStyle='#e8e0c8';for(const[x,h]of[[24,14],[32,20],[40,11]])g.fillRect(x-2,58-h,4,h);g.fillStyle='#ffc040';for(const[x,h]of[[24,14],[32,20],[40,11]]){g.beginPath();g.ellipse(x,56-h,2,4,0,0,7);g.fill()}break;
 case'statue':g.fillStyle=lg(4,62,'#e8e4f0','#7a7488');g.fillRect(20,52,24,10);g.fillRect(26,18,12,34);g.beginPath();g.arc(32,14,6,0,7);g.fill();g.fillRect(18,24,8,4);g.fillRect(38,24,8,4);break;
 case'candela':g.fillStyle='#c8a040';g.fillRect(31,22,2,38);g.fillRect(22,58,20,3);g.fillRect(20,30,24,2);for(const x of[20,32,44]){g.fillStyle='#e8e0c8';g.fillRect(x-1,22,3,8);g.fillStyle='#ffc040';g.beginPath();g.ellipse(x+.5,19,2,4,0,0,7);g.fill()}break;
 case'skulls':for(const[x,y]of[[24,50],[38,50],[31,40]]){g.fillStyle='#e0d8c0';g.beginPath();g.arc(x,y,7,0,7);g.fill();g.fillStyle='#200';g.fillRect(x-4,y-1,3,3);g.fillRect(x+1,y-1,3,3)}break;
 case'arrow':g.fillStyle='#fff';g.beginPath();g.moveTo(32,58);g.lineTo(12,30);g.lineTo(24,30);g.lineTo(24,6);g.lineTo(40,6);g.lineTo(40,30);g.lineTo(52,30);g.fill();break;
 case'town0':{g.fillStyle=lg(30,62,'#d8d0c0','#8a8478');g.fillRect(6,40,52,22);for(let x=6;x<58;x+=6)g.fillRect(x,36,4,4);g.fillStyle=lg(10,62,'#e8e0d0','#9a9488');for(const x of[6,46])g.fillRect(x,22,12,40);g.fillRect(24,14,16,48);g.fillStyle=lg(0,24,'#4a7ae0','#1a3a8a');for(const[x,w,y]of[[4,16,22],[44,16,22],[22,20,14]]){g.beginPath();g.moveTo(x,y);g.lineTo(x+w/2,y-14);g.lineTo(x+w,y);g.fill()}
  g.fillStyle='#3a2a20';g.beginPath();g.moveTo(26,62);g.lineTo(26,50);g.arc(32,50,6,Math.PI,0);g.lineTo(38,62);g.fill();g.fillStyle='#ffe08a';for(const[x,y]of[[10,30],[50,30],[30,24],[30,34]])g.fillRect(x,y,3,4);g.fillStyle='#e03a3a';g.fillRect(32,0,1,8);g.fillRect(33,0,6,4);break}
 case'town1':{const house=(x,y,w,h,roof)=>{g.fillStyle=lg(y,y+h,'#fff8ec','#c8bca8');g.fillRect(x,y,w,h);g.fillStyle=roof;g.beginPath();g.moveTo(x-2,y);g.lineTo(x+w/2,y-w*.45);g.lineTo(x+w+2,y);g.fill();g.fillStyle='#3a6aa8';g.fillRect(x+w/2-2,y+h*.35,4,5)};
  g.fillStyle=lg(4,62,'#ffffff','#b8b0a0');g.fillRect(44,10,10,52);g.fillStyle='#d83a3a';for(let y=14;y<60;y+=12)g.fillRect(44,y,10,5);g.fillStyle='#ffe870';g.fillRect(45,4,8,6);g.fillStyle='#3a3a40';g.beginPath();g.moveTo(43,4);g.lineTo(49,-2);g.lineTo(55,4);g.fill();
  house(4,40,18,22,'#e8763a');house(22,34,18,28,'#d8603a');house(8,26,12,12,'#f08a4a');break}
 case'town2':{g.fillStyle=lg(24,62,'#ffffff','#c0bcd0');g.fillRect(10,34,44,28);g.fillRect(24,20,16,42);g.fillStyle=lg(4,24,'#ffe890','#c8902a');g.beginPath();g.arc(32,22,10,Math.PI,0);g.fill();g.fillRect(31,4,2,10);g.fillRect(28,7,8,2);
  for(const x of[12,18,42,48]){g.fillStyle='#e8e4f4';g.fillRect(x,38,4,24)}g.fillStyle='#6a4aa8';g.beginPath();g.moveTo(28,62);g.lineTo(28,46);g.arc(32,46,4,Math.PI,0);g.lineTo(36,62);g.fill();g.fillStyle='#a8d0ff';g.beginPath();g.arc(32,30,3,0,7);g.fill();break}
 case'dg0':{g.fillStyle=lg(20,62,'#5a3a24','#2a180c');g.beginPath();g.moveTo(18,62);g.quadraticCurveTo(22,30,26,20);g.lineTo(38,20);g.quadraticCurveTo(42,30,46,62);g.fill();for(const[x,y,r]of[[32,16,16],[18,22,12],[46,22,12],[24,8,10],[40,8,10]])blob(x,y,r,'#3a7a3a','#0a200c');g.fillStyle='#0a0408';g.beginPath();g.ellipse(32,52,7,10,0,0,7);g.fill();g.fillStyle='rgba(120,255,200,.8)';g.beginPath();g.ellipse(32,54,3,5,0,0,7);g.fill();break}
 case'dg1':{blob(32,52,28,'#a0786a','#3a2018');g.fillStyle='#1a0806';g.beginPath();g.moveTo(20,62);g.lineTo(22,46);g.quadraticCurveTo(32,34,42,46);g.lineTo(44,62);g.fill();const l=g.createRadialGradient(32,58,1,32,58,12);l.addColorStop(0,'rgba(255,160,40,1)');l.addColorStop(1,'rgba(255,80,0,0)');g.fillStyle=l;g.fillRect(16,44,32,20);g.fillStyle='#ff7a2a';for(const x of[26,32,38])g.fillRect(x,20+Math.abs(x-32)/2,2,6);break}
 case'dg2':{g.save();g.translate(32,44);g.rotate(-.25);g.fillStyle=lg(-14,14,'#7a5a3a','#3a2414');g.beginPath();g.moveTo(-26,-6);g.lineTo(26,-10);g.lineTo(18,12);g.lineTo(-20,12);g.fill();g.fillStyle='#2a1a10';g.fillRect(-2,-36,3,28);g.fillStyle='#d8d0b8';g.beginPath();g.moveTo(1,-34);g.lineTo(16,-24);g.lineTo(1,-14);g.fill();g.restore();g.fillStyle='rgba(60,140,200,.85)';g.fillRect(0,54,64,10);g.fillStyle='rgba(220,240,255,.9)';for(let x=2;x<64;x+=9)g.fillRect(x,54,5,2);break}
 case'dg3':{blob(32,48,26,'#8a6a5a','#2a1810');g.fillStyle='#e8e0c8';g.beginPath();g.ellipse(32,40,14,10,0,0,7);g.fill();g.fillStyle='#1a0806';g.beginPath();g.ellipse(26,38,3,4,0,0,7);g.ellipse(38,38,3,4,0,0,7);g.fill();g.fillStyle='#e8e0c8';for(const s of[-1,1]){g.beginPath();g.moveTo(32+s*10,32);g.quadraticCurveTo(32+s*24,22,32+s*20,8);g.lineTo(32+s*16,26);g.fill()}g.fillStyle='#0a0404';g.beginPath();g.ellipse(32,56,9,7,0,0,7);g.fill();for(let x=24;x<40;x+=4){g.fillStyle='#e8e0c8';g.beginPath();g.moveTo(x,49);g.lineTo(x+2,54);g.lineTo(x+4,49);g.fill()}break}
 case'dg4':{g.fillStyle=lg(40,62,'#c8b48a','#7a6448');g.fillRect(8,52,48,10);for(const[x,h]of[[12,30],[24,18],[40,34],[50,14]]){g.fillStyle=lg(52-h,52,'#e0d0b0','#9a8a6a');g.fillRect(x,52-h,7,h);g.fillRect(x-1,52-h,9,3)}g.fillStyle='#1a120a';g.beginPath();g.moveTo(22,62);g.lineTo(26,54);g.lineTo(38,54);g.lineTo(42,62);g.fill();for(let i=0;i<3;i++){g.fillStyle='#5a4a34';g.fillRect(26+i,56+i*2,12-i*2,1)}break}
 case'dg5':{g.fillStyle=lg(10,62,'#f4f0ff','#a8a0c0');g.fillRect(8,30,48,32);g.fillStyle=lg(4,30,'#c8b0f0','#6a4aa8');g.beginPath();g.moveTo(4,30);g.lineTo(32,8);g.lineTo(60,30);g.fill();for(const x of[11,21,39,49]){g.fillStyle='#fff';g.fillRect(x,32,5,30);g.fillStyle='#c8c0e0';g.fillRect(x+4,32,1,30)}g.fillStyle='#2a1a40';g.fillRect(27,40,10,22);g.fillStyle='#ffe08a';g.beginPath();g.arc(32,22,3,0,7);g.fill();break}
 case'dg6':{g.fillStyle=lg(0,62,'#3a1a2a','#0a0408');g.beginPath();g.moveTo(20,62);g.lineTo(26,6);g.lineTo(38,6);g.lineTo(44,62);g.fill();g.strokeStyle='#ff3a2a';g.lineWidth=1.5;g.beginPath();for(let t=0;t<1;t+=.02){const y=60-t*52,w=9-t*3,x=32+Math.sin(t*28)*w;t?g.lineTo(x,y):g.moveTo(x,y)}g.stroke();g.fillStyle='#ff4a3a';g.beginPath();g.arc(32,8,3,0,7);g.fill();g.fillStyle='rgba(120,0,40,.6)';g.beginPath();g.ellipse(32,60,20,4,0,0,7);g.fill();break}
 case'lamppost':g.fillStyle='#2a2a30';g.fillRect(30,40,4,72);g.fillRect(24,108,16,4);g.fillStyle='#3a3a44';g.fillRect(24,26,16,4);g.fillRect(26,44,12,3);g.fillStyle='rgba(255,230,150,.95)';g.fillRect(26,30,12,14);g.fillStyle='#2a2a30';g.beginPath();g.moveTo(22,27);g.lineTo(32,18);g.lineTo(42,27);g.fill();break;
 case'banner':g.fillStyle='#c8a040';g.fillRect(14,6,36,4);g.fillStyle=lg(10,100,'#c02a36','#6a1018');g.beginPath();g.moveTo(18,10);g.lineTo(46,10);g.lineTo(46,96);g.lineTo(32,84);g.lineTo(18,96);g.fill();g.fillStyle='#f0d060';g.beginPath();g.moveTo(32,30);g.lineTo(38,46);g.lineTo(32,62);g.lineTo(26,46);g.fill();break;
 case'well':g.fillStyle=lg(36,62,'#b8b0a0','#6a6458');g.beginPath();g.ellipse(32,50,20,9,0,0,7);g.fill();g.fillRect(12,40,40,12);g.fillStyle='#1a2a3a';g.beginPath();g.ellipse(32,40,16,6,0,0,7);g.fill();g.fillStyle='#6a4a2a';g.fillRect(14,10,4,32);g.fillRect(46,10,4,32);g.fillStyle='#a04a30';g.beginPath();g.moveTo(8,14);g.lineTo(32,2);g.lineTo(56,14);g.fill();g.fillStyle='#8a6a40';g.fillRect(30,14,4,14);break;
 case'fence':g.fillStyle='#8a5a32';for(const x of[6,22,38,54])g.fillRect(x,30,5,30);g.fillStyle='#a06a3a';g.fillRect(2,36,60,5);g.fillRect(2,50,60,5);break;
 case'spray':for(let i=0;i<40;i++){const a=Math.random()*Math.PI,r=Math.random()*20;g.fillStyle=`rgba(${200+Math.random()*55|0},${230+Math.random()*25|0},255,.7)`;g.fillRect(32+Math.cos(a)*r*1.2,56-Math.sin(a)*r*1.5-Math.random()*8,2,3)}g.fillStyle='#b8b4aa';g.fillRect(28,30,8,30);g.fillStyle='rgba(220,240,255,.9)';g.fillRect(30,10,4,22);break;
 case'throne':g.fillStyle=lg(4,62,'#f0d060','#8a6a20');g.fillRect(14,6,36,56);g.fillStyle=lg(10,50,'#c02a3a','#6a1020');g.fillRect(20,12,24,38);g.fillStyle='#f0d060';g.fillRect(10,40,44,6);g.beginPath();g.arc(32,8,6,0,7);g.fill();break;
 case'sign_inn':case'sign_shop':{g.fillStyle='#3a2a20';g.fillRect(30,0,4,10);g.fillStyle=lg(10,58,'#a07040','#5a3a1a');g.fillRect(6,10,52,44);g.strokeStyle='#e8c66a';g.lineWidth=2;g.strokeRect(8,12,48,40);g.fillStyle='#fff';g.font='bold 15px sans-serif';g.textAlign='center';g.fillText(kind==='sign_inn'?'INN':'SHOP',32,38);if(kind==='sign_inn'){g.fillStyle='#ffe08a';g.fillRect(22,42,20,5)}else{g.fillStyle='#7ae0a0';g.beginPath();g.arc(32,46,4,0,7);g.fill()}break}
 case'boat':g.fillStyle=lg(30,56,'#8a5a32','#3a2414');g.beginPath();g.moveTo(4,36);g.lineTo(60,36);g.lineTo(50,54);g.lineTo(12,54);g.fill();g.fillStyle='#5a3a20';g.fillRect(31,4,3,32);g.fillStyle='#f4f0e4';g.beginPath();g.moveTo(34,6);g.lineTo(54,32);g.lineTo(34,32);g.fill();g.fillStyle='rgba(220,240,255,.8)';g.fillRect(2,54,60,3);break;
 case'bench':g.fillStyle='#6a4426';g.fillRect(8,44,4,14);g.fillRect(52,44,4,14);g.fillStyle=lg(30,48,'#b07a44','#6a4426');g.fillRect(4,40,56,6);g.fillRect(4,28,56,5);g.fillRect(4,34,56,4);g.fillStyle='#3a2a1a';g.fillRect(10,28,3,18);g.fillRect(51,28,3,18);break;
 case'pot':g.fillStyle=lg(40,62,'#c8703a','#7a3a1a');g.beginPath();g.moveTo(20,40);g.lineTo(44,40);g.lineTo(40,62);g.lineTo(24,62);g.fill();g.fillStyle='#a85a2a';g.fillRect(18,38,28,5);for(const[x,y,r]of[[32,30,10],[24,34,7],[40,34,7]])blob(x,y,r,'#6ab848','#1e5a1e');for(let i=0;i<7;i++){g.fillStyle=pick(['#ff6a8a','#ffd04a','#fff']);g.beginPath();g.arc(20+Math.random()*24,24+Math.random()*14,2.5,0,7);g.fill()}break;
 case'stall':g.fillStyle='#5a3a20';g.fillRect(6,20,3,42);g.fillRect(55,20,3,42);g.fillStyle=lg(40,62,'#a07040','#5a3a1a');g.fillRect(4,42,56,20);for(let i=0;i<8;i++){g.fillStyle=i%2?'#f4f0e8':'#d83a3a';g.beginPath();g.moveTo(2+i*7.5,12);g.lineTo(9.5+i*7.5,12);g.lineTo(9.5+i*7.5,26);g.quadraticCurveTo(5.7+i*7.5,30,2+i*7.5,26);g.fill()}g.fillStyle='#b8302c';g.fillRect(2,8,60,5);for(let i=0;i<10;i++){blob(10+i*4.8,40,3.2,pick(['#ff5a3a','#ffd040','#8ad04a','#ff9a30']),'#5a2a10')}break;
 case'cart':g.fillStyle=lg(26,48,'#a87a48','#5a3a1a');g.fillRect(8,28,44,18);g.fillStyle='#4a2a14';g.fillRect(50,36,12,3);for(const x of[18,42]){g.fillStyle='#3a2414';g.beginPath();g.arc(x,50,9,0,7);g.fill();g.fillStyle='#8a6a40';g.beginPath();g.arc(x,50,6,0,7);g.fill();g.fillStyle='#3a2414';g.fillRect(x-1,42,2,16);g.fillRect(x-8,49,16,2)}for(let i=0;i<6;i++)blob(14+i*6,26,4,'#e8c860','#8a6a20');break;
 case'laundry':g.fillStyle='#6a4426';g.fillRect(4,10,3,52);g.fillRect(57,10,3,52);g.strokeStyle='#ddd';g.lineWidth=1;g.beginPath();g.moveTo(5,14);g.quadraticCurveTo(32,20,58,14);g.stroke();for(const[x,c,h]of[[12,'#f4f4f4',22],[26,'#8ab0e8',16],[40,'#f0c8d8',20]]){g.fillStyle=c;g.fillRect(x,17,11,h)}break;
 case'puff':{const l=g.createRadialGradient(32,32,0,32,32,30);l.addColorStop(0,'rgba(235,235,240,.9)');l.addColorStop(1,'rgba(235,235,240,0)');g.fillStyle=l;g.fillRect(0,0,64,64);break}
 case'shadow':{const l=g.createRadialGradient(32,32,0,32,32,32);l.addColorStop(0,'rgba(0,0,0,1)');l.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=l;g.fillRect(0,0,64,64);break}
 case'glow':{const l=g.createRadialGradient(32,32,0,32,32,32);l.addColorStop(0,'rgba(255,255,255,1)');l.addColorStop(.35,'rgba(255,255,255,.45)');l.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=l;g.fillRect(0,0,64,64);break}
 }
 return SPRC[kind]=c}
function canvasTex(kind){if(GLT[kind])return GLT[kind];return GLT[kind]=glTexFromImg(sprCanvas(kind))}
const PROPS={forest:['bush','bush','mush','flowers','rock','bush'],cave:['rock','rock','crystal','bones'],sea:['barrel','crate','barrel','rock'],mountain:['bones','rock','rock','crystal'],ruins:['urn','rock','candle','bones'],temple:['statue','candela','urn','candela'],abyss:['skulls','bones','crystal','skulls']};
const GLOWP={mush:[.3,1,.9],crystal:[.4,.9,1],candle:[1,.7,.3],candela:[1,.7,.3]};
function m4mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+r]*b[c*4+k];o[c*4+r]=s}return o}
function persp(fy,as,n,f){const t=1/Math.tan(fy/2);return new Float32Array([t/as,0,0,0,0,t,0,0,0,0,(f+n)/(n-f),-1,0,0,2*f*n/(n-f),0])}
function lookAt(e,c,u){const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],nrm=a=>{const l=Math.hypot(...a);return[a[0]/l,a[1]/l,a[2]/l]},cr=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dt=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
 const z=nrm(sub(e,c)),x=nrm(cr(u,z)),y=cr(z,x);return{m:new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dt(x,e),-dt(y,e),-dt(z,e),1]),x,y,z}}
function heroTex(id){const im=art(id);if(!im)return null;return GLT['hero_'+id]||(GLT['hero_'+id]=glTexFromImg(im))}
function glRender(){const g=GL,m=D.m,th=DUN[D.ci].theme,pal=DPAL[th],P_=GLP;
 g.viewport(0,0,dcv.width,dcv.height);const fc=pal.fog.map(v=>v/255*.55);g.clearColor(fc[0],fc[1],fc[2],1);g.clear(g.COLOR_BUFFER_BIT|g.DEPTH_BUFFER_BIT);
 D.cx+=(D.ax-D.cx)*.1;D.cz+=(D.ay-D.cz)*.1;const orb=D.gy*.6,tilt=D.gp*.5;const dist=4.9,hgt=5.5+tilt*2;
 const tgt=[D.cx,.35,D.cz-.5],eye=[D.cx+Math.sin(orb)*dist,hgt,D.cz-.5+Math.cos(orb)*dist];const asp=dcv.width/dcv.height;
 const V=lookAt(eye,tgt,[0,1,0]),VP=m4mul(persp(asp<.75?.92:.78,asp,.1,60),V.m);
 g.useProgram(P_.p);g.uniformMatrix4fv(P_.uVP,false,VP);g.uniform3fv(P_.uAmb,pal.amb.map(v=>v*.85));g.uniform3fv(P_.uFog,fc);g.uniform3fv(P_.uLc,pal.lamp);g.uniform3f(P_.uPl,D.ax,1.4,D.ay);g.uniform2f(P_.uCut,D.ax+Math.sin(orb)*0,D.ay);g.uniform1f(P_.uTop,th==='forest'?1.1:.62);g.uniform2f(P_.uFogR,4.6,9);g.uniform1f(P_.uSun,0);g.uniform1f(P_.uDith,0);g.uniform1f(P_.uCutOn,1);
 const fl=.92+.08*Math.sin(time*9)*Math.sin(time*5.3);g.uniform1f(P_.uFl,fl);
 const near=D.lamps.map(l=>[l,(l[0]-D.ax)**2+(l[2]-D.ay)**2]).sort((a,b)=>a[1]-b[1]).slice(0,12);const arr=new Float32Array(36);near.forEach(([l],i)=>{arr[i*3]=l[0];arr[i*3+1]=l[1];arr[i*3+2]=l[2]});g.uniform3fv(P_.uL,arr);g.uniform1i(P_.uLn,near.length);
 g.activeTexture(g.TEXTURE0);g.uniform1i(P_.uT,0);g.bindTexture(g.TEXTURE_2D,D_ATLAS);g.disable(g.BLEND);g.depthMask(true);
 g.uniform1f(P_.uMode,0);glDraw(GLB.floor.b,GLB.floor.n);g.uniform1f(P_.uMode,1);glDraw(GLB.wall.b,GLB.wall.n);if(GLB.gate&&!D.gateOpen){g.uniform1f(P_.uMode,0);glDraw(GLB.gate.b,GLB.gate.n)}
 const R=V.x,U=V.y;
 const quad=(cx,cz,w,h,yoff,flip)=>{const a=[];const b=[cx,yoff||0,cz];const P=(sx,sy)=>[b[0]+R[0]*sx*w+U[0]*sy*h,b[1]+R[1]*sx*w+U[1]*sy*h,b[2]+R[2]*sx*w+U[2]*sy*h];const u0=flip?1:0,u1=flip?0:1;
  const A=P(-.5,0),Bq=P(.5,0),C=P(.5,1),Dq=P(-.5,1);const pv=(p,u,v)=>a.push(p[0],p[1],p[2],0,0,1,u,v,1);pv(A,u0,1);pv(Bq,u1,1);pv(C,u1,0);pv(A,u0,1);pv(C,u1,0);pv(Dq,u0,0);return new Float32Array(a)};
 const flat=(cx,cz,sx,sz)=>{const a=[];const pv=(x,z,u,v)=>a.push(x,.012,z,0,1,0,u,v,1);pv(cx-sx,cz+sz,0,1);pv(cx+sx,cz+sz,1,1);pv(cx+sx,cz-sz,1,0);pv(cx-sx,cz+sz,0,1);pv(cx+sx,cz-sz,1,0);pv(cx-sx,cz-sz,0,0);return new Float32Array(a)};
 const drawDyn=(arr,tex,mode,tint)=>{g.bindBuffer(g.ARRAY_BUFFER,GLB.dyn);g.bufferData(g.ARRAY_BUFFER,arr,g.DYNAMIC_DRAW);g.bindTexture(g.TEXTURE_2D,tex);g.uniform1f(P_.uMode,mode);if(tint)g.uniform4fv(P_.uTint,tint);glDraw(GLB.dyn,arr.length/9)};
 const cell=i=>[(i%m.w)+.5,((i/m.w)|0)+.5];const spr=[];
 for(const c of m.chests)spr.push([cell(c),P.dchest&&P.dchest['n'+D.ci+':'+c]?'chesto':'chest',.6,.6]);if(m.key>=0&&!D.keyGot)spr.push([cell(m.key),'keychest',.6,.6]);spr.push([cell(m.spring),'spring',.8,.8]);if(P.cleared[CHAPTERS[DUN[D.ci].ch].stages[CHAPTERS[DUN[D.ci].ch].stages.length-1].id])spr.push([cell(m.G),'goal',1,1.15]);if(D.y*m.w+D.x!==m.S)spr.push([cell(m.S),'stair',.6,.6]);
 const view=(x,z)=>Math.abs(x-D.cx)<7&&z-D.cz<5&&D.cz-z<9;
 for(const pr of D.props)if(view(pr.x,pr.z))spr.push([[pr.x,pr.z],pr.k,pr.s*(pr.k==='tree'||pr.k==='pine'?1:1),pr.k==='tree'||pr.k==='pine'?pr.s*1.75:pr.s]);
 const party=P.party.map(uid=>uById(uid)).filter(Boolean);const walkers=[];
 party.slice(0,4).forEach((u,i)=>{let p;if(i===0)p=[D.ax,D.ay];else{const t=D.trail[Math.min(D.trail.length-1,i*9)];p=t||[D.ax,D.ay]}walkers.push([p,u,i])});
 g.enable(g.BLEND);g.blendFunc(g.SRC_ALPHA,g.ONE_MINUS_SRC_ALPHA);g.depthMask(false);const shT=canvasTex('shadow');for(const[p]of walkers)drawDyn(flat(p[0],p[1],.34,.2),shT,4);for(const[p,k,w]of spr)if(k!=='goal'&&k!=='stair')drawDyn(flat(p[0],p[1],w*.42,w*.22),shT,4);g.depthMask(true);g.disable(g.BLEND);
 for(const[p,k,w,h]of spr)drawDyn(quad(p[0],p[1],w,h),canvasTex(k),2);
 for(const[p,u,i]of walkers.slice().reverse()){const tx=heroTex(u.id);if(!tx)continue;const im=art(u.id),h=i?1.05:1.2,w=h*im.naturalWidth/im.naturalHeight;const bob=D.spd>.1?Math.abs(Math.sin(D.walkT*1.6+i))*.03:0;drawDyn(quad(p[0],p[1]+.02*i,w,h,bob,D.face<0),tx,2)}
 const bossL=[];for(const b of m.bosses){const st=CHAPTERS[DUN[D.ci].ch].stages[b.si];if(P.cleared[st.id])continue;const pid=bossOf(st),tx=heroTex(pid);if(!tx||!view(...cell(b.c)))continue;const im=art(pid),bh=b.si===CHAPTERS[DUN[D.ci].ch].stages.length-1?1.75:1.45,bw=bh*im.naturalWidth/im.naturalHeight;const p=cell(b.c);bossL.push(p);drawDyn(quad(p[0],p[1],bw,bh,Math.sin(time*2+b.si)*.04),tx,2)}
 g.enable(g.BLEND);g.blendFunc(g.ONE,g.ONE);g.depthMask(false);const gl_=canvasTex('glow');
 for(const p of bossL)drawDyn(quad(p[0],p[1],2,2,-.3),gl_,3,[.8,.1,.3,.45+.15*Math.sin(time*3)]);
 for(const[l]of near)drawDyn(quad(l[0],l[2],1.1,1.1,l[1]-.55),gl_,3,[1,.62,.3,.65*fl]);
 for(const pr of D.props){const gc=GLOWP[pr.k];if(gc&&view(pr.x,pr.z))drawDyn(quad(pr.x,pr.z,.9,.7,0),gl_,3,[gc[0],gc[1],gc[2],.45*fl])}
 const sp=cell(m.spring);drawDyn(quad(sp[0],sp[1],1.4,1.2,-.1),gl_,3,[.3,.7,1,.5]);const gg=cell(m.G);drawDyn(quad(gg[0],gg[1],1.6,1.6,0),gl_,3,[.7,.3,1,.55]);
 const MC={forest:[.8,1,.4],cave:[1,.5,.15],sea:[.4,.8,1],mountain:[1,.55,.2],ruins:[1,.9,.6],temple:[1,.85,.4],abyss:[1,.2,.15]}[th];
 if(!D.motes){D.motes=[];for(let i=0;i<40;i++)D.motes.push({x:D.ax+(Math.random()-.5)*12,z:D.ay+(Math.random()-.5)*12,y:.2+Math.random()*1.4,ph:Math.random()*7,sp:.3+Math.random()*.5})}
 for(const mo of D.motes){mo.ph+=.016;mo.y+=(th==='cave'||th==='mountain'?.006:Math.sin(mo.ph*1.3)*.003);mo.x+=Math.sin(mo.ph*mo.sp)*.005;mo.z+=Math.cos(mo.ph*mo.sp*.8)*.005;if(mo.y>2)mo.y=.1;if(Math.abs(mo.x-D.ax)>6||Math.abs(mo.z-D.ay)>6){mo.x=D.ax+(Math.random()-.5)*12;mo.z=D.ay+(Math.random()-.5)*12}
  drawDyn(quad(mo.x,mo.z,.13,.13,mo.y),gl_,3,[MC[0],MC[1],MC[2],(.55+.45*Math.sin(mo.ph*3))*.9])}
 g.depthMask(true);g.disable(g.BLEND)}
function drawOverlay(){const W=OW,H=OH,m=D.m;octx.clearRect(0,0,W,H);
 const vg=octx.createRadialGradient(W/2,H*.5,Math.min(W,H)*.34,W/2,H*.5,Math.max(W,H)*.74);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.6)');octx.fillStyle=vg;octx.fillRect(0,0,W,H);
 const tx=(t,x,y,c,s)=>{octx.font=`700 ${s}px 'M PLUS 1p',sans-serif`;octx.textAlign='center';octx.fillStyle='rgba(0,0,0,.8)';octx.fillText(t,x+1,y+1);octx.fillStyle=c;octx.fillText(t,x,y)};
 octx.fillStyle='rgba(0,0,0,.45)';octx.fillRect(W/2-62,6,124,20);tx(`${DUN[D.ci].name}${D.key?'　鍵あり':''}`,W/2,21,'#f0e0b0',12);
 const cs=D.big?Math.floor(Math.min((W-20)/m.w,(H-50)/m.h)):4,ox=D.big?Math.floor((W-cs*m.w)/2):6,oy=D.big?Math.floor((H-cs*m.h)/2):6;
 if(D.big){octx.fillStyle='rgba(0,0,8,.88)';octx.fillRect(0,0,W,H)}else{octx.fillStyle='rgba(0,0,0,.45)';octx.fillRect(ox-1,oy-1,cs*m.w+2,cs*m.h+2)}
 for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){const i=y*m.w+x;if(!D.seen[i])continue;const t=m.T[i];octx.fillStyle=m.g[i]?'rgba(70,80,90,.9)':m.bossAt[i]>=0&&!P.cleared[CHAPTERS[DUN[D.ci].ch].stages[m.bossAt[i]].id]?'#ff3a3a':t===2?(P.dchest&&P.dchest['n'+D.ci+':'+i]?'#7a6a4a':'#ffd040'):t===6?(D.keyGot?'#7a6a4a':'#e0e0f0'):t===5?(D.gateOpen?'#c8c0b0':'#606068'):t===3?'#4ac8ff':t===4?'#c060ff':i===m.S?'#9ab':'#c8c0b0';octx.fillRect(ox+x*cs,oy+y*cs,cs,cs)}
 octx.fillStyle='#ff4a4a';octx.beginPath();octx.arc(ox+D.ax*cs,oy+D.ay*cs,Math.max(2,cs*.45),0,7);octx.fill();
 if(D.big)tx('タップで閉じる',W/2,H-14,'#aab',11)}

function dLv(ci){const ch=CHAPTERS[ci];return ch.stages[Math.max(0,ch.stages.length-2)].lv+1}
function dungeonOpen(ci){const ch=CHAPTERS[ci];return!!P.cleared[ch.stages[ch.stages.length-2].id]}
function dLootCount(ci){const m=genMaze(ci);return m.chests.filter(c=>P.dchest&&P.dchest['n'+ci+':'+c]).length}
async function prepDungeon(ci){const d=DUN[ci],m=genMaze(ci);
 const c=await modal(`<h3>3Dダンジョン「${d.name}」</h3><p style="text-align:center;font-size:13px">推奨Lv ${dLv(ci)}　宝箱 ${dLootCount(ci)}/${m.chests.length}${P.dclear&&P.dclear[ci]?'　踏破済み':''}</p><p style="font-size:13px;line-height:1.7">斜め上からの3D視点で迷宮を探索します。最深部の紫の門で、この章の魔神に挑めます。\n\n・<b>左下のスティック</b>で移動、<b>画面をドラッグ</b>でカメラを回り込ませる（ダブルタップで戻す）\n・<b>ジャイロ</b>ボタンをONにすると、スマホの傾きでカメラが動きます（対応環境のみ）\n・鉄格子は鉄の箱に入った<b>鍵</b>で開く\n・HP・MPは戦闘ごとに回復しません。青い泉で全回復</p>`,[{l:'探索する',c:'g'},{l:'もどる'}]);
 if(c===0)enterDungeon(ci)}
async function enterDungeon(ci){loadTownBG('d'+ci);if(ci<DUN.length-1)setTimeout(()=>loadTownBG('d'+(ci+1)),4000);const m=genMaze(ci);if(!glInit()){await modal('<h3>3D表示に対応していません</h3><p style="text-align:center">このブラウザではWebGLが使えないため、ダンジョンを表示できません。</p>');return}
 await fade(true);const sx=m.S%m.w,sy=(m.S/m.w)|0;let yaw=0;for(let k=0;k<4;k++)if(!m.g[(sy+DXY[k][1])*m.w+sx+DXY[k][0]]){yaw=[Math.PI/2,Math.PI,-Math.PI/2,0][k];break}
 D={world:false,ci,m,x:sx,y:sy,ax:sx+.5,ay:sy+.5,cx:sx+.5,cz:sy+.5,face:1,trail:[],props:[],yaw,pitch:-.05,gy:0,gp:0,roll:0,spd:0,walkT:0,walk:0,busy:false,st:{},seen:new Uint8Array(m.w*m.h),big:false,key:false,gateOpen:false,keyGot:0,enc:rnd(9,15),jx:0,jy:0,turn:0,hurt:0,lastYaw:yaw};
 D_ATLAS=atlasFor(DUN[ci].theme);
 const lamps=[];for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){if(m.g[y*m.w+x])continue;for(let k=0;k<4;k++){const wx=x+DXY[k][0],wy=y+DXY[k][1];if(wx<0||wy<0||wx>=m.w||wy>=m.h||!m.g[wy*m.w+wx])continue;if(faceKind(x,y,k)==='lamp')lamps.push([x+.5+DXY[k][0]*.44,WH*.62,y+.5+DXY[k][1]*.44])}}D.lamps=lamps;
 WH=DUN[ci].theme==='forest'?1.0:1.15;dProps();freeMesh();buildMesh();dSee();scene='dungeon';setMode('field');resize();dResize();updDpan();playBGM('dungeon',true);await fade(false);toast(DUN[ci].name);
 if(!P.dvis)P.dvis={};if(!P.dvis['n'+ci]){P.dvis['n'+ci]=1;save();const pre=(STAGES[STAGE_ORDER[ci]].pre||[]).filter(l=>!/^(はるか昔|ある夜)/.test(l[1]));if(pre.length){D.busy=true;await talk(pre);D.busy=false}}}
function dSee(){const m=D.m;for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++){const x=D.x+i,y=D.y+j;if(x>=0&&y>=0&&x<m.w&&y<m.h&&Math.abs(i)+Math.abs(j)<=3)D.seen[y*m.w+x]=1}}
const dCanAct=()=>D&&scene==='dungeon'&&!D.busy&&!D.big&&$('#modal').style.display!=='flex'&&$('#talk').style.display!=='block';
const PR=.24;
function dBlocked(x,z){if(D.town&&npcHit(x,z))return 4;for(const[ox,oz]of[[-PR,-PR],[PR,-PR],[-PR,PR],[PR,PR]]){const s=dSolid(Math.floor(x+ox),Math.floor(z+oz));if(s)return s}return 0}
function dTryGate(x,z){if(dBlocked(x,z)!==2)return;if(D.key){D.gateOpen=true;D.key=false;SFX.coin();toast('鍵を使って鉄格子を開けた！')}else if(!D.gateMsg||time-D.gateMsg>3){D.gateMsg=time;SFX.ng();toast('鉄格子が閉まっている。どこかに鍵があるはず……')}}
function dStop(){if(!D)return;D.jx=D.jy=0;D.turn=0;joyReset()}
function updateDungeon(dt){if(!D)return;updateNpcs(dt);if(D.hurt>0)D.hurt-=dt*2;
 if(dCanAct()){let mx=D.jx,mz=D.jy;const len=Math.hypot(mx,mz);if(len>1){mx/=len;mz/=len}
  const sp=(D.world?(D.veh==='air'?9:D.veh==='ship'?6.5:4.5):3.3)*dt,dx=mx*sp,dz=mz*sp;const ox=D.ax,oz=D.ay;if(mx>.1)D.face=1;else if(mx<-.1)D.face=-1;if(Math.abs(mx)+Math.abs(mz)>.15)D.wdir=Math.abs(mx)>Math.abs(mz)*1.1?(mx>0?'R':'L'):(mz>0?0:2);
  if(dx){if(!dBlocked(D.ax+dx,D.ay))D.ax+=dx;else dBump(D.ax+dx,D.ay)}if(dz&&!D.busy){if(!dBlocked(D.ax,D.ay+dz))D.ay+=dz;else dBump(D.ax,D.ay+dz)}
  const moved=Math.hypot(D.ax-ox,D.ay-oz);D.spd+=((moved>0?1:0)-D.spd)*Math.min(1,dt*8);D.walkT+=moved*6;D.walk+=moved;
  if(moved>0){const last=D.trail[0];if(!last||Math.hypot(last[0]-D.ax,last[1]-D.ay)>.06){D.trail.unshift([D.ax,D.ay]);if(D.trail.length>40)D.trail.pop()}}
  if(moved>0&&Math.floor(D.walkT/Math.PI)!==Math.floor((D.walkT-moved*6)/Math.PI))tone(65+Math.random()*20,.05,'triangle',.05);
  const cx=Math.floor(D.ax),cy=Math.floor(D.ay);if(cx!==D.x||cy!==D.y){D.x=cx;D.y=cy;(D.world?wArrive:D.town?tArrive:dArrive)().catch(e=>console.error(e))}
  if(D.walk>=1&&!D.busy){D.walk-=1;if(D.world){if(!D.veh&&wEncOk()&&--D.enc<=0){D.busy=true;D.enc=rnd(14,24);wBattle()}}else if(!D.town&&D.y*D.m.w+D.x!==D.m.S&&D.m.T[D.y*D.m.w+D.x]===0&&--D.enc<=0){D.busy=true;D.enc=rnd(10,17);dBattle()}}}
 else D.spd+=(0-D.spd)*Math.min(1,dt*8)}
function dProps(){const m=D.m,th=DUN[D.ci].theme,r=srng(DUN[D.ci].seed*7+3),list=PROPS[th]||PROPS.ruins;const used=new Set([m.S,m.G,m.spring,m.gate,m.key,...m.chests]);
 for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){const i=y*m.w+x;
  if(m.g[i]){if(th==='forest'){let near=false;for(const[dx,dy]of DXY){const nx=x+dx,ny=y+dy;if(nx>=0&&ny>=0&&nx<m.w&&ny<m.h&&!m.g[ny*m.w+nx])near=true}if(near&&r()<.3)D.props.push({x:x+.3+r()*.4,z:y+.3+r()*.4,k:r()<.6?'tree':'pine',s:1.3+r()*.5})}continue}
  if(used.has(i)||r()>.32)continue;const walls=DXY.filter(([dx,dy])=>m.g[(y+dy)*m.w+x+dx]);if(!walls.length)continue;const[dx,dy]=walls[Math.floor(r()*walls.length)];
  D.props.push({x:x+.5+dx*.32+(dy?(r()-.5)*.5:0),z:y+.5+dy*.32+(dx?(r()-.5)*.5:0),k:list[Math.floor(r()*list.length)],s:.42+r()*.2})}}
/* ---- input: joystick / drag-look / gyro / keys ---- */
const joy=$('#joy'),knob=$('#joy i');let joyId=null,joyC=null;
function joyReset(){joyId=null;knob.style.transform='translate(-50%,-50%)';if(D){D.jx=D.jy=0}}
joy.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();initAudio();joyId=e.pointerId;const r=joy.getBoundingClientRect();joyC=[r.left+r.width/2,r.top+r.height/2];try{joy.setPointerCapture(e.pointerId)}catch(_){}joyMove(e)});
function joyMove(e){if(e.pointerId!==joyId||!D)return;let dx=e.clientX-joyC[0],dy=e.clientY-joyC[1];const R=44,l=Math.hypot(dx,dy);if(l>R){dx*=R/l;dy*=R/l}knob.style.transform=`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px))`;D.jx=dx/R;D.jy=dy/R;if(Math.abs(D.jx)<.15)D.jx=0;if(Math.abs(D.jy)<.15)D.jy=0}
joy.addEventListener('pointermove',joyMove);joy.addEventListener('pointerup',e=>{if(e.pointerId===joyId)joyReset()});joy.addEventListener('pointercancel',joyReset);
let lookId=null,lookP=null,lookMoved=0;
let mvId=null;function mvLead(){const dc=$('#dcv'),r0=dc.getBoundingClientRect(),r=r0.width?r0:dov.getBoundingClientRect(),lc=D&&D.leadCv;if(!lc)return[r.left+r.width/2,r.top+r.height/2];return[r.left+lc[0]*r.width/dc.width,r.top+lc[1]*r.height/dc.height]}
function mvUpd(e){if(!D)return;const[lx,ly]=mvLead();let dx=e.clientX-lx,dy=e.clientY-ly;const l=Math.hypot(dx,dy);if(l<12){D.jx=D.jy=0;return}const k=Math.min(1,l/46)/l;D.jx=dx*k;D.jy=dy*k}
dov.addEventListener('pointerdown',e=>{if(scene!=='dungeon'||!D)return;initAudio();if(D.big){D.big=false;return}if(D.leadCv&&dCanAct()){mvId=e.pointerId;try{dov.setPointerCapture(e.pointerId)}catch(_){}mvUpd(e);return}lookId=e.pointerId;lookP=[e.clientX,e.clientY];lookMoved=0;try{dov.setPointerCapture(e.pointerId)}catch(_){}});
dov.addEventListener('pointermove',e=>{if(e.pointerId===mvId){mvUpd(e);return}if(e.pointerId!==lookId||!D||!dCanAct())return;const dx=e.clientX-lookP[0],dy=e.clientY-lookP[1];lookP=[e.clientX,e.clientY];if(!gyroOn){D.gy=clamp(D.gy+dx*.004,-.8,.8);D.gp=clamp(D.gp+dy*.003,-.5,.5)}});
dov.addEventListener('dblclick',()=>{if(D){D.gy=0;D.gp=0}});
dov.addEventListener('pointerup',e=>{if(e.pointerId===mvId){mvId=null;if(D){D.jx=D.jy=0}}if(e.pointerId===lookId)lookId=null});dov.addEventListener('pointercancel',e=>{if(e.pointerId===mvId){mvId=null;if(D){D.jx=D.jy=0}}});dov.addEventListener('pointercancel',()=>{lookId=null});
let gyroOn=false,gyroBase=null,gyroGot=false;
function onOri(e){if(!gyroOn||!D||e.alpha==null)return;gyroGot=true;const a=e.alpha*Math.PI/180,b=e.beta*Math.PI/180;if(!gyroBase)gyroBase={a,b,yaw:D.yaw+D.gy,pitch:D.pitch};let da=a-gyroBase.a;da=Math.atan2(Math.sin(da),Math.cos(da));
 const ty=clamp(-da,-.8,.8),tp=clamp(b-gyroBase.b,-.5,.5);D.gy+=(ty-D.gy)*.35;D.gp+=(tp-D.gp)*.35}
async function gyroToggle(){initAudio();const btn=$('#dGyro');if(gyroOn){gyroOn=false;btn.classList.remove('on');if(D){D.gy=D.gp=0}toast('ジャイロ：OFF');return}
 try{if(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function'){const r=await DeviceOrientationEvent.requestPermission();if(r!=='granted'){toast('ジャイロの使用が許可されませんでした');return}}}catch(err){toast('この環境ではジャイロを使えません');return}
 gyroOn=true;gyroBase=null;gyroGot=false;btn.classList.add('on');window.addEventListener('deviceorientation',onOri);toast('ジャイロ：ON　スマホを傾けるとカメラが回り込みます');
 setTimeout(()=>{if(gyroOn&&!gyroGot){gyroOn=false;btn.classList.remove('on');toast('この環境ではジャイロのデータが届きません（ドラッグで見回せます）',3200)}},1800)}
$('#dGyro').addEventListener('click',()=>{if(D&&D.town)townMenu();else if(D&&D.world&&D.veh)vehLand()});
$('#dMap').onclick=()=>{if(!D)return;D.big=!D.big;SFX.cur()};$('#dExit').onclick=()=>{if(D&&!D.busy)openMenu()};
$$('#dctl button').forEach(b=>{const k=b.dataset.k;b.addEventListener('pointerdown',e=>{e.preventDefault();if(!D)return;if(k==='tl')D.turn=-1;if(k==='tr')D.turn=1});const rel=()=>{if(D)D.turn=0};b.addEventListener('pointerup',rel);b.addEventListener('pointerleave',rel);b.addEventListener('pointercancel',rel)});
const KS={};window.addEventListener('keydown',e=>{if(scene!=='dungeon'||!D)return;KS[e.key]=1;kApply();if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','q','e'].includes(e.key))e.preventDefault();if(e.key==='m')D.big=!D.big});
window.addEventListener('keyup',e=>{KS[e.key]=0;if(scene==='dungeon'&&D)kApply()});
function kApply(){D.jy=(KS.w||KS.ArrowUp?-1:0)+(KS.s||KS.ArrowDown?1:0);D.jx=(KS.d||KS.ArrowRight?1:0)+(KS.a||KS.ArrowLeft?-1:0)}
window.addEventListener('resize',()=>{if(scene==='dungeon')dResize()});

/* ================= RPG ================= */
/* ================= STORY v2 ================= */
const STORY={
'1-1':{pre:[['allen','森の様子がおかしい……空の色まで変わってる。'],['stella','星詠みでは、この森の奥に「指輪のかけら」の光が見えました。'],['gard','あの大臣ヴァルド、やけに急かしてやがったな。……気に入らねえ。'],['allen','……父さんの剣が、震えてる？'],['stella','気をつけて。魔物が来ます！']],
 btalk:[['stolas','ホウ……人の子か。我は序列三十六位、君主ストラス。星の知恵を喰らう者。'],['stolas','その剣……懐かしい星の匂いがする。ソロモンの「番人」の剣か。'],['allen','番人……？ 何のことだ！'],['stolas','知らぬのか。ならば教えるまい。ホウ、ホウ……']],
 post:[['stolas','ホウ……あの方はすでに目覚めておられる。王都の中にも、影はあるぞ……'],['N','アレンの剣が青く輝き、ストラスの影を吸いこんだ。'],['gard','おい……今、剣が魔神を食ったぞ！？'],['allen','わからない……これは父さんの形見ってだけで……']]},
'1-2':{pre:[['stella','……星の声が、乱れています。森の奥で、誰かが魔物に襲われているみたい……！'],['allen','本当か！？ 急ごう！'],['stella','アレンさん、さっきの剣の光……「星の番人」の伝承によく似ています。'],['allen','番人……あのフクロウも同じことを言ってた。']],
 btalk:[['marbas','序列五位、総裁マルバス。病も癒しも、我が爪ひとつよ。'],['marbas','小僧……その剣の中に何を飼っている？ 指輪の匂いがぷんぷんするぞ。'],['gard','でっかいライオンだな……燃えてきたぜ！']],
 post:[['N','再び剣が輝き、マルバスを吸いこんだ。'],['stella','間違いありません。柄に「指輪のかけら」が埋め込まれています。'],['allen','父さんは……いったい何者だったんだ。']]},
'1-3':{pre:[['stella','泉のほとりに人が……魔物に囲まれています！']],
 btalk:[['vine','我は序列四十五位、王ヴィネ。巫女のかけらと番人の剣、二つまとめていただく。'],['sion','くっ……これ以上は持たない……！ ……その剣、まさか「星の番人」の剣か！？']],
 post:[['sion','助かった……私はシオン。王立学院の魔導士で、ソロモンの古文書を調べている。'],['stella','アレンさん、その剣は「星の番人」の剣。指輪を守る一族だけが持つものです。お父様は……？'],['allen','十年前、魔物に襲われて死んだと聞いてる。'],['stella','……そうですか。'],['stella','指輪はかけらとなって世界に散りました。かけらの光で、魔神を封じ直せます。'],['stella','……本当は、姉のカグヤが巫女を継ぐはずでした。でも十年前、月の夜に姿を消してしまって。'],['sion','七十二柱すべてを封じる旅か……。私も同行させてくれ。古文書の知識が、きっと役に立つ。'],['allen','もちろんだ。行こう、みんな！'],['gard','（……巫女ってのは、なんで目をそらしたんだ？）']]},
'2-1':{pre:[['stella','東の坑道から、強い炎の気配がします。'],['sion','熱い……壁まで燃えているとは。'],['?','そこの人たち、伏せて！'],['N','炎の中から飛び出した魔物を、一本の矢が射抜いた。'],['fio','危なかったね！ ……風が騒いでるの。「炎の奥で、誰かが泣いてる」って。']],
 btalk:[['aunas','序列五十八位、総裁アウナス……燃えろ……王都の欲が、我を呼び起こした……'],['stella','王都の……欲？'],['fio','わっ、炎そのものが魔神！？']],
 post:[['N','アウナスの炎は、かけらの光に吸いこまれていった。'],['fio','ねえ。この坑道、魔神が出るずっと前から、王都の兵が何か掘ってたんだって。'],['sion','王都の兵が……？ いったい何を。']]},
'2-2':{pre:[['allen','骸骨の兵が陣を……この鎧、リーフ王国の紋章だ！'],['gard','……十五年前に消えた、第三騎士団の鎧だ。'],['allen','知ってるのか、ガルド？'],['gard','……俺の、昔の仲間だよ。']],
 btalk:[['alloces','序列五十二位、公爵アラケス！ 我が軍団は、王都に捨てられた兵の骸よ！'],['gard','あいつらを……てめえの駒にしやがって！']],
 post:[['alloces','見事……。アモン殿に問うがよい。なぜ王都がこの山を掘らせたのか、とな……'],['gard','……みんな、安らかに眠ってくれ。']]},
'2-3':{pre:[['stella','坑道の底……巨大な採掘跡です。'],['sion','この青い鉱石……「星鉄」だ。指輪と同じ素材を掘っていたのか！']],
 btalk:[['amon','序列七位、侯爵アモン。過去も未来も見通す我に、勝てると思うてか。'],['amon','人の子よ。汝らの王が三千年前、ソロモンと結んだ「盟約」を知らぬのか？'],['allen','盟約……？'],['fio','狼に、カラスの頭に、蛇のしっぽ……ぜんぶ盛り！？']],
 post:[['N','アモンは炎とともにかけらへ吸いこまれた。'],['?','フン……やるじゃないか。'],['xenon','俺はゼノン。指輪を砕いたのは……この俺だ。'],['stella','なぜ、そんなことを！'],['xenon','理由を知りたければ港まで来い。……それと巫女。自分の「役目」を、仲間に話したらどうだ。'],['stella','……っ！'],['N','ゼノンは闇の中へ消えた。'],['allen','ステラ……役目って？'],['stella','……いつか、ちゃんと話します。今は、まだ。']]},
'3-1':{pre:[['stella','沈没船……骸骨の兵たちは、ここから港町へ上がっていたんですね。'],['fio','船の中に、まだたくさんいる気配がする。']],
 btalk:[['halphas','ガァ！ 序列三十八位、伯爵ハルファス！ この船の積荷は、もとは王のものよ！'],['gard','コウノトリが兵隊を率いてんのかよ！']],
 post:[['N','ハルファスが封じられると、骸骨の兵たちも崩れ去った。'],['fio','見て、積荷の箱……王家の紋章が入ってる！'],['sion','中身は星鉄の延べ棒……。王都はこれで、何を作ろうとしていた？']]},
'3-2':{pre:[['stella','海の底から……三つの首を持つ魔神の気配。'],['?','待て。それは私の獲物だ。'],['shino','……妖刀・紫雲のシノ。魔神を斬るのが、私の務め。']],
 btalk:[['bune','序列二十六位、公爵ブネ。三つの首が、汝らの三つの死をうたう。'],['bune','……そこの女。あの夜、燃えた国の生き残りか。'],['shino','……黙れ。'],['fio','人と犬と鳥の頭……気持ち悪っ！']],
 post:[['shino','私の国アルセアは十五年前、一夜にして魔神に滅ぼされた。'],['shino','指輪が砕ける……ずっと前の話だ。'],['sion','指輪が砕ける前に、魔神が？ それは……ありえないはずだ。']]},
'3-3':{pre:[['xenon','来たか。……先に海の主を片付けてもらおう。'],['allen','ゼノン！ 待て！']],
 btalk:[['forneus','序列三十位、侯爵フォルネウス。深き海へ沈むがよい！'],['forneus','ゼノンよ……汝の「約束の代価」は、まだ支払われておらぬぞ？'],['xenon','……黙れ。'],['shino','大きい……船ごと呑まれそうね。']],
 post:[['N','巨大な海の魔神も、かけらの光に封じられた。'],['xenon','……十五年前、アルセアを滅ぼしたのは、王都が作った「偽りの指輪」だ。'],['xenon','星鉄で作った模造品。魔神の力だけを引き出そうとした、愚かな実験だ。'],['shino','なん……だと……！'],['xenon','首謀者は大臣ヴァルド。……竜の山脈へ行け。プルソンが、隠された真実を知っている。'],['N','ゼノンは去った。シノは、刀の柄を強く握りしめていた。'],['stella','あの人……どうしてあんなに悲しそうな目をしているの？']]},
'4-1':{pre:[['stella','山脈に、翼をもつ獣の魔神がいます。'],['sion','セレスの古文書が正しければ……指輪を戻す方法は、あれしかない。']],
 btalk:[['marchosias','序列三十五位、侯爵マルコシアス。……かつては天の戦士だった我も、今は獣よ。'],['marchosias','星詠みの娘よ。汝もまた、我と同じ……運命に縛られた者だな。'],['stella','……。']],
 post:[['marchosias','いつか……玉座に戻れる日が……'],['marchosias','娘よ。命を捧げずとも、指輪を戻す道はある。「七十二の誓い」を探せ……'],['marchosias','……そして気をつけよ。月の娘が、天の玉座を狙っている……'],['stella','月の娘……？'],['allen','七十二の……誓い？'],['N','マルコシアスは、静かに光の中へ消えた。']]},
'4-2':{pre:[['fio','空気が熱い……溶岩のにおいがする！']],
 btalk:[['zagan','序列六十一位、王ザガン！ 水は酒に、銅は金に！ 王都の金貨も、我がこしらえた偽物よ！'],['gard','翼の生えた牛！？ なんでもアリだな魔神ってのは！']],
 post:[['sion','偽りの指輪、偽りの金貨……'],['sion','王都の繁栄は、魔神の力で作られていたというのか。'],['allen','……王様は、それを知っていたのかな。']]},
'4-3':{pre:[['allen','ラッパの音……？ 山の上から聞こえる。']],
 btalk:[['purson','序列二十位、王プルソン。隠されし宝と、過ぎ去りし真実を知る者なり。'],['purson','番人の子よ。汝の父の最期を、知りたいか？'],['allen','父さんの……！？']],
 post:[['purson','十年前……星の番人カイルは、偽りの指輪の真実を王に告げようとした。'],['purson','そして、その夜。大臣ヴァルドの刃に倒れたのだ。'],['allen','……ヴァルドが、父さんを。'],['gard','……やっぱり、そうだったか。'],['gard','俺はあの夜、城であいつの血まみれの手を見た。だが証拠がなくて……逆に騎士団を追われたんだ。'],['gard','すまねえ、アレン。ずっと言えなかった。'],['allen','……話してくれてありがとう、ガルド。'],['xenon','……これで役者がそろったな。']]},
'5-1':{pre:[['shino','ここが……アルセア。私の、故郷だ。'],['fio','シノ……'],['shino','大丈夫。……行こう。']],
 btalk:[['eligos','序列十五位、公爵エリゴス。戦の行方を知り、騎士を率いる者。'],['eligos','あの夜のことは覚えておるぞ、娘。泣き叫ぶ幼子の声もな。'],['shino','父上と母上の……仇！']],
 post:[['eligos','偽りの指輪で、我らをこの国に呼び出したのは……リーフの大臣よ……'],['shino','……ヴァルド。その名、魂に刻んだ。']]},
'5-2':{pre:[['shino','ラッパの音……あの夜と同じだ。']],
 btalk:[['beleth','序列十三位、王ベレト。蒼白の馬に乗り、楽の音とともに来たる。ひざまずけ！'],['gard','誰がひざまずくかよ！']],
 post:[['N','墓所の奥の石碑に、古い文字が刻まれていた。'],['sion','これは……ソロモン王の言葉だ！'],['sion','「七十二の柱、おのが意志にて誓うとき、器を要さず」'],['sion','魔神自身が封印を受け入れれば……巫女の命は、要らない！'],['stella','魔神たちが……自分から？'],['allen','マルコシアスは「玉座に戻りたい」と言ってた。望みはある！']]},
'5-3':{pre:[['stella','玉座の跡に……三つの首をもつ王が。']],
 btalk:[['balam','序列五十一位、王バラム。過去、現在、未来……汝らの運命は、すでに見えておる。'],['balam','巫女は死ぬ。番人の子も死ぬ。それが定めよ。'],['sion','三つの頭で未来を見ても、我々の勝利は見えないらしいな。']],
 post:[['N','バラムは封じられた。'],['xenon','……真実を話そう。'],['xenon','俺の妹リラは、魔神アスタロトに魂を奪われた。'],['xenon','ヴァルドは言った。「指輪を砕けば、妹の魂を返してやる」と。……俺は、それを信じた。'],['stella','そんな……'],['xenon','すべては、バアルとヴァルドの策略だった。'],['shino','お前……！'],['xenon','斬りたければ斬れ。だが先に、神殿でアスタロトを討たせてくれ。'],['shino','……全部終わってから、決着をつける。'],['xenon','感謝する。俺は外から神殿の結界を崩す。中は頼んだぞ。']]},
'6-1':{pre:[['xenon','この奥にアスタロトがいる。……妹の魂も、ここに。']],
 btalk:[['astaroth','序列二十九位、公爵アスタロト。ふふ……裏切り者の魔剣士も一緒とはね。'],['astaroth','妹の魂、まだ温かいわよ？ 返してほしければ、跪いて頼みなさい。'],['xenon','返してもらう……力ずくでな！']],
 post:[['N','アスタロトが封じられると、小さな光がゼノンの手に降りてきた。'],['lyra','……お兄ちゃん。もう、いいんだよ。'],['xenon','リラ……すまない……すまなかった……'],['N','光は、静かに空へと昇っていった。'],['xenon','……これで、俺に残っているのは償いだけだ。']]},
'6-2':{pre:[['stella','美しい……でも、とても冷たい気配。']],
 btalk:[['belial','序列六十八位、王ベリアル。われらは天にあって最も美しき者……'],['belial','巫女よ。命を捧げるがいい。それが、お前が生まれた意味なのだから。'],['stella','……いいえ。わたしは、みんなと生きる道を選びます！']],
 post:[['stella','アレンさん……ありがとう。'],['stella','あなたが「他の道を探す」と言ってくれたから、わたしは迷わずにいられました。'],['allen','約束しただろ。誰も犠牲にしないって。']]},
'6-3':{pre:[['allen','音楽……？ 誰かが歌ってる。']],
 btalk:[['paimon','序列九位、王パイモン。わが楽団の調べとともに、闇へ沈みなさい。'],['paimon','ふふ……もう遅いわ。あの月の巫女さまは、とっくに「器」を手に入れたもの。'],['fio','ラクダに乗った王様！？ ……って、見とれてる場合じゃないね！']],
 post:[['N','パイモンは封じられた。'],['vald','ご苦労だった、番人の子よ。'],['allen','ヴァルド……！'],['vald','おかげで、封印のかけらはずいぶん集まった。'],['vald','カグヤ様のお導きで、私は新しい世界の王となる！ バアル様の器としてな！'],['stella','カグヤ……！？ 姉さまの名前を、なぜあなたが！'],['N','ヴァルドは集めたかけらの半分を奪い、南の孤島――奈落の門へと消えた。'],['gard','待ちやがれ！'],['allen','追うぞ。……父さんの分も、これで終わりにする！']]},
'7-1':{pre:[['stella','奈落の門……かけらの気配が、渦を巻いています。'],['shino','ヴァルドは、この奥だ。']],
 btalk:[['vald','来たか！ 見よ、これがかけらの力だ！'],['asmodeus','……愚かな人間よ。汝の体、我が借りるぞ。'],['vald','な、何を……ぐああっ！？'],['asmodeus','序列三十二位、王アスモデウス。牛と人と羊の頭、すべてが汝らを嗤っておる。'],['gard','ヴァルド……てめえの末路がそれかよ！']],
 post:[['N','アスモデウスは封じられ、ヴァルドはその場に崩れ落ちた。'],['vald','カ、カグヤ様……話が違う……私が、器になるはずでは……'],['shino','……斬る価値もない。'],['gard','てめえは裁きを受けろ。王都でな。'],['N','ヴァルドは、湖を渡ってきた王都の兵に引き渡された。'],['stella','姉さまが……この奥に、いるの……？'],['allen','あとは、バアルと……カグヤだ。']]},
'7-2':{pre:[['allen','ここが……魔神の玉座。'],['xenon','俺も行く。償いの、最初の一歩だ。']],
 btalk:[['baal','よくぞ来た、人の子らよ。我こそは序列第一位、東方を統べる王バアル。'],['baal','三千年。ソロモンの盟約により、我らはこの国の繁栄のため、力を吸われ続けてきた。'],['baal','解き放たれたいと願って、何が悪い？'],['allen','……だからって、人を傷つけていい理由にはならない！'],['baal','ならば示してみよ、番人の子よ！']],
 post:[['baal','ば、ばかな……三千年の時を経て、また……人の子に……'],['baal','だが……勝ったつもりか。我らを解き放ったのは、あの女よ……'],['kaguya','ご苦労さま、バアル。……そしてステラ。大きくなったわね。'],['stella','姉さま……！ カグヤ姉さま！'],['kaguya','十年前、私は知ったの。巫女は国の繁栄のために生まれ、指輪のために死ぬ「部品」にすぎないと。'],['kaguya','ゼノンに指輪を砕かせたのも、ヴァルドを操ったのも、この私。……七十二柱の力を、一つの器に集めるためにね。'],['xenon','……お前が、リラを……！'],['kaguya','天も、盟約も、王も。巫女を縛るすべてを、堕としてあげる。'],['N','カグヤが月の鏡をかざすと、バアルと、指輪に眠る魔神たちの力が渦を巻いて吸いこまれていく――'],['kaguya','見なさい。これが――明けの明星、ルシファー。'],['allen','……奥の祭壇だ！ 追うぞ！']]},
'7-3':{pre:[['stella','姉さま……！'],['allen','ステラ、行こう。連れ戻すんだ。']],
 btalk:[['lucifer','我が名はルシファー。天より堕ち、天を堕とす者。'],['lucifer','ステラ……あなたも器になる運命だった。私と一緒に、すべてを終わらせましょう？'],['stella','いいえ！ わたしは姉さまを、この運命ごと取り戻します！'],['allen','みんな……全力でいくぞ！']],
 post:[['N','まばゆい光が砕け、ルシファーの翼が散っていく。'],['kaguya','……どうして。どうして、あなたたちは、そんなに……'],['stella','姉さまが一人で背負ったものを、今度はみんなで背負うから。'],['stella','ソロモンの石碑には「七十二の柱、おのが意志にて誓うとき、器を要さず」とありました。もう、誰も器にならなくていいの。'],['marchosias','……我は誓おう。天の玉座に、いつか戻るために。'],['baal','……人の子が、我らに誓いを求めるか。よかろう。三千年ぶりに、退屈せずに済みそうだ。'],['N','七十二柱の魔神たちが、次々と光となって指輪へ還っていく。巫女の命を奪うことなく――'],['kaguya','……ステラ。ごめんなさい。'],['stella','おかえりなさい、姉さま。'],['solomon','星の番人の子よ。よくぞ、新しき盟約を結んだ。'],['N','ソロモンの指輪は、元の姿に戻った。'],['xenon','……カグヤ。お前の償いにも付き合ってやる。リラの分まで、この世界を見届けるんだ。'],['shino','……決着は、また今度にしてやる。'],['N','こうして、世界に朝が戻った。\n――アストラル・クロニクル　完――']]}};
ENEMIES.lucifer={n:'ルシファー',art:'lucifer',boss:1,pillar:1,rank:0,title:'明けの明星',seal:0,scale:1.2,hp:Math.round((450+30*46)*1.8),atk:46,def:28,mag:56,spr:30,weak:['light'],resist:['dark'],acts:2,sk:[{n:'堕天の光輪',k:'mag',m:1.2,t:'all',el:'light'},{n:'月蝕の刃',k:'phys',m:1.9,t:'one'},{n:'七十二の呪詛',k:'mag',m:1.1,t:'all',el:'dark'},{n:'明星の加護',k:'buff'},{n:'天墜',k:'mag',m:1.8,t:'all',el:'dark',below:1}],rate:.48};
const DUNGL=[[['stella','この奥から……ヴィネの気配がします！']],[['stella','炎の奥に、アモンの気配……！'],['sion','採掘跡はこの先だ。星鉄の正体も、きっとそこに。']],[['xenon','……来たか。']],[['stella','竜の巣……プルソンのラッパが聞こえます。'],['allen','父さんのこと……何か知ってるかもしれない。']],[['shino','玉座の跡は、この真上だ。']],[['stella','神殿の最奥……パイモンの歌が聞こえます。']],[['stella','祭壇に……姉さまの気配。'],['allen','みんな、準備はいいか！']]];
const CH_OUTRO=[
 [['N','王都へ戻り、陛下に報告しよう。']],
 [['allen','「港まで来い」……ゼノンの言葉が気になる。'],['N','東の港町マリナへ向かおう。']],
 [['sion','偽りの指輪……セレスの大図書館なら、何かわかるかもしれない。'],['N','マリナの東にそびえる竜の山脈へ向かおう。北の聖都セレスへは、船で行ける。']],
 [['gard','……王様に、聞かなきゃならねえことがある。'],['N','王都リーフへ戻ろう。']],
 [['N','ゼノンが神殿の結界を崩している。北の大陸の東、「神殿の回廊」へ向かおう。']],
 [['N','ヴァルドは南の海の孤島へ消えた。山に囲まれたあの島へは、空からしか行けない……']]];
const EVENTS=[
 {id:'e1',key:'c0',c:()=>chapClear(0),l:[['king','おお、戻ったか。……そなたが星詠みの巫女か。'],['vald','陛下、巫女どのは国の宝。御身は城でお預かりしてはいかがでしょう。'],['stella','……いいえ。わたしは、この人たちと旅を続けます。'],['vald','……そうですか。それは、残念です。'],['gard','（小声で）……相変わらず胡散臭えな、ヴァルドの野郎。'],['allen','（知り合いなのか？）'],['gard','（……俺が騎士団を辞めた理由さ。今は話したくねえ）'],['king','番人の子アレンよ。王都の北の坑道でも、魔神の目撃が相次いでおる。頼んだぞ。']]},
 {id:'e2',key:'t1',c:()=>chapClear(1),l:[['N','港町マリナは、夜ごと海から上がってくる骸骨兵におびえていた。'],['老船長','沖に沈んだ船はな……十五年前、王都の密命で「青い石」を運んでおった船よ。'],['老船長','嵐の夜、急に海が割れて、船ごと呑まれちまった。……生き残ったのは、わしだけじゃ。'],['sion','青い石……坑道の星鉄か。']]},
 {id:'e3',key:'t2',c:()=>chapClear(2),l:[['sion','ここが聖都セレス。私が学んだ大図書館がある。'],['老学者','シオンか！ 久しいのう。……そちらは、星詠みの巫女どのか。'],['老学者','「星詠みの書」によれば、砕けた指輪を完全に戻すとき、巫女の命がその「器」となる……'],['allen','……器？ どういうことだ、ステラ。'],['stella','……はい。わたしの命と引き換えに、指輪は元に戻ります。それが、星詠みの巫女の役目です。'],['gard','ふざけんな！ そんな役目があってたまるか！'],['stella','覚悟は、とっくにできています。'],['allen','……ダメだ。他に方法があるはずだ。俺が、必ず見つける。'],['stella','アレンさん……'],['N','図書館の奥で、月の紋の外套をまとった女性が書を閉じ、静かに去っていった。'],['stella','……今の人……？ ううん、まさか、ね。'],['老学者','北の竜の山脈には、かつて天にいた魔神が眠ると伝わる。何か知っておるやもしれん。']]},
 {id:'e4',key:'c0',c:()=>chapClear(3),l:[['king','……ヴァルドは数日前から、姿が見えぬ。'],['allen','陛下。父さんを……星の番人カイルを殺したのは、ヴァルドです。'],['king','…………。'],['king','すべて話そう。王家は三千年前、ソロモンとの盟約により、魔神の力の一部を借りて国を富ませてきた。'],['king','偽りの指輪はヴァルドの独断だ。だが……豊かさに目がくらみ、止めなかったのは余の罪だ。'],['king','カイルは、余に何度も忠告してくれた。……すまぬ、アレン。'],['allen','……謝るなら、これからの国で示してください。'],['king','うむ。ヴァルドは西の砂漠、亡国アルセアの墓所で何かを探しておるという。']]},
 {id:'e5',key:'c0',c:()=>chapClear(5),l:[['king','湖の島に、兵を向かわせた。ヴァルドの身柄は、王都が必ず引き受ける。'],['king','アレン。……カイルの剣を、最後まで頼む。'],['allen','はい。必ず、みんなで帰ってきます。']]}];
(function(){const c7=CHAPTERS[6];if(!c7.stages.some(x=>x.id==='7-3')){const st={id:'7-3',name:'明けの明星',lv:44,waves:[['lucifer']]};st.ci=6;st.si=c7.stages.length;st.cost=c7.cost;st.bg=c7.bg;st.exp=Math.round(25*Math.pow(st.lv,1.6))+40;st.gil=60*st.lv+100;st.gems=100;c7.stages.push(st);STAGES['7-3']=st;STAGE_ORDER.push('7-3')}
 for(const ch of CHAPTERS)for(const s of ch.stages){const n=STORY[s.id];if(n)Object.assign(s,n)}DUN_OLD.forEach((d,i)=>{if(DUNGL[i])d.gl=DUNGL[i]})})();
const NPCN={kaguya:'カグヤ',king:'リーフ王',vald:'大臣ヴァルド',solomon:'ソロモンの声',lyra:'リラ',老船長:'老船長',老学者:'老学者'};
async function runTownEvents(key){if(!P.ev)P.ev={};for(const e of EVENTS){if(P.ev[e.id]||e.key!==key||!e.c())continue;P.ev[e.id]=1;save();D&&(D.busy=true);await talk(e.l);if(D)D.busy=false}}

/* ===== 魔神ごとのダンジョン（ステージ1つ＝ダンジョン1つ） ===== */
const DUN=[];
(()=>{const TH=['forest','cave','sea','mountain','ruins','temple','abyss'];
 const RN={'3-1':'マリナ地下水路','7-3':'明けの明星の間'};
 STAGE_ORDER.forEach((id,di)=>{const st=STAGES[id],ci=st.ci,si=st.si,ch=CHAPTERS[ci],old=DUN_OLD[ci]||DUN_OLD[6],last=si===ch.stages.length-1;
  const L=old.loot,gil=(L.find(l=>l[0]==='gil')||['gil',500])[1];
  const items=L.filter(l=>l[0]!=='gil');
  const loot=[items[si%items.length],['gil',Math.round(gil*(.35+si*.15))]];if(si===1&&items[1])loot.push(items[(si+1)%items.length]);
  DUN.push({name:RN[id]||st.name,n:4+Math.min(3,Math.floor((ci+si)/2)),theme:TH[ci],seed:101+di*17,loot,gl:last?old.gl:null,ch:ci,si,sid:id})})})();
const dOpen=di=>di===0||!!P.cleared[STAGE_ORDER[di-1]];
const dDone=di=>!!P.cleared[STAGE_ORDER[di]];
function curDun(){for(let i=0;i<DUN.length;i++)if(!dDone(i))return i;return DUN.length-1}
function dLvD(di){return STAGES[STAGE_ORDER[di]].lv}
/* ---- classic command input ---- */
function cmdStart(){if(!B)return;B.ci=-1;B.units.forEach(u=>{u.queued=null});cmdNext()}
function cmdNext(){if(!B)return;let i=B.ci+1;while(i<B.units.length&&B.units[i].ko)i++;B.units.forEach(u=>u.oxT=0);
 if(i>=B.units.length){B.ci=-1;cmdHide();execTurn();return}B.ci=i;B.units[i].oxT=-10;B.cmdMode='main';showCmd()}
function cmdBack(){if(!B)return;let i=B.ci-1;while(i>=0&&B.units[i].ko)i--;if(i<0){SFX.ng();return}SFX.cur();B.units.forEach(u=>u.oxT=0);B.ci=i;B.units[i].queued=null;B.units[i].oxT=-10;B.cmdMode='main';closeSheet();showCmd()}
function cmdHide(){const c=$('#cmdw');c.innerHTML=`<div class="wait">${B&&B.phase==='player'?'':'……'}</div>`;closeSheet();if(B){B.cmdMode=null;B.pcache={}}}
function cmdQueue(cmd){const u=B.units[B.ci];if(!u)return;u.queued=cmd;SFX.ok();closeSheet();cmdNext()}
function reservedItem(k){return B.units.filter((x,i)=>i!==B.ci&&x.queued&&x.queued.k==='item'&&x.queued.id===k).length}
function showCmd(){const u=B.units[B.ci];if(!u)return;const lbOk=u.lbg>=u.lbc,first=!B.units.slice(0,B.ci).some(x=>!x.ko);
 $('#cmdw').innerHTML=`<div class="who"><img src="${portrait(u.id)}" alt="">${u.name}${first?'':'<button id="cBack">もどる</button>'}</div><div class="cg">
 <button data-c="atk">たたかう</button><button data-c="abil">アビリティ</button><button data-c="item">アイテム</button>
 <button data-c="def">ぼうぎょ</button><button data-c="lb" class="${lbOk?'lbk':''}" ${lbOk?'':'disabled'}>リミット</button><button data-c="run">にげる</button></div>`;
 const bk=$('#cBack');if(bk)bk.onclick=cmdBack;B.pcache={};
 $$('#cmdw .cg button').forEach(b=>b.onclick=()=>{initAudio();const c=b.dataset.c;
  if(c==='atk'){if(aliveE().length>1){SFX.cur();cmdTarget({k:'attack',label:'たたかう'})}else cmdQueue({k:'attack',label:'たたかう',tgt:aliveE()[0]})}
  else if(c==='abil'){SFX.cur();cmdList(u,'abil')}
  else if(c==='item'){SFX.cur();cmdList(u,'item')}
  else if(c==='def')cmdQueue({k:'defend',label:'ぼうぎょ'});
  else if(c==='lb'){const cmd={k:'lb',label:'リミット'};if(u.d.lb.t==='enemy'&&aliveE().length>1){SFX.cur();cmdTarget(cmd)}else cmdQueue(cmd)}
  else if(c==='run')tryEscape()})}
function sheetHead(u,title,st){return `<div class="sh"><img src="${portrait(u.id)}" style="width:28px;height:28px;object-fit:cover;border-radius:4px">${title}<small>${st?`MP ${u.mp}/${u.mmp}`:''}</small><button class="btn" id="shX" style="min-height:34px;padding:0 12px;margin-left:6px;white-space:nowrap">もどる</button></div>`}
function cmdList(u,kind){const sh=$('#sheet');sh.style.display='flex';B.sheetU=u;let body='';
 if(kind==='abil')body=u.abil.map(id=>{const a=ABIL[id];return `<button class="op" data-ab="${id}" ${u.mp<a.mp?'disabled':''}><span>${a.n}<small>${a.d}</small></span><em>MP ${a.mp}</em></button>`}).join('')||'<p style="font-size:13px;color:#9ab;padding:6px">使えるアビリティがない</p>';
 else{const ks=Object.keys(P.items).filter(k=>P.items[k]-reservedItem(k)>0&&!ITEMS[k].noBattle);body=ks.map(k=>`<button class="op" data-it="${k}"><span>${ITEMS[k].n}<small>${ITEMS[k].d}</small></span><em>×${P.items[k]-reservedItem(k)}</em></button>`).join('')||'<p style="font-size:13px;color:#9ab;padding:6px">使えるアイテムがない</p>'}
 sh.innerHTML=sheetHead(u,kind==='abil'?'アビリティ':'アイテム',kind==='abil')+`<div class="sl">${body}</div>`;
 $('#shX').onclick=()=>{SFX.cur();closeSheet();B.cmdMode='main'};
 sh.querySelectorAll('[data-ab]').forEach(b=>b.onclick=()=>{const a=ABIL[b.dataset.ab],cmd={k:'abil',id:b.dataset.ab,label:a.n};
  if(a.t==='ally'||a.t==='dead'){SFX.cur();cmdAlly(u,cmd,a.t)}else if((a.t==='enemy'||a.k==='grav')&&aliveE().length>1){SFX.cur();cmdTarget(cmd)}else cmdQueue(Object.assign(cmd,{tgt:aliveE()[0]}))});
 sh.querySelectorAll('[data-it]').forEach(b=>b.onclick=()=>{const it=ITEMS[b.dataset.it];SFX.cur();cmdAlly(u,{k:'item',id:b.dataset.it,label:it.n},it.use==='revive'?'dead':'ally')})}
function cmdAlly(u,cmd,t){const sh=$('#sheet');sh.style.display='flex';B.cmdMode='ally';B.allyCmd=cmd;B.allyT=t;
 const cands=B.units.filter(x=>t==='dead'?x.ko:!x.ko);
 sh.innerHTML=sheetHead(u,'だれに使う？')+`<div class="sl">`+(cands.map(x=>`<button class="op" data-a="${x.idx}"><img src="${portrait(x.id)}" style="width:34px;height:34px;object-fit:cover;border-radius:5px"><span>${x.name}<small>HP ${x.hp}/${x.mhp}　MP ${x.mp}/${x.mmp}</small></span></button>`).join('')||'<p style="font-size:13px;color:#9ab;padding:6px">対象がいない</p>')+'</div>';
 $('#shX').onclick=()=>{SFX.cur();closeSheet();B.cmdMode='main'};
 sh.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>cmdQueue(Object.assign({},cmd,{ally:+b.dataset.a})))}
function cmdTarget(cmd){const u=B.units[B.ci],sh=$('#sheet');sh.style.display='flex';B.cmdMode='target';B.tgtCmd=cmd;
 sh.innerHTML=sheetHead(u,'ねらう敵は？')+`<div class="sl">`+aliveE().map((e,i)=>`<button class="op en" data-e="${B.ens.indexOf(e)}"><span>${e.name}<small>${e.boss?'BOSS':''}${e.weak&&P.cleared?'':''}</small></span><em style="color:#ff9a8a">${Math.round(e.hp/e.mhp*100)}%</em></button>`).join('')+'<p style="font-size:11px;color:#9ab;padding:4px 2px">画面の敵をタップしても選べます</p></div>';
 sh.style.maxHeight='46%';
 $('#shX').onclick=()=>{SFX.cur();closeSheet();B.cmdMode='main'};
 sh.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>{const e=B.ens[+b.dataset.e];B.target=e;cmdQueue(Object.assign({},cmd,{tgt:e}))})}
function cmdPanelTap(i){if(!B)return;const x=B.units[i];if(B.cmdMode==='ally'){const ok=B.allyT==='dead'?x.ko:!x.ko;if(!ok){SFX.ng();return}cmdQueue(Object.assign({},B.allyCmd,{ally:i}))}}
async function execTurn(){if(!B)return;B.busy=true;B.exec=true;
 for(const u of B.units){if(!B||B.phase!=='player'||!aliveE().length)break;if(u.ko||u.acted||!u.queued)continue;
  const c=u.queued;if(c.tgt){if(!c.tgt.alive)c.tgt=aliveE()[0];B.target=c.tgt}
  await unitAct(u);await sleep(60/spd())}
 if(!B)return;B.exec=false;B.busy=false;flow()}
function autoTurn(){if(!B||B.phase!=='player')return;closeSheet();for(const u of B.units){if(u.ko||u.acted)continue;if(!u.queued)u.queued={k:'attack',label:'たたかう'}}B.ci=-1;B.units.forEach(u=>u.oxT=0);cmdHide();execTurn()}
async function tryEscape(){if(!B)return;if(B.isBoss||B.stage.boss){SFX.ng();toast('ボスからは逃げられない！');return}
 cmdHide();B.busy=true;B.units.forEach(u=>{u.queued=null;u.oxT=0});showName('にげる');await sleep(450);
 if(Math.random()<.72){SFX.run();B.phase='over';B.units.forEach(u=>{if(!u.ko){u.oxT=40}});await sleep(450);saveBattleSt();save();toast('うまく逃げきれた！');await backToField()}
 else{SFX.ng();toast('しかし、まわりこまれてしまった！');await sleep(700);B.units.forEach(u=>u.acted=true);B.busy=false;flow()}}
function saveBattleSt(){if(!B)return;for(const u of B.units)P.st[u.uid]={hp:u.ko?0:Math.max(0,u.hp),mp:u.mp}}
async function backToField(){await fade(true);B=null;closeSheet();if(D){scene='dungeon';setMode('field');resize();dResize();updDpan();playBGM(D.world?'quest':'dungeon',true);await fade(false);D.busy=false;dStop()}else{await enterTown(P.lastTown||0)}}
async function startQuest(s,opt={}){
 await fade(true);
 const party=P.party.map(uid=>uById(uid)).filter(Boolean);
 B={stage:s,retry:false,dungeon:true,wave:0,turn:1,units:party.map((u,i)=>mkBU(u,i,false)),ens:[],target:null,phase:'intro',busy:true,pops:[],parts:[],fx:[],crys:[],chain:0,lastHit:0,lastSrc:null,chainT:9,speed:P.bspd||1,auto:false,log:[],lastLog:null,turnStart:0,cut:null,run:0,scroll:0,shake:0,banner:null,drops:[],sheetU:null,ci:-1,cmdMode:null};
 B.units.forEach((u,i)=>{u.idx=i;const st=curSt(uById(u.uid));u.hp=Math.min(u.mhp,st.hp);u.mp=Math.min(u.mmp,st.mp);if(u.hp<=0){u.hp=0;u.ko=true}});
 scene='battle';setMode('battle');resize();buildPanels();spawnWave();$('#bwave').textContent='TURN 1';$('#bAuto').classList.remove('on');$('#bSpd').textContent='×'+B.speed;cmdHide();
 await fade(false);
 if(opt.boss&&s.btalk&&!P.cleared[s.id])await talk(s.btalk);
 const b0=B.ens[0];bigBanner(B.isBoss&&b0.pillar?(b0.rank?`序列${b0.rank}位 ${b0.title} ${b0.n}`:`${b0.title} ${b0.n}`):'モンスターがあらわれた！');await sleep(700);
 B.phase='player';B.busy=false;cmdStart();
}
function newTurn(){B.turn++;B.chain=0;B.log=[];B.turnStart=0;
 const dec=o=>{for(const k in o){o[k].t--;if(o[k].t<=0)delete o[k]}};
 for(const u of B.units){u.acted=false;u.guard=false;u.queued=null;if(!u.ko)u.mp=Math.min(u.mmp,u.mp+Math.ceil(u.mmp*.03));dec(u.buffs);if(u.prov>0)u.prov--}
 for(const e of B.ens){dec(e.buffs);dec(e.debuffs)}
 B.phase='player';B.busy=false;$('#bwave').textContent=`TURN ${B.turn}`;
 if(B.auto)autoTurn();else cmdStart()}
function chainHit(u){return 1}
async function gameOver(){B.phase='over';cmdHide();closeSheet();stopSeq();await sleep(400);
 await modal('<h3>全滅してしまった……</h3><p style="text-align:center">目の前が真っ暗になった……\n\n最後に立ち寄った町で目をさました。\n（所持ギルが半分になりました）</p>',[{l:'つづける',c:'g'}]);
 P.gil=Math.floor(P.gil/2);healAll();save();await fade(true);B=null;D=null;closeSheet();await enterTown(P.lastTown||0,'inn')}
async function victory(){B.phase='end';cmdHide();closeSheet();if(B.stage.boss)return bossVictory();return dVictory()}
function battleRewards(s){const rows=[],inP=B.units.map(b=>b.uid);for(const bu of B.units){const u=uById(bu.uid);if(!u)continue;const lv0=u.lv;const ups=bu.ko?gainUExp(u,Math.floor(s.exp/2)):gainUExp(u,s.exp);rows.push({u,lv0,ups})}
 for(const u of P.units)if(!inP.includes(u.uid))gainUExp(u,Math.floor(s.exp/2));
 P.gil+=s.gil;if(s.si>=0&&CHAPTERS[s.ci]&&s.si===CHAPTERS[s.ci].stages.length-1&&DLOOT_EQ[s.ci]){P.eqBoss=P.eqBoss||{};if(!P.eqBoss[s.ci]){P.eqBoss[s.ci]=1;const de=DLOOT_EQ[s.ci][1];addEq(de);setTimeout(()=>toast(EQUIP[de].n+' を手に入れた！（メニューの「そうび」で装備できます）',3200),900)}}const drops={};B.drops.forEach(d=>drops[d]=(drops[d]||0)+1);for(const k in drops)P.items[k]=(P.items[k]||0)+drops[k];
 saveBattleSt();save();
 let h=`<div class="res"><div class="clear" style="font-size:24px">勝利！</div>`+rows.map(r=>{const d=UNITS[r.u.id];return `<div class="ur"><img src="${portrait(r.u.id)}" alt=""><div class="f">${d.name}　Lv ${r.lv0}${r.ups?` → <b>${r.u.lv}</b> <span class="lu">LEVEL UP!</span>`:''}<div class="xp"><i style="width:0" data-w="${r.u.exp/uNext(r.u.lv)*100}"></i></div></div></div>`}).join('')+
 `<div style="margin-top:8px"><div class="rw"><span>経験値</span><b>${fmt(s.exp)}</b></div><div class="rw"><span>ギル</span><b>+${fmt(s.gil)} G</b></div>${Object.keys(drops).length?`<div class="rw"><span>手に入れたもの</span><b>${Object.keys(drops).map(k=>ITEMS[k].n+'×'+drops[k]).join('、')}</b></div>`:''}</div></div>`;
 if(rows.some(r=>r.ups))setTimeout(()=>SFX.lvl(),400);
 return modal(h,[{l:'OK',c:'g'}],{onOpen:m=>setTimeout(()=>m.querySelectorAll('[data-w]').forEach(i=>i.style.width=i.dataset.w+'%'),80)})}
async function dVictory(){playBGM('victory',true);B.units.forEach(u=>{if(!u.ko)u.pose='win'});bigBanner('勝利！');await sleep(1000);
 await battleRewards(B.stage);await backToField()}
async function bossVictory(){playBGM('victory',true);B.units.forEach(u=>{if(!u.ko)u.pose='win'});const s=B.stage,first=!P.cleared[s.id];bigBanner('VICTORY!');await sleep(1500);
 P.cleared[s.id]=(P.cleared[s.id]||0)+1;await battleRewards(s);
 if(first&&s.post){const pl=s.waves.flat().map(e=>ENEMIES[e]).find(e=>e.pillar);await talk(s.post.concat(pl&&pl.seal?[['N',`${pl.n}${pl.seal>1?`と配下の魔神${pl.seal-1}柱`:''}を、指輪に封じた。\n（封印 ${sealed()}/${TOTAL_SEAL}柱）`]]:[]))}
 if(first&&JOIN[s.id]&&!P.units.some(u=>u.id===JOIN[s.id])){const id=JOIN[s.id],d=UNITS[id];const avg=Math.round(P.party.map(uById).reduce((a,u)=>a+u.lv,0)/Math.max(1,P.party.length));const u=addUnit(id,Math.max(s.lv,avg));
  await talk([[id,JOINLINE[id]]]);P.party.push(u.uid);const st=ustat(u);P.st[u.uid]={hp:st.hp,mp:st.mp};save();SFX.lvl();
  await modal(`<h3>${d.name}が仲間になった！</h3><div class="ud r4" style="justify-content:center"><div class="big"><img src="${fullImg(id)}" alt=""></div><div><div class="nm">${d.name}</div><div class="jb">${d.job}　Lv ${u.lv}</div><div style="font-size:12px;margin-top:6px;color:#ffe08a">リミット：${d.lb.n}</div></div></div>`)}
 const ch=CHAPTERS[s.ci],lastSt=s.si===ch.stages.length-1;
 if(first&&lastSt){const fin=s.ci===CHAPTERS.length-1;if(!fin&&CH_OUTRO[s.ci])await talk(CH_OUTRO[s.ci]);await fade(true);B=null;closeSheet();D=null;
  if(fin){playBGM('victory',true);scene='title';setMode('title');await fade(false);await modal(`<div class="clear">THE END</div><p style="text-align:center">ソロモン七十二柱、すべての封印に成功した！\n\n遊んでくれてありがとう。\nこのまま世界を冒険できます。</p>`)}
  else{await modal(`<div class="clear" style="font-size:22px">${ch.name.split(' ')[0]} クリア！</div><p style="text-align:center">${ch.name.replace(/^\S+\s/,'')}\n\n${nextGoal()}</p>`)}
  await enterWorld(P.wpos);return}
 await backToField()}
async function endBattle(){await backToField()}
/* ================= RPG STATE ================= */
function curSt(u){const s=ustat(u);if(!P.st)P.st={};let st=P.st[u.uid];if(!st)st=P.st[u.uid]={hp:s.hp,mp:s.mp};st.hp=Math.min(s.hp,Math.max(0,st.hp));st.mp=Math.min(s.mp,Math.max(0,st.mp));return st}
function healAll(){for(const u of P.units){const s=ustat(u);P.st[u.uid]={hp:s.hp,mp:s.mp}}}
const chapClear=ci=>CHAPTERS[ci].stages.every(s=>P.cleared[s.id]);
const chapOpen=ci=>ci===0||chapClear(ci-1);
function curChapter(){for(let i=0;i<CHAPTERS.length;i++)if(!chapClear(i))return i;return CHAPTERS.length-1}
function dirName(dx,dy){const a=Math.atan2(dy,dx)*180/Math.PI;const N=['東','南東','南','南西','西','北西','北','北東'];return N[((Math.round(a/45)%8)+8)%8]}
function nextGoal(){if(CHAPTERS.every((c,i)=>chapClear(i)))return 'すべての魔神を封印した！ 世界は平和を取りもどした。';const ci=curDun(),o=WLOC.find(l=>l.ci===ci),t=WLOC.find(l=>l.k==='town'&&l.id===(P.lastTown||0));
 return `次の目的地は${t?TOWNS[t.id].name+'から'+dirName(o.x-t.x,o.y-t.y)+'の方角にある':''}「${DUN[ci].name}」。`}
/* ================= WORLD MAP ================= */
const WLOC=[{k:'town',id:0,x:20,y:38},{k:'town',id:1,x:50,y:36},{k:'town',id:2,x:40,y:10},
 {k:'dun',ci:0,x:10,y:31},{k:'dun',ci:1,x:9,y:41},{k:'dun',ci:2,x:15,y:47},{k:'dun',ci:3,x:24,y:25},{k:'dun',ci:4,x:30,y:31},{k:'dun',ci:5,x:27,y:20},
 {k:'dun',ci:6,x:54,y:30},{k:'dun',ci:7,x:56,y:46},{k:'dun',ci:8,x:66,y:48},{k:'dun',ci:9,x:63,y:26},{k:'dun',ci:10,x:70,y:33},{k:'dun',ci:11,x:67,y:40},
 {k:'dun',ci:12,x:23,y:8},{k:'dun',ci:13,x:29,y:12},{k:'dun',ci:14,x:32,y:5},{k:'dun',ci:15,x:49,y:5},{k:'dun',ci:16,x:54,y:11},{k:'dun',ci:17,x:58,y:7},
 {k:'dun',ci:18,x:37,y:53},{k:'dun',ci:19,x:43,y:53},{k:'dun',ci:20,x:40,y:57}];
const CONT=[{cx:19,cy:34,rx:15,ry:18},{cx:61,cy:36,rx:14,ry:17},{cx:40,cy:9,rx:22,ry:6.6},{cx:40,cy:54,rx:7.2,ry:6.6}];
const TOWNS=[
 {name:'王都リーフ',inn:20,shop:['potion','ether','feather','exs'],npc:['王様は、魔神の噂に頭を抱えておられるそうだ。','西の森には昔から妖精が住むと言われていたが……最近は魔物ばかりらしい。','武器より薬だよ。ポーションは多めに持っていきな！','宿屋に泊まれば、どんな疲れもふっとぶよ。']},
 {name:'港町マリナ',inn:60,shop:['potion','hipotion','ether','feather','exs','exm'],npc:['海の底に沈んだ船から、夜な夜な鐘の音がするんだ……','東の山の坑道は、ずっと燃え続けているらしい。','魚がとれなくなっちまった。魔神のせいかねえ。','ハイポーションは、ここでしか手に入らないよ。']},
 {name:'聖都セレス',inn:120,shop:['potion','hipotion','ether','feather','exs','exm'],npc:['西の砂漠には、かつて栄えた王国の墓所が眠っています。','北の山脈には竜の骨が眠ると伝えられています。','北東の神殿……あそこは、天から堕ちた者たちの回廊です。','南の海の孤島から、底知れない闇があふれています……']}];
const ROADS=[['t0','d0'],['t0','d1'],['d1','d2'],['t0','d3'],['d3','d4'],['d3','d5'],['t1','d6'],['t1','d7'],['d7','d8'],['t1','d9'],['d9','d10'],['d10','d11'],['t2','d12'],['d12','d13'],['d13','d14'],['t2','d15'],['d15','d16'],['d16','d17'],['d18','d19'],['d18','d20'],['d19','d20']];
let WORLD=null;
function vnoise(seed,sc){const r=srng(seed),N=64,v=new Float32Array(N*N);for(let i=0;i<v.length;i++)v[i]=r();const at=(a,b)=>v[((b%N+N)%N)*N+((a%N+N)%N)];return(x,y)=>{x/=sc;y/=sc;const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;const u=xf*xf*(3-2*xf),w=yf*yf*(3-2*yf);const a=at(xi,yi),b=at(xi+1,yi),c=at(xi,yi+1),d=at(xi+1,yi+1);return a+(b-a)*u+(c-a)*w+(a-b-c+d)*u*w}}
function genWorld(){if(WORLD)return WORLD;const w=80,h=64,K=new Uint8Array(w*h),hv=new Float32Array(w*h),CI=new Int8Array(w*h).fill(-1),n1=vnoise(3,6),n2=vnoise(9,3),n3=vnoise(21,2.4);
 const I=(x,y)=>y*w+x,dist=(x,y,p)=>Math.hypot(x-p.x,y-p.y),Lk=k=>WLOC.find(o=>(o.k==='town'?'t'+o.id:'d'+o.ci)===k);
 const E=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++){let best=9,bc=-1;CONT.forEach((c,ci)=>{const e=((x-c.cx)/c.rx)**2+((y-c.cy)/c.ry)**2+(n1(x+ci*31,y)-.5)*(ci===3?.15:.45);if(e<best){best=e;bc=ci}});E[I(x,y)]=best;
  if(best<1&&x>1&&y>1&&x<w-2&&y<h-2){K[I(x,y)]=0;CI[I(x,y)]=bc}else K[I(x,y)]=4}
 // 大陸どうしの間を海で分ける
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=I(x,y);if(CI[i]<0)continue;for(let j=-2;j<=2;j++)for(let q=-2;q<=2;q++){const xx=x+q,yy=y+j;if(xx<0||yy<0||xx>=w||yy>=h)continue;const c=CI[I(xx,yy)];if(c>=0&&c!==CI[i]){K[i]=4;CI[i]=-1}}}
 const Dl=WLOC.filter(o=>o.k==='dun');
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=I(x,y);if(K[i]!==0)continue;const c=CI[i];
  if(c===3){const e=E[i];if(e>.62){K[i]=5;continue}if(n2(x,y)>.66)K[i]=6;continue}
  if(n3(x,y)>.74&&E[i]<.8)K[i]=5;else if(n2(x,y)>.64)K[i]=6;
  for(const o of Dl){const d=dist(x,y,o),ch=DUN[o.ci].ch;if(d>5.5)continue;
   if(ch===0&&d<4.5&&n2(x,y)>.32)K[i]=6;
   if((ch===1||ch===3)&&d>1.6&&d<5&&n2(x*1.2,y)>.26)K[i]=5;
   if(ch===4&&d<4.5)K[i]=n3(x,y)>.8?5:2;
   if(ch===2&&d<3.5&&n2(x,y)>.5)K[i]=6}}
 for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const i=I(x,y);if(K[i]===0||K[i]===6){if(CI[i]===3)continue;for(const[dx,dy]of DXY)if(K[I(x+dx,y+dy)]===4){K[i]=2;break}}}
 for(const o of WLOC)for(let j=-1;j<=1;j++)for(let q=-1;q<=1;q++){const i=I(o.x+q,o.y+j);if(K[i]!==4&&K[i]!==2)K[i]=0;if(!q&&!j)K[i]=0}
 const cost=[1,.35,1.3,.35,1e5,11,6];
 const road=(a,b)=>{const N=w*h,dd=new Float32Array(N).fill(1e9),pv=new Int32Array(N).fill(-1),done=new Uint8Array(N),s=I(a.x,a.y),t=I(b.x,b.y);dd[s]=0;
  for(;;){let c=-1,bv=1e9;for(let i=0;i<N;i++)if(!done[i]&&dd[i]<bv){bv=dd[i];c=i}if(c<0||c===t)break;done[c]=1;const cx=c%w,cy=(c/w)|0;
   for(const[dx,dy]of DXY){const nx=cx+dx,ny=cy+dy;if(nx<1||ny<1||nx>=w-1||ny>=h-1)continue;const ni=I(nx,ny);const v=dd[c]+cost[K[ni]]+((dx&&cy%2)||(dy&&cx%2)?.02:0);if(v<dd[ni]){dd[ni]=v;pv[ni]=c}}}
  for(let c=pv[t];c>=0&&c!==s;c=pv[c])if(K[c]!==4)K[c]=1};
 for(const[a,b]of ROADS)road(Lk(a),Lk(b));
 const L=new Int16Array(w*h).fill(-1);WLOC.forEach((o,li)=>{const i=I(o.x,o.y);L[i]=li;K[i]=0});
 const g=new Uint8Array(w*h);for(let i=0;i<w*h;i++){const k=K[i];g[i]=k===4||k===5||k===6?1:0;hv[i]=k===5?1.0+n3((i%w)*1.7,((i/w)|0)*1.7)*1.0:k===6?.34:0}
 const near=new Int8Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){let best=0,bd=1e9;for(const o of Dl){const d=Math.hypot(x-o.x,y-o.y);if(d<bd){bd=d;best=DUN[o.ci].ch}}near[I(x,y)]=best}
 return WORLD={w,h,K,g,hv,L,near,CI,T:new Uint8Array(w*h),chests:[],gate:-1,key:-1,spring:-1,S:-1,G:-1}}
const ATL={};function atlasFor(th){return ATL[th]||(ATL[th]=buildAtlas(th))}
function freeMesh(){for(const k of['floor','wall','gate'])if(GLB[k]){GL.deleteBuffer(GLB[k].b);GLB[k]=null}}
function buildWorldMesh(){freeMesh();const m=D.m,w=m.w,h=m.h,fl=[],wl=[];const H_=(x,y)=>x<0||y<0||x>=w||y>=h?0:m.hv[y*w+x];
 const ftile=[TILE.floor,TILE.door,TILE.lamp,TILE.gate,TILE.arch];
 const cAO=(x,y)=>{let c=0;for(const[i,j]of[[-1,-1],[0,-1],[-1,0],[0,0]])if(H_(x+i,y+j)>.5)c++;return 1-c*.14};
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,k=m.K[i],hh=m.hv[i];
  if(hh<=0){pushQ(fl,[x,0,y+1],[x+1,0,y+1],[x+1,0,y],[x,0,y],[0,1,0],ftile[k]??TILE.floor,[cAO(x,y+1),cAO(x+1,y+1),cAO(x+1,y),cAO(x,y)]);continue}
  const forest=k===6,top=forest?TILE.floor:TILE.top,side=forest?TILE.floor:((x*7+y*3)%2?TILE.plain:TILE.plain2),ao=forest?.42:1;
  pushQ(wl,[x,hh,y+1],[x+1,hh,y+1],[x+1,hh,y],[x,hh,y],[0,1,0],top,[ao,ao,ao,ao]);
  for(let q=0;q<4;q++){const nx=x+DXY[q][0],ny=y+DXY[q][1],nh=H_(nx,ny);if(nh>=hh)continue;let Lp,R,n;if(q===0){Lp=[x+1,y+1];R=[x+1,y];n=[1,0,0]}else if(q===2){Lp=[x,y];R=[x,y+1];n=[-1,0,0]}else if(q===1){Lp=[x,y+1];R=[x+1,y+1];n=[0,0,1]}else{Lp=[x+1,y];R=[x,y];n=[0,0,-1]}
   pushQ(wl,[Lp[0],nh,Lp[1]],[R[0],nh,R[1]],[R[0],hh,R[1]],[Lp[0],hh,Lp[1]],n,side,[.55*ao,.55*ao,ao,ao])}}
 const mk=a=>{const b=GL.createBuffer();GL.bindBuffer(GL.ARRAY_BUFFER,b);GL.bufferData(GL.ARRAY_BUFFER,new Float32Array(a),GL.STATIC_DRAW);return{b,n:a.length/9}};GLB.floor=mk(fl);GLB.wall=mk(wl);GLB.gate=null}
function wProps(){const m=D.m,r=srng(77);D.props=[];for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){const i=y*m.w+x,k=m.K[i];
 if(k===6){const n=2+(r()<.5?1:0);for(let q=0;q<n;q++)D.props.push({x:x+.2+r()*.6,z:y+.2+r()*.6,k:r()<.55?'tree':'pine',s:.52+r()*.26,y:m.hv[i]-.04})}
 else if(k===0&&m.L[i]<0&&r()<.07)D.props.push({x:x+.2+r()*.6,z:y+.2+r()*.6,k:r()<.5?'flowers':'bush',s:.32+r()*.12,y:0});
 else if(k===2&&r()<.04)D.props.push({x:x+.5,z:y+.5,k:'rock',s:.3,y:0});
 else if(k===5&&r()<.12)D.props.push({x:x+.5,z:y+.5,k:'pine',s:.5,y:m.hv[i]-.04})}}
function glRenderWorld(){const g=GL,m=D.m,P_=GLP;
 g.viewport(0,0,dcv.width,dcv.height);const fc=[.66,.8,.93];g.clearColor(fc[0],fc[1],fc[2],1);g.clear(g.COLOR_BUFFER_BIT|g.DEPTH_BUFFER_BIT);
 D.cx+=(D.ax-D.cx)*.1;D.cz+=(D.ay-D.cz)*.1;const orb=D.gy*.6,tilt=D.gp*.5,dist=6.2,hgt=7.0+tilt*2.3;
 const tgt=[D.cx,.3,D.cz-.9],eye=[D.cx+Math.sin(orb)*dist,hgt,D.cz-.9+Math.cos(orb)*dist],asp=dcv.width/dcv.height;
 const V=lookAt(eye,tgt,[0,1,0]),VP=m4mul(persp(asp<.75?.9:.76,asp,.1,80),V.m);
 g.useProgram(P_.p);g.uniformMatrix4fv(P_.uVP,false,VP);g.uniform3f(P_.uAmb,.6,.62,.6);g.uniform3fv(P_.uFog,fc);g.uniform3f(P_.uLc,0,0,0);g.uniform3f(P_.uPl,D.ax,1.4,D.ay);g.uniform2f(P_.uCut,D.ax,D.ay);g.uniform1f(P_.uTop,1);g.uniform1f(P_.uFl,1);g.uniform1i(P_.uLn,0);g.uniform2f(P_.uFogR,10,17);g.uniform1f(P_.uSun,.62);g.uniform1f(P_.uCutOn,0);g.uniform1f(P_.uTime,time);g.uniform1f(P_.uDith,0);
 g.activeTexture(g.TEXTURE0);g.uniform1i(P_.uT,0);g.bindTexture(g.TEXTURE_2D,D_ATLAS);g.disable(g.BLEND);g.depthMask(true);
 g.uniform1f(P_.uMode,0);glDraw(GLB.floor.b,GLB.floor.n);g.uniform1f(P_.uMode,1);glDraw(GLB.wall.b,GLB.wall.n);
 const R=V.x,U=V.y;
 const bb=(a,cx,cz,w,h,yoff,flip)=>{const P=(sx,sy)=>[cx+R[0]*sx*w+U[0]*sy*h,(yoff||0)+R[1]*sx*w+U[1]*sy*h,cz+R[2]*sx*w+U[2]*sy*h];const u0=flip?1:0,u1=flip?0:1;const A=P(-.5,0),Bq=P(.5,0),C=P(.5,1),Dq=P(-.5,1);const pv=(p,u,v)=>a.push(p[0],p[1],p[2],0,0,1,u,v,1);pv(A,u0,1);pv(Bq,u1,1);pv(C,u1,0);pv(A,u0,1);pv(C,u1,0);pv(Dq,u0,0)};
 const flat=(a,cx,cz,sx,sz,y)=>{const pv=(x,z,u,v)=>a.push(x,y||.012,z,0,1,0,u,v,1);pv(cx-sx,cz+sz,0,1);pv(cx+sx,cz+sz,1,1);pv(cx+sx,cz-sz,1,0);pv(cx-sx,cz+sz,0,1);pv(cx+sx,cz-sz,1,0);pv(cx-sx,cz-sz,0,0)};
 const drawDyn=(arr,tex,mode,tint)=>{if(!arr.length)return;const f=arr instanceof Float32Array?arr:new Float32Array(arr);g.bindBuffer(g.ARRAY_BUFFER,GLB.dyn);g.bufferData(g.ARRAY_BUFFER,f,g.DYNAMIC_DRAW);g.bindTexture(g.TEXTURE_2D,tex);g.uniform1f(P_.uMode,mode);if(tint)g.uniform4fv(P_.uTint,tint);glDraw(GLB.dyn,f.length/9)};
 const view=(x,z)=>Math.abs(x-D.cx)<12&&z-D.cz<6&&D.cz-z<16;
 const groups={},shad=[];for(const pr of D.props){if(!view(pr.x,pr.z))continue;const tall=pr.k==='tree'||pr.k==='pine';(groups[pr.k]=groups[pr.k]||[]);bb(groups[pr.k],pr.x,pr.z,pr.s,tall?pr.s*1.75:pr.s,pr.y)}
 const locs=[];WLOC.forEach((o,li)=>{if(!view(o.x+.5,o.y+.5))return;locs.push([o,li])});
 const lead=uById(P.party[0]);
 g.enable(g.BLEND);g.blendFunc(g.SRC_ALPHA,g.ONE_MINUS_SRC_ALPHA);g.depthMask(false);flat(shad,D.ax,D.ay,.3,.18);for(const[o]of locs)flat(shad,o.x+.5,o.y+.55,.62,.3);drawDyn(shad,canvasTex('shadow'),4);g.depthMask(true);g.disable(g.BLEND);
 g.uniform1f(P_.uDith,0);g.uniform1f(P_.uCutOn,0);g.uniform1f(P_.uTime,time);for(const k in groups)drawDyn(groups[k],canvasTex(k),2);g.uniform1f(P_.uDith,0);
 for(const[o]of locs){const kind=o.k==='town'?'town'+o.id:'dg'+o.ci;const a=[];bb(a,o.x+.5,o.y+.5,1.5,1.5,0);drawDyn(a,canvasTex(kind),2)}
 if(lead){const tx=heroTex(lead.id);if(tx){const im=art(lead.id),hh=1.05,ww=hh*im.naturalWidth/im.naturalHeight;const a=[];bb(a,D.ax,D.ay,ww,hh,0,D.face<0);drawDyn(a,tx,2);silhouette(a,tx,drawDyn)}}
 g.enable(g.BLEND);g.blendFunc(g.ONE,g.ONE);g.depthMask(false);const gl_=canvasTex('glow');const tgtCi=curDun(),done=CHAPTERS.every((c,i)=>chapClear(i));
 for(const[o]of locs){if(o.k==='dun'&&o.ci===tgtCi&&!done){const p=.55+.3*Math.sin(time*3);const a=[];bb(a,o.x+.5,o.y+.5,2.4,2.4,-.2);drawDyn(a,gl_,3,[1,.8,.3,p]);const ar=[];bb(ar,o.x+.5,o.y+.5,.5,.5,1.75+Math.sin(time*4)*.12);drawDyn(ar,canvasTex('arrow'),3,[1,.9,.4,1])}
  else if(o.k==='dun'&&!chapOpen(o.ci)){const a=[];bb(a,o.x+.5,o.y+.5,2,2,-.1);drawDyn(a,gl_,3,[.5,.2,.8,.35])}}
 g.depthMask(true);g.disable(g.BLEND)}
function drawOverlayWorld(){const W=OW,H=OH,m=D.m;octx.clearRect(0,0,W,H);
 const tx=(t,x,y,c,s,al)=>{octx.font=`700 ${s}px 'M PLUS 1p',sans-serif`;octx.textAlign=al||'center';octx.fillStyle='rgba(0,0,0,.8)';octx.fillText(t,x+1,y+1);octx.fillStyle=c;octx.fillText(t,x,y)};
 let near=null,nd=4;for(const o of WLOC){const d=Math.hypot(o.x+.5-D.ax,o.y+.5-D.ay);if(d<nd){nd=d;near=o}}
 const label=near?(near.k==='town'?TOWNS[near.id].name:DUN[near.ci].name):'';
 if(label){octx.fillStyle='rgba(0,0,0,.45)';octx.fillRect(W/2-70,6,140,20);tx(label,W/2,21,'#f0e0b0',12)}
 const cs=D.big?Math.max(2,Math.floor(Math.min((W-16)/m.w,(H-60)/m.h))):1.4,ox=D.big?Math.floor((W-cs*m.w)/2):W-cs*m.w-6,oy=D.big?Math.floor((H-cs*m.h)/2):6;
 if(D.big){octx.fillStyle='rgba(0,0,8,.9)';octx.fillRect(0,0,W,H)}
 if(!D.mapC||D.mapC.cs!==cs){const c=document.createElement('canvas');c.width=m.w*cs;c.height=m.h*cs;const g=c.getContext('2d');const col=['#5a9a3e','#c8a870','#e0d098','#a07040','#2a5a9a','#8a7a6a','#2a5a24'];for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){g.fillStyle=col[m.K[y*m.w+x]];g.fillRect(x*cs,y*cs,cs,cs)}D.mapC=c;c.cs=cs}
 octx.globalAlpha=D.big?1:.85;octx.drawImage(D.mapC,ox,oy);octx.globalAlpha=1;octx.strokeStyle='#fff8';octx.strokeRect(ox-.5,oy-.5,m.w*cs+1,m.h*cs+1);
 for(const o of WLOC){octx.fillStyle=o.k==='town'?'#fff':(dDone(o.ci)?'#8a8aa0':dOpen(o.ci)?'#ff5a3a':'#7a3aa8');const r=D.big?Math.max(3,cs*.7):2;octx.fillRect(ox+o.x*cs+cs/2-r,oy+o.y*cs+cs/2-r,r*2,r*2);
  if(D.big)tx(o.k==='town'?TOWNS[o.id].name:DUN[o.ci].name,ox+o.x*cs+cs/2,oy+o.y*cs-5,o.k==='town'?'#fff':'#ffd0c0',10)}
 octx.fillStyle=Math.sin(time*8)>0?'#ff3a3a':'#ffff60';octx.beginPath();octx.arc(ox+D.ax*cs,oy+D.ay*cs,D.big?Math.max(3,cs*.6):2.2,0,7);octx.fill();
 if(D.big){const ng=nextGoal(),cut=ng.indexOf('「');if(cut>0&&ng.length>24){tx(ng.slice(0,cut),W/2,oy+m.h*cs+18,'#ffe8a8',11);tx(ng.slice(cut),W/2,oy+m.h*cs+34,'#ffe8a8',12)}else tx(ng,W/2,oy+m.h*cs+18,'#ffe8a8',11);tx('タップで閉じる',W/2,H-10,'#aab',11)}}
async function enterWorld(pos){const m=genWorld();if(!glInit()){await modal('<h3>3D表示に対応していません</h3><p style="text-align:center">このブラウザではWebGLが使えません。</p>');return}
 await fade(true);B=null;closeSheet();if(P.wver!==2){P.wver=2;if(!pos)P.wpos=null;P.vehOn=null}const p=pos||P.wpos||[WLOC[0].x,WLOC[0].y];const sx=p[0],sy=p[1];
 D={world:true,ci:-1,m,x:sx,y:sy,ax:sx+.5,ay:sy+.5,cx:sx+.5,cz:sy+.5,face:1,trail:[],props:[],yaw:0,pitch:0,gy:0,gp:0,roll:0,spd:0,walkT:0,walk:0,busy:false,seen:null,big:false,enc:rnd(12,20),jx:0,jy:0,turn:0,hurt:0,lamps:[]};
 P.scene='world';P.wpos=[sx,sy];D.veh=(P.vehOn&&P.veh&&P.veh[P.vehOn]&&P.veh[P.vehOn].x===sx&&P.veh[P.vehOn].y===sy)?P.vehOn:null;if(!D.veh)P.vehOn=null;save();D_ATLAS=atlasFor('field');wProps();buildWorldMesh();scene='dungeon';setMode('field');resize();dResize();updDpan();playBGM('quest',true);await fade(false);updCtl();vehEvents().catch(e=>console.error(e))}
async function wArrive(){const m=D.m,i=D.y*m.w+D.x;P.wpos=[D.x,D.y];if(D.veh){P.veh[D.veh]={x:D.x,y:D.y};return}if(P.veh&&P.veh.air&&P.veh.air.x===D.x&&P.veh.air.y===D.y){vehBoard('air');return}const li=m.L[i];if(li<0)return;const o=WLOC[li];D.busy=true;dStop();
 if(o.k==='town'){await enterTown(o.id);return}
 const ci=o.ci,dn=DUN[ci];if(!dOpen(ci)){SFX.ng();await modal(`<h3>${dn.name}</h3><p style="text-align:center">禍々しい結界にはばまれて、中に入れない……\n（物語を進めると入れるようになります）</p>`);D.busy=false;return}
 const c=await modal(`<h3>${dn.name}</h3><p style="text-align:center;font-size:13px">推奨Lv ${dLvD(ci)}　宝箱 ${dLootCount(ci)}/${genMaze(ci).chests.length}${dDone(ci)?'\n<b style="color:#ffe04a">魔神封印済み</b>':''}</p>`,[{l:'中に入る',c:'g'},{l:'やめる'}]);
 if(c===0){save();await enterDungeon(ci)}else D.busy=false}
async function wBattle(){SFX.boom(3);dStop();const cc=Math.min(D.m.near[D.y*D.m.w+D.x],curChapter()),ch=CHAPTERS[cc];const pool=[];ch.stages.forEach(s=>s.waves.forEach(w=>{if(!w.some(e=>ENEMIES[e].pillar))pool.push(w)}));const L=Math.max(1,dLv(cc)-2);
 const s={id:'W'+cc,name:'フィールド',lv:L,ci:cc,si:-1,bg:'field',waves:[pick(pool)],exp:Math.round(25*Math.pow(L,1.6)*.26)+16,gil:16*L+30};
 await encFlash();await startQuest(s,{})}
async function encFlash(){for(let k=0;k<3;k++){$('#fade').style.background='#fff';$('#fade').style.opacity=.8;await new Promise(r=>setTimeout(r,70));$('#fade').style.opacity=0;await new Promise(r=>setTimeout(r,70))}$('#fade').style.background='#000'}
function wEncOk(){const m=D.m;for(const o of WLOC)if(o.k==='town'&&Math.abs(o.x-D.x)+Math.abs(o.y-D.y)<=3)return false;return m.L[D.y*m.w+D.x]<0}
/* ================= TOWN ================= */
let TW=null;
function renderTown(){const t=TOWNS[TW.id];$('#tpan').innerHTML=`<div class="tname">${t.name}</div><div class="tbtns"><button data-a="inn">宿屋<small>${t.inn} G</small></button><button data-a="shop">道具屋</button><button data-a="talk">話を聞く</button><button data-a="menu">メニュー</button><button data-a="save">セーブ</button><button data-a="out" class="out">町を出る</button></div>`;
 $$('#tpan button').forEach(b=>b.onclick=async()=>{initAudio();const a=b.dataset.a;if(busyUI())return;
  if(a==='inn')doInn();else if(a==='shop'){SFX.ok();showShop()}else if(a==='talk'){SFX.ok();await talk(townTalk())}else if(a==='menu')openMenu();else if(a==='save'){P.wpos=[WLOC.find(l=>l.k==='town'&&l.id===TW.id).x,WLOC.find(l=>l.k==='town'&&l.id===TW.id).y];save();SFX.coin();toast('冒険の記録をセーブしました')}else if(a==='out'){SFX.ok();$('#shop').style.display='none';const o=WLOC.find(l=>l.k==='town'&&l.id===TW.id);TW=null;await enterWorld([o.x,o.y])}})}
const busyUI=()=>$('#modal').style.display==='flex'||$('#talk').style.display==='block';
async function doInn(){const t=TOWNS[TW.id];SFX.ok();const c=await modal(`<h3>宿屋</h3><p style="text-align:center">「いらっしゃい！ ひと晩 ${t.inn} G だよ。\n泊まっていくかい？」\n<small style="color:#9ab">所持金 ${fmt(P.gil)} G</small></p>`,[{l:'泊まる',c:'g',dis:P.gil<t.inn},{l:'やめる'}]);if(c!==0)return;
 P.gil-=t.inn;healAll();save();updTop();await fade(true);stopSeq();await sleep(700);SFX.lvl();await sleep(700);await fade(false);playBGM('home',true);toast('ぐっすり眠って、全員のHP・MPが回復した！',2400)}
function townTalk(){const t=TOWNS[TW.id];const r=srng(Math.floor(time*7)+TW.id);const pool=t.npc.slice();const a=pool.splice(Math.floor(r()*pool.length),1)[0],b=pool[Math.floor(r()*pool.length)];
 const hint=CHAPTERS.every((c,i)=>chapClear(i))?'魔神がいなくなって、町に笑顔が戻ってきたよ。ありがとう！':(()=>{const ci=curDun(),o=WLOC.find(l=>l.ci===ci),me=WLOC.find(l=>l.k==='town'&&l.id===TW.id);return `${dirName(o.x-me.x,o.y-me.y)}の「${DUN[ci].name}」から、魔神の気配がするらしい。`})();
 return [['N','町の人「'+a+'」'],['N','旅人「'+hint+'」'],['N','老人「'+b+'」']]}
function showShop(){const el=$('#shop');el.style.display='block';renderShop()}
function renderShop(){const el=$('#shop');const list=TW?TOWNS[TW.id].shop:['potion'];
 el.innerHTML=`<div class="bk"><h2 style="margin:0">道具屋</h2><span style="font-weight:800;color:#ffe08a">${fmt(P.gil)} G</span><button class="btn" id="shB">もどる</button></div>`+list.map(k=>{const it=ITEMS[k];return `<div class="shop"><div class="ic" style="--ic:${it.ic};background:#0008"><i></i></div><div class="nm">${it.n}<small>${it.d}</small></div><div class="hv">所持 ${P.items[k]||0}</div><button class="btn g" data-k="${k}" ${P.gil<it.price?'disabled':''}>${fmt(it.price)} G</button></div>`}).join('')+'<p style="font-size:12px;color:#9ab;line-height:1.7">「経験値の結晶」はメニューのアイテムから使えます。</p>';
 $('#shB').onclick=()=>{SFX.cur();el.style.display='none';if(D)D.busy=false};
 el.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{const it=ITEMS[b.dataset.k];if(P.gil<it.price)return;P.gil-=it.price;P.items[b.dataset.k]=(P.items[b.dataset.k]||0)+1;SFX.coin();save();updTop();renderShop()})}
function drawTown(){drawHome()}
/* ================= FIELD MENU ================= */
let fTab='st';
function openMenu(){initAudio();SFX.ok();if(D){D.busy=true;dStop()}$('#fmenu').style.display='block';renderFMenu()}
function closeMenu(){SFX.cur();$('#fmenu').style.display='none';if(D)D.busy=false;updDpan();updTop()}
function renderFMenu(){const el=$('#fmenu');const tabs=[['st','ステータス'],['eq','そうび'],['it','アイテム'],['od','ならびかえ'],['sv','セーブ'],['cf','設定']];
 let h=`<div class="fmh"><div class="fmg">${fmt(P.gil)} G<small>封印 ${sealed()}/${TOTAL_SEAL}柱　${CHAPTERS[curChapter()].name}</small></div><button class="btn" id="fmX">とじる</button></div><div class="tabs">${tabs.map(([k,l])=>`<button data-t="${k}" class="${fTab===k?'on':''}">${l}</button>`).join('')}</div>`;
 const row=(u,extra)=>{const d=UNITS[u.id],s=ustat(u),st=curSt(u);return `<div class="fmu" data-uid="${u.uid}"><img src="${portrait(u.id)}" alt=""><span class="a"><b>${d.name}</b><small>${d.job}　Lv ${u.lv}</small><span class="xp"><i style="width:${u.exp/uNext(u.lv)*100}%"></i></span></span><span class="b">HP <b class="${st.hp<=0?'ko':''}">${st.hp<=0?'戦闘不能':st.hp}</b>/${s.hp}<br>MP <b>${st.mp}</b>/${s.mp}</span>${extra||''}</div>`};
 if(fTab==='st')h+=P.party.map(uid=>row(uById(uid))).join('')+`<p class="fmn">${nextGoal()}</p><p style="font-size:11px;color:#9ab">キャラクターをタップすると、能力やアビリティを確認できます。</p>`;
 else if(fTab==='eq')h+=renderEqTab();else if(fTab==='it'){const ks=Object.keys(ITEMS).filter(k=>P.items[k]>0);h+=ks.map(k=>`<button class="op" data-it="${k}"><span>${ITEMS[k].n}<small>${ITEMS[k].d}</small></span><em>×${P.items[k]}</em></button>`).join('')||'<p style="color:#9ab">アイテムを持っていない</p>'}
 else if(fTab==='od')h+=P.party.map((uid,i)=>row(uById(uid),`<span class="mv"><button data-up="${i}" ${i?'':'disabled'}>▲</button><button data-dn="${i}" ${i<P.party.length-1?'':'disabled'}>▼</button></span>`)).join('')+'<p style="font-size:11px;color:#9ab;margin-top:8px">戦闘での並び順です。先頭のキャラクターがフィールドを歩きます。</p>';
 else if(fTab==='sv')h+=`<p class="fmn">冒険の記録をセーブします。${D&&!D.world?'\n<small style="color:#ffb08a">※ダンジョンの中でセーブした場合、つづきはダンジョンの入口からになります。</small>':''}</p><div class="row" style="margin-top:10px"><button class="btn g" id="fmSave" style="width:100%">セーブする</button></div>`;
 else h+=`<div class="row" style="flex-direction:column;gap:8px;display:flex"><button class="btn" id="fmSnd">サウンド：${muted?'OFF':'ON'}</button><button class="btn" id="fmSpd">戦闘スピード：×${P.bspd||1}</button><button class="btn r" id="fmTitle">タイトルにもどる</button></div>`;
 el.innerHTML=h.replace(/\n/g,'<br>');
 $('#fmX').onclick=closeMenu;if(fTab==='eq')bindEqTab(el);el.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{SFX.cur();fTab=b.dataset.t;renderFMenu()});
 if(fTab==='st')el.querySelectorAll('.fmu').forEach(b=>b.onclick=async()=>{SFX.ok();await unitDetail(uById(+b.dataset.uid));renderFMenu()});
 el.querySelectorAll('[data-it]').forEach(b=>b.onclick=()=>useItemField(b.dataset.it));
 el.querySelectorAll('[data-up]').forEach(b=>b.onclick=()=>{const i=+b.dataset.up;[P.party[i-1],P.party[i]]=[P.party[i],P.party[i-1]];save();SFX.cur();renderFMenu()});
 el.querySelectorAll('[data-dn]').forEach(b=>b.onclick=()=>{const i=+b.dataset.dn;[P.party[i+1],P.party[i]]=[P.party[i],P.party[i+1]];save();SFX.cur();renderFMenu()});
 const sv=$('#fmSave');if(sv)sv.onclick=()=>{if(D&&D.world)P.wpos=[D.x,D.y];save();SFX.coin();toast('冒険の記録をセーブしました')};
 const sn=$('#fmSnd');if(sn)sn.onclick=()=>{initAudio();setMute(!muted);renderFMenu()};
 const sp=$('#fmSpd');if(sp)sp.onclick=()=>{P.bspd=(P.bspd||1)===1?2:1;save();SFX.cur();renderFMenu()};
 const tt=$('#fmTitle');if(tt)tt.onclick=async()=>{const c=await modal('<h3>タイトルにもどりますか？</h3><p style="text-align:center">セーブしていない進行は、最後の自動記録までもどります。</p>',[{l:'やめる'},{l:'もどる',c:'r'}]);if(c!==1)return;save();$('#fmenu').style.display='none';await fade(true);D=null;B=null;TW=null;scene='title';setMode('title');titleBusy=false;playBGM('home',true);await fade(false)}}
async function useItemField(k){const it=ITEMS[k];
 const party=P.party.map(uById);const lbl=u=>{const s=ustat(u),st=curSt(u);return `${UNITS[u.id].name}　${it.use==='exp'?'Lv'+u.lv:st.hp<=0?'戦闘不能':'HP '+st.hp+'/'+s.hp}`};
 const c=await modal(`<h3>${it.n}</h3><p style="text-align:center;font-size:13px">${it.d}\nだれに使いますか？</p>`,[...party.map(u=>({l:lbl(u)})),{l:'やめる',c:'r'}]);
 if(c<0||c>=party.length){renderFMenu();return}const u=party[c],s=ustat(u),st=curSt(u);let ok=true,msg='';
 if(it.use==='exp'){const up=gainUExp(u,it.v);msg=up?`${UNITS[u.id].name}のレベルが ${u.lv} に上がった！`:`${UNITS[u.id].name}は経験値を ${fmt(it.v)} 得た`;if(up)SFX.lvl()}
 else if(it.use==='revive'){if(st.hp>0)ok=false;else{st.hp=Math.max(1,Math.round(s.hp*it.p));msg=`${UNITS[u.id].name}が生き返った！`}}
 else if(st.hp<=0)ok=false;
 else if(it.use==='hp'){if(st.hp>=s.hp)ok=false;else{const b=st.hp;st.hp=Math.min(s.hp,st.hp+Math.round(s.hp*it.p));msg=`HPが ${st.hp-b} 回復した`}}
 else if(it.use==='mp'){if(st.mp>=s.mp)ok=false;else{const b=st.mp;st.mp=Math.min(s.mp,st.mp+Math.round(s.mp*it.p));msg=`MPが ${st.mp-b} 回復した`}}
 else if(it.use==='full'){st.hp=s.hp;st.mp=s.mp;msg='HPとMPが全回復した！'}
 if(!ok){SFX.ng();toast('使っても効果がない');renderFMenu();return}P.items[k]--;if(it.use!=='exp')SFX.heal();save();toast(msg);renderFMenu()}
/* ================= TITLE ================= */
let titleBusy=false;
const PROLOGUE=[['N','はるか昔、賢王ソロモンは七十二柱の魔神を指輪に封じた。\nそれから三千年――'],['N','ある夜、封印の指輪がくだけ散り、魔神たちが世界に解き放たれた。'],['N','ここは王都リーフ。\n亡き父の剣を受け継いだ若き剣士アレンは、王に呼び出された。'],['king','よく来た、アレン。こちらは星詠みの巫女ステラどのだ。'],['stella','はじめまして。ソロモンの指輪を守ってきた、星詠みの巫女のステラです。'],['king','西の森で、指輪のかけらとおぼしき光を見た者がおる。アレンよ、巫女どのと共に調べてくれぬか。'],['vald','陛下のご命令です。……くれぐれも、急ぐように。'],['gard','（小声で）……ヴァルドの野郎か。'],['stella','西の森から、ただならぬ魔力が流れてきています。急ぎましょう。'],['gard','まずは宿屋で休んで、道具屋で薬を買ってからだな！'],['allen','ああ。……父さんの剣が、なんだか震えてる。行こう、みんな！']];
async function startFromTitle(){if(scene!=='title'||titleBusy)return;titleBusy=true;initAudio();SFX.ok();let cont=false;
 if(P&&P.started){const c=await modal('<h3 style="font-size:20px">アストラル・クロニクル</h3>',[{l:'つづきから',c:'g'},{l:'はじめから'}]);
  if(c===1){const y=await modal('<h3>はじめから遊びますか？</h3><p style="text-align:center">今までの記録は消えてしまいます。</p>',[{l:'やめる'},{l:'はじめから',c:'r'}]);if(y!==1){titleBusy=false;return}newPlayer()}else cont=true}else newPlayer();
 if(cont){if(P.scene==='town')await enterTown(P.town||0,'inn');else await enterWorld(P.wpos);titleBusy=false;return}
 P.started=1;save();await enterTown(0,'castle');await talk(PROLOGUE);
 await modal('<h3>あそびかた</h3><p style="font-size:13px;line-height:1.75"><b>町</b>：人にぶつかると話ができます。看板のある建物（INN・SHOP）の扉に入ると宿屋・道具屋。「街メニュー」からも利用できます。町の出口からフィールドへ。\n<b>フィールド・ダンジョン</b>：左下のスティックで移動。画面をドラッグするとカメラが回り込みます。歩いていると魔物に出会います。\n<b>戦闘</b>：キャラクターごとにコマンドを選ぶと、全員の行動が順番に実行されます。攻撃を受けたりするとリミットゲージがたまり、満タンで必殺技「リミット」が使えます。\n<b>HP・MP</b>は戦闘が終わっても回復しません。宿屋や、ダンジョンの青い泉で回復しましょう。\n<b>メニュー</b>から、アイテム・ステータス・セーブができます。</p>');
 titleBusy=false}
/* ---- file-based BGM ---- */
const FBGM={quest:'bgm/field',battle:'bgm/battle',boss:'bgm/boss'};const FBUF={};let fbSrc=null,fbName=null,fbGain=null;
function loadFBGM(name){if(FBUF[name]||!AC)return;FBUF[name]='loading';const get=ext=>fetch(FBGM[name]+ext).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}).then(ab=>new Promise((res,rej)=>AC.decodeAudioData(ab,res,rej)));
 get('.ogg').catch(()=>get('.mp3')).then(b=>{FBUF[name]=b;if(wantBGM===name&&!muted)playFileBGM(name,true)}).catch(()=>{FBUF[name]=null})}
function playFileBGM(name,force){if(fbName===name&&fbSrc&&!force&&wantBGM===name)return;stopSeq();wantBGM=name;if(!AC||muted)return;const b=FBUF[name];if(!(b instanceof AudioBuffer)){loadFBGM(name);return}
 const src=AC.createBufferSource();src.buffer=b;src.loop=true;fbGain=AC.createGain();fbGain.gain.setValueAtTime(0,AC.currentTime);fbGain.gain.linearRampToValueAtTime(.55,AC.currentTime+.6);src.connect(fbGain);fbGain.connect(master||AC.destination);src.start();fbSrc=src;fbName=name}
function stopFileBGM(){if(fbSrc){try{const s=fbSrc,g=fbGain;g.gain.cancelScheduledValues(AC.currentTime);g.gain.setValueAtTime(g.gain.value,AC.currentTime);g.gain.linearRampToValueAtTime(0,AC.currentTime+.3);s.stop(AC.currentTime+.32)}catch(e){}}fbSrc=null;fbName=null}
function dSolid(x,y){const m=D.m;if(x<0||y<0||x>=m.w||y>=m.h)return 1;const i=y*m.w+x;if(D.world&&D.veh)return D.veh==='air'?0:(m.K[i]===4?0:9);if(D.town&&m.door[i]>=0)return 5;if(m.g[i])return 1;if(i===m.gate&&!D.gateOpen)return 2;if(m.bossAt&&m.bossAt[i]>=0&&!P.cleared[CHAPTERS[DUN[D.ci].ch].stages[m.bossAt[i]].id])return 3;return 0}
function bossOf(st){return st.waves[st.waves.length-1].find(e=>ENEMIES[e].pillar)||st.waves[st.waves.length-1][0]}
function dBump(x,z){if(D.world&&D.veh==='ship'){vehShipBump(x,z);return}if(D.world&&!D.veh&&vehWalkBump(x,z))return;const b=dBlocked(x,z);if(D.town){tBump(x,z,b).catch(e=>console.error(e));return}if(b===2)return dTryGate(x,z);if(b!==3||D.world||time<(D.bcool||0))return;const m=D.m;for(const[ox,oz]of[[-PR,-PR],[PR,-PR],[-PR,PR],[PR,PR]]){const cx=Math.floor(x+ox),cy=Math.floor(z+oz),i=cy*m.w+cx;if(cx>=0&&cy>=0&&cx<m.w&&cy<m.h&&m.bossAt[i]>=0){D.busy=true;dStop();dBoss(m.bossAt[i]).catch(e=>console.error(e));return}}}
async function dBoss(si){const ch=CHAPTERS[DUN[D.ci].ch],s=ch.stages[si],last=si===ch.stages.length-1,first=!P.cleared[s.id];const pid=bossOf(s),pe=ENEMIES[pid];
 if(first){const lines=[];if(last&&DUN[D.ci].gl)lines.push(...DUN[D.ci].gl);if(lines.length)await talk(lines)}
 const c=await modal(`<h3>${pe.pillar?(pe.rank?`序列${pe.rank}位 ${pe.title}`:pe.title):'強敵'}</h3><p style="text-align:center;font-size:16px"><b>${pe.n}</b>が道をふさいでいる！</p><p style="text-align:center;font-size:12px;color:#9ab">推奨Lv ${s.lv}</p>`,[{l:'戦う',c:'g'},{l:'いったん引く'}]);
 if(c!==0){D.bcool=time+1.2;D.busy=false;return}
 await encFlash();const bs=Object.assign({},s,{waves:[s.waves[s.waves.length-1]],boss:1});await startQuest(bs,{boss:1})}
async function dArrive(){dSee();const m=D.m,i=D.y*m.w+D.x,t=m.T[i];
 if(i===m.S){D.busy=true;dStop();const c=await modal(`<h3>${DUN[D.ci].name}</h3><p style="text-align:center">外に出ますか？</p>`,[{l:'外に出る',c:'g'},{l:'やめる'}]);if(c===0){await dExit();return}D.busy=false;return}
 if(t===6&&!D.keyGot){D.keyGot=1;D.key=true;SFX.coin();D.busy=true;dStop();await modal('<h3>鉄の箱を開けた！</h3><p style="text-align:center;font-size:16px">「鉄格子の鍵」を手に入れた！\n鉄格子に向かって進むと開けられます。</p>');D.busy=false;return}
 if(t===2&&!(P.dchest&&P.dchest['n'+D.ci+':'+i])){D.busy=true;dStop();P.dchest=P.dchest||{};P.dchest['n'+D.ci+':'+i]=1;const k=m.chests.indexOf(i),[it,n]=k===0&&DUN[D.ci].si===0&&DLOOT_EQ[DUN[D.ci].ch]?[DLOOT_EQ[DUN[D.ci].ch][0],1]:k===0&&DUN[D.ci].si===1&&DLOOT_EQ2[DUN[D.ci].ch]?[DLOOT_EQ2[DUN[D.ci].ch],1]:DUN[D.ci].loot[k];SFX.coin();
  let msg;if(it==='gil'){P.gil+=n;msg=`${fmt(n)} ギル`}else if(EQUIP[it]){addEq(it,n);msg=`${EQUIP[it].n}（${eqDesc(it)}）`}else{P.items[it]=(P.items[it]||0)+n;msg=`${ITEMS[it].n} ×${n}`}save();await modal(`<h3>宝箱を開けた！</h3><p style="text-align:center;font-size:16px">${msg} を手に入れた！</p>`);D.busy=false;return}
 if(t===3){healAll();save();SFX.heal();updDpan();toast('青い泉の力で、全員のHP・MPが回復した！');return}
 if(t===4){D.busy=true;dStop();const c=await modal(`<h3>帰還の魔法陣</h3><p style="text-align:center">魔法陣の力で、ダンジョンの外に出ますか？</p>`,[{l:'外に出る',c:'g'},{l:'やめる'}]);if(c===0){await dExit();return}D.busy=false}}
async function dExit(){if(!D)return;await enterWorld(P.wpos)}
function dBattleLv(ci){return dLv(ci)}
async function dBattle(){SFX.boom(3);dStop();const ch=CHAPTERS[DUN[D.ci].ch];const pool=[];ch.stages.forEach(s=>s.waves.forEach(w=>{if(!w.some(e=>ENEMIES[e].pillar))pool.push(w)}));const L=dLvD(D.ci);
 const s={id:'D'+D.ci,name:DUN[D.ci].name,lv:L,ci:DUN[D.ci].ch,si:-1,bg:ch.bg,waves:[pick(pool)],exp:Math.round(25*Math.pow(L,1.6)*.3)+20,gil:20*L+40};
 await encFlash();await startQuest(s,{})}
function updDpan(){$('#dparty').innerHTML=P.party.map(uid=>{const u=uById(uid);if(!u)return'';const s=ustat(u),st=curSt(u);return `<div class="dm"><img src="${portrait(u.id)}" alt="" style="${st.hp<=0?'filter:grayscale(1) brightness(.6)':''}"><span class="nf"><b>${UNITS[u.id].name}</b><em style="${st.hp<=0?'color:#ff6a6a':''}">${st.hp}</em><span class="hb"><i style="width:${st.hp/s.hp*100}%;${st.hp<s.hp*.3?'background:#e8a020':''}"></i></span><span class="mb"><i style="width:${s.mp?st.mp/s.mp*100:0}%"></i></span></span></div>`}).join('')}
function drawDungeon(){if(!D||!GL)return;const tc=$('#tcv');if(D.town&&town2DReady()){tc.style.display='block';dcv.style.display='none';drawTown2D();drawOverlayTown();return}if(!D.world&&!D.town&&dungeon2DReady()){tc.style.display='block';dcv.style.display='none';drawDungeon2D();drawOverlay();return}if(D.world&&world2DReady()){tc.style.display='block';dcv.style.display='none';drawWorld2D();drawOverlayWorld();return}tc.style.display='none';dcv.style.display='block';if(D.town){glRenderTown();drawOverlayTown()}else if(D.world){glRenderWorld();drawOverlayWorld()}else{glRender();drawOverlay()}}
function setMode(m){const f=m==='field';{const t_=$('#ttl');if(t_)t_.style.display=m==='title'?'block':'none'}$('#top').style.display=m==='town'?'flex':'none';$('#nav').style.display='none';$('#bpan').style.display=m==='battle'?'flex':'none';$('#cmdw').style.display=m==='battle'?'flex':'none';$('#bhud').style.display=m==='battle'?'flex':'none';$('#dpan').style.display=f?'flex':'none';$('#tpan').style.display=m==='town'?'flex':'none';$('#dhud').style.display='none';$('#dcv').style.display=f?'block':'none';$('#dov').style.display=f?'block':'none';$('#joy').style.display=f?'block':'none';$('#cv').style.visibility=f?'hidden':'visible';$('#tcv').style.display='none';$$('.page').forEach(e=>e.style.display='none');if(f)updCtl();requestAnimationFrame(resize)}
function bindPanel(el,i){el.addEventListener('click',()=>cmdPanelTap(i))}
/* ================= WALKABLE TOWNS ================= */
const NPAL={
 guard:{id:'n_guard',hair:'#5a3a22',skin:'#f0c098',cloth:'#3a4a9a',acc:'#e8c040',pants:'#2a2a3a',hat:'helm',armor:'#c8ccd8',wpn:'spear'},
 youth:{id:'n_youth',hair:'#4a2a1a',skin:'#f0c098',cloth:'#5a8a3a',acc:'#c8a060',pants:'#5a4a3a'},
 girl:{id:'n_girl',hair:'#c8602a',skin:'#f6c9a0',cloth:'#c84a6a',acc:'#ffffff',pants:'#7a2a3a',hat:'long',robe:1},
 child:{id:'n_child',hair:'#6a4a2a',skin:'#f6c9a0',cloth:'#e8a030',acc:'#ffffff',pants:'#3a5aa8',hat:'cap',hatc:'#3a6ad8'},
 old:{id:'n_old',hair:'#e0e0e0',skin:'#e8b890',cloth:'#7a5a8a',acc:'#c8a040',pants:'#4a3a4a',hat:'bald',robe:1},
 merchant:{id:'n_merch',hair:'#3a2a1a',skin:'#e8b890',cloth:'#c8823a',acc:'#6a3a1a',pants:'#4a3a2a',hat:'beret',hatc:'#8a2a2a'},
 sailor:{id:'n_sailor',hair:'#2a1a10',skin:'#d8a070',cloth:'#f0f0f4',acc:'#2a4aa8',pants:'#2a4a9a',hat:'band'},
 priest:{id:'n_priest',hair:'#d8c8a0',skin:'#f0c098',cloth:'#f4f4fa',acc:'#e8c040',pants:'#c8c8d8',hat:'hood',hatc:'#f4f4fa',robe:1},
 nun:{id:'n_nun',hair:'#2a2a2a',skin:'#f6c9a0',cloth:'#2a2a3a',acc:'#ffffff',pants:'#2a2a3a',hat:'hood',hatc:'#2a2a3a',robe:1},
 king:{id:'n_king',hair:'#e8e0d0',skin:'#f0c098',cloth:'#a82a3a',acc:'#f0d040',pants:'#6a1a2a',hat:'tiara',cape:'#d83a3a',robe:1},
 queen:{id:'n_queen',hair:'#f0c860',skin:'#f6c9a0',cloth:'#7a3aa8',acc:'#f0d040',pants:'#4a1a6a',hat:'tiara',robe:1},
 minister:{id:'n_min',hair:'#9a9a9a',skin:'#e8b890',cloth:'#2a3a6a',acc:'#e8c040',pants:'#1a2a4a',hat:'beret',hatc:'#2a3a6a',robe:1}};
function townDef(key){const defs={
 t0:{name:'王都リーフ',W:22,H:30,base:',',edge:'T',
  fills:[['.',9,7,4,23],['.',4,13,14,6],['.',3,7,16,2],[':',2,12,7,1],[':',13,12,7,1],[':',3,23,6,1],[':',13,23,6,1],[':',4,28,5,1],[':',13,28,5,1],['o',10,15,2,2],['E',9,29,4,1]],
  pts:[['b',5,14],['b',6,14],['b',15,14],['b',16,14],['b',5,17],['b',6,17],['b',15,17],['b',16,17],['l',8,13],['l',13,13],['l',8,18],['l',13,18],['x',20,10],['x',20,11],['w',7,20],['T',2,7],['T',19,7],['T',7,26],['T',14,26],['p',1,13],['p',20,15],['T',8,21],['f',1,18],['f',20,19],['m',4,15],['m',17,16],['n',8,16],['n',13,15],['q',3,12],['q',5,12],['q',16,12],['q',18,12],['k',20,13],['u',7,22]],
  blds:[{x:5,y:1,w:12,h:6,wall:'castle',roof:'blue',hgt:2.3,rt:'flat',doors:[10,11],kind:'castle'},{x:3,y:1,w:2,h:6,wall:'castle',roof:'blue',hgt:3.1,rt:'pyr'},{x:17,y:1,w:2,h:6,wall:'castle',roof:'blue',hgt:3.1,rt:'pyr'},
   {x:2,y:9,w:5,h:3,wall:'plaster',roof:'red',doors:[4],kind:'inn'},{x:15,y:9,w:5,h:3,wall:'brick',roof:'blue',doors:[17],kind:'shop'},
   {x:2,y:20,w:4,h:3,wall:'plaster',roof:'red',doors:[3],kind:'house'},{x:16,y:20,w:4,h:3,wall:'plaster',roof:'blue',doors:[18],kind:'house'},{x:2,y:25,w:5,h:3,wall:'brick',roof:'red',doors:[4],kind:'house'},{x:15,y:25,w:5,h:3,wall:'plaster',roof:'red',doors:[17],kind:'house'}],
  spawn:{world:[10.5,28.4,'up'],castle:[10.5,7.6,'down'],inn:[4.5,12.6,'down'],shop:[17.5,12.6,'down']},
  npcs:[['guard','衛兵',8.5,7.5,0,['ここは王都リーフ。奥はリーフ城だ。','王様が勇者の訪れを待っておられるぞ。']],['guard','衛兵',13.5,7.5,0,['城の中では、王様に話しかけてみるといい。']],
   ['youth','青年',11.5,20.5,3,['やあ、ここは王都リーフだよ。','魔神があらわれてから、夜は外に出られなくなっちゃった。']],['girl','看板娘',6.5,16.2,2,['噴水の水は、むかし星の巫女さまが清めたんですって。','宿屋に泊まれば、どんなケガも治っちゃうわ。']],
   ['child','子ども',14.5,15.5,3,['ぼくね、大きくなったら剣士になるんだ！','お兄ちゃんたち、魔神とたたかうの？ すっげー！']],['old','老人',3.5,13.5,0,['HP や MP は、戦いが終わっても回復せんぞ。','宿屋か、ダンジョンの青い泉で休むのじゃ。']],
   ['merchant','商人',18.5,13.4,1,['道具屋の品ぞろえは町ごとにちがうよ。','港町マリナには、ハイポーションがあるらしい。']],['youth','旅人',11.5,25.5,2,'hint']]},
 c0:{name:'リーフ城',W:16,H:17,base:'g',edge:'W',indoor:1,
  fills:[['c',7,2,2,15],['E',7,16,2,1],['X',6,1,4,1]],
  pts:[['P',4,4],['P',11,4],['P',4,8],['P',11,8],['P',4,12],['P',11,12]],blds:[],
  props:[['throne',8,1.55,1.1],['candela',3,2.2,.55],['candela',13,2.2,.55],['banner',2.5,.9,.8],['banner',13.5,.9,.8],['candela',3,14.5,.55],['candela',13,14.5,.55]],
  spawn:{town:[7.9,15.3,'up']},
  npcs:[['king','リーフ王',7.5,2.5,0,'king'],['queen','王妃',9.6,2.6,0,['どうか、無事に帰ってきてくださいね。','ステラという巫女さまの話は、王家にも伝わっています。']],['minister','大臣ヴァルド',5.4,3,0,'vald'],['queen','王女',11.7,2.7,0,['お父さまは強がっているけれど、本当は毎晩眠れていないの。','あなたたちが、この国の希望なのね……！']],['girl','侍女',3.4,3.4,0,['王女さまは、旅の方のお話を聞くのが大好きなんです。','お城の中では、お静かにお願いしますね。']],
   ['guard','騎士団長',6.2,9.5,0,['陛下の御前である！','魔神どもには、我ら騎士団の剣も通じなかった……']],['guard','近衛兵',9.8,9.5,0,['城の宝物庫は、魔神のせいで空っぽだ……']],['guard','兵士',13.5,12.5,2,['訓練のしすぎで足が痛い……']]]},
 t1:{name:'港町マリナ',W:22,H:28,base:'.',edge:'T',
  fills:[['~',17,1,5,26],['=',15,8,6,2],['=',15,18,6,2],[',',1,1,4,2],[',',1,24,5,3],['E',6,27,4,1]],
  pts:[['x',16,6],['x',16,11],['x',14,17],['x',16,21],['l',7,8],['l',13,8],['l',7,15],['l',13,15],['b',6,22],['b',7,22],['w',12,24],['T',1,24],['T',3,25],['T',19,26],['m',13,13],['m',13,14],['n',7,25],['n',10,25],['q',3,6],['q',5,6],['q',8,6],['q',10,6],['u',7,12]],
  blds:[{x:13,y:1,w:3,h:3,wall:'plaster',roof:'red',hgt:3.6,rt:'pyr'},{x:2,y:3,w:5,h:3,wall:'plaster',roof:'red',doors:[4],kind:'inn'},{x:8,y:3,w:4,h:3,wall:'brick',roof:'red',doors:[9],kind:'shop'},
   {x:2,y:10,w:4,h:3,wall:'plaster',roof:'red',doors:[3],kind:'house'},{x:8,y:10,w:5,h:3,wall:'plaster',roof:'blue',doors:[10],kind:'house'},{x:2,y:17,w:4,h:3,wall:'brick',roof:'red',doors:[3],kind:'house'},{x:8,y:17,w:5,h:3,wall:'plaster',roof:'red',doors:[11],kind:'house'}],
  props:[['boat',19.5,12,1.6],['boat',19.5,23,1.4]],
  spawn:{world:[7.5,26.4,'up'],inn:[4.5,6.6,'down'],shop:[9.5,6.6,'down']},
  npcs:[['sailor','船乗り',18.5,9,0,['沖に沈んだ船から、夜な夜な鐘の音がするんだ……','あんな気味の悪い海、見たことねえ。']],['sailor','漁師',16.2,19,1,['魚がちっともとれやしねえ。','魔神のしわざに決まってるさ！']],
   ['girl','おかみさん',6.5,14.5,3,['港町マリナへようこそ！','白い壁は、潮風から家を守るためなのよ。']],['child','女の子',10.5,21.5,3,['灯台のてっぺんから、海の底の船が見えたんだ！']],
   ['merchant','港の商人',12.5,7.5,1,['ハイポーションは、ここの道具屋でしか買えないよ。']],['old','老船長',5.5,23.5,1,'hint']]},
 t2:{name:'聖都セレス',W:22,H:28,base:'.',edge:'T',
  fills:[[',',1,8,4,19],[',',17,8,4,19],['o',10,14,2,2],['E',9,27,4,1]],
  pts:[['b',8,12],['b',13,12],['b',8,17],['b',13,17],['b',5,9],['b',16,9],['l',9,9],['l',12,9],['T',2,15],['T',19,15],['p',2,20],['p',19,20],['T',3,26],['T',18,26],['w',6,20],['n',9,13],['n',12,13],['q',8,7],['q',13,7],['m',5,14],['m',16,14],['q',2,6],['q',4,6],['q',17,6],['q',19,6]],
  blds:[{x:6,y:1,w:10,h:6,wall:'stone',roof:'blue',hgt:2.5,doors:[10,11],kind:'church'},{x:9,y:0,w:4,h:2,wall:'stone',roof:'blue',hgt:3.8,rt:'pyr'},
   {x:1,y:2,w:4,h:4,wall:'plaster',roof:'blue',doors:[3],kind:'inn'},{x:17,y:2,w:4,h:4,wall:'plaster',roof:'blue',doors:[18],kind:'shop'},
   {x:2,y:21,w:4,h:3,wall:'plaster',roof:'blue',doors:[3],kind:'house'},{x:16,y:21,w:4,h:3,wall:'plaster',roof:'blue',doors:[17],kind:'house'}],
  props:[['statue',7,9,.9],['statue',15,9,.9]],
  spawn:{world:[10.5,26.4,'up'],inn:[3.5,6.6,'down'],shop:[18.5,6.6,'down'],church:[10.5,7.6,'down']},
  npcs:[['priest','神官',10.5,8.2,0,['ようこそ、聖都セレスへ。','大聖堂は、すべての旅人に開かれています。']],['nun','シスター',7.5,15.5,2,['星の巫女さまのために、毎日お祈りしています。']],
   ['old','学者',14.5,19.5,2,['西の砂漠には、かつて栄えた王国の墓所が眠っている。','北東の神殿……天から堕ちた者たちの回廊じゃ。']],['youth','巡礼者',5.5,12.5,2,['南の海の孤島から、底知れない闇があふれています……']],
   ['child','少年',16.5,17.5,3,['大聖堂の鐘、すっごく大きいんだよ！']],['guard','聖騎士',12.5,23.5,2,'hint']]}};
 return defs[key]}
function genTown(key){const d=townDef(key),w=d.W,h=d.H,C=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++)C.push(x===0||x===w-1||y===0||y===h-1?d.edge:d.base);
 const I=(x,y)=>y*w+x;for(const[c,x,y,ww,hh]of d.fills)for(let j=0;j<hh;j++)for(let i=0;i<ww;i++)if(x+i>=0&&y+j>=0&&x+i<w&&y+j<h)C[I(x+i,y+j)]=c;
 for(const[c,x,y]of d.pts)C[I(x,y)]=c;
 const bld=new Int16Array(w*h).fill(-1),door=new Int16Array(w*h).fill(-1);d.blds.forEach((b,bi)=>{for(let j=0;j<b.h;j++)for(let i=0;i<b.w;i++)bld[I(b.x+i,b.y+j)]=bi;(b.doors||[]).forEach(dx=>door[I(dx,b.y+b.h-1)]=bi)});
 const BLK={'#':[.8,4,4],'b':[.26,4,7],'o':[.32,4,9],'W':[2.4,4,4],'P':[2.4,4,4]};
 const g=new Uint8Array(w*h),hv=new Float32Array(w*h);for(let i=0;i<w*h;i++){const c=C[i];g[i]=bld[i]>=0||'#boWPT~xlwfpXnqmku'.includes(c)?1:0;hv[i]=bld[i]>=0?0:(BLK[c]?BLK[c][0]:0)}
 return{key,d,w,h,C,bld,door,g,hv,BLK,T:new Uint8Array(w*h),chests:[],gate:-1,key2:-1,spring:-1,S:-1,G:-1}}
function pushTri(a,A,Bq,C,n,t,ao){const[u0,u1,v0,v1]=tuv(t);ao=ao||1;const V=(p,u,v)=>a.push(p[0],p[1],p[2],n[0],n[1],n[2],u,v,ao);V(A,u0,v1);V(Bq,u1,v1);V(C,(u0+u1)/2,v0)}
function buildTownMesh(){freeMesh();D.m.chim=[];const m=D.m,w=m.w,h=m.h,fl=[],wl=[],d=m.d;const H_=(x,y)=>x<0||y<0||x>=w||y>=h?9:m.bld[y*w+x]>=0?9:m.hv[y*w+x];
 const FT={'.':6,',':7,':':8,'u':7,'k':7,'~':9,'c':11,'g':12,'=':13,'E':d.indoor?11:6,'T':7,'p':7,'f':7,'X':12};
 const cAO=(x,y)=>{let c=0;for(const[i,j]of[[-1,-1],[0,-1],[-1,0],[0,0]])if(H_(x+i,y+j)>.6)c++;return 1-c*.12};
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(m.bld[i]>=0)continue;const c=m.C[i],bk=m.BLK[c];
  if(!bk&&c==='.'&&!d.indoor){for(let q=0;q<4;q++){const nx=x+DXY[q][0],ny=y+DXY[q][1];if(nx<0||ny<0||nx>=w||ny>=h)continue;const nc=m.C[ny*w+nx];if(nc!==','&&nc!==':'&&nc!=='T'&&nc!=='p')continue;const e=.1;let a,b2,c2,dd;if(q===0){a=[x+1-e,y+1];b2=[x+1,y+1];c2=[x+1,y];dd=[x+1-e,y]}else if(q===2){a=[x,y+1];b2=[x+e,y+1];c2=[x+e,y];dd=[x,y]}else if(q===1){a=[x,y+1];b2=[x+1,y+1];c2=[x+1,y+1-e];dd=[x,y+1-e]}else{a=[x,y+e];b2=[x+1,y+e];c2=[x+1,y];dd=[x,y]}pushQ(wl,[a[0],.035,a[1]],[b2[0],.035,b2[1]],[c2[0],.035,c2[1]],[dd[0],.035,dd[1]],[0,1,0],4,[1.15,1.15,1.15,1.15])}}
  if(!bk){pushQ(fl,[x,0,y+1],[x+1,0,y+1],[x+1,0,y],[x,0,y],[0,1,0],FT[c]??(d.indoor?12:6),[cAO(x,y+1),cAO(x+1,y+1),cAO(x+1,y),cAO(x,y)]);continue}
  if(c==='o'){const wy=.2,ry=.36,e=.16;pushQ(wl,[x,wy,y+1],[x+1,wy,y+1],[x+1,wy,y],[x,wy,y],[0,1,0],9,[.95,.95,.95,.95]);
   for(let q=0;q<4;q++){const nx=x+DXY[q][0],ny=y+DXY[q][1];if(m.C[ny*w+nx]==='o')continue;let o0,o1,i0,i1,n;
    if(q===0){o0=[x+1,y+1];o1=[x+1,y];i0=[x+1-e,y+1];i1=[x+1-e,y];n=[1,0,0]}else if(q===2){o0=[x,y];o1=[x,y+1];i0=[x+e,y];i1=[x+e,y+1];n=[-1,0,0]}else if(q===1){o0=[x,y+1];o1=[x+1,y+1];i0=[x,y+1-e];i1=[x+1,y+1-e];n=[0,0,1]}else{o0=[x+1,y];o1=[x,y];i0=[x+1,y+e];i1=[x,y+e];n=[0,0,-1]}
    pushQ(wl,[o0[0],0,o0[1]],[o1[0],0,o1[1]],[o1[0],ry,o1[1]],[o0[0],ry,o0[1]],n,4,[.6,.6,1,1]);pushQ(wl,[o0[0],ry,o0[1]],[o1[0],ry,o1[1]],[i1[0],ry,i1[1]],[i0[0],ry,i0[1]],[0,1,0],4,[1.1,1.1,1.1,1.1]);pushQ(wl,[i1[0],wy,i1[1]],[i0[0],wy,i0[1]],[i0[0],ry,i0[1]],[i1[0],ry,i1[1]],[-n[0],0,-n[2]],4,[.5,.5,.8,.8])}
   continue}
  const[hh,side,top]=bk,ta=c==='W'?.45:1;pushQ(wl,[x,hh,y+1],[x+1,hh,y+1],[x+1,hh,y],[x,hh,y],[0,1,0],top,[ta,ta,ta,ta]);
  for(let q=0;q<4;q++){const nx=x+DXY[q][0],ny=y+DXY[q][1],nh=H_(nx,ny);if(nh>=hh)continue;let Lp,R,n;if(q===0){Lp=[x+1,y+1];R=[x+1,y];n=[1,0,0]}else if(q===2){Lp=[x,y];R=[x,y+1];n=[-1,0,0]}else if(q===1){Lp=[x,y+1];R=[x+1,y+1];n=[0,0,1]}else{Lp=[x+1,y];R=[x,y];n=[0,0,-1]}
   pushQ(wl,[Lp[0],nh,Lp[1]],[R[0],nh,R[1]],[R[0],hh,R[1]],[Lp[0],hh,Lp[1]],n,side,[.6,.6,1,1])}}
 const WT={plaster:[0,1],brick:[15,15],castle:[4,10],stone:[4,10]};
 for(const b of d.blds){const x0=b.x,y0=b.y,x1=b.x+b.w,y1=b.y+b.h,H=b.hgt||1.35,[tp,tw]=WT[b.wall]||WT.plaster,doors=b.doors||[],AO=[.62,.62,1,1];
  for(let i=0;i<b.w;i++){const x=x0+i,t=doors.includes(x)?(b.wall==='castle'||b.wall==='stone'?14:3):((i+(b.w%2?0:1))%2?tw:tp);pushQ(wl,[x,0,y1],[x+1,0,y1],[x+1,H,y1],[x,H,y1],[0,0,1],t,AO);pushQ(wl,[x+1,0,y0],[x,0,y0],[x,H,y0],[x+1,H,y0],[0,0,-1],tp,AO)}
  for(let j=0;j<b.h;j++){const y=y0+j;pushQ(wl,[x1,0,y+1],[x1,0,y],[x1,H,y],[x1,H,y+1],[1,0,0],j%2?tw:tp,AO);pushQ(wl,[x0,0,y],[x0,0,y+1],[x0,H,y+1],[x0,H,y],[-1,0,0],j%2?tw:tp,AO)}
  const rt=b.rt||'gable',RF=b.roof==='blue'?5:2,o=.2;
  if(rt==='flat'){for(let j=0;j<b.h;j++)for(let i=0;i<b.w;i++)pushQ(wl,[x0+i,H,y0+j+1],[x0+i+1,H,y0+j+1],[x0+i+1,H,y0+j],[x0+i,H,y0+j],[0,1,0],4,[.8,.8,.8,.8]);
   for(let i=0;i<b.w;i+=2){for(const[yy,nz]of[[y1,1],[y0,-1]]){const x=x0+i;pushQ(wl,[x,H,yy],[x+1,H,yy],[x+1,H+.3,yy],[x,H+.3,yy],[0,0,nz],4,[.8,.8,1,1]);pushQ(wl,[x+1,H,yy],[x,H,yy],[x,H+.3,yy],[x+1,H+.3,yy],[0,0,-nz],4,[.8,.8,1,1])}}}
  else if(rt==='pyr'){const cx=(x0+x1)/2,cz=(y0+y1)/2,rh=Math.max(b.w,b.h)*.85,ap=[cx,H+rh,cz],E=[[x0-o,y1+o],[x1+o,y1+o],[x1+o,y0-o],[x0-o,y0-o]];
   for(let k=0;k<4;k++){const a=E[k],c=E[(k+1)%4];const nn=[[0,.6,.8],[.8,.6,0],[0,.6,-.8],[-.8,.6,0]][k];pushTri(wl,[a[0],H-.04,a[1]],[c[0],H-.04,c[1]],ap,nn,RF,1)}}
  else{const zc=(y0+y1)/2,rh=Math.min(b.h*.42,1.15);const sl=Math.hypot(rh,b.h/2),ny=(b.h/2)/sl,nz=rh/sl;
   for(let i=0;i<b.w;i++){const xa=x0+i-(i===0?o:0),xb=x0+i+1+(i===b.w-1?o:0);
    pushQ(wl,[xa,H-.06,y1+o],[xb,H-.06,y1+o],[xb,H+rh,zc],[xa,H+rh,zc],[0,ny,nz],RF,[.85,.85,1.05,1.05]);
    pushQ(wl,[xb,H-.06,y0-o],[xa,H-.06,y0-o],[xa,H+rh,zc],[xb,H+rh,zc],[0,ny,-nz],RF,[.7,.7,.9,.9])}
   pushQ(wl,[x0-o,H-.2,y1+o],[x1+o,H-.2,y1+o],[x1+o,H-.06,y1+o],[x0-o,H-.06,y1+o],[0,0,1],13,[.55,.55,.7,.7]);
   pushQ(wl,[x0-o,H+rh+.05,zc+.1],[x1+o,H+rh+.05,zc+.1],[x1+o,H+rh+.05,zc-.1],[x0-o,H+rh+.05,zc-.1],[0,1,0],RF,[.6,.6,.6,.6]);pushQ(wl,[x0-o,H+rh-.04,zc+.12],[x1+o,H+rh-.04,zc+.12],[x1+o,H+rh+.05,zc+.1],[x0-o,H+rh+.05,zc+.1],[0,.3,1],RF,[.5,.5,.6,.6]);
   if(b.kind==='house'||b.kind==='inn'){const cx0=x0+.55,cx1=cx0+.42,cz0=zc-.75,cz1=zc-.35,ct=H+rh+.5,cb=H+.2;for(const[A,Bq,n]of[[[cx0,cz1],[cx1,cz1],[0,0,1]],[[cx1,cz1],[cx1,cz0],[1,0,0]],[[cx0,cz0],[cx0,cz1],[-1,0,0]],[[cx1,cz0],[cx0,cz0],[0,0,-1]]])pushQ(wl,[A[0],cb,A[1]],[Bq[0],cb,Bq[1]],[Bq[0],ct,Bq[1]],[A[0],ct,A[1]],n,4,[.7,.7,.95,.95]);pushQ(wl,[cx0-.04,ct,cz1+.04],[cx1+.04,ct,cz1+.04],[cx1+.04,ct,cz0-.04],[cx0-.04,ct,cz0-.04],[0,1,0],4,[.4,.4,.4,.4]);(m.chim=m.chim||[]).push([(cx0+cx1)/2,ct,(cz0+cz1)/2,Math.random()])}
   pushTri(wl,[x1,H,y1],[x1,H,y0],[x1,H+rh,zc],[1,0,0],tp,.9);pushTri(wl,[x0,H,y0],[x0,H,y1],[x0,H+rh,zc],[-1,0,0],tp,.9)}}
 const mk=a=>{const bf=GL.createBuffer();GL.bindBuffer(GL.ARRAY_BUFFER,bf);GL.bufferData(GL.ARRAY_BUFFER,new Float32Array(a),GL.STATIC_DRAW);return{b:bf,n:a.length/9}};GLB.floor=mk(fl);GLB.wall=mk(wl);GLB.gate=null}
function tProps(){const m=D.m,d=m.d,r=srng(m.w*31+m.h);D.props=[];
 for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){const c=m.C[y*m.w+x];const P_=(k,s,ox,oz,yy)=>D.props.push({x:x+.5+(ox||0),z:y+.5+(oz||0),k,s,y:yy||0});
  if(c==='T')P_('tree',.95,0,.1);else if(c==='p')P_('pine',.9,0,.1);else if(c==='x')P_(r()<.5?'barrel':'crate',.62);else if(c==='l')P_('lamppost',.62);else if(c==='w')P_('well',.95);else if(c==='f')P_('fence',.9);else if(c==='n')P_('bench',.75);else if(c==='q')P_('pot',.55);else if(c==='m')P_('stall',1.1);else if(c==='k')P_('cart',.9);else if(c==='u')P_('laundry',1);
  else if(c==='b'){P_('flowers',.5,-.2,0,.2);P_('flowers',.5,.2,0,.2);P_('bush',.42,0,.1,.2)}else if(c==='o'&&!(m.C[y*m.w+x-1]==='o')&&!(m.C[(y-1)*m.w+x]==='o'))D.props.push({x:x+1,z:y+1,k:'spray',s:1.25,y:.15})
  else if(c===','&&!d.indoor&&r()<.08)P_(r()<.5?'flowers':'bush',.34,r()*.4-.2,r()*.4-.2)}
 for(const[k,x,z,s]of d.props||[])D.props.push({x,z,k,s,y:0});
 for(const b of d.blds)if(b.kind==='inn'||b.kind==='shop')D.props.push({x:b.doors[0]+.5,z:b.y+b.h+.32,k:'sign_'+b.kind,s:.5,y:.82})}
function npcTex(pal,dir,fr){const k='npc_'+pal.id+dir+fr;if(GLT[k])return GLT[k];const s=chibi(pal,dir,fr),c=document.createElement('canvas');c.width=s.width*6;c.height=s.height*6;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(s,0,0,c.width,c.height);return GLT[k]=glTexFromImg(c)}
function kingLines(){if(CHAPTERS.every((c,i)=>chapClear(i)))return['おお、勇者たちよ！ よくぞ七十二柱をすべて封じてくれた。','この国の民を代表して、礼を言うぞ。'];const ci=curChapter();
 return[ci===0&&!P.cleared['1-1']?'番人の子アレンよ。西の「森の入口」で、指輪のかけらの光を見た者がおる。調べてくれ。':chapClear(3)?'……カイルのこと、まことにすまなかった。':'旅の首尾はどうじゃ。',nextGoal(),'疲れたときは、無理をせず宿屋で休むのじゃぞ。']}
function valdLines(){if(chapClear(3))return['（大臣の席は空いたままだ……）'];return['魔神の封印……それができるのは、そなたたちだけだ。','巫女どのは、どちらに？ ……いえ、少し気になっただけです。','星の番人の剣、ですか。……ほう。']}
function hintLines(){const ci=curDun();if(CHAPTERS.every((c,i)=>chapClear(i)))return['魔神がいなくなって、世界に笑顔が戻ってきたね。'];const o=WLOC.find(l=>l.ci===ci),me=WLOC.find(l=>l.k==='town'&&l.id===TW.id);return[`${dirName(o.x-me.x,o.y-me.y)}の「${DUN[ci].name}」から、魔神の気配がするらしい。`,`推奨レベルは ${dLvD(ci)} くらいだと聞いたよ。`]}
async function enterTown(id,spawn,mapKey){loadTownBG(mapKey||('t'+id));if(!glInit()){await modal('<h3>3D表示に対応していません</h3>');return}
 await fade(true);B=null;closeSheet();$('#shop').style.display='none';$('#fmenu').style.display='none';TW={id};const key=mapKey||('t'+id);const m=genTown(key),d=m.d;
 const sp=d.spawn[spawn]||d.spawn.world||d.spawn.town;
 D={town:true,tkey:key,ci:-1,m,x:Math.floor(sp[0]),y:Math.floor(sp[1]),ax:sp[0],ay:sp[1],cx:sp[0],cz:sp[1],face:1,dir:sp[2]||'up',trail:[],props:[],yaw:0,pitch:0,gy:0,gp:0,roll:0,spd:0,walkT:0,walk:0,busy:false,big:false,jx:0,jy:0,turn:0,hurt:0,lamps:[],bcool:0};
 D.npcs=d.npcs.map(([pk,name,x,z,r,lines])=>({pal:NPAL[pk],name,x,z,hx:x,hz:z,r,lines,dir:'down',fr:0,tx:null,wait:Math.random()*3}));
 P.scene='town';P.town=id;if(!mapKey||mapKey[0]==='t'){P.lastTown=id}const o=WLOC.find(l=>l.k==='town'&&l.id===id);P.wpos=[o.x,o.y];save();
 D_ATLAS=atlasFor('town');tProps();buildTownMesh();scene='dungeon';setMode('field');updCtl();resize();dResize();updDpan();playBGM('home',true);await fade(false);toast(d.name);await runTownEvents(key)}
function updCtl(){const g=$('#dGyro'),t=!!(D&&D.town),v=!!(D&&D.world&&D.veh);g.innerHTML=t?'街メニュー':v?(D.veh==='air'?'着陸':'下船'):'';g.style.display=t||v?'':'none';$('#dctl').style.gridTemplateColumns=t||v?'':'1fr 1fr'}
async function townMenu(){if(!D||D.busy)return;D.busy=true;dStop();SFX.ok();const t=TOWNS[TW.id];const out=D.tkey[0]==='c'?'お城を出る':'町を出る';
 const c=await modal(`<h3>${D.m.d.name}</h3>`,[{l:`宿屋（${t.inn}G）`},{l:'道具屋'},{l:'武器・防具屋'},{l:'セーブ'},{l:out,c:'r'},{l:'とじる',c:'g'}]);
 if(c===0){await doInn();D.busy=false}else if(c===1){showShop()}else if(c===2){showEqShop()}else if(c===3){save();SFX.coin();toast('冒険の記録をセーブしました');D.busy=false}else if(c===4){await leaveTownMap()}else D.busy=false}
async function leaveTownMap(){if(D.tkey[0]==='c'){await enterTown(TW.id,'castle');return}const o=WLOC.find(l=>l.k==='town'&&l.id===TW.id);TW=null;await enterWorld([o.x,o.y])}
async function tArrive(){const m=D.m,c=m.C[D.y*m.w+D.x];if(c==='E'){D.busy=true;dStop();await leaveTownMap()}}
function npcHit(x,z){if(!D||!D.town)return null;for(const n of D.npcs)if(Math.abs(n.x-x)<.46&&Math.abs(n.z-z)<.4)return n;return null}
async function tBump(x,z,b){if(time<(D.bcool||0)||D.busy)return;const m=D.m;
 if(b===4){const n=npcHit(x,z);if(!n)return;D.busy=true;dStop();const dx=D.ax-n.x,dz=D.ay-n.z;n.dir=Math.abs(dx)>Math.abs(dz)?(dx>0?'right':'left'):(dz>0?'down':'up');n.tx=null;n.talk=1;SFX.cur();
  const ls=n.lines==='king'?kingLines():n.lines==='vald'?valdLines():n.lines==='hint'?hintLines():n.lines;await talk(ls.map(t=>[n.name,t]));n.talk=0;n.wait=2;D.bcool=time+.7;D.busy=false;return}
 if(b===5){for(const[ox,oz]of[[-PR,-PR],[PR,-PR],[-PR,PR],[PR,PR],[0,-PR-.05]]){const cx=Math.floor(x+ox),cy=Math.floor(z+oz);if(cx<0||cy<0||cx>=m.w||cy>=m.h)continue;const bi=m.door[cy*m.w+cx];if(bi>=0){D.busy=true;dStop();await useDoor(m.d.blds[bi]);D.bcool=time+.8;return}}}}
async function useDoor(b){SFX.ok();
 if(b.kind==='inn'){await doInn();D.busy=false;return}
 if(b.kind==='shop'){showShop();return}
 if(b.kind==='castle'){await enterTown(TW.id,'town','c0');return}
 if(b.kind==='church'){await talk([['神官','大聖堂へようこそ。星の導きが、あなたがたと共にありますように。'],['神官','旅の記録を残していかれますか？']]);const c=await modal('<h3>大聖堂</h3><p style="text-align:center">冒険の記録をセーブしますか？</p>',[{l:'セーブする',c:'g'},{l:'やめる'}]);if(c===0){save();SFX.coin();toast('冒険の記録をセーブしました')}D.busy=false;return}
 await talk([['N',pick(['カギがかかっている。','誰かの家だ。勝手に入るのはやめておこう。','中から楽しそうな笑い声が聞こえる。','「ただいま留守にしております」と書いてある。'])]]);D.busy=false}
function updateNpcs(dt){if(!D||!D.town)return;const m=D.m;for(const n of D.npcs){if(n.talk)continue;if(!n.r){continue}
 if(n.wait>0){n.wait-=dt;continue}
 if(!n.tx){for(let k=0;k<8;k++){const tx=n.hx+(Math.random()*2-1)*n.r,tz=n.hz+(Math.random()*2-1)*n.r;const cx=Math.floor(tx),cy=Math.floor(tz);if(cx>0&&cy>0&&cx<m.w-1&&cy<m.h-1&&!m.g[cy*m.w+cx]&&m.C[cy*m.w+cx]!=='E'){n.tx=[tx,tz];break}}if(!n.tx){n.wait=1;continue}}
 const dx=n.tx[0]-n.x,dz=n.tx[1]-n.z,l=Math.hypot(dx,dz);if(l<.05){n.tx=null;n.wait=1+Math.random()*3;n.dir='down';continue}
 const sp=.75*dt,nx=n.x+dx/l*sp,nz=n.z+dz/l*sp;const blk=(x,z)=>{for(const[ox,oz]of[[-.2,-.2],[.2,-.2],[-.2,.2],[.2,.2]]){const cx=Math.floor(x+ox),cy=Math.floor(z+oz);if(cx<0||cy<0||cx>=m.w||cy>=m.h||m.g[cy*m.w+cx])return true}return Math.abs(x-D.ax)<.6&&Math.abs(z-D.ay)<.55};
 if(blk(nx,nz)){n.tx=null;n.wait=.6;continue}n.x=nx;n.z=nz;n.dir=Math.abs(dx)>Math.abs(dz)?(dx>0?'right':'left'):(dz>0?'down':'up');n.ft=(n.ft||0)+dt;n.fr=Math.floor(n.ft*4)%2}}
function glRenderTown(){const g=GL,m=D.m,P_=GLP,ind=m.d.indoor;
 g.viewport(0,0,dcv.width,dcv.height);const fc=ind?[.08,.06,.06]:[.64,.79,.92];g.clearColor(fc[0],fc[1],fc[2],1);g.clear(g.COLOR_BUFFER_BIT|g.DEPTH_BUFFER_BIT);
 D.cx+=(D.ax-D.cx)*.12;D.cz+=(D.ay-D.cz)*.12;const orb=D.gy*.6,tilt=D.gp*.5,dist=6.3,hgt=7.7+tilt*2.4;
 const tgt=[D.cx,.4,D.cz-.6],eye=[D.cx+Math.sin(orb)*dist,hgt,D.cz-.6+Math.cos(orb)*dist],asp=dcv.width/dcv.height;
 const V=lookAt(eye,tgt,[0,1,0]),VP=m4mul(persp(asp<.75?.9:.76,asp,.1,80),V.m);
 g.useProgram(P_.p);g.uniformMatrix4fv(P_.uVP,false,VP);if(ind)g.uniform3f(P_.uAmb,.7,.62,.55);else g.uniform3f(P_.uAmb,.6,.62,.6);g.uniform3fv(P_.uFog,fc);g.uniform3f(P_.uLc,0,0,0);g.uniform3f(P_.uPl,D.ax,1.4,D.ay);g.uniform2f(P_.uCut,D.ax,D.ay);g.uniform1f(P_.uTop,1);g.uniform1f(P_.uFl,1);g.uniform1i(P_.uLn,0);g.uniform2f(P_.uFogR,ind?9:11,ind?16:19);g.uniform1f(P_.uSun,ind?.3:.62);g.uniform1f(P_.uCutOn,0);g.uniform1f(P_.uDith,0);g.uniform1f(P_.uTime,time);
 g.activeTexture(g.TEXTURE0);g.uniform1i(P_.uT,0);g.bindTexture(g.TEXTURE_2D,D_ATLAS);g.disable(g.BLEND);g.depthMask(true);
 g.uniform1f(P_.uMode,0);glDraw(GLB.floor.b,GLB.floor.n);g.uniform1f(P_.uMode,1);glDraw(GLB.wall.b,GLB.wall.n);
 const R=V.x,U=V.y;
 const bb=(a,cx,cz,w,h,yoff,flip)=>{const P=(sx,sy)=>[cx+R[0]*sx*w+U[0]*sy*h,(yoff||0)+R[1]*sx*w+U[1]*sy*h,cz+R[2]*sx*w+U[2]*sy*h];const u0=flip?1:0,u1=flip?0:1;const A=P(-.5,0),Bq=P(.5,0),C=P(.5,1),Dq=P(-.5,1);const pv=(p,u,v)=>a.push(p[0],p[1],p[2],0,0,1,u,v,1);pv(A,u0,1);pv(Bq,u1,1);pv(C,u1,0);pv(A,u0,1);pv(C,u1,0);pv(Dq,u0,0)};
 const flat=(a,cx,cz,sx,sz)=>{const pv=(x,z,u,v)=>a.push(x,.012,z,0,1,0,u,v,1);pv(cx-sx,cz+sz,0,1);pv(cx+sx,cz+sz,1,1);pv(cx+sx,cz-sz,1,0);pv(cx-sx,cz+sz,0,1);pv(cx+sx,cz-sz,1,0);pv(cx-sx,cz-sz,0,0)};
 const drawDyn=(arr,tex,mode,tint)=>{if(!arr.length)return;const f=new Float32Array(arr);g.bindBuffer(g.ARRAY_BUFFER,GLB.dyn);g.bufferData(g.ARRAY_BUFFER,f,g.DYNAMIC_DRAW);g.bindTexture(g.TEXTURE_2D,tex);g.uniform1f(P_.uMode,mode);if(tint)g.uniform4fv(P_.uTint,tint);glDraw(GLB.dyn,f.length/9)};
 const view=(x,z)=>Math.abs(x-D.cx)<12&&z-D.cz<8&&D.cz-z<16;
 const shad=[];flat(shad,D.ax,D.ay,.3,.17);for(const n of D.npcs)if(view(n.x,n.z))flat(shad,n.x,n.z,.26,.14);g.enable(g.BLEND);g.blendFunc(g.SRC_ALPHA,g.ONE_MINUS_SRC_ALPHA);g.depthMask(false);drawDyn(shad,canvasTex('shadow'),4);g.depthMask(true);g.disable(g.BLEND);
 const groups={};for(const pr of D.props){if(!view(pr.x,pr.z))continue;const tall=pr.k==='tree'||pr.k==='pine'||pr.k==='lamppost'||pr.k==='banner';(groups[pr.k]=groups[pr.k]||[]);bb(groups[pr.k],pr.x,pr.z,pr.s,tall?pr.s*1.75:pr.s,pr.y)}
 for(const k in groups)drawDyn(groups[k],canvasTex(k),2);
 for(const n of D.npcs){if(!view(n.x,n.z))continue;const a=[];bb(a,n.x,n.z,.78,.86,0);drawDyn(a,npcTex(n.pal,n.dir,n.fr),2)}
 const lead=uById(P.party[0]);if(lead){const tx=heroTex(lead.id);if(tx){const im=art(lead.id),hh=1.0,ww=hh*im.naturalWidth/im.naturalHeight;const a=[];bb(a,D.ax,D.ay,ww,hh,0,D.face<0);drawDyn(a,tx,2);silhouette(a,tx,drawDyn)}}
 if(!ind){g.enable(g.BLEND);g.blendFunc(g.SRC_ALPHA,g.ONE_MINUS_SRC_ALPHA);g.depthMask(false);const sm=[];for(const c of m.chim||[]){if(!view(c[0],c[2]))continue;for(let k=0;k<4;k++){const ph=(time*.35+k/4+c[3])%1;const s=.25+ph*.55;bb(sm,c[0]+Math.sin(ph*5+k)*.15+ph*.3,c[2]-ph*.2,s,s,c[1]+ph*1.6)}}if(sm.length)drawDyn(sm,canvasTex('puff'),6,[1,1,1,.55]);g.depthMask(true);g.disable(g.BLEND)}
 if(ind){g.enable(g.BLEND);g.blendFunc(g.ONE,g.ONE);g.depthMask(false);const gl_=canvasTex('glow');for(const pr of D.props)if(pr.k==='candela'){const a=[];bb(a,pr.x,pr.z,1.2,1.2,.05);drawDyn(a,gl_,3,[1,.7,.35,.5+.08*Math.sin(time*9)])}g.depthMask(true);g.disable(g.BLEND)}}
function drawOverlayTown(){const W=OW,H=OH,m=D.m;octx.clearRect(0,0,W,H);
 const tx=(t,x,y,c,s)=>{octx.font=`700 ${s}px 'M PLUS 1p',sans-serif`;octx.textAlign='center';octx.fillStyle='rgba(0,0,0,.8)';octx.fillText(t,x+1,y+1);octx.fillStyle=c;octx.fillText(t,x,y)};
 if(!D.big){const vg=octx.createRadialGradient(W/2,H*.5,Math.min(W,H)*.45,W/2,H*.5,Math.max(W,H)*.78);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(10,6,0,.38)');octx.fillStyle=vg;octx.fillRect(0,0,W,H);return}octx.fillStyle='rgba(0,0,8,.88)';octx.fillRect(0,0,W,H);const cs=Math.floor(Math.min((W-20)/m.w,(H-70)/m.h)),ox=Math.floor((W-cs*m.w)/2),oy=Math.floor((H-cs*m.h)/2);
 const col={'.':'#9a968a',',':'#5a9a3e',':':'#b89a6a','~':'#2a5a9a','c':'#a83030','g':'#8a8070','=':'#9a6a3a','E':'#ffe060','T':'#2a5a24','p':'#2a5a24','b':'#4a8a3a','o':'#4a8ac8','W':'#3a3a44','P':'#5a5a64','#':'#6a6a70'};
 for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){const i=y*m.w+x;octx.fillStyle=m.bld[i]>=0?(m.door[i]>=0?'#ffd040':'#c86a4a'):(col[m.C[i]]||'#8a8a80');octx.fillRect(ox+x*cs,oy+y*cs,cs,cs)}
 for(const b of m.d.blds){const lb={inn:'宿屋',shop:'道具屋',castle:'城',church:'大聖堂'}[b.kind];if(lb)tx(lb,ox+(b.x+b.w/2)*cs,oy+(b.y+b.h/2)*cs+4,'#fff',11)}
 for(const n of D.npcs){octx.fillStyle='#7ae0ff';octx.fillRect(ox+n.x*cs-2,oy+n.z*cs-2,4,4)}
 octx.fillStyle=Math.sin(time*8)>0?'#ff3a3a':'#ffff60';octx.beginPath();octx.arc(ox+D.ax*cs,oy+D.ay*cs,Math.max(3,cs*.4),0,7);octx.fill();
 tx(m.d.name,W/2,oy-8,'#ffe8a8',13);tx('タップで閉じる',W/2,H-10,'#aab',11)}

function silhouette(a,tx,drawDyn){const g=GL;g.enable(g.BLEND);g.blendFunc(g.SRC_ALPHA,g.ONE_MINUS_SRC_ALPHA);g.depthFunc(g.GREATER);g.depthMask(false);drawDyn(a,tx,5,[.35,.6,1,.45]);g.depthFunc(g.LESS);g.depthMask(true);g.disable(g.BLEND)}
/* ================= PRE-RENDERED 2D TOWNS ================= */
const TBG={};const tcv=$('#tcv'),tctx=tcv.getContext('2d');
function loadTownBG(key){if(TBG[key])return TBG[key];const o=TBG[key]={ready:false};let n=0;const done=()=>{if(++n===3)try{buildTownSprites(o)}catch(e){console.error(e)}};
 fetch('img/town/'+key+'.json').then(r=>r.json()).then(j=>{o.meta=j;done()}).catch(()=>{});
 o.bg=new Image();o.bg.onload=done;o.bg.src='img/town/'+key+'.webp';o.id=new Image();o.id.onload=done;o.id.src='img/town/'+key+'_id.png';return o}
function buildTownSprites(o){const m=o.meta,W=m.resx,H=m.resy;const c1=document.createElement('canvas');c1.width=W;c1.height=H;const g1=c1.getContext('2d',{willReadFrequently:true});g1.drawImage(o.id,0,0);const id=g1.getImageData(0,0,W,H).data;
 g1.drawImage(o.bg,0,0);const bg=g1.getImageData(0,0,W,H).data;o.fill=`rgb(${bg[(4*W+4)*4]},${bg[(4*W+4)*4+1]},${bg[(4*W+4)*4+2]})`;const bb={};
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const p=(y*W+x)*4,s=id[p]+id[p+1]*256;if(!s)continue;let b=bb[s];if(!b)b=bb[s]={x0:x,y0:y,x1:x,y1:y};else{if(x<b.x0)b.x0=x;if(x>b.x1)b.x1=x;if(y>b.y1)b.y1=y}}
 o.spr=[];for(const s in bb){const b=bb[s],w=b.x1-b.x0+3,h=b.y1-b.y0+3,x0=b.x0-1,y0=b.y0-1;const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');const im=g.createImageData(w,h),d=im.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const X=x0+x,Y=y0+y;if(X<0||Y<0||X>=W||Y>=H)continue;const p=(Y*W+X)*4;let hit=id[p]+id[p+1]*256==s;
   if(!hit){for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const XX=X+dx,YY=Y+dy;if(XX<0||YY<0||XX>=W||YY>=H)continue;const q=(YY*W+XX)*4;if(id[q]+id[q+1]*256==s){hit=2;break}}}
   if(!hit)continue;const o4=(y*w+x)*4;d[o4]=bg[p];d[o4+1]=bg[p+1];d[o4+2]=bg[p+2];d[o4+3]=hit===2?150:255}
  g.putImageData(im,0,0);o.spr.push({k:+m.spr[s],x:x0,y:y0,w,h,c})}
 o.spr.sort((a,b)=>a.k-b.k);o.ready=true}
function tpx(o,x,y){const m=o.meta;return[x*m.ppu,m.resy/2+(y*Math.cos(m.a)+m.upc)*m.ppu]}
function drawTown2D(){draw2D(TBG[D.tkey],8.2)}
function drawWorld2D(){draw2D(TBG.w,9.6)}
let GATEC=null;function gateCanvas(){if(GATEC)return GATEC;const c=document.createElement('canvas');c.width=128;c.height=128;const g=c.getContext('2d');g.fillStyle='#2a2a30';for(let x=8;x<128;x+=20)g.fillRect(x,8,7,120);for(const y of[20,64,108])g.fillRect(0,y,128,7);g.fillStyle='#8a8a96';for(let x=8;x<128;x+=20)g.fillRect(x+1,8,2,120);return GATEC=c}
function drawDungeon2D(){const m=D.m,ch=CHAPTERS[DUN[D.ci].ch],ex=[],cell=i=>[(i%m.w)+.5,((i/m.w)|0)+.5];
 const add=(i,img,hgt,smooth=true,dk=0)=>{const[x,y]=cell(i);ex.push({k:y+dk,x,img,hgt,smooth})};
 for(const c of m.chests)add(c,sprCanvas(P.dchest&&P.dchest['n'+D.ci+':'+c]?'chesto':'chest'),.62);
 if(m.key>=0&&!D.keyGot)add(m.key,sprCanvas('keychest'),.62);add(m.spring,sprCanvas('spring'),.85);
 if(D.y*m.w+D.x!==m.S)add(m.S,sprCanvas('stair'),.6,true,-.3);
 if(P.cleared[STAGE_ORDER[D.ci]])add(m.G,sprCanvas('goal'),1.1);
 if(m.gate>=0&&!D.gateOpen)add(m.gate,gateCanvas(),.95,true,.45);
 for(const b of m.bosses){const st=ch.stages[b.si];if(P.cleared[st.id])continue;const bid=bossOf(st),dc=demonCell(bid,Math.floor(time*1.6)%2);if(dc)add(b.c,dc,dc.height*.0236*(b.si===ch.stages.length-1?1.15:1),false);else{const im=art(bid);if(im)add(b.c,im,b.si===ch.stages.length-1?1.75:1.45)}}
 draw2D(TBG['d'+D.ci],7.4,ex,DUN[D.ci].theme!=='forest')}
function draw2D(o,cells,extra,dark){const m=o.meta,ppu=m.ppu;const r=tcv.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);const cw=Math.round(r.width*dpr),ch=Math.round(r.height*dpr);if(tcv.width!==cw||tcv.height!==ch){tcv.width=cw;tcv.height=ch}
 const g=tctx,s=cw/(cells*ppu);const[px,py]=tpx(o,D.ax,D.ay);if(D.tcx==null){D.tcx=px;D.tcy=py}D.tcx+=(px-D.tcx)*.15;D.tcy+=(py-D.tcy)*.15;
 const vw=cw/s,vh=ch/s;let cx=Math.max(vw/2,Math.min(m.resx-vw/2,D.tcx)),cy=Math.max(vh/2,Math.min(m.resy-vh/2,D.tcy-ppu*.4));if(vw>m.resx)cx=m.resx/2;if(vh>m.resy)cy=m.resy/2;
 g.setTransform(1,0,0,1,0,0);g.fillStyle=o.fill||'#000';g.fillRect(0,0,cw,ch);g.setTransform(s,0,0,s,cw/2-cx*s,ch/2-cy*s);g.imageSmoothingEnabled=true;
 const L=cx-vw/2,T=cy-vh/2;{const sx=Math.max(0,L),sy=Math.max(0,T),sw=Math.min(m.resx,L+vw)-sx,sh=Math.min(m.resy,T+vh)-sy;if(sw>0&&sh>0)g.drawImage(o.bg,sx,sy,sw,sh,sx,sy,sw,sh)}
 const chars=[];const lead=uById(P.party[0]);if(lead&&!(D.world&&D.veh)){const im=art(lead.id);const wk=walkImg(lead.id);const wd=D.wdir||0,RC={gard:3};{const dn=wd==='R'?'right':wd==='L'?'left':wd===2?'up':'down';const fr=D.spd>.05?Math.floor(time*11)%4:0;chars.push({k:D.ay,x:D.ax,img:sprCell(lead.id,dn,fr)||dot3(HPAL[lead.id]||HPAL.allen,dn,fr),hgt:sprCell(lead.id,dn,fr)?1.32:1.36,smooth:false,pl:1})}}vehChars(chars);for(const e of extra||[])chars.push(e);
 for(const n of D.npcs||[])chars.push({k:n.z,x:n.x,img:sprCell('n_'+npcSpr(npcType(n)),n.dir,n.tx!=null?Math.floor((n.ft||0)*7)%4:0)||dot3(NPC2[npcBase(npcType(n))],n.dir,n.tx!=null?Math.floor((n.ft||0)*7)%4:0),hgt:1.32,flip:false,smooth:false});
 chars.sort((a,b)=>a.k-b.k);
 if(D.world){const tci=curDun(),done=CHAPTERS.every((c,i)=>chapClear(i));g.globalCompositeOperation='lighter';for(const l of WLOC){if(l.k!=='dun')continue;const[x,y]=tpx(o,l.x+.5,l.y+.6);let col=null;if(l.ci===tci&&!done)col=`rgba(255,200,80,${.35+.2*Math.sin(time*3)})`;else if(!dOpen(l.ci))col='rgba(140,60,220,.28)';if(!col)continue;const gr=g.createRadialGradient(x,y,0,x,y,ppu*1.3);gr.addColorStop(0,col);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.beginPath();g.ellipse(x,y,ppu*1.3,ppu*.9,0,0,7);g.fill()}g.globalCompositeOperation='source-over'}
 for(const c of chars){if(c.top)continue;const[x,y]=tpx(o,c.x,c.k);g.fillStyle='rgba(0,0,0,.32)';g.beginPath();g.ellipse(x,y,ppu*.27,ppu*.1,0,0,7);g.fill()}
 const rects=[];for(const c of chars){const[x,y]=tpx(o,c.x,c.py??c.k);const iw=c.cell!=null?c.img.width/4:c.img.width,hh=c.hgt*ppu,ww=hh*iw/c.img.height;c.r=[x-ww/2,y-hh+ppu*.06-(c.bob||0)*ppu,ww,hh];if(c.pl&&typeof D!=='undefined'&&D){const mt=g.getTransform(),py=y-hh*.4;D.leadCv=[mt.a*x+mt.c*py+mt.e,mt.b*x+mt.d*py+mt.f]}rects.push(c)}
 let si=0;const sp=o.spr;const drawSpr=(lim)=>{while(si<sp.length&&sp[si].k<=lim){const q=sp[si++];if(q.x>L+vw||q.y>T+vh||q.x+q.w<L||q.y+q.h<T)continue;if(rects.some(c=>c.drawn&&c.r[0]<q.x+q.w&&c.r[0]+c.r[2]>q.x&&c.r[1]<q.y+q.h&&c.r[1]+c.r[3]>q.y))g.drawImage(q.c,q.x,q.y)}};
 for(const c of rects){drawSpr(c.k);g.imageSmoothingEnabled=c.smooth;const[x,y,w,h]=c.r;if(c.cell!=null){const cw_=c.img.width/4;if(c.mir){g.save();g.translate(x+w,y);g.scale(-1,1);g.drawImage(c.img,c.cell*cw_,0,cw_,c.img.height,0,0,w,h);g.restore()}else g.drawImage(c.img,c.cell*cw_,0,cw_,c.img.height,x,y,w,h)}else if(c.flip){g.save();g.translate(x+w,y);g.scale(-1,1);g.drawImage(c.img,0,0,w,h);g.restore()}else g.drawImage(c.img,x,y,w,h);c.drawn=true}
 g.imageSmoothingEnabled=true;drawSpr(1e9);if(D.world&&!CHAPTERS.every((c,i)=>chapClear(i))){const l=WLOC.find(q=>q.ci===curDun());if(l){const[x,y]=tpx(o,l.x+.5,l.y+.5);const by=y-ppu*(2.3+Math.sin(time*4)*.15);g.fillStyle='#ffe060';g.strokeStyle='#6a4a00';g.lineWidth=ppu*.05;g.beginPath();g.moveTo(x,by+ppu*.5);g.lineTo(x-ppu*.3,by);g.lineTo(x-ppu*.12,by);g.lineTo(x-ppu*.12,by-ppu*.4);g.lineTo(x+ppu*.12,by-ppu*.4);g.lineTo(x+ppu*.12,by);g.lineTo(x+ppu*.3,by);g.closePath();g.fill();g.stroke()}}if(dark){const[qx,qy]=tpx(o,D.ax,D.ay);g.fillStyle='rgba(0,0,6,.6)';const gr=g.createRadialGradient(qx,qy-ppu*.4,ppu*2.4,qx,qy-ppu*.4,ppu*5.8);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,6,.6)');g.fillStyle=gr;g.fillRect(L,T,vw,vh)}const pl=rects.find(c=>c.pl);if(pl){g.globalAlpha=.32;const[x,y,w,h]=pl.r;if(pl.cell!=null){const cw_=pl.img.width/4;if(pl.mir){g.save();g.translate(x+w,y);g.scale(-1,1);g.drawImage(pl.img,pl.cell*cw_,0,cw_,pl.img.height,0,0,w,h);g.restore()}else g.drawImage(pl.img,pl.cell*cw_,0,cw_,pl.img.height,x,y,w,h)}else if(pl.flip){g.save();g.translate(x+w,y);g.scale(-1,1);g.drawImage(pl.img,0,0,w,h);g.restore()}else g.drawImage(pl.img,x,y,w,h);g.globalAlpha=1}g.setTransform(1,0,0,1,0,0)}
function dungeon2DReady(){if(!D||D.world||D.town)return false;return loadTownBG('d'+D.ci).ready}
function world2DReady(){if(!D||!D.world)return false;return loadTownBG('w').ready}
function town2DReady(){if(!D||!D.town)return false;const o=loadTownBG(D.tkey);return o.ready}

const WIMG={};function walkImg(id){let im=WIMG[id];if(!im){im=WIMG[id]=new Image();im.src='img/walk/'+id+'_px.png'}return im.complete&&im.naturalWidth?im:null}

/* ===== 高精細ドットキャラ (32x40, 4方向, 4コマ歩行) ===== */
const DOTC={};
function dhx(c){c=c.replace('#','');if(c.length===3)c=c.split('').map(x=>x+x).join('');return[parseInt(c.slice(0,2),16),parseInt(c.slice(2,4),16),parseInt(c.slice(4,6),16)]}
function dmix(c,t,k){const a=dhx(c),b=dhx(t);return'#'+a.map((v,i)=>Math.round(v+(b[i]-v)*k).toString(16).padStart(2,'0')).join('')}
const LT=c=>dmix(c,'#fff8e8',.28),DK=c=>dmix(c,'#140a20',.32),DK2=c=>dmix(c,'#140a20',.55);
function dot2(p,dir,fr){
 fr=fr|0;const key=p.id+'|'+dir+'|'+fr;if(DOTC[key])return DOTC[key];
 const W=32,H=40,cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');
 const d=dir==='left'?'right':dir,side=d==='right',up=d==='up',down=d==='down';
 const P=(x,y,w,h,c)=>{if(!c||w<=0||h<=0)return;g.fillStyle=c;g.fillRect(x,y,w,h)};
 const B=(x,y,w,h,c)=>{if(!c||w<=0||h<=0)return;P(x,y,w,h,c);if(w>2)P(x,y,1,h,LT(c));if(w>1)P(x+w-1,y,1,h,DK(c));if(h>2)P(x,y+h-1,w,1,DK(c));if(w>3&&h>3)P(x+1,y,w-2,1,LT(c))};
 const RB=(x,y,w,h,c,it,ib)=>{for(let r=0;r<h;r++){const a=(it&&it[r])||0,b=(ib&&ib[h-1-r])||0,k=Math.max(a,b);P(x+k,y+r,w-2*k,1,c);if(w-2*k>2){P(x+k,y+r,1,1,LT(c));P(x+w-1-k,y+r,1,1,DK(c))}}};
 const body=p.body||'adult',kid=body==='kid',big=body==='big'||body==='plump',old=body==='old';
 const step=[0,1,0,-1][fr&3],bob=(fr&1)?1:0;
 const FY=38,legH=kid?4:old?6:7,torH=kid?7:9,tw=big?13:kid?9:old?10:10;
 const hy=FY-2-legH-torH-13+bob+(old?1:0),ty=hy+13,ly=ty+torH-bob,tx=16-Math.floor(tw/2);
 const skin=p.skin||'#f2c49a',hair=p.hair||'#5a3a22',eye=p.eye||'#3a2a4a',shoe=p.shoe||'#3e2a1e',pants=p.pants||'#3a3040';
 const top=p.top||p.cloth||'#c8c0b0',sleeve=p.coat||top,dress=p.dress,longR=!!(dress||p.robe);
 const robeC=p.robe?(p.coat||top):dress;
 /* ---- cape (behind) ---- */
 if(p.cape&&!up){if(side)B(tx-2,ty+1,5,torH+legH-2,DK(p.cape));else B(tx-2,ty,tw+4,torH+legH-1,DK(p.cape))}
 /* ---- staff/cane behind when side ---- */
 const item=p.item;
 /* ---- legs & feet ---- */
 if(side){
  const back=13-step*2,front=15+step*2;
  if(!longR){B(back,ly,3,legH,DK(pants));P(back-1,FY-2,4,2,DK(shoe));B(front,ly,3,legH,pants);B(front,FY-2,5,2,shoe);P(front+1,FY-2,3,1,LT(shoe))}
  else{P(back,FY-2,4,2,DK(shoe));B(front+1,FY-2,4,2,shoe)}
 }else{
  const lL=step>0?1:0,rL=step<0?1:0;
  if(!longR){
   const lg=p.shorts?skin:pants;
   B(12,ly,3,legH-lL,lg);B(17,ly,3,legH-rL,lg);if(p.shorts){B(12,ly,3,2,pants);B(17,ly,3,2,pants)}
   if(p.boots){B(11,FY-4-lL,5,4,shoe);B(16,FY-4-rL,5,4,shoe);P(11,FY-4-lL,5,1,LT(shoe));P(16,FY-4-rL,5,1,LT(shoe))}
   else{B(11,FY-2-lL,5,2,shoe);B(16,FY-2-rL,5,2,shoe)}
  }else{B(11,FY-2-lL,4,2,shoe);B(17,FY-2-rL,4,2,shoe)}
 }
 /* ---- long skirt / robe ---- */
 if(longR){
  const sy=ty+torH-3,sh=FY-1-sy-(p.robe?0:1);
  for(let r=0;r<sh;r++){const wv=(side?9:tw)+Math.floor(r*(side?2:4)/sh)*1+(p.robe?0:1),xx=side?(13-Math.floor((wv-9)/2)):16-Math.floor(wv/2);
   P(xx,sy+r,wv,1,robeC);P(xx,sy+r,1,1,LT(robeC));P(xx+wv-1,sy+r,1,1,DK(robeC));if(!side&&r>2&&((r+fr)%5===0))P(xx+Math.floor(wv/2),sy+r,1,1,DK(robeC))}
  P(side?12:16-Math.floor((tw+4)/2),FY-2-(p.robe?0:1),side?13:tw+4,1,DK(robeC));
  if(p.trim)P(side?12:16-Math.floor((tw+4)/2)+1,FY-3-(p.robe?0:1),side?11:tw+2,1,p.trim);
 }
 /* ---- coat tails ---- */
 if(p.coat&&!p.robe){
  if(side){B(10,ty+torH-2,5,legH-1,DK(p.coat))}
  else if(up){B(tx-1,ty+torH-2,tw+2,legH-1,p.coat);P(16,ty+torH,1,legH-3,DK2(p.coat))}
  else{B(tx-1,ty+torH-2,4,legH-1,p.coat);B(tx+tw-3,ty+torH-2,4,legH-1,p.coat)}
 }
 /* ---- arms (far side) ---- */
 const sw=side?step:0;
 if(side){B(13-sw,ty+1,3,torH-3,DK(sleeve));P(13-sw,ty+torH-2,3,2,DK(skin))}
 /* ---- torso ---- */
 if(side){B(12,ty,9,torH,top)}else B(tx,ty,tw,torH,top);
 const T0=side?12:tx,TW=side?9:tw;
 if(p.coat){if(side){B(11,ty,7,torH,p.coat);P(17,ty,1,torH,DK(p.coat))}else if(up)B(tx,ty,tw,torH,p.coat);else{B(tx,ty,4,torH,p.coat);B(tx+tw-4,ty,4,torH,p.coat);P(tx+3,ty,1,3,LT(p.coat));P(tx+tw-4,ty,1,3,LT(p.coat))}}
 if(p.vest&&!up){if(side)B(12,ty,6,torH,p.vest);else{B(tx,ty,3,torH-1,p.vest);B(tx+tw-3,ty,3,torH-1,p.vest)}}
 if(p.vest&&up)B(tx,ty,tw,torH-1,p.vest);
 if(p.bodice&&!up){if(side)B(14,ty+3,6,torH-3,p.bodice);else{B(tx+1,ty+3,tw-2,torH-3,p.bodice);for(let i=0;i<3;i++)P(16-1+(i&1),ty+4+i*2,1,1,LT(p.bodice))}}
 if(p.armor){if(side){B(13,ty,7,4,p.armor);B(14,ty-1,4,3,LT(p.armor))}else{B(tx,ty,tw,4,p.armor);P(tx+2,ty+1,tw-4,1,LT(p.armor));B(tx-2,ty-1,4,3,p.armor);B(tx+tw-2,ty-1,4,3,p.armor)}}
 if(p.kimono&&!up&&!side){P(15,ty,1,5,p.kimono);P(16,ty+1,1,4,p.kimono);P(17,ty,1,1,p.kimono)}
 /* belt */
 const by=ty+torH-3;if(p.belt){P(T0,by,TW,2,p.belt);P(T0,by,TW,1,LT(p.belt));if(down)P(15,by,2,2,p.buckle||'#e0b850');if(side)P(18,by,2,2,p.buckle||'#e0b850')}
 /* apron */
 if(p.apron&&!up){const ay=ty+2,ah=(longR?FY-5:ly+legH-2)-ay;if(side)B(18,ay,3,ah,p.apron);else{B(tx+2,ay,tw-4,ah,p.apron);P(tx+2,ty,1,2,p.apron);P(tx+tw-3,ty,1,2,p.apron);P(tx+3,ay+3,tw-6,1,DK(p.apron))}}
 if(p.apron&&up){P(tx+2,ty,1,torH,p.apron);P(tx+tw-3,ty,1,torH,p.apron);P(tx,by+1,tw,1,p.apron)}
 /* shawl / scarf */
 if(p.shawl){if(side)B(11,ty-1,10,4,p.shawl);else if(up)B(tx-1,ty-1,tw+2,5,p.shawl);else{B(tx-1,ty-1,tw+2,3,p.shawl);for(let i=0;i<3;i++)P(tx+i+1,ty+2+i,tw-2-i*2,1,p.shawl);P(tx,ty+2,1,2,DK(p.shawl));P(tx+tw-1,ty+2,1,2,DK(p.shawl))}}
 if(p.scarf){if(side){B(12,ty-1,9,3,p.scarf);B(10-step,ty+1,3,4,DK(p.scarf))}else{B(tx-1,ty-1,tw+2,3,p.scarf);if(down)B(tx+tw-3,ty+2,3,4,p.scarf);else B(tx+1,ty+2,3,5,DK(p.scarf))}}
 if(p.collar&&down){P(14,ty,4,1,p.collar);P(15,ty+1,2,1,p.collar)}
 /* ---- arms (near/front) ---- */
 const sl=p.rolled?sleeve:sleeve,ah=torH-3;
 if(side){B(15+sw,ty+1,3,ah,sl);if(p.rolled)P(15+sw,ty+3,3,ah-2,skin);B(15+sw,ty+ah+1,3,2,skin)}
 else{const la=-step,ra=step;
  B(tx-3,ty,3,ah+la,sl);if(p.rolled)B(tx-3,ty+3,3,ah+la-3,skin);B(tx-3,ty+ah+la,3,2,skin);
  B(tx+tw,ty,3,ah+ra,sl);if(p.rolled)B(tx+tw,ty+3,3,ah+ra-3,skin);B(tx+tw,ty+ah+ra,3,2,skin);
  if(p.armor){B(tx-3,ty-1,4,3,p.armor);B(tx+tw-1,ty-1,4,3,p.armor)}}
 /* ---- items ---- */
 const itemDraw=()=>{
  if(item==='cane'){const x=side?22:tx+tw+2;P(x,ty+2,1,FY-ty-2,'#6e4a2a');P(x,ty+2,1,FY-ty-2,'#6e4a2a');P(x-1,ty+1,3,2,'#8a6238');}
  else if(item==='staff'){const x=side?22:tx+tw+2;P(x,hy+4,1,FY-hy-4,'#8a5a2a');P(x-1,hy+1,3,3,p.gem||'#7ae0ff');P(x,hy+1,1,1,'#fff')}
  else if(item==='sword'&&!side){if(up){P(tx+tw-2,ty-4,2,torH+3,'#b8c0d0');P(tx+tw-3,ty+1,4,1,'#c8a040')}else{P(tx-3,ty-6,2,5,'#6a4428');P(tx-4,ty-2,4,1,'#c8a040');P(tx-3,ty-7,2,1,'#c8a040')}}
  else if(item==='sword'&&side){P(11,ty-2,2,torH+2,'#9aa2b8');P(10,ty+1,4,1,'#c8a040')}
  else if(item==='bow'){if(up){for(let i=0;i<torH+4;i++)P(tx+1+Math.floor(i*.6),ty-2+i,1,1,'#8a5a2a')}else if(side)P(11,ty-1,1,torH+1,'#8a5a2a');else{P(tx+tw-1,ty-3,1,3,'#8a5a2a')}}
  else if(item==='dagger'&&!up){if(side)P(14,by,4,1,'#c8ccd8');else{P(tx+tw-2,by-1,1,4,'#c8ccd8');P(tx+tw-3,by,3,1,'#6a2a2a')}}
  else if(item==='basket'&&down){B(14,ty+torH-3,5,3,'#a8784a');P(15,ty+torH-4,3,1,'#e8d070');P(14,ty+torH-4,1,1,'#7aa0e0')}
  else if(item==='tray'&&down){P(tx+tw-1,ty+2,7,1,'#7a5030');B(tx+tw,ty-1,2,3,'#9a6a3a');B(tx+tw+3,ty-1,2,3,'#9a6a3a');P(tx+tw,ty-1,2,1,'#f4f0e0');P(tx+tw+3,ty-1,2,1,'#f4f0e0')}
  else if(item==='book'&&down){B(tx+tw-1,ty+3,3,4,'#6a3a24')}
  else if(item==='spear'){const x=side?22:tx+tw+2;P(x,hy-2,1,FY-hy+1,'#8a6a40');P(x-1,hy-4,3,3,'#dfe4f0')}};
 const backItem=item==='sword'||item==='bow';if(up||(backItem&&!side))itemDraw();
 /* ---- head ---- */
 const HX=side?10:9,HW=side?13:14;
 if(p.beard==='long'&&!up){}
 /* long hair behind */
 const hs=p.hs||'short';
 if(!up&&(hs==='long'||hs==='wavy')){if(side)B(9,hy+4,7,ty+3-hy,DK(hair));else{B(7,hy+4,4,ty+4-hy,DK(hair));B(21,hy+4,4,ty+4-hy,DK(hair))}}
 if(!up&&hs==='pony'){if(side)B(6,hy+4,4,10,DK(hair));else{B(22,hy+5,3,8,DK(hair))}}
 B(HX,hy+2,HW,11,skin);P(HX,hy+2,1,1,null);
 g.clearRect(HX,hy+2,1,1);g.clearRect(HX+HW-1,hy+2,1,1);g.clearRect(HX,hy+12,2,1);g.clearRect(HX+HW-2,hy+12,2,1);g.clearRect(HX,hy+11,1,1);g.clearRect(HX+HW-1,hy+11,1,1);
 P(HX+1,hy+12,HW-2,1,DK(skin));
 if(!side&&!up){P(HX-1,hy+7,1,3,skin);P(HX+HW,hy+7,1,3,DK(skin))}
 /* face */
 const fem=p.fem,blush=fem||kid;
 if(down){
  if(old&&!p.glasses){P(11,hy+9,3,1,DK2(skin));P(18,hy+9,3,1,DK2(skin));P(11,hy+7,2,1,DK(skin))}
  else{for(const ex of[11,18]){P(ex,hy+7,3,1,'#1c1424');P(ex,hy+8,3,2,eye);P(ex,hy+8,1,1,'#ffffff');P(ex+2,hy+9,1,1,DK(eye));if(fem){P(ex-1,hy+7,1,1,'#1c1424')}}
   P(11,hy+5,3,1,DK(hair));P(18,hy+5,3,1,DK(hair))}
  if(blush){P(10,hy+10,2,1,'#f08a8a');P(20,hy+10,2,1,'#f08a8a')}
  P(15,hy+11,2,1,p.smile?'#a03a3a':DK(skin));if(p.smile)P(14,hy+10,1,1,DK(skin));
  if(p.glasses){P(10,hy+7,5,4,'#c8a050');P(17,hy+7,5,4,'#c8a050');P(11,hy+8,3,2,'#e8eef4');P(18,hy+8,3,2,'#e8eef4');P(12,hy+8,1,2,'#3a2a3a');P(19,hy+8,1,2,'#3a2a3a');P(15,hy+8,2,1,'#c8a050')}
 }else if(side){
  P(19,hy+7,2,1,'#1c1424');P(19,hy+8,2,2,eye);P(20,hy+8,1,1,'#ffffff');P(19,hy+5,3,1,DK(hair));
  if(blush)P(19,hy+10,2,1,'#f08a8a');P(22,hy+9,1,1,DK(skin));P(20,hy+11,2,1,DK(skin));
  P(14,hy+7,2,3,DK(skin));
  if(p.glasses){P(18,hy+7,4,4,'#c8a050');P(19,hy+8,2,2,'#e8eef4');P(13,hy+8,5,1,'#c8a050')}
 }
 /* beard */
 if(p.beard&&!up){const bc=p.beardc||hair;if(p.beard==='long'){if(side){B(17,hy+10,6,ty+5-hy-10,bc);P(16,hy+11,1,3,bc)}else{B(11,hy+10,10,4,bc);B(12,hy+14,8,4,bc);B(13,hy+18,6,4,bc);P(15,hy+11,2,1,DK(skin));P(10,hy+6,2,5,bc);P(20,hy+6,2,5,bc)}}
  else{if(side){P(16,hy+10,7,3,bc);P(20,hy+11,2,1,DK2(skin))}else{P(9,hy+9,2,3,bc);P(21,hy+9,2,3,bc);P(10,hy+11,3,2,bc);P(19,hy+11,3,2,bc);P(12,hy+12,8,1,bc);P(13,hy+13,6,1,bc);P(15,hy+11,2,1,DK2(skin))}}}
 /* ---- hair ---- */
 const H1=hair,HL=LT(hair),HD=DK(hair);
 if(up){
  RB(HX-1,hy,HW+2,13,H1,[3,1],[0]);P(HX+3,hy+1,4,1,HL);P(HX+1,hy+2,1,4,HL);
  if(hs==='long'||hs==='wavy'||hs==='braids')B(HX,hy+12,HW,ty+5-hy-12,H1);
  if(hs==='braids'){B(9,ty,3,8,H1);B(20,ty,3,8,H1);P(9,ty+8,3,1,p.ribbon||'#3a5ab8');P(20,ty+8,3,1,p.ribbon||'#3a5ab8')}
  if(hs==='pony'){B(14,hy+10,4,10,H1);P(14,hy+9,4,1,p.ribbon||'#c83a3a')}
  if(hs==='bun'){B(13,hy-3,6,5,H1);P(14,hy-2,2,1,HL)}
  if(hs==='bald'){B(HX,hy+2,HW,6,skin);P(HX+3,hy+3,3,1,LT(skin))}
  if(hs==='spiky'){for(let i=0;i<5;i++)P(HX+i*3,hy-1-(i&1),2,2,H1)}
 }else if(side){
  if(hs==='bald'){P(10,hy+6,5,4,H1);P(12,hy+3,4,1,LT(skin))}
  else{RB(9,hy,13,5,H1,[3,1]);RB(9,hy+4,7,6,H1,null,[1]);P(18,hy+4,4,2,H1);P(20,hy+6,2,1,H1);P(11,hy+1,6,1,HL);P(9,hy+9,4,2,HD);
   if(hs==='spiky'){P(9,hy-1,2,2,H1);P(12,hy-2,2,3,H1);P(15,hy-2,2,3,H1);P(18,hy-1,3,2,H1);P(7,hy+2,2,2,H1);P(6,hy+5,3,2,H1)}
   if(hs==='messy'){P(8,hy+1,2,2,H1);P(12,hy-1,3,2,H1);P(17,hy-1,3,2,H1);P(21,hy+3,2,2,H1)}
   if(hs==='long'||hs==='wavy')B(9,hy+9,6,ty+4-hy-9,H1);
   if(hs==='braids'){B(10,hy+9,3,ty+7-hy-9,H1);P(10,ty+7,3,1,p.ribbon||'#3a5ab8')}
   if(hs==='bun'){B(7,hy,5,5,H1);P(8,hy+1,2,1,HL)}
   if(hs==='pony')P(10,hy+3,2,2,p.ribbon||'#c83a3a')}
 }else{
  if(hs==='bald'){P(HX,hy+5,2,5,H1);P(HX+HW-2,hy+5,2,5,H1);P(13,hy+3,4,1,LT(skin))}
  else{
   RB(HX-1,hy,HW+2,5,H1,[3,1]);P(HX+3,hy+1,5,1,HL);P(HX+2,hy+2,2,1,HL);
   // fringe
   const fr2=hs==='spiky'||hs==='messy'?[0,1,1,0,1,0,0,1,1,0,1,0,1,1]:[1,1,0,1,1,1,0,1,1,1,0,1,1,1];
   for(let i=0;i<HW;i++){P(HX+i,hy+5,1,1,H1);if(fr2[i])P(HX+i,hy+6,1,1,H1);if(i%4===1)P(HX+i,hy+7,1,1,HD)}
   P(HX-1,hy+4,2,hs==='short'||hs==='spiky'||hs==='messy'?6:7,H1);P(HX+HW-1,hy+4,2,hs==='short'||hs==='spiky'||hs==='messy'?6:7,H1);
   if(hs==='spiky'){P(HX,hy-1,2,2,H1);P(HX+3,hy-2,2,3,H1);P(HX+6,hy-2,3,3,H1);P(HX+10,hy-2,2,3,H1);P(HX+13,hy-1,2,2,H1);P(HX-2,hy+3,2,2,H1);P(HX+HW,hy+3,2,2,H1);P(HX+6,hy-2,1,1,HL)}
   if(hs==='messy'){P(HX-1,hy-1,3,2,H1);P(HX+4,hy-2,3,3,H1);P(HX+9,hy-1,3,2,H1);P(HX+12,hy-2,2,3,H1);P(HX-2,hy+5,2,3,H1);P(HX+HW,hy+5,2,3,H1)}
   if(hs==='long'||hs==='wavy'){B(HX-2,hy+4,3,ty+3-hy-4,H1);B(HX+HW-1,hy+4,3,ty+3-hy-4,H1);if(hs==='wavy'){P(HX-3,ty-2,2,2,H1);P(HX+HW+1,ty-2,2,2,H1)}}
   if(hs==='braids'){B(HX-2,hy+4,3,8,H1);B(HX+HW-1,hy+4,3,8,H1);for(let i=0;i<4;i++){B(HX-1,hy+12+i*2,3,2,i&1?HD:H1);B(HX+HW-2,hy+12+i*2,3,2,i&1?HD:H1)}P(HX-1,hy+20,3,1,p.ribbon||'#3a5ab8');P(HX+HW-2,hy+20,3,1,p.ribbon||'#3a5ab8')}
   if(hs==='bun'){B(13,hy-3,6,4,H1);P(14,hy-2,2,1,HL)}
   if(hs==='pony'){P(HX+HW-2,hy+1,2,2,p.ribbon||'#c83a3a')}
  }
 }
 /* ---- hats ---- */
 const hc=p.hatc||'#888';
 switch(p.hat){
 case 'hood':if(up)B(HX-2,hy-1,HW+4,15,hc);else if(side){B(8,hy-1,14,6,hc);B(7,hy+3,8,10,hc);P(21,hy+1,1,4,DK(hc))}else{B(HX-2,hy-1,HW+4,6,hc);B(HX-2,hy+4,3,9,hc);B(HX+HW-1,hy+4,3,9,hc);P(HX+1,hy+4,HW-2,1,DK(hc));P(HX+2,hy,4,1,LT(hc))}break;
 case 'kerchief':if(up)B(HX-1,hy-1,HW+2,7,hc);else if(side){B(9,hy-1,13,4,hc);B(7,hy+1,3,3,hc)}else{B(HX-1,hy-1,HW+2,4,hc);P(HX-1,hy+3,HW+2,1,DK(hc));B(HX+HW-1,hy+3,3,2,hc)}break;
 case 'helm':{const m=p.armor||'#c8ccd8';if(up)B(HX-1,hy-1,HW+2,9,m);else if(side){B(9,hy-1,14,6,m);P(9,hy+5,5,4,DK(m))}else{B(HX-1,hy-1,HW+2,6,m);P(HX-1,hy+5,2,4,DK(m));P(HX+HW-1,hy+5,2,4,DK(m));P(HX+2,hy,5,1,'#f4f6ff')}
  P(15,hy-4,3,4,'#d43a32');P(17,hy-5,2,2,'#d43a32');break}
 case 'crown':P(HX+2,hy-1,HW-4,2,'#e8c040');P(HX+2,hy-3,1,2,'#e8c040');P(15,hy-3,2,2,'#e8c040');P(HX+HW-3,hy-3,1,2,'#e8c040');P(15,hy-1,2,1,'#d0303a');break;
 case 'tiara':if(!up){P(HX+3,hy+1,HW-6,1,'#f0d040');P(15,hy,2,1,'#7ae8ff')}break;
 case 'beret':B(HX-1,hy-2,HW+1,4,hc);B(HX+2,hy-3,HW-4,2,hc);P(HX+HW-2,hy-4,2,2,'#fff');break;
 case 'cap':B(HX-1,hy-1,HW+2,4,hc);if(down)P(HX,hy+3,HW,1,DK(hc));if(side)P(20,hy+2,4,1,DK(hc));break;
 case 'band':if(up)P(HX-1,hy+4,HW+2,2,'#d43a32');else if(side){P(9,hy+4,13,2,'#d43a32');P(6,hy+5,3,1,'#d43a32');P(5,hy+6,2,1,'#d43a32')}else P(HX-1,hy+4,HW+2,2,'#d43a32');break;
 case 'witch':B(HX-4,hy+1,HW+8,2,hc);B(HX,hy-2,HW,3,hc);B(HX+3,hy-5,HW-6,3,hc);B(HX+6,hy-7,4,2,hc);P(HX,hy,HW,1,p.acc||'#e8c040');break;
 }
 /* ---- front items ---- */
 if(!up&&!(backItem&&!side))itemDraw();
 /* mirror */
 let out=cv;if(dir==='left'){const c2=document.createElement('canvas');c2.width=W;c2.height=H;const g2=c2.getContext('2d');g2.translate(W,0);g2.scale(-1,1);g2.drawImage(cv,0,0);out=c2}
 /* colored outline */
 const og=out.getContext('2d'),id=og.getImageData(0,0,W,H),a=id.data,src=new Uint8ClampedArray(a);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;if(src[i+3])continue;let best=-1;
  for(const[dx,dy]of[[0,1],[0,-1],[1,0],[-1,0]]){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=W||yy>=H)continue;const j=(yy*W+xx)*4;if(src[j+3]){best=j;if(dy===-1)break}}
  if(best>=0){a[i]=src[best]*.28+8;a[i+1]=src[best+1]*.24+6;a[i+2]=src[best+2]*.3+14;a[i+3]=255}}
 og.putImageData(id,0,0);
 return DOTC[key]=out;
}
/* ---- パレット ---- */
const HPAL={
 allen:{id:'h_allen',hs:'spiky',hair:'#e2e4ee',eye:'#3a6ad0',top:'#e8e4dc',coat:'#1e2a5c',scarf:'#3a5ab8',pants:'#2a2a34',shoe:'#4a3020',boots:1,belt:'#5a3a20',item:'sword'},
 gard:{id:'h_gard',body:'big',hs:'messy',hair:'#1c1616',eye:'#7a2a2a',top:'#5e1c1c',armor:'#5c5458',cape:'#8a1c1c',pants:'#2a2024',shoe:'#3a2a22',boots:1,belt:'#3a2a20',item:'sword'},
 sion:{id:'h_sion',hs:'long',hair:'#cac6de',eye:'#5a8a6a',top:'#1e4a32',robe:1,coat:'#1e4a32',trim:'#c8b070',belt:'#c8b070',item:'staff',gem:'#9ae8a0',collar:'#e8e0c8'},
 stella:{id:'h_stella',fem:1,hs:'wavy',hair:'#f0d080',eye:'#3a5aa8',top:'#f4f2ea',dress:'#f4f2ea',trim:'#3a5aa8',cape:'#e8ecf8',belt:'#3a5aa8',item:'staff',gem:'#ffe080',hat:'tiara'},
 fio:{id:'h_fio',fem:1,hs:'pony',hair:'#2a9090',eye:'#2a7a5a',top:'#3e6030',vest:'#6a4a2a',pants:'#4a2a1a',shoe:'#3a2418',boots:1,belt:'#6a4a2a',item:'bow',ribbon:'#e8d070'},
 shino:{id:'h_shino',fem:1,hs:'pony',hair:'#e8e8ee',eye:'#b02232',top:'#1c161a',dress:'#1c161a',kimono:'#b02232',belt:'#b02232',buckle:'#b02232',item:'dagger',ribbon:'#b02232',trim:'#b02232'}};
const NPC2={
 boy:{id:'nb_boy',body:'kid',hs:'messy',hair:'#8a5228',eye:'#5a3a22',top:'#e8e0cc',vest:'#6a4426',pants:'#5a4a32',shorts:1,shoe:'#5a3a22',boots:1,belt:'#4a3220',smile:1},
 lgirl:{id:'nb_lgirl',body:'kid',fem:1,hs:'braids',hair:'#f0d080',eye:'#3a6ab0',top:'#3e64a8',dress:'#3e64a8',apron:'#f2efe6',shawl:'#d8c8a8',shoe:'#3a2418',item:'basket',ribbon:'#3a5ab8',smile:1},
 youngman:{id:'nb_ym',hs:'short',hair:'#2a2220',eye:'#4a3020',top:'#e8e2d4',rolled:1,apron:'#6a4428',pants:'#5a3e28',shoe:'#4a3020',boots:1,smile:1},
 waitress:{id:'nb_wait',fem:1,hs:'pony',hair:'#b8502a',eye:'#4a6a3a',hat:'kerchief',hatc:'#f0ece0',top:'#f2eee4',dress:'#3e5a32',bodice:'#2e3a22',apron:'#f2efe6',ribbon:'#b8502a',item:'tray',smile:1,trim:'#c8b080'},
 merchant:{id:'nb_merch',hs:'short',hair:'#1e1a1a',eye:'#3a2a20',top:'#d8ccb0',coat:'#2e4a36',pants:'#4a3424',shoe:'#3e2a1e',boots:1,belt:'#5a3a20',beard:'short',beardc:'#2a2220',item:'book'},
 townwoman:{id:'nb_town',fem:1,hs:'long',hair:'#4a2a20',eye:'#4a2a20',top:'#efe8dc',bodice:'#5a3a24',dress:'#7a2230',apron:'#e4d8c0',trim:'#c8a060',smile:1},
 smith:{id:'nb_smith',body:'big',hs:'short',hair:'#6a5e54',eye:'#3a2a20',top:'#e8e0cc',rolled:1,apron:'#6a4428',pants:'#2a2a30',shoe:'#3e2a1e',boots:1,belt:'#4a3220',beard:'short',beardc:'#6a5e54',smile:1},
 mother:{id:'nb_mom',body:'plump',fem:1,hs:'bun',hair:'#7a5030',eye:'#4a3020',top:'#6a4228',dress:'#6a4228',apron:'#efe9dc',shawl:'#8a7a4a',smile:1},
 elder:{id:'nb_elder',body:'old',hs:'bald',hair:'#e8e8ec',top:'#6a4a30',robe:1,coat:'#6a4a30',hat:'hood',hatc:'#5e422a',beard:'long',beardc:'#f0f0f4',belt:'#b09a6a',buckle:'#b09a6a',item:'cane'},
 oldwoman:{id:'nb_oldw',body:'old',fem:1,hs:'bun',hair:'#e8e8ec',glasses:1,top:'#4a3a6a',dress:'#4a3a6a',shawl:'#5e4a82',trim:'#a08ac0',item:'cane'},
 guard:{id:'nb_guard',hs:'short',hair:'#5a3a22',top:'#3a4a9a',armor:'#c8ccd8',hat:'helm',pants:'#2a2a3a',shoe:'#3a2a22',boots:1,belt:'#6a4a2a',item:'spear'},
 sailor:{id:'nb_sailor',hs:'messy',hair:'#2a1a10',skin:'#d8a070',top:'#f0f0f4',scarf:'#2a4aa8',pants:'#2a4a9a',shoe:'#3e2a1e',hat:'band',belt:'#6a4a2a'},
 priest:{id:'nb_priest',hs:'short',hair:'#d8c8a0',top:'#f4f4fa',robe:1,coat:'#f4f4fa',trim:'#e8c040',hat:'hood',hatc:'#e8e8f2',belt:'#e8c040'},
 nun:{id:'nb_nun',fem:1,hs:'short',hair:'#2a2a2a',top:'#2a2a3a',dress:'#2a2a3a',hat:'hood',hatc:'#22222e',collar:'#ffffff',apron:'#f4f4f8'},
 king:{id:'nb_king',hs:'short',hair:'#e8e0d0',top:'#a82a3a',robe:1,coat:'#a82a3a',trim:'#f0d040',cape:'#d83a3a',hat:'crown',beard:'long',beardc:'#f0ece0',belt:'#f0d040'},
 queen:{id:'nb_queen',fem:1,hs:'wavy',hair:'#f0c860',top:'#7a3aa8',dress:'#7a3aa8',trim:'#f0d040',hat:'crown',belt:'#f0d040'},
 minister:{id:'nb_min',hs:'short',hair:'#9a9a9a',top:'#2a3a6a',robe:1,coat:'#2a3a6a',trim:'#e8c040',hat:'beret',hatc:'#2a3a6a',beard:'short',beardc:'#8a8a8a',collar:'#e8c040'}};
const NPC2K={guard:'guard',youth:'youngman',girl:'waitress',child:'boy',old:'elder',merchant:'merchant',sailor:'sailor',priest:'priest',nun:'nun',king:'king',queen:'queen',minister:'minister'};
const NTY={青年:'youngman',看板娘:'waitress',子ども:'boy',老人:'elder',旅人:'townwoman',商人:'merchant',漁師:'smith',おかみさん:'mother',女の子:'lgirl',学者:'elder_a',巡礼者:'oldwoman',老船長:'elder_b',老学者:'elder_a',king:'king',vald:'minister',リーフ王:'king',王妃:'queen',王女:'princess',侍女:'lady',大臣ヴァルド:'minister',神官:'priest',シスター:'nun',船乗り:'sailor',衛兵:'guard',騎士団長:'knight',近衛兵:'guard',兵士:'guard',聖騎士:'femknight',港の商人:'merchant_a',少年:'boy_a'};
const NFIG=new Set(['sailor','boy','lgirl','youngman','waitress','merchant','townwoman','smith','mother','elder','oldwoman','king','queen','princess','minister','knight','guard','femknight','priest','nun','lady','boy_a','boy_b','lgirl_a','lgirl_b','youngman_a','youngman_b','waitress_a','waitress_b','merchant_a','merchant_b','townwoman_a','townwoman_b','smith_a','smith_b','mother_a','mother_b','elder_a','elder_b','oldwoman_a','oldwoman_b']);
const NPIC={};
const SPRN=new Set(['boy','lgirl','youngman','waitress','merchant','townwoman','smith','mother','elder','oldwoman','guard','sailor','priest','nun','king','queen','minister','princess','knight','femknight','lady','boy_a','merchant_a','elder_a','elder_b']);
function npcSpr(ty){return SPRN.has(ty)?ty:npcBase(ty)}
function npcBase(ty){const b=(ty||'').replace(/_[ab]$/,'');return NPC2[b]?b:({princess:'queen',knight:'guard',femknight:'guard',lady:'townwoman'}[b]||'youngman')}
function npcPic(ty){if(NFIG.has(ty))return'img/npc/'+ty+'_f.webp';if(NPIC[ty])return NPIC[ty];const sp=dot3(NPC2[npcBase(ty)],'down',0),sd=sp.getContext('2d').getImageData(0,0,48,60).data;let top=0;for(let y=0;y<60&&!top;y++)for(let x=0;x<48;x++)if(sd[(y*48+x)*4+3]){top=y;break}const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.fillStyle='#e8dec8';g.fillRect(0,0,128,128);g.imageSmoothingEnabled=false;g.drawImage(sp,9,Math.max(0,top),30,30,0,6,128,128);return NPIC[ty]=c.toDataURL()}
function npcType(n){if(n.ty)return n.ty;const t=NTY[n.name];if(t)return n.ty=t;for(const k in NPAL)if(NPAL[k]===n.pal)return n.ty=NPC2K[k]||'youngman';return n.ty='youngman'}

/* ===== 高精細ドット v3: 4倍ベクター描画 → 縮小 → ドット化 (48x60) ===== */
const DOT3={};
function dot3(p,dir,fr){
 fr=fr|0;const key=p.id+'|'+dir+'|'+fr;if(DOT3[key])return DOT3[key];
 const S=4,W=48,H=60,cv=document.createElement('canvas');cv.width=W*S;cv.height=H*S;const g=cv.getContext('2d');g.scale(S,S);g.lineJoin=g.lineCap='round';
 const d=dir==='left'?'right':dir,side=d==='right',up=d==='up',down=d==='down';
 const body=p.body||'adult',kid=body==='kid',big=body==='big',plump=body==='plump',old=body==='old';
 const ph=(fr&3)/4*Math.PI*2,sw=Math.sin(ph),lift=Math.max(0,Math.cos(ph)),bob=(fr&1)?0.9:0;
 const skin=p.skin||'#f2c49a',hair=p.hair||'#5a3a22',eye=p.eye||'#3a2a4a',shoe=p.shoe||'#3e2a1e',pants=p.pants||'#3a3040';
 const top=p.top||'#c8c0b0',sleeve=p.coat||top,longR=!!(p.dress||p.robe),robeC=p.robe?(p.coat||top):p.dress;
 const LTc=c=>dmix(c,'#fff6e0',.32),DKc=c=>dmix(c,'#1a0c28',.38),DK2c=c=>dmix(c,'#140820',.6);
 /* proportions */
 const GY=58,legL=kid?7:old?8:10,torL=kid?10:12,headR=kid?10.5:10;
 const hipY=GY-3-legL,shY=hipY-torL+bob,hcY=shY-headR+0.5+(old?1.5:0),cx=side?23:24;
 const shW=big?9.5:plump?9:kid?6.5:7.2,waW=big?8:plump?9.5:kid?6:5.8;
 /* shape helpers with cel shading */
 const ell=(x,y,rx,ry)=>{g.beginPath();g.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,7)};
 /* simpler: base + dark rim on right/bottom + light on left/top */
 const cel=(col,pathFn,lx,ly,lw,lh)=>{g.save();pathFn();g.fillStyle=col===skin?dmix(skin,'#b0584a',.32):DKc(col);g.fill();g.clip();g.translate(col===skin?-.8:-1,col===skin?-.7:-.85);pathFn();g.fillStyle=col;g.fill();g.restore();
  if(lw){g.save();pathFn();g.clip();g.globalAlpha=.6;g.fillStyle=LTc(col);ell(lx,ly,lw,lh);g.fill();g.restore()}};
 const cap=(x1,y1,x2,y2,w,col)=>{const f=()=>{g.beginPath();const a=Math.atan2(y2-y1,x2-x1),nx=Math.cos(a+Math.PI/2)*w/2,ny=Math.sin(a+Math.PI/2)*w/2;g.moveTo(x1+nx,y1+ny);g.lineTo(x2+nx,y2+ny);g.arc(x2,y2,w/2,a+Math.PI/2,a-Math.PI/2,true);g.lineTo(x1-nx,y1-ny);g.arc(x1,y1,w/2,a-Math.PI/2,a+Math.PI/2,true);g.closePath()};cel(col,f,x1-w*.3,y1+(y2-y1)*.3,w*.3,Math.abs(y2-y1)*.4+1)};
 const poly=(pts,col,lx,ly,lw,lh)=>{const f=()=>{g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++){const q=pts[i];if(q.length===4)g.quadraticCurveTo(q[0],q[1],q[2],q[3]);else g.lineTo(q[0],q[1])}g.closePath()};cel(col,f,lx,ly,lw,lh)};
 const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
 /* ---------- feet / legs ---------- */
 const legs=()=>{
  if(side){
   const fx=cx+sw*4.2,bx=cx-sw*4.2,fy=GY-1.5-(sw>0?lift*0:0),liftF=sw<0?1.6*Math.abs(sw):0,liftB=sw>0?1.6*Math.abs(sw):0;
   const legC=p.shorts?skin:pants;
   cap(cx-.5,hipY+1,bx,GY-3-liftB,4,DKc(legC));ell(bx+1.2,GY-1.8-liftB,3,1.9);g.fillStyle=DKc(shoe);g.fill();
   cap(cx+.5,hipY+1,fx,GY-3-liftF,4.2,legC);if(p.shorts){cap(cx,hipY+1,cx+sw*1.5,hipY+4,4.8,pants)}
   const sf=()=>{ell(fx+1.4,GY-1.8-liftF,3.3,2)};cel(shoe,sf,fx,GY-3,1.5,.6);
   if(p.boots){cap(fx,GY-6-liftF,fx,GY-2.5-liftF,4.4,shoe)}
  }else{
   const lL=sw>0?1.8*sw:0,rL=sw<0?-1.8*sw:0,legC=p.shorts?skin:pants,lx=cx-2.6-(big?1:0),rx=cx+2.6+(big?1:0);
   if(!longR){
    cap(lx,hipY+1,lx-.3,GY-3-lL,4.2,legC);cap(rx,hipY+1,rx+.3,GY-3-rL,4.2,legC);
    if(p.shorts){cap(lx,hipY+1,lx-.2,hipY+4.5,5,pants);cap(rx,hipY+1,rx+.2,hipY+4.5,5,pants)}
    if(p.boots){cap(lx-.3,GY-7-lL,lx-.3,GY-3-lL,4.8,shoe);cap(rx+.3,GY-7-rL,rx+.3,GY-3-rL,4.8,shoe)}
   }
   const ff=(x,y)=>()=>ell(x,y,3,2.1);cel(shoe,ff(lx-.4,GY-1.9-lL),lx-1,GY-2.8-lL,1.4,.6);cel(shoe,ff(rx+.4,GY-1.9-rL),rx,GY-2.8-rL,1.4,.6);
  }};
 /* ---------- cape behind ---------- */
 if(p.cape&&!up){const cw=shW+2.5,fl=Math.sin(ph)*.8;poly([[cx-shW,shY+1],[cx+shW,shY+1],[cx+cw+fl,GY-4],[cx,GY-3,cx-cw+fl,GY-4]],DKc(p.cape))}
 if(p.item==='staff'||p.item==='spear'||p.item==='cane'){if(up)null}
 /* back weapon */
 const backW=()=>{if(p.item==='sword'){if(up){cap(cx+5,shY-4,cx-4,hipY+4,1.8,'#c8d0e4');cap(cx+5.5,shY-5,cx+4.2,shY-2.5,2.4,'#6a4428');R(cx+2.8,shY-2.4,4,1.2,'#d0a040')}else if(!side){cap(cx-8.5,shY-7,cx-7.2,shY-2,2,'#6a4428');R(cx-10.5,shY-2.2,5,1.3,'#d0a040');ell(cx-8.6,shY-7.6,1.3,1.3);g.fillStyle='#d0a040';g.fill()}}
  if(p.item==='bow'){if(up){g.strokeStyle='#8a5a2a';g.lineWidth=1.6;g.beginPath();g.arc(cx+12,shY+6,12,Math.PI*.72,Math.PI*1.28);g.stroke()}else if(!side){g.strokeStyle='#8a5a2a';g.lineWidth=1.6;g.beginPath();g.arc(cx+11,shY+4,10,Math.PI*.95,Math.PI*1.3);g.stroke()}}};
 if(!up)backW();
 /* ---------- long hair behind ---------- */
 const hs=p.hs||'short';
 if(!up&&(hs==='long'||hs==='wavy')){const f=side?()=>{g.beginPath();g.moveTo(cx-9,hcY-2);g.quadraticCurveTo(cx-12,shY+6,cx-6,shY+9);g.lineTo(cx+1,shY+8);g.lineTo(cx+2,hcY);g.closePath()}:()=>{g.beginPath();g.moveTo(cx-11,hcY);g.quadraticCurveTo(cx-13.5,shY+7,cx-8,shY+10);g.lineTo(cx+8,shY+10);g.quadraticCurveTo(cx+13.5,shY+7,cx+11,hcY);g.closePath()};cel(DKc(hair),f)}
 if(!up&&hs==='pony'){if(side)cap(cx-8,hcY-3,cx-12+sw,hcY+9,4.5,hair);else cap(cx+8,hcY-5,cx+12,hcY+7,4,DKc(hair))}
 /* ---------- legs + skirt ---------- */
 legs();
 if(longR){const sy=hipY-3+bob*.5,bw=(side?7:waW)+1,ew=(side?9.5:waW+5.5)+(p.robe?0:1.5),end=GY-(p.robe?1.6:3.2),sh=side?sw*1.2:0;
  poly([[cx-bw,sy],[cx+bw,sy],[cx+ew+sh,end],[cx,end+1.2,cx-ew+sh,end]],robeC,cx-bw+1.5,sy+6,1.8,7);
  if(p.trim){g.save();g.beginPath();g.moveTo(cx-ew+sh,end-1.6);g.quadraticCurveTo(cx,end-.4,cx+ew+sh,end-1.6);g.strokeStyle=p.trim;g.lineWidth=1.3;g.stroke();g.restore()}
  g.strokeStyle=DKc(robeC);g.lineWidth=.8;for(const k of side?[0]:[-.45,.4]){g.beginPath();g.moveTo(cx+k*bw,sy+4);g.lineTo(cx+k*ew*1.05,end-1);g.stroke()}}
 /* coat tails */
 if(p.coat&&!p.robe){if(side)poly([[cx-4,hipY-2],[cx+2,hipY-2],[cx-1+sw*.6,GY-6],[cx-6+sw*.8,GY-5.5]],DKc(p.coat));
  else if(up)poly([[cx-waW-1,hipY-2],[cx+waW+1,hipY-2],[cx+waW+3,GY-6],[cx-waW-3,GY-6]],p.coat);
  else{poly([[cx-waW-.5,hipY-2],[cx-1.5,hipY-1],[cx-2.5,GY-7],[cx-waW-3,GY-6.5]],p.coat,cx-waW,hipY+3,1.2,4);poly([[cx+1.5,hipY-1],[cx+waW+.5,hipY-2],[cx+waW+3,GY-6.5],[cx+2.5,GY-7]],p.coat)}}
 /* ---------- far arm (side) ---------- */
 const armL=torL-2.5,aw=big?4.6:3.6;
 if(side){const hx=cx-1-sw*3.5;cap(cx-1,shY+1.5,hx,shY+armL,aw,DKc(sleeve));ell(hx,shY+armL+.8,1.8,1.8);g.fillStyle=DKc(skin);g.fill()}
 /* ---------- torso ---------- */
 const tor=side?()=>{g.beginPath();g.moveTo(cx-4.5,shY+.5);g.quadraticCurveTo(cx-1,shY-1,cx+4,shY+.5);g.lineTo(cx+3.6+(plump?1.5:0),hipY+.5);g.lineTo(cx-4.2,hipY+.5);g.closePath()}
  :()=>{g.beginPath();g.moveTo(cx-shW,shY+2);g.quadraticCurveTo(cx-shW,shY,cx-shW+2.5,shY);g.lineTo(cx+shW-2.5,shY);g.quadraticCurveTo(cx+shW,shY,cx+shW,shY+2);g.lineTo(cx+waW,hipY+.5);g.lineTo(cx-waW,hipY+.5);g.closePath()};
 const tc=p.coat&&up?p.coat:top;cel(tc,tor,cx-shW+1.5,shY+3,2,4);
 const clip=(fn)=>{g.save();tor();g.clip();fn();g.restore()};
 if(p.coat&&!up)clip(()=>{if(side){cel(p.coat,()=>{g.beginPath();g.rect(cx-5,shY-1,8,torL+3)},cx-4,shY+3,1.5,4);R(cx+2.4,shY,1,torL+1,DKc(p.coat))}else{cel(p.coat,()=>{g.beginPath();g.moveTo(cx-shW-1,shY-1);g.lineTo(cx-1.2,shY-1);g.lineTo(cx-1.2+0,hipY+1);g.lineTo(cx-shW-1,hipY+1);g.closePath()},cx-shW+1.5,shY+3,1.6,4);cel(p.coat,()=>{g.beginPath();g.moveTo(cx+1.2,shY-1);g.lineTo(cx+shW+1,shY-1);g.lineTo(cx+shW+1,hipY+1);g.lineTo(cx+1.2,hipY+1);g.closePath()});
   g.strokeStyle=LTc(p.coat);g.lineWidth=.8;g.beginPath();g.moveTo(cx-1.5,shY);g.lineTo(cx-3.5,shY+4);g.moveTo(cx+1.5,shY);g.lineTo(cx+3.5,shY+4);g.stroke()}});
 if(p.vest)clip(()=>{if(up)cel(p.vest,()=>{g.beginPath();g.rect(cx-shW-1,shY-1,shW*2+2,torL)});else if(side)cel(p.vest,()=>{g.beginPath();g.rect(cx-5,shY-1,7.5,torL+1)});else{cel(p.vest,()=>{g.beginPath();g.moveTo(cx-shW-1,shY-1);g.lineTo(cx-1.8,shY+2);g.lineTo(cx-2,hipY);g.lineTo(cx-shW-1,hipY);g.closePath()});cel(p.vest,()=>{g.beginPath();g.moveTo(cx+1.8,shY+2);g.lineTo(cx+shW+1,shY-1);g.lineTo(cx+shW+1,hipY);g.lineTo(cx+2,hipY);g.closePath()})}});
 if(p.bodice&&!up)clip(()=>{cel(p.bodice,()=>{g.beginPath();g.moveTo(cx-waW-1,shY+4);g.lineTo(cx+waW+1,shY+4);g.lineTo(cx+waW,hipY+1);g.lineTo(cx-waW,hipY+1);g.closePath()});if(down){g.strokeStyle=LTc(p.bodice);g.lineWidth=.6;g.beginPath();for(let i=0;i<3;i++){g.moveTo(cx-1.5,shY+5.5+i*2);g.lineTo(cx+1.5,shY+6.5+i*2);g.moveTo(cx+1.5,shY+5.5+i*2);g.lineTo(cx-1.5,shY+6.5+i*2)}g.stroke()}});
 if(p.armor)clip(()=>{cel(p.armor,()=>{g.beginPath();if(side)g.rect(cx-4,shY-1,9,6);else{g.moveTo(cx-shW,shY-1);g.lineTo(cx+shW,shY-1);g.lineTo(cx+waW+.5,shY+6);g.quadraticCurveTo(cx,shY+8,cx-waW-.5,shY+6);g.closePath()}},cx-2,shY+1.5,3,1.5)});
 if(p.kimono&&down)clip(()=>{g.strokeStyle=p.kimono;g.lineWidth=1.4;g.beginPath();g.moveTo(cx-3,shY);g.lineTo(cx+1.5,shY+6);g.moveTo(cx+3,shY);g.lineTo(cx,shY+3.5);g.stroke()});
 if(p.collar&&down){poly([[cx-3,shY-.5],[cx+3,shY-.5],[cx,shY+3]],p.collar)}
 /* belt */
 const by=hipY-2.2;if(p.belt)clip(()=>{R(cx-shW-1,by,shW*2+2,2.2,p.belt);R(cx-shW-1,by,shW*2+2,.7,LTc(p.belt));if(down){R(cx-1.2,by-.2,2.4,2.6,p.buckle||'#e8c050');R(cx-.6,by+.4,1.2,1.4,DKc(p.buckle||'#e8c050'))}if(side){R(cx+1,by-.2,2.4,2.6,p.buckle||'#e8c050')}});
 /* apron */
 if(p.apron&&!up){const ay=shY+3,ae=longR?GY-6:hipY+legL-3;if(side)poly([[cx+2,ay+1],[cx+4.3,ay+1],[cx+5.5+sw*.5,ae],[cx+2.5+sw*.5,ae]],p.apron);else{poly([[cx-waW+1,ay],[cx+waW-1,ay],[cx+waW+.8,ae],[cx,ae+.8,cx-waW-.8,ae]],p.apron,cx-waW+2,ay+4,1.2,4);g.strokeStyle=p.apron;g.lineWidth=1.1;g.beginPath();g.moveTo(cx-waW+1.5,ay);g.lineTo(cx-shW+2.5,shY+.3);g.moveTo(cx+waW-1.5,ay);g.lineTo(cx+shW-2.5,shY+.3);g.stroke();g.strokeStyle=DKc(p.apron);g.lineWidth=.6;g.beginPath();g.moveTo(cx-2,ay+4);g.lineTo(cx-2.5,ae-1);g.moveTo(cx+2.2,ay+5);g.lineTo(cx+2.8,ae-1);g.stroke()}}
 if(p.apron&&up)clip(()=>{R(cx-shW,by-.5,shW*2,1.5,p.apron);R(cx-1,by-1.5,2,3,p.apron)});
 /* shawl / scarf */
 if(p.shawl){if(up)poly([[cx-shW-1.5,shY-1],[cx+shW+1.5,shY-1],[cx+shW,shY+5],[cx,shY+9],[cx-shW,shY+5]],p.shawl);else if(side)poly([[cx-5,shY-1],[cx+4.5,shY-1],[cx+5,shY+4],[cx-5.5,shY+5]],p.shawl);else{poly([[cx-shW-1.5,shY-.5],[cx+shW+1.5,shY-.5],[cx+shW+.5,shY+4],[cx,shY+8.5],[cx-shW-.5,shY+4]],p.shawl,cx-shW+1,shY+1.5,2,1.5);g.strokeStyle=DKc(p.shawl);g.lineWidth=.5;for(let i=-3;i<=3;i++){g.beginPath();g.moveTo(cx+i*2,shY+3.5-Math.abs(i)*.3);g.lineTo(cx+i*1.6,shY+5.5+(3-Math.abs(i))*.8);g.stroke()}}}
 if(p.scarf){if(side){cap(cx-4.5,shY,cx+4,shY,3.8,p.scarf);cap(cx-4,shY+1,cx-8-sw*1.5,shY+6,2.8,DKc(p.scarf))}else if(up){cap(cx-shW+1,shY,cx+shW-1,shY,3.8,p.scarf);cap(cx+1,shY+1,cx+2+sw,shY+9,3,DKc(p.scarf))}else{cap(cx-shW+1.2,shY+.2,cx+shW-1.2,shY+.2,4,p.scarf);cap(cx+3,shY+1.5,cx+4+sw*.5,shY+8,3,p.scarf);R(cx+2.6+sw*.5,shY+7.4,2.8,.8,LTc(p.scarf))}}
 /* ---------- near arms ---------- */
 const handC=skin;
 if(side){const hx=cx+.5+sw*3.5;cap(cx+.5,shY+1.5,hx,shY+armL,aw,sleeve);if(p.rolled)cap(cx+.5+sw*1.5,shY+4.5,hx,shY+armL,aw-.6,skin);if(p.armor){ell(cx+.5,shY+1.5,3.2,2.4);g.fillStyle=p.armor;g.fill()}ell(hx,shY+armL+.9,1.9,1.9);g.fillStyle=handC;g.fill()}
 else{const la=-sw*1.4,ra=sw*1.4,ax=shW-.4;
  for(const[s,a]of[[-1,la],[1,ra]]){const x1=cx+s*ax,x2=cx+s*(ax+1.2);cap(x1,shY+1.8,x2,shY+armL+a,aw,up&&p.coat?p.coat:sleeve);if(p.rolled)cap(x1+s*.3,shY+4.5,x2,shY+armL+a,aw-.7,skin);
   if(p.armor){const f=()=>ell(x1,shY+1.2,3.4,2.5);cel(p.armor,f,x1-1,shY+.4,1.5,.8)}ell(x2,shY+armL+a+1,2,2);g.fillStyle=handC;g.fill()}}
 /* ---------- held items ---------- */
 const itemF=()=>{const it=p.item,hx=side?cx+.5+sw*3.5:cx+shW+.8,hy=shY+armL+1+(side?0:sw*1.4);
  if(it==='cane'){cap(hx+.5,hy-1,hx+1.5,GY-1,1.4,'#7a5230');cap(hx-1,hy-1.5,hx+1.5,hy-1.5,1.8,'#9a6a3a')}
  else if(it==='staff'){cap(hx+.5,hcY-4,hx+1,GY-1,1.5,'#8a5a2a');ell(hx+.5,hcY-6,2.4,2.4);g.fillStyle=p.gem||'#7ae0ff';g.fill();ell(hx-.2,hcY-6.8,.8,.8);g.fillStyle='#fff';g.fill();g.strokeStyle='#d0a040';g.lineWidth=.8;g.beginPath();g.arc(hx+.5,hcY-6,3.2,.3,2.8);g.stroke()}
  else if(it==='spear'){cap(hx+.5,hcY-9,hx+.8,GY-1,1.4,'#8a6a40');poly([[hx+.6,hcY-15],[hx+2.3,hcY-10],[hx-1.1,hcY-10]],'#e0e6f4')}
  else if(it==='sword'&&side){cap(cx-3,hipY-2,cx-9,hipY+7,1.8,'#a8b0c4');R(cx-3.6,hipY-3.5,1.2,3,'#d0a040')}
  else if(it==='dagger'&&!up){cap(cx+(side?2:shW-1.5),by+1,cx+(side?6:shW+1),by+4,1.2,'#d0d4e0');R(cx+(side?1.5:shW-2.5),by,2,1.5,'#7a2a2a')}
  else if(it==='tray'&&down){R(hx-2,hy-3,9,1.2,'#7a5030');cel('#9a6a3a',()=>{g.beginPath();g.rect(hx-1,hy-7,3,4)});cel('#9a6a3a',()=>{g.beginPath();g.rect(hx+3,hy-7,3,4)});R(hx-1,hy-7.5,3,1.2,'#fbf6e8');R(hx+3,hy-7.5,3,1.2,'#fbf6e8')}
  else if(it==='basket'&&down){cel('#a8784a',()=>{g.beginPath();g.moveTo(cx-3,hipY-3);g.lineTo(cx+3,hipY-3);g.lineTo(cx+2.4,hipY+1);g.lineTo(cx-2.4,hipY+1);g.closePath()});g.strokeStyle='#8a5a30';g.lineWidth=.8;g.beginPath();g.arc(cx,hipY-3,2.6,Math.PI,0);g.stroke();for(const[x,c]of[[-1.8,'#f0e070'],[0,'#7aa0e0'],[1.8,'#f0f0f0'],[.9,'#e88aa0']]){ell(cx+x,hipY-3.6,1,1);g.fillStyle=c;g.fill()}}
  else if(it==='book'&&down){cel('#6a3a24',()=>{g.beginPath();g.rect(hx-1.5,hy-4.5,4,5)});R(hx+2,hy-4,.6,4,'#e8dcc0')}
  else if(it==='bow'&&side){g.strokeStyle='#8a5a2a';g.lineWidth=1.4;g.beginPath();g.arc(cx-12,shY+6,10,-.5,.5);g.stroke()}};
 if(up)backW();
 if(up)itemF();
 /* ---------- head ---------- */
 const neck=()=>{g.beginPath();g.rect(cx-1.6,hcY+headR-2,3.2,shY-(hcY+headR-2)+1)};cel(skin,neck);
 const headF=side?()=>{g.beginPath();g.ellipse(cx,hcY,headR*.95,headR,0,0,7);g.moveTo(cx+headR*.95,hcY);g.quadraticCurveTo(cx+headR*.95,hcY+headR*.95,cx+2,hcY+headR*1.05);g.lineTo(cx-3,hcY+headR*.8)}
  :()=>{g.beginPath();g.ellipse(cx,hcY-.5,headR,headR*.92,0,Math.PI,0);g.quadraticCurveTo(cx+headR,hcY+headR*.75,cx,hcY+headR*1.02);g.quadraticCurveTo(cx-headR,hcY+headR*.75,cx-headR,hcY-.5)};
 cel(skin,headF,cx-4,hcY+3,3,2);
 /* ears */
 if(!up){if(side){ell(cx-2.5,hcY+2,1.6,2.2);g.fillStyle=DKc(skin);g.fill()}else{for(const s of[-1,1]){ell(cx+s*(headR-.2),hcY+2.5,1.4,2);g.fillStyle=s<0?skin:DKc(skin);g.fill()}}}
 /* face */
 const fem=p.fem,blush=fem||kid;
 const eyeDraw=(ex,ey,s)=>{if(old&&!p.glasses){g.strokeStyle=DK2c(skin);g.lineWidth=.9;g.beginPath();g.moveTo(ex-1.6,ey+.6);g.quadraticCurveTo(ex,ey+1.6,ex+1.6,ey+.6);g.stroke();return}
  const ew=(fem||kid)?1.55:1.35,eh=(fem||kid)?2.5:2.2;ell(ex,ey+.2,ew,eh);g.fillStyle=DK2c(eye);g.fill();ell(ex,ey+.8,ew*.8,eh*.6);g.fillStyle=eye;g.fill();ell(ex-.45*s-.2,ey-.5,.7,.75);g.fillStyle='#fff';g.fill();
  g.strokeStyle='#160e1e';g.lineWidth=fem?1.2:1;g.beginPath();g.moveTo(ex-ew-.5,ey-eh*.6);g.quadraticCurveTo(ex,ey-eh-.6,ex+ew+.5,ey-eh*.6);g.stroke()};
 if(down){const ey=hcY+4.1;eyeDraw(cx-4.2,ey,-1);eyeDraw(cx+4.2,ey,1);
  g.strokeStyle=DKc(hair);g.lineWidth=.8;g.beginPath();g.moveTo(cx-6,ey-3.4);g.lineTo(cx-2.6,ey-3.6);g.moveTo(cx+6,ey-3.4);g.lineTo(cx+2.6,ey-3.6);g.stroke();
  if(blush){ell(cx-6.2,ey+2.4,1.5,.7);g.fillStyle='rgba(240,120,130,.55)';g.fill();ell(cx+6.2,ey+2.4,1.5,.7);g.fill()}
  R(cx-.4,ey+2.2,.9,.8,dmix(skin,'#b0584a',.4));
  g.strokeStyle=p.smile?'#9a3a3a':DK2c(skin);g.lineWidth=.8;g.beginPath();if(p.smile){g.moveTo(cx-1.4,ey+3.7);g.quadraticCurveTo(cx,ey+4.9,cx+1.4,ey+3.7)}else{g.moveTo(cx-1,ey+4.1);g.lineTo(cx+1,ey+4.1)}g.stroke();
  if(p.glasses){g.strokeStyle='#c8a050';g.lineWidth=.8;for(const s of[-1,1]){g.beginPath();g.arc(cx+s*4.2,ey,2.6,0,7);g.stroke()}g.beginPath();g.moveTo(cx-1.6,ey);g.lineTo(cx+1.6,ey);g.stroke();for(const s of[-1,1]){ell(cx+s*4.2,ey+.4,.8,.5);g.fillStyle='#2a1e2a';g.fill()}}
 }else if(side){const ey=hcY+3.8;eyeDraw(cx+5.6,ey,1);g.strokeStyle=DKc(hair);g.lineWidth=.8;g.beginPath();g.moveTo(cx+3.6,ey-3.7);g.lineTo(cx+7,ey-3.5);g.stroke();
  if(blush){ell(cx+5,ey+3,1.6,.8);g.fillStyle='rgba(240,120,130,.55)';g.fill()}R(cx+8.6,ey+1.8,1,1.2,DKc(skin));g.strokeStyle=p.smile?'#9a3a3a':DK2c(skin);g.lineWidth=.8;g.beginPath();g.moveTo(cx+5.5,ey+4.8);g.lineTo(cx+7.5,ey+4.6);g.stroke();
  if(p.glasses){g.strokeStyle='#c8a050';g.lineWidth=.8;g.beginPath();g.arc(cx+5.2,ey,2.6,0,7);g.moveTo(cx+2.6,ey);g.lineTo(cx-2,ey+.5);g.stroke()}}
 /* beard */
 if(p.beard&&!up){const bc=p.beardc||hair;if(p.beard==='long'){if(side)poly([[cx+1,hcY+4],[cx+8,hcY+5],[cx+5+sw*.5,shY+9],[cx+1,shY+4]],bc,cx+3,hcY+8,1.2,3);else{poly([[cx-6.5,hcY+3],[cx-2,hcY+6.5],[cx+2,hcY+6.5],[cx+6.5,hcY+3],[cx+5,shY+4],[cx,shY+11,cx-5,shY+4]],bc,cx-3,shY+1,1.5,4);g.strokeStyle=DKc(bc);g.lineWidth=.5;for(const k of[-2,0,2]){g.beginPath();g.moveTo(cx+k,hcY+8);g.lineTo(cx+k*1.2,shY+7);g.stroke()}poly([[cx-3,hcY+5.4],[cx+3,hcY+5.4],[cx+2,hcY+6.4],[cx-2,hcY+6.4]],LTc(bc))}}
  else{if(side)poly([[cx+1,hcY+3.5],[cx+8.5,hcY+6],[cx+6,hcY+9.5],[cx+1,hcY+8.5]],bc);else{g.save();headF();g.clip();g.fillStyle=bc;g.beginPath();g.moveTo(cx-headR,hcY+2);g.lineTo(cx-headR+2.2,hcY+2);g.quadraticCurveTo(cx-4,hcY+8.6,cx,hcY+8.2);g.quadraticCurveTo(cx+4,hcY+8.6,cx+headR-2.2,hcY+2);g.lineTo(cx+headR,hcY+2);g.lineTo(cx+headR,hcY+12);g.lineTo(cx-headR,hcY+12);g.closePath();g.fill();g.restore();g.strokeStyle='#8a3a3a';g.lineWidth=.8;g.beginPath();g.moveTo(cx-1.2,hcY+7.6);g.lineTo(cx+1.2,hcY+7.6);g.stroke()}}}
 /* ---------- hair ---------- */
 const H1=hair,HL=LTc(hair),HD=DKc(hair);
 const strands=(arr,col)=>{for(const s of arr){g.beginPath();g.moveTo(s[0],s[1]);g.quadraticCurveTo(s[2],s[3],s[4],s[5]);g.quadraticCurveTo(s[6],s[7],s[8],s[9]);g.closePath();g.fillStyle=col;g.fill()}};
 if(hs==='bald'&&!up){g.save();headF();g.clip();ell(cx-3,hcY-6,3,1.6);g.fillStyle=LTc(skin);g.fill();g.restore();if(!p.hat){for(const s of[-1,1])poly([[cx+s*(headR+.6),hcY-2],[cx+s*(headR-2.2),hcY-1],[cx+s*(headR-2.4),hcY+4],[cx+s*(headR+.4),hcY+4]],H1)}}
 else if(up){const f=()=>{g.beginPath();g.ellipse(cx,hcY-.5,headR+1,headR+.6,0,Math.PI,0);g.lineTo(cx+headR+1,hcY+4);g.quadraticCurveTo(cx,hcY+headR+2.5,cx-headR-1,hcY+4);g.closePath()};
  cel(H1,f,cx-3,hcY-6,4,2.5);g.strokeStyle=HD;g.lineWidth=.6;for(const k of[-5,-1.5,2,5.5]){g.beginPath();g.moveTo(cx+k*.4,hcY-8);g.quadraticCurveTo(cx+k,hcY,cx+k*1.1,hcY+6);g.stroke()}
  if(hs==='long'||hs==='wavy')poly([[cx-headR-1,hcY+2],[cx+headR+1,hcY+2],[cx+headR,shY+9],[cx,shY+11,cx-headR,shY+9]],H1,cx-5,shY+2,2,5);
  if(hs==='braids')for(const s of[-1,1]){for(let i=0;i<4;i++){ell(cx+s*5,hcY+8+i*2.6,2,1.6);g.fillStyle=i&1?HD:H1;g.fill()}R(cx+s*5-1.5,hcY+18,3,1.2,p.ribbon||'#3a5ab8')}
  if(hs==='pony'){cap(cx,hcY-1,cx+sw*.6,hcY+12,4.5,H1);R(cx-1.8,hcY-1,3.6,1.4,p.ribbon||'#c83a3a')}
  if(hs==='bun'){cel(H1,()=>ell(cx,hcY-headR-1,3.6,3),cx-1,hcY-headR-2,1.5,1)}
  if(hs==='spiky'||hs==='messy'){strands([[cx-9,hcY-4,cx-12,hcY-5,cx-12.5,hcY-2,cx-11,hcY,cx-8,hcY+1],[cx+9,hcY-4,cx+12,hcY-5,cx+12.5,hcY-2,cx+11,hcY,cx+8,hcY+1],[cx-4,hcY-9,cx-5,hcY-13,cx-2,hcY-14,cx,hcY-12,cx+1,hcY-9],[cx+3,hcY-9,cx+4,hcY-13,cx+7,hcY-13,cx+7,hcY-10,cx+7,hcY-7]],H1)}}
 else{
  // top cap
  const capF=side?()=>{g.beginPath();g.ellipse(cx-.5,hcY-1.5,headR+.8,headR*.82,0,Math.PI*.9,Math.PI*2.05);g.lineTo(cx+headR-.5,hcY);g.quadraticCurveTo(cx+4,hcY-3,cx+2,hcY+1);g.lineTo(cx-2,hcY+4);g.quadraticCurveTo(cx-4,hcY+8,cx-headR-.6,hcY+6);g.closePath()}
   :()=>{g.beginPath();g.ellipse(cx,hcY-1.2,headR+1,headR*.85,0,Math.PI,0);g.lineTo(cx+headR+1,hcY+1.5);g.lineTo(cx-headR-1,hcY+1.5);g.closePath()};
  cel(H1,capF,cx-3.5,hcY-6.5,4.5,2.4);
  if(!side){// bangs
   const bang=hs==='spiky'||hs==='messy'?[[-9,1.6],[-6.5,2.4],[-3.5,1.4],[-1,2.6],[2,1.6],[5,2.4],[8,1.4]]:[[-8.5,2],[-6,2.6],[-2.5,2.2],[0,1.2],[3,2.4],[6,2.6],[8.6,2]];
   g.fillStyle=H1;g.beginPath();g.moveTo(cx-headR-1,hcY-1);for(const[x,y]of bang){g.lineTo(cx+x-1.2,hcY-.5);g.lineTo(cx+x,hcY+y)}g.lineTo(cx+headR+1,hcY-1);g.lineTo(cx+headR+1,hcY-3);g.lineTo(cx-headR-1,hcY-3);g.closePath();g.fill();
   g.strokeStyle=HD;g.lineWidth=.55;for(const[x,y]of bang){g.beginPath();g.moveTo(cx+x*.8,hcY-4);g.lineTo(cx+x,hcY+y-.6);g.stroke()}
   g.strokeStyle=HL;g.lineWidth=.9;g.beginPath();g.moveTo(cx-6,hcY-6);g.quadraticCurveTo(cx-2,hcY-8.4,cx+3,hcY-7.6);g.stroke();
   // side locks
   const sl=hs==='short'||hs==='spiky'||hs==='messy'?5:7;for(const s of[-1,1])poly([[cx+s*(headR+1.2),hcY-2],[cx+s*(headR-2.5),hcY-1],[cx+s*(headR-1.6),hcY+sl],[cx+s*(headR+.3),hcY+sl+.8]],s<0?H1:HD);
  }else{const bang=[[2,1.5],[4.5,2.2],[7,1.2],[9.5,.2]];g.fillStyle=H1;g.beginPath();g.moveTo(cx,hcY-2);for(const[x,y]of bang){g.lineTo(cx+x-1.2,hcY-1);g.lineTo(cx+x,hcY+y)}g.lineTo(cx+headR,hcY-3);g.closePath();g.fill();g.strokeStyle=HL;g.lineWidth=.9;g.beginPath();g.moveTo(cx-5,hcY-6);g.quadraticCurveTo(cx,hcY-8.6,cx+5,hcY-7);g.stroke()}
  if(hs==='spiky'){const sp=side?[[cx-9,hcY-3,-5],[cx-7,hcY-7,-4],[cx-3,hcY-9.5,-2],[cx+2,hcY-10,1],[cx+6,hcY-8,4]]:[[cx-10,hcY-2,-5],[cx-7.5,hcY-7,-4],[cx-3,hcY-9.6,-1.5],[cx+2,hcY-9.6,1.5],[cx+7,hcY-7.5,4],[cx+10,hcY-2.5,5]];
   for(const[x,y,k]of sp){g.beginPath();g.moveTo(x-2.2,y+2);g.quadraticCurveTo(x+k*.3,y-2,x+k,y-3.2);g.quadraticCurveTo(x+k*.3,y+.5,x+2.2,y+2);g.closePath();g.fillStyle=H1;g.fill();g.strokeStyle=HL;g.lineWidth=.5;g.beginPath();g.moveTo(x-.5,y+1);g.lineTo(x+k*.7,y-2.2);g.stroke()}}
  if(hs==='messy'){for(const[x,y,k]of side?[[cx-8,hcY-5,-3],[cx-2,hcY-9,-1],[cx+4,hcY-8,2]]:[[cx-8,hcY-6,-3],[cx-3,hcY-9,-2],[cx+2,hcY-9.4,1],[cx+7,hcY-6,3]]){g.beginPath();g.moveTo(x-2,y+2);g.quadraticCurveTo(x+k,y-1,x+k*1.2,y-2.4);g.quadraticCurveTo(x+k*.4,y+.6,x+2,y+2);g.closePath();g.fillStyle=H1;g.fill()}}
  if(hs==='long'||hs==='wavy'){if(side)poly([[cx-9.5,hcY-1],[cx-2,hcY+2],[cx-3,shY+6],[cx-9,shY+7]],H1,cx-7,hcY+4,1.5,4);else for(const s of[-1,1])poly([[cx+s*(headR+1.3),hcY-2],[cx+s*(headR-2.2),hcY],[cx+s*(headR-2.4),shY+3],[cx+s*(headR+1.4+(hs==='wavy'?1:0)),shY+7]],s<0?H1:HD,cx+s*headR,hcY+5,1,3)}
  if(hs==='braids'){if(side){for(let i=0;i<5;i++){ell(cx-6,hcY+6+i*2.4,2,1.5);g.fillStyle=i&1?HD:H1;g.fill()}R(cx-7.5,hcY+17.5,3,1.2,p.ribbon||'#3a5ab8')}else for(const s of[-1,1]){for(let i=0;i<5;i++){ell(cx+s*(headR-.2),hcY+5+i*2.4,2,1.5);g.fillStyle=i&1?HD:H1;g.fill()}ell(cx+s*(headR-.2),hcY+17.2,1.8,1);g.fillStyle=p.ribbon||'#3a5ab8';g.fill()}}
  if(hs==='bun'){cel(H1,()=>ell(side?cx-6:cx,side?hcY-7:hcY-headR-.8,3.6,3),cx-1,hcY-headR-2,1.5,1)}
  if(hs==='pony'){const rx=side?cx-8:cx+7.5,ry=side?hcY-3:hcY-6;ell(rx,ry,1.6,1.2);g.fillStyle=p.ribbon||'#c83a3a';g.fill()}
 }
 /* ---------- hats ---------- */
 const hc=p.hatc||'#888';
 switch(p.hat){
 case 'hood':{const f=up?()=>{g.beginPath();g.ellipse(cx,hcY,headR+2.2,headR+2.2,0,Math.PI,0);g.lineTo(cx+headR+3,shY+3);g.lineTo(cx-headR-3,shY+3);g.closePath()}:side?()=>{g.beginPath();g.ellipse(cx-.5,hcY-.5,headR+2,headR+1.6,0,Math.PI*.95,Math.PI*1.95);g.quadraticCurveTo(cx+7,hcY+1,cx+3,hcY+3);g.quadraticCurveTo(cx+1,hcY+9,cx+3,shY+2);g.lineTo(cx-7,shY+3);g.quadraticCurveTo(cx-headR-3,hcY+6,cx-headR-1.6,hcY);g.closePath()}
   :()=>{g.beginPath();g.ellipse(cx,hcY-.8,headR+2,headR+1.4,0,Math.PI,0);g.lineTo(cx+headR+2.5,shY+3);g.lineTo(cx+headR-2,shY+3);g.quadraticCurveTo(cx+headR-1.4,hcY-3,cx,hcY-4.5);g.quadraticCurveTo(cx-headR+1.4,hcY-3,cx-headR+2,shY+3);g.lineTo(cx-headR-2.5,shY+3);g.closePath()};
  cel(hc,f,cx-5,hcY-7,3,2);break}
 case 'kerchief':{const f=up?()=>{g.beginPath();g.ellipse(cx,hcY-1.4,headR+1.4,headR*.9,0,Math.PI,0);g.lineTo(cx+headR+1,hcY+3);g.lineTo(cx-headR-1,hcY+3);g.closePath()}:side?()=>{g.beginPath();g.ellipse(cx-.5,hcY-2,headR+1.2,headR*.78,0,Math.PI,0);g.lineTo(cx+headR,hcY-1.5);g.lineTo(cx-headR-1,hcY-1);g.closePath()}:()=>{g.beginPath();g.ellipse(cx,hcY-2,headR+1.3,headR*.8,0,Math.PI,0);g.quadraticCurveTo(cx,hcY-3.4,cx-headR-1.3,hcY-2);g.closePath()};
  cel(hc,f,cx-4,hcY-7.5,3.5,1.6);if(!up){ell(side?cx-9:cx+headR+.5,side?hcY-1:hcY-1.5,1.8,1.4);g.fillStyle=DKc(hc);g.fill()}break}
 case 'helm':{const m=p.armor||'#c8ccd8',f=()=>{g.beginPath();g.ellipse(cx,hcY-1,headR+1.6,headR+.4,0,Math.PI,0);g.lineTo(cx+headR+1.6,hcY+(up?5:2));g.lineTo(cx-headR-1.6,hcY+(up?5:2));g.closePath()};cel(m,f,cx-4,hcY-7,3.2,1.6);
  if(!up&&!side){R(cx-headR-1.6,hcY+.6,2.4,5,DKc(m));R(cx+headR-.8,hcY+.6,2.4,5,DKc(m));R(cx-headR-1.6,hcY+.3,headR*2+3.2,1,LTc(m))}
  cap(cx-1,hcY-headR-1,cx+2.5,hcY-headR-4.5,3,'#d43a32');cap(cx+2.5,hcY-headR-4.5,cx+5.5,hcY-headR-3,2.4,'#b02a2a');break}
 case 'crown':{const y=hcY-headR+1.4;poly([[cx-6,y+2],[cx-6.5,y-2.5],[cx-3.2,y],[cx,y-3.6],[cx+3.2,y],[cx+6.5,y-2.5],[cx+6,y+2]],'#e8c040',cx-3,y,2,1);ell(cx,y+.3,1,1);g.fillStyle='#d0303a';g.fill();break}
 case 'tiara':if(!up){g.strokeStyle='#f0d040';g.lineWidth=.9;g.beginPath();g.arc(cx,hcY+4,headR-1.2,Math.PI*1.2,Math.PI*1.8);g.stroke();ell(cx,hcY-headR+3.8,1.1,1.1);g.fillStyle='#7ae8ff';g.fill()}break;
 case 'beret':{const f=()=>{g.beginPath();g.ellipse(cx+1,hcY-headR+2.2,headR+1.4,4,-.12,0,7)};cel(hc,f,cx-3,hcY-headR+.5,3,1.2);ell(cx+headR-1,hcY-headR-1,1.6,1.4);g.fillStyle='#f4f4f4';g.fill();break}
 case 'cap':{const f=()=>{g.beginPath();g.ellipse(cx,hcY-1.6,headR+1.2,headR*.75,0,Math.PI,0);g.closePath()};cel(hc,f,cx-3,hcY-7,3,1.4);if(!up)R(side?cx+2:cx-headR,hcY-2,side?9:headR*2,1.4,DKc(hc));break}
 case 'band':{g.strokeStyle='#d43a32';g.lineWidth=2;g.beginPath();if(side){g.moveTo(cx-headR-.5,hcY-2.5);g.lineTo(cx+headR,hcY-3.2);g.stroke();cap(cx-headR,hcY-2.5,cx-headR-5+sw,hcY+1.5,1.5,'#d43a32')}else{g.moveTo(cx-headR-1,hcY-2.6);g.quadraticCurveTo(cx,hcY-4,cx+headR+1,hcY-2.6);g.stroke()}break}
 }
 /* front items */
 if(!up)itemF();
 /* ---------- downsample to pixel ---------- */
 const sm=document.createElement('canvas');sm.width=W;sm.height=H;const sg=sm.getContext('2d');sg.imageSmoothingEnabled=true;sg.imageSmoothingQuality='high';
 if(dir==='left'){sg.translate(W,0);sg.scale(-1,1)}sg.drawImage(cv,0,0,W,H);sg.setTransform(1,0,0,1,0,0);
 const id=sg.getImageData(0,0,W,H),a=id.data;
 for(let i=0;i<a.length;i+=4){const al=a[i+3];if(al<120){a[i+3]=0;continue}const k=255/al;a[i]=Math.min(255,a[i]*k)&0xfc;a[i+1]=Math.min(255,a[i+1]*k)&0xfc;a[i+2]=Math.min(255,a[i+2]*k)&0xfc;a[i+3]=255}
 const src=new Uint8ClampedArray(a);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;if(src[i+3])continue;let best=-1,lum=999;
  for(const[dx,dy]of[[0,1],[0,-1],[1,0],[-1,0]]){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=W||yy>=H)continue;const j=(yy*W+xx)*4;if(src[j+3]){const l=src[j]+src[j+1]+src[j+2];if(l<lum){lum=l;best=j}}}
  if(best>=0){a[i]=src[best]*.3+10;a[i+1]=src[best+1]*.25+6;a[i+2]=src[best+2]*.32+16;a[i+3]=255}}
 sg.putImageData(id,0,0);
 return DOT3[key]=sm;
}
/* ---- Blender製スプライトシート (img/spr/<id>.png: 行=下,左,右,上 / 列=4コマ) ---- */
const BSPS={},BSPC={};
function sprCell(id,dir,fr){let im=BSPS[id];if(!im){im=BSPS[id]=new Image();im.src='img/spr/'+id+'.png'}if(!im.complete||!im.naturalWidth)return null;
 const k=id+dir+fr;if(BSPC[k])return BSPC[k];const r={down:0,left:1,right:2,up:3}[dir]||0,c=document.createElement('canvas');c.width=48;c.height=52;c.getContext('2d').drawImage(im,fr*48,r*52,48,52,0,0,48,52);return BSPC[k]=c}
['allen','gard','sion','stella','fio','shino'].forEach(id=>{const im=BSPS[id]=new Image();im.src='img/spr/'+id+'.png'});
const DSPS={},DSPC={};
function demonCell(id,fr){let im=DSPS[id];if(!im){im=DSPS[id]=new Image();im.src='img/spr/d_'+id+'.png'}if(!im.complete||!im.naturalWidth)return null;
 const k=id+fr;if(DSPC[k])return DSPC[k];const cw=im.naturalWidth/2,c=document.createElement('canvas');c.width=cw;c.height=im.naturalHeight;c.getContext('2d').drawImage(im,fr*cw,0,cw,im.naturalHeight,0,0,cw,im.naturalHeight);return DSPC[k]=c}

/* ================= 装備品 ================= */
const EQT={allen:{w:'sword',a:['light','heavy']},gard:{w:'axe',a:['heavy','light']},sion:{w:'rod',a:['robe']},stella:{w:'staff',a:['robe']},fio:{w:'bow',a:['light']},shino:{w:'katana',a:['light']},xenon:{w:'sword',a:['light','heavy']}};
const WTN={sword:'剣',axe:'斧',rod:'ロッド',staff:'杖',bow:'弓',katana:'刀',heavy:'重鎧',light:'軽装',robe:'ローブ',acc:'アクセサリ'};
const EQUIP={};
(()=>{const P_=[120,650,1900,4800,11000];
 const W={sword:['ブロンズソード','アイアンソード','ミスリルソード','聖騎士の剣','星光剣アストラリス'],axe:['ハンドアクス','バトルアクス','グレートアクス','竜殺しの斧','紅蓮斧ヴォルカン'],rod:['樫のロッド','魔導士のロッド','ルーンロッド','翠玉のロッド','賢者のロッド'],staff:['木の杖','癒しの杖','聖なる杖','星詠みの杖','天輪の杖'],bow:['ショートボウ','ロングボウ','エルフの弓','疾風の弓','天弓ゼピュロス'],katana:['無銘刀','打刀','業物・菊一文字','妖刀村雨','妖刀・夜叉丸']};
 const WS={sword:[[8],[16],[26],[38],[52]],axe:[[10],[19],[30],[43],[58]],bow:[[8],[16],[26],[38],[52]],katana:[[9],[17],[28],[41],[55]]};
 for(const t in W)W[t].forEach((n,i)=>{const id=t+(i+1),b={};if(t==='rod'){b.mag=[8,16,26,38,52][i];b.mp=[0,5,10,15,25][i]}else if(t==='staff'){b.mag=[5,10,17,26,36][i];b.spr=[5,10,16,24,34][i]}else b.atk=WS[t][i][0];if(t==='axe')b.def=[0,1,2,4,6][i];if(t==='katana')b.spr=[0,1,2,3,5][i];
  EQUIP[id]={n,slot:'wpn',t,tier:i+1,b,price:P_[i]}});
 const A={heavy:['鉄の鎧','鋼の鎧','ミスリルの鎧','聖騎士の鎧','竜鱗の鎧'],light:['革の服','ブリガンダイン','銀の胸当て','疾風の装束','星影の衣'],robe:['布のローブ','魔導士のローブ','賢者のローブ','光のローブ','星詠みの法衣']};
 for(const t in A)A[t].forEach((n,i)=>{const id=t+(i+1),b={};if(t==='heavy'){b.def=[10,18,28,40,54][i];b.hp=[20,40,70,110,160][i]}else if(t==='light'){b.def=[6,11,18,27,37][i];b.spr=[0,2,4,8,12][i];b.hp=[0,10,25,40,60][i]}else{b.def=[3,6,10,15,22][i];b.spr=[4,9,15,22,32][i];b.mp=[0,10,20,30,45][i]}
  EQUIP[id]={n,slot:'arm',t,tier:i+1,b,price:Math.round(P_[i]*.85)}});
 [['ring_atk','力の指輪',1,{atk:6},450],['ring_def','守りの腕輪',1,{def:6},450],['ring_mag','魔力の指輪',2,{mag:7},1000],['rosary','祈りのロザリオ',2,{spr:9},1000],['pendant','命のペンダント',3,{hp:70},1800],['earring','精霊のイヤリング',3,{mp:20,mag:5},2000],['hero','勇者の証',4,{atk:12,def:8},4500],['amulet','星の護符',5,{atk:6,def:6,mag:6,spr:6,hp:50},9500]]
  .forEach(([id,n,tier,b,price])=>EQUIP[id]={n,slot:'acc',t:'acc',tier,b,price});
})();
const SLOTN={wpn:'武器',arm:'防具',acc:'アクセサリ'},STN={hp:'HP',mp:'MP',atk:'攻撃',def:'防御',mag:'魔力',spr:'精神'};
const eqDesc=id=>{const e=EQUIP[id];return Object.entries(e.b).map(([k,v])=>`${STN[k]}+${v}`).join(' ')};
function eqOf(u){P.eq=P.eq||{};P.eqInv=P.eqInv||{};let e=P.eq[u.uid];if(!e){const t=EQT[u.id]||{w:'sword',a:['light']};e=P.eq[u.uid]={wpn:t.w+'1',arm:t.a[0]+'1',acc:null}}return e}
function eqBonus(u){const e=eqOf(u),o={};for(const s of['wpn','arm','acc']){const it=EQUIP[e[s]];if(!it)continue;for(const k in it.b)o[k]=(o[k]||0)+it.b[k]}return o}
function canEq(u,id){const it=EQUIP[id];if(!it)return false;if(it.slot==='acc')return true;const t=EQT[u.id]||{w:'sword',a:['light']};return it.slot==='wpn'?it.t===t.w:t.a.includes(it.t)}
function eqTier(){return Math.min(5,1+Math.floor(curChapter()*.72))}
function addEq(id,n=1){P.eqInv=P.eqInv||{};P.eqInv[id]=(P.eqInv[id]||0)+n}
function setEq(u,slot,id){const e=eqOf(u);const old=e[slot];if(old)addEq(old,1);if(id){P.eqInv[id]--;if(P.eqInv[id]<=0)delete P.eqInv[id]}e[slot]=id||null;
 const s=ustat(u),st=curSt(u);if(st){st.hp=Math.min(st.hp,s.hp);st.mp=Math.min(st.mp,s.mp)}save()}
const eqIc=id=>{const e=EQUIP[id];return e?({sword:'⚔',axe:'🪓',rod:'🪄',staff:'✦',bow:'🏹',katana:'🗡',heavy:'🛡',light:'🥋',robe:'👘',acc:'💍'}[e.t]):''};
let eqSel=null,eqSlot=null;
function renderEqTab(){const uid=eqSel&&P.party.includes(eqSel)?eqSel:P.party[0];eqSel=uid;const u=uById(uid),e=eqOf(u),s=ustat(u);
 let h=`<div class="eqp">${P.party.map(id=>{const x=uById(id);return `<button data-eu="${id}" class="${id===uid?'on':''}"><img src="img/face_${x.id}.webp" alt=""><b>${UNITS[x.id].name}</b></button>`}).join('')}</div>`;
 h+=`<div class="eqst">${['hp','mp','atk','def','mag','spr'].map(k=>`<span>${STN[k]}<b>${s[k]}</b></span>`).join('')}</div>`;
 h+=['wpn','arm','acc'].map(sl=>`<button class="op eqs ${eqSlot===sl?'on':''}" data-es="${sl}"><span><small style="color:#9ab">${SLOTN[sl]}</small>${e[sl]?`${eqIc(e[sl])} ${EQUIP[e[sl]].n}<small>${eqDesc(e[sl])}</small>`:'<span style="color:#678">― なし ―</span>'}</span><em>変更 ›</em></button>`).join('');
 if(eqSlot){const cands=Object.keys(P.eqInv||{}).filter(id=>P.eqInv[id]>0&&EQUIP[id].slot===eqSlot&&canEq(u,id));
  const diff=id=>{const cur=e[eqSlot]?EQUIP[e[eqSlot]].b:{},nb=id?EQUIP[id].b:{},ks=new Set([...Object.keys(cur),...Object.keys(nb)]);return [...ks].map(k=>{const d=(nb[k]||0)-(cur[k]||0);return d?`<span class="eqd ${d>0?'eqU':'eqN'}">${STN[k]}${d>0?'+':''}${d}</span>`:''}).join(' ')};
  h+=`<div class="eql"><p>${SLOTN[eqSlot]}を選んでください</p>`+(cands.map(id=>`<button class="op" data-eq="${id}"><span>${eqIc(id)} ${EQUIP[id].n}<small>${diff(id)}</small></span><em>×${P.eqInv[id]}</em></button>`).join('')||'<p style="color:#9ab;font-size:12px">装備できるものを持っていない。町の武器・防具屋で買えます。</p>')+(e[eqSlot]?`<button class="op" data-eq=""><span>はずす<small>${diff(null)}</small></span></button>`:'')+'</div>'}
 return h}
function bindEqTab(el){el.querySelectorAll('[data-eu]').forEach(b=>b.onclick=()=>{SFX.cur();eqSel=+b.dataset.eu;eqSlot=null;renderFMenu()});
 el.querySelectorAll('[data-es]').forEach(b=>b.onclick=()=>{SFX.cur();eqSlot=eqSlot===b.dataset.es?null:b.dataset.es;renderFMenu()});
 el.querySelectorAll('[data-eq]').forEach(b=>b.onclick=()=>{const u=uById(eqSel);setEq(u,eqSlot,b.dataset.eq||null);SFX.ok();eqSlot=null;renderFMenu();updDpan&&updDpan()})}
/* ---- 武器・防具屋 ---- */
let eqShopMode='buy';
function showEqShop(){const el=$('#shop');el.style.display='block';eqShopMode='buy';renderEqShop()}
function renderEqShop(){const el=$('#shop'),tier=eqTier();const party=P.party.map(uById);
 const who=id=>party.filter(u=>canEq(u,id)).map(u=>`<img src="img/face_${u.id}.webp" alt="" title="${UNITS[u.id].name}">`).join('');
 let h=`<div class="bk"><h2 style="margin:0">武器・防具屋</h2><span style="font-weight:800;color:#ffe08a">${fmt(P.gil)} G</span><button class="btn" id="shB">もどる</button></div><div class="tabs"><button data-m="buy" class="${eqShopMode==='buy'?'on':''}">買う</button><button data-m="sell" class="${eqShopMode==='sell'?'on':''}">売る</button></div>`;
 if(eqShopMode==='buy'){const ids=Object.keys(EQUIP).filter(id=>EQUIP[id].tier<=tier&&EQUIP[id].tier>=Math.max(1,tier-1)&&!(EQUIP[id].tier===5&&EQUIP[id].slot!=='acc')).sort((a,b)=>({wpn:0,arm:1,acc:2}[EQUIP[a].slot]-{wpn:0,arm:1,acc:2}[EQUIP[b].slot])||EQUIP[a].tier-EQUIP[b].tier);
  h+=ids.map(id=>{const it=EQUIP[id];return `<div class="shop eqrow"><div class="eic">${eqIc(id)}</div><div class="nm">${it.n}<small>${WTN[it.t]}　${eqDesc(id)}</small><span class="who">${who(id)||'<em>装備できる仲間がいない</em>'}</span></div><div class="hv">所持 ${(P.eqInv||{})[id]||0}</div><button class="btn g" data-b="${id}" ${P.gil<it.price?'disabled':''}>${fmt(it.price)} G</button></div>`}).join('')}
 else{const ids=Object.keys(P.eqInv||{}).filter(id=>P.eqInv[id]>0);h+=ids.map(id=>`<div class="shop eqrow"><div class="eic">${eqIc(id)}</div><div class="nm">${EQUIP[id].n}<small>${eqDesc(id)}</small></div><div class="hv">×${P.eqInv[id]}</div><button class="btn" data-s="${id}">${fmt(Math.floor(EQUIP[id].price/2))} G</button></div>`).join('')||'<p style="color:#9ab;padding:10px">売れるものがない（装備中のものは売れません）</p>'}
 el.innerHTML=h;$('#shB').onclick=()=>{SFX.cur();el.style.display='none';if(D)D.busy=false;updTop&&updTop()};
 el.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{SFX.cur();eqShopMode=b.dataset.m;renderEqShop()});
 el.querySelectorAll('[data-b]').forEach(b=>b.onclick=async()=>{const id=b.dataset.b,it=EQUIP[id];if(P.gil<it.price){SFX.ng&&SFX.ng();return}P.gil-=it.price;addEq(id);SFX.coin();save();
  const fit=party.filter(u=>canEq(u,id));let msg=`${it.n}を買った！`;
  if(fit.length){const c=await modal(`<h3>${it.n}</h3><p style="text-align:center">今すぐ装備しますか？</p>`,[...fit.map(u=>({l:UNITS[u.id].name+(eqOf(u)[it.slot]?`（${EQUIP[eqOf(u)[it.slot]].n}）`:'')})),{l:'あとで',c:'g'}]);if(c>=0&&c<fit.length){setEq(fit[c],it.slot,id);msg=`${UNITS[fit[c].id].name}は${it.n}を装備した！`}}
  toast(msg);renderEqShop()});
 el.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{const id=b.dataset.s;P.eqInv[id]--;if(P.eqInv[id]<=0)delete P.eqInv[id];P.gil+=Math.floor(EQUIP[id].price/2);SFX.coin();save();renderEqShop()})}
/* ---- ダンジョンの宝箱に装備を入れる ---- */
for(const id in EQUIP){const b=EQUIP[id].b;for(const k in b)if(!b[k])delete b[k]}
const DLOOT_EQ=[['ring_atk','light2'],['sword3','rosary'],['pendant','axe3'],['earring','heavy4'],['hero','bow4'],['katana4','robe4'],['amulet','crown']];
/* ---- 追加装備（各系統の別ライン） ---- */
(()=>{const P_=[120,650,1900,4800,11000],B={
 sword:[['レイピア',{atk:7,spr:3}],['ブロードソード',{atk:14,hp:20}],['ルーンブレイド',{atk:22,mag:8}],['ディフェンダー',{atk:32,def:8}],['聖剣エクスカリバー',{atk:46,spr:10,hp:40}]],
 axe:[['トマホーク',{atk:9,hp:15}],['ウォーハンマー',{atk:17,def:3}],['ミスリルハンマー',{atk:27,def:5,hp:30}],['巨人のハンマー',{atk:40,hp:80}],['雷槌ミョルニル',{atk:54,def:4,mag:8}]],
 rod:[['氷のロッド',{mag:7,spr:3}],['雷のロッド',{mag:14,spr:6}],['闇のロッド',{mag:24,mp:15}],['星屑のロッド',{mag:35,spr:10,mp:10}],['アルカナロッド',{mag:48,spr:12,mp:20}]],
 staff:[['僧侶の杖',{mag:3,spr:7,hp:10}],['祈りの杖',{mag:7,spr:12,hp:20}],['月光の杖',{mag:14,spr:20,mp:10}],['世界樹の杖',{mag:22,spr:28,hp:50}],['女神の杖',{mag:32,spr:40,mp:20}]],
 bow:[['狩人の弓',{atk:7,spr:2}],['クロスボウ',{atk:17}],['銀の弓',{atk:24,spr:5}],['月の弓',{atk:35,mag:8,spr:6}],['星弓アルテミス',{atk:48,spr:10,hp:40}]],
 katana:[['脇差',{atk:8,spr:2}],['長船',{atk:15,spr:4}],['正宗',{atk:27,spr:4,hp:20}],['虎徹',{atk:40,def:4}],['天叢雲剣',{atk:52,spr:8,mag:6}]],
 heavy:[['チェインメイル',{def:8,hp:35}],['騎士の鎧',{def:16,hp:55,spr:2}],['黄金の鎧',{def:25,hp:90,spr:4}],['金剛の鎧',{def:44,hp:80}],['源氏の鎧',{def:50,hp:180,spr:6}]],
 light:[['旅人の服',{def:5,spr:2,hp:10}],['忍び装束',{def:9,spr:6}],['ミスリルベスト',{def:16,spr:6,hp:40}],['黒装束',{def:24,spr:12,hp:30}],['天女の羽衣',{def:32,spr:18,hp:70,mp:15}]],
 robe:[['絹のローブ',{def:4,spr:3,hp:15}],['白のローブ',{def:7,spr:8,hp:25}],['黒のローブ',{def:9,spr:12,mag:6,mp:15}],['精霊のローブ',{def:14,spr:20,mp:40}],['天の法衣',{def:20,spr:28,mag:8,mp:50}]]};
 const AR={heavy:1,light:1,robe:1};
 for(const t in B)B[t].forEach(([n,b],i)=>{EQUIP[t+'b'+(i+1)]={n,slot:AR[t]?'arm':'wpn',t,tier:i+1,b,price:Math.round(P_[i]*(AR[t]?.85:1)*1.1)}});
 [['hairpin','銀の髪飾り',1,{spr:5,mp:10},500],['gloves','革の手袋',1,{atk:4,def:3},480],['beads','魔除けの数珠',2,{spr:6,def:4},1100],['bangle','剛力の腕輪',2,{atk:9},1100],['glasses','賢者の眼鏡',3,{mag:9,mp:15},2100],['shieldc','金剛のお守り',3,{def:12},2000],['fang','竜の牙',4,{atk:16},4800],['feather','天使の羽',4,{spr:14,hp:60},4800],['crown','王者の冠',5,{atk:10,def:10,hp:80},10000],['tiara','星詠みのティアラ',5,{mag:14,spr:14,mp:40},10000]]
  .forEach(([id,n,tier,b,price])=>EQUIP[id]={n,slot:'acc',t:'acc',tier,b,price});
})();
const DLOOT_EQ2=['staffb2','katanab3','rodb3','heavyb4','robeb4','lightb4','bowb4'];

/* ===== 乗り物（船・飛空艇） ===== */
const VEHN={ship:'船',air:'飛空艇「アストラル号」'};
function vehSpot(kind){const m=genWorld(),w=m.w,h=m.h;
 if(kind==='ship'){const t=WLOC.find(l=>l.k==='town'&&l.id===0);let best=null,bd=1e9;for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const i=y*w+x;if(m.K[i]!==4)continue;let land=false;for(const[dx,dy]of DXY){const j=(y+dy)*w+x+dx;if(!m.g[j]&&m.CI[j]===0)land=true}if(!land)continue;const d=Math.abs(x-t.x)*.6+Math.abs(y-t.y)*2.2+(x<t.x?20:0);if(d<bd){bd=d;best={x,y}}}return best}
 const t=WLOC.find(l=>l.k==='town'&&l.id===2);for(let r=2;r<8;r++)for(let j=-r;j<=r;j++)for(let q=-r;q<=r;q++){const x=t.x+q,y=t.y+j,i=y*w+x;if(x<1||y<1||x>=w-1||y>=h-1)continue;if(!m.g[i]&&m.L[i]<0&&m.K[i]!==1)return{x,y}}return{x:t.x+2,y:t.y+2}}
async function vehEvents(){P.veh=P.veh||{};const ls=[];
 if(chapClear(1)&&!P.veh.ship){P.veh.ship=vehSpot('ship');ls.push(['N','王様の計らいで、王都の東の浜に船が用意された！'],['allen','これで海を渡れる。東の港町マリナへ向かおう！'],['N','船に近づくと乗りこめます。陸に向かって進むと船を降ります。'])}
 if(chapClear(5)&&!P.veh.air){P.veh.air=vehSpot('air');ls.push(['N','聖都の古文書に記された飛空艇「アストラル号」が、長い眠りから目覚めた！'],['stella','南の海に浮かぶ孤島……切り立った山に囲まれたあの島へは、空からしか行けません。'],['N','飛空艇に近づくと乗りこめます。空の上では「着陸」ボタンで降ります。'])}
 if(ls.length){save();D.busy=true;await talk(ls);D.busy=false}}
function vehBoard(k){D.veh=k;P.vehOn=k;const v=P.veh[k];D.ax=v.x+.5;D.ay=v.y+.5;D.x=v.x;D.y=v.y;SFX.ok();toast((k==='air'?'飛空艇':'船')+'に乗った！');updCtl();save()}
function vehOff(x,y){const k=D.veh;P.veh[k]={x:D.x,y:D.y};D.veh=null;P.vehOn=null;D.ax=x+.5;D.ay=y+.5;D.x=x;D.y=y;P.wpos=[x,y];D.enc=rnd(12,20);SFX.cur();toast((k==='air'?'飛空艇':'船')+'を降りた');updCtl();save()}
function vehLand(){if(!D||!D.world||!D.veh)return;const m=D.m,i=D.y*m.w+D.x;
 if(D.veh==='air'){if(m.g[i]||m.L[i]>=0){SFX.ng();toast('ここには着陸できない（草原や道の上に降りられます）');return}vehOff(D.x,D.y);return}
 for(const[dx,dy]of DXY){const x=D.x+dx,y=D.y+dy,j=y*m.w+x;if(x>=0&&y>=0&&x<m.w&&y<m.h&&!m.g[j]){vehOff(x,y);return}}SFX.ng();toast('近くに降りられる陸地がない')}
function vehShipBump(x,z){const m=D.m;if(time<(D.bcool||0))return;for(const[ox,oz]of[[0,0],[-PR,-PR],[PR,-PR],[-PR,PR],[PR,PR]]){const cx=Math.floor(x+ox),cy=Math.floor(z+oz);if(cx<0||cy<0||cx>=m.w||cy>=m.h)continue;const j=cy*m.w+cx;if(!m.g[j]){D.bcool=time+.4;vehOff(cx,cy);return}}}
function vehWalkBump(x,z){const v=P.veh&&P.veh.ship;if(!v||time<(D.bcool||0))return false;for(const[ox,oz]of[[0,0],[-PR,-PR],[PR,-PR],[-PR,PR],[PR,PR]]){if(Math.floor(x+ox)===v.x&&Math.floor(z+oz)===v.y){D.bcool=time+.4;vehBoard('ship');return true}}return false}
/* ---- 見た目 ---- */
const VSP={};function vehImg(k){let im=VSP[k];if(!im){im=VSP[k]=new Image();im.src='img/spr/v_'+k+'.png'}return im.complete&&im.naturalWidth?im:null}
const VSPC={};function vehCell(k,dir,fr){const im=vehImg(k);if(!im)return null;const key=k+dir+fr;if(VSPC[key])return VSPC[key];const cw=im.naturalWidth/4,chh=im.naturalHeight/4,r={down:0,left:1,right:2,up:3}[dir]||0,c=document.createElement('canvas');c.width=cw;c.height=chh;c.getContext('2d').drawImage(im,fr*cw,r*chh,cw,chh,0,0,cw,chh);return VSPC[key]=c}
function vehChars(chars){if(!D||!D.world||!P.veh)return;const wd=D.wdir||0,dn=wd==='R'?'right':wd==='L'?'left':wd===2?'up':'down',fr=Math.floor(time*4)%4;
 for(const k of['ship','air']){const v=P.veh[k];if(!v)continue;const on=D.veh===k;const c=vehCell(k,on?dn:'down',on||k==='air'?fr:0);if(!c)continue;
  chars.push({k:(on?D.ay:v.y+.5)+(k==='air'?.6:0),x:on?D.ax:v.x+.5,img:c,hgt:k==='air'?3.1:2.5,smooth:false,bob:k==='air'?.55+Math.sin(time*2)*.05:0,pl:on?1:0})}}
/* ===== 隠し装備（最高ランクの武器・防具） ===== */
const HIDDEN=[
 {k:'t0',x:1,y:1,id:'sword5'},{k:'t0',x:20,y:1,id:'heavy5'},
 {k:'t1',x:1,y:1,id:'bow5'},{k:'t1',x:16,y:1,id:'light5'},{k:'t1',x:20,y:9,id:'axeb5'},
 {k:'t2',x:1,y:1,id:'staff5'},{k:'t2',x:20,y:1,id:'robe5'},{k:'t2',x:1,y:26,id:'staffb5'},{k:'t2',x:20,y:26,id:'rod5'},
 {k:'w',x:15,y:18,id:'swordb5'},{k:'w',x:30,y:25,id:'axe5'},{k:'w',x:73,y:26,id:'katana5'},{k:'w',x:75,y:34,id:'katanab5'},
 {k:'w',x:55,y:21,id:'bowb5'},{k:'w',x:58,y:24,id:'heavyb5'},{k:'w',x:10,y:46,id:'lightb5'},{k:'w',x:32,y:24,id:'rodb5'},{k:'w',x:40,y:52,id:'robeb5'}];
const HID_CH=4; // 第5章から出現
let HIDC=null;
function hidCanvas(){if(HIDC)return HIDC;const c=document.createElement('canvas');c.width=64;c.height=64;HIDC=c;return c}
function hidDraw(a){const g=HIDC.getContext('2d');g.clearRect(0,0,64,64);g.save();g.translate(32,40);g.globalAlpha=a;
 const r=g.createRadialGradient(0,0,0,0,0,22);r.addColorStop(0,'rgba(255,250,200,.95)');r.addColorStop(1,'rgba(255,220,120,0)');g.fillStyle=r;g.beginPath();g.arc(0,0,22,0,7);g.fill();
 g.fillStyle='#fff';g.beginPath();for(let i=0;i<8;i++){const ang=i*Math.PI/4,R=i%2?4:16;g.lineTo(Math.cos(ang)*R,Math.sin(ang)*R)}g.closePath();g.fill();g.restore()}
function hidKey(){return D.world?'w':D.town?D.tkey:null}
function hidList(){const k=hidKey();if(!k||curChapter()<HID_CH)return[];P.hid=P.hid||{};return HIDDEN.filter(h=>h.k===k&&!P.hid[h.id])}
function hidExtras(){const L=hidList();if(!L.length)return undefined;hidCanvas();
 const ex=[];for(const h of L){const d=Math.hypot(D.ax-(h.x+.5),D.ay-(h.y+.5));if(d>3.2)continue;hidDraw(Math.min(1,(3.2-d)/1.6)*(.55+.45*Math.sin(time*5+h.x)));ex.push({k:999,top:1,x:h.x+.5,py:h.y+.55,img:HIDC,hgt:.55,smooth:true})}
 return ex.length?ex:undefined}
async function hidCheck(){if(!D||D.busy||(D.world&&D.veh))return;for(const h of hidList()){if(Math.hypot(D.ax-(h.x+.5),D.ay-(h.y+.5))<.6){D.busy=true;dStop();P.hid[h.id]=1;addEq(h.id);SFX.lvl();save();
  await modal(`<h3>✦ 伝説の武具を見つけた！</h3><p style="text-align:center;font-size:16px">${eqIc(h.id)} <b>${EQUIP[h.id].n}</b><br><small>${WTN[EQUIP[h.id].t]}　${eqDesc(h.id)}</small></p><p style="text-align:center;font-size:13px;opacity:.8">メニューの「そうび」で装備できます</p>`,[{l:'OK',c:'g'}]);D.busy=false;return}}}
{const _t=drawTown2D,_w=drawWorld2D;
 drawTown2D=function(){const ex=hidExtras();if(!ex)return _t();hidCheck();draw2D(TBG[D.tkey],8.2,ex)};
 drawWorld2D=function(){const ex=hidExtras();if(!ex)return _w();hidCheck();draw2D(TBG.w,9.6,ex)}}

/* ================= FLOW ================= */
let last=performance.now();
function loop(t){const dt=Math.min(.05,(t-last)/1000);last=t;time+=dt;ctx.setTransform(RS,0,0,RS,0,0);ctx.imageSmoothingEnabled=false;
 try{if(scene==='battle'&&B){updateBattle(dt);if(B)drawBattle()}else if(scene==='dungeon'){updateDungeon(dt);drawDungeon()}else if(scene==='town')drawTown();else if(scene==='title')drawTitle()}catch(err){console.error(err)}
 requestAnimationFrame(loop)}
setInterval(()=>{if(P&&scene!=='title'){updTop()}},1000);
if(!load())newPlayer();else if(!P.units.some(u=>u.id==='stella')){const a=P.units[0];const u=addUnit('stella',a?a.lv:1);if(P.party.length<6)P.party.push(u.uid);save()}for(const id of[...Object.keys(UNITS),...PILLARS.map(p=>p.id)])art(id);['t0','c0','w','d0'].forEach(loadTownBG);['slime','bat','goblin','wolf','bat2','imp','hound','skeleton','bslime','crab','wraith','gargoyle','dknight'].forEach(monArt);
setMode('title');resize();sresize();requestAnimationFrame(loop);
}
