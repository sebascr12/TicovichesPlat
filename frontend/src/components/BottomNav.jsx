import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Settings, Clock } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

const BottomNav = () => {
    const { isAdmin } = useAuth();

    return (
        <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 md:hidden flex justify-around items-center px-2 py-3 pb-safe z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] transition-colors duration-300">
            <NavItem to="/dashboard" icon={<LayoutDashboard size={22} />} label="Resumen" />
            <NavItem to="/" icon={<ShoppingCart size={22} />} label="POS" />

            {isAdmin && (
                <>
                    <NavItem to="/inventory" icon={<Package size={22} />} label="Menú" />
                    <NavItem to="/history" icon={<Clock size={22} />} label="Ventas" />
                    {/* Excluimos Ajustes del Bottom Nav por espacio, o lo incluimos si cabe bien. Dejemos 5 elementos máximo para iOS guidelines. */}
                    <NavItem to="/settings" icon={<Settings size={22} />} label="Ajustes" />
                </>
            )}
        </nav>
    );
};

const NavItem = ({ to, icon, label }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full gap-1 transition-colors ${isActive
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                }`
            }
        >
            {icon}
            <span className="text-[10px] font-bold tracking-tight">{label}</span>
        </NavLink>
    );
};

export default BottomNav;
