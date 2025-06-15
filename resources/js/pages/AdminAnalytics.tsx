import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Eye, CreditCard } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layouts';

const AdminAnalytics = () => {
  const [stats, setStats] = useState<any | null>(null);
  const [filter, setFilter] = useState('all'); // default = all time


  useEffect(() => {
    axios.get('/analytics/data', { params: { filter } })
      .then((res) => setStats(res.data))
      .catch((err) => console.error('Failed to load analytics:', err));
  }, [filter]);

  if (!stats) {
    return <div className="p-6 text-muted-foreground">Carregando análises...</div>;
  }

  const totalCards = stats.total_cards;
  const activeCards = stats.active_cards;
  const totalClicks = stats.total_clicks;
  const avgClicksPerCard = stats.avg_clicks;
  const totalActivations = stats.total_activations;
  const chartData = stats.clicks_by_name;
  const activationsData = stats.activations_by_card;
  const statusData = stats.status_counts ? [
    { name: 'Ativado', value: stats.status_counts.activated || 0, color: '#10b981' },
    { name: 'Pendente', value: stats.status_counts.pending || 0, color: '#f59e0b' }
  ] : [];

  const StatCard = ({ title, value, icon: Icon, gradient }: any) => (
    <Card className="material-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${gradient} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Painel de Análise
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitore o desempenho dos seus cartões digitais
          </p>
          <div className="mt-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm dark:bg-gray-900 dark:border-gray-700"
            >
              <option value="all">📊 Todos os tempos</option>
              <option value="today">📆 Hoje</option>
              <option value="7days">🗓️ Últimos 7 dias</option>
              <option value="month">📅 Este mês</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Cartões Totais"
            value={totalCards}
            icon={CreditCard}
            gradient="from-blue-500 to-cyan-500"
          />
          <StatCard
            title="Cartões Ativos"
            value={activeCards}
            icon={Users}
            gradient="from-green-500 to-emerald-500"
          />
          <StatCard
            title="Cliques Totais"
            value={totalClicks}
            icon={Eye}
            gradient="from-purple-500 to-pink-500"
          />
          <StatCard
            title="Média de Cliques/Cartão"
            value={avgClicksPerCard}
            icon={TrendingUp}
            gradient="from-orange-500 to-red-500"
          />
          <StatCard
            title="Total de Ativações"
            value={totalActivations}
            icon={Eye}
            gradient="from-indigo-500 to-violet-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="material-card p-6">
            <h3 className="text-lg font-semibold mb-4">Desempenho de Cliques</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="clicks" fill="url(#gradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="material-card p-6">
            <h3 className="text-lg font-semibold mb-4">Distribuição de Status dos Cartões</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="material-card p-6">
          <h3 className="text-lg font-semibold mb-4">Ativações por Cartão</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activationsData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="activations" fill="#34d399" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
