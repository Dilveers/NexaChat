"use client";

import { useParams } from "next/navigation";
import GroupInfo from "@/components/groups/info";

export default function GroupInfoPage() {
  const params = useParams();

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-900 to-indigo-950 p-5">

      <div className="max-w-md mx-auto">

        <GroupInfo
          groupId={params.id as string}
        />

      </div>

    </main>
  );
}