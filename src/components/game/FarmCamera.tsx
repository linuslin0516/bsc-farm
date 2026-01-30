import { useState, useRef, useCallback, useEffect, ReactNode } from 'react';

interface FarmCameraProps {
  children: ReactNode;
  minZoom?: number;
  maxZoom?: number;
  initialZoom?: number;
}

interface Position {
  x: number;
  y: number;
}

export const FarmCamera: React.FC<FarmCameraProps> = ({
  children,
  minZoom = 0.5,
  maxZoom = 2,
  initialZoom = 1,
}) => {
  const [zoom, setZoom] = useState(initialZoom);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<Position>({ x: 0, y: 0 });
  const positionStart = useRef<Position>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle mouse down - start dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    positionStart.current = { ...position };
  }, [position]);

  // Handle mouse move - drag
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    setPosition({
      x: positionStart.current.x + dx,
      y: positionStart.current.y + dy,
    });
  }, [isDragging]);

  // Handle mouse up - stop dragging
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle wheel - zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.min(maxZoom, Math.max(minZoom, prev + delta)));
  }, [minZoom, maxZoom]);

  // Handle double click - reset view
  const handleDoubleClick = useCallback(() => {
    setZoom(initialZoom);
    setPosition({ x: 0, y: 0 });
  }, [initialZoom]);

  // Global mouse up listener
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
    >
      {/* Zoom indicator */}
      <div className="absolute top-4 right-4 z-20 bg-binance-dark/80 px-3 py-1 rounded-full text-sm text-binance-yellow">
        {Math.round(zoom * 100)}%
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={() => setZoom((prev) => Math.min(maxZoom, prev + 0.2))}
          className="w-10 h-10 bg-binance-dark/80 border border-binance-yellow rounded-lg text-binance-yellow hover:bg-binance-yellow hover:text-black transition-colors"
        >
          +
        </button>
        <button
          onClick={() => setZoom((prev) => Math.max(minZoom, prev - 0.2))}
          className="w-10 h-10 bg-binance-dark/80 border border-binance-yellow rounded-lg text-binance-yellow hover:bg-binance-yellow hover:text-black transition-colors"
        >
          -
        </button>
        <button
          onClick={handleDoubleClick}
          className="w-10 h-10 bg-binance-dark/80 border border-binance-yellow rounded-lg text-binance-yellow hover:bg-binance-yellow hover:text-black transition-colors text-xs"
          title="Reset view"
        >
          Reset
        </button>
      </div>

      {/* Help text */}
      <div className="absolute bottom-4 left-4 z-20 text-xs text-gray-400">
        Drag to move | Scroll to zoom | Double-click to reset
      </div>

      {/* Transformed content */}
      <div
        className="absolute inset-0 flex items-center justify-center transition-transform duration-75"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
        }}
      >
        {children}
      </div>
    </div>
  );
};
