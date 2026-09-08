import assert from 'node:assert/strict';
// @ts-expect-error Node native TypeScript test runner needs the explicit extension.
import { findRegions, migrateFills, paintRegions } from '../lib/coloring.ts';
const width=24,height=18,data=new Uint8ClampedArray(width*height*4).fill(255);
function black(x:number,y:number){const p=(y*width+x)*4;data[p]=data[p+1]=data[p+2]=0;}
for(let x=2;x<=21;x++){black(x,2);black(x,15);}for(let y=2;y<=15;y++){black(2,y);black(12,y);black(21,y);}
const seg=findRegions({width,height,data},3);
assert.equal(seg.regions.length,2,'two enclosed regions');
assert.equal(seg.droppedRegions.length,0,'no useful enclosed region is silently dropped');
assert.equal(seg.labels[0],-1,'outside never fills');
assert.equal(seg.labels[8*width+12],-1,'outline never fills');
const red=paintRegions(seg,{0:'#ff0000'}),blue=paintRegions(seg,{0:'#0000ff'}),blank=paintRegions(seg,{});
assert.deepEqual(Array.from(red.slice((8*width+6)*4,(8*width+6)*4+3)),[255,0,0]);
assert.deepEqual(Array.from(blue.slice((8*width+6)*4,(8*width+6)*4+3)),[0,0,255],'recolor selected region');
assert.deepEqual(Array.from(red.slice((8*width+17)*4,(8*width+17)*4+3)),[255,255,255],'neighbor stays unchanged');
assert.deepEqual(blank,data,'erase restores original');
assert.deepEqual(paintRegions(seg,{99:'#ff0000',0:'invalid'}),data,'bad region or color cannot corrupt pixels');
const tiny = new Uint8ClampedArray(12 * 12 * 4).fill(255);
function tinyBlack(x:number,y:number){const p=(y*12+x)*4;tiny[p]=0;tiny[p+1]=0;tiny[p+2]=0;}
for (let x = 2; x <= 9; x++) { tinyBlack(x, 2); tinyBlack(x, 9); }
for (let y = 2; y <= 9; y++) { tinyBlack(2, y); tinyBlack(9, y); }
const tinySeg = findRegions({ width: 12, height: 12, data: tiny }, 100);
assert.equal(tinySeg.regions.length, 0, 'audit threshold can identify a too-small enclosed region');
assert.equal(tinySeg.droppedRegions.length, 1, 'too-small region is reported');
const art = new Uint8ClampedArray(width*height*4).fill(255); const virtual = new Uint8ClampedArray(art);
for(let x=2;x<=21;x++){ for(const y of [2,15]) { const p=(y*width+x)*4; virtual[p]=virtual[p+1]=virtual[p+2]=0; } }
for(let y=2;y<=15;y++){ for(const x of [2,21]) { const p=(y*width+x)*4; virtual[p]=virtual[p+1]=virtual[p+2]=0; } }
const background = findRegions({width,height,data:virtual},3,art,'scene-v1');
assert.equal(background.regions.length,1,'virtual border keeps background as a fillable region');
assert.equal(background.labels[8*width+6] >= 0,true,'background pixel receives a label');
const backgroundRed = paintRegions(background,{0:'#ff0000'});
assert.deepEqual(Array.from(backgroundRed.slice((8*width+6)*4,(8*width+6)*4+3)),[255,0,0],'background fills');
assert.deepEqual(Array.from(backgroundRed.slice((0)*4,(0)*4+3)),[255,255,255],'virtual border never appears in output');
const migrated = migrateFills(seg, seg, { 0: '#ff0000', 1: '#00ff00' });
assert.deepEqual(migrated.fills, { 0: '#ff0000', 1: '#00ff00' }, 'unchanged masks migrate fills by overlap');
assert.equal(migrated.unmatched.length, 0, 'all unchanged regions migrate');
const speckData = new Uint8ClampedArray(8 * 8 * 4);
for (let p = 0; p < 64; p++) speckData[p * 4 + 3] = 255;
for (const p of [9, 27, 28, 35, 36]) speckData.fill(255, p * 4, p * 4 + 4);
const allDetails = findRegions({ width: 8, height: 8, data: speckData });
assert.equal(allDetails.regions.length, 2, 'one-pixel enclosed whites are fillable too');
assert.equal(allDetails.droppedRegions.length, 0, 'no white detail is discarded');
assert.equal(allDetails.labels[27], 0, 'existing larger region ID is retained');
assert.equal(allDetails.labels[9], 1, 'new tiny region is appended');
const allPainted = paintRegions(allDetails, { 0: '#ff0000', 1: '#ff0000' });
assert.equal(allPainted[9 * 4 + 1], 0, 'tiny detail receives the chosen color');
assert.equal(allPainted[0], 0, 'black pixels remain black');
assert.deepEqual(paintRegions(allDetails, {}), speckData, 'reset restores small and large areas');
console.log('PASS: enclosed regions, outside/outline protection, recolor, neighboring region isolation, erasing, invalid input');
