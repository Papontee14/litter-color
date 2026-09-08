export type Region = { pixels: number[]; minX: number; minY: number; maxX: number; maxY: number };
export type Segmentation = { width: number; height: number; original: Uint8ClampedArray; labels: Int32Array; regions: Region[]; artVersion: string };
// Segment original line art once, keeping boundaries independent of chosen colors.
export function findRegions(image: { width: number; height: number; data: Uint8ClampedArray }, minArea = 180, originalData = image.data, artVersion = 'region-v1'): Segmentation {
  const { width, height, data } = image;
  const labels = new Int32Array(width * height).fill(-1);
  const seen = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  const regions: Region[] = [];
  for (let seed = 0; seed < labels.length; seed++) {
    if (seen[seed] || data[seed*4] < 180 || data[seed*4+1] < 180 || data[seed*4+2] < 180) continue;
    let head = 0, tail = 1, border = false;
    queue[0] = seed; seen[seed] = 1;
    const r: Region = { pixels: [], minX: width, minY: height, maxX: 0, maxY: 0 };
    while(head < tail) {
      const p=queue[head++], x=p%width, y=Math.floor(p/width);
      r.pixels.push(p); r.minX=Math.min(r.minX,x); r.maxX=Math.max(r.maxX,x); r.minY=Math.min(r.minY,y); r.maxY=Math.max(r.maxY,y);
      if (x===0 || y===0 || x===width-1 || y===height-1) border=true;
      for (const n of [x>0?p-1:-1,x<width-1?p+1:-1,y>0?p-width:-1,y<height-1?p+width:-1]) {
        if(n<0||seen[n]) continue;
        seen[n]=1;
        if(data[n*4]>=180 && data[n*4+1]>=180 && data[n*4+2]>=180) queue[tail++]=n;
      }
    }
    if (!border && r.pixels.length >= minArea) { for(const p of r.pixels) labels[p]=regions.length; regions.push(r); }
  }
  return { width, height, original:new Uint8ClampedArray(originalData), labels, regions, artVersion };
}
export function paintRegions(segmentation: Segmentation, fills: Record<number,string>): Uint8ClampedArray<ArrayBuffer> {
  const output = new Uint8ClampedArray(segmentation.original);
  for(const [key,hex] of Object.entries(fills)) {
    const region=segmentation.regions[Number(key)];
    if(!region || !/^#[0-9a-f]{6}$/i.test(hex)) continue;
    const rgb=[parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)];
    for(const p of region.pixels) for(let c=0;c<3;c++) output[p*4+c]=rgb[c]*segmentation.original[p*4+c]/255;
  }
  return output;
}
