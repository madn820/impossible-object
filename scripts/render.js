import {chromium} from 'playwright';
import {spawn,spawnSync} from 'node:child_process';
import fs from 'node:fs';import path from 'node:path';import http from 'node:http';
const argv=process.argv.slice(2),preview=argv.includes('--preview'),quality=argv.includes('--quality');
const fps=preview?30:60,w=preview?1280:1920,h=preview?720:1080,duration=preview?5:15;
const count=fps*duration,samples=quality?3:1,framesDir=path.resolve('output/frames');
fs.mkdirSync(framesDir,{recursive:true});for(const f of fs.readdirSync(framesDir))if(f.endsWith('.png'))fs.unlinkSync(path.join(framesDir,f));
function command(exe,args){return new Promise((resolve,reject)=>{const p=spawn(exe,args,{stdio:'inherit',shell:process.platform==='win32'});p.on('error',reject);p.on('exit',code=>code===0?resolve():reject(Error(exe+' failed: '+code)))})}
const server=spawn(process.platform==='win32'?'npm.cmd':'npm',['run','start','--','--port','5178','--strictPort'],{stdio:'ignore',shell:process.platform==='win32'});
async function ready(){for(let i=0;i<60;i++){try{await new Promise((res,rej)=>{http.get('http://127.0.0.1:5178',r=>{r.resume();res()}).on('error',rej) });return}catch{}await new Promise(r=>setTimeout(r,250))}throw Error('Vite dev server did not start')}
let browser;
try{
 await ready();
 browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--disable-web-security','--no-sandbox','--disable-dev-shm-usage']});
 const page=await browser.newPage({viewport:{width:w,height:h},deviceScaleFactor:1});
 page.on('pageerror',err=>console.error('BROWSER:',err.message));
 await page.goto('http://127.0.0.1:5178',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>window.ready===true,{timeout:30000});
 await page.evaluate(([w,h])=>window.setResolution(w,h),[w,h]);
 for(let i=0;i<count;i++){
  for(let s=0;s<samples;s++){
   const t=(i+(quality?(s+.5)/3-.5:0))/fps;
   await page.evaluate(t=>window.seek(t),Math.max(0,t));
   const name=quality?`sub_${String(i).padStart(6,'0')}_${s}.png`:`frame_${String(i).padStart(6,'0')}.png`;
   await page.locator('body').screenshot({path:path.join(framesDir,name),animations:'disabled'});
  }
  if(i%Math.max(1,Math.floor(fps*2))===0)console.log(`Frames: ${i}/${count}`);
 }
 await browser.close();browser=null;
 if(quality){
  // Rendered independent temporal samples, rather than blurring neighboring output frames.
  for(let i=0;i<count;i++){
   const seq=String(i).padStart(6,'0');
   const input=[0,1,2].flatMap(s=>['-i',path.join(framesDir,`sub_${seq}_${s}.png`)]);
   await command('ffmpeg',['-hide_banner','-loglevel','error','-y',...input,'-filter_complex','[0:v][1:v]blend=all_expr=0.5*A+0.5*B[ab];[ab][2:v]blend=all_expr=0.666667*A+0.333333*B,format=rgb24[out]','-map','[out]','-frames:v','1',path.join(framesDir,`frame_${seq}.png`)]);
   for(let s=0;s<3;s++)fs.unlinkSync(path.join(framesDir,`sub_${seq}_${s}.png`));
  }
 }
 await command(process.execPath,['scripts/audio.js']);
 const output=preview?'output/preview.mp4':'output/impossible_object_final.mp4';
 await command('ffmpeg',['-hide_banner','-y','-framerate',String(fps),'-start_number','0','-i',path.join(framesDir,'frame_%06d.png'),'-i','output/soundtrack.wav','-t',String(duration),'-c:v','libx264','-preset','medium','-crf','19','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart',output]);
 console.log('SUCCESS:',output);
}catch(err){console.error(err);process.exitCode=1}finally{if(browser)await browser.close();server.kill()}
