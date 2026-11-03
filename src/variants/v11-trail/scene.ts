// @ts-nocheck — port of Hayk's "Overtaken" hiking artifact. The valley and shader
// are kept as written so the look matches the original; the sights along the trail
// (houses, waterfalls, critters) and keyboard control are additions.

/** Live options, read every frame: `mode` picks the thought style (1–5). */
export interface TrailOptions {
  mode: 1 | 2 | 3 | 4 | 5
  /** style 5 renders the thought in the page; called whenever it changes (null = none) */
  onThought?: (text: string | null) => void
}

/**
 * Mounts the hiking scene into `stage` (which holds the two canvases) and
 * returns a cleanup that stops the loop and detaches every listener.
 */
export function mountTrail(
  el: HTMLElement,
  cv: HTMLCanvasElement,
  ui: HTMLCanvasElement,
  reduced: boolean,
  opts: TrailOptions,
): () => void {
const DPR=Math.min(window.devicePixelRatio||1,1.5);
const REDUCED=reduced;
/* fixed look: valley at softness 49, people at softness 20, grain 37 everywhere */
const SOFT_BG=.49,SOFT_FG=.20,GRAIN=.37;

/* ---------- helpers ---------- */
const lerp=(a,b,t)=>a+(b-a)*t, clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const fr=x=>x-Math.floor(x), h1=n=>fr(Math.sin(n*127.1+311.7)*43758.5453);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const hex=c=>{const n=parseInt(c.slice(1),16);return[(n>>16)&255,(n>>8)&255,n&255]};
const rgba=(c,a)=>{const[r,g,b]=hex(c);return`rgba(${r},${g},${b},${a})`};
const FILTER=(()=>{const c=document.createElement('canvas').getContext('2d');if(!('filter' in c))return false;c.filter='blur(2px)';return c.filter==='blur(2px)'})();
function sprite(w,h,blur,fn){
  const pad=Math.ceil(blur*3)+2,cw=Math.ceil((w+pad*2)*DPR),ch=Math.ceil((h+pad*2)*DPR);
  const sharp=document.createElement('canvas');sharp.width=cw;sharp.height=ch;
  const s=sharp.getContext('2d');s.setTransform(DPR,0,0,DPR,pad*DPR,pad*DPR);fn(s);
  if(blur<=0||!FILTER)return{c:sharp,w,h,pad};
  const out=document.createElement('canvas');out.width=cw;out.height=ch;const o=out.getContext('2d');o.filter=`blur(${blur*DPR}px)`;o.drawImage(sharp,0,0);
  return{c:out,w,h,pad};
}
function put(ctx,sp,x,y,a=1){if(!sp)return;ctx.globalAlpha=a;ctx.drawImage(sp.c,x-sp.pad,y-sp.pad,sp.w+sp.pad*2,sp.h+sp.pad*2);ctx.globalAlpha=1}

/* soft toy figure, 40×100 box */
const HAYK={hair:'#4a2520',skin:'#ecc7a8',sweater:'#8f9192',shorts:'#7a8055',socks:'#a7a6a2',shoes:'#1c1b1b',beard:true};
const HIKERS=[
  {hair:'#c9c3b8',skin:'#efcfb4',sweater:'#e0563c',shorts:'#2f3c5a',socks:'#eeeeee',shoes:'#333333'},
  {hair:'#2a1a12',skin:'#c99a76',sweater:'#2bb3a3',shorts:'#3a3a3a',socks:'#dddddd',shoes:'#222222'},
  {hair:'#e8c66a',skin:'#f2d4bc',sweater:'#3156a6',shorts:'#d9c7a0',socks:'#ffffff',shoes:'#444444'},
  {hair:'#7a4a2a',skin:'#e3b896',sweater:'#f2b544',shorts:'#4a5a3a',socks:'#eeeeee',shoes:'#2a2a2a'},
  {hair:'#1c1c1c',skin:'#b98762',sweater:'#e47aa8',shorts:'#2f2f3a',socks:'#dddddd',shoes:'#1c1c1c'}];
function toy(s,sc,P,pack){
  s.save();s.scale(sc,sc);
  const E=(x,y,rx,ry,c)=>{s.fillStyle=c;s.beginPath();s.ellipse(x,y,rx,ry,0,0,7);s.fill()};
  const R=(x,y,w,h,r,c)=>{s.fillStyle=c;s.beginPath();s.roundRect(x,y,w,h,r);s.fill()};
  if(pack)R(9,36,22,26,6,pack);
  R(11,74,6,18,2,P.skin);R(23,74,6,18,2,P.skin);R(10.5,84,7,8,1,P.socks);R(22.5,84,7,8,1,P.socks);
  E(14,94,7.5,4,P.shoes);E(26,94,7.5,4,P.shoes);R(8,62,24,16,4,P.shorts);
  E(6.5,52,4,11,P.sweater);E(33.5,52,4,11,P.sweater);R(7,38,26,27,7,P.sweater);
  E(6.5,64,2.8,3,P.skin);E(33.5,64,2.8,3,P.skin);
  if(P.beard)R(15.5,49,9,6,1.5,'#1f1f1f');
  E(20,25,15,15,P.skin);if(P.beard){s.globalAlpha=.55;E(20,32,9.5,5.5,'#5c3b2e');s.globalAlpha=1}
  E(20,13,17,10,P.hair);E(8.5,20,5,6.5,P.hair);E(31.5,20,5,6.5,P.hair);
  E(14.5,26,1.9,2.1,'#1a1414');E(25.5,26,1.9,2.1,'#1a1414');s.restore();
}
const toySprite=(hgt,P,pack)=>{const sc=hgt/100;return sprite(40*sc,100*sc,0,s=>toy(s,sc,P,pack))};

/* ---------- sights along the trail: where they sit (p up the trail, side, distance out in
   trail widths) and, through ON[kind], what he says walking past ---------- */
const SIGHTS=[
  {p:.07,kind:'pond',side:1,o:1.2},
  {p:.15,kind:'house',side:-1,o:1.3,roof:'#e0563c',wall:'#fdf6e4'},
  {p:.25,kind:'coyote',side:1,o:.95,col:'#c99a68'},
  {p:.34,kind:'fall',side:-1,o:1.45},
  {p:.45,kind:'house',side:1,o:1.35,roof:'#2c4c9e',wall:'#f4ecd8'},
  {p:.53,kind:'flowers',side:-1,o:1},
  {p:.57,kind:'fly',side:1,o:.85},
  {p:.64,kind:'fall',side:1,o:1.5,rainbow:true},
  {p:.72,kind:'sign',side:-1,o:.72},
  {p:.8,kind:'house',side:-1,o:1.25,roof:'#3f8d62',wall:'#fdf6e4',hut:true},
  {p:.9,kind:'coyote',side:1,o:.9,col:'#a98f74'}];
const BLOOM=['#e47aa8','#f3e23a','#ffffff','#e0563c','#9d7fd1'];
const WINGS=['#e47aa8','#f2b544','#6fe0c4','#3156a6','#e0563c'];
const shade=(s,x,y,rx,ry)=>{s.fillStyle='rgba(43,59,44,.14)';s.beginPath();s.ellipse(x,y,rx,ry,0,0,7);s.fill()};
/* static parts as sprites, w×h with the base on the bottom edge; live parts are drawn per frame */
const PROP={
  house(F,o){const w=F*1.7,h=F*1.7,k=o.hut?.8:1;return sprite(w,h,0,s=>{
    const cx=w/2,by=h-F*.06,bw=F*1.15*k,wh=F*.62*k,ry=by-wh-wh*.95;
    shade(s,cx,by,bw*.65,F*.08);
    s.fillStyle='#7a5a3a';s.fillRect(cx+bw*.18,by-wh-wh*.85,bw*.13,wh*.6);
    s.fillStyle=o.wall;s.beginPath();s.roundRect(cx-bw/2,by-wh,bw,wh,3);s.fill();
    s.fillStyle=s.strokeStyle=o.roof;s.lineJoin='round';s.lineWidth=F*.06;s.beginPath();s.moveTo(cx-bw*.62,by-wh+1);s.lineTo(cx,ry);s.lineTo(cx+bw*.62,by-wh+1);s.closePath();s.fill();s.stroke();
    s.fillStyle='#7a5a3a';s.beginPath();s.roundRect(cx-bw*.1,by-wh*.62,bw*.2,wh*.62,[bw*.1,bw*.1,0,0]);s.fill();
    s.fillStyle='#f3e23a';for(const sx of[-1,1]){s.beginPath();s.roundRect(cx+sx*bw*.3-bw*.08,by-wh*.74,bw*.16,bw*.16,2);s.fill()}
    s.fillStyle='#ffffff';s.beginPath();s.arc(cx,ry+wh*.42,wh*.11,0,7);s.fill();
    if(o.hut){s.fillStyle='#5a4636';s.fillRect(cx-1,ry-F*.36,2,F*.36);s.fillStyle='#e0563c';s.beginPath();s.moveTo(cx+1,ry-F*.36);s.lineTo(cx+1+F*.22,ry-F*.29);s.lineTo(cx+1,ry-F*.22);s.closePath();s.fill()}
    for(let i=0;i<4;i++){s.fillStyle=BLOOM[i%BLOOM.length];s.beginPath();s.arc(cx-bw*.55+i*bw*.12,by-F*.04,F*.035,0,7);s.fill()}
  })},
  fall(F,o){const w=F*2.8,h=F*2.3;return sprite(w,h,0,s=>{
    const cx=w/2,by=h-F*.12,rw=F*2.2,rh=F*1.7,top=by-F*.12-rh;
    shade(s,cx,by,rw*.6,F*.1);
    const g=s.createLinearGradient(cx-rw/2,0,cx+rw/2,0);g.addColorStop(0,'#9db3cc');g.addColorStop(.55,'#7d9fc0');g.addColorStop(1,'#6d6873');s.fillStyle=g;
    bell(s,cx-rw/2,by-F*.12,rw,rh,.5);s.fill();bell(s,cx-rw*.62,by-F*.12,rw*.5,rh*.62,.6);s.fill();
    s.fillStyle='#a6cf5a';s.beginPath();s.ellipse(cx,top+F*.1,rw*.2,F*.12,0,0,7);s.fill();
    s.fillStyle='#c8f5e6';s.beginPath();s.roundRect(cx-rw*.07,top+F*.12,rw*.14,rh-F*.12,rw*.05);s.fill();
    s.fillStyle='#4fa3c9';s.beginPath();s.ellipse(cx,by-F*.08,rw*.46,F*.2,0,0,7);s.fill();
    s.fillStyle='#7fe6cf';s.beginPath();s.ellipse(cx,by-F*.12,rw*.32,F*.1,0,0,7);s.fill();
    if(o.rainbow){s.lineWidth=F*.06;['#e0563c','#f2b544','#f3e23a','#a6cf5a','#4fa3c9','#9d7fd1'].forEach((c,i)=>{s.strokeStyle=rgba(c,.45);s.beginPath();s.arc(cx+rw*.3,by-F*.15,F*(1-i*.06),Math.PI*1.08,Math.PI*1.72);s.stroke()})}
  })},
  pond(F){const w=F*2.3,h=F*.95;return sprite(w,h,0,s=>{
    const cx=w/2,cy=h*.58;
    s.fillStyle='#7fe6cf';s.beginPath();s.ellipse(cx,cy,w*.47,h*.38,0,0,7);s.fill();
    s.fillStyle='#4fa3c9';s.beginPath();s.ellipse(cx,cy+h*.03,w*.42,h*.31,0,0,7);s.fill();
    for(const[x,y,r]of[[.25,.62,.09],[.68,.72,.07],[.78,.5,.06]]){s.fillStyle='#3f8d62';s.beginPath();s.ellipse(w*x,h*y,F*r*1.3,F*r*.7,0,.5,6.6);s.lineTo(w*x,h*y);s.fill()}
    s.fillStyle='#e47aa8';s.beginPath();s.arc(w*.25,h*.6,F*.03,0,7);s.fill();
    s.strokeStyle='#3f8d62';s.lineWidth=1.6;s.lineCap='round';
    for(let i=0;i<4;i++){const x=w*.06+i*F*.06;s.beginPath();s.moveTo(x,cy);s.lineTo(x+(i-1.5)*2,cy-F*(.3+(i%2)*.12));s.stroke()}
    s.fillStyle='#7a5a3a';for(let i=0;i<2;i++){s.beginPath();s.ellipse(w*.06+(i*2+1)*F*.06-1,cy-F*(.34+i*.12),F*.025,F*.06,0,0,7);s.fill()}
  })},
  sign(F){const w=F*1,h=F*1.15;return sprite(w,h,0,s=>{
    const cx=w/2,by=h-F*.06;shade(s,cx,by,F*.2,F*.05);
    s.fillStyle='#7a5a3a';s.fillRect(cx-F*.04,by-F*.85,F*.08,F*.85);
    s.fillStyle='#c49a6c';s.beginPath();s.roundRect(cx-F*.4,by-F*1.05,F*.8,F*.34,F*.06);s.fill();
    s.fillStyle='#5a4636';s.beginPath();s.moveTo(cx-F*.22,by-F*.78);s.lineTo(cx-F*.08,by-F*.98);s.lineTo(cx+F*.04,by-F*.84);s.lineTo(cx+F*.12,by-F*.92);s.lineTo(cx+F*.26,by-F*.78);s.closePath();s.fill();
    s.fillStyle='#e0563c';s.fillRect(cx-F*.09,by-F*1.0,F*.08,F*.05);
    s.fillStyle='#9db3cc';for(const[x,r]of[[-.22,.07],[.2,.05]]){s.beginPath();s.ellipse(cx+F*x,by-F*.02,F*r*1.4,F*r,0,0,7);s.fill()}
  })},
  flowers(F){const w=F*1.5,h=F*.5;return sprite(w,h,0,s=>{
    for(let i=0;i<16;i++){const x=w*(.06+h1(i*3.3)*.88),y=h*(.5+h1(i*7.7)*.42),r=F*(.03+h1(i*1.9)*.025);
      s.strokeStyle='#3f8d62';s.lineWidth=1.2;s.beginPath();s.moveTo(x,y+F*.06);s.lineTo(x,y);s.stroke();
      s.fillStyle=BLOOM[i%BLOOM.length];for(let k=0;k<5;k++){const a=k*1.2566;s.beginPath();s.arc(x+Math.cos(a)*r,y+Math.sin(a)*r,r*.75,0,7);s.fill()}
      s.fillStyle='#f2b544';s.beginPath();s.arc(x,y,r*.55,0,7);s.fill()}
  })},
};
const decorSprite=(F0,i)=>{const F=F0*1.5;return i%4===3
  ?sprite(F*.34,F*.26,0,s=>{for(const[x,k]of[[.3,1],[.7,.75]]){const cx=F*.34*x,by=F*.24,r=F*.08*k;s.fillStyle='#f4ecd8';s.fillRect(cx-r*.3,by-r*1.1,r*.6,r*1.1);s.fillStyle='#e0563c';s.beginPath();s.ellipse(cx,by-r*1.1,r,r*.75,0,Math.PI,0);s.fill();s.fillStyle='#ffffff';s.beginPath();s.arc(cx-r*.35,by-r*1.4,r*.16,0,7);s.arc(cx+r*.3,by-r*1.5,r*.13,0,7);s.fill()}})
  :sprite(F*.36,F*.3,0,s=>{for(let k=0;k<3;k++){const x=F*(.08+k*.1),y=F*(.12+(k%2)*.06),r=F*.028;s.strokeStyle='#3f8d62';s.lineWidth=1.1;s.beginPath();s.moveTo(x,F*.28);s.lineTo(x,y);s.stroke();s.fillStyle=BLOOM[(i+k)%BLOOM.length];s.beginPath();s.arc(x,y,r*1.4,0,7);s.fill();s.fillStyle='#f2b544';s.beginPath();s.arc(x,y,r*.6,0,7);s.fill()}})};
function coyote(c,x,y,F0,dir,g,col){const F=F0*1.6;
  const E=(px,py,rx,ry,cl,rot=0)=>{c.fillStyle=cl;c.beginPath();c.ellipse(px,py,rx,ry,rot,0,7);c.fill()};
  const T=(ax,ay,bx,by,cx,cy,cl)=>{c.fillStyle=cl;c.beginPath();c.moveTo(ax,ay);c.lineTo(bx,by);c.lineTo(cx,cy);c.closePath();c.fill()};
  const dark='#'+[1,3,5].map(i=>Math.round(parseInt(col.slice(i,i+2),16)*.62).toString(16).padStart(2,'0')).join(''),pale='#f1e6d0',sw=Math.sin(g*Math.PI*4)*F*.035;
  c.globalAlpha=.14;E(x,y,F*.2,F*.035,'#2b3b2c');c.globalAlpha=1;y-=Math.abs(Math.sin(g*Math.PI*2))*F*.025;
  c.strokeStyle=dark;c.lineWidth=Math.max(1.5,F*.028);c.lineCap='round';c.beginPath();
  for(const[lx,s]of[[-.11,1],[-.07,-1],[.08,-1],[.12,1]]){c.moveTo(x+dir*F*lx,y-F*.15);c.lineTo(x+dir*F*lx+s*sw,y-F*.005)}c.stroke();
  E(x-dir*F*.24,y-F*.15,F*.1,F*.032,col,dir*.55);E(x-dir*F*.31,y-F*.1,F*.035,F*.022,dark,dir*.55);
  E(x,y-F*.19,F*.16,F*.065,col);E(x+dir*F*.01,y-F*.16,F*.11,F*.03,pale);
  E(x+dir*F*.15,y-F*.25,F*.05,F*.07,col,dir*-.5);E(x+dir*F*.19,y-F*.3,F*.065,F*.05,col);
  E(x+dir*F*.26,y-F*.285,F*.05,F*.022,pale,dir*.15);E(x+dir*F*.305,y-F*.29,F*.014,F*.012,'#1a1414');
  T(x+dir*F*.14,y-F*.32,x+dir*F*.18,y-F*.335,x+dir*F*.15,y-F*.4,dark);T(x+dir*F*.18,y-F*.33,x+dir*F*.22,y-F*.335,x+dir*F*.205,y-F*.405,col);
  E(x+dir*F*.215,y-F*.31,F*.01,F*.011,'#1a1414');
}
function butterfly(c,x,y,F0,flap,col){const F=F0*1.7;
  c.fillStyle=col;for(const sx of[-1,1]){c.beginPath();c.ellipse(x+sx*F*.045*flap,y-F*.015,F*.045*flap,F*.04,0,0,7);c.fill();c.beginPath();c.ellipse(x+sx*F*.032*flap,y+F*.03,F*.03*flap,F*.026,0,0,7);c.fill()}
  c.strokeStyle='#2b3b2c';c.lineWidth=1.4;c.beginPath();c.moveTo(x,y-F*.04);c.lineTo(x,y+F*.045);c.stroke();
}

/* ---------- palette: Ridge colors plus aquamarine; split-tone hills ---------- */
const SETS=[
  ['#2c4c9e','#3f8d62','#a6cf5a'],
  ['#2fae98','#6fe0c4','#c8f5e6'],
  ['#2c4c9e','#4fa3c9','#7fe6cf'],
  ['#3f8d62','#a6cf5a','#e9f08a'],
  ['#7d9fc0','#d9a7bf','#f3d2e0'],
  ['#2a6a4a','#2fae98','#7fe6cf'],
  ['#2fae98','#6fe0c4','#c8f5e6']];
function bell(s,x0,by,w,h,px){const p=w*px;s.beginPath();s.moveTo(x0,by);s.bezierCurveTo(x0+p*.45,by,x0+p*.55,by-h,x0+p,by-h);s.bezierCurveTo(x0+p+(w-p)*.45,by-h,x0+p+(w-p)*.55,by,x0+w,by);s.closePath()}
function splitTone(s,x,by,w,h,C,flip,px){
  if(FILTER)s.filter=`blur(${h*.08}px)`;bell(s,x,by,w,h,px);
  const g=flip?s.createLinearGradient(x+w,by-h,x,by):s.createLinearGradient(x,by-h,x+w,by);
  g.addColorStop(0,C[2]);g.addColorStop(.5,C[1]);g.addColorStop(1,C[0]);s.fillStyle=g;s.fill();
}

/* ---------- thoughts: a storyline keyed to how far up he is, interrupted by what happens
   on the way; each pool plays in order the first time, then shuffles. The peak gets the last word. ---------- */
const STORY=[
  [0,['Oh, I don’t think I like this.','Wait, is it uphill the whole way?','Nobody mentioned a slope in the brief.','Fresh air is overrated.']],
  [.16,['I could be designing right now.','This trail has terrible onboarding.','Zero affordances. Not one handrail.','Who approved this many steps?','One escalator. That’s all I ask.']],
  [.38,['Oh, my smoker lungs.','Is that my heart or a drum solo?','My lungs are typing an apology.','Every step is a breaking change.','I’d trade a kidney for a chairlift.']],
  [.62,['My legs just filed a bug report.','Can I prototype the summit instead?','Somebody rate-limit this mountain.','I’m sweating in sixteen million colors.','Is that flag real or just a mockup?']],
  [.86,['Almost there. Probably. Hopefully.','I can see the flag. It’s mocking me.','If I don’t make it, use an 8pt grid.']]];
const ON={
  pass:['Why is everyone faster than me?','Did that guy just jog past me?','Cool calves. Rude, though.','A grandma just lapped me.','They have poles. That’s cheating.','Show-off.'],
  meet:['Lucky. They’re already going down.','How are you smiling?','Tell my family I tried.'],
  rest:['Oh, my smoker lungs.','I’m not resting, I’m iterating.','Sitting is cardio, right?','Pausing for user research. On a rock.','My knees just unsubscribed.','Is there wifi on this rock?','Respawning…','Buffering. Please hold.'],
  back:['Wait, downhill is so much nicer.','Strategic retreat.','Going back for my dignity.'],
  idle:['Are we done? Can we go home?','Great, now the cursor quit too.','I live here now.'],
  poke:['Okay, okay, I’m going.','Five more minutes. Please.','Don’t poke the designer.','Fine. Up. Ugh.'],
  home:['Downhill. Finally, my sport.','Never again. Write that down.','I was promised pizza.'],
  house:['Is that an Airbnb? Can I check in?','Someone lives up here. On purpose.','I bet that house has a couch.'],
  fall:['A waterfall. Finally, some motion design.','Nice easing on that water.','Even the water knows downhill is better.'],
  coyote:['That coyote has better cardio than me.','Hi, coyote. I’m mostly bones and snacks.','It trots. I trudge. Same trail.'],
  pond:['A pond. I’m not swimming. Don’t ask.','Very calming. Still uphill, though.'],
  flowers:['Okay, the flowers are nice. Don’t tell anyone.','Great palette. Terrible trail.'],
  fly:['A butterfly. Lighter than my backpack.','Even the bugs have wings. Unfair.'],
  sign:['A sign. Finally, some wayfinding.','“Summit, this way.” Wow, very helpful.']};
const PEAK='Ugh, Hayk hates hiking.';
/* back at the start after the walk down */
const FINALE='Enough torture, now look at my projects.';
/* seconds of silence between two lines */
const GAP=1;
/* 24th tokens used on the canvas */
const INK='#161616',MUTED='#666666',PAPER='#fafafa',ACCENT='#1aedc5';
/* thought styles that keep the rain cloud: 1 in-cloud, 4 subtitle, 5 narrator */
const CLOUDED=new Set([1,4,5]);
const MEAS=document.createElement('canvas').getContext('2d');

/* ---------- the scene ---------- */
const scene={
  p:0,t:0,cam:0,v:0,fatigue:0,rest:0,sit:0,cloud:0,done:false,home:false,ring:null,ptr:null,hikers:[],puffs:[],drops:[],next:3,walk:0,
  talk:0,landed:false,line:null,cued:null,cueAt:-99,seen:new Set(),thoughtT:0,dur:0,fade:0,idle:0,idled:false,back:0,wentBack:false,poke:0,hBox:null,cloudBox:null,cScale:1,text:null,said:null,font:'system-ui, sans-serif',track:0,
  props:[],decor:[],flies:[],flock:[],birdT:3,met:new Set(),keys:0,anchor:null,
  /** the stage listens here for moments worth a ripple or a sound */
  fx:null,
  resize(W,H){this.W=W;this.H=H;this.readType();this.build()},
  build(){
    const W=this.W,H=this.H,sd=2.3;
    const WH=this.WH=H*3.4,U=Math.min(W,H*1.1);this.U=U;
    this.cx=y=>W*.5+Math.sin(y/WH*6+sd)*U*.2+Math.sin(y/WH*17+sd*2)*U*.05;
    this.pw=()=>U*.3;
    this.yS=WH-H*.1;this.yT=H*.3;this.figH=H*.1;
    if(!this.ready){this.cam=WH-H;this.ready=true}
    this.cam=clamp(this.cam,0,WH-H);
    const c=document.createElement('canvas');c.width=Math.round(W*DPR);c.height=Math.round(WH*DPR);const s=c.getContext('2d');s.setTransform(DPR,0,0,DPR,0,0);
    const soft=(x,y,r,col,a)=>{const g=s.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,rgba(col,a));g.addColorStop(1,rgba(col,0));s.fillStyle=g;s.fillRect(x-r,y-r,r*2,r*2)};
    // meadow
    const gg=s.createLinearGradient(0,0,0,WH);gg.addColorStop(0,'#dcefd2');gg.addColorStop(.5,'#ecf0bc');gg.addColorStop(1,'#f4ecb0');s.fillStyle=gg;s.fillRect(0,0,W,WH);
    const pc=['#7fe6cf','#a6cf5a','#f3e23a','#9db3cc','#7fe6cf','#bcd95c'],np=Math.round(WH/H*7);
    for(let i=0;i<np;i++)soft(h1(i*3.1)*W,h1(i*5.7)*WH,U*(.35+h1(i*2.2)*.45),pc[i%pc.length],.32);
    // trail, soft at the edges
    const pw=this.pw();s.lineCap='round';s.lineJoin='round';
    const trace=()=>{s.beginPath();for(let y=-60;y<=WH+60;y+=10){const x=this.cx(y);y===-60?s.moveTo(x,y):s.lineTo(x,y)}};
    for(let i=0;i<14;i++){trace();s.strokeStyle=rgba(i<7?'#f4eed8':'#fdfaf0',.15);s.lineWidth=pw*(1.55-i*.085);s.stroke()}
    trace();s.strokeStyle='rgba(255,255,255,.22)';s.lineWidth=pw*.35;s.stroke();
    // split-tone hills in loose rows, packed close, from the trail out past the edges
    const items=[];let k=0;
    for(let by=H*.05;by<WH+H*.2;by+=H*(.085+h1(k*1.9)*.045),k++){
      for(const side of[-1,1]){
        let lo=1e9,hi=-1e9;const hh0=H*.2;for(let y=by-hh0;y<=by;y+=6){lo=Math.min(lo,this.cx(y)-pw*.7);hi=Math.max(hi,this.cx(y)+pw*.7)}
        let edge=side<0?lo-U*h1(k*9.9+side)*.03:hi+U*h1(k*9.9+side)*.03,j=0;
        while(side<0?edge>-U*.3:edge<W+U*.3){
          const w=U*(.24+h1(k*7.1+side+j*3.3)*.22),h=H*(.1+h1(k*4.4+side+j*1.7)*.09);
          const x=side<0?edge-w:edge;
          if(h1(k*3.3+side+j*5.1)>.12)items.push({x,by:by+H*(h1(k+j*2.2+side)-.5)*.04,w,h,C:SETS[Math.floor(h1(k*5.3+side*2+j*1.1)*SETS.length)],flip:h1(k*6.6+j+side)>.5,px:.35+h1(k*8.8+j)*.3});
          const gap=U*(.005+h1(k*2.7+j+side)*.04);edge=side<0?x-gap:x+w+gap;j++;
        }
      }
    }
    /* sights get a clearing: drop any hill that would sit on or behind one */
    const F=this.figH;
    this.props=SIGHTS.map((o,i)=>{const y=this.yw(o.p);return{...o,i,y,x:clamp(this.cx(y)+o.side*pw*o.o,F*.9,W-F*.9),dx:0,hop:-1,next:1+h1(i)*3,dir:-o.side,sp:PROP[o.kind]?.(F,o)}});
    const box=(x,y,hw,h,m)=>({x0:x-hw-m,x1:x+hw+m,y0:y-h-m,y1:y+m});
    const clear=this.props.map(o=>{const hw=o.sp?o.sp.w/2:o.kind==='coyote'?F*2:F*.8,h=o.sp?o.sp.h:F*1.1;return box(o.x,o.y,hw,h,F*.25)});
    const hits=(r,list)=>list.some(c=>r.x0<c.x1&&r.x1>c.x0&&r.y0<c.y1&&r.y1>c.y0);
    const hillBox=it=>({x0:it.x,x1:it.x+it.w,y0:it.by-it.h,y1:it.by+it.h*.06});
    for(let i=items.length-1;i>=0;i--)if(hits(hillBox(items[i]),clear))items.splice(i,1);
    items.sort((a,b)=>a.by-b.by);
    for(const it of items){if(FILTER)s.filter='none';soft(it.x+it.w*.5,it.by+it.h*.03,it.w*.5,'#2b3b2c',.09);splitTone(s,it.x,it.by,it.w,it.h,it.C,it.flip,it.px)}
    if(FILTER)s.filter='none';
    // a small flag where the trail ends
    const fx=this.cx(this.yT)+pw*.08,fy=this.yT;s.fillStyle='#5a4636';s.fillRect(fx,fy-H*.07,2,H*.07);
    s.fillStyle='#e0563c';s.beginPath();s.moveTo(fx+2,fy-H*.07);s.lineTo(fx+2+H*.04,fy-H*.058);s.lineTo(fx+2,fy-H*.046);s.closePath();s.fill();
    this.world=c;
    const hb=items.map(hillBox),ds=[0,1,2,3,4,5,6,7].map(i=>decorSprite(F,i));
    this.decor=Array.from({length:Math.round(WH/H*18)},(_,i)=>{const y=lerp(this.yT,this.yS,h1(i*4.7)),side=h1(i*2.9)>.5?1:-1;return{y,x:this.cx(y)+side*pw*(.62+h1(i*6.1)*.45),sp:ds[i%ds.length]}})
      .filter(d=>{const r=box(d.x,d.y,d.sp.w/2,d.sp.h,2);return!hits(r,clear)&&!hits(r,hb)});
    this.flies=Array.from({length:9},(_,i)=>{const y=lerp(this.yT,this.yS,(i+.5)/9),side=i%2?1:-1;return{y,x:this.cx(y)+side*pw*(.5+h1(i*7.3)*.4),col:WINGS[i%WINGS.length]}});
    this.hk=toySprite(this.figH,HAYK);
    this.hs=HIKERS.map((h,i)=>toySprite(this.figH*(.95+h1(i)*.1),h,i%2?'#3b3b3b':'#7a5a3a'));
    this.cloudS=sprite(this.figH*.9,this.figH*.42,1.2,s=>{const w=this.figH*.9,h=this.figH*.42;s.fillStyle='#6d6873';
      for(const[x,y,r]of[[.28,.62,.26],[.5,.42,.36],[.72,.6,.26],[.5,.72,.3]]){s.beginPath();s.arc(w*x,h*y,h*r*1.25,0,7);s.fill()}});
    if(!this.hikers.length)this.spawn(.05);
  },
  yw(p){return lerp(this.yS,this.yT,p)},
  lane(y,o){return this.cx(y)+this.pw(y)*o},
  spawn(off=0){
    const up=Math.random()<.6;
    const p=up?clamp(this.p-.1-off,0,1):clamp(this.p+.3+off,0,1);
    this.hikers.push({p,dir:up?1:-1,v:up?.034+Math.random()*.014:.022+Math.random()*.01,sp:pick(this.hs),ph:Math.random()*6,lane:up?-.12+(Math.random()-.5)*.04:-.31+(Math.random()-.5)*.03});
  },
  /* difficulty: starts at hiker pace, falls off as I climb */
  speed(a){return lerp(.036,.0075,Math.pow(a,1.35))},
  targetFrom(ry){return(this.yS-(this.cam+ry))/(this.yS-this.yT)},
  move(x,y){this.anchor=null;this.ptr={x,y};if(!this.ring)this.ring={x,y};this.idle=0;this.idled=false},
  /* first unseen line in order, then any line but the one just said */
  /* nothing repeats in one climb: a used-up pool stays quiet */
  from(pool){const fresh=pool.find(l=>!this.seen.has(l));if(fresh)this.seen.add(fresh);return fresh??null},
  /* this stage first, then anything left over from the stages below */
  story(){let s=0;while(s+1<STORY.length&&this.p>=STORY[s+1][0])s++;for(;s>=0;s--){const l=this.from(STORY[s][1]);if(l)return l}return null},
  /* an event line jumps the queue; `now` skips the cooldown so it isn't lost */
  cue(pool,now){if(!now&&(this.cued||this.t-this.cueAt<5))return;this.cued=this.from(pool);this.cueAt=this.t},
  nextThought(){const l=this.cued||(this.home?null:this.story());this.cued=null;if(!l)return;this.line=l;this.thoughtT=0;this.dur=1.5+this.line.length*.045;this.readType()},
  /* follow the site's live font switch (family + tracking, as em) */
  readType(){const cs=getComputedStyle(document.body);this.font=cs.fontFamily||'system-ui, sans-serif';this.track=(parseFloat(cs.letterSpacing)||0)/(parseFloat(cs.fontSize)||16)},
  /* clicking Hayk gets him back on his feet with a fresh complaint */
  nudge(){this.rest=0;this.fatigue=0;this.poke=2.5;this.talk=1;this.cue(ON.poke,true)},
  goHome(){this.home=true;this.line=PEAK;this.dur=this.thoughtT+.3;this.cue(ON.home,true)},
  down(x,y){
    const b=this.hBox;
    if(b&&!this.done&&!this.home&&x>=b.x0&&x<=b.x1&&y>=b.y0&&y<=b.y1){this.nudge();this.ptr={x,y};return}
    this.move(x,y);if(this.done&&!this.home)this.goHome()},
  /* keyboard: hold ↑/↓ to walk, Space/Enter does what a click on him does */
  key(dir){this.keys=dir;this.idle=0;this.idled=false;this.anchor=dir||!this.ring?null:this.yw(this.p)},
  act(){this.idle=0;this.idled=false;if(this.done&&!this.home)this.goHome();else if(!this.home){if(!this.ring){const y=this.yw(this.p)-this.cam;this.ring={x:this.lane(this.yw(this.p),.2),y};this.ptr={...this.ring};this.anchor=this.yw(this.p)}this.nudge()}},
  update(dt){
    this.t+=dt;const a=this.p,prev=this.p;
    if(this.anchor!=null&&this.ring){const y=this.anchor-this.cam;this.ring.y=y;this.ptr={x:this.ring.x,y}}
    if(this.keys){const sy=this.yw(this.p)-this.cam,x=this.lane(this.yw(this.p),.2);this.ptr={x,y:sy-this.keys*this.H*.35};if(!this.ring)this.ring={x,y:sy};this.idle=0}
    if(this.ptr){const f=1-Math.exp(-lerp(18,2,Math.pow(a,1.3))*dt);this.ring.x+=(this.ptr.x-this.ring.x)*f;this.ring.y+=(this.ptr.y-this.ring.y)*f}
    this.rest=Math.max(0,this.rest-dt);
    if(this.home){this.p=Math.max(0,this.p-dt*.14);if(this.p<=0){this.home=false;this.done=false;this.fatigue=0;this.ring=this.ptr=null;this.landed=true}}
    else if(!this.done&&this.ring&&this.rest<=0){
      const tp=clamp(this.targetFrom(this.ring.y),0,1),cap=this.speed(a)*dt;
      this.p=clamp(this.p+clamp(tp-this.p,-cap*1.5,cap),0,1);
      if(this.p>prev&&a>.3){this.fatigue+=dt*(a-.3)*.45;if(this.fatigue>=1){this.fatigue=0;this.rest=1.4+a*3;this.cue(ON.rest,true);this.fx?.('sit')}}
      if(this.p>=.995){this.p=1;this.done=true}
    }
    this.v=(this.p-prev)/Math.max(dt,1e-3);
    const mv=Math.min(1,Math.abs(this.v)/.02);this.walk+=dt*lerp(10,5.5,a)*mv;
    const sitting=this.rest>0||this.done;this.sit+=((sitting?1:0)-this.sit)*Math.min(1,dt*5);
    this.poke=Math.max(0,this.poke-dt);
    /* one second after the cursor starts moving, he narrates on his own, no click needed */
    if(this.ring&&this.talk<1)this.talk+=dt;
    const live=this.talk>=1,peak=this.done&&!this.home;
    this.idle+=dt;this.thoughtT+=dt;
    /* back at the bottom: finish the current line, pause, say the finale, then start over fresh */
    if(this.landed){
      if(this.line!==FINALE&&(!this.line||this.thoughtT>this.dur+GAP)){this.line=FINALE;this.thoughtT=0;this.dur=5}
      else if(this.line===FINALE&&this.thoughtT>this.dur+GAP){this.landed=false;this.talk=0;this.line=this.cued=null;this.seen.clear();this.met.clear()}
    }
    else if(live&&!peak){
      this.back=this.v<-.004?this.back+dt:0;if(this.v>.002)this.wentBack=false;
      if(this.back>.6&&!this.wentBack){this.wentBack=true;this.cue(ON.back)}
      if(this.idle>4&&!this.idled&&this.rest<=0){this.idled=true;this.cue(ON.idle)}
      /* lines always finish, then a pause; interruptions wait their turn. No new line starts if he
         is about to sit down before it could finish, so the rest line comes in clean. */
      const tired=this.rest<=0&&a>.3&&this.v>0&&(1-this.fatigue)/((a-.3)*.45)<4.5;
      if((!this.line||this.thoughtT>this.dur+GAP)&&!tired)this.nextThought();
    }
    /* at the top the last line still finishes and pauses, then the peak line takes over for good */
    else if(peak&&this.line!==PEAK&&(!this.line||this.thoughtT>this.dur+GAP)){this.line=PEAK;this.thoughtT=0;this.dur=1e9}
    if(live&&!peak&&!this.home)for(const o of this.props)if(!this.met.has(o)&&Math.abs(o.p-this.p)<.025){this.met.add(o);this.cue(ON[o.kind],!this.cued)}
    const hy0=this.yw(this.p);
    for(const b of this.props){if(b.kind!=='coyote')continue;
      b.next-=dt;const near=Math.abs(hy0-b.y)<this.figH*1.4;if(!near)b.fled=false;
      if(b.hop<0&&(b.next<=0||near&&!b.fled)){b.hop=0;if(near){b.fled=true;b.dir=b.side}else b.dir=Math.random()<.5?-1:1;b.next=2+Math.random()*4}
      if(b.hop>=0){b.hop+=dt*1.5;b.dx=clamp(b.dx+b.dir*dt*this.figH*1.3,-this.figH*1.3,this.figH*1.3);if(b.hop>=1)b.hop=-1}}
    this.birdT-=dt;if(this.birdT<=0){this.birdT=7+Math.random()*7;this.flock.push({x:-40,y:this.H*(.06+Math.random()*.22),v:45+Math.random()*30,n:3+Math.floor(Math.random()*3),ph:Math.random()*6})}
    for(const f of this.flock)f.x+=f.v*dt;this.flock=this.flock.filter(f=>f.x<this.W+120);
    const wantCloud=peak?1:live||this.poke>0?.85:0;this.cloud+=(wantCloud-this.cloud)*Math.min(1,dt*5);
    this.text=(live||peak)&&this.thoughtT<this.dur?this.line:null;
    this.fade=clamp(this.thoughtT/.25,0,1)*clamp((this.dur-this.thoughtT)/.3,0,1);
    const said=this.cloud>.5?this.text:null;if(said!==this.said){this.said=said;opts.onThought?.(said)}
    const tc=clamp(this.yw(this.p)-this.H*.68,0,this.WH-this.H);this.cam+=(tc-this.cam)*(1-Math.exp(-dt*3));
    this.next-=dt;if(this.next<=0){this.next=5+Math.random()*4;this.spawn()}
    for(const h of this.hikers){
      const was=h.p;h.p+=h.dir*h.v*dt;
      if(live&&!peak&&(was<this.p)!==(h.p<this.p))this.cue(h.dir>0?ON.pass:ON.meet);
    }
    this.hikers=this.hikers.filter(h=>h.p>=0&&h.p<=1&&h.p>this.p-.2&&h.p<this.p+.42);
    if(this.sit>.6&&Math.random()<dt*2)this.puffs.push({x:(Math.random()-.5)*4,y:0,l:1});
    for(const q of this.puffs){q.y-=dt*12;q.x+=dt*6;q.l-=dt*.9}this.puffs=this.puffs.filter(q=>q.l>0);
    if(this.cloud>.6&&(this.done||this.p>.8)&&Math.random()<dt*14)this.drops.push({x:(Math.random()-.5)*this.figH*.6,y:0,l:1});
    for(const d of this.drops){d.y+=dt*this.figH*2.2;d.l-=dt*2}this.drops=this.drops.filter(d=>d.l>0);
  },
  drawBg(ctx,W,H){ctx.drawImage(this.world,0,this.cam*DPR,W*DPR,H*DPR,0,0,W,H)},
  drawFg(ctx,W,H){
    ctx.clearRect(0,0,W,H);const cam=this.cam,a=this.p,F=this.figH,t=this.t;
    const seen=y=>y-cam>-F*3.2&&y-cam<H+F*.5;
    for(const d of this.decor)if(seen(d.y))put(ctx,d.sp,d.x-d.sp.w/2,d.y-cam-d.sp.h);
    const actors=this.hikers.map(h=>({y:this.yw(h.p),h}));const hy=this.yw(this.p);actors.push({y:hy,me:true});
    for(const o of this.props)if(seen(o.y))actors.push({y:o.y,prop:o});
    actors.sort((p,q)=>p.y-q.y);
    for(const o of actors){
      if(o.prop)this.drawProp(ctx,o.prop,o.prop.y-cam,F,t);
      else if(o.me){
        const x=this.lane(hy,.2),sy=hy-cam,mv=Math.min(1,Math.abs(this.v)/.02)*(1-this.sit);
        const bob=Math.abs(Math.sin(this.walk))*lerp(2.6,1.1,a)*mv,sp=this.hk;
        ctx.globalAlpha=.16;ctx.fillStyle='#2b3b2c';ctx.beginPath();ctx.ellipse(x,sy,sp.w*.55,this.figH*.04,0,0,7);ctx.fill();ctx.globalAlpha=1;
        ctx.save();ctx.translate(x,sy-bob);ctx.rotate(Math.sin(this.walk*.5)*.05*mv+this.sit*.04);ctx.scale(1+.08*this.sit,1-.22*this.sit);put(ctx,sp,-sp.w/2,-sp.h);ctx.restore();
        this.hx=x;this.hy=sy-sp.h*(1-.22*this.sit)*.55;
        this.hBox={x0:x-sp.w*.7,x1:x+sp.w*.7,y0:sy-sp.h*1.1,y1:sy+4};
        const cy=sy-sp.h*(1-.22*this.sit)-this.figH*.55+Math.sin(this.t*1.6)*1.5;
        /* the cloud: original size, or (style 1) swollen to hold the thought */
        const cs=this.cloudS;let target=1;
        if(opts.mode===1&&this.text){MEAS.font=`14px ${this.font}`;target=Math.max(1,(MEAS.measureText(this.text).width+40)/(cs.w*.8))}
        this.cScale+=(target-this.cScale)*.15;
        const k=this.cScale,ky=1+(k-1)*.45,cw=cs.w*k,ch=cs.h*ky,top=cy+cs.h-ch,ccx=k>1?clamp(x,W*.15+cw/2,W*.85-cw/2):x;
        this.cloudBox={x:ccx,y:top,w:cw,h:ch};
        if(CLOUDED.has(opts.mode)&&this.cloud>.02){
          ctx.globalAlpha=this.cloud*.9;ctx.drawImage(cs.c,ccx-cw/2-cs.pad*k,top-cs.pad*ky,cw+cs.pad*2*k,ch+cs.pad*2*ky);ctx.globalAlpha=1;
          ctx.strokeStyle=rgba('#7f8fa8',.7);ctx.lineWidth=1.4;ctx.lineCap='round';ctx.beginPath();
          for(const d of this.drops){ctx.moveTo(ccx+d.x*k,top+ch+d.y);ctx.lineTo(ccx+d.x*k-1,top+ch+d.y+5)}ctx.stroke()}
        for(const q of this.puffs){ctx.fillStyle=`rgba(255,255,255,${q.l*.7})`;ctx.beginPath();ctx.arc(x+this.figH*.18+q.x,sy-sp.h*.72+q.y,2.2+(1-q.l)*3,0,7);ctx.fill()}
      }else{
        const h=o.h,x=this.lane(o.y,h.lane),sy=o.y-cam,bob=Math.abs(Math.sin(this.t*10+h.ph))*2.6;
        ctx.globalAlpha=.14;ctx.fillStyle='#2b3b2c';ctx.beginPath();ctx.ellipse(x,sy,h.sp.w*.55,this.figH*.04,0,0,7);ctx.fill();ctx.globalAlpha=1;
        ctx.save();ctx.translate(x,sy-bob);ctx.rotate(Math.sin(this.t*5+h.ph)*.05);put(ctx,h.sp,-h.sp.w/2,-h.sp.h);ctx.restore();
      }
    }
    for(const [i,f] of this.flies.entries())if(seen(f.y)){
      const x=f.x+Math.sin(t*.6+i)*F*.9+Math.sin(t*1.7+i*3)*F*.2,y=f.y-cam-F*.5+Math.cos(t*.45+i*2)*F*.4+Math.sin(t*2.3+i)*F*.1;
      butterfly(ctx,x,y,F,.25+.75*Math.abs(Math.sin(t*13+i)),f.col)}
    ctx.strokeStyle='rgba(43,59,44,.6)';ctx.lineWidth=1.5;ctx.lineCap='round';
    for(const f of this.flock)for(let j=0;j<f.n;j++){
      const bx=f.x-j*16-(j%2)*6,by=f.y+(j%2)*9+j*2,fl=Math.sin(t*9+f.ph+j)*.7;
      ctx.beginPath();ctx.moveTo(bx-7,by-4*fl);ctx.quadraticCurveTo(bx-3,by-1,bx,by);ctx.quadraticCurveTo(bx+3,by-1,bx+7,by-4*fl);ctx.stroke()}
  },
  /* the static sprite, then whatever moves on it: smoke, falling water, ripples, a coyote */
  drawProp(ctx,o,sy,F,t){
    if(o.sp)put(ctx,o.sp,o.x-o.sp.w/2,sy-o.sp.h);
    if(o.kind==='house'){const k=o.hut?.8:1,bw=F*1.15*k,wh=F*.62*k,cx=o.x+bw*.245,cy=sy-F*.06-wh-wh*.85;
      for(let j=0;j<5;j++){const ph=fr(t*.22+j/5);ctx.fillStyle=`rgba(255,255,255,${.6*(1-ph)})`;ctx.beginPath();ctx.arc(cx+Math.sin(ph*5+j)*F*.06+ph*F*.25,cy-ph*F*1.1,F*(.04+ph*.09),0,7);ctx.fill()}}
    else if(o.kind==='fall'){const rw=F*2.2,rh=F*1.7,by=sy-F*.12,top=by-F*.12-rh;
      ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=1.6;ctx.lineCap='round';ctx.beginPath();
      for(let j=0;j<11;j++){const ph=fr(t*1.1+h1(j+o.i*13)),x=o.x+(h1(j*3.7+o.i)-.5)*rw*.11,y=top+F*.15+ph*(rh-F*.3);ctx.moveTo(x,y);ctx.lineTo(x,y+F*.16)}ctx.stroke();
      for(let j=0;j<4;j++){const ph=fr(t*1.8+j*.27);ctx.fillStyle=`rgba(255,255,255,${.8*(1-ph)})`;ctx.beginPath();ctx.arc(o.x+(j-1.5)*F*.1,by-F*.12-ph*F*.16,F*(.03+ph*.03),0,7);ctx.fill()}}
    else if(o.kind==='pond'){const w=F*2.3,cy=sy-F*.95*.42;
      ctx.lineWidth=1.2;for(let j=0;j<3;j++){const ph=fr(t*.3+j/3);ctx.strokeStyle=`rgba(255,255,255,${.7*(1-ph)})`;ctx.beginPath();ctx.ellipse(o.x+(j-1)*w*.18,cy,w*(.04+ph*.14),w*(.015+ph*.05),0,0,7);ctx.stroke()}}
    else if(o.kind==='coyote')coyote(ctx,clamp(o.x+o.dx,F*.5,this.W-F*.5),sy,F,o.dir||1,o.hop>=0?o.hop:0,o.col)
    else if(o.kind==='fly'){for(let j=0;j<2;j++){const x=o.x+Math.sin(t*.9+j*2)*F*.5,y=sy-F*.45+Math.cos(t*.7+j*3)*F*.25;butterfly(ctx,x,y,F,.25+.75*Math.abs(Math.sin(t*14+j)),WINGS[j+1])}}
  },
  /* thoughts are drawn on the crisp UI layer in 24th type; style 5 lives in the page instead */
  drawThought(ctx,W,H){
    const al=clamp((this.cloud-.45)/.35,0,1)*this.fade,text=this.text,m=opts.mode;
    if(al<=0||!text||!this.hBox||m===5)return;
    const type=(size,color)=>{ctx.font=`${size}px ${this.font}`;ctx.letterSpacing=`${this.track*size}px`;ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle'};
    /* paper keyline so type stays legible over the meadow without a container */
    const halo=(s,x,y)=>{ctx.save();ctx.strokeStyle='rgba(250,250,250,.85)';ctx.lineWidth=5;ctx.lineJoin='round';ctx.strokeText(s,x,y);ctx.restore();ctx.fillText(s,x,y)};
    const within=(x,half)=>clamp(x,W*.15+half,W*.85-half);
    ctx.save();ctx.globalAlpha=al;
    if(m===1){ // inside the cloud: paper on rain-grey, compact 14
      const b=this.cloudBox;type(14,PAPER);ctx.fillText(text,b.x,b.y+b.h*.6);
    }else if(m===2){ // no cloud: caption 12 typed out above his head, accent caret
      type(12,MUTED);const n=Math.min(text.length,Math.floor(this.thoughtT*28)),shown=text.slice(0,n);
      const full=ctx.measureText(text).width,x=within(this.hx,full/2+6),y=this.hBox.y0-12;
      ctx.textAlign='left';const x0=x-full/2;halo(shown,x0,y);
      if(n<text.length||Math.sin(this.t*7)>0){ctx.fillStyle=ACCENT;ctx.fillRect(x0+ctx.measureText(shown).width+2,y-7,2,14)}
    }else if(m===3){ // instead of the cloud: an accent mark, secondary 16, pops in
      type(16,INK);const w=ctx.measureText(text).width+16,x=within(this.hx,w/2),y=this.hBox.y0-20;
      const pop=1+.12*Math.max(0,1-this.thoughtT*5);ctx.translate(x,y);ctx.scale(pop,pop);
      ctx.fillStyle=ACCENT;ctx.beginPath();ctx.roundRect(-w/2,-14,w,28,2);ctx.fill();ctx.fillStyle=INK;ctx.fillText(text,0,1);
    }else if(m===4){ // cloud stays, the line runs as a heading-20 subtitle along the bottom
      type(20,MUTED);halo(text,W/2,H*.8);
    }
    ctx.restore();
  },
  drawUI(ctx,W,H){
    ctx.clearRect(0,0,W,H);
    this.drawThought(ctx,W,H);
    if(!this.ring||!this.ptr||this.done||this.home)return;
    const a=this.p;ctx.save();ctx.strokeStyle=`rgba(31,52,36,${.2+a*.3})`;ctx.setLineDash([3,4]);ctx.lineWidth=1.2;
    ctx.beginPath();ctx.moveTo(this.hx,this.hy);ctx.lineTo(this.ring.x,this.ring.y);ctx.stroke();ctx.setLineDash([]);
    ctx.strokeStyle='rgba(255,255,255,.95)';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(this.ring.x,this.ring.y,7+a*9,0,7);ctx.stroke();
    ctx.fillStyle='rgba(31,52,36,.45)';ctx.beginPath();ctx.arc(this.ptr.x,this.ptr.y,2.2,0,7);ctx.fill();ctx.restore();
  }
};

/* ---------- shader: two layers, each with its own gaussian pixel scatter, then grain + matte ---------- */
const VS='attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
/* bgv maps screen v into the bg texture: (1, 0) for a viewport-sized bg, or a window onto the whole baked valley */
/* dev develops the scene in: scatter starts wide and hazy, then settles. rip holds tap ripples
   (x, y in device px, age in s, strength in device px); px is device px per css px. */
const FSbody=`varying vec2 uv;uniform sampler2D bg;uniform sampler2D fg;uniform vec2 res;uniform float t;uniform float sigBg;uniform float sigFg;uniform float amt;uniform vec2 bgv;
uniform float dev;uniform float px;uniform vec4 rip[6];
float hash12(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
vec2 gauss(vec2 s,float sig){float u1=max(hash12(s),1e-4),u2=hash12(s+vec2(19.19,7.73));float r=sqrt(-2.*log(u1))*sig,a=6.2831853*u2;return vec2(cos(a),sin(a))*r;}
float vn(vec2 x){vec2 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(hash12(i),hash12(i+vec2(1.,0.)),f.x),mix(hash12(i+vec2(0.,1.)),hash12(i+1.),f.x),f.y);}
// soft clumps of grain instead of single-pixel static, zero mean, roughly -1..1
float grainAt(vec2 x){return(vn(x)*.65+vn(x*2.03+19.7)*.35-.5)*2.;}
void main(){
  vec2 fc=gl_FragCoord.xy,f=floor(fc);float tt=mod(floor(t*12.),997.);
  vec2 s=f+vec2(tt*37.17,tt*91.31);
  // each tap sends out one ring that pushes the picture outward as it passes, fading as it spreads
  vec2 disp=vec2(0.);float crest=0.;
  for(int i=0;i<6;i++){vec4 r=rip[i];if(r.w<=0.)continue;
    vec2 dv=fc-r.xy;float d=length(dv),life=clamp(1.-r.z/1.1,0.,1.);
    float band=(d-r.z*240.*px)/(14.*px),w=exp(-band*band)*life*life;
    // light on the outer face of the ring, shade on the inner, so it reads even over flat meadow
    disp+=dv/max(d,1.)*w*r.w;crest+=w*clamp(band,-1.,1.)*r.w/(7.*px);}
  float k=1.+dev*7.;
  vec2 q=uv+(gauss(s,sigBg*k)+disp)/res;
  vec3 b=texture2D(bg,vec2(q.x,q.y*bgv.x+bgv.y)).rgb;
  vec4 p=texture2D(fg,uv+(gauss(s+vec2(41.3,17.9),sigFg*k)+disp*.35)/res);
  vec3 c=p.rgb+b*(1.-p.a);
  c+=crest*.09;
  c=mix(c,vec3(1.),dev*.55);
  // film grain on a 24fps cadence, a little coarser than a pixel, strongest in the midtones
  float gt=mod(floor(t*24.),997.),l0=dot(c,vec3(.299,.587,.114));
  c+=grainAt(fc/(1.2*px)+vec2(gt*37.17,gt*91.31))*.9*amt*.2*mix(.55,1.,4.*l0*(1.-l0));
  c=mix(vec3(.07,.065,.075),vec3(.975,.968,.952),c);
  float l=dot(c,vec3(.299,.587,.114));c=mix(vec3(l),c,.94);
  vec2 d=uv-.5;c*=1.-dot(d,d)*.1;
  gl_FragColor=vec4(clamp(c,0.,1.),1.);
}`;
function setupGL(cv){
  const gl=cv.getContext('webgl',{antialias:false,alpha:false});if(!gl)return null;
  const hp=gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER,gl.HIGH_FLOAT);const FS=`precision ${hp&&hp.precision>0?'highp':'mediump'} float;\n`+FSbody;
  const sh=(ty,src)=>{const s=gl.createShader(ty);gl.shaderSource(s,src);gl.compileShader(s);return gl.getShaderParameter(s,gl.COMPILE_STATUS)?s:null};
  const v=sh(gl.VERTEX_SHADER,VS),f=sh(gl.FRAGMENT_SHADER,FS);if(!v||!f)return null;
  const p=gl.createProgram();gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))return null;gl.useProgram(p);
  gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const loc=gl.getAttribLocation(p,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  const mk=unit=>{gl.activeTexture(gl.TEXTURE0+unit);const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
    for(const[k,val]of[[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,val);return t};
  const tBg=mk(0),tFg=mk(1);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
  const u=n=>gl.getUniformLocation(p,n);gl.uniform1i(u('bg'),0);gl.uniform1i(u('fg'),1);
  /* the whole valley can live on the GPU only if it fits and v has the precision to address it */
  return{gl,tBg,tFg,res:u('res'),t:u('t'),sigBg:u('sigBg'),sigFg:u('sigFg'),amt:u('amt'),bgv:u('bgv'),dev:u('dev'),px:u('px'),rip:u('rip[0]'),
    max:gl.getParameter(gl.MAX_TEXTURE_SIZE),hp:!!(hp&&hp.precision>0)};
}

/* ---------- stage ---------- */
const uctx=ui.getContext('2d');
const cBg=document.createElement('canvas'),xBg=cBg.getContext('2d'),cFg=document.createElement('canvas'),xFg=cFg.getContext('2d');
let g=setupGL(cv),flat=null,lost=false;
if(!g){flat=cv.getContext('2d')}
let W=0,H=0,visible=true;
/* the valley is baked once per resize; upload it whole and scroll it with a uniform, so a frame only
   re-uploads the moving layer instead of copying and re-sending a full screen of meadow too */
let whole=false;
function uploadWorld(){
  const w=scene.world;whole=!!(g&&w&&g.hp&&w.width<=g.max&&w.height<=g.max);if(!whole)return;
  const{gl}=g;gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,g.tBg);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,w);
}
const ro=new ResizeObserver(()=>{const r=el.getBoundingClientRect(),w=Math.round(r.width),h=Math.round(r.height);if(!w||!h||(w===W&&h===H))return;
  W=w;H=h;for(const c of[cBg,cFg,cv,ui]){c.width=Math.round(W*DPR);c.height=Math.round(H*DPR)}scene.resize(W,H);uploadWorld();wake()});ro.observe(el);
const io=new IntersectionObserver(es=>{visible=es[0].isIntersecting;wake()},{rootMargin:'200px'});io.observe(el);
/* a lost context draws nothing until it comes back, then gets its program and valley again */
const onLost=e=>{e.preventDefault();lost=true};
const onRestored=()=>{g=setupGL(cv);lost=false;uploadWorld();wake()};
cv.addEventListener('webglcontextlost',onLost);cv.addEventListener('webglcontextrestored',onRestored);
/* tap ripples, newest last; a seventh pushes out the oldest */
const rips=[],ripU=new Float32Array(24);
const ripple=(x,y,amp)=>{if(REDUCED)return;rips.push({x:x*DPR,y:(H-y)*DPR,age:0,amp:amp*DPR});if(rips.length>6)rips.shift()};
const feet=()=>[scene.lane(scene.yw(scene.p),.2),scene.yw(scene.p)-scene.cam];
scene.fx=kind=>{if(kind==='sit')ripple(...feet(),3.5)};
/* the scene develops in the first time it comes into view */
let born=-1;
const pt=e=>{const r=cv.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]};
const onDown=e=>{try{cv.setPointerCapture(e.pointerId)}catch(_){}const[x,y]=pt(e),b=scene.hBox,onHim=b&&x>=b.x0&&x<=b.x1&&y>=b.y0&&y<=b.y1;
  scene.down(x,y);ripple(x,y,onHim?4:7)};
const onMove=e=>{if(e.pointerType==='mouse'||e.buttons)scene.move(...pt(e))};
cv.addEventListener('pointerdown',onDown);
cv.addEventListener('pointermove',onMove);
const UP=new Set(['ArrowUp','w','W','ArrowRight','d','D']),DOWN=new Set(['ArrowDown','s','S','ArrowLeft','a','A']);
const onKey=e=>{
  if(e.altKey||e.metaKey||e.ctrlKey)return;
  const dir=UP.has(e.key)?1:DOWN.has(e.key)?-1:0;
  if(dir){e.preventDefault();if(e.type==='keydown')scene.key(dir);else if(scene.keys===dir)scene.key(0);return}
  if(e.type==='keydown'&&(e.key===' '||e.key==='Enter')){e.preventDefault();if(!e.repeat)scene.act()}
};
const onBlur=()=>scene.key(0);
cv.addEventListener('keydown',onKey);cv.addEventListener('keyup',onKey);cv.addEventListener('blur',onBlur);

/* the loop only runs while the stage is near the viewport and the tab is showing */
let last=performance.now(),raf=0;
const running=()=>visible&&!document.hidden&&W>0;
function wake(){if(!raf&&running()){last=performance.now();raf=requestAnimationFrame(frame)}}
function frame(now){
  raf=0;if(!running())return;
  const dt=Math.min(.05,(now-last)/1000);last=now;
  scene.update(dt);
  if(born<0)born=now;
  for(const r of rips)r.age+=dt;while(rips.length&&rips[0].age>1.1)rips.shift();
  ripU.fill(0);rips.forEach((r,i)=>ripU.set([r.x,r.y,r.age,r.amp],i*4));
  for(const x of[xFg,uctx]){x.setTransform(DPR,0,0,DPR,0,0);x.globalAlpha=1}
  if(!whole){xBg.setTransform(DPR,0,0,DPR,0,0);scene.drawBg(xBg,W,H)}
  scene.drawFg(xFg,W,H);scene.drawUI(uctx,W,H);
  if(g&&!lost){const{gl}=g;gl.viewport(0,0,cv.width,cv.height);
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,g.tBg);
    if(whole){const WH=scene.WH;gl.uniform2f(g.bgv,H/WH,1-(scene.cam+H)/WH)}
    else{gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,cBg);gl.uniform2f(g.bgv,1,0)}
    gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,g.tFg);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,cFg);
    gl.uniform2f(g.res,cv.width,cv.height);gl.uniform1f(g.t,REDUCED?0:now/1000);
    gl.uniform1f(g.sigBg,SOFT_BG*10*DPR);gl.uniform1f(g.sigFg,SOFT_FG*10*DPR);gl.uniform1f(g.amt,GRAIN);
    gl.uniform1f(g.dev,REDUCED?0:Math.exp(-(now-born)/1000*3));gl.uniform1f(g.px,DPR);gl.uniform4fv(g.rip,ripU);
    gl.drawArrays(gl.TRIANGLES,0,6)}
  else if(flat){flat.setTransform(1,0,0,1,0,0);flat.drawImage(cBg,0,0);flat.drawImage(cFg,0,0)}
  raf=requestAnimationFrame(frame);
}
document.addEventListener('visibilitychange',wake);
wake();

return()=>{
  cancelAnimationFrame(raf);ro.disconnect();io.disconnect();
  document.removeEventListener('visibilitychange',wake);
  cv.removeEventListener('webglcontextlost',onLost);cv.removeEventListener('webglcontextrestored',onRestored);
  cv.removeEventListener('pointerdown',onDown);cv.removeEventListener('pointermove',onMove);
  cv.removeEventListener('keydown',onKey);cv.removeEventListener('keyup',onKey);cv.removeEventListener('blur',onBlur);
};
}
