import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { LayoutDashboard, Clock, Flame, Calendar, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ name: string; minutes: number }[]>([]);
  const [streak, setStreak] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/analytics/${user.id}`);

        setStreak(response.data.current_daily_streak);

        if (response.data.daily_stats) {
          setData(response.data.daily_stats);
        } else {
          setData([
            { name: 'Seg', minutes: Math.floor(Math.random() * 60) },
            { name: 'Ter', minutes: Math.floor(Math.random() * 60) },
            { name: 'Qua', minutes: Math.floor(Math.random() * 60) },
            { name: 'Qui', minutes: Math.floor(Math.random() * 60) },
            { name: 'Sex', minutes: Math.floor(Math.random() * 60) },
            { name: 'Sab', minutes: Math.floor(Math.random() * 60) },
            { name: 'Dom', minutes: Math.floor(Math.random() * 60) },
          ]);
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        setError('Não foi possível carregar os dados. Verifique se o servidor backend está rodando.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="logo-icon">P</div>
          <h2>Pomodoro 2.0</h2>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>
          <button className="nav-item">
            <Clock size={20} />
            <span>Sessões</span>
          </button>
          <button className="nav-item">
            <Calendar size={20} />
            <span>Histórico</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.email?.[0].toUpperCase()}</div>
            <div className="user-details">
              <span className="user-email">{user?.email?.split('@')[0]}</span>
            </div>
          </div>
          <button onClick={signOut} className="logout-btn">
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <main className="dashboard-content">
        <header className="content-header">
          <h1>Olá, {user?.email?.split('@')[0]}</h1>
          <p>Veja seu progresso de hoje</p>
        </header>

        {loading ? (
          <div className="loading-state">
            <Loader2 className="animate-spin" size={48} />
            <p>Carregando analytics...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">Tentar Novamente</button>
          </div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon streak">
                  <Flame size={24} />
                </div>
                <div className="stat-info">
                  <h3>Sequência (Streak)</h3>
                  <p className="stat-value">{streak} dias</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon focus">
                  <Clock size={24} />
                </div>
                <div className="stat-info">
                  <h3>Foco Total (Semana)</h3>
                  <p className="stat-value">{data.reduce((acc, curr) => acc + curr.minutes, 0)} min</p>
                </div>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <h3>Minutos de Foco (Bar Chart)</h3>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                        {data.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === new Date().getDay() - 1 ? '#ef4444' : '#fca5a5'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <style>{`
        .dashboard-container {
          display: flex;
          min-height: 100vh;
          background: #f8fafc;
        }

        .dashboard-sidebar {
          width: 260px;
          background: white;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          padding: 2rem 1.5rem;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2.5rem;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          background: #ef4444;
          color: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }

        .sidebar-header h2 {
          font-size: 1.25rem;
          font-family: 'Outfit', sans-serif;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          border: none;
          background: transparent;
          color: #64748b;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .nav-item:hover {
          background: #f1f5f9;
          color: #1e293b;
        }

        .nav-item.active {
          background: #fef2f2;
          color: #ef4444;
        }

        .sidebar-footer {
          margin-top: auto;
          padding-top: 1.5rem;
          border-top: 1px solid #e2e8f0;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          background: #e2e8f0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #475569;
        }

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .user-email {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1e293b;
        }

        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          background: white;
          color: #64748b;
          cursor: pointer;
          font-weight: 500;
        }

        .logout-btn:hover {
          background: #fff1f2;
          color: #ef4444;
          border-color: #fecaca;
        }

        .dashboard-content {
          flex: 1;
          padding: 3rem;
          overflow-y: auto;
        }

        .content-header {
          margin-bottom: 2.5rem;
        }

        .content-header h1 {
          font-size: 2rem;
          font-family: 'Outfit', sans-serif;
          margin-bottom: 0.5rem;
        }

        .content-header p {
          color: #64748b;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 1.25rem;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon.focus {
          background: #fef2f2;
          color: #ef4444;
        }

        .stat-icon.streak {
          background: #fff7ed;
          color: #f59e0b;
        }

        .stat-info h3 {
          font-size: 0.875rem;
          color: #64748b;
          font-weight: 500;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        .chart-card {
          background: white;
          padding: 2rem;
          border-radius: 1.25rem;
          border: 1px solid #e2e8f0;
        }

        .chart-card h3 {
          font-size: 1.125rem;
          margin-bottom: 2rem;
          color: #1e293b;
          font-family: 'Outfit', sans-serif;
        }

        .loading-state, .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 50vh;
          gap: 1rem;
          color: #64748b;
        }

        .retry-btn {
          padding: 0.5rem 1rem;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
