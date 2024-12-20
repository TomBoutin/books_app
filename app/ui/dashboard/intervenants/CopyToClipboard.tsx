'use client';

import { useState } from 'react';
import { DocumentDuplicateIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Toast from './Toast';

export default function CopyToClipboard({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    const url = `${process.env.NEXT_PUBLIC_URL_PATH}/availability/${text}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000); // Reset after 3 seconds
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    } else {
      console.error('La fonctionnalité de copie n\'est pas supportée par votre navigateur');
    }
  };

  return (
    <>
      <button onClick={copyToClipboard} className="flex items-center gap-2">
        <span>{text}</span>
        {copied ? (
          <CheckCircleIcon className="w-5 h-5 text-green-500" />
        ) : (
          <DocumentDuplicateIcon className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {copied && <Toast message="Lien d'accès avec la clé copié dans le presse papier" />}
    </>
  );
}