// Winnie-the-Pooh themed SVG icons and decorative elements

export function PoohIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Pooh bear face */}
      <circle cx="50" cy="50" r="45" fill="#F4A460" stroke="#8B4513" strokeWidth="2" />
      {/* Ears */}
      <circle cx="30" cy="25" r="12" fill="#F4A460" stroke="#8B4513" strokeWidth="2" />
      <circle cx="70" cy="25" r="12" fill="#F4A460" stroke="#8B4513" strokeWidth="2" />
      <circle cx="30" cy="25" r="8" fill="#8B4513" />
      <circle cx="70" cy="25" r="8" fill="#8B4513" />
      {/* Eyes */}
      <circle cx="35" cy="40" r="8" fill="#654321" />
      <circle cx="65" cy="40" r="8" fill="#654321" />
      <circle cx="35" cy="40" r="4" fill="#FFF" />
      <circle cx="65" cy="40" r="4" fill="#FFF" />
      {/* Nose */}
      <ellipse cx="50" cy="55" rx="8" ry="6" fill="#8B4513" />
      {/* Mouth */}
      <path d="M 42 60 Q 50 65 58 60" stroke="#8B4513" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function HoneyPotIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Honey pot */}
      <path
        d="M 30 40 L 30 80 Q 30 90 40 90 L 60 90 Q 70 90 70 80 L 70 40 Z"
        fill="#FFD700"
        stroke="#F4A460"
        strokeWidth="2"
      />
      <ellipse cx="50" cy="40" rx="20" ry="8" fill="#F4A460" stroke="#8B4513" strokeWidth="2" />
      <path d="M 40 50 Q 50 45 60 50" stroke="#8B4513" strokeWidth="1.5" fill="none" />
      <path d="M 45 60 Q 50 55 55 60" stroke="#8B4513" strokeWidth="1.5" fill="none" />
      <path d="M 40 70 Q 50 65 60 70" stroke="#8B4513" strokeWidth="1.5" fill="none" />
      {/* Handle */}
      <path
        d="M 70 50 Q 80 45 80 55 Q 80 65 70 60"
        stroke="#8B4513"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BeeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Bee body */}
      <ellipse cx="50" cy="50" rx="30" ry="20" fill="#FFD700" stroke="#654321" strokeWidth="2" />
      <line x1="35" y1="50" x2="25" y2="50" stroke="#654321" strokeWidth="2" strokeLinecap="round" />
      <line x1="65" y1="50" x2="75" y2="50" stroke="#654321" strokeWidth="2" strokeLinecap="round" />
      {/* Stripes */}
      <line x1="40" y1="45" x2="40" y2="55" stroke="#654321" strokeWidth="3" />
      <line x1="50" y1="45" x2="50" y2="55" stroke="#654321" strokeWidth="3" />
      <line x1="60" y1="45" x2="60" y2="55" stroke="#654321" strokeWidth="3" />
      {/* Wings */}
      <ellipse cx="45" cy="40" rx="8" ry="12" fill="#FFF8DC" opacity="0.7" />
      <ellipse cx="55" cy="40" rx="8" ry="12" fill="#FFF8DC" opacity="0.7" />
      {/* Eyes */}
      <circle cx="45" cy="48" r="3" fill="#654321" />
      <circle cx="55" cy="48" r="3" fill="#654321" />
    </svg>
  );
}

export function PoohBackgroundPattern() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-5 z-0">
      {/* Animated floating Pooh icons */}
      <div className="absolute top-10 left-10 animate-bounce" style={{ animationDuration: '3s', animationDelay: '0s' }}>
        <PoohIcon className="w-16 h-16" />
      </div>
      <div className="absolute top-32 right-20 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
        <HoneyPotIcon className="w-12 h-12" />
      </div>
      <div className="absolute bottom-20 left-32 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>
        <BeeIcon className="w-8 h-8" />
      </div>
      <div className="absolute bottom-40 right-10 animate-bounce" style={{ animationDuration: '4.5s', animationDelay: '1.5s' }}>
        <PoohIcon className="w-14 h-14" />
      </div>
      <div className="absolute top-1/2 left-1/4 animate-bounce" style={{ animationDuration: '3.2s', animationDelay: '0.8s' }}>
        <HoneyPotIcon className="w-10 h-10" />
      </div>
      <div className="absolute top-1/3 right-1/3 animate-bounce" style={{ animationDuration: '3.8s', animationDelay: '1.2s' }}>
        <BeeIcon className="w-6 h-6" />
      </div>
      <div className="absolute top-2/3 left-1/2 animate-bounce" style={{ animationDuration: '4.2s', animationDelay: '0.3s' }}>
        <PoohIcon className="w-12 h-12" />
      </div>
      <div className="absolute bottom-1/4 right-1/4 animate-bounce" style={{ animationDuration: '3.6s', animationDelay: '1.8s' }}>
        <HoneyPotIcon className="w-8 h-8" />
      </div>
    </div>
  );
}

