import { fetchIntervenantPages } from "@/app/lib/data";
import Table from "@/app/ui/dashboard/intervenants/table";
import Pagination from "@/app/ui/dashboard/intervenants/pagination";
import Search from "@/app/ui/dashboard/intervenants/search";
import { CreateIntervenant } from '@/app/ui/dashboard/intervenants/buttons';

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
  const totalPages = await fetchIntervenantPages(query);


  return (
    <div>
      <h1>Gestion des Intervenants</h1>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Chercher des intervenants..." />
        <CreateIntervenant />
      </div>
      <Table query={query} currentPage={currentPage} />
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
