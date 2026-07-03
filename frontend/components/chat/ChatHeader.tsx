"use client";

import Link from "next/link";
import { FaPhone, FaVideo } from "react-icons/fa";

interface Props {
  user: any;
  params: any;
}

export default function ChatHeader({
  user,
  params,
}: Props) {
  return (
   <header className="flex items-center justify-between gap-3 p-3 sm:p-5 border-b border-white/10">

     <div className="flex items-center gap-3 min-w-0">

        {user.isGroup ? (
          <Link
            href={`/groups/info/${params.id}`}
            className="flex items-center gap-4 cursor-pointer"
          >
            <img
              src={
                user.image ||
                `https://ui-avatars.com/api/?name=${user.name}`
              }
              alt="user"
              className="w-12 h-12 rounded-full object-cover"
            />

            <div>
              <h2 className="text-white font-semibold">
                {user.name} 👥
              </h2>

              <p className="text-sm text-white/60">
                {user.members?.length || 0} Members
              </p>
            </div>
          </Link>
        ) : (
          <>
            <img
              src={`https://ui-avatars.com/api/?name=${user.name}`}
              alt="user"
              className="w-12 h-12 rounded-full shrink-0"
            />

           <div className="min-w-0">
              <h2 className="text-white font-semibold truncate">
                {user.name}
              </h2>

              <p className="text-sm text-white/60">
               {user.online
  ? "Online"
  : user.lastSeen
  ? `Last seen ${new Date(
      user.lastSeen.seconds *
        1000
    ).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`
  : "Offline"}
              </p>
            </div>
          </>
        )}
      </div>



    </header>
  );
}