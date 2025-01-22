import Form from '@/app/ui/dashboard/books/create-form';
import Breadcrumbs from '@/app/ui/dashboard/books/breadcrumbs';
import { Metadata } from 'next';
 
export const metadata: Metadata = {
  title: 'Créer un livre',
};
export default async function Page() {
 
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Livres', href: '/dashboard/books' },
          {
            label: 'Créer un livre',
            href: '/dashboard/books/create',
            active: true,
          },
        ]}
      />
      <Form />
    </main>
  );
}