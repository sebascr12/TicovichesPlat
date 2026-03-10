import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Settings, UtensilsCrossed, LogOut } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

const Sidebar = () => {
    const { isAdmin, user, logout } = useAuth();

    return (
        <aside className="w-64 bg-white dark:bg-slate-800 border-r border-gray-100 dark:border-slate-700 flex flex-col h-screen fixed left-0 top-0 transition-colors duration-300 z-50">
            <div className="p-6 flex items-center gap-3 border-b border-gray-50 dark:border-slate-700/50">
                <div className="bg-orange-600 text-white p-2 rounded-xl">
                    <UtensilsCrossed size={24} />
                </div>
                <div>
                    <h1 className="font-bold text-xl text-gray-900 dark:text-white leading-tight">Ticoviches</h1>
                    <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                        {isAdmin ? 'Admin Dashboard' : 'Panel Vendedor'}
                    </p>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <NavItem to="/dashboard" icon={<LayoutDashboard size={20} />} label="Resumen" />
                <NavItem to="/" icon={<ShoppingCart size={20} />} label="Ventas (POS)" />

                {isAdmin && (
                    <>
                        <NavItem to="/inventory" icon={<Package size={20} />} label="Inventario" />
                        <NavItem to="/settings" icon={<Settings size={20} />} label="Ajustes" />
                    </>
                )}
            </nav>

            <div className="p-6 border-t border-gray-50 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold uppercase">
                            {user?.username?.substring(0, 2) || 'US'}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{user?.username}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
                        </div>
                    </div>
                    <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors" title="Cerrar sesión">
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
};

const NavItem = ({ to, icon, label }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${isActive
                    ? "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-white"
                }`
            }
        >
            {icon}
            {label}
        </NavLink>
    );
};

export default Sidebar;
