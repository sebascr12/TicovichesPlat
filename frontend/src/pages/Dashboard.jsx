import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../lib/utils';
import { TrendingUp, Download, Lock, ChevronRight } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
    const { isAdmin } = useAuth();
    const [data, setData] = useState({
        summary: { total_amount: 0, transactions: 0 },
        by_payment_method: [],
        top_products: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/reports/daily');
            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcel = () => {
        window.location.href = `http://localhost:3000/api/reports/excel?t=${Date.now()}`;
    };

    const handleCierreCaja = async () => {
        const confirmar = window.confirm(
            "⚠️ ATENCIÓN: Esta acción exportará las ventas a Excel y REINICIARÁ TODAS LAS VENTAS DE HOY a cero.\n\n¿Estás completamente seguro de realizar el Cierre de Caja?"
        );

        if (!confirmar) return;

        const toastId = toast.loading('Realizando Cierre de Caja...');

        try {
            // 1. Forzar descarga del Excel de respaldo de forma programática y forzando a evadir Cache.
            window.location.href = `http://localhost:3000/api/reports/excel?t=${Date.now()}`;

            // Damos de 1.5s para asegurar que el navegador registre que bajamos el archivo.
            setTimeout(async () => {
                // 2. Hacer el Reset
                const resetRes = await fetch('http://localhost:3000/api/reports/reset', { method: 'POST' });

                if (!resetRes.ok) throw new Error("Error borrando datos");

                toast.success('¡Cierre Exitoso! Las ventas de hoy se han borrado del sistema.', { id: toastId });

                // 3. Volver a recargar la UI a 0.
                setData({
                    summary: { total_amount: 0, transactions: 0 },
                    by_payment_method: [],
                    top_products: []
                });
                fetchDashboardData();
            }, 1500);

        } catch (error) {
            console.error(error);
            toast.error('Hubo un error en el Cierre.', { id: toastId });
        }
    };

    if (loading) return <div className="p-8"><p className="dark:text-white">Cargando datos...</p></div>;

    const { summary, by_payment_method, top_products } = data;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-10">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Ventas de Hoy</h2>
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-full text-sm font-semibold border border-green-100 dark:border-green-500/20">
                    <TrendingUp size={16} />
                    +12.5%
                </div>
            </div>

            {/* Hero Card - Resumen */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 dark:border-slate-700 relative overflow-hidden transition-colors duration-300">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 dark:bg-orange-500/5 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 block" />

                <p className="text-gray-500 dark:text-gray-400 font-medium mb-2 relative z-10">Total recaudado</p>
                <h3 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-8 relative z-10">
                    {formatCurrency(summary.total_amount)}
                </h3>

                <div className="flex flex-wrap gap-8 relative z-10">
                    <div>
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Transacciones</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.transactions}</p>
                    </div>
                    <div className="w-px h-12 bg-gray-100 dark:bg-slate-700" />
                    <div>
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Ticket Promedio</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {formatCurrency(summary.total_amount / (summary.transactions || 1))}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Métodos de Pago */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white">Métodos de Pago</h4>
                        <button className="text-sm font-semibold text-orange-600 dark:text-orange-500 hover:text-orange-700 dark:hover:text-orange-400 flex items-center transition-colors">
                            Detalle <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {by_payment_method.map((method, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-between hover:shadow-md transition-all cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${method.payment_method === 'SINPE' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' :
                                        method.payment_method === 'Efectivo' ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' :
                                            'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400'
                                        }`}>
                                        <div className="w-5 h-5 bg-current rounded-sm opacity-80" />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-gray-900 dark:text-white">{method.payment_method}</h5>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{method.count} ventas</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-lg text-gray-900 dark:text-white">{formatCurrency(method.total_amount)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Productos Más Vendidos */}
                <div className="space-y-4">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white px-2">Productos más vendidos</h4>

                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 space-y-6 transition-colors duration-300">
                        {top_products.length === 0 && <p className="text-gray-500 dark:text-gray-400 text-sm">No hay productos vendidos hoy.</p>}
                        {top_products.map((product, idx) => {
                            const maxRevenue = Math.max(...top_products.map(p => parseFloat(p.total_revenue)));
                            const currentRevenue = parseFloat(product.total_revenue);
                            const percentage = (currentRevenue / maxRevenue) * 100;

                            return (
                                <div key={idx} className="flex gap-4 items-center">
                                    <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-slate-700 border border-orange-200 dark:border-slate-600 flex items-center justify-center text-orange-600 dark:text-orange-500 font-bold text-xl shadow-sm">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h5 className="font-bold text-gray-900 dark:text-white">{product.product_name}</h5>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{product.total_quantity} unidades</p>
                                            </div>
                                            <p className="font-bold text-orange-600 dark:text-orange-500">{formatCurrency(currentRevenue)}</p>
                                        </div>
                                        {/* Progress bar */}
                                        <div className="h-2 w-full bg-gray-50 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-orange-600 rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Botones de Acción Mágicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                {isAdmin && (
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-2 border-gray-100 dark:border-slate-600 font-bold py-4 px-6 rounded-2xl hover:border-gray-200 dark:hover:border-slate-500 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                    >
                        <Download size={20} />
                        Exportar a Excel
                    </button>
                )}
                <button
                    onClick={handleCierreCaja}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold py-4 px-6 rounded-2xl hover:shadow-[0_8px_20px_rgba(234,88,12,0.3)] transition-all hover:-translate-y-0.5 transform"
                >
                    <Lock size={20} />
                    Cierre de Caja
                </button>
            </div>

        </div>
    );
};

export default Dashboard;
