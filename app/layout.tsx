import type { Metadata } from 'next';
import { Noto_Sans_Thai } from 'next/font/google';
import './globals.css';
const thai = Noto_Sans_Thai({ variable: '--font-thai', subsets: ['thai','latin'], weight: ['400','500','600','700','800'], display: 'swap' });
const title = 'แต้มสี — โลกใบเล็ก สีสันใบใหญ่';
const description = 'เลือกสีแล้วแตะเติมในรูป พื้นที่สร้างสรรค์แสนสนุกสำหรับเด็กอนุบาล พร้อมดาวน์โหลดผลงานของหนู';
export const metadata: Metadata = {
 metadataBase: new URL('https://taemsee-little-colors.papontee-s.chatgpt.site'), title, description, icons: { icon: '/favicon.svg' },
 openGraph: { title, description, locale: 'th_TH', type: 'website', images: [{ url: '/og.png', width: 1536, height: 1024, alt: title }] },
 twitter: { card: 'summary_large_image', title, description, images: ['/og.png'] }
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="th"><body className={thai.variable}>{children}</body></html>; }
