import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';
import { Leaf, FlaskConical, Percent, Package } from 'lucide-react';
import { ConsumptionSession } from '@/types/consumption';
// import { AnalyticsService } from '@/lib/analytics'; // Commented out as currently unused

interface StrainAnalyticsProps {
  sessions: ConsumptionSession[];
}

const COLORS = ['#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#f0fdf4'];

const StrainAnalytics: React.FC<StrainAnalyticsProps> = ({ sessions }) => {
  // Top strains (by number of sessions)
  const topStrains = useMemo(() => {
    const counts: Record<string, number> = {};
    sessions.forEach(s => {
      const strain = s.strain_name.trim() || 'Unknown';
      counts[strain] = (counts[strain] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([strain, count]) => ({ strain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [sessions]);

  const varietyScore = useMemo(() => {
    if (sessions.length === 0) return 0;
    const unique = new Set(sessions.map(s => s.strain_name.trim())).size;
    return Math.round((unique / sessions.length) * 100);
  }, [sessions]);

  // Repeat usage (loyalty) – percentage of sessions where the strain is same as previous session
  const strainLoyalty = useMemo(() => {
    if (sessions.length < 2) return 0;
    const sorted = [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let repeat = 0;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].strain_name === sorted[i - 1].strain_name) repeat++;
    }
    return Math.round((repeat / (sorted.length - 1)) * 100);
  }, [sessions]);

  // THC preferences – simple average
  const avgTHC = useMemo(() => {
    const withTHC = sessions.filter(s => typeof s.thc_percentage === 'number');
    if (withTHC.length === 0) return 0;
    const total = withTHC.reduce((sum, s) => sum + (s.thc_percentage || 0), 0);
    return Math.round((total / withTHC.length) * 10) / 10;
  }, [sessions]);

  // Product modifiers stats
  const modifierStats = useMemo(() => {
    const tobacco = sessions.filter(s => s.tobacco).length;
    const kief = sessions.filter(s => s.kief).length;
    const concentrate = sessions.filter(s => s.concentrate).length;
    const mixed = sessions.filter(s => s.tobacco || s.kief || s.concentrate).length;
    const pure = sessions.length - mixed;
    return { tobacco, kief, concentrate, pure, mixed };
  }, [sessions]);

  const categoryCounts = useMemo(() => {
    const counts = { indica: 0, sativa: 0, hybrid: 0, unknown: 0 };
    sessions.forEach(s => {
      const name = s.strain_name.toLowerCase();
      if (name.includes('indica')) counts.indica++; else if (name.includes('sativa')) counts.sativa++; else if (name.includes('hybrid')) counts.hybrid++; else counts.unknown++;
    });
    const total = counts.indica + counts.sativa + counts.hybrid + counts.unknown;
    return { ...counts, total };
  }, [sessions]);

  const ratio = {
    indica: Math.round((categoryCounts.indica / categoryCounts.total) * 100),
    sativa: Math.round((categoryCounts.sativa / categoryCounts.total) * 100),
    hybrid: Math.round((categoryCounts.hybrid / categoryCounts.total) * 100)
  };

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
        No data available. Log sessions to see strain analytics.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
          <Leaf className="h-6 w-6 text-green-600" />
          <div>
            <p className="text-sm text-gray-600">Unique Strains</p>
            <p className="text-xl font-bold text-gray-900">{new Set(sessions.map(s => s.strain_name)).size}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
          <Percent className="h-6 w-6 text-blue-600" />
          <div>
            <p className="text-sm text-gray-600">Variety Score</p>
            <p className="text-xl font-bold text-gray-900">{varietyScore}%</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
          <FlaskConical className="h-6 w-6 text-purple-600" />
          <div>
            <p className="text-sm text-gray-600">Avg THC Preference</p>
            <p className="text-xl font-bold text-gray-900">{avgTHC}%</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
          <Package className="h-6 w-6 text-orange-600" />
          <div>
            <p className="text-sm text-gray-600">Strain Loyalty</p>
            <p className="text-xl font-bold text-gray-900">{strainLoyalty}%</p>
          </div>
        </div>
      </div>

      {/* Top Strains Bar Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Consumed Strains (Top 10)</h3>
        <div className="h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topStrains} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
              <YAxis dataKey="strain" type="category" width={100} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => [`${value} sessions`, 'Sessions']} />
              <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Product Modifier Pie Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Modifier Usage</h3>
        <div className="h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: 'Pure', value: modifierStats.pure },
                  { name: 'Tobacco', value: modifierStats.tobacco },
                  { name: 'Kief', value: modifierStats.kief },
                  { name: 'Concentrate', value: modifierStats.concentrate }
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {[modifierStats.pure, modifierStats.tobacco, modifierStats.kief, modifierStats.concentrate].map((_, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Indica/Sativa/Hybrid Ratio */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Indica/Sativa/Hybrid Ratio</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Indica</p>
            <p className="text-2xl font-bold text-green-700">{ratio.indica}%</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Sativa</p>
            <p className="text-2xl font-bold text-yellow-700">{ratio.sativa}%</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Hybrid</p>
            <p className="text-2xl font-bold text-purple-700">{ratio.hybrid}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrainAnalytics;
