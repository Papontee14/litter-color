'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BookOpen, Check, ChevronRight, Filter, Heart, Palette, Sparkles, Star, WandSparkles } from 'lucide-react';
import { categories, pictures, type PictureLevel } from '@/lib/pictures';

type Progress = Record<string, Record<number, string>>;
const progressKey = (p: typeof pictures[number]) => `${p.id}:${p.artVersion}`;

function readProgress(): Progress {
  try {
    const saved = JSON.parse(localStorage.getItem('taemsee-works-v2') || '{}');
    if (saved && typeof saved === 'object') return saved;
    const old = JSON.parse(localStorage.getItem('taemsee-works-v1') || 'null');
    if (Array.isArray(old)) {
      const migrated: Progress = {};
      pictures.filter(p => p.level === 'classic').forEach((p, i) => { const fills = old[i]?.fills ?? old[i]; if (fills && typeof fills === 'object') migrated[progressKey(p)] = fills; });
      return migrated;
    }
  } catch { /* local progress is optional */ }
  return {};
}

function Thumbnail({ picture }: { picture: typeof pictures[number] }) {
  if (picture.spriteIndex === undefined) return <img className="scene-thumb" src={picture.sample} alt="" loading="lazy" />;
  const position = [`0% 0%`, `100% 0%`, `0% 100%`, `100% 100%`][picture.spriteIndex];
  return <span className="sprite-thumb" style={{ backgroundImage: `url(${picture.sample})`, backgroundPosition: position }} />;
}

export default function Home() {
  const router = useRouter();
  const [category, setCategory] = useState<(typeof categories)[number]>('ทั้งหมด');
  const [level, setLevel] = useState<'all' | PictureLevel>('all');
  const [progress, setProgress] = useState<Progress>({});
  useEffect(() => {
    setProgress(readProgress());
    try { const saved = JSON.parse(sessionStorage.getItem('taemsee-gallery-view') || 'null'); if (saved) { setCategory(saved.category || 'ทั้งหมด'); setLevel(saved.level || 'all'); window.scrollTo(0, saved.scrollY || 0); } } catch { /* optional */ }
  }, []);
  const visible = useMemo(() => pictures.filter(p => (category === 'ทั้งหมด' || p.category === category) && (level === 'all' || p.level === level)), [category, level]);
  function openPicture(id: string) { try { sessionStorage.setItem('taemsee-gallery-view', JSON.stringify({ category, level, scrollY: window.scrollY })); } catch { /* optional */ } router.push(`/coloring/${id}`); }
  function status(p: typeof pictures[number]) { const count = Object.keys(progress[progressKey(p)] || {}).length; return count ? { label: 'กำลังเติม', kind: 'doing', count } : { label: 'ยังไม่ได้เริ่ม', kind: 'new', count }; }
  return <div className="gallery-shell">
    <header className="topbar"><a className="brand" href="/" aria-label="แต้มสี หน้าคลังภาพ"><span className="brand-icon"><Palette size={27} /></span><span>แต้ม<span className="brand-color">สี</span><small>โลกใบเล็ก สีสันใบใหญ่</small></span></a><nav><span className="nav-active"><BookOpen size={18} /> คลังภาพ</span><span className="made-for"><Heart size={16} /> เลือกภาพแล้วไปสนุกกัน</span></nav></header>
    <main className="gallery-main"><div className="gallery-intro"><div><div className="eyebrow">CHOOSE YOUR NEXT LITTLE ADVENTURE</div><h1>เลือกภาพที่อยากเติมสี <Sparkles className="heading-sparkle" /></h1><p>ทุกฉากรอให้หนูเติมสีสัน ลองเลือกภาพที่ชอบได้เลย</p></div><div className="intro-badge"><WandSparkles size={20} /><span><strong>{pictures.length} ภาพ</strong><small>พร้อมจินตนาการ</small></span></div></div>
      <section className="filters" aria-label="ตัวกรองภาพ"><div className="filter-title"><Filter size={16} /> เลือกดูตามใจ</div><div className="filter-row">{categories.map(c => <Button key={c} variant="ghost" className={`filter-chip ${category === c ? 'active' : ''}`} aria-pressed={category === c} onClick={() => setCategory(c)}>{c}</Button>)}</div><div className="level-row"><span>ระดับ</span><Button variant="ghost" className={level === 'all' ? 'active' : ''} onClick={() => setLevel('all')}>ทั้งหมด</Button><Button variant="ghost" className={level === 'easy' ? 'active' : ''} onClick={() => setLevel('easy')}>เริ่มง่าย ๆ</Button><Button variant="ghost" className={level === 'scene' ? 'active' : ''} onClick={() => setLevel('scene')}>ฉากสนุก</Button><Button variant="ghost" className={level === 'classic' ? 'active' : ''} onClick={() => setLevel('classic')}>ภาพคลาสสิก</Button></div></section>
      <div className="gallery-heading"><h2>{category === 'ทั้งหมด' ? 'ภาพทั้งหมด' : category}</h2><span>{visible.length} ภาพ</span></div>
      <section className="picture-grid" aria-live="polite">{visible.map(p => { const s = status(p); return <article className="gallery-card" key={p.id}><button className="gallery-card-button" onClick={() => openPicture(p.id)} aria-label={`เปิดภาพ ${p.name}`}><div className={`gallery-image level-${p.level}`}><Thumbnail picture={p} /><span className="level-pill">{p.level === 'easy' ? 'เริ่มง่าย ๆ' : p.level === 'scene' ? 'ฉากสนุก' : 'คลาสสิก'}</span></div><div className="gallery-card-body"><div><h3>{p.name}</h3><p>{p.description}</p></div><ChevronRight className="card-arrow" size={21} /></div><div className={`status ${s.kind}`}><span className="status-dot">{s.kind === 'doing' ? <Star size={11} /> : <span />}</span>{s.label}{s.count > 0 && <small>{s.count} ช่อง</small>}</div></button></article>; })}</section>
      {!visible.length && <div className="gallery-empty"><Palette size={31} /><p>ยังไม่มีภาพในหมวดนี้</p><Button onClick={() => { setCategory('ทั้งหมด'); setLevel('all'); }}>ดูภาพทั้งหมด</Button></div>}
      <div className="gallery-tip"><div className="tip-icon"><Heart size={18} /></div><div><strong>ทุกสีคือคำตอบที่ดี</strong><p>ไม่มีสีที่ผิด มีแต่สีที่หนูเลือกเอง</p></div><Check size={19} /></div><footer><span><Palette size={15} /> แต้มสี · ความสุขเล็ก ๆ ในทุกสี</span><span>สำหรับศิลปินตัวน้อยวัย 3–6 ปี <span className="footer-dot">•</span> ผลงานเก็บไว้ในเครื่องนี้</span></footer>
    </main></div>;
}
