import { fetchBookById } from "@/app/lib/data";
import { notFound } from "next/navigation";

export default async function BookDetail({ params }) {
  const { id } = params;
  const book = await fetchBookById(id);

  if (!book) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{book.title}</h1>
      <p className="text-gray-700 mb-1">
        <strong>Auteur :</strong> {book.author}
      </p>
      <p className="text-gray-700 mb-1">
        <strong>Date de publication :</strong> {book.publication_year}
      </p>
      <p className="text-gray-700 mb-1">
        <strong>Genre :</strong> {book.genre}
      </p>
      <p className="text-gray-700">
        <strong>Prix :</strong> {book.price} €
      </p>
    </div>
  );
}