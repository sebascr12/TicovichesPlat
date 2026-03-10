import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, UtensilsCrossed, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.message || 'Error al iniciar sesión');
                return;
            }

            // Guardar en contexto y redireccionar
            login(data.token, data.user);
            toast.success(`¡Bienvenido, ${data.user.username}!`);

            if (data.user.role === 'admin') {
                navigate('/dashboard');
            } else {
                navigate('/'); // POS
            }

        } catch (error) {
            console.error('Login error:', error);
            toast.error('Error de conexión con el servidor');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col justify-center items-center p-4 transition-colors">

            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 dark:border-slate-700 p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-orange-600 text-white p-3 rounded-2xl mb-4">
                        <UtensilsCrossed size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white text-center tracking-tight">Ticoviches POS</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1">Inicia sesión para continuar</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Usuario</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                            placeholder="Ej. admin o caja"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 px-4 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                    >
                        {isLoading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Lock size={18} />
                                Iniciar Sesión
                            </>
                        )}
                    </button>

                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 text-center">
                        <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                            <AlertCircle size={14} />
                            Usuarios por defecto: (admin/admin123 y caja/ventas123)
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
