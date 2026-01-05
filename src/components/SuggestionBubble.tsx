interface SuggestionBubbleProps {
  onYes: () => void;
  onNotNow: () => void;
  onSchedule: () => void;
}

export function SuggestionBubble({ onYes, onNotNow, onSchedule }: SuggestionBubbleProps) {
  return (
    <div className="fixed bottom-8 right-8 z-50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-lg border border-neutral-200 p-6 max-w-sm">
        <p className="text-neutral-800 mb-1">I've seen this task before.</p>
        <p className="text-neutral-600 mb-6">Want me to handle it next time?</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onYes}
            className="w-full px-4 py-2 bg-neutral-900 text-white rounded hover:bg-neutral-800 transition-colors"
          >
            Yes
          </button>
          <button
            onClick={onSchedule}
            className="w-full px-4 py-2 bg-neutral-100 text-neutral-900 rounded hover:bg-neutral-200 transition-colors"
          >
            Schedule it daily
          </button>
          <button
            onClick={onNotNow}
            className="w-full px-4 py-2 text-neutral-700 hover:text-neutral-900 transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}