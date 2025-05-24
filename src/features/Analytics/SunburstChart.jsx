import { useEffect, useRef } from 'react';
import Sunburst from 'sunburst-chart';

// Кастомные цвета по уровням
const LEVEL_COLORS = [
  '#a78bfa', // 0 - root
  '#6366f1', // 1 - device
  '#fbbf24', // 2 - part
  '#f472b6', // 3 - failure reason
];

function getColorByDepth(depth) {
  return LEVEL_COLORS[depth] || '#ddd';
}


export default function SunburstChart({ data, width = 400, height = 400 }) {
  const ref = useRef();

  useEffect(() => {
    if (!data) return;
    // Очищаем контейнер
    if (ref.current) ref.current.innerHTML = '';
    // Создаём sunburst
    const chart = Sunburst()
      .data(data)
      .width(width)
      .height(height)
      .color((d, parent) => getColorByDepth(parent ? parent.depth + 1 : 0))
      .tooltipContent((d, node) => {
        // Кастомный тултип
        let path = [];
        let n = node;
        while (n && n.parent) {
          path.unshift(n.data.name || n.data.id);
          n = n.parent;
        }
        if (n) path.unshift(n.data.name || n.data.id);
        return `<div style='font-weight:700;margin-bottom:4px;'>${path.join(' → ')}</div>` +
          (typeof node.data.value === 'number' ? `<div>Кол-во: <b>${node.data.value}</b></div>` : '') +
          (node.data.resolution_time !== undefined ? `<div>Время устранения: <b>${node.data.resolution_time} дн.</b></div>` : '');
      })
      .onHover((node) => {
        if (ref.current) ref.current.style.cursor = node ? 'pointer' : 'default';
      });
    chart(ref.current);
    return () => {
      if (ref.current) ref.current.innerHTML = '';
    };
  }, [data, width, height]);

  if (!data || !data.children || data.children.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8">
        <span style={{ fontSize: 48 }}>🛠️</span>
        <div className="mt-2 text-lg">Недостаточно данных для анализа отказов</div>
      </div>
    );
  }

  return <div ref={ref} style={{ width, height }} />;
} 