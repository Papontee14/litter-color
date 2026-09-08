export type RegionSummary = {
  area: number;
  seed: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  centroidX: number;
  centroidY: number;
};

export type Region = RegionSummary & { pixels: number[] };

export type Segmentation = {
  width: number;
  height: number;
  original: Uint8ClampedArray;
  labels: Int32Array;
  regions: Region[];
  droppedRegions: RegionSummary[];
  borderRegions: RegionSummary[];
  minArea: number;
  artVersion: string;
};

// Smaller components are antialiasing specks rather than useful touch targets.
// They are reported so an asset audit can catch them instead of hiding them.
export const DEFAULT_MIN_REGION_AREA = 4;

// Segment original line art once, keeping boundaries independent of chosen colors.
export function findRegions(
  image: { width: number; height: number; data: Uint8ClampedArray },
  minArea = DEFAULT_MIN_REGION_AREA,
  originalData = image.data,
  artVersion = 'region-v1',
): Segmentation {
  const { width, height, data } = image;
  const labels = new Int32Array(width * height).fill(-1);
  const seen = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  const regions: Region[] = [];
  const droppedRegions: RegionSummary[] = [];
  const borderRegions: RegionSummary[] = [];

  for (let seed = 0; seed < labels.length; seed++) {
    if (seen[seed] || data[seed * 4] < 180 || data[seed * 4 + 1] < 180 || data[seed * 4 + 2] < 180) continue;
    let head = 0;
    let tail = 1;
    let border = false;
    queue[0] = seed;
    seen[seed] = 1;
    const pixels: number[] = [];
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    let sumX = 0;
    let sumY = 0;

    while (head < tail) {
      const p = queue[head++];
      const x = p % width;
      const y = Math.floor(p / width);
      pixels.push(p);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      sumX += x;
      sumY += y;
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) border = true;
      for (const n of [x > 0 ? p - 1 : -1, x < width - 1 ? p + 1 : -1, y > 0 ? p - width : -1, y < height - 1 ? p + width : -1]) {
        if (n < 0 || seen[n]) continue;
        seen[n] = 1;
        if (data[n * 4] >= 180 && data[n * 4 + 1] >= 180 && data[n * 4 + 2] >= 180) queue[tail++] = n;
      }
    }

    const summary: RegionSummary = {
      area: pixels.length,
      seed,
      minX,
      minY,
      maxX,
      maxY,
      centroidX: sumX / pixels.length,
      centroidY: sumY / pixels.length,
    };
    if (border) borderRegions.push(summary);
    else if (pixels.length < minArea) droppedRegions.push(summary);
    else {
      for (const p of pixels) labels[p] = regions.length;
      regions.push({ ...summary, pixels });
    }
  }

  return { width, height, original: new Uint8ClampedArray(originalData), labels, regions, droppedRegions, borderRegions, minArea, artVersion };
}

export type FillMigration = { fills: Record<number, string>; migrated: number; unmatched: number[] };

// Best-effort migration for artwork that kept the same shapes. A fill is copied
// only when its old mask has one strong match in the new segmentation.
export function migrateFills(oldSegmentation: Segmentation, newSegmentation: Segmentation, fills: Record<number, string>, minOverlap = 0.8): FillMigration {
  const used = new Set<number>();
  const migrated: Record<number, string> = {};
  const unmatched: number[] = [];
  const newSets = newSegmentation.regions.map(region => new Set(region.pixels));
  for (const [oldKey, color] of Object.entries(fills)) {
    const oldIndex = Number(oldKey);
    const oldRegion = oldSegmentation.regions[oldIndex];
    if (!oldRegion) {
      unmatched.push(oldIndex);
      continue;
    }
    let best = -1;
    let bestOverlap = 0;
    let tied = false;
    for (let i = 0; i < newSegmentation.regions.length; i++) {
      if (used.has(i)) continue;
      let overlap = 0;
      for (const pixel of oldRegion.pixels) if (newSets[i].has(pixel)) overlap++;
      const ratio = overlap / oldRegion.area;
      if (ratio > bestOverlap + 0.0001) {
        best = i;
        bestOverlap = ratio;
        tied = false;
      } else if (Math.abs(ratio - bestOverlap) <= 0.0001 && ratio > 0) tied = true;
    }
    if (best >= 0 && bestOverlap >= minOverlap && !tied) {
      migrated[best] = color;
      used.add(best);
    } else unmatched.push(oldIndex);
  }
  return { fills: migrated, migrated: Object.keys(migrated).length, unmatched };
}

export function paintRegions(segmentation: Segmentation, fills: Record<number, string>): Uint8ClampedArray<ArrayBuffer> {
  const output = new Uint8ClampedArray(segmentation.original);
  for (const [key, hex] of Object.entries(fills)) {
    const region = segmentation.regions[Number(key)];
    if (!region || !/^#[0-9a-f]{6}$/i.test(hex)) continue;
    const rgb = [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
    for (const p of region.pixels) for (let c = 0; c < 3; c++) output[p * 4 + c] = rgb[c] * segmentation.original[p * 4 + c] / 255;
  }
  return output;
}
