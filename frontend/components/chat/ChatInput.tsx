"use client";

import { useEffect, useRef } from "react";
import EmojiPicker from "emoji-picker-react";

import {
  FaSmile,
  FaImage,
  FaFile,
  FaMicrophone,
  FaPaperPlane,
} from "react-icons/fa";

import { auth, db } from "@/lib/firebase";

import {
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

interface Props {
  message: string;
  setMessage: any;
  sendMessage: any;
  sendImage: any;
  sendFile: any;
  selectedImage: any;
  selectedFile: any;
  handleImageChange: any;
  handleFileChange: any;
  showEmojiPicker: boolean;
  setShowEmojiPicker: any;
  handleEmojiClick: any;
  handleVoiceRecording: any;
  isRecording: boolean;
  chatId: string;
  isGroup: boolean;
}

export default function ChatInput({
  message,
  setMessage,
  sendMessage,
  sendImage,
  sendFile,
  selectedImage,
  selectedFile,
  handleImageChange,
  handleFileChange,
  showEmojiPicker,
  setShowEmojiPicker,
  handleEmojiClick,
  handleVoiceRecording,
  isRecording,
  chatId,
  isGroup,
}: Props) {
  const typingTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative p-3 sm:p-5 border-t border-white/10">

      {showEmojiPicker && (
        <div className="absolute bottom-24 left-5 z-50">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
          />
        </div>
      )}

    <div className="flex items-center gap-2 rounded-3xl bg-white/10 p-2 sm:p-3">

        {/* Emoji Button */}
        <button
          onClick={() =>
            setShowEmojiPicker(
              !showEmojiPicker
            )
          }
          className="text-white text-xl sm:text-2xl"
        >
          <FaSmile />
        </button>

        {/* Image Upload */}
        <label className="text-white text-2xl cursor-pointer">
          <FaImage />

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>

        {/* File Upload */}
        <label className="text-white text-2xl cursor-pointer">
          <FaFile />

          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {/* Voice Button */}
        <button
          onClick={handleVoiceRecording}
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
            isRecording
              ? "bg-red-600"
              : "bg-pink-500"
          }`}
        >
          <FaMicrophone className="text-white" />
        </button>

        {/* Message Input */}
        <input
          type="text"
          value={message}
          onChange={async (e) => {
            setMessage(e.target.value);

            const currentUser =
              auth.currentUser;

            if (!currentUser) return;

            await setDoc(
              doc(
           db,
 isGroup
    ? "groups"
    : "chats",
  chatId,
  "typing",
  currentUser.uid
              ),
              {
                name:
                  currentUser.displayName ||
                  "Unknown",
                typing: true,
              }
            );

            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(async () => {
              try {
                await deleteDoc(
                  doc(
                    db,
                    isGroup
                      ? "groups"
                      : "chats",
                    chatId,
                    "typing",
                    currentUser.uid
                  )
                );
              } catch {}
            }, 1500);
          }}

          onKeyDown={(e) => {
            if (e.key === "Enter") {

              if (selectedImage) {
                sendImage();

              } else if (selectedFile) {
                sendFile();

              } else {
                sendMessage();
              }

            }
          }}

          placeholder="Type a message..."
          className="flex-1 bg-transparent outline-none text-white placeholder:text-white/60"
        />

        {/* Send Button */}
        <button
          onClick={() => {

            if (selectedImage) {
              sendImage();

            } else if (selectedFile) {
              sendFile();

            } else {
              sendMessage();
            }

          }}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-600 flex items-center justify-center hover:bg-indigo-500 transition"
        >
          <FaPaperPlane className="text-white" />
        </button>

      </div>

    </div>
  );
}
