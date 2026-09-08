import { notFound } from 'next/navigation';
import ColoringClient from '../ColoringClient';
import { pictures } from '@/lib/pictures';

export default function ColoringPage({ params }: { params: { pictureId: string } }) {
  const picture = pictures.find(p => p.id === params.pictureId);
  if (!picture) notFound();
  return <ColoringClient key={`${picture.id}:${picture.artVersion}`} pictureId={picture.id} />;
}
