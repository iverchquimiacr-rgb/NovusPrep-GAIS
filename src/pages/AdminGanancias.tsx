import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { ArrowLeft, Moon, Sun, DollarSign, TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface Payment {
  id: string;
  amount: number;
  date: string;
  status: string;
}

export const AdminGanancias: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const q = query(collection(db, 'payments'), orderBy('date', 'asc'));
        const querySnapshot = await getDocs(q);
        const paymentsData: Payment[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.status === 'Aprobado' || data.status === 'Confirmado') {
            paymentsData.push({
              id: doc.id,
              amount: Number(data.amount) || 0,
              date: data.date,
              status: data.status
            });
          }
        });
        setPayments(paymentsData);
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Calculate total earnings
  const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);

  // Group by day for the chart
  const dailyData = payments.reduce((acc: any, payment) => {
    const date = new Date(payment.date);
    const day = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    
    if (!acc[day]) {
      acc[day] = { name: day, total: 0 };
    }
    acc[day].total += payment.amount;
    return acc;
  }, {});

  const chartData = Object.values(dailyData);

  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={() => navigate('/admin')}
          className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Volver"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-brand-gold)] rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Cambiar tema"
        >
          {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
        </button>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 text-[var(--color-brand-emerald)] rounded-xl">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-main)]">Ganancias</h1>
            <p className="text-[var(--color-text-muted)]">Resumen histórico de ingresos</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-brand-cyan)]"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Total Earnings Card */}
            <div className="card-base p-8 rounded-2xl shadow-sm border border-[var(--color-border)] flex items-center gap-6">
              <div className="p-4 bg-green-100 dark:bg-green-900/30 text-[var(--color-brand-emerald)] rounded-2xl">
                <DollarSign className="w-10 h-10" />
              </div>
              <div>
                <p className="text-lg text-[var(--color-text-muted)] font-medium">Ganancia Total Acumulada</p>
                <h2 className="text-4xl font-bold text-[var(--color-text-main)]">S/. {totalEarnings.toFixed(2)}</h2>
              </div>
            </div>

            {/* Chart */}
            <div className="card-base p-6 rounded-2xl shadow-sm border border-[var(--color-border)]">
              <h3 className="text-xl font-semibold text-[var(--color-text-main)] mb-6">Evolución de Ingresos</h3>
              
              {chartData.length > 0 ? (
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-brand-emerald)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--color-brand-emerald)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="var(--color-text-muted)" 
                        tick={{ fill: 'var(--color-text-muted)' }}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis 
                        stroke="var(--color-text-muted)" 
                        tick={{ fill: 'var(--color-text-muted)' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `S/.${value}`}
                        dx={-10}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--color-bg-card)', 
                          borderColor: 'var(--color-border)',
                          borderRadius: '0.75rem',
                          color: 'var(--color-text-main)'
                        }}
                        itemStyle={{ color: 'var(--color-brand-emerald)', fontWeight: 'bold' }}
                        formatter={(value: number) => [`S/. ${value.toFixed(2)}`, 'Ingresos']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="total" 
                        stroke="var(--color-brand-emerald)" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorTotal)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <TrendingUp className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-[var(--color-text-muted)]">No hay datos de ganancias disponibles aún.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
