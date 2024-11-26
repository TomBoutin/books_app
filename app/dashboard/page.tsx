import fetchAllIntervenant from "@/app/lib/data";

export default async function Home() {
  const data = await fetchAllIntervenant();

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