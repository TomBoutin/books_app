import { fetchBookPages } from "@/app/lib/data";
import Table from "@/app/ui/dashboard/books/table";
import Pagination from "@/app/ui/dashboard/books/pagination";
import Search from "@/app/ui/dashboard/books/search";
import { CreateBooks } from '@/app/ui/dashboard/books/buttons';

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {


  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchBookPages(query);


  return (
    <>
      <h1>Gestion des Livres</h1>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Chercher des livres..." />
        <CreateBooks />
      </div>
      <Table query={query} currentPage={currentPage} />
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </>
  );
}
