import AuthGuard from "@/components/AuthGuard";
import ChatList from "@/components/chat/ChatList";

export default function ChatsPage() {
  return (
    <AuthGuard>
      <ChatList />
    </AuthGuard>
  );
}