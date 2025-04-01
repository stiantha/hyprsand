export const TextEditor = () => {
  return (
    <div className="h-full bg-gray-900 text-gray-100 font-mono p-2">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span>untitled.txt</span>
          <span className="text-gray-500">plaintext</span>
        </div>
        <textarea
          className="flex-1 w-full bg-transparent border-none outline-none resize-none"
          placeholder="Start typing..."
        />
      </div>
    </div>
  );
}; 