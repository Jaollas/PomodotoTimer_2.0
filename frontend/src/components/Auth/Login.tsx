import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { LogIn, Mail, Lock, Loader2, Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            navigate('/');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <Link to="/" className="home-link">
                    <Home size={20} />
                    <span>Início</span>
                </Link>
                <div className="auth-header">
                    <div className="auth-icon-wrapper">
                        <LogIn className="auth-icon" />
                    </div>
                    <h1>Bem-vindo de volta</h1>
                    <p>Entre na sua conta para focar melhor</p>
                </div>

                <form onSubmit={handleLogin} className="auth-form">
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" />
                            <input
                                id="email"
                                type="email"
                                placeholder="exemplo@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Senha</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" />
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : 'Entrar'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Não tem uma conta? <Link to="/register">Cadastre-se</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
