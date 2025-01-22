'use client';

import { useState } from 'react';
import { PencilIcon, PlusIcon, TrashIcon, KeyIcon, ArrowPathRoundedSquareIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { deleteBook } from '@/app/lib/action';


export function CreateBooks() {
  return (
    <Link
      href="/dashboard/books/create"
      className="flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <span className="hidden md:block">Créer un livre</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function UpdateBook({ id }: { id: number }) {
  return (
    <Link
    href={`/dashboard/books/${id}/edit`}
    className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PencilIcon className="w-4" />
    </Link>
  );
}

export function DeleteBook({ id }: { id: number }) {
  const deleteBookWithId = deleteBook.bind(null, id);
 
  return (
    <form action={deleteBookWithId}>
      <button type="submit" className="rounded-md border p-2 hover:bg-gray-100">
        <span className="sr-only">Supprimer</span>
        <TrashIcon className="w-4" />
      </button>
    </form>
  );
}