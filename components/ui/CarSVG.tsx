interface CarSVGProps {
  width?: number;
  opacity?: number;
  className?: string;
}

export default function CarSVG({ width = 300, opacity = 0.12, className }: CarSVGProps) {
  const height = width * 0.5;
  return (
    <svg
      viewBox="0 0 500 250"
      width={width}
      height={height}
      fill="none"
      opacity={opacity}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M70 165 L95 110 Q145 72 250 72 Q355 72 390 105 L425 165 Z"
        stroke="#c9a84c"
        strokeWidth="2"
      />
      <path
        d="M48 165 L452 165 L452 188 L48 188 Z"
        stroke="#c9a84c"
        strokeWidth="1.5"
        opacity="0.5"
      />
      <circle cx="122" cy="194" r="28" stroke="#c9a84c" strokeWidth="2" />
      <circle cx="122" cy="194" r="11" stroke="#c9a84c" strokeWidth="1.2" opacity="0.45" />
      <circle cx="378" cy="194" r="28" stroke="#c9a84c" strokeWidth="2" />
      <circle cx="378" cy="194" r="11" stroke="#c9a84c" strokeWidth="1.2" opacity="0.45" />
      <path
        d="M160 112 L190 90 L310 90 L340 112 Z"
        stroke="#c9a84c"
        strokeWidth="1.5"
        opacity="0.65"
      />
      <line
        x1="250"
        y1="72"
        x2="250"
        y2="165"
        stroke="#c9a84c"
        strokeWidth="0.6"
        opacity="0.18"
        strokeDasharray="5 5"
      />
    </svg>
  );
}
