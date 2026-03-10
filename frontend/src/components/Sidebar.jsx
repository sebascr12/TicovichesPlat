import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Settings, UtensilsCrossed } from 'lucide-react';

const Sidebar = () => {
    return (
        <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen fixed left-0 top-0">
            <div className="p-6 flex items-center gap-3 border-b border-gray-50">
                <div className="bg-orange-600 text-white p-2 rounded-xl">
                    <UtensilsCrossed size={24} />
                </div>
                <div>
                    <h1 className="font-bold text-xl text-gray-900 leading-tight">Ticoviches</h1>
                    <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Admin Dashboard</p>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <NavItem to="/dashboard" icon={<LayoutDashboard size={20} />} label="Resumen" />
                <NavItem to="/" icon={<ShoppingCart size={20} />} label="Ventas" />
                <NavItem to="/inventory" icon={<Package size={20} />} label="Inventario" />
                <NavItem to="/settings" icon={<Settings size={20} />} label="Ajustes" />
            </nav>

            <div className="p-6 border-t border-gray-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
                        AD
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900">Administrador</p>
                        <p className="text-xs text-gray-500">admin@ticoviches.com</p>
                    </div>
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
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`
            }
        >
            {icon}
            {label}
        </NavLink>
    );
};

export default Sidebar;
