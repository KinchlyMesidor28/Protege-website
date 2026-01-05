interface TeachModeBarProps {
  onFinish: () => void;
  onCancel: () => void;
}

export function TeachModeBar({ onFinish, onCancel }: TeachModeBarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-neutral-900 text-white h-11 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <span>Teaching Protégé…</span>
      </div>
      <div className="flex gap-4">
        <button
          onClick={onFinish}
          className="px-4 py-1.5 bg-white text-neutral-900 rounded hover:bg-neutral-100 transition-colors"
        >
          Finish
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-1.5 text-white hover:text-neutral-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
