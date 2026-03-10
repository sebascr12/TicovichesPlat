import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Bell, User } from 'lucide-react';

const AdminLayout = () => {
    return (
        <div className="flex min-h-screen bg-[#F8F9FA]">
            <Sidebar />
            <main className="flex-1 ml-64 flex flex-col">
                {/* Header Superior Administrativo */}
                <header className="h-20 bg-white/50 backdrop-blur-md border-b border-gray-100 flex items-center justify-end px-8 gap-4 sticky top-0 z-10">
                    <button className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-orange-600 hover:border-orange-100 transition-colors shadow-sm">
                        <Bell size={20} />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-700 hover:text-orange-600 hover:border-orange-100 transition-colors shadow-sm">
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
