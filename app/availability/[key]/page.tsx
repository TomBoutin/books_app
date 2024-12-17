import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { fetchIntervenantByKey } from '@/app/lib/data';
import Calendar from '@/app/ui/availability/calendar';

export const metadata: Metadata = {
  title: 'Accueil',
};

export default async function Page(props: { params: Promise<{ key: string }> }) {
  const { key } = await props.params;
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
    <main className="h-full min-h-dvh flex">
      <div className='max-w-60 w-full bg-slate-200 px-3 pt-5 sidenav'>
        <h2 className='py-2'>Logo</h2>
      </div>
      <div className='w-full mt-5 mx-5'>
        <h2 className="text-xl font-semibold">Bonjour {intervenant.firstname} {intervenant.lastname}</h2>
        <Calendar availability={intervenant.availability} intervenantId={intervenant.id} key={intervenant.key}/>
      </div>
    </main>
  );
}