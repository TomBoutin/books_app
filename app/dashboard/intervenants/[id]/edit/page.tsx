import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Breadcrumbs from '@/app/ui/dashboard/intervenants/breadcrumbs';
import EditIntervenantForm from '@/app/ui/dashboard/intervenants/edit-form';
import { fetchIntervenantById } from '@/app/lib/data';

export const metadata: Metadata = {
  title: 'Modifier un intervenant',
};

export default async function Page(props: { params: { id: string } }) {
  const { id } = props.params;
  const intervenant = await fetchIntervenantById(id);

  if (!intervenant) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Intervenants', href: '/dashboard/intervenants' },
          {
            label: 'Modifier un intervenant',
            href: `/dashboard/intervenants/${id}/edit`,
            active: true,
          },
        ]}
      />
      <EditIntervenantForm intervenant={intervenant} />
    </main>
  );
}