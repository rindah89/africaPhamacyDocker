import BatchesClient from "./BatchesClient";
import { getAllBatches } from "@/actions/batches";

export default async function BatchesContent() {
  const batches = await getAllBatches();
  return (
    <BatchesClient initialBatches={batches} />
  );
}