import fetchAllIntervenants from "@/app/lib/data";

export default async function Home() {
  const data = await fetchAllIntervenants();

  return (
    <div>
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <p>Failed to load data</p>
      )}
    </div>
  );
}