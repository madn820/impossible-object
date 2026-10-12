import * as THREE from 'three';

const scene = new THREE.Scene(); scene.background = new THREE.Color('#050505');
const camera = new THREE.PerspectiveCamera(36,16/9,0.05,250);
const renderer = new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true, powerPreference:'high-performance'});
renderer.setSize(1920,1080,false); renderer.setPixelRatio(1);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.4;
document.getElementById('stage').appendChild(renderer.domElement);

const matDark=new THREE.MeshStandardMaterial({color:0x202226,metalness:.66,roughness:.37});
const matEdge=new THREE.MeshStandardMaterial({color:0x777c82,metalness:.83,roughness:.24});
const matChrome=new THREE.MeshStandardMaterial({color:0x383c43,metalness:.85,roughness:.17,side:THREE.DoubleSide});
const materialBlack=new THREE.MeshStandardMaterial({color:0x0c0d10,metalness:.4,roughness:.55});
scene.add(new THREE.AmbientLight(0xffffff,.28));
function light(color,intensity,pos){let l=new THREE.DirectionalLight(color,intensity);l.position.set(...pos);scene.add(l)}
light(0xffffff,3.1,[-5,8,9]);light(0xc8d4e7,2.2,[7,1,-6]);light(0xffffff,1.25,[-8,-4,-3]);
const root=new THREE.Group();scene.add(root);
const slabs=[];
for(let i=0;i<6;i++){
 const pivot=new THREE.Group();root.add(pivot);
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(2.6,.42,2.6),matDark);pivot.add(mesh);
 const rim=new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry),new THREE.LineBasicMaterial({color:0x777e88,transparent:true,opacity:.52}));pivot.add(rim);
 slabs.push(pivot);
}
const frames=[];
for(let i=0;i<10;i++){
 const grp=new THREE.Group();root.add(grp);
 const w=2.3+i*.37;
 const parts=[];
 const barGeo=new THREE.BoxGeometry(w,.055,.085),sideGeo=new THREE.BoxGeometry(.055,w,.085);
 for(let y of [-w/2,w/2]){let b=new THREE.Mesh(barGeo, i%3===0?matEdge:matChrome);b.position.y=y;grp.add(b);parts.push(b)}
 for(let x of [-w/2,w/2]){let b=new THREE.Mesh(sideGeo,i%3===0?matEdge:matChrome);b.position.x=x;grp.add(b);parts.push(b)}
 frames.push(grp);
}
const lock=new THREE.Group();root.add(lock);
const lockParts=[];
for(let i=0;i<5;i++){
 let g=new THREE.Group();lock.add(g);let geo=new THREE.TorusGeometry(1.15+i*.11,.065,7,80,4);
 let mesh=new THREE.Mesh(geo,i%2?matChrome:matEdge);g.add(mesh);lockParts.push(g);
}
const centerCore=new THREE.Mesh(new THREE.BoxGeometry(1.3,1.3,1.3),materialBlack);root.add(centerCore);
const dust=[]; // intentionally no particles
function clamp(x){return Math.max(0,Math.min(1,x))}
function smooth(x){x=clamp(x);return x*x*(3-2*x)}
function ease(x){return 1-Math.exp(-6*clamp(x))*(1+6*clamp(x))}
function mix(a,b,t){return a+(b-a)*t}
function track(t,a,b){return smooth((t-a)/(b-a))}
function vec(x,y,z){return new THREE.Vector3(x,y,z)}
function cameraPath(t){
 const key=[
 [0,4.5,1.65,11.6,0,0,0],
 [2,-.6,1.1,9.1,0,0,0],
 [4.5,2.8,.7,8.2,0,0,0],
 [7.5,-6.7,2.1,8.1,0,0,0],
 [10.5,.1,.3,1.0,0,0,-4],
 [12.5,5.2,2.5,10.8,0,0,0],
 [15,3.4,1.4,10.4,0,0,0]];
 let i=0;while(i<key.length-2&&t>key[i+1][0])i++;
 const p=key[i],n=key[i+1],f=smooth((t-p[0])/(n[0]-p[0]));
 camera.position.set(mix(p[1],n[1],f),mix(p[2],n[2],f),mix(p[3],n[3],f));
 camera.lookAt(mix(p[4],n[4],f),mix(p[5],n[5],f),mix(p[6],n[6],f));
}
function seek(raw){
 const t=Math.max(0,Math.min(15,Number(raw)||0));
 const reveal=track(t,1.8,4.3),rings=track(t,4.25,7.1),portal=track(t,7.4,10.2),close=track(t,10.45,12.55),end=track(t,12.4,13.4);
 cameraPath(t);
 root.rotation.set(.08*Math.sin(t*.45),.09*t,.05*Math.sin(t*.3));
 root.scale.setScalar(1+portal*1.2-close*1.2);
 slabs.forEach((p,i)=>{
  p.visible=t<12.7;
  const phase=i-2.5; const split=reveal*(1-close);
  p.position.set(split*phase*.23,phase*.43+split*phase*.32,split*Math.sin(i*2.6)*1.13);
  p.rotation.set(split*(i%2?1:-1)*.4+rings*i*.045,split*phase*.11,split*phase*.07);
  p.scale.set(1,1,1);
  p.visible=p.visible&&!(portal>.85);
 });
 frames.forEach((g,i)=>{
  let entrance=track(t,2.8+i*.055,4.55+i*.05);
  let appear=entrance*(1-close);
  g.visible=appear>.002;
  g.scale.setScalar(.15+appear*(.76+portal*1.2));
  g.position.set(Math.sin(i*1.8)*.16*appear, Math.cos(i*1.9)*.15*appear, -i*.26-portal*i*.9);
  g.rotation.set(rings*(i%2?1:-1)*(.28+i*.09),rings*i*.21+portal*i*.065,rings*i*.09);
 });
 lock.visible=close>.001;
 lock.scale.setScalar(.1+close*.9);
 lock.rotation.y=(1-close)*1.3+.3;lock.rotation.x=.25*(1-close);
 lockParts.forEach((g,i)=>{g.rotation.set(.5*Math.sin(i*2)+end*.15,i*1.25+(1-close)*i*.22,i*.2);g.position.z=(i-2)*.12*(1-close)});
 centerCore.visible=t<3.2;centerCore.scale.setScalar(1-track(t,1.9,3.2));
 const title=document.getElementById('title'),tag=document.getElementById('tag');
 const maskTitle=track(t,12.75,13.65), maskTag=track(t,13.5,14.25);
 title.style.clipPath=`inset(0 ${100*(1-maskTitle)}% 0 0)`;
 tag.style.clipPath=`inset(0 ${100*(1-maskTag)}% 0 0)`;
 title.style.opacity=maskTitle>.001?1:0;tag.style.opacity=maskTag>.001?1:0;
 renderer.render(scene,camera);
 return t;
}
window.seek=seek;
window.setResolution=(w,h)=>{renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};
window.ready=true;seek(0);
