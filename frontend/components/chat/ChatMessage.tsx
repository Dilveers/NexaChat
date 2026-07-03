"use client";


import { notify } from "@/lib/toast";
import { db, auth } from "@/lib/firebase";
import {
  FaReply,
  FaShare
} from "react-icons/fa";
import { useState} from "react";

import {
  deleteDoc,
  updateDoc,
  doc,
  arrayUnion,
  getDoc,
  setDoc,
} from "firebase/firestore";

const reactions = [
  "👍",
  "❤️",
  "😂",
  "🔥",
  "😮",
];

interface Props {
  messages: any[];
  searchText: string;
  selectedMessage: any;
  setSelectedMessage: any;
  setReplyingTo: any;
  setMessages: any;
  messagesEndRef: any;

  chatId: string;
  isGroup: boolean;
}

export default function ChatMessage({
  messages,
  searchText,
  selectedMessage,
  setSelectedMessage,
  setReplyingTo,
  setMessages,
  messagesEndRef,
  chatId,
  isGroup,
}: Props) {

  const [highlightedId, setHighlightedId] =
  useState<string | null>(null);
  const [showSeenBy, setShowSeenBy] =
  useState<string | null>(null);
  const [editingId, setEditingId] =
  useState<string | null>(null);

const [editedText, setEditedText] =
  useState("");
  
  async function handleDelete(
  msg: any
) {
  
  try {

    // My own message
    if (
      msg.senderId ===
      auth.currentUser?.uid
    ) {

      await deleteDoc(
        doc(
          db,
          isGroup
            ? "groups"
            : "chats",
          chatId,
          "messages",
          msg.id
        )
      );

      return;
    }

    // Other user's message
    await updateDoc(
      doc(
        db,
        isGroup
          ? "groups"
          : "chats",
        chatId,
        "messages",
        msg.id
      ),
      {
        hiddenFor: arrayUnion(
          auth.currentUser?.uid
        ),
      }
    );

    setMessages((prev: any[]) =>
      prev.filter(
        (m) => m.id !== msg.id
      )
    );

  } catch (error) {
    console.log(error);
    notify.error(
      "Failed to delete message"
    );
  }
}
  return (
    <div className="flex flex-col flex-1 overflow-y-auto p-3 sm:p-5 space-y-4">

      {messages
        .filter((msg) =>
          (
            msg.text ||
            msg.fileName ||
            ""
          )
            .toLowerCase()
            .includes(
              searchText.toLowerCase()
            )
        )
        .map((msg) => (
          <div
              id={`msg-${msg.id}`}
               key={msg.id}
            onDoubleClick={() =>
              setSelectedMessage(msg.id)
            }
            
          className={`max-w-[75%] sm:max-w-[70%] break-words
rounded-3xl p-4
text-white break-words
whitespace-pre-wrap
transition-all duration-300

${
  highlightedId === msg.id
    ? "ring-4 ring-yellow-400"
    : ""
}

${
msg.senderId === auth.currentUser?.uid
  ? "ml-auto bg-indigo-600 self-end"
  : "mr-auto bg-white/10 self-start"
}`}
          >
{msg.forwarded && (

  <p className="
    text-xs italic
    text-white/60 mb-1
  ">
    Forwarded
  </p>

)}
            {/* Reply Message */}
        {msg.replyTo && (
  <div
    onClick={() => {

      const element =
        document.getElementById(
          `msg-${msg.replyToId}`
        );

      if (element) {

        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        setHighlightedId(
          msg.replyToId
        );

        setTimeout(() => {
          setHighlightedId(null);
        }, 3000);
      }
    }}
    className="mb-3 rounded-xl
    bg-black/20 p-2 cursor-pointer
    border-l-4 border-indigo-400"
  >

    <p className="text-xs text-white/60">
      Replying to
    </p>

    <p className="text-sm">
      {msg.replyTo}
    </p>

  </div>
)}


            {/* Audio Message */}
           
            {msg.audio ? (
              
             <audio
    controls
    className="w-72"
  >
    <source
      src={msg.audio}
      type="audio/webm"
    />
  </audio>

            ) : msg.fileName ? (

              /* File Message */
              <div className="w-full min-w-0 rounded-2xl bg-white/10 p-4 sm:min-w-56">

                <div className="flex items-center gap-3">

                  <div className="text-3xl">
                    📄
                  </div>

                  <div className="flex-1">

                    <p className="font-semibold break-all">
                      {msg.fileName}
                    </p>

                    <p className="text-xs text-white/60">
                      {msg.fileType
                        ?.split("/")[1]
                        ?.toUpperCase() ||
                        "FILE"}

                      {" • "}

                      {msg.fileSize} MB
                    </p>

                  </div>

                </div>

                {msg.fileUrl && (
                  <a
                    href={msg.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block rounded-xl bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500"
                  >
                    Open File
                  </a>
                )}

              </div>

            ) : msg.image ? (

              /* Image Message */
              <img
                src={msg.image}
                alt="sent"
                className="w-full max-w-[220px] sm:max-w-xs rounded-2xl"
              />

          )

           

 : editingId === msg.id ? (

  <div className="space-y-2">

    <input
      value={editedText}
      onChange={(e) =>
        setEditedText(e.target.value)
      }
      className="w-full rounded-xl p-2 text-black"
    />

    <div className="flex gap-2">

      <button
        onClick={async () => {

          if (!editedText.trim())
            return;

          await updateDoc(
            doc(
              db,
              isGroup
                ? "groups"
                : "chats",
              chatId,
              "messages",
              msg.id
            ),
            {
              text: editedText,
              edited: true,
            }
          );

          setEditingId(null);
        }}
        className="rounded-xl bg-green-500 px-3 py-1"
      >
        Save
      </button>

      <button
        onClick={() =>
          setEditingId(null)
        }
        className="rounded-xl bg-red-500 px-3 py-1"
      >
        Cancel
      </button>

    </div>

  </div>

) : (

  <p>
    {msg.text}

    {msg.edited && (
      <span className="ml-2 text-xs text-white/60">
        (edited)
      </span>
    )}
  </p>

)}

            {/* Reaction */}
        {msg.reactions &&
  Object.keys(msg.reactions).length > 0 && (

    <div className="mt-2 flex flex-wrap gap-2">

      {Object.entries(
        msg.reactions
      ).map(
        ([emoji, users]: any) =>

          users.length > 0 && (

         <div
  key={emoji}
  className={`rounded-full px-2 py-1 text-sm ${
    users.includes(
      auth.currentUser?.uid
    )
      ? "bg-indigo-500"
      : "bg-white/20"
  }`}
>
  {emoji} {users.length}
</div>

          )
      )}

    </div>

)}

            {/* Time + Read Status */}
            <div className="mt-1 flex items-center justify-end gap-1">

              <p className="text-xs text-white/60">
                {msg.createdAt?.seconds
                  ? new Date(
                      msg.createdAt.seconds *
                        1000
                    ).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute:
                          "2-digit",
                      }
                    )
                  : ""}
              </p>

          {msg.senderId ===
  auth.currentUser?.uid && (

 <button
  onClick={() => {

    if (
      isGroup &&
      msg.senderId ===
        auth.currentUser?.uid
    ) {

      setShowSeenBy(
        showSeenBy === msg.id
          ? null
          : msg.id
      );
    }
  }}
  className={`text-xs ${
    msg.readBy?.length >= 2
      ? "text-blue-400"
      : "text-white/60"
  }`}
>
    {msg.readBy?.length >= 2
      ? "✓✓"
      : "✓"}
  </button>

)}
            </div>
{showSeenBy === msg.id &&
  isGroup && (

  <div className="
    mt-3
    rounded-2xl
    bg-black/30
    p-3
  ">

    <p className="
      text-sm
      font-semibold
      mb-2
    ">
      Seen By
    </p>

   {msg.readBy
  ?.filter(
    (user: any) =>
      user.uid !==
      auth.currentUser?.uid
  )
  .map((user: any) => (

        <div
          key={user.name}
          className="
            text-sm
            text-white/80
            py-1
          "
        >
          {user.name}
        </div>

      ))}

  </div>

)}
            {/* Selected Message Actions */}
            {selectedMessage ===
              msg.id && (
              <>

                <div className="mt-3 flex flex-wrap gap-2">

                  {reactions.map(
                    (emoji) => (
                      <button
                        key={emoji}
onClick={async () => {

  const messageRef = doc(
    db,
    isGroup
      ? "groups"
      : "chats",
    chatId,
    "messages",
    msg.id
  );

  const snap =
    await getDoc(messageRef);

  const data = snap.data() || {};

  const reactions =
    data.reactions || {};

  const users =
    reactions[emoji] || [];

  // remove old reaction
  Object.keys(reactions).forEach(
    (key) => {
      reactions[key] =
        reactions[key].filter(
          (uid: string) =>
            uid !== auth.currentUser?.uid
        );
    }
  );

  // add new reaction
const currentUserId =
  auth.currentUser?.uid;

const alreadyReacted =
  users.includes(currentUserId);

if (alreadyReacted) {
  // remove reaction
  reactions[emoji] =
    users.filter(
      (uid: string) =>
        uid !== currentUserId
    );
} else {
  // remove old reaction
  Object.keys(reactions).forEach(
    (key) => {
      reactions[key] =
        reactions[key].filter(
          (uid: string) =>
            uid !== currentUserId
        );
    }
  );

  // add new reaction
  reactions[emoji] = [
    ...users,
    currentUserId,
  ];
}

  await updateDoc(
    messageRef,
    {
      reactions,
    }
  );

  setSelectedMessage(null);
}}
                        className="text-xl"
                      >
                        {emoji}
                      </button>
                    )
                  )}

                </div>

                {/* Reply */}
                <button
                  onClick={() => {
                    setReplyingTo(
                      msg
                    );

                    setSelectedMessage(
                      null
                    );
                  }}
                  className="mt-3 rounded-full bg-blue-500 px-3 py-2 text-xs text-white"
                >
                  <FaReply className="mr-2 inline" />
                  Reply
                </button>
               <button
  onClick={async () => {

    await setDoc(
      doc(
        db,
        "forwardQueue",
        auth.currentUser!.uid
      ),
      {
        message: msg,
        createdAt: Date.now()
      }
    );

    window.location.href = "/chats";

  }}
  className="mt-3 ml-2 rounded-full
  bg-green-500 px-3 py-2
  text-xs text-white"
>
  <FaShare className="mr-2 inline" />
  Forward
</button>
{msg.senderId ===
  auth.currentUser?.uid &&
  msg.text && (

  <button
    onClick={() => {

      setEditingId(msg.id);

      setEditedText(
        msg.text
      );

      setSelectedMessage(
        null
      );

    }}
    className="mt-3 ml-2 rounded-full
    bg-yellow-500 px-3 py-2
    text-xs text-white"
  >
    Edit
  </button>

)}
                {/* Delete */}
              <button
  onClick={async () => {

    await handleDelete(msg);

    setSelectedMessage(
      null
    );
  }}
  className="mt-3 ml-2 rounded-full bg-red-500 px-3 py-2 text-xs text-white"
>
  Delete Message
</button>

              </>
            )}

          </div>
        ))}

      <div ref={messagesEndRef} />

    </div>
  );
}
