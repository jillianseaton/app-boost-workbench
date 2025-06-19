
import React from 'react';

interface SafeGradientProps {
  id: string;
  color1: string;
  color2: string;
  x1?: string | number;
  y1?: string | number;
  x2?: string | number;
  y2?: string | number;
}

export const SafeGradient: React.FC<SafeGradientProps> = ({
  id,
  color1,
  color2,
  x1 = "0",
  y1 = "0",
  x2 = "0",
  y2 = "1"
}) => {
  // Ensure all values are properly defined
  const safeX1 = x1 !== undefined ? String(x1) : "0";
  const safeY1 = y1 !== undefined ? String(y1) : "0";
  const safeX2 = x2 !== undefined ? String(x2) : "0";
  const safeY2 = y2 !== undefined ? String(y2) : "1";

  return (
    <linearGradient
      id={id}
      x1={safeX1}
      y1={safeY1}
      x2={safeX2}
      y2={safeY2}
    >
      <stop offset="5%" stopColor={color1} />
      <stop offset="95%" stopColor={color2} />
    </linearGradient>
  );
};
