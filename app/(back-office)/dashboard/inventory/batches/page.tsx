import { Suspense } from "react";
import { ErrorBoundary } from "@/components/dashboard/ErrorBoundary";
import BatchesContent from "./components/BatchesContent";

export default function BatchesPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div>Loading batches...</div>}>
        <BatchesContent />
      </Suspense>
    </ErrorBoundary>
  );
}