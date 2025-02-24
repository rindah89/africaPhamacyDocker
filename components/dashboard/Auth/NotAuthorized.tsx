import React from "react";

export default function NotAuthorized() {
  return (
    <div className="max-w-2xl shadow rounded-md border mx-auto flex flex-col justify-center items-center min-h-96 space-y-4 p-16 mt-8">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        403 - Not Authorized
      </h1>
      <p className="text-balance text-muted-foreground text-center">
        You do not have permission to view this page. Check on the sidebar for
        the resources you have access to to
      </p>
    </div>
  );
}
