import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../lib/utils';
import { TrendingUp, Download, Lock, ChevronRight, Plus, X, ArrowDownRight } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
    const { isAdmin } = useAuth();
    const [data, setData] = useState({
        summary: { total_amount: 0, transactions: 0 },
        by_payment_method: [],
        top_products: []
    });
    const [recentSales, setRecentSales] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);
    const [editPaymentMethod, setEditPaymentMethod] = useState('');
    const [newExpense, setNewExpense] = useState({ amount: '', description: '' });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [reportsRes, expensesRes, salesRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/reports/daily`),
                fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/expenses`),
                fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/sales/active`)
            ]);

            const reportsResult = await reportsRes.json();
            const expensesResult = await expensesRes.json();
            const salesResult = await salesRes.json();

            setData(reportsResult);
            setExpenses(expensesResult);
            setRecentSales(salesResult);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        const amount = parseFloat(newExpense.amount);
        if (isNaN(amount) || amount <= 0 || !newExpense.description.trim()) {
            return toast.error("El monto y descripción son inválidos.");
        }

        const toastId = toast.loading('Registrando gasto...');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, description: newExpense.description })
            });
            if (!res.ok) throw new Error("Error guardando el gasto");

            toast.success("Gasto registrado", { id: toastId });
            setNewExpense({ amount: '', description: '' });
            setIsExpenseModalOpen(false);
            fetchDashboardData(); // Refrescar info
        } catch (error) {
            console.error(error);
            toast.error("Hubo un error registrando el gasto.", { id: toastId });
        }
    };

    const handleExportExcel = () => {
        window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/reports/excel?t=${Date.now()}`;
    };

    const handleCierreCaja = async () => {
        const confirmar = window.confirm(
            "⚠️ ATENCIÓN: Esta acción exportará las ventas a Excel y REINICIARÁ TODAS LAS VENTAS DE HOY a cero.\n\n¿Estás completamente seguro de realizar el Cierre de Caja?"
        );

        if (!confirmar) return;

        const toastId = toast.loading('Realizando Cierre de Caja...');

        try {
            // 1. Forzar descarga del Excel de respaldo de forma programática y forzando a evadir Cache.
            window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/reports/excel?t=${Date.now()}`;

            // Damos de 1.5s para asegurar que el navegador registre que bajamos el archivo.
            setTimeout(async () => {
                // 2. Hacer el Reset
                const resetRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/reports/reset`, { method: 'POST' });

                if (!resetRes.ok) throw new Error("Error borrando datos");

                toast.success('¡Cierre Exitoso! Las ventas de hoy se han borrado del sistema.', { id: toastId });

                toast.success('¡Cierre Exitoso! Las ventas de hoy se han borrado del sistema.', { id: toastId });

                // 3. Volver a recargar la UI a 0.
                setData({
                    summary: { total_amount: 0, transactions: 0 },
                    by_payment_method: [],
                    top_products: []
                });
                setExpenses([]);
                fetchDashboardData();
            }, 1500);

        } catch (error) {
            console.error(error);
            toast.error('Hubo un error en el Cierre.', { id: toastId });
        }
    };

    const handleUpdatePaymentMethod = async (e) => {
        e.preventDefault();
        if (!selectedSale || !editPaymentMethod) return;

        const toastId = toast.loading('Actualizando venta...');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/sales/${selectedSale.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payment_method: editPaymentMethod })
            });

            if (!res.ok) throw new Error("Error actualizando la venta");

            toast.success("Venta actualizada", { id: toastId });
            setIsEditModalOpen(false);
            fetchDashboardData();
        } catch (error) {
            console.error(error);
            toast.error("Hubo un error actualizando la venta.", { id: toastId });
        }
    };

    const openEditModal = (sale) => {
        setSelectedSale(sale);
        setEditPaymentMethod(sale.payment_method);
        setIsEditModalOpen(true);
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

                <p className="text-gray-500 dark:text-gray-400 font-medium mb-2 relative z-10">Total recaudado (Bruto)</p>
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

                    {/* Gastos / Neto Efectivo */}
                    <div className="w-px h-12 bg-gray-100 dark:bg-slate-700" />
                    <div>
                        <p className="text-xs font-bold text-red-500 dark:text-red-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <ArrowDownRight size={14} /> Gastos Caja Chica
                        </p>
                        <div className="flex items-end gap-3">
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {formatCurrency(expenses.reduce((acc, curr) => acc + parseFloat(curr.amount), 0))}
                            </p>
                            <button onClick={() => setIsExpenseModalOpen(true)} className="mb-1 text-sm bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold px-2 py-0.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
                                + Añadir
                            </button>
                        </div>
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

            {/* Listado de Transacciones Recientes */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">Transacciones del Turno Activo</h4>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors duration-300">
                    <div className="overflow-x-auto text-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Hora</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Monto</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Método</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                {recentSales.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-400 dark:text-gray-500 italic">
                                            No hay ventas registradas aún en este turno.
                                        </td>
                                    </tr>
                                ) : (
                                    recentSales.map((sale) => (
                                        <tr key={sale.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-900/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-gray-600 dark:text-gray-400">
                                                    {new Date(sale.sale_date).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-gray-900 dark:text-white">
                                                    {formatCurrency(sale.total_amount)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${sale.payment_method === 'SINPE' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' :
                                                        sale.payment_method === 'Efectivo' ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' :
                                                            'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400'
                                                    }`}>
                                                    {sale.payment_method}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => openEditModal(sale)}
                                                    className="text-orange-600 dark:text-orange-400 font-bold text-xs bg-orange-50 dark:bg-orange-500/10 px-3 py-1.5 rounded-xl transition-all hover:bg-orange-100 dark:hover:bg-orange-500/20 opacity-0 group-hover:opacity-100 focus:opacity-100 lg:opacity-100"
                                                >
                                                    Editar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
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

            {/* Modal para Registrar Gastos */}
            {isExpenseModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsExpenseModalOpen(false)} />
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">Registrar Gasto</h3>
                            <button onClick={() => setIsExpenseModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-gray-50 dark:bg-slate-700 p-2 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddExpense} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Monto del gasto (₡)</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl px-4 py-3 font-bold text-xl outline-none focus:ring-2 focus:ring-orange-500 dark:bg-slate-900 border-transparent dark:text-white transition-all shadow-inner"
                                    value={newExpense.amount}
                                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                    placeholder="Ej. 1500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Descripción (¿En qué se gastó?)</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 dark:bg-slate-900 border-transparent dark:text-white transition-all"
                                    value={newExpense.description}
                                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                                    placeholder="Ej. Limones, Hielo, Galletas..."
                                />
                            </div>

                            <button type="submit" className="w-full bg-red-600 text-white font-bold py-4 rounded-full mt-4 hover:bg-red-700 hover:shadow-lg transition-all flex justify-center items-center gap-2">
                                <Plus size={20} /> Registrar Egreso Real
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para Editar Venta */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-sm relative z-10 shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">Editar Venta</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">#{selectedSale?.id} - {formatCurrency(selectedSale?.total_amount)}</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-gray-50 dark:bg-slate-700 p-2 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdatePaymentMethod} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Método de Pago</label>
                                <div className="grid grid-cols-1 gap-3">
                                    {['Efectivo', 'Tarjeta', 'SINPE'].map((method) => (
                                        <button
                                            key={method}
                                            type="button"
                                            onClick={() => setEditPaymentMethod(method)}
                                            className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all font-bold ${editPaymentMethod === method
                                                    ? 'border-orange-600 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                                                    : 'border-gray-100 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-slate-600'
                                                }`}
                                        >
                                            {method}
                                            {editPaymentMethod === method && (
                                                <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center text-white">
                                                    <ChevronRight size={14} />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-orange-600 text-white font-bold py-4 rounded-full mt-4 hover:bg-orange-700 hover:shadow-lg transition-all flex justify-center items-center gap-2">
                                Guardar Cambios
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
