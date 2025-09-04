interface LoadingSkeletonProps {
  sections: Array<{
    title?: boolean;
    items?: number;
    itemHeight?: string;
    gridCols?: number;
    extraElements?: number;
  }>;
}

export function LoadingSkeleton({ sections }: LoadingSkeletonProps) {
  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      {sections.map((section, sectionIndex) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <fine for skeletons>
        <div key={`section-${sectionIndex}`}>
          {section.title && (
            <div className="h-5 bg-muted/50 rounded animate-pulse mb-3"></div>
          )}
          {section.gridCols && section.items ? (
            <div className={`grid grid-cols-${section.gridCols} gap-${section.gridCols === 2 ? 2 : 3}`}>
              {Array.from({ length: section.items }, (_, i) => (
                <div
                // biome-ignore lint/suspicious/noArrayIndexKey: <fine for skeletons>
                  key={`grid-item-${sectionIndex}-${i}`}
                  className={`${section.itemHeight || "h-10"} bg-muted/30 rounded animate-pulse`}
                ></div>
              ))}
            </div>
          ) : section.items ? (
            <div className="space-y-2">
              {Array.from({ length: section.items }, (_, i) => (
                <div
                // biome-ignore lint/suspicious/noArrayIndexKey: <fine for skeletons>
                  key={`list-item-${sectionIndex}-${i}`}
                  className={`${section.itemHeight || "h-8"} bg-muted/30 rounded animate-pulse`}
                ></div>
              ))}
            </div>
          ) : null}
          {section.extraElements && (
            <div className="flex gap-3 mt-3">
              {Array.from({ length: section.extraElements }, (_, i) => (
                <div
                // biome-ignore lint/suspicious/noArrayIndexKey: <fine for skeletons>
                  key={`extra-${sectionIndex}-${i}`}
                  className="flex-1 h-10 bg-muted/30 rounded animate-pulse"
                ></div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}