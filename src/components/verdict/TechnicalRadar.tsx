import React from 'react';
import { StrategicMetrics, Language, UserTier } from '../../lib/types';

interface Props {
  metrics: StrategicMetrics;
  color: string;
  userTier: UserTier;
  lang: Language;
}

export const TechnicalRadar: React.FC<Props> = ({ metrics, color, userTier, lang }) => {
  if (userTier === 'OBSERVER') {
    return (
      <div className="relative w-[240px] h-[240px] flex items-center justify-center border border-dashed border-gray-300 rounded-full bg-gray-50/50">
        <div className="text-center z-10">
          <span className="text-3xl mb-3 block opacity-30">🔒</span>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
            {lang === 'zh-TW' ? '機密資料' : 'Classified Data'}
          </p>
        </div>
      </div>
    );
  }

  const size = 200;
  const center = size / 2;
  const radius = (size / 2) - 30;
  const labels = lang === 'zh-TW'
    ? { inn: '創新', rsk: '風險', spd: '速度', cap: '資本', res: '韌性' }
    : { inn: 'Innov', rsk: 'Risk', spd: 'Speed', cap: 'Cap', res: 'Resil' };

  const data = [
    { key: labels.inn, value: metrics.innovation },
    { key: labels.rsk, value: metrics.risk },
    { key: labels.spd, value: metrics.speed },
    { key: labels.cap, value: metrics.capital },
    { key: labels.res, value: metrics.resilience },
  ];

  const angleSlice = (Math.PI * 2) / 5;
  const getPoint = (value: number, index: number) => {
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(index * angleSlice - Math.PI / 2),
      y: center + r * Math.sin(index * angleSlice - Math.PI / 2),
    };
  };

  const points = data.map((d, i) => getPoint(d.value, i)).map(p => `${p.x},${p.y}`).join(' ');
  const fullPoints = data.map((_, i) => getPoint(100, i));

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative mb-6">
        <svg width={size} height={size} className="overflow-visible radar-chart-container">
          {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, i) => (
            <circle key={i} cx={center} cy={center} r={radius * scale} fill="none" stroke="#D1D5DB" strokeDasharray={i === 4 ? "0" : "4,2"} strokeWidth="0.8" opacity={0.6} />
          ))}
          {fullPoints.map((p, i) => (
            <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#E5E7EB" strokeWidth="1" />
          ))}
          <polygon points={points} fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
          {data.map((d, i) => {
            const p = getPoint(d.value, i);
            return <circle key={i} cx={p.x} cy={p.y} r="3" fill="white" stroke={color} strokeWidth="2" />;
          })}
          {fullPoints.map((p, i) => {
            const angle = i * angleSlice - Math.PI / 2;
            const labelX = center + (radius + 25) * Math.cos(angle);
            const labelY = center + (radius + 15) * Math.sin(angle);
            return (
              <text key={i} x={labelX} y={labelY + 2} fill="#4B5563" fontSize="10" fontFamily="Noto Sans TC" textAnchor="middle" fontWeight="bold">
                {data[i].key}
              </text>
            );
          })}
        </svg>
      </div>
      <div className="w-full grid grid-cols-2 gap-x-8 gap-y-2 text-left border-t border-gray-100 pt-6 mt-2">
        {data.map((d, i) => (
          <div key={i} className="flex justify-between items-baseline border-b border-gray-50 pb-1">
            <span className="text-[10px] uppercase tracking-widest text-gray-600 sans-tc font-semibold">{d.key}</span>
            <div className="flex items-center gap-2">
              <div className="h-1 bg-gray-100 w-12 rounded-full overflow-hidden">
                <div className="h-full" style={{ width: `${d.value}%`, backgroundColor: color, opacity: 0.6 }} />
              </div>
              <span className="text-xs serif-tc font-bold text-gray-800 w-6 text-right">{d.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
