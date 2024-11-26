import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { deleteIntervenant } from '@/app/lib/action';

export function CreateIntervenant() {
  return (
    <Link
      href="/dashboard/intervenants/create"
      className="flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <span className="hidden md:block">Créer un intervenant</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function UpdateIntervenant({ id }: { id: number }) {
  return (
    <Link
    href={`/dashboard/intervenant/${id}/edit`}
    className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeleteIntervenant({ id }: { id: number }) {
  const deleteIntervenantWithId = deleteIntervenant.bind(null, id);
 
  return (
    <form action={deleteIntervenantWithId}>
      <button type="submit" className="rounded-md border p-2 hover:bg-gray-100">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-4" />
      </button>
    </form>
  );
}