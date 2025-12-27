"use client";

import { useEffect, useRef } from 'react';

interface DustChartProps {
  data: Array<{
    time: string;
    dust: number;
    confidence?: number;
  }>;
  title?: string;
  showThresholds?: boolean;
}

export default function DustChart({ data, title = "Dust Forecast", showThresholds = true }: DustChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Clear canvas
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, width, height);

    // Find max value
    const maxDust = Math.max(...data.map(d => d.dust), 100);
    const yScale = chartHeight / maxDust;
    const xScale = chartWidth / (data.length - 1);

    // Draw grid lines
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      
      // Y-axis labels
      const value = Math.round(maxDust - (maxDust / 5) * i);
      ctx.fillStyle = '#9ca3af';
      ctx.font = '11px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(value.toString(), padding.left - 8, y + 4);
    }

    // Draw threshold lines
    if (showThresholds) {
      const thresholds = [
        { value: 20, color: '#fbbf24', label: 'Moderate' },
        { value: 50, color: '#f97316', label: 'High' },
        { value: 100, color: '#ef4444', label: 'Severe' }
      ];

      thresholds.forEach(t => {
        if (t.value <= maxDust) {
          const y = padding.top + chartHeight - (t.value * yScale);
          ctx.strokeStyle = t.color;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(padding.left, y);
          ctx.lineTo(width - padding.right, y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });
    }

    // Draw area gradient
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, 'rgba(249, 115, 22, 0.4)');
    gradient.addColorStop(1, 'rgba(249, 115, 22, 0)');

    ctx.beginPath();
    ctx.moveTo(padding.left, height - padding.bottom);
    
    data.forEach((d, i) => {
      const x = padding.left + i * xScale;
      const y = padding.top + chartHeight - (d.dust * yScale);
      if (i === 0) {
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.lineTo(padding.left + (data.length - 1) * xScale, height - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2;
    
    data.forEach((d, i) => {
      const x = padding.left + i * xScale;
      const y = padding.top + chartHeight - (d.dust * yScale);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // X-axis labels
    ctx.fillStyle = '#9ca3af';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'center';
    
    const labelInterval = Math.ceil(data.length / 6);
    data.forEach((d, i) => {
      if (i % labelInterval === 0) {
        const x = padding.left + i * xScale;
        const label = i === 0 ? 'Now' : `+${i}h`;
        ctx.fillText(label, x, height - padding.bottom + 20);
      }
    });

  }, [data, showThresholds]);

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <canvas 
        ref={canvasRef} 
        className="w-full h-[200px]"
        style={{ width: '100%', height: '200px' }}
      />
      
      {showThresholds && (
        <div className="flex justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-yellow-500" />
            <span className="text-gray-400">Moderate (20)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-orange-500" />
            <span className="text-gray-400">High (50)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-red-500" />
            <span className="text-gray-400">Severe (100)</span>
          </div>
        </div>
      )}
    </div>
  );
}
