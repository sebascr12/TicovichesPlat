import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { formatCurrency, cn } from '../lib/utils';
import { Package, Plus, Save, X, Edit2, AlertTriangle, EyeOff, Eye, History } from 'lucide-react';
import toast from 'react-hot-toast';

const Inventory = () => {
    const { token } = useAuth();
    const [products, setProducts] = useState([]);
    const [salesHistory, setSalesHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' o 'history'

    // Estado para edición en línea
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    // Estado para nuevo producto
    const [isAdding, setIsAdding] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', type: 'principal', stock: '' });

    useEffect(() => {
        fetchProducts();
        fetchSalesHistory();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/products');
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            console.error("Error fetching products:", error);
            toast.error("Error al cargar inventario");
        }
    };

    const fetchSalesHistory = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/inventory/sales', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSalesHistory(data);
            }
        } catch (error) {
            console.error("Error fetching sales history:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- ACCIONES ADMIN ---

    const handleSaveEdit = async (id) => {
        try {
            toast.loading("Guardando...", { id: 'save' });
            const res = await fetch(`http://localhost:3000/api/inventory/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editForm)
            });

            if (res.ok) {
                toast.success("Producto modificado", { id: 'save' });
                setEditingId(null);
                fetchProducts();
            } else {
                toast.error("Error al modificar", { id: 'save' });
            }
        } catch (e) {
            toast.error("Fallo de conexión", { id: 'save' });
        }
    };

    const handleToggleActive = async (id, currentState) => {
        try {
            toast.loading("Actualizando estado...", { id: 'status' });
            const res = await fetch(`http://localhost:3000/api/inventory/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ is_active: !currentState })
            });
            if (res.ok) {
                toast.success(currentState ? "Producto Desactivado" : "Producto Activado", { id: 'status' });
                fetchProducts();
            } else {
                toast.error("Error al actualizar", { id: 'status' });
            }
        } catch (e) {
            toast.error("Fallo de conexión", { id: 'status' });
        }
    };

    const handleAddNew = async (e) => {
        e.preventDefault();
        try {
            toast.loading("Agregando...", { id: 'add' });
            const res = await fetch(`http://localhost:3000/api/inventory/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newProduct.name,
                    price: parseFloat(newProduct.price),
                    type: newProduct.type,
                    stock: parseInt(newProduct.stock) || 0
                })
            });

            if (res.ok) {
                toast.success("Producto Agregado", { id: 'add' });
                setIsAdding(false);
                setNewProduct({ name: '', price: '', type: 'principal', stock: '' });
                fetchProducts();
            } else {
                toast.error("Error al agregar", { id: 'add' });
            }
        } catch (e) {
            toast.error("Fallo de conexión", { id: 'add' });
        }
    };


    if (loading) return <div className="p-8 text-gray-500 dark:text-gray-400">Cargando datos...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Panel de Gestión</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Administra tu menú, precios e historial aquí.</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-1 flex rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'inventory' ? 'bg-orange-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
                    >
                        <Package size={18} />
                        Productos
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-orange-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
                    >
                        <History size={18} />
                        Historial de Ventas
                    </button>
                </div>
            </div>

            {/* TAB: INVENTARIO */}
            {activeTab === 'inventory' && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden transition-colors duration-300">
                    <div className="p-6 border-b border-gray-100 dark:border-slate-700/50 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                            Catálogo Activo
                        </h3>
                        <button
                            onClick={() => setIsAdding(!isAdding)}
                            className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-transform transform active:scale-95 shadow-sm"
                        >
                            {isAdding ? <X size={16} /> : <Plus size={16} />}
                            {isAdding ? 'Cancelar' : 'Nuevo Producto'}
                        </button>
                    </div>

                    {isAdding && (
                        <div className="p-6 bg-orange-50/50 dark:bg-orange-500/5 border-b border-orange-100 dark:border-orange-500/10">
                            <form onSubmit={handleAddNew} className="flex flex-wrap md:flex-nowrap gap-4 items-end">
                                <div className="w-full md:w-1/3">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre</label>
                                    <input required type="text" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm dark:text-white" placeholder="Ej. Ceviche Mixto..." />
                                </div>
                                <div className="w-full md:w-1/4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Precio (₡)</label>
                                    <input required type="number" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm dark:text-white" placeholder="3500" />
                                </div>
                                <div className="w-full md:w-1/4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Stock (Opcional)</label>
                                    <input type="number" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm dark:text-white" placeholder="100" />
                                </div>

                                <button type="submit" className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg text-sm font-bold h-[38px] shadow-sm">
                                    Guardar
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-slate-900/50 text-gray-500 dark:text-gray-400 font-bold uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4">Producto</th>
                                    <th className="px-6 py-4">Precio Act.</th>
                                    <th className="px-6 py-4">Inventario</th>
                                    <th className="px-6 py-4">Estado Visibilidad</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                {products.map(product => {
                                    const isEditing = editingId === product.id;
                                    const isCustom = product.type === 'custom'; // Evitar editar The Special Custom

                                    return (
                                        <tr key={product.id} className={`hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors ${!product.is_active ? 'opacity-50' : ''}`}>
                                            <td className="px-6 py-4">
                                                {isEditing ? (
                                                    <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded px-2 py-1 text-sm dark:text-white" />
                                                ) : (
                                                    <span className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                        {product.name}
                                                        {isCustom && <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 px-2 py-0.5 rounded-full">SISTEMA</span>}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {isEditing ? (
                                                    <input type="number" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} className="w-24 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded px-2 py-1 text-sm dark:text-white" />
                                                ) : (
                                                    <span className="font-bold text-orange-600 dark:text-orange-400">{formatCurrency(product.price)}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-600 dark:text-gray-300">
                                                {isEditing ? (
                                                    <input type="number" value={editForm.stock} onChange={e => setEditForm({ ...editForm, stock: e.target.value })} className="w-20 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded px-2 py-1 text-sm dark:text-white" />
                                                ) : (
                                                    product.stock > 0 ? product.stock : 'Ilimitado'
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {product.is_active ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Activo
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400 border border-gray-200 dark:border-slate-600">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Inactivo (Oculto)
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                                {!isCustom && (
                                                    <>
                                                        {isEditing ? (
                                                            <>
                                                                <button onClick={() => setEditingId(null)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" title="Cancelar"><X size={16} /></button>
                                                                <button onClick={() => handleSaveEdit(product.id)} className="p-2 text-green-600 bg-green-50 dark:bg-green-500/10 hover:bg-green-100 dark:hover:bg-green-500/20 rounded-lg transition-colors" title="Guardar"><Save size={16} /></button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingId(product.id);
                                                                        setEditForm({ name: product.name, price: product.price, stock: product.stock });
                                                                    }}
                                                                    className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10 dark:hover:text-orange-400 rounded-lg transition-colors" title="Editar Precio o Nombre"
                                                                >
                                                                    <Edit2 size={16} />
                                                                </button>

                                                                <button
                                                                    onClick={() => handleToggleActive(product.id, product.is_active)}
                                                                    className={`p-2 rounded-lg transition-colors ${product.is_active ? 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10' : 'text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10'}`}
                                                                    title={product.is_active ? "Ocultar del POS temporalmente" : "Volver a mostrar en POS"}
                                                                >
                                                                    {product.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                                                                </button>
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                                {isCustom && <span className="text-xs text-gray-400 pr-2">No editable</span>}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB: HISTORIAL DE VENTAS */}
            {activeTab === 'history' && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden transition-colors duration-300">
                    <div className="p-6 border-b border-gray-100 dark:border-slate-700/50 bg-gray-50/50 dark:bg-slate-800/50">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                            Últimas Transacciones Registradas
                        </h3>
                    </div>

                    {salesHistory.length === 0 ? (
                        <div className="p-10 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
                            <AlertTriangle className="mb-2 opacity-50" size={32} />
                            Aún no hay ventas registradas el día de hoy.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-slate-700/50">
                            {salesHistory.map(sale => (
                                <div key={sale.id} className="p-5 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-black text-gray-900 dark:text-white text-lg">{formatCurrency(sale.total_amount)}</span>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${sale.payment_method === 'SINPE' ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' :
                                                sale.payment_method === 'Efectivo' ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' :
                                                    'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20'
                                                }`}>
                                                {sale.payment_method}
                                            </span>
                                            <span className="text-xs text-gray-400 dark:text-gray-500">#{sale.id} • {new Date(sale.sale_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {sale.items.map((item, idx) => (
                                                <div key={idx} className="bg-gray-100 dark:bg-slate-700/50 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded font-medium border border-transparent dark:border-slate-600">
                                                    {item.quantity}x {item.product_name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="text-right flex-shrink-0">
                                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            {new Date(sale.sale_date).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Inventory;
