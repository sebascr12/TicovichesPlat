import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../lib/utils';
import { Calendar, Receipt } from 'lucide-react';

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/reports/history');
                const data = await response.json();
                setHistory(data);
            } catch (error) {
                console.error("Error cargando historial", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return <div className="p-8"><p className="dark:text-white">Cargando historial...</p></div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-10">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">Historial de Turnos Cerrados</h2>

            {history.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-100 dark:border-slate-700 text-center">
                    <p className="text-gray-500 dark:text-gray-400">Aún no hay turnos cerrados registrados.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {history.map((day, idx) => {
                        const dateObj = new Date(day.date);
                        // Añadimos la compensación de timezone de UTC en caso de ser necesario
                        const localDate = new Date(dateObj.getTime() + dateObj.getTimezoneOffset() * 60000);

                        return (
                            <div key={idx} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-slate-700">
                                <div className="flex items-center gap-3 mb-4 text-orange-600 dark:text-orange-500 font-bold">
                                    <div className="p-2 bg-orange-50 dark:bg-orange-500/10 rounded-xl">
                                        <Calendar size={24} />
                                    </div>
                                    <h3 className="text-xl">{localDate.toLocaleDateString('es-CR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Total del Día</p>
                                        <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{formatCurrency(day.total_amount)}</p>
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-medium">
                                        <Receipt size={16} />
                                        <p>{day.transactions} transacciones totales</p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

export default History;
