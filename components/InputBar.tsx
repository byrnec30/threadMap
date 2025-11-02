'use client';

type Props = {
  input: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: (text: string) => void;
};

export default function InputBar({ input, onChange, onSend }: Props) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSend(input);
      }}
      className="flex p-4 border-t bg-white"
    >
      <input
        value={input}
        onChange={onChange}
        placeholder="Type a message..."
        className="flex-1 p-2 border rounded-l dark:bg-zinc-900"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-purple-600 text-white rounded-r hover:bg-purple-700"
      >
        Send
      </button>
    </form>
  );
}
