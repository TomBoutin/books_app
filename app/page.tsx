import Link from "next/link";
import fetchBooks from "./lib/data";

export default async function Home() {
  const books = await fetchBooks();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Liste des livres</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <Link key={book.id} href={`/books/${book.id}`}>
            <div className="border rounded-lg shadow-md p-4 hover:shadow-lg transition duration-200">
              <h2 className="text-xl font-semibold mb-2">{book.title}</h2>
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
          </Link>
        ))}
      </div>
    </div>
  );
}