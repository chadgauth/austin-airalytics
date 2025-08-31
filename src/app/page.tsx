import { DataTable } from "./listings.data-table";
import { columns } from "./listings.columns";
import { getListingsData } from "./listings.data";

export default async function Home() {
  const data = await getListingsData();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Airbnb Listings</h1>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
