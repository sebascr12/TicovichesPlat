import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useTheme } from '../lib/ThemeContext';
import { useAuth } from '../lib/AuthContext';
import { formatCurrency, cn } from '../lib/utils';
import {
    UtensilsCrossed,
    User,
    CreditCard,
    Banknote,
    Smartphone,
    Plus,
    Minus,
    CheckCircle2,
    Trash2,
    Moon,
    Sun,
    LogOut
} from 'lucide-react';

const PAYMENT_METHODS = [
    { id: 'Efectivo', icon: Banknote, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-600' },
    { id: 'Tarjeta', icon: CreditCard, color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200' },
    { id: 'SINPE', icon: Smartphone, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
];

const POS = () => {
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useTheme();
    const { logout, user } = useAuth();

    const [productsRaw, setProductsRaw] = useState([]);
    const [cart, setCart] = useState({});
    const [customAmount, setCustomAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Efectivo');
    const [cashGiven, setCashGiven] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const res = await fetch('http://localhost:3000/api/products');
                const data = await res.json();

                const getImageForProduct = (name) => {
                    const lowerName = name.toLowerCase();

                    // Tipos específicos
                    if (lowerName.includes('mixto')) return '/images/mixto.jpeg';
                    if (lowerName.includes('camarón') || lowerName.includes('camaron')) return '/images/camarones.jpeg';
                    if (lowerName.includes('caldosa') || lowerName.includes('picarita')) return '/images/caldosa.jpeg';

                    // Tamaños base (usados como predeterminados para Pescado o Sopa)
                    if (lowerName.includes('pequeño')) return '/images/pequeno.jpeg';
                    if (lowerName.includes('mediano')) return '/images/mediano.jpeg';
                    if (lowerName.includes('grande')) return '/images/grande.jpeg';

                    return '/images/pequeno.jpeg'; // default fallback
                };

                // Mapeamos temporalmente con la info requerida, e ignoramos los NO activos
                const mapP = data.filter(p => p.is_active && p.type !== 'custom').map(p => ({
                    id: p.id,
                    name: p.name,
                    price: parseFloat(p.price),
                    image: getImageForProduct(p.name)
                }));
                setProductsRaw(mapP);
            } catch (err) {
                toast.error('Error cargando menú');
            }
        };
        loadProducts();
    }, []);

    const updateQuantity = (id, delta) => {
        setCart(prev => {
            const current = prev[id] || 0;
            const next = Math.max(0, current + delta);
            if (next === 0) {
                const newCart = { ...prev };
                delete newCart[id];
                return newCart;
            }
            return { ...prev, [id]: next };
        });
    };

    const cartTotal = Object.entries(cart).reduce((total, [id, qty]) => {
        const product = productsRaw.find(p => p.id === parseInt(id));
        return total + (product ? product.price * qty : 0);
    }, 0);

    const customTotal = customAmount ? parseFloat(customAmount) : 0;
    const grandTotal = cartTotal + customTotal;

    const totalItems = Object.values(cart).reduce((a, b) => a + b, 0) + (customTotal > 0 ? 1 : 0);

    const clearCart = () => {
        setCart({});
        setCustomAmount('');
        setCashGiven('');
    };

    const handleConfirm = async () => {
        if (grandTotal === 0) return toast.error('Agrega productos a la venta');

        const items = [];
        Object.entries(cart).forEach(([id, qty]) => {
            const product = productsRaw.find(p => p.id === parseInt(id));
            if (product) {
                items.push({
                    product_id: product.id,
                    name: product.name,
                    quantity: qty,
                    price: product.price,
                    subtotal: product.price * qty
                });
            }
        });

        if (customTotal > 0) {
            items.push({
                product_id: null,
                name: 'Monto Custom / Extras',
                quantity: 1,
                price: customTotal,
                subtotal: customTotal
            });
        }

        const toastId = toast.loading('Registrando venta...');

        try {
            const response = await fetch('http://localhost:3000/api/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    total_amount: grandTotal,
                    payment_method: paymentMethod,
                    items: items
                })
            });

            if (!response.ok) throw new Error('Error al guardar la venta');

            toast.success(`Venta de ${formatCurrency(grandTotal)} registrada con éxito!`, { id: toastId });
            clearCart();
        } catch (error) {
            console.error(error);
            toast.error('Hubo un error registrando la venta.', { id: toastId });
        }
    };

    const renderProductCard = (product) => {
        const qty = cart[product.id] || 0;
        return (
            <div
                key={product.id}
                onClick={() => updateQuantity(product.id, 1)}
                className={cn(
                    "relative group rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all border-2",
                    qty > 0 ? "border-orange-500" : "border-transparent dark:border-slate-800"
                )}
            >
                <div className="aspect-[4/3] relative">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {product.popular && (
                        <span className="absolute top-3 right-3 bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                            POPULAR
                        </span>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-3 text-white">
                        <h3 className="font-extrabold text-base leading-tight drop-shadow-lg shadow-black mb-1.5">{product.name}</h3>
                        <div className="bg-orange-600/90 backdrop-blur-md rounded-lg px-2 py-1 inline-table self-start">
                            <span className="font-black text-white text-sm tracking-wide">{formatCurrency(product.price)}</span>
                        </div>
                    </div>
                </div>

                {qty > 0 && (
                    <div className="absolute top-3 left-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur rounded-full px-2 py-1 flex items-center gap-3 shadow-lg" onClick={e => e.stopPropagation()}>
                        <button onClick={() => updateQuantity(product.id, -1)} className="w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-slate-700 rounded-full transition-colors">
                            <Minus size={18} />
                        </button>
                        <span className="font-bold w-4 text-center text-gray-900 dark:text-white">{qty}</span>
                        <button onClick={() => updateQuantity(product.id, 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-slate-700 rounded-full transition-colors">
                            <Plus size={18} />
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex-1 flex flex-col h-full w-full animate-in fade-in duration-300">
            <main className="flex-1 flex flex-col lg:flex-row w-full mx-auto gap-6">

                {/* Lado Izquierdo: Productos y Opciones */}
                <div className="flex-1 space-y-6">

                    {/* PRODUCTOS PRINCIPALES / CATEGORÍAS */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                {selectedCategory ? `Viendo: ${selectedCategory}` : 'Categorías de Menú'}
                            </h2>
                            {selectedCategory && (
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className="text-orange-600 dark:text-orange-400 font-bold text-sm bg-orange-50 dark:bg-orange-500/10 px-3 py-1.5 rounded-xl transition-colors hover:bg-orange-100 dark:hover:bg-orange-500/20"
                                >
                                    ← Volver al inicio
                                </button>
                            )}
                        </div>

                        {/* RENDER LOGIC */}
                        {!selectedCategory ? (
                            // Vista Híbrida: Carpetas + Productos Sueltos
                            <div className="space-y-8">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {['Pescado', 'Camarón', 'Mixto'].map(cat => {
                                        let bgImage = '/images/pequeno.jpeg';
                                        if (cat === 'Camarón') bgImage = '/images/mediano.jpeg';
                                        if (cat === 'Mixto') bgImage = '/images/grande.jpeg';

                                        return (
                                            <div
                                                key={cat}
                                                onClick={() => setSelectedCategory(cat)}
                                                className="relative group rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all border-2 border-transparent hover:border-orange-500 min-h-[140px]"
                                            >
                                                <div className="absolute inset-0">
                                                    <img src={bgImage} alt={cat} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-300" />
                                                </div>
                                                <div className="relative h-full flex items-center justify-center p-4">
                                                    <h3 className="font-black text-2xl text-white tracking-wide drop-shadow-lg text-center">{cat}</h3>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Otros Platillos</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                        {productsRaw.filter(p => {
                                            const lowerName = p.name.toLowerCase();
                                            return !lowerName.includes('camarón') &&
                                                !lowerName.includes('camaron') &&
                                                !lowerName.includes('mixto') &&
                                                !lowerName.includes('ceviche');
                                        }).map(renderProductCard)}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Vista de Productos de la Categoría Seleccionada
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 animate-in fade-in zoom-in-95 duration-200">
                                {productsRaw.filter(p => {
                                    const lowerName = p.name.toLowerCase();
                                    let cat = 'Otros';
                                    if (lowerName.includes('camarón') || lowerName.includes('camaron')) cat = 'Camarón';
                                    else if (lowerName.includes('mixto')) cat = 'Mixto';
                                    else if (lowerName.includes('ceviche')) cat = 'Pescado';
                                    return cat === selectedCategory;
                                }).map(renderProductCard)}
                            </div>
                        )}
                    </section>

                    {/* EXTRAS Y PERSONALIZADOS */}
                    <section className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm relative overflow-hidden transition-colors duration-300">
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <div className="bg-orange-600 text-white rounded-full p-1 h-6 w-6 flex items-center justify-center">
                                <Plus size={14} strokeWidth={3} />
                            </div>
                            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Extras & Personalizados</h2>
                        </div>
                        <p className="text-gray-900 dark:text-white font-medium text-sm mb-3">Monto Custom (Picaritas, Galletas, etc.)</p>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-bold text-lg">₡</span>
                            <input
                                type="number"
                                value={customAmount}
                                onChange={(e) => setCustomAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl py-4 pl-10 pr-4 text-xl font-bold text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                            />
                        </div>
                    </section>

                    {/* METODO DE PAGO */}
                    <section>
                        <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Método de Pago</h2>
                        <div className="grid grid-cols-3 gap-3">
                            {PAYMENT_METHODS.map((method) => {
                                const Icon = method.icon;
                                const isSelected = paymentMethod === method.id;

                                return (
                                    <button
                                        key={method.id}
                                        onClick={() => setPaymentMethod(method.id)}
                                        className={cn(
                                            "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all",
                                            isSelected ? `${method.border} bg-white dark:bg-slate-800 shadow-sm ring-1 ring-${method.border.split('-')[1]}-100 dark:ring-${method.border.split('-')[1]}-900` : "border-transparent bg-white dark:bg-slate-800 dark:border-slate-700 shadow-sm hover:border-gray-200 dark:hover:border-slate-600"
                                        )}
                                    >
                                        <Icon className={cn(isSelected ? method.color : "text-gray-400 dark:text-gray-500")} size={28} />
                                        <span className={cn(
                                            "font-bold text-sm",
                                            isSelected ? method.color : "text-gray-500 dark:text-gray-400"
                                        )}>{method.id}</span>
                                    </button>
                                )
                            })}
                        </div>

                        {/* Calculadora de Vuelto Rápida */}
                        {paymentMethod === 'Efectivo' && grandTotal > 0 && (
                            <div className="mt-4 p-4 rounded-2xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 animate-in fade-in slide-in-from-top-2">
                                <label className="text-sm font-bold text-orange-800 dark:text-orange-400 mb-2 block">¿Con cuánto pagó el cliente?</label>
                                <div className="flex gap-3 items-center">
                                    <span className="text-orange-600 dark:text-orange-500 font-bold text-lg">₡</span>
                                    <input
                                        type="number"
                                        value={cashGiven}
                                        onChange={(e) => setCashGiven(e.target.value)}
                                        placeholder="Ingrese monto exacto..."
                                        className="flex-1 bg-white dark:bg-slate-800 border-none rounded-xl py-2 px-3 text-lg font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 placeholder:text-gray-300 dark:placeholder:text-gray-600"
                                    />
                                    {cashGiven && parseFloat(cashGiven) >= grandTotal && (
                                        <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-green-200 dark:border-green-900/50">
                                            <span className="text-xs text-green-600 dark:text-green-500 font-bold block">Su vuelto:</span>
                                            <span className="text-lg text-green-700 dark:text-green-400 font-black">{formatCurrency(parseFloat(cashGiven) - grandTotal)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </section>
                </div>

                {/* Lado Derecho: Resumen y Cobro (Ticket / Receipt Area) */}
                <div className="w-full lg:w-96">
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 dark:border-slate-700 sticky top-24 transition-colors duration-300">
                        {/* Digital Ticket */}
                        <div className="border border-dashed border-gray-200 dark:border-slate-600 rounded-2xl p-4 mb-6 bg-gray-50/50 dark:bg-slate-900/50 min-h-[200px] flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-xs">Tiquete de Venta</h3>
                                {totalItems > 0 && (
                                    <button
                                        onClick={clearCart}
                                        className="flex items-center gap-1 text-red-500 hover:text-red-700 dark:text-red-400 font-bold text-xs bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 px-2 py-1 rounded-md transition-colors"
                                    >
                                        <Trash2 size={14} /> Vaciar
                                    </button>
                                )}
                            </div>

                            {grandTotal === 0 ? (
                                <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm italic">
                                    Añade productos para empezar
                                </div>
                            ) : (
                                <div className="flex-1 space-y-3">
                                    {Object.entries(cart).map(([id, qty]) => {
                                        const product = productsRaw.find(p => p.id === parseInt(id));
                                        if (!product) return null;
                                        return (
                                            <div key={id} className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900 dark:text-white">{qty}x</span>
                                                    <span className="text-gray-600 dark:text-gray-300">{product.name}</span>
                                                </div>
                                                <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(product.price * qty)}</span>
                                            </div>
                                        )
                                    })}

                                    {customTotal > 0 && (
                                        <div className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-900 dark:text-white">1x</span>
                                                <span className="text-gray-600 dark:text-gray-300">Extras</span>
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(customTotal)}</span>
                                        </div>
                                    )}

                                    <div className="pt-3 mt-3 border-t border-dashed border-gray-200 dark:border-slate-600 flex justify-between items-center">
                                        <span className="text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-wider">Pago vía {paymentMethod}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Total a Pagar</p>
                            <h2 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight">{formatCurrency(grandTotal)}</h2>
                        </div>

                        <button
                            onClick={handleConfirm}
                            disabled={grandTotal === 0}
                            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-200 dark:disabled:bg-slate-700 disabled:text-gray-400 dark:disabled:text-slate-500 text-white font-bold text-lg py-5 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 transform hover:-translate-y-0.5"
                        >
                            <CheckCircle2 size={24} />
                            Confirmar Venta
                        </button>

                        <div className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-gray-400 dark:text-gray-500">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Sistema Listo
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default POS;
