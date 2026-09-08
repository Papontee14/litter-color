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
  description: string;
  spriteIndex?: number;
};

export const pictures: Picture[] = [
  { id: 'butterfly-garden', name: 'ผีเสื้อในสวน', category: 'สัตว์น่ารัก', level: 'easy', asset: '/scene-butterfly-garden.png', sample: '/scene-butterfly-garden.png', artVersion: 'scene-v1', description: 'ดอกไม้ เมฆ และท้องฟ้า' },
  { id: 'flower-fence', name: 'ดอกไม้ริมรั้ว', category: 'ธรรมชาติ', level: 'easy', asset: '/scene-flower-fence.png', sample: '/scene-flower-fence.png', artVersion: 'scene-v1', description: 'กระถาง รั้ว และพื้นหญ้า' },
  { id: 'whale-sea', name: 'วาฬกลางทะเล', category: 'สัตว์น่ารัก', level: 'easy', asset: '/scene-whale-sea.png', sample: '/scene-whale-sea.png', artVersion: 'scene-v1', description: 'น้ำ ท้องฟ้า และเมฆ' },
  { id: 'rabbit-carrot', name: 'กระต่ายสวนแครอต', category: 'สัตว์น่ารัก', level: 'easy', asset: '/scene-rabbit-carrot.png', sample: '/scene-rabbit-carrot.png', artVersion: 'scene-v1', description: 'แครอต หญ้า และดวงอาทิตย์' },
  { id: 'cat-window', name: 'แมวริมหน้าต่าง', category: 'สัตว์น่ารัก', level: 'easy', asset: '/scene-cat-window.png', sample: '/scene-cat-window.png', artVersion: 'scene-v1', description: 'เบาะ หน้าต่าง และท้องฟ้า' },
  { id: 'turtle-pond', name: 'เต่าริมสระ', category: 'สัตว์น่ารัก', level: 'easy', asset: '/scene-turtle-pond.png', sample: '/scene-turtle-pond.png', artVersion: 'scene-v1', description: 'น้ำ ใบบัว และก้อนหิน' },
  { id: 'garden-house', name: 'บ้านในสวน', category: 'ธรรมชาติ', level: 'scene', asset: '/scene-garden-house.png', sample: '/scene-garden-house.png', artVersion: 'scene-v1', description: 'ต้นไม้ ทางเดิน รั้ว และเมฆ' },
  { id: 'elephant-water', name: 'ช้างเล่นน้ำ', category: 'สัตว์น่ารัก', level: 'scene', asset: '/scene-elephant-water.png', sample: '/scene-elephant-water.png', artVersion: 'scene-v1', description: 'บ่อน้ำ ต้นไม้ และเนินหญ้า' },
  { id: 'train-country', name: 'รถไฟผ่านชนบท', category: 'ยานพาหนะ', level: 'scene', asset: '/scene-train-country.png', sample: '/scene-train-country.png', artVersion: 'scene-v1', description: 'ตู้รถไฟ ราง เนินเขา และเมฆ' },
  { id: 'rocket-space', name: 'จรวดท่องอวกาศ', category: 'จินตนาการ', level: 'scene', asset: '/scene-rocket-space.png', sample: '/scene-rocket-space.png', artVersion: 'scene-v1', description: 'ดาวเคราะห์ ดาวดวงใหญ่ และอวกาศ' },
  { id: 'dinosaur-land', name: 'ไดโนเสาร์เดินเล่น', category: 'จินตนาการ', level: 'scene', asset: '/scene-dinosaur-land.png', sample: '/scene-dinosaur-land.png', artVersion: 'scene-v1', description: 'ภูเขา ต้นไม้ และแอ่งน้ำ' },
  { id: 'fairy-castle', name: 'ปราสาทในเทพนิยาย', category: 'จินตนาการ', level: 'scene', asset: '/scene-fairy-castle.png', sample: '/scene-fairy-castle.png', artVersion: 'scene-v1', description: 'หอคอย ธง ทางเดิน และเนินหญ้า' },
  { id: 'classic-butterfly', name: 'ผีเสื้อแสนสวย', category: 'ภาพคลาสสิก', level: 'classic', asset: '/coloring-sheet.png', sample: '/coloring-sheet.png', artVersion: 'classic-v1', description: 'ภาพเดิมจากชุดเริ่มต้น', spriteIndex: 0 },
  { id: 'classic-flower', name: 'ดอกไม้ยิ้มแฉ่ง', category: 'ภาพคลาสสิก', level: 'classic', asset: '/coloring-sheet.png', sample: '/coloring-sheet.png', artVersion: 'classic-v1', description: 'ภาพเดิมจากชุดเริ่มต้น', spriteIndex: 1 },
  { id: 'classic-house', name: 'บ้านแสนอบอุ่น', category: 'ภาพคลาสสิก', level: 'classic', asset: '/coloring-sheet.png', sample: '/coloring-sheet.png', artVersion: 'classic-v1', description: 'ภาพเดิมจากชุดเริ่มต้น', spriteIndex: 2 },
  { id: 'classic-whale', name: 'วาฬน้อยใจดี', category: 'ภาพคลาสสิก', level: 'classic', asset: '/coloring-sheet.png', sample: '/coloring-sheet.png', artVersion: 'classic-v1', description: 'ภาพเดิมจากชุดเริ่มต้น', spriteIndex: 3 },
];

export const categories: Array<'ทั้งหมด' | PictureCategory> = ['ทั้งหมด', 'สัตว์น่ารัก', 'ธรรมชาติ', 'ยานพาหนะ', 'จินตนาการ', 'ภาพคลาสสิก'];
