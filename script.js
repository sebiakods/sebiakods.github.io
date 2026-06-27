
const cd = document.getElementById('cd'), cr = document.getElementById('cr');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});
(function loop(){cd.style.cssText=`left:${mx}px;top:${my}px`;rx+=(mx-rx)*.13;ry+=(my-ry)*.13;cr.style.cssText=`left:${rx}px;top:${ry}px`;requestAnimationFrame(loop);})();
document.querySelectorAll('a,button,.pc,.sg,.ec,.stat-card').forEach(el=>{
  el.addEventListener('mouseenter',()=>cr.classList.add('hov'));
  el.addEventListener('mouseleave',()=>cr.classList.remove('hov'));
});

// Neural canvas
const canvas=document.getElementById('heroCanvas'),ctx=canvas.getContext('2d');
let W,H,nodes=[];
const N=65;
function resize(){W=canvas.width=canvas.offsetWidth;H=canvas.height=canvas.offsetHeight;}
resize();window.addEventListener('resize',()=>{resize();init();});
function init(){nodes=Array.from({length:N},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,r:Math.random()*1.8+.8,p:Math.random()*Math.PI*2}));}
init();
let mX=W/2,mY=H/2;
canvas.parentElement.addEventListener('mousemove',e=>{const r=canvas.getBoundingClientRect();mX=e.clientX-r.left;mY=e.clientY-r.top;});
function draw(){
  ctx.clearRect(0,0,W,H);
  const bg=ctx.createRadialGradient(mX,mY,0,mX,mY,Math.max(W,H)*.55);
  bg.addColorStop(0,'rgba(124,58,237,.06)');bg.addColorStop(1,'transparent');
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  nodes.forEach(n=>{
    n.p+=.018;
    const dx=mX-n.x,dy=mY-n.y,d=Math.sqrt(dx*dx+dy*dy);
    if(d<160){n.vx+=dx/d*.01;n.vy+=dy/d*.01;}
    n.vx*=.985;n.vy*=.985;
    n.x+=n.vx;n.y+=n.vy;
    if(n.x<0)n.x=W;if(n.x>W)n.x=0;
    if(n.y<0)n.y=H;if(n.y>H)n.y=0;
  });
  for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
    const dx=nodes[i].x-nodes[j].x,dy=nodes[i].y-nodes[j].y,d=Math.sqrt(dx*dx+dy*dy);
    if(d<115){ctx.beginPath();ctx.strokeStyle=`rgba(124,58,237,${(1-d/115)*.3})`;ctx.lineWidth=.6;ctx.moveTo(nodes[i].x,nodes[i].y);ctx.lineTo(nodes[j].x,nodes[j].y);ctx.stroke();}
  }
  nodes.forEach(n=>{
    const p=.55+.45*Math.sin(n.p);
    ctx.beginPath();ctx.arc(n.x,n.y,n.r*p,0,Math.PI*2);ctx.fillStyle=`rgba(196,181,253,${.45*p})`;ctx.fill();
  });
  requestAnimationFrame(draw);
}
draw();

// Reveal
const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');}),{threshold:.1});
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
