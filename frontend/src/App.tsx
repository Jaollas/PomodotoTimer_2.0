import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useTimer, Durations } from './hooks/useTimer';
import TimerDisplay from './components/TimerDisplay';
import TimerControls from './components/TimerControls';
import ModeSelector from './components/ModeSelector';
import SettingsPanel from './components/SettingsPanel';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LayoutDashboard, User } from 'lucide-react';
import './index.css';

const DEFAULT_DURATIONS: Durations = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
};

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Carregando...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const TimerPage: React.FC = () => {
  const { session } = useAuth();
  const {
    timeRemaining,
    mode,
    isRunning,
    isPaused,
    durations,
    start,
    pause,
    reset,
    setMode,
    updateDurations,
  } = useTimer(DEFAULT_DURATIONS);

  return (
    <div className={`app-container mode-${mode}`}>
      <nav className="main-nav">
        {session ? (
          <Link to="/dashboard" className="nav-link">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
        ) : (
          <Link to="/login" className="nav-link">
            <User size={20} />
            <span>Entrar</span>
          </Link>
        )}
      </nav>

      <header>
        <h1>Timer Pomodoro</h1>
      </header>

      <main>
        <div className="timer-card">
          <ModeSelector currentMode={mode} setMode={setMode} />
          <TimerDisplay timeRemaining={timeRemaining} mode={mode} />
          <TimerControls
            isRunning={isRunning}
            isPaused={isPaused}
            start={start}
            pause={pause}
            reset={reset}
          />
        </div>
        <SettingsPanel
          durations={durations}
          updateDurations={updateDurations}
        />
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<TimerPage />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
