import { useEffect, useState } from 'react';

interface Piece {
  id: number;
  x: number;
  color: string;
  shape: string;
  delay: number;
  size: number;
}

export function ConfettiEffect({ active }: { active: boolean }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (!active) { setPieces([]); return; }
    const colors = ['#FFD700', '#FF6B35', '#7C3AED', '#00F5FF', '#39FF14', '#FF1493'];
    const shapes = ['●', '■', '▲', '★', '◆'];
    const newPieces = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      delay: Math.random() * 0.8,
      size: 12 + Math.random() * 12,
    }));
    setPieces(newPieces);
    const timer = setTimeout(() => setPieces([]), 2500);
    return () => clearTimeout(timer);
  }, [active]);

  if (!pieces.length) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute top-0"
          style={{
            left: `${p.x}%`,
            color: p.color,
            fontSize: p.size,
            animation: `confetti-fall 2s ease-in ${p.delay}s both`,
          }}
        >
          {p.shape}
        </div>
      ))}
    </div>
  );
}
