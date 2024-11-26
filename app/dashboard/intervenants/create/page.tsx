import Form from '@/app/ui/dashboard/intervenants/create-form';
import Breadcrumbs from '@/app/ui/dashboard/intervenants/breadcrumbs';
import { Metadata } from 'next';
 
export const metadata: Metadata = {
  title: 'Créer un intervenants',
};
export default async function Page() {
 
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Intervenants', href: '/dashboard/intervenants' },
          {
            label: 'Créer un intervenant',
            href: '/dashboard/intervenants/create',
            active: true,
          },
        ]}
      />
      <Form />
    </main>
  );
}