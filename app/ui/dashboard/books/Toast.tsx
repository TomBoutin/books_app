'use client';

export default function Toast({ message }: { message: string }) {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded shadow-lg">
      {message}
    </div>
  );
}