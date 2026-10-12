import fs from 'node:fs';import path from 'node:path';
const rate=44100,duration=15,N=rate*duration;const samples=new Float32Array(N);
function add(start,d,fn){const lo=Math.floor(start*rate),len=Math.ceil(d*rate);for(let j=0;j<len&&lo+j<N;j++){if(lo+j<0)continue;const x=j/rate;samples[lo+j]+=fn(x,j)}}
for(let beat=0;beat<30;beat++){
 const time=beat*.5;
 add(time,.32,(t)=>{const e=Math.exp(-t*16);return Math.sin(2*Math.PI*(57*t+30*t*t*Math.exp(-12*t)))*e*.48});
 add(time,.09,(t,j)=>{let noise=Math.sin(j*93.71)*Math.sin(j*4.137);return noise*Math.exp(-t*40)*.075});
}
for(const [time,power] of [[2,.65],[4.5,.55],[7.5,.65],[10.5,.8],[12.5,1]]){
 add(time,.95,(t)=>{const e=Math.exp(-t*5.1);return power*(Math.sin(2*Math.PI*(72*t+14*t*t))*e*.36+Math.sin(2*Math.PI*230*t)*Math.exp(-t*18)*.12)});
}
for(let n=0;n<15;n++){add(n+.25,.07,(t,j)=>Math.sin(j*47.2)*Math.exp(-t*75)*.038)}
const buf=Buffer.alloc(44+N*2);buf.write('RIFF',0);buf.writeUInt32LE(36+N*2,4);buf.write('WAVEfmt ',8);buf.writeUInt32LE(16,16);buf.writeUInt16LE(1,20);buf.writeUInt16LE(1,22);buf.writeUInt32LE(rate,24);buf.writeUInt32LE(rate*2,28);buf.writeUInt16LE(2,32);buf.writeUInt16LE(16,34);buf.write('data',36);buf.writeUInt32LE(N*2,40);
for(let i=0;i<N;i++){const v=Math.tanh(samples[i]*1.3)*.84;buf.writeInt16LE(Math.max(-32768,Math.min(32767,Math.round(v*32767))),44+i*2)}
fs.mkdirSync('output',{recursive:true});fs.writeFileSync('output/soundtrack.wav',buf);console.log('Created output/soundtrack.wav');
