import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Bell, User, Sun, Moon } from 'lucide-react';
import { useTheme } from '../lib/ThemeContext';

const AdminLayout = () => {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <div className="flex min-h-screen bg-[#F8F9FA] dark:bg-slate-900 transition-colors duration-300">
            <Sidebar />
            <main className="flex-1 ml-64 flex flex-col">
                {/* Header Superior Administrativo */}
                <header className="h-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 flex items-center justify-end px-8 gap-4 sticky top-0 z-10 transition-colors duration-300">
                    <button
                        onClick={toggleTheme}
                        className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-100 transition-colors shadow-sm"
                        aria-label="Toggle theme"
                    >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-100 transition-colors shadow-sm">
                        <Bell size={20} />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-100 transition-colors shadow-sm">
                        <User size={20} />
                    </button>
                </header>

                {/* Contenido Dinámico */}
                <div className="p-8 flex-1">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
