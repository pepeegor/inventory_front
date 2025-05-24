import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchDeviceLifecycle, fetchReliabilityMap, fetchMaintenanceEfficiency, fetchFailureAnalysis } from '../../api/stats';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Line, Legend } from 'recharts';
import SunburstChart from './SunburstChart';
import Loader from '../../components/ui/Loader';
import AnimatedSection from '../../components/AnimatedSection';
import { motion as Motion } from 'framer-motion';
import { FaCrown, FaFire, FaRobot, FaMagic } from 'react-icons/fa';

export default function AnalyticsAdminPage() {
  const [months] = useState(12);

  // 1. Жизненный цикл устройств по типам
  const { data: lifecycle, isLoading: loadingLifecycle } = useQuery({
    queryKey: ['deviceLifecycle', months],
    queryFn: () => fetchDeviceLifecycle(months),
  });

  // 2. Карта надежности оборудования
  const { data: reliability, isLoading: loadingReliability } = useQuery({
    queryKey: ['reliabilityMap'],
    queryFn: fetchReliabilityMap,
  });

  // 3. Эффективность обслуживания
  const { data: efficiency, isLoading: loadingEfficiency } = useQuery({
    queryKey: ['maintenanceEfficiency', months],
    queryFn: () => fetchMaintenanceEfficiency(months),
  });

  // 4. Анализ отказов компонентов
  const { data: failureAnalysis, isLoading: loadingFailures } = useQuery({
    queryKey: ['failureAnalysis'],
    queryFn: fetchFailureAnalysis,
  });

  // Преобразование данных для Sunburst
  function buildSunburstTree(nodes) {
    const map = {};
    nodes.forEach(node => {
      map[node.id] = { ...node, children: [] };
    });
    let root = null;
    nodes.forEach(node => {
      if (!node.parent) {
        root = map[node.id];
      } else if (map[node.parent]) {
        map[node.parent].children.push(map[node.id]);
      }
    });
    return root;
  }

  // Для HeatMap: преобразуем reliability в двумерный массив
  const heatMapData = reliability ? reliability.map(r => ({
    manufacturer: r.manufacturer,
    model: r.model,
    score: r.reliability_score,
    failures: r.failures,
    avg_repair_days: r.avg_repair_days,
  })) : [];

  // Для AreaChart: группируем по типу и дате
  let allKeys = [];
  const areaChartData = (() => {
    if (!lifecycle) return [];
    allKeys = Array.from(new Set(lifecycle.map(item => `${item.device_type} (${item.status})`)));
    const allDates = Array.from(new Set(lifecycle.map(item => item.date))).sort();
    return allDates.map(date => {
      const row = { date };
      allKeys.forEach(key => { row[key] = 0; });
      lifecycle.filter(item => item.date === date).forEach(item => {
        const key = `${item.device_type} (${item.status})`;
        row[key] = item.total;
      });
      return row;
    });
  })();

  // Для Bar+Line Chart: группируем по дате
  const barLineData = efficiency || [];

  // Sunburst data
  const sunburstData = failureAnalysis?.nodes ? buildSunburstTree(failureAnalysis.nodes) : null;

  // Прикольчик: анимированная корона для админов
  const crown = <Motion.span initial={{ y: -10 }} animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="inline-block text-amber-400 text-2xl ml-2"><FaCrown /></Motion.span>;

  return (
    <AnimatedSection className="relative p-6 rounded-2xl text-gray-100 animate-fadeIn overflow-hidden" style={{ background: 'linear-gradient(135deg, #181825 60%, #312e81 100%)' }}>
      {/* Фоновый градиент и светящиеся круги */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-radial from-violet-600/30 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-radial from-amber-400/20 to-transparent rounded-full blur-2xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-1/2 h-1/2 bg-gradient-to-br from-pink-500/10 to-transparent rounded-full blur-2xl opacity-60" style={{ transform: 'translate(-50%, -50%)' }} />
      </div>
      <div className="relative z-10">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-2 drop-shadow-glow">
          <span className="bg-gradient-to-r from-violet-400 via-amber-400 to-pink-400 bg-clip-text text-transparent">Расширенная аналитика</span>
          {crown}
        </h2>
        <p className="text-gray-400 mb-8">Визуализация ключевых метрик по оборудованию, отказам и обслуживанию</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 1. Жизненный цикл устройств по типам */}
          <div className="bg-gradient-to-br from-violet-900/30 to-violet-800/20 border border-violet-500/20 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2"><FaRobot className="text-violet-400" /> Жизненный цикл устройств</h3>
            <p className="text-gray-400 mb-2">Динамика по типам и статусам</p>
            {loadingLifecycle ? <Loader /> : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={areaChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#a78bfa"/>
                  <YAxis stroke="#a78bfa"/>
                  <CartesianGrid strokeDasharray="3 3" stroke="#a78bfa22"/>
                  <Tooltip/>
                  {allKeys.map(key => (
                    <Area key={key} type="monotone" dataKey={key} stackId="1" stroke="#a78bfa" fill="url(#colorA)" />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* 2. Карта надежности оборудования */}
          <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 border border-emerald-500/20 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2"><FaFire className="text-emerald-400" /> Карта надежности</h3>
            <p className="text-gray-400 mb-2">Тепловая карта по производителям и моделям</p>
            {loadingReliability ? <Loader /> : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-gray-200">
                  <thead>
                    <tr>
                      <th className="px-2 py-1">Производитель</th>
                      <th className="px-2 py-1">Модель</th>
                      <th className="px-2 py-1">Надежность</th>
                      <th className="px-2 py-1">Отказов</th>
                      <th className="px-2 py-1">Средн. ремонт (дн.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {heatMapData.map((row, i) => (
                      <tr key={i} className="hover:bg-emerald-900/30 transition-colors">
                        <td className="px-2 py-1">{row.manufacturer}</td>
                        <td className="px-2 py-1">{row.model}</td>
                        <td className="px-2 py-1">
                          <span className={`inline-block w-16 h-3 rounded-full mr-2 align-middle`} style={{ background: `linear-gradient(90deg, #34d399 ${(row.score || 0)}%, #374151 ${(100 - (row.score || 0))}%)` }}></span>
                          <span className="font-bold">{row.score}</span>
                        </td>
                        <td className="px-2 py-1">{row.failures}</td>
                        <td className="px-2 py-1">{row.avg_repair_days}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {/* 3. Эффективность обслуживания */}
          <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/20 border border-amber-500/20 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2"><FaMagic className="text-amber-400" /> Эффективность обслуживания</h3>
            <p className="text-gray-400 mb-2">Плановые/внеплановые задачи, время простоя</p>
            {loadingEfficiency ? <Loader /> : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barLineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fbbf2422"/>
                  <XAxis dataKey="date" stroke="#fbbf24"/>
                  <YAxis stroke="#fbbf24"/>
                  <Tooltip/>
                  <Legend />
                  <Bar dataKey="total_tasks" fill="#fbbf24" name="Всего задач" />
                  <Line type="monotone" dataKey="avg_completion_days" stroke="#6366f1" name="Среднее время выполнения (дн.)" />
                  <Line type="monotone" dataKey="on_time_percentage" stroke="#10b981" name="% вовремя" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* 4. Анализ отказов компонентов */}
          <div className="bg-gradient-to-br from-pink-900/30 to-pink-800/20 border border-pink-500/20 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2"><FaFire className="text-pink-400" /> Анализ отказов компонентов</h3>
            <p className="text-gray-400 mb-2">Иерархия: устройство → компонент → причина</p>
            {loadingFailures ? <Loader /> : (
              sunburstData ? (
                <div className="flex justify-center items-center h-64">
                  <SunburstChart data={sunburstData} width={260} height={260} />
                </div>
              ) : <p className="text-gray-400">Нет данных</p>
            )}
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
} 