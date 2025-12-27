"use client";

interface RiskGaugeProps {
  value: number;
  maxValue?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function RiskGauge({ 
  value, 
  maxValue = 200, 
  label = "Dust Level",
  size = 'md'
}: RiskGaugeProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);

  const getColor = () => {
    if (value >= 200) return '#8b5cf6';
    if (value >= 100) return '#ef4444';
    if (value >= 50) return '#f97316';
    if (value >= 20) return '#f59e0b';
    return '#10b981';
  };

  const getRiskLevel = () => {
    if (value >= 200) return 'EXTREME';
    if (value >= 100) return 'SEVERE';
    if (value >= 50) return 'HIGH';
    if (value >= 20) return 'MODERATE';
    return 'LOW';
  };

  const sizes = {
    sm: { width: 120, stroke: 8, fontSize: 'text-2xl' },
    md: { width: 160, stroke: 10, fontSize: 'text-4xl' },
    lg: { width: 200, stroke: 12, fontSize: 'text-5xl' }
  };

  const { width, stroke, fontSize } = sizes[size];
  const radius = (width - stroke) / 2;
  const circumference = radius * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width={width} height={width / 2 + 20}>
        {/* Background arc */}
        <path
          d={`M ${stroke / 2} ${width / 2} A ${radius} ${radius} 0 0 1 ${width - stroke / 2} ${width / 2}`}
          fill="none"
          stroke="#374151"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d={`M ${stroke / 2} ${width / 2} A ${radius} ${radius} 0 0 1 ${width - stroke / 2} ${width / 2}`}
          fill="none"
          stroke={getColor()}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Value display */}
      <div className="relative -mt-16 text-center">
        <p className={`${fontSize} font-bold`} style={{ color: getColor() }}>
          {value.toFixed(0)}
        </p>
        <p className="text-gray-400 text-sm">μg/m³</p>
        <div 
          className="mt-2 px-3 py-1 rounded-full text-sm font-medium"
          style={{ 
            backgroundColor: `${getColor()}20`,
            color: getColor()
          }}
        >
          {getRiskLevel()}
        </div>
      </div>

      {label && (
        <p className="text-gray-500 text-sm mt-2">{label}</p>
      )}
    </div>
  );
}
