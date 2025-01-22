import { fetchFilteredBooks } from "@/app/lib/data";
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { format, isBefore } from 'date-fns';
import { DeleteBook, UpdateBook } from './buttons';

export default async function BookTable({
    query,
    currentPage,
  }: {
    query: string;
    currentPage: number;
  }) {
    const Book = await fetchFilteredBooks(query, currentPage);

  return (
    <div className="mt-6 flow-root overflow-visible">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {Book?.map((book) => (
              <div
                key={book.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <p>{book.title}</p>
                    </div>
                    <p className="text-sm text-gray-500">{book.author}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Titre
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Auteur
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Date de publication
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Genre
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Prix
                </th>
                <th scope="col" className="px-3 py-5 font-medium text-end">
                  <span className="">Action</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {Book?.map((book) => (
                <tr
                  key={book.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <p>{book.title}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {book.author}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {book.publication_year}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {book.genre}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {book.price}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateBook id={book.id} />
                      <DeleteBook id={book.id} /> 
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}