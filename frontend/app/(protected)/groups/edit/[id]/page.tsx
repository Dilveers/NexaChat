"use client";

import { useParams } from "next/navigation";
import EditGroup from "@/components/groups/edit";

export default function EditGroupPage() {
  const params = useParams();

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-900 to-indigo-950 p-5">

      <div className="max-w-md mx-auto">
        <EditGroup
          groupId={params.id as string}
        />
      </div>

    </main>
  );
}