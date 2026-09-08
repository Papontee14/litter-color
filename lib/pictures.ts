export type PictureLevel = 'easy' | 'scene' | 'classic';
export type PictureCategory = 'สัตว์น่ารัก' | 'ธรรมชาติ' | 'ยานพาหนะ' | 'จินตนาการ' | 'ภาพคลาสสิก';

export type Picture = {
  id: string;
  name: string;
  category: PictureCategory;
  level: PictureLevel;
  asset: string;
  sample: string;
  artVersion: string;
  legacyAsset?: string;
  description: string;
  spriteIndex?: number;
};

export const pictures: Picture[] = [
  { id: 'butterfly-garden', name: 'ผีเสื้อในสวน', category: 'สัตว์น่ารัก', level: 'easy', asset: '/legacy/scene-butterfly-garden-scene-v1.png', sample: '/legacy/scene-butterfly-garden-scene-v1.png', artVersion: 'scene-v3', legacyAsset: '/legacy/scene-butterfly-garden-scene-v1.png', description: 'ดอกไม้ เมฆ และท้องฟ้า' },
  { id: 'flower-fence', name: 'ดอกไม้ริมรั้ว', category: 'ธรรมชาติ', level: 'easy', asset: '/legacy/scene-flower-fence-scene-v1.png', sample: '/legacy/scene-flower-fence-scene-v1.png', artVersion: 'scene-v3', legacyAsset: '/legacy/scene-flower-fence-scene-v1.png', description: 'กระถาง รั้ว และพื้นหญ้า' },
  { id: 'whale-sea', name: 'วาฬกลางทะเล', category: 'สัตว์น่ารัก', level: 'easy', asset: '/legacy/scene-whale-sea-scene-v1.png', sample: '/legacy/scene-whale-sea-scene-v1.png', artVersion: 'scene-v3', legacyAsset: '/legacy/scene-whale-sea-scene-v1.png', description: 'น้ำ ท้องฟ้า และเมฆ' },
  { id: 'rabbit-carrot', name: 'กระต่ายสวนแครอต', category: 'สัตว์น่ารัก', level: 'easy', asset: '/legacy/scene-rabbit-carrot-scene-v1.png', sample: '/legacy/scene-rabbit-carrot-scene-v1.png', artVersion: 'scene-v3', legacyAsset: '/legacy/scene-rabbit-carrot-scene-v1.png', description: 'แครอต หญ้า และดวงอาทิตย์' },
  { id: 'cat-window', name: 'แมวริมหน้าต่าง', category: 'สัตว์น่ารัก', level: 'easy', asset: '/legacy/scene-cat-window-scene-v1.png', sample: '/legacy/scene-cat-window-scene-v1.png', artVersion: 'scene-v3', legacyAsset: '/legacy/scene-cat-window-scene-v1.png', description: 'เบาะ หน้าต่าง และท้องฟ้า' },
  { id: 'turtle-pond', name: 'เต่าริมสระ', category: 'สัตว์น่ารัก', level: 'easy', asset: '/legacy/scene-turtle-pond-scene-v1.png', sample: '/legacy/scene-turtle-pond-scene-v1.png', artVersion: 'scene-v3', legacyAsset: '/legacy/scene-turtle-pond-scene-v1.png', description: 'น้ำ ใบบัว และก้อนหิน' },
  { id: 'garden-house', name: 'บ้านในสวน', category: 'ธรรมชาติ', level: 'scene', asset: '/legacy/scene-garden-house-scene-v1.png', sample: '/legacy/scene-garden-house-scene-v1.png', artVersion: 'scene-v3', legacyAsset: '/legacy/scene-garden-house-scene-v1.png', description: 'ต้นไม้ ทางเดิน รั้ว และเมฆ' },
  { id: 'elephant-water', name: 'ช้างเล่นน้ำ', category: 'สัตว์น่ารัก', level: 'scene', asset: '/legacy/scene-elephant-water-scene-v1.png', sample: '/legacy/scene-elephant-water-scene-v1.png', artVersion: 'scene-v3', legacyAsset: '/legacy/scene-elephant-water-scene-v1.png', description: 'บ่อน้ำ ต้นไม้ และเนินหญ้า' },
  { id: 'train-country', name: 'รถไฟผ่านชนบท', category: 'ยานพาหนะ', level: 'scene', asset: '/legacy/scene-train-country-scene-v1.png', sample: '/legacy/scene-train-country-scene-v1.png', artVersion: 'scene-v3', legacyAsset: '/legacy/scene-train-country-scene-v1.png', description: 'ตู้รถไฟ ราง เนินเขา และเมฆ' },
  { id: 'rocket-space', name: 'จรวดท่องอวกาศ', category: 'จินตนาการ', level: 'scene', asset: '/legacy/scene-rocket-space-scene-v1.png', sample: '/legacy/scene-rocket-space-scene-v1.png', artVersion: 'scene-v3', legacyAsset: '/legacy/scene-rocket-space-scene-v1.png', description: 'ดาวเคราะห์ ดาวดวงใหญ่ และอวกาศ' },
  { id: 'dinosaur-land', name: 'ไดโนเสาร์เดินเล่น', category: 'จินตนาการ', level: 'scene', asset: '/legacy/scene-dinosaur-land-scene-v1.png', sample: '/legacy/scene-dinosaur-land-scene-v1.png', artVersion: 'scene-v3', legacyAsset: '/legacy/scene-dinosaur-land-scene-v1.png', description: 'ภูเขา ต้นไม้ และแอ่งน้ำ' },
  { id: 'fairy-castle', name: 'ปราสาทในเทพนิยาย', category: 'จินตนาการ', level: 'scene', asset: '/legacy/scene-fairy-castle-scene-v1.png', sample: '/legacy/scene-fairy-castle-scene-v1.png', artVersion: 'scene-v3', legacyAsset: '/legacy/scene-fairy-castle-scene-v1.png', description: 'หอคอย ธง ทางเดิน และเนินหญ้า' },
  { id: 'classic-butterfly', name: 'ผีเสื้อแสนสวย', category: 'ภาพคลาสสิก', level: 'classic', asset: '/coloring-sheet.png', sample: '/coloring-sheet.png', artVersion: 'classic-v1', description: 'ภาพเดิมจากชุดเริ่มต้น', spriteIndex: 0 },
  { id: 'classic-flower', name: 'ดอกไม้ยิ้มแฉ่ง', category: 'ภาพคลาสสิก', level: 'classic', asset: '/coloring-sheet.png', sample: '/coloring-sheet.png', artVersion: 'classic-v1', description: 'ภาพเดิมจากชุดเริ่มต้น', spriteIndex: 1 },
  { id: 'classic-house', name: 'บ้านแสนอบอุ่น', category: 'ภาพคลาสสิก', level: 'classic', asset: '/coloring-sheet.png', sample: '/coloring-sheet.png', artVersion: 'classic-v1', description: 'ภาพเดิมจากชุดเริ่มต้น', spriteIndex: 2 },
  { id: 'classic-whale', name: 'วาฬน้อยใจดี', category: 'ภาพคลาสสิก', level: 'classic', asset: '/coloring-sheet.png', sample: '/coloring-sheet.png', artVersion: 'classic-v1', description: 'ภาพเดิมจากชุดเริ่มต้น', spriteIndex: 3 },
];

export const categories: Array<'ทั้งหมด' | PictureCategory> = ['ทั้งหมด', 'สัตว์น่ารัก', 'ธรรมชาติ', 'ยานพาหนะ', 'จินตนาการ', 'ภาพคลาสสิก'];
