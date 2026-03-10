import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import { Bell, User, Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from '../lib/ThemeContext';
import { useAuth } from '../lib/AuthContext';

const AdminLayout = () => {
    const { isDarkMode, toggleTheme } = useTheme();
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen bg-[#F8F9FA] dark:bg-slate-900 transition-colors duration-300 pb-20 md:pb-0">
            <Sidebar />
            <BottomNav />
            <main className="flex-1 md:ml-64 flex flex-col w-full">
                {/* Header Superior Administrativo */}
                <header className="h-16 md:h-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 flex items-center justify-between md:justify-end px-4 md:px-8 gap-4 sticky top-0 z-10 transition-colors duration-300">
                    <div className="md:hidden flex items-center gap-2">
                        <span className="font-bold text-gray-900 dark:text-white leading-tight">Ticoviches</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-500 hidden md:inline-block">Hola, {user?.username}</span>

                        <button
                            onClick={toggleTheme}
                            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-100 transition-colors shadow-sm"
                            aria-label="Toggle theme"
                        >
                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <button className="md:hidden w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-100 transition-colors shadow-sm"
                            title="Cerrar Sesión" onClick={logout}>
                            <LogOut size={18} />
                        </button>
                    </div>
                </header>

                {/* Contenido Dinámico */}
                <div className="p-4 md:p-8 flex-1">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
