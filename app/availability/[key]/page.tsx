import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { fetchIntervenantByKey } from '@/app/lib/data';
import Calendar from '@/app/ui/calendar';

export const metadata: Metadata = {
  title: 'Accueil',
};

export default async function Page(props: { params: { key: string } }) {
  const { key } = props.params;
  const intervenant = await fetchIntervenantByKey(key);

  if (!intervenant) {
    notFound();
  }

  const currentDate = new Date();
  const endDate = new Date(intervenant.enddate);

  if (currentDate > endDate) {
    return (
      <main className="flex h-full flex-col items-center justify-center gap-2 min-h-dvh">
        <h2 className="text-xl font-semibold">Clé expirée</h2>
        <p>Votre clé d'accès est expirée</p>
      </main>
    );
  }

  return (
    <main className="h-full min-h-dvh p-10">
      <h2 className="text-xl font-semibold">Bonjour {intervenant.firstname} {intervenant.lastname}</h2>
      <Calendar />
    </main>
  );
}