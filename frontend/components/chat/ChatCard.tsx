"use client";

import { useRouter } from "next/navigation";

interface ChatCardProps {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread?: number;
  online?: boolean;
  muted?: boolean;
  isGroup?: boolean;
  image?: string;
}

export default function ChatCard({
  id,
  name,
  lastMessage,
  time,
  unread = 0,
  online = false,
  muted = false,
  isGroup = false,
  image = "",
}: ChatCardProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/chats/${id}`)}
      className="flex items-center gap-4 p-4 rounded-3xl bg-white/10 backdrop-blur-md hover:bg-white/20 transition cursor-pointer"
    >
      {/* Avatar */}
      <div className="relative">
        <img
          src={
            isGroup
              ? image ||
                "https://ui-avatars.com/api/?name=Group&background=4f46e5&color=fff"
              : image ||
                `https://ui-avatars.com/api/?name=${
                  name || "User"
                }`
          }
          alt={name}
          className="w-14 h-14 rounded-full object-cover"
        />

        {online && !isGroup && (
          <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-white"></span>
        )}
      </div>

      {/* Chat Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-semibold">
            {name}
          </h3>

          {isGroup && (
            <span className="text-sm">
              👥
            </span>
          )}

          {muted && (
            <span
              title="Muted Chat"
              className="text-yellow-400 text-sm"
            >
              🔕
            </span>
          )}
        </div>

        <p className="text-white/70 text-sm truncate">
          {lastMessage}
        </p>
      </div>

      {/* Time + Unread */}
      <div className="text-right">
        <span className="text-white/60 text-xs">
          {time}
        </span>

        {unread > 0 && (
          <div className="mt-2 ml-auto w-6 h-6 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center">
            {unread}
            
          </div>
        )}
      </div>
    </div>
  );
}