import { FaSearch } from "react-icons/fa";

interface SearchBarProps {
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

export default function SearchBar({
  value,
  onChange,
}: SearchBarProps) {
  return (
    <div className="flex items-center gap-3 rounded-3xl bg-white/10 p-4">

      <FaSearch className="text-white/60" />

      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Search chats..."
        className="flex-1 bg-transparent outline-none text-white placeholder:text-white/60"
      />

    </div>
  );
}