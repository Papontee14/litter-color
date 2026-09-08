import path from 'node:path';
import sharp from 'sharp';
// @ts-expect-error Node's native TypeScript runner needs the explicit extension.
import { DEFAULT_MIN_REGION_AREA, findRegions, paintRegions, type RegionSummary } from '../lib/coloring.ts';
// @ts-expect-error Node's native TypeScript runner needs the explicit extension.
import { pictures } from '../lib/pictures.ts';

const SIZE = 640;
const INSET = 30;
const CONTENT_SIZE = SIZE - INSET * 2;
const MIN_TOUCH_AREA = 180;
const MIN_TOUCH_EDGE = 14;
const MIN_MEANINGFUL_DROPPED_AREA = 1;

type Audit = {
  id: string;
  artVersion: string;
  level: string;
  asset: string;
  regions: number;
  target: string;
  droppedRegions: RegionSummary[];
  tooSmallRegions: RegionSummary[];
  borderRegions: number;
  representativePoints: Array<{ region: number; x: number; y: number }>;
  unpaintedWhitePixels: number;
  pass: boolean;
};

function makeCanvas(content: Buffer, width: number, height: number): Uint8ClampedArray {
  const canvas = Buffer.alloc(SIZE * SIZE * 4, 255);
  for (let y = 0; y < height; y++) {
    const sourceOffset = y * width * 4;
    const targetOffset = ((y + INSET) * SIZE + INSET) * 4;
    content.copy(canvas, targetOffset, sourceOffset, sourceOffset + width * 4);
  }
  const setBlack = (x: number, y: number) => {
    const i = (y * SIZE + x) * 4;
    canvas[i] = 0;
    canvas[i + 1] = 0;
    canvas[i + 2] = 0;
    canvas[i + 3] = 255;
  };
  for (let x = INSET; x < SIZE - INSET; x++) {
    setBlack(x, INSET);
    setBlack(x, SIZE - INSET - 1);
  }
  for (let y = INSET; y < SIZE - INSET; y++) {
    setBlack(INSET, y);
    setBlack(SIZE - INSET - 1, y);
  }
  return new Uint8ClampedArray(canvas);
}

async function renderAsset(asset: string, spriteIndex?: number) {
  const file = path.join(process.cwd(), 'public', asset.replace(/^\//, ''));
  // @ts-expect-error sharp's conditional export is typed as unknown under bundler resolution.
  const metadata = await sharp(file).metadata();
  if (!metadata.width || !metadata.height) throw new Error(`Could not read dimensions for ${asset}`);
  // @ts-expect-error sharp's conditional export is typed as unknown under bundler resolution.
  let image = sharp(file).ensureAlpha();
  if (spriteIndex !== undefined) {
    const halfWidth = Math.floor(metadata.width / 2);
    const halfHeight = Math.floor(metadata.height / 2);
    image = image.extract({ left: (spriteIndex % 2) * halfWidth, top: Math.floor(spriteIndex / 2) * halfHeight, width: halfWidth, height: halfHeight });
  } else {
    image = image.extract({ left: 18, top: 18, width: metadata.width - 36, height: metadata.height - 36 });
  }
  const { data, info } = await image.resize(CONTENT_SIZE, CONTENT_SIZE, { fit: 'fill' }).raw().toBuffer({ resolveWithObject: true });
  return makeCanvas(data, info.width, info.height);
}

function targetFor(level: string) {
  if (level === 'easy') return { min: 8, max: 16, label: '8–16' };
  if (level === 'scene') return { min: 17, max: 30, label: '17–30' };
  return { min: 1, max: Number.POSITIVE_INFINITY, label: 'ตรวจครบ ไม่กำหนดจำนวน' };
}

async function main() {
  const audits: Audit[] = [];
  for (const picture of pictures) {
    const pixels = await renderAsset(picture.asset, picture.spriteIndex);
    const segmentation = findRegions({ width: SIZE, height: SIZE, data: pixels }, DEFAULT_MIN_REGION_AREA, pixels, picture.artVersion);
    const tooSmallRegions = segmentation.regions.filter(region => region.area >= 64 && (region.area < MIN_TOUCH_AREA || Math.min(region.maxX - region.minX + 1, region.maxY - region.minY + 1) < MIN_TOUCH_EDGE));
    const meaningfulDroppedRegions = segmentation.droppedRegions.filter(region => region.area >= MIN_MEANINGFUL_DROPPED_AREA);
    const target = targetFor(picture.level);
    const filled = paintRegions(segmentation, Object.fromEntries(segmentation.regions.map((_, index) => [index, '#E04444'])));
    let unpaintedWhitePixels = 0;
    for (let y = INSET + 1; y < SIZE - INSET - 1; y++) for (let x = INSET + 1; x < SIZE - INSET - 1; x++) {
      const offset = (y * SIZE + x) * 4;
      if (filled[offset] >= 180 && filled[offset + 1] >= 180 && filled[offset + 2] >= 180) unpaintedWhitePixels++;
    }
    // Region counts are informational: recognizable drawings and complete coverage take priority.
    const pass = meaningfulDroppedRegions.length === 0 && unpaintedWhitePixels === 0 && segmentation.regions.length > 0 && segmentation.borderRegions.length === 1;
    audits.push({
      id: picture.id,
      artVersion: picture.artVersion,
      level: picture.level,
      asset: picture.asset,
      regions: segmentation.regions.length,
      target: target.label,
      droppedRegions: segmentation.droppedRegions,
      tooSmallRegions,
      borderRegions: segmentation.borderRegions.length,
      representativePoints: segmentation.regions.map((region, regionIndex) => ({ region: regionIndex, x: region.seed % SIZE, y: Math.floor(region.seed / SIZE) })),
      unpaintedWhitePixels,
      pass,
    });
  }
  const failed = audits.filter(audit => !audit.pass);
  for (const audit of audits) console.log(`${audit.pass ? 'PASS' : 'FAIL'} ${audit.id}: ${audit.regions} regions (target ${audit.target}), dropped=${audit.droppedRegions.length}, tooSmall=${audit.tooSmallRegions.length}, border=${audit.borderRegions}, whiteRemaining=${audit.unpaintedWhitePixels}`);
  if (process.argv.includes('--json')) console.log(JSON.stringify(audits, null, 2));
  if (failed.length) {
    console.error(`Coloring asset audit failed for ${failed.length}/${audits.length} pictures.`);
    process.exitCode = 1;
  }
}

await main();
