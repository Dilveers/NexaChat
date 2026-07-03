interface Props {
  date: string;
}

export default function DateDivider({ date }: Props) {
  return (
    <div className="flex justify-center my-6">
      <span className="bg-white/10 text-white text-sm px-4 py-2 rounded-full backdrop-blur-md">
        {date}
      </span>
    </div>
  );
}