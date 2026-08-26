import type { Metadata } from 'next';
import ClipStudio from './ClipStudio';

export const metadata: Metadata = {
  title: 'Clip Studio — clips viraux de 30 secondes',
  description:
    'Découpe une vidéo longue en clips verticaux prêts à publier : détection automatique des moments forts, recadrage 9:16, accroche et export. 100 % dans le navigateur.',
};

export default function ClipsPage() {
  return <ClipStudio />;
}
