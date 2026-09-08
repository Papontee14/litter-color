'use client';

import { flushSync } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Check, Download, Eraser, Heart, Palette, RotateCcw, Sparkles, Undo2, Volume2, VolumeX, X } from 'lucide-react';
import { DEFAULT_MIN_REGION_AREA, findRegions, migrateFills, paintRegions, type Segmentation } from '@/lib/coloring';
import { pictures } from '@/lib/pictures';
import { palette } from '@/lib/palette';
import { registerColoringTools } from '@/lib/webmcp';

const SIZE = 640;
type Fills = Record<number, string>;
type Work = { fills: Fills; history: Fills[] };
type Stored = Record<string, Fills>;
const keyFor = (p: typeof pictures[number]) => `${p.id}:${p.artVersion}`;

function safeStored(): Stored {
  try {
    const parsed = JSON.parse(localStorage.getItem('taemsee-works-v2') || '{}');
    const saved: Stored = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    const old = JSON.parse(localStorage.getItem('taemsee-works-v1') || 'null');
    if (Array.isArray(old)) {
      const classic = pictures.filter(p => p.level === 'classic');
      classic.forEach((p, i) => { const fills = old[i]?.fills ?? old[i]; if (fills && typeof fills === 'object' && !saved[keyFor(p)]) saved[keyFor(p)] = fills; });
    }
    return saved;
  } catch { /* local progress is optional */ }
  return {};
}

function drawSource(ctx: CanvasRenderingContext2D, picture: typeof pictures[number], img: HTMLImageElement) {
  const inset = 30; const size = SIZE - inset * 2;
  ctx.clearRect(0, 0, SIZE, SIZE); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, SIZE, SIZE);
  if (picture.spriteIndex === undefined) ctx.drawImage(img, 18, 18, img.width - 36, img.height - 36, inset, inset, size, size);
  else { const sx = (picture.spriteIndex % 2) * img.width / 2; const sy = Math.floor(picture.spriteIndex / 2) * img.height / 2; ctx.drawImage(img, sx, sy, img.width / 2, img.height / 2, inset, inset, size, size); }
}

function addVirtualBorder(ctx: CanvasRenderingContext2D) {
  const inset = 30; const px = ctx.getImageData(0, 0, SIZE, SIZE); const set = (x: number, y: number) => { const i = (y * SIZE + x) * 4; px.data[i] = 0; px.data[i + 1] = 0; px.data[i + 2] = 0; px.data[i + 3] = 255; };
  for (let x = inset; x < SIZE - inset; x++) { set(x, inset); set(x, SIZE - inset - 1); }
  for (let y = inset; y < SIZE - inset; y++) { set(inset, y); set(SIZE - inset - 1, y); }
  return px;
}

export default function ColoringClient({ pictureId }: { pictureId: string }) {
  const router = useRouter(); const picture = pictures.find(p => p.id === pictureId)!;
  const [work, setWork] = useState<Work>({ fills: {}, history: [] }); const [segmentation, setSegmentation] = useState<Segmentation | null>(null);
  const [color, setColor] = useState<string>(palette[0][0]); const [erasing, setErasing] = useState(false); const [moreColors, setMoreColors] = useState(false);
  const [error, setError] = useState(false); const [notice, setNotice] = useState('เลือกสี แล้วแตะในช่องของภาพได้เลย'); const [sound, setSound] = useState(false); const [resetOpen, setResetOpen] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [keyboardRegion, setKeyboardRegion] = useState(-1); const canvas = useRef<HTMLCanvasElement>(null); const audio = useRef<AudioContext | null>(null);
  const total = segmentation?.regions.length ?? 0; const completed = Object.keys(work.fills).filter(k => Number(k) < total).length;

  useEffect(() => { setStorageReady(false); const saved = safeStored()[keyFor(picture)] || {}; setWork({ fills: saved, history: [] }); }, [picture]);
  useEffect(() => { if (!storageReady) return; try { const stored = safeStored(); stored[keyFor(picture)] = work.fills; localStorage.setItem('taemsee-works-v2', JSON.stringify(stored)); } catch { /* optional */ } }, [work.fills, picture, storageReady]);
  useEffect(() => {
    let active = true; setSegmentation(null); setError(false); setKeyboardRegion(-1); const img = new Image(); img.src = picture.asset;
    img.onload = () => { if (!active) return; const output = document.createElement('canvas'); output.width = SIZE; output.height = SIZE; const ctx = output.getContext('2d', { willReadFrequently: true })!; drawSource(ctx, picture, img); const original = new Uint8ClampedArray(ctx.getImageData(0, 0, SIZE, SIZE).data); const virtual = addVirtualBorder(ctx); const found = findRegions({ width: SIZE, height: SIZE, data: virtual.data }, DEFAULT_MIN_REGION_AREA, original, picture.artVersion); setSegmentation(found); };
    img.onerror = () => { if (active) setError(true); }; return () => { active = false; };
  }, [picture]);
  useEffect(() => {
    if (!segmentation) return;
    let active = true;
    const currentKey = keyFor(picture);
    const stored = safeStored();
    if (stored[currentKey] || !picture.legacyAsset) { setStorageReady(true); return () => { active = false; }; }
    const legacyKey = `${picture.id}:${picture.artVersion.replace(/-v\d+$/, '-v1')}`;
    const oldFills = stored[legacyKey];
    if (!oldFills || Object.keys(oldFills).length === 0) { setStorageReady(true); return () => { active = false; }; }
    const legacyImg = new Image(); legacyImg.src = picture.legacyAsset;
    legacyImg.onload = () => {
      if (!active) return;
      const output = document.createElement('canvas'); output.width = SIZE; output.height = SIZE;
      const ctx = output.getContext('2d', { willReadFrequently: true })!; drawSource(ctx, picture, legacyImg);
      const original = new Uint8ClampedArray(ctx.getImageData(0, 0, SIZE, SIZE).data); const virtual = addVirtualBorder(ctx);
      const oldSeg = findRegions({ width: SIZE, height: SIZE, data: virtual.data }, DEFAULT_MIN_REGION_AREA, original, legacyKey.split(':')[1]);
      const migrated = migrateFills(oldSeg, segmentation, oldFills);
      setWork({ fills: migrated.fills, history: [] });
      if (migrated.unmatched.length) setNotice(`à¸¡à¸µ ${migrated.unmatched.length} à¸Šà¹ˆà¸­à¸‡à¸—à¸µà¹ˆà¸•à¹‰à¸­à¸‡à¹€à¸•à¸´à¸¡à¹ƒà¸«à¸¡à¹ˆ`);
      setStorageReady(true);
    };
    legacyImg.onerror = () => { if (active) setStorageReady(true); };
    return () => { active = false; };
  }, [segmentation, picture]);
  useEffect(() => { if (!segmentation || !canvas.current) return; const ctx = canvas.current.getContext('2d')!; ctx.putImageData(new ImageData(paintRegions(segmentation, work.fills), SIZE, SIZE), 0, 0); if (keyboardRegion >= 0 && segmentation.regions[keyboardRegion]) { const r = segmentation.regions[keyboardRegion]; ctx.strokeStyle = '#7760b4'; ctx.lineWidth = 3; ctx.setLineDash([6, 6]); ctx.strokeRect(r.minX - 4, r.minY - 4, r.maxX - r.minX + 8, r.maxY - r.minY + 8); } }, [segmentation, work.fills, keyboardRegion]);

  function fill(region: number, chosen = color, erase = erasing) {
    if (!segmentation || region < 0 || region >= total) return; if ((erase && !work.fills[region]) || (!erase && work.fills[region] === chosen)) return;
    setWork(w => { const fills = { ...w.fills }; if (erase) delete fills[region]; else fills[region] = chosen; return { fills, history: [...w.history.slice(-29), w.fills] }; }); setNotice(erase ? 'ลบสีแล้ว ลองสีใหม่ได้เลย' : 'สวยจัง! เติมจินตนาการต่อได้เลย');
    if (sound) try { audio.current ??= new AudioContext(); void audio.current.resume(); const ctx = audio.current; const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.connect(gain); gain.connect(ctx.destination); osc.frequency.value = 480 + region * 25; gain.gain.setValueAtTime(.06, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .18); osc.start(); osc.stop(ctx.currentTime + .18); } catch { /* optional */ }
  }
  function undo() { setWork(w => w.history.length ? { fills: w.history.at(-1)!, history: w.history.slice(0, -1) } : w); setNotice('ย้อนกลับให้แล้ว ลองใหม่ได้เสมอ'); }
  function reset() { setWork(w => ({ fills: {}, history: [...w.history.slice(-29), w.fills] })); setResetOpen(false); setNotice('กระดาษพร้อมแล้ว มาเติมสีใหม่กัน'); }
  function download() { if (!segmentation) return; const c = document.createElement('canvas'); c.width = SIZE; c.height = SIZE; c.getContext('2d')!.putImageData(new ImageData(paintRegions(segmentation, work.fills), SIZE, SIZE), 0, 0); c.toBlob(blob => { if (!blob) return; const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `แต้มสี-${picture.name}.png`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 2000); setNotice('ดาวน์โหลดรูปแล้ว เก่งมากเลย!'); }); }
  const bridge = useRef({ read: () => ({ pictureId: picture.id, artVersion: picture.artVersion, total, fills: work.fills, colors: palette.map(c => c[0]) }), fill: (id: number, hex: string) => fill(id, hex, false) }); bridge.current = { read: () => ({ pictureId: picture.id, artVersion: picture.artVersion, total, fills: work.fills, colors: palette.map(c => c[0]) }), fill: (id, hex) => fill(id, hex, false) }; useEffect(() => registerColoringTools(() => bridge.current.read(), (id, hex) => flushSync(() => bridge.current.fill(id, hex))), []);

  return <div className="app-shell"><header className="topbar"><button className="back-link" onClick={() => router.back()}><ArrowLeft size={18} /> กลับไปเลือกภาพ</button><a className="brand" href="/" aria-label="แต้มสี หน้าคลังภาพ"><span className="brand-icon"><Palette size={27} /></span><span>แต้ม<span className="brand-color">สี</span><small>โลกใบเล็ก สีสันใบใหญ่</small></span></a><Button variant="ghost" className="sound-button" onClick={() => setSound(!sound)} aria-pressed={sound}>{sound ? <Volume2 /> : <VolumeX />}<span>เสียง{sound ? 'เปิด' : 'ปิด'}</span></Button></header>
    <main><div className="welcome"><div><div className="eyebrow">{picture.level === 'scene' ? 'A LITTLE WORLD TO COLOR' : 'LET’S MAKE SOMETHING COLORFUL'}</div><h1>{picture.name} <Sparkles className="heading-sparkle" /></h1><p>{picture.description} · แตะช่องไหนก่อนก็ได้</p></div><div className="art-count large">{completed}<span> / {total} ช่อง</span></div></div>
      <div className="coloring-layout"><section className="art-panel"><div className="canvas-wrap"><canvas ref={canvas} width={SIZE} height={SIZE} tabIndex={0} aria-label="รูปสำหรับเติมสี" onPointerDown={e => { if (!segmentation) return; const rect = e.currentTarget.getBoundingClientRect(); const x = Math.max(0, Math.min(SIZE - 1, Math.floor((e.clientX - rect.left) * SIZE / rect.width))); const y = Math.max(0, Math.min(SIZE - 1, Math.floor((e.clientY - rect.top) * SIZE / rect.height))); setKeyboardRegion(-1); const id = segmentation.labels[y * SIZE + x]; if (id < 0) setNotice('ลองแตะในช่องว่างด้านในรูปนะ'); else fill(id); }} onKeyDown={e => { if (!total) return; if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key)) { e.preventDefault(); setKeyboardRegion(k => (k + (['ArrowLeft', 'ArrowUp'].includes(e.key) ? -1 : 1) + total) % total); } if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (keyboardRegion < 0) setKeyboardRegion(0); else fill(keyboardRegion); } }} />{!segmentation && <div className="canvas-status">{error ? <><p>โหลดรูปไม่สำเร็จ</p><Button onClick={() => window.location.reload()}>ลองอีกครั้ง</Button></> : 'กำลังเตรียมฉากน่ารัก ๆ…'}</div>}</div><div className="art-toolbar"><div className="tool-buttons"><Button variant="ghost" onClick={undo} disabled={!work.history.length}><Undo2 /> ย้อนกลับ</Button><Button variant="ghost" className={erasing ? 'tool-active' : ''} onClick={() => setErasing(!erasing)} aria-pressed={erasing}><Eraser /> ยางลบ</Button><Button variant="ghost" onClick={() => setResetOpen(true)} disabled={!completed}><RotateCcw /> เริ่มใหม่</Button></div><span className="canvas-hint">{notice}</span></div></section>
        <aside className="palette-panel"><div className="section-label"><span className="step mint">1</span><h2>เลือกสีแสนสนุก</h2></div><p className="palette-subtitle">สีหลัก 12 สี · สีเพิ่มเติมอีก 8 สี</p><div className="color-grid">{palette.slice(0, moreColors ? palette.length : 12).map(([hex, name]) => <Button key={hex} className={`swatch ${color === hex && !erasing ? 'chosen' : ''}`} style={{ backgroundColor: hex }} onClick={() => { setColor(hex); setErasing(false); setNotice(`เลือกสี${name}แล้ว แตะในรูปได้เลย`); }} aria-label={`สี${name}`} aria-pressed={color === hex && !erasing}>{color === hex && !erasing && <Check style={{ color: hex === '#FFFFFF' ? '#615374' : '#fff' }} />}</Button>)}</div><Button variant="ghost" className="more-colors" onClick={() => setMoreColors(!moreColors)}>{moreColors ? 'ซ่อนสีเพิ่มเติม' : '+ สีเพิ่มเติม 8 สี'}</Button><div className="selected-color"><span style={{ background: erasing ? '#fff' : color }}>{erasing && <Eraser size={18} />}</span><div><small>กำลังใช้</small><strong>{erasing ? 'ยางลบ' : `สี${palette.find(c => c[0] === color)?.[1]}`}</strong></div><Check size={16} /></div><div className="palette-divider" /><div className="progress-copy"><span>เติมความสดใสไปแล้ว</span><strong>{completed}<small> / {total} ช่อง</small></strong></div><div className="progress-track"><div style={{ width: `${total ? completed / total * 100 : 0}%` }} /></div><p className="encouragement">{completed === total && total > 0 ? 'เย้! เติมสีครบแล้ว เก่งมากเลย 🎉' : 'ค่อย ๆ เติม ตามใจหนูเลย'}</p><Button className="download-button" onClick={download} disabled={!segmentation}><Download /> เก็บผลงานของหนู</Button><small className="download-note">ดาวน์โหลดเป็นรูปภาพได้เลย</small></aside></div>
      <div className="bottom-strip"><span><Heart size={16} /> ทุกสีคือคำตอบที่ดี</span><span>แตะสี แล้วแตะช่องในภาพได้เลย</span></div></main>
    <Dialog open={resetOpen} onOpenChange={open => !open && setResetOpen(false)}><DialogContent className="modal"><Button variant="ghost" className="modal-close" aria-label="ปิด" onClick={() => setResetOpen(false)}><X /></Button><span className="modal-icon"><RotateCcw size={32} /></span><DialogTitle>เริ่มรูปนี้ใหม่ไหม?</DialogTitle><DialogDescription>สีในรูปนี้จะถูกล้างออก<br />ถ้าเปลี่ยนใจ ยังใช้ปุ่มย้อนกลับได้</DialogDescription><Button className="download-button" onClick={reset}>เริ่มใหม่เลย</Button></DialogContent></Dialog>
  </div>;
}
