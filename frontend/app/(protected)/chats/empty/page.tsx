export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-indigo-900 to-indigo-950 px-4 text-center text-white">
      <div className="max-w-sm rounded-3xl bg-white/10 p-6 backdrop-blur-xl">
        <h1 className="text-2xl font-bold">Select a chat</h1>
        <p className="mt-2 text-sm text-white/70">
          Choose a conversation from your chats to start messaging.
        </p>
      </div>
    </main>
  );
}
