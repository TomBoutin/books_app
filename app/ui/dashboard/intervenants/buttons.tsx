'use client';

import { useState } from 'react';
import { PencilIcon, PlusIcon, TrashIcon, KeyIcon, ArrowPathRoundedSquareIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { deleteIntervenant, regenerateKey, regenerateAllKeys } from '@/app/lib/action';
import { ModalRegenerateKey, ModalRegenerateAllKey } from '@/app/ui/dashboard/intervenants/Modal';


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
    href={`/dashboard/intervenants/${id}/edit`}
    className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PencilIcon className="w-4" />
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

export function RegenerateKey({ id }: { id: number }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleConfirm = () => {
    const RegenerateKeyWithId = regenerateKey.bind(null, id);
    RegenerateKeyWithId();
    setIsModalOpen(false);
  };

  return (
    <>
      <button onClick={handleOpenModal} className="rounded-md border p-2 hover:bg-gray-100">
        <span className="sr-only">Regenerate Key</span>
        <KeyIcon className="w-4" />
      </button>
      <ModalRegenerateKey isOpen={isModalOpen} onClose={handleCloseModal} onConfirm={handleConfirm} />
    </>
  );
}

export function RegenerateAllKey() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleConfirm = () => {
    const RegenerateAllKey = regenerateAllKeys.bind(null);
    RegenerateAllKey();
    setIsModalOpen(false);
  };
  return (
    <>
      <button className="flex gap-3 mt-4 h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" onClick={handleOpenModal} >
        <span className="">Regénérer les clés</span>
        <ArrowPathRoundedSquareIcon className="w-4" />
      </button>
      <ModalRegenerateAllKey isOpen={isModalOpen} onClose={handleCloseModal} onConfirm={handleConfirm} />
    </>
  );
}