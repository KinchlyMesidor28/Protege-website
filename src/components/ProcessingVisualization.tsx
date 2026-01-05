interface ProcessingVisualizationProps {
  rawCount: number;
  refinedCount: number;
}

export function ProcessingVisualization({ rawCount, refinedCount }: ProcessingVisualizationProps) {
  const removedCount = rawCount - refinedCount;
  
  return (
    <div className="bg-neutral-50 border border-neutral-200 rounded p-6 space-y-4">
      <div className="text-center">
        <p className="text-neutral-600 text-sm mb-4">Processing Pipeline</p>
      </div>

      <div className="space-y-3">
        {/* Module 1: Goal Deduction */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-neutral-900 text-white rounded flex items-center justify-center text-sm flex-shrink-0">
            1
          </div>
          <div className="flex-1">
            <p className="text-neutral-800 text-sm">Goal Deduction</p>
            <p className="text-neutral-500 text-xs">Identified terminal success state</p>
          </div>
        </div>

        {/* Module 2: Backward Tracing */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-neutral-900 text-white rounded flex items-center justify-center text-sm flex-shrink-0">
            2
          </div>
          <div className="flex-1">
            <p className="text-neutral-800 text-sm">Backward Tracing</p>
            <p className="text-neutral-500 text-xs">Mapped causal necessity</p>
          </div>
        </div>

        {/* Module 3: Noise Pruning */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-neutral-900 text-white rounded flex items-center justify-center text-sm flex-shrink-0">
            3
          </div>
          <div className="flex-1">
            <p className="text-neutral-800 text-sm">Noise Pruning</p>
            <p className="text-neutral-500 text-xs">Filtered mistakes and redundancy</p>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="pt-3 border-t border-neutral-200">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">Raw actions recorded:</span>
          <span className="text-neutral-900">{rawCount}</span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-neutral-600">Refined script:</span>
          <span className="text-neutral-900">{refinedCount}</span>
        </div>
        {removedCount > 0 && (
          <div className="flex justify-between text-sm mt-2">
            <span className="text-neutral-500">Noise removed:</span>
            <span className="text-neutral-500">{removedCount}</span>
          </div>
        )}
      </div>
    </div>
  );
}
