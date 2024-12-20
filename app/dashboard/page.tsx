import fetchAllIntervenant from "@/app/lib/data";

export default async function Home() {
  const data = await fetchAllIntervenant();

  return (
    <h1 className="text-2xl font-medium ">
      Bienvenue sur le dashboard 
    </h1>
  );
}