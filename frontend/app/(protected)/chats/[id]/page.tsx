"use client";


import { notify } from "@/lib/toast";
import { sanitizeText } from "@/lib/validation";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import ChatExtras from "@/components/chat/ChatExtras";

import {
  ref,
  uploadBytes,
  getDownloadURL,
  
} from "firebase/storage";

import { storage } from "@/lib/firebase";
import {
  collection,
  arrayUnion,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDoc,
  getDocs, 
  where,
  doc,
  updateDoc,
  setDoc, 
  deleteDoc ,
} from "firebase/firestore"; 

import { db, auth } from "@/lib/firebase";


const reactions = ["👍", "❤️", "😂", "🔥", "😮"];

export default function ChatPage() {
  const [lastNotificationId,
  setLastNotificationId] =
  useState("");
  const params = useParams();
  const chatId = String(params.id);
const [groups, setGroups] =
  useState<any[]>([]);
const [deletedIds, setDeletedIds] =
  useState<string[]>([]);
  const [forwardedMessage,
setForwardedMessage] =
  useState<any>(null);
  const [deletedAt, setDeletedAt] =
  useState<number | null>(null);
const [chatUser, setChatUser] =
  useState<any>(null);
useEffect(() => {

  const askPermission =
    async () => {

      if (
        Notification.permission ===
        "default"
      ) {

        await Notification.requestPermission();
      }
    };

  window.addEventListener(
    "click",
    askPermission,
    { once: true }
  );

  return () =>
    window.removeEventListener(
      "click",
      askPermission
    );

}, []);
useEffect(() => {
  const markAsRead = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser || !chatId) return;

    const messagesSnapshot = await getDocs(
      collection(
        db,
        "chats",
        chatId,
        "messages"
      )
    );

    for (const msgDoc of messagesSnapshot.docs) {
      const data: any = msgDoc.data();

      if (
        data.senderId !== currentUser.uid &&
        !data.readBy?.includes(currentUser.uid)
      ) {
        await updateDoc(msgDoc.ref, {
          readBy: arrayUnion(currentUser.uid),
        });
      }
    }
  };

  markAsRead();
}, [chatId]);
useEffect(() => {
  const markGroupMessagesAsRead =
    async () => {

      const currentUser =
        auth.currentUser;

if (
  !currentUser ||
  !chatId
) return;

const messagesSnapshot =
  await getDocs(
    collection(
      db,
      "groups",
      chatId,
      "messages"
    )
  );

      for (
        const msgDoc of messagesSnapshot.docs
      ) {

        const data: any =
          msgDoc.data();

        if (
          data.senderId !==
            currentUser.uid &&
          !data.readBy?.includes(
            currentUser.uid
          )
        ) {

          await updateDoc(
            msgDoc.ref,
            {
              readBy: arrayUnion(
                currentUser.uid
              ),
            }
          );
        }
      }
    };

  markGroupMessagesAsRead();

}, [chatId]);
useEffect(() => {

  const currentUser =
    auth.currentUser;

  if (!currentUser) return;

  const q = query(
    collection(db, "deletedChats"),
    where(
      "userId",
      "==",
      currentUser.uid
    )
  );

const unsubscribe =
  onSnapshot(q, (snapshot) => {

    const deletedDoc =
      snapshot.docs.find(
        (doc: any) =>
          doc.data().chatId === chatId
      );

    if (deletedDoc) {
      setDeletedAt(
        deletedDoc.data().deletedAt
      );
    } else {
      setDeletedAt(null);
    }

    setDeletedIds(
      snapshot.docs.map(
        (doc: any) =>
          doc.data().chatId
      )
    );
  });

  return () => unsubscribe();

}, []);
useEffect(() => {
  sessionStorage.setItem(
    "activeChatId",
    String(params.id)
  );

  return () => {
    sessionStorage.removeItem(
      "activeChatId"
    );
  };
}, [params.id]);
useEffect(() => {

  async function loadForward() {

    const currentUser =
      auth.currentUser;

    if (!currentUser) return;

    const snap =
      await getDoc(
        doc(
          db,
          "forwardQueue",
          currentUser.uid
        )
      );

    if (snap.exists()) {

      setForwardedMessage(
        snap.data().message
      );
    }
  }

  loadForward();

}, []);
useEffect(() => {

  async function loadChat() {

    // Check group first
    const groupDoc =
      await getDoc(
        doc(db, "groups", chatId)
      );

    if (groupDoc.exists()) {

      setChatUser({
        ...groupDoc.data(),
        isGroup: true,
      });

      return;
    }

    // Normal chat
    const chatDoc =
      await getDoc(
        doc(db, "chats", chatId)
      );

    if (!chatDoc.exists()) return;

    const chatData: any =
      chatDoc.data();

    const otherUserId =
      chatData.participants.find(
        (id: string) =>
          id !== auth.currentUser?.uid
      );

    const userDoc =
      await getDoc(
        doc(db, "users", otherUserId)
      );

   if (userDoc.exists()) {

  const presenceDoc =
    await getDoc(
      doc(
        db,
        "presence",
        otherUserId
      )
    );

  setChatUser({
    ...userDoc.data(),

    online:
      presenceDoc.exists()
        ? presenceDoc.data().online
        : false,

    lastSeen:
      presenceDoc.exists()
        ? presenceDoc.data().lastSeen
        : null,

    isGroup: false,
  });

}

  }

  loadChat();

}, [chatId]);
useEffect(() => {

  if (
    !chatUser ||
    chatUser.isGroup
  ) return;

  const unsubscribe =
    onSnapshot(
      doc(
        db,
        "presence",
        chatUser.uid
      ),
      (snapshot) => {

        if (
          snapshot.exists()
        ) {

          setChatUser(
            (prev: any) => ({
              ...prev,

              online:
                snapshot.data()
                  .online,

              lastSeen:
                snapshot.data()
                  .lastSeen,
            })
          );

        }

      }
    );

  return () =>
    unsubscribe();

}, [chatUser?.uid]);
useEffect(() => {
  const unsubscribe =
    onSnapshot(
      collection(db, "groups"),
      (snapshot) => {

        const data =
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

        setGroups(data);
      }
    );

  return () => unsubscribe();
}, []);
useEffect(() => {

const messageCollection =
  user.isGroup
    ? collection(
        db,
        "groups",
        chatId,
        "messages"
      )
    : collection(
        db,
        "chats",
        chatId,
        "messages"
      );

const q = query(
  messageCollection,
  orderBy(
    "createdAt",
    "asc"
  )
);

  const unsubscribe = onSnapshot(
    q,
    async (snapshot) => {

let msgs = snapshot.docs.map(
  (doc) => ({
    id: doc.id,
    ...doc.data(),
  })
  
);
msgs = msgs.filter(
  (msg: any) =>
    !msg.hiddenFor?.includes(
      auth.currentUser?.uid
    )
);
if (deletedAt) {

  msgs = msgs.filter(
    (msg: any) =>
      (
        msg.createdAt?.toMillis?.() || 0
      ) > deletedAt
  );
}
      setMessages(msgs);
    const lastMessage =
  msgs[msgs.length - 1] as any;


      // Mark messages as read
      for (const msg of msgs as any[]) {

      if (
  msg.senderId !==
    auth.currentUser?.uid &&
  !msg.readBy?.some(
    (u: any) =>
      u.uid ===
      auth.currentUser?.uid
  )
)
 {

await updateDoc(
  doc(
    db,
    user.isGroup
      ? "groups"
      : "chats",
    chatId,
    "messages",
    msg.id
  ),
            {
            readBy: [
  ...(msg.readBy || []),
  {
    uid: auth.currentUser?.uid,
    name:
      auth.currentUser?.displayName ||
      "Unknown",
  },
],
            }
          );
        }
      }
    }
  );

return () => unsubscribe();
}, [
  chatId,
  chatUser?.isGroup,
  deletedAt
]);
const currentGroup = groups.find(
  (group: any) => group.id === params.id
);
const user =
  chatUser || {
    name: "Unknown User",
    online: false,
    lastSeen: null,
    isGroup: false,
    members: [],
    image: "",
  };
useEffect(() => {

  const q = collection(
    db,
    "chats",
    chatId,
    "typing"
  );

  const unsubscribe =
    onSnapshot(q, (snapshot) => {

      const typingDoc =
        snapshot.docs.find(
          (doc) =>
            doc.id !==
            auth.currentUser?.uid
        );

      if (typingDoc) {

        setTypingUser(
          typingDoc.data().name
        );

      } else {

        setTypingUser("");

      }

    });

  return () => unsubscribe();

}, [chatId]);


  const [message, setMessage] = useState("");
const [typingUser, setTypingUser] =
  useState("");
  const [isTyping, setIsTyping] =
    useState(false);

  const [showEmojiPicker, setShowEmojiPicker] =
    useState(false);

  const [selectedImage, setSelectedImage] =
    useState<string | null>(null);

  const [selectedMessage, setSelectedMessage] =
    useState<number | null>(null);
const [replyingTo, setReplyingTo] =
  useState<any>(null);

const [searchText, setSearchText] =
  useState("");

const [selectedFile, setSelectedFile] =
  useState<any>(null);
  const messagesEndRef =
    useRef<HTMLDivElement>(null);

 const [messages, setMessages] =
  useState<any[]>([]);
const [isRecording, setIsRecording] =
  useState(false);

const [mediaRecorder, setMediaRecorder] =
  useState<MediaRecorder | null>(null);

  function handleEmojiClick(emojiData: any) {
    setMessage((prev) => prev + emojiData.emoji);
  }

  function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setSelectedImage(
        reader.result as string
      );
    };

    reader.readAsDataURL(file);
  }
function handleFileChange(
  e: React.ChangeEvent<HTMLInputElement>
) {
  const file = e.target.files?.[0];

  if (!file) return;

  setSelectedFile({
    file,
    name: file.name,
    size: (
      file.size / 1024 / 1024
    ).toFixed(2),
    type: file.type,
    url: URL.createObjectURL(file),
  });
}
async function sendImage() {
  if (!selectedImage) return;

  try {
    const response = await fetch(
      selectedImage
    );

    const blob = await response.blob();

    const imageRef = ref(
      storage,
      `chat-images/${Date.now()}`
    );

    await uploadBytes(
      imageRef,
      blob
    );

    const imageUrl =
      await getDownloadURL(imageRef);

const docRef = await addDoc(
  user.isGroup
    ? collection(
        db,
        "groups",
        chatId,
        "messages"
      )
    : collection(
        db,
        "chats",
        chatId,
        "messages"
      ),
      {
        image: imageUrl,
        senderId:
          auth.currentUser?.uid,
        senderName:
          auth.currentUser
            ?.displayName ||
          "Unknown",
        createdAt:
          serverTimestamp(),
      }
    );
await setDoc(
  doc(
    db,
    "notificationState",
    `${auth.currentUser?.uid}_${chatId}`
  ),
  {
    userId: auth.currentUser?.uid,
    chatId,
    lastMessageId: docRef.id,
    updatedAt: serverTimestamp(),
  }
);
  await updateDoc(
  doc(
    db,
    user.isGroup
      ? "groups"
      : "chats",
    chatId
  ),
  {
    lastMessage: "📷 Photo",
    updatedAt: serverTimestamp(),
  }
);
    setSelectedImage(null);

  } catch (error) {
    console.error(error);
    notify.error("Failed to upload image");
  }
}
async function sendFile() {
  if (!selectedFile) return;

  try {
    const fileRef = ref(
      storage,
      `chat-files/${Date.now()}-${
        selectedFile.name
      }`
    );

    await uploadBytes(
      fileRef,
      selectedFile.file
    );

    const fileUrl =
      await getDownloadURL(fileRef);

await addDoc(
  user.isGroup
    ? collection(
        db,
        "groups",
        chatId,
        "messages"
      )
    : collection(
        db,
        "chats",
        chatId,
        "messages"
      ),
      {
        fileName:
          selectedFile.name,

        fileSize:
          selectedFile.size,

        fileType:
          selectedFile.type,

        fileUrl,

        senderId:
          auth.currentUser?.uid,

        senderName:
          auth.currentUser
            ?.displayName ||
          "Unknown",

        createdAt:
          serverTimestamp(),
      }
    );
await updateDoc(
  doc(
    db,
    user.isGroup
      ? "groups"
      : "chats",
    chatId
  ),
  {
    lastMessage: "📄 File",
    updatedAt: serverTimestamp(),
  }
);
    setSelectedFile(null);

  } catch (error) {
    console.error(error);
    notify.error("Failed to upload file");
  }
}
async function handleVoiceRecording() {
  if (!isRecording) {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      const recorder = new MediaRecorder(stream);

      const audioChunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = async () => {
  try {
    const audioBlob = new Blob(audioChunks, {
      type: "audio/webm",
    });

    // Upload to Firebase Storage
    const audioRef = ref(
      storage,
      `chat-audios/${Date.now()}.webm`
    );

    await uploadBytes(audioRef, audioBlob);

    const audioUrl =
      await getDownloadURL(audioRef);

    // Save message in Firestore
    await addDoc(
      user.isGroup
        ? collection(
            db,
            "groups",
            chatId,
            "messages"
          )
        : collection(
            db,
            "chats",
            chatId,
            "messages"
          ),
      {
        audio: audioUrl,
        senderId: auth.currentUser?.uid,
        senderName:
          auth.currentUser?.displayName ||
          "Unknown",
        createdAt: serverTimestamp(),
        readBy: [
          {
            uid: auth.currentUser?.uid,
            name:
              auth.currentUser?.displayName ||
              "Unknown",
          },
        ],
      }
    );

    // Update chat list
    await updateDoc(
      doc(
        db,
        user.isGroup
          ? "groups"
          : "chats",
        chatId
      ),
      {
        lastMessage: "🎤 Voice Message",
        updatedAt: serverTimestamp(),
      }
    );

  } catch (error) {
    console.log(error);
    notify.error(
      "Failed to send voice message"
    );
  }
};

      recorder.start();

      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      notify.error("Microphone permission denied");
    }
  } else {
    mediaRecorder?.stop();
    setIsRecording(false);
  }
}
async function sendMessage() {
  const cleanMessage = sanitizeText(message);

  if (!forwardedMessage && !cleanMessage) {
    notify.error("Message cannot be empty");
    return;
  }

  const outgoingText = forwardedMessage
    ? sanitizeText(forwardedMessage.text || message)
    : cleanMessage;

  try {

    const docRef = await addDoc(
  user.isGroup
    ? collection(
        db,
        "groups",
        chatId,
        "messages"
      )
    : collection(
        db,
        "chats",
        chatId,
        "messages"
      ),
  {
    
text:
  outgoingText,

    senderId:
      auth.currentUser?.uid,

    senderName:
      auth.currentUser?.displayName ||
      "Unknown",

   replyTo:
  replyingTo?.text ||
  replyingTo?.fileName ||
  (replyingTo?.image
    ? "📷 Photo"
    : "") ||
  (replyingTo?.audio
    ? "🎤 Voice Message"
    : ""),

replyToId:
  replyingTo?.id || "",

    reactions: {},

   readBy: [
  {
    uid: auth.currentUser?.uid,
    name:
      auth.currentUser?.displayName ||
      "Unknown",
  },
],

    createdAt:
      serverTimestamp(),
  }
);

    // Save last sent message id
    if (!user.isGroup) {

 await setDoc(
  doc(
    db,
    "notificationState",
    `${auth.currentUser?.uid}_${chatId}`
  ),
  {
    userId: auth.currentUser?.uid,
    chatId,
    lastMessageId: docRef.id,
    updatedAt: serverTimestamp(),
  }
);

    } else {

      await setDoc(
  doc(
    db,
    "notificationState",
    `${auth.currentUser?.uid}_${chatId}`
  ),
  {
    userId: auth.currentUser?.uid,
    chatId,
    lastMessageId: docRef.id,
    updatedAt: serverTimestamp(),
  }
);

    }

    await updateDoc(
      doc(
        db,
        user.isGroup
          ? "groups"
          : "chats",
        chatId
      ),
      {
        lastMessage: outgoingText,
        updatedAt: serverTimestamp(),
      }
    );

    setMessage("");
    setReplyingTo(null);
    setShowEmojiPicker(false);
if (forwardedMessage) {

  await deleteDoc(
    doc(
      db,
      "forwardQueue",
      auth.currentUser!.uid
    )
  );

  setForwardedMessage(null);
}
  } catch (error) {

    console.error(error);

    notify.error("Failed to send message");
  }
}

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  
return (
  <main className="h-screen bg-gradient-to-b from-indigo-900 to-indigo-950 flex flex-col overflow-hidden">

     

    <ChatHeader
      user={user}
      params={params}
    />


<ChatExtras
  replyingTo={replyingTo}
  setReplyingTo={setReplyingTo}
  searchText={searchText}
  setSearchText={setSearchText}
  typingUser={typingUser}
  selectedImage={selectedImage}
  setSelectedImage={setSelectedImage}
  selectedFile={selectedFile}
  setSelectedFile={setSelectedFile}
/>

<ChatMessage
  messages={messages}
  searchText={searchText}
  selectedMessage={
    selectedMessage
  }
  setSelectedMessage={
    setSelectedMessage
  }
  setReplyingTo={
    setReplyingTo
  }
  setMessages={setMessages}
  messagesEndRef={
    messagesEndRef
  }
  chatId={chatId}
  isGroup={user.isGroup}
/>
{forwardedMessage && (

  <div className="
    mx-4 mb-2 rounded-2xl
    bg-green-600/20 p-3
    text-white
  ">

    <div className="
      flex justify-between
      items-center
    ">

      <div>

        <p className="text-xs">
          Forwarding
        </p>

        <p className="text-sm">
          {forwardedMessage.text ||
           forwardedMessage.fileName ||
           "Media"}
        </p>

      </div>

      <button
        onClick={() =>
          setForwardedMessage(
            null
          )
        }
      >
        ✕
      </button>

    </div>

  </div>

)}

    <ChatInput
      message={message}
      setMessage={setMessage}
      sendMessage={sendMessage}
      sendImage={sendImage}
      sendFile={sendFile}
      selectedImage={selectedImage}
      selectedFile={selectedFile}
      handleImageChange={
        handleImageChange
      }
      handleFileChange={
        handleFileChange
      }
      showEmojiPicker={
        showEmojiPicker
      }
      setShowEmojiPicker={
        setShowEmojiPicker
      }
      handleEmojiClick={
        handleEmojiClick
      }
      handleVoiceRecording={
        handleVoiceRecording
      }
      isRecording={isRecording}
      chatId={chatId}
      isGroup={user.isGroup}
    />


  </main>
);
}
