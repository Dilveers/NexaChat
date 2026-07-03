"use client";

import { notify } from "@/lib/toast";
import { auth, db } from "@/lib/firebase";
import { useState, useEffect } from "react";

import ChatCard from "./ChatCard";
import SearchBar from "./SearchBar";
import Link from "next/link";

import { FaUsers } from "react-icons/fa";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
   orderBy,
  limit,
} from "firebase/firestore";





export default function ChatList() {

 
 const [firebaseChats, setFirebaseChats] =
  useState<any[]>([]);
  const [deletedIds, setDeletedIds] =
  useState<string[]>([]);
  const [deletedChats, setDeletedChats] =
  useState<any[]>([]);
  const [searchTerm, setSearchTerm] =
    useState("");
const [profileImage, setProfileImage] =
  useState("");

const [profileName, setProfileName] =
  useState("");
  const [selectedChat, setSelectedChat] =
    useState<string | null>(null);

const [chatList, setChatList] =
  useState<any[]>([]);

  const [hasArchivedChats, setHasArchivedChats] =
    useState(false);
  const [hasRequests, setHasRequests] =
  useState(false);
  useEffect(() => {

  if (
    typeof window !== "undefined" &&
    Notification.permission !== "granted"
  ) {

    Notification.requestPermission();

  }

}, []);
  useEffect(() => {

  const unsubscribeAuth =
    auth.onAuthStateChanged(
      (user) => {

        if (!user) return;

        const q = query(
          collection(
            db,
            "archivedChats"
          ),
          where(
            "userId",
            "==",
            user.uid
          )
        );

        const unsubscribe =
          onSnapshot(
            q,
            (snapshot) => {

              setHasArchivedChats(
                snapshot.docs.length > 0
              );

            }
          );

        return () =>
          unsubscribe();
      }
    );

  return () =>
    unsubscribeAuth();

}, []);
useEffect(() => {
  const unsubscribe =
    auth.onAuthStateChanged(
      async (user) => {

        if (!user) return;

        const userDoc = await getDoc(
          doc(db, "users", user.uid)
        );

        if (userDoc.exists()) {

          const data: any =
            userDoc.data();

          setProfileImage(
            data.image || ""
          );

          setProfileName(
            data.name || "User"
          );
        }
      }
    );

  return () => unsubscribe();
}, []);
useEffect(() => {
  const user = auth.currentUser;

  if (!user) return;

  const q = query(
    collection(db, "deletedChats"),
    where("userId", "==", user.uid)
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {

      const data = snapshot.docs.map(
        (doc: any) => ({
          chatId: doc.data().chatId,
          deletedAt:
            doc.data().deletedAt,
        })
      );

      setDeletedChats(data);

      setDeletedIds(
        data.map(
          (item: any) =>
            item.chatId
        )
      );
    }
  );

  return () => unsubscribe();
}, []);
useEffect(() => {
  const unsubscribeAuth =
    auth.onAuthStateChanged((user) => {

      if (!user) return;

      const q = query(
        collection(db, "friendRequests"),
        where(
          "toUserId",
          "==",
          user.uid
        ),
        where(
          "status",
          "==",
          "pending"
        )
      );

      const unsubscribeRequests =
        onSnapshot(q, (snapshot) => {
          

          setHasRequests(
            snapshot.docs.length > 0
          );

        });

      return () =>
        unsubscribeRequests();
    });

  return () => unsubscribeAuth();
}, []);
useEffect(() => {
  const unsubscribeAuth =
    auth.onAuthStateChanged((user) => {

      if (!user) return;

      const q = query(
        collection(db, "chats"),
        where(
          "participants",
          "array-contains",
          user.uid
        )
      );

      const unsubscribe =
  onSnapshot(q, async (snapshot) => {
    
const currentUserId =
  user.uid;

const blockedSnapshot = await getDocs(
  query(
    collection(db, "blockedUsers"),
    where("blockedBy", "==", currentUserId)
  )
);

const blockedIds = blockedSnapshot.docs.map(
  (doc: any) => doc.data().blockedUserId
);

        const chats = await Promise.all(
 snapshot.docs.map(async (chatDoc) => {

  const chatData: any = chatDoc.data();

const messagesQuery = query(
  collection(
    db,
    "chats",
    chatDoc.id,
    "messages"
  ),
  orderBy("createdAt", "desc"),
  limit(50)
);

const messagesSnapshot =
  await getDocs(messagesQuery);

const lastMessageDoc =
  messagesSnapshot.docs[0];

  const unreadCount =
    messagesSnapshot.docs.filter(
      (msgDoc) => {

        const msg: any =
          msgDoc.data();

        return (
          msg.senderId !==
            currentUserId &&
          !msg.readBy?.includes(
            currentUserId
          )
        );
      }
    ).length;


const lastMessage: any =
  lastMessageDoc
    ? {
        id: lastMessageDoc.id,
        ...lastMessageDoc.data(),
      }
    : null;
  const mutedSnapshot =
    await getDocs(
      query(
        collection(
          db,
          "mutedChats"
        ),
        where(
          "userId",
          "==",
          currentUserId
        ),
        where(
          "chatId",
          "==",
          chatDoc.id
        )
      )
    );

  const isMuted =
    !mutedSnapshot.empty;
const archivedSnapshot =
  await getDocs(
    query(
      collection(db, "archivedChats"),
      where(
        "userId",
        "==",
        currentUserId
      ),
      where(
        "chatId",
        "==",
        chatDoc.id
      )
    )
  );

const isArchived =
  !archivedSnapshot.empty;
 
  const friendId =
    chatData.participants.find(
      (id: string) =>
        id !== currentUserId
    );
const presenceDoc =
  await getDoc(
    doc(
      db,
      "presence",
      friendId
    )
  );

const isOnline =
  presenceDoc.exists()
    ? presenceDoc.data().online
    : false;
  let friendName =
    "Unknown User";

  if (friendId) {

    const userQuery =
      query(
        collection(
          db,
          "users"
        ),
        where(
          "uid",
          "==",
          friendId
        )
      );

    const userSnapshot =
      await getDocs(
        userQuery
      );

    if (
      !userSnapshot.empty
    ) {

      friendName =
        userSnapshot.docs[0]
          .data().name;
    }
const activeChatId =
 sessionStorage.getItem(
    "activeChatId"
  );

const isViewingThisChat =
  activeChatId === chatDoc.id;
  const userDoc =
  await getDoc(
    doc(
      db,
      "users",
      currentUserId
    )
  );

const userData: any =
  userDoc.data();

const notificationsEnabled =
  userData?.notificationsEnabled ??
  true;
if (
  notificationsEnabled &&
  lastMessage &&
  !isMuted &&
  !blockedIds.includes(friendId) &&
  !isArchived &&
  !isViewingThisChat &&
  lastMessage.senderId !== currentUserId &&
  Notification.permission === "granted"
) {

const notificationDoc =
  await getDoc(
    doc(
      db,
      "notificationState",
      `${currentUserId}_${chatDoc.id}`
    )
  );

const storedId =
  notificationDoc.exists()
    ? notificationDoc.data()
        .lastMessageId
    : null;

  // First load
  if (!storedId) {
await setDoc(
  doc(
    db,
    "notificationState",
    `${currentUserId}_${chatDoc.id}`
  ),
  {
    userId: currentUserId,
    chatId: chatDoc.id,
    lastMessageId: lastMessage.id,
    updatedAt: serverTimestamp(),
  }
);
  }

  // New message
  else if (
  storedId !==
    lastMessage.id &&
  !lastMessage.readBy?.includes(
    currentUserId
  )
) {
const alreadyRead =
  lastMessage.readBy?.includes(
    currentUserId
  );

if (
  storedId !== lastMessage.id &&
  !alreadyRead
) {
 await setDoc(
  doc(
    db,
    "notificationState",
    `${currentUserId}_${chatDoc.id}`
  ),
  {
    userId: currentUserId,
    chatId: chatDoc.id,
    lastMessageId: lastMessage.id,
    updatedAt: serverTimestamp(),
  }
);

if (!blockedIds.includes(friendId)) {
  new Notification(friendName, {
    body:
      lastMessage.text ||
      lastMessage.fileName ||
      "📷 Media message",
    icon: "/favicon.ico",
  });
}
    
  }
}
  


  }

  return {
    id: chatDoc.id,
    friendId,
    name: friendName,
 updatedAt:
    chatData.updatedAt,
    lastMessage:
      chatData.lastMessage ||
      "Start chatting 👋",

    time:
      chatData.updatedAt
        ?.seconds
        ? new Date(
            chatData.updatedAt.seconds *
              1000
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Now",

    unread: unreadCount,
    online: isOnline,
    muted: isMuted,
    isGroup: false,
  };
}
})
);


const archivedSnapshot =
  await getDocs(
    query(
      collection(
        db,
        "archivedChats"
      ),
      where(
        "userId",
        "==",
        currentUserId
      )
    )
  );

const archivedIds =
  archivedSnapshot.docs.map(
    (doc: any) =>
      doc.data().chatId
  );



const deletedSnapshot =
  await getDocs(
    query(
      collection(
        db,
        "deletedChats"
      ),
      where(
        "userId",
        "==",
        currentUserId
      )
    )
  );
const filteredChats = [];

for (const chat of chats) {

const deletedDoc =
  deletedSnapshot.docs.find(
    (doc: any) =>
      doc.data().chatId === chat?.id
  );

if (!deletedDoc || !chat) {

  if (
    chat &&
    !blockedIds.includes(chat.friendId)&&
    !archivedIds.includes(chat.id)
  ) {
    filteredChats.push(chat);
  }

  continue;
}

const deletedTime =
  deletedDoc.data()?.deletedAt || 0;

const updatedTime =
  chat?.updatedAt?.toMillis?.() || 0;

  // show again only if a NEW message arrived
  if (
    updatedTime > deletedTime &&
     !blockedIds.includes(chat.friendId) &&
    !archivedIds.includes(chat.id)
  ) {
    filteredChats.push(chat);
  }
}

const sortedChats =
  filteredChats.sort(
    (a: any, b: any) => {

      const timeA =
        a.updatedAt?.seconds || 0;

      const timeB =
        b.updatedAt?.seconds || 0;

      return timeB - timeA;
    }
  );

setFirebaseChats(sortedChats);
        });

      return () => unsubscribe();
    });

  return () => unsubscribeAuth();
}, [deletedIds]);
useEffect(() => {

  const unsubscribeAuth =
    auth.onAuthStateChanged(
      (user) => {

        if (!user) return;

        const q = query(
          collection(db, "groups"),
          where(
            "members",
            "array-contains",
            user.uid
          )
        );

        const unsubscribe =
          onSnapshot(
            q,
            async (snapshot) => {

             const groups = await Promise.all(
    snapshot.docs.map(async (groupDoc) => {

    const data: any = groupDoc.data()
const mutedSnapshot =
  await getDocs(
    query(
      collection(db, "mutedChats"),
      where(
        "userId",
        "==",
        user.uid
      ),
      where(
        "chatId",
        "==",
        groupDoc.id
      )
    )
  );

const isMuted =
  !mutedSnapshot.empty;
  const messagesQuery = query(
  collection(
    db,
    "groups",
    groupDoc.id,
    "messages"
  ),
  orderBy(
    "createdAt",
    "desc"
  ),
  limit(50)
);

const messagesSnapshot =
  await getDocs(
    messagesQuery
  );
const lastMessageDoc =
  messagesSnapshot.docs[0];

const lastMessage: any =
  lastMessageDoc
    ? {
        id: lastMessageDoc.id,
        ...lastMessageDoc.data(),
      }
    : null;
 const unreadCount =
  messagesSnapshot.docs.filter(
    (msgDoc) => {
      const msg: any = msgDoc.data();

      return (
        msg.senderId !== user.uid &&
        !msg.readBy?.includes(user.uid)
      );
    }
  ).length;
  const archivedSnapshot =
  await getDocs(
    query(
      collection(db, "archivedChats"),
      where(
        "userId",
        "==",
        user.uid
      ),
      where(
        "chatId",
        "==",
        groupDoc.id,
      )
    )
  );

const isArchived =
  !archivedSnapshot.empty;
const activeChatId =
  sessionStorage.getItem(
    "activeChatId"
  );

const isViewingThisGroup =
  activeChatId === groupDoc.id;
const userDoc =
  await getDoc(
    doc(
      db,
      "users",
      user.uid
    )
  );

const userData: any =
  userDoc.data();

const notificationsEnabled =
  userData?.notificationsEnabled ??
  true;

if (
   notificationsEnabled &&
  lastMessage &&
  !isMuted &&
  !isArchived &&
  !isViewingThisGroup &&
  lastMessage.senderId !== user.uid &&
  Notification.permission === "granted"
) {

  
  const notificationDoc =
  await getDoc(
    doc(
      db,
      "notificationState",
      `${user.uid}_${groupDoc.id}`
    )
  );

const storedId =
  notificationDoc.exists()
    ? notificationDoc.data()
        .lastMessageId
    : null;

  // first load
  if (!storedId) {

await setDoc(
  doc(
    db,
    "notificationState",
    `${user.uid}_${groupDoc.id}`
  ),
  {
    userId: user.uid,
    chatId: groupDoc.id,
    lastMessageId: lastMessage.id,
    updatedAt: serverTimestamp(),
  }
);

  }

  // new message
  else if (
    storedId !== lastMessage.id &&
    !lastMessage.readBy?.includes(
      user.uid
    )
  ) {

    const alreadyRead =
      lastMessage.readBy?.includes(
        user.uid
      );

    if (
      storedId !== lastMessage.id &&
      !alreadyRead
    ) {

   await setDoc(
  doc(
    db,
    "notificationState",
    `${user.uid}_${groupDoc.id}`
  ),
  {
    userId: user.uid,
    chatId: groupDoc.id,
    lastMessageId: lastMessage.id,
    updatedAt: serverTimestamp(),
  }
);

      new Notification(
        data.name,
        {
          body:
            lastMessage.text ||
            lastMessage.fileName ||
            "📷 Media message",

          icon:
            data.image ||
            "/favicon.ico",
        }
      );
    }
  }
}
   return {
id: groupDoc.id,
  name: data.name,
  image: data.image,
  isGroup: true,
  muted: isMuted,
      unread: unreadCount,
      updatedAt: data.updatedAt,

      lastMessage:
        data.lastMessage ||
        "Group created 👥",

      time:
        data.updatedAt?.seconds
          ? new Date(
              data.updatedAt.seconds *
                1000
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Now",
    };
  })
);

              groups.sort(
                (a: any, b: any) =>
                  (b.updatedAt?.seconds || 0) -
                  (a.updatedAt?.seconds || 0)
              );
const archivedSnapshot =
  await getDocs(
    query(
      collection(
        db,
        "archivedChats"
      ),
      where(
        "userId",
        "==",
        user.uid
      )
    )
  );

const archivedIds =
  archivedSnapshot.docs.map(
    (doc: any) =>
      doc.data().chatId
  );
const filteredGroups = [];

for (const group of groups) {

  const deletedDoc =
    deletedChats.find(
      (item: any) =>
        item.chatId === group.id
    );

  // never deleted
if (!deletedDoc) {

  if (
    !archivedIds.includes(
      group.id
    )
  ) {

    filteredGroups.push(
      group
    );
  }

  continue;
}
  const deletedTime =
    deletedDoc.deletedAt || 0;

  const updatedTime =
    group.updatedAt?.toMillis?.() || 0;

  // show again only when new message arrives
if (
  updatedTime > deletedTime &&
  !archivedIds.includes(
    group.id
  )
) {

  filteredGroups.push(
    group
  );
}
}

setChatList(filteredGroups);
            }
          );

        return () =>
          unsubscribe();
      }
    );

  return () =>
    unsubscribeAuth();

}, [deletedIds]);
const allChats = [
  ...chatList,
  ...firebaseChats,
];
const filteredChats = allChats.filter(
  (chat) =>
    (chat.name || "Unknown User")
      .toLowerCase()
      .includes(
        searchTerm.toLowerCase()
      )
);

async function archiveChat(chat: any) {

  try {

    const currentUser =
      auth.currentUser;

    if (!currentUser) return;

    await addDoc(
      collection(db, "archivedChats"),
      {
        userId:
          currentUser.uid,

        chatId:
          chat.id,

        chatName:
          chat.name,

        archivedAt:
          serverTimestamp(),
      }
    );

    setFirebaseChats((prev) =>
      prev.filter(
        (c) => c.id !== chat.id
      )
    );

    setChatList((prev) =>
      prev.filter(
        (c) => c.id !== chat.id
      )
    );

    setHasArchivedChats(true);

    setSelectedChat(null);

  } catch (error) {

    console.log(error);

    notify.error(
      "Failed to archive chat"
    );
  }
}
async function clearChat(chat: any) {
  try {
    const currentUser =
      auth.currentUser;

    if (!currentUser) return;

await addDoc(
  collection(db, "deletedChats"),
  {
    userId: currentUser.uid,
    chatId: chat.id,
    deletedAt: new Date().getTime(),
  }
);

    if (chat.isGroup) {
      setChatList((prev) =>
        prev.filter(
          (c) => c.id !== chat.id
        )
      );
    } else {
      setFirebaseChats((prev) =>
        prev.filter(
          (c) => c.id !== chat.id
        )
      );
    }

    setSelectedChat(null);

    notify.success("Chat deleted");

  } catch (error) {
    console.log(error);
    notify.error("Failed to delete chat");
  }
}

async function blockUser(chat: any) {

  try {

    const currentUser =
      auth.currentUser;

    if (!currentUser) return;

    await addDoc(
      collection(
        db,
        "blockedUsers"
      ),
      {
        blockedBy:
          currentUser.uid,

          blockedUserId: chat.friendId, 

        blockedUserName:
          chat.name,

        createdAt:
          serverTimestamp(),
      }
    );

    setChatList((prev) =>
      prev.filter(
        (c) => c.id !== chat.id
      )
    );
setFirebaseChats((prev) =>
  prev.filter(
    (c) => c.id !== chat.id
  )
);
    setSelectedChat(null);

    notify.success(
      `${chat.name} blocked successfully`
    );

  } catch (error) {

    console.log(error);

    notify.error(
      "Failed to block user"
    );
  }
}

async function muteChat(chat: any) {
  try {
    const currentUser = auth.currentUser;

    if (!currentUser) return;

    await addDoc(
      collection(db, "mutedChats"),
      {
        userId: currentUser.uid,
        chatId: chat.id,
        mutedAt: serverTimestamp(),
      }
    );

setChatList((prev) =>
  prev.map((c) =>
    c.id === chat.id
      ? { ...c, muted: true }
      : c
  )
);

setFirebaseChats((prev) =>
  prev.map((c) =>
    c.id === chat.id
      ? { ...c, muted: true }
      : c
  )
);

    setSelectedChat(null);

  } catch (error) {
    console.log(error);
  }
}
async function unmuteChat(chat: any) {
  try {
    const currentUser = auth.currentUser;

    if (!currentUser) return;

    const q = query(
      collection(db, "mutedChats"),
      where(
        "userId",
        "==",
        currentUser.uid
      ),
      where(
        "chatId",
        "==",
        chat.id
      )
    );

    const snapshot =
      await getDocs(q);

    snapshot.forEach(async (docSnap) => {
      await deleteDoc(
        doc(
          db,
          "mutedChats",
          docSnap.id
        )
      );
    });

setChatList((prev) =>
  prev.map((c) =>
    c.id === chat.id
      ? { ...c, muted: false }
      : c
  )
);

setFirebaseChats((prev) =>
  prev.map((c) =>
    c.id === chat.id
      ? { ...c, muted: false }
      : c
  )
);

    setSelectedChat(null);

  } catch (error) {
    console.log(error);
  }
}
async function removeFriend(chat: any) {
  try {
    const currentUser =
      auth.currentUser;

    if (!currentUser) return;

    // Remove friendship
    const q = query(
      collection(db, "friends"),
      where(
        "users",
        "array-contains",
        currentUser.uid
      )
    );
const requestSnapshot = await getDocs(
  collection(db, "friendRequests")
);

for (const requestDoc of requestSnapshot.docs) {

  const data: any = requestDoc.data();

  if (
    (
      data.fromUserId === currentUser.uid &&
      data.toUserId === chat.friendId
    ) ||
    (
      data.fromUserId === chat.friendId &&
      data.toUserId === currentUser.uid
    )
  ) {

    await deleteDoc(
      doc(
        db,
        "friendRequests",
        requestDoc.id
      )
    );
  }
}
    const snapshot =
      await getDocs(q);

    for (const friendDoc of snapshot.docs) {
      const data: any =
        friendDoc.data();

      if (
        data.users.includes(
          chat.friendId
        )
      ) {
        await deleteDoc(
          doc(
            db,
            "friends",
            friendDoc.id
          )
        );
      }
    }

    // Remove chat document
    await deleteDoc(
      doc(
        db,
        "chats",
        chat.id
      )
    );

    // Update UI
    setFirebaseChats((prev) =>
      prev.filter(
        (c) => c.id !== chat.id
      )
    );

    setChatList((prev) =>
      prev.filter(
        (c) => c.id !== chat.id
      )
    );

    setSelectedChat(null);

    notify.success(
      `${chat.name} removed successfully`
    );

  } catch (error) {
    console.log(error);
    notify.error(
      "Failed to remove friend"
    );
  }
  
}
async function leaveGroup(
  chat: any
) {

  try {

    const currentUser =
      auth.currentUser;

    if (!currentUser)
      return;

    const groupRef = doc(
      db,
      "groups",
      chat.id
    );

    const groupSnap =
      await getDoc(groupRef);

    if (!groupSnap.exists())
      return;

    const data: any =
      groupSnap.data();

    const updatedMembers =
      data.members.filter(
        (id: string) =>
          id !== currentUser.uid
      );

    await updateDoc(
      groupRef,
      {
        members:
          updatedMembers,
      }
    );

    notify.success(
      "Left group successfully"
    );

  } catch (error) {

    console.log(error);
  }
}
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-900 to-indigo-950 p-5">

      <div className="max-w-lg mx-auto">

        {/* Header */}
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
  <div className="min-w-0">
    <h1 className="text-4xl sm:text-5xl font-bold">
      NexaChat
    </h1>

    <p className="text-base sm:text-lg text-gray-300">
      Realtime conversations
    </p>
  </div>

          <div className="flex items-center justify-center sm:justify-end gap-2 flex-wrap">
<Link href="/groups/create">
  <button className="w-11 h-11 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-500 transition">
    <FaUsers />
  </button>
</Link>
            <Link href="/friends">
              <button className="w-11 h-11 rounded-full bg-green-600 text-white text-xl hover:bg-green-500 transition">
                👥
              </button>
            </Link>
{hasRequests && (
            <Link href="/friends/requests">
              <button className="w-11 h-11 rounded-full bg-pink-500 text-white text-xl hover:bg-pink-400 transition">
                📨
              </button>
            </Link>
            )}

            <Link href="/friends/add">
              <button className="w-11 h-11 rounded-full bg-indigo-600 text-white text-3xl hover:bg-indigo-500 transition">
                +
              </button>
            </Link>

            <Link href="/profile">
            <img
  src={
    profileImage ||
    `https://ui-avatars.com/api/?name=${profileName}`
  }
  alt="profile"
  className="w-11 h-11 rounded-full cursor-pointer object-cover"
/>
            </Link>

          </div>

        </div>

        {/* Search */}
        <SearchBar
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(
              e.target.value
            )
          }
        />

        {/* Archived Chats Button */}
        {hasArchivedChats && (
          <Link
            href="/chats/archive"
            className="mt-4 mb-4 flex items-center gap-3 rounded-2xl bg-white/10 p-4 text-white hover:bg-white/20 transition"
          >
            📦 Archived Chats
          </Link>
        )}

        {/* Chats */}
     <div className="space-y-4 mt-6">

  {filteredChats.length === 0 && (
    <div className="text-center text-gray-400 mt-20">
      <div className="text-5xl mb-4">💬</div>
      <h2 className="text-xl font-semibold">
        No chats yet
      </h2>
      <p className="text-sm mt-2">
        Start a conversation with your friends 👋
      </p>
    </div>
  )}

  {filteredChats.map((chat) => (
            <div
              key={chat.id}
              className="relative"
            >

              <div
                onContextMenu={(e) => {
                  e.preventDefault();

                  setSelectedChat(
                    selectedChat === chat.id
                      ? null
                      : chat.id
                  );
                }}

                onDoubleClick={() => {
                  setSelectedChat(
                    selectedChat === chat.id
                      ? null
                      : chat.id
                  );
                }}
              >
<ChatCard
  {...chat}
  muted={chat.muted}
  isGroup={chat.isGroup}
  image={(chat as any).image}
/>
              </div>

              {selectedChat ===
                chat.id && (
                <div className="absolute right-4 top-24 z-50 w-52 rounded-2xl bg-indigo-950 border border-white/10 shadow-2xl overflow-hidden">

                  <button
                    onClick={() =>
                      archiveChat(chat)
                    }
                    className="w-full px-4 py-4 text-left text-white hover:bg-white/10"
                  >
                    📦 Archive Chat
                  </button>

                  <button
                    onClick={() =>
                      clearChat(chat)
                    }
                    className="w-full px-4 py-4 text-left text-white hover:bg-white/10"
                  >
                    🗑 Delete Chat
                  </button>
<button
  onClick={() =>
    chat.muted
      ? unmuteChat(chat)
      : muteChat(chat)
  }
  className="w-full px-4 py-4 text-left text-yellow-400 hover:bg-yellow-500/20"
>
  {chat.muted
    ? "🔔 Unmute Chat"
    : "🔕 Mute Chat"}
</button>
{!chat.isGroup && (
  <>
    <button
      onClick={() =>
        blockUser(chat)
      }
      className="w-full px-4 py-4 text-left text-red-400 hover:bg-red-500/20"
    >
      🚫 Block User
    </button>

    <button
      onClick={() =>
        removeFriend(chat)
      }
      className="w-full px-4 py-4 text-left text-red-400 hover:bg-red-500/20"
    >
      ❌ Remove Friend
    </button>
  </>
)}

{chat.isGroup && (
  <button
    onClick={() =>
      leaveGroup(chat)
    }
    className="w-full px-4 py-4 text-left text-red-400 hover:bg-red-500/20"
  >
    🚪 Leave Group
  </button>
)}
                </div>
              )}

            </div>
          ))}

        </div>

      </div>

    </main>
  );
}