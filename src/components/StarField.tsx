import { useMemo } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

export function StarField() {
  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: 80 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      delay: (i * 0.15) % 3,
      duration: 2 + Math.random() * 3,
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white animate-star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}
      {/* Nebula effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8"
        style={{ background: 'radial-gradient(circle, #00f5ff 0%, transparent 70%)' }} />
    </div>
  );
}
