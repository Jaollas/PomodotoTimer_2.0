import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { UserPlus, Mail, Lock, Loader2, Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
            setTimeout(() => navigate('/login'), 3000);
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
                        <UserPlus className="auth-icon" />
                    </div>
                    <h1>Criar nova conta</h1>
                    <p>Junte-se a nós e comece a produzir mais</p>
                </div>

                {success ? (
                    <div className="auth-success">
                        <p>Conta criada com sucesso! Verifique seu email para confirmar o cadastro.</p>
                        <p>Redirecionando para login...</p>
                    </div>
                ) : (
                    <form onSubmit={handleRegister} className="auth-form">
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
                                    placeholder="Mínimo 6 caracteres"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        {error && <div className="auth-error">{error}</div>}

                        <button type="submit" className="auth-button" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" /> : 'Cadastrar'}
                        </button>
                    </form>
                )}

                <div className="auth-footer">
                    <p>
                        Já tem uma conta? <Link to="/login">Entrar</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
