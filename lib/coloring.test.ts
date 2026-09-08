import assert from 'node:assert/strict';
// @ts-ignore Node native TypeScript test runner
import { findRegions, paintRegions } from '../lib/coloring.ts';
const width=24,height=18,data=new Uint8ClampedArray(width*height*4).fill(255);
function black(x:number,y:number){const p=(y*width+x)*4;data[p]=data[p+1]=data[p+2]=0;}
for(let x=2;x<=21;x++){black(x,2);black(x,15);}for(let y=2;y<=15;y++){black(2,y);black(12,y);black(21,y);}
const seg=findRegions({width,height,data},3);
assert.equal(seg.regions.length,2,'two enclosed regions');
assert.equal(seg.labels[0],-1,'outside never fills');
assert.equal(seg.labels[8*width+12],-1,'outline never fills');
const red=paintRegions(seg,{0:'#ff0000'}),blue=paintRegions(seg,{0:'#0000ff'}),blank=paintRegions(seg,{});
assert.deepEqual([...red.slice((8*width+6)*4,(8*width+6)*4+3)],[255,0,0]);
assert.deepEqual([...blue.slice((8*width+6)*4,(8*width+6)*4+3)],[0,0,255],'recolor selected region');
assert.deepEqual([...red.slice((8*width+17)*4,(8*width+17)*4+3)],[255,255,255],'neighbor stays unchanged');
assert.deepEqual(blank,data,'erase restores original');
assert.deepEqual(paintRegions(seg,{99:'#ff0000',0:'invalid'}),data,'bad region or color cannot corrupt pixels');
console.log('PASS: enclosed regions, outside/outline protection, recolor, neighboring region isolation, erasing, invalid input');
