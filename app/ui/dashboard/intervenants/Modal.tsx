'use client';

import { useState } from 'react';

export default function Modal({ isOpen, onClose, onConfirm }: { isOpen: boolean, onClose: () => void, onConfirm: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 w-full max-w-96 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Confirmer la régénération</h2>
        <p className="mb-4">Êtes-vous sûr de vouloir régénérer la clé ?</p>
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Annuler</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90">Confirmer</button>
        </div>
      </div>
    </div>
  );
}