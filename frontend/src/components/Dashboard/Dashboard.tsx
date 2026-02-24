import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { LayoutDashboard, Clock, Flame, Calendar, LogOut, Loader2, Timer, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { NavLink } from 'react-router-dom';
import axios from 'axios';

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
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

        setStreak(response.data.current_streak);

        const chartData = [
          { name: 'Dom', fullName: 'Domingo', minutes: response.data.sunday_focus_minutes },
          { name: 'Seg', fullName: 'Segunda-Feira', minutes: response.data.monday_focus_minutes },
          { name: 'Ter', fullName: 'Terça-Feira', minutes: response.data.tuesday_focus_minutes },
          { name: 'Qua', fullName: 'Quarta-Feira', minutes: response.data.wednesday_focus_minutes },
          { name: 'Qui', fullName: 'Quinta-Feira', minutes: response.data.thursday_focus_minutes },
          { name: 'Sex', fullName: 'Sexta-Feira', minutes: response.data.friday_focus_minutes },
          { name: 'Sáb', fullName: 'Sábado', minutes: response.data.saturday_focus_minutes },
        ];

        setData(chartData);
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
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/" className="nav-item">
            <Timer size={20} />
            <span>Timer</span>
          </NavLink>
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
          <button onClick={toggleTheme} className="theme-toggle-btn">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            <span>{theme === 'light' ? 'Tema Escuro' : 'Tema Claro'}</span>
          </button>
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
                  <Flame size={29} />
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
                <h3>Minutos de Foco na Semana</h3>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                      <Tooltip
                        cursor={{ fill: 'var(--bg-tertiary)' }}
                        labelFormatter={(value, payload) => {
                          if (payload && payload.length > 0) {
                            return payload[0].payload.fullName;
                          }
                          return value;
                        }}
                        formatter={(value) => [`${value} min`, 'Minutos de Foco']}
                        contentStyle={{
                          borderRadius: '12px',
                          border: 'none',
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-primary)'
                        }}
                        itemStyle={{ color: 'var(--text-primary)' }}
                      />
                      <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                        {data.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === new Date().getDay() ? 'var(--focus-color)' : 'var(--sidebar-active-text)'} />
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
          height: 100vh;
          background: var(--bg-primary);
          color: var(--text-primary);
          overflow: hidden;
        }

        .dashboard-sidebar {
          width: 260px;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          background: var(--focus-color);
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
          color: var(--text-primary);
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
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
          color: var(--text-secondary);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }

        .nav-item:hover {
          background: var(--sidebar-hover);
          color: var(--text-primary);
        }

        .nav-item.active {
          background: var(--sidebar-active-bg);
          color: var(--sidebar-active-text);
        }

        .sidebar-footer {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-color);
        }

        .theme-toggle-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem 1rem;
          border-radius: 0.75rem;
          border: 1px solid var(--border-color);
          background: var(--bg-tertiary);
          color: var(--text-primary);
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .theme-toggle-btn:hover {
          background: var(--border-color);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          background: var(--bg-tertiary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: var(--text-primary);
        }

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .user-email {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem;
          border-radius: 0.5rem;
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          color: var(--text-secondary);
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
          padding: 2rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .content-header {
          margin-bottom: 1.5rem;
        }

        .content-header h1 {
          font-size: 1.75rem;
          font-family: 'Outfit', sans-serif;
          margin-bottom: 0.25rem;
          color: var(--text-primary);
        }

        .content-header p {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .stat-card {
          background: var(--bg-secondary);
          padding: 1.25rem;
          border-radius: 1.25rem;
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon.focus {
          background: var(--sidebar-active-bg);
          color: var(--sidebar-active-text);
        }

        .stat-icon.streak {
          background: #fff7ed;
          color: #f59e0b;
        }

        .stat-info h3 {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 500;
          margin: 0;
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          flex: 1;
        }

        .chart-card {
          background: var(--bg-secondary);
          padding: 1.5rem;
          border-radius: 1.25rem;
          border: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .chart-card h3 {
          font-size: 1rem;
          margin-bottom: 1rem;
          color: var(--text-primary);
          font-family: 'Outfit', sans-serif;
        }

        .chart-wrapper {
          flex: 1;
          min-height: 250px;
        }

        .loading-state, .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 1rem;
          color: var(--text-secondary);
        }

        .retry-btn {
          padding: 0.5rem 1rem;
          background: var(--focus-color);
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
