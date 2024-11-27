'use client';

import { useState } from 'react';
import { DocumentDuplicateIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Toast from './Toast';

export default function CopyToClipboard({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000); // Reset after 3 seconds
    });
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
      {copied && <Toast message="Clé copiée dans le presse-papier" />}
    </>
  );
}