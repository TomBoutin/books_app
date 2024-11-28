import Link from 'next/link';
import { FaceFrownIcon } from '@heroicons/react/24/outline';
 
export default function NotFound() {
  return (
    <main className="flex h-full flex-col items-center justify-center gap-2">
      <FaceFrownIcon className="w-10 text-gray-400" />
      <h2 className="text-xl font-semibold">404 Non trouvé</h2>
      <p>Pas de clé trouvé.</p>
      <Link
        href="/dashboard/invoices"
        className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-white transition-colors hover:bg-opacity-90"
      >
        Retour
      </Link>
    </main>
  );
}