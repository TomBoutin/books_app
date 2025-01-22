import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Breadcrumbs from '@/app/ui/dashboard/books/breadcrumbs';
import EditBookForm from '@/app/ui/dashboard/books/edit-form';
import { fetchBookById } from '@/app/lib/data';

export const metadata: Metadata = {
  title: 'Modifier un livre',
};

export default async function Page(props: { params: { id: string } }) {
  const { id } = props.params;
  const book = await fetchBookById(id);

  if (!book) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Livre', href: '/dashboard/books' },
          {
            label: 'Modifier un livre',
            href: `/dashboard/books/${id}/edit`,
            active: true,
          },
        ]}
      />
      <EditBookForm book={book} />
    </main>
  );
}