import CreateGroup from "@/components/groups/create";

export default function CreateGroupPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-900 to-indigo-950 p-5">
      <div className="max-w-md mx-auto">
        <CreateGroup />
      </div>
    </main>
  );
}