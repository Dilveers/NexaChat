"use client";

import { FaSearch } from "react-icons/fa";

interface Props {
  replyingTo: any;
  setReplyingTo: any;
  searchText: string;
  setSearchText: any;
  typingUser: string;
  selectedImage: string | null;
  setSelectedImage: any;
  selectedFile: any;
  setSelectedFile: any;
}

export default function ChatExtras({
  replyingTo,
  setReplyingTo,
  searchText,
  setSearchText,
  typingUser,
  selectedImage,
  setSelectedImage,
  selectedFile,
  setSelectedFile,
}: Props) {
  return (
    <div className="p-4">

      {replyingTo && (
        <div className="mb-3 rounded-2xl bg-white/10 p-3">

          <div className="flex justify-between">

            <div>
              <p className="text-xs text-white/60">
                Replying to
              </p>

              <p className="text-white">
                {replyingTo.text}
              </p>
            </div>

            <button
              onClick={() =>
                setReplyingTo(null)
              }
              className="text-red-400"
            >
              ✕
            </button>

          </div>

        </div>
      )}

      <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">

        <FaSearch className="text-white" />

        <input
          type="text"
          placeholder="Search messages..."
          value={searchText}
          onChange={(e) =>
            setSearchText(
              e.target.value
            )
          }
          className="flex-1 bg-transparent text-white outline-none"
        />

      </div>

      {typingUser && (
        <p className="px-5 pb-2 pt-3 text-white/60 italic">
          {typingUser} is typing...
        </p>
      )}

      {selectedImage && (
        <div className="px-5 pb-3 pt-3">

          <div className="relative w-fit">

            <img
              src={selectedImage}
              alt="preview"
              className="w-40 rounded-2xl"
            />

            <button
              onClick={() =>
                setSelectedImage(null)
              }
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-red-500 text-white"
            >
              ✕
            </button>

          </div>

        </div>
      )}

      {selectedFile && (
        <div className="px-5 pb-3 pt-3">

          <div className="rounded-2xl bg-white/10 p-4 text-white">

            <div className="flex items-center gap-3">

              <div className="text-3xl">
                📄
              </div>

              <div>

                <p>
                  {selectedFile.name}
                </p>

                <p className="text-sm text-white/60">
                  {selectedFile.size} MB
                </p>

              </div>

              <button
                onClick={() =>
                  setSelectedFile(null)
                }
                className="ml-auto text-red-400"
              >
                ✕
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}