import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, cn } from '../lib/utils';
import {
    UtensilsCrossed,
    User,
    CreditCard,
    Banknote,
    Smartphone,
    Plus,
    Minus,
    CheckCircle2
} from 'lucide-react';

// Productos base según requerimiento
const PRODUCTS = [
    { id: 1, name: 'Caldosa', price: 1500, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop' },
    { id: 2, name: 'Pequeño', price: 2500, image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&h=400&fit=crop' },
    { id: 3, name: 'Mediano', price: 4000, image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=400&fit=crop' },
    { id: 4, name: 'Grande', price: 7000, image: 'https://images.unsplash.com/photo-1548869206-93b036288d7e?w=400&h=400&fit=crop', popular: true },
];

const PAYMENT_METHODS = [
    { id: 'Efectivo', icon: Banknote, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-600' },
    { id: 'Tarjeta', icon: CreditCard, color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200' },
    { id: 'SINPE', icon: Smartphone, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
];

const POS = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState({});
    const [customAmount, setCustomAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Efectivo');

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
        const product = PRODUCTS.find(p => p.id === parseInt(id));
        return total + (product ? product.price * qty : 0);
    }, 0);

    const customTotal = customAmount ? parseFloat(customAmount) : 0;
    const grandTotal = cartTotal + customTotal;

    const totalItems = Object.values(cart).reduce((a, b) => a + b, 0) + (customTotal > 0 ? 1 : 0);

    const handleConfirm = async () => {
        if (grandTotal === 0) return alert('Agrega productos a la venta');

        const items = [];
        Object.entries(cart).forEach(([id, qty]) => {
            const product = PRODUCTS.find(p => p.id === parseInt(id));
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

            alert(`✅ Venta por ${formatCurrency(grandTotal)} en ${paymentMethod} registrada conexito!`);
            setCart({});
            setCustomAmount('');
        } catch (error) {
            console.error(error);
            alert('❌ Hubo un error registrando la venta. Revisa la consola o conexión.');
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
            {/* Navbar Superior del POS */}
            <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <UtensilsCrossed className="text-orange-600" size={24} />
                    <h1 className="font-black text-xl text-gray-900 tracking-tight">Ticoviches</h1>
                </div>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors"
                >
                    <User size={20} />
                </button>
            </header>

            <main className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-4 gap-6">

                {/* Lado Izquierdo: Productos y Opciones */}
                <div className="flex-1 space-y-8">

                    {/* PRODUCTOS PRINCIPALES */}
                    <section>
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Productos Principales</h2>
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
                            {PRODUCTS.map(product => {
                                const qty = cart[product.id] || 0;
                                return (
                                    <div
                                        key={product.id}
                                        onClick={() => updateQuantity(product.id, 1)}
                                        className={cn(
                                            "relative group rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all border-2",
                                            qty > 0 ? "border-orange-500" : "border-transparent"
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

                                            <div className="absolute bottom-4 left-4 right-4 text-white">
                                                <h3 className="font-bold text-xl mb-1">{product.name}</h3>
                                                <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1 inline-block">
                                                    <span className="font-bold text-white text-sm">{formatCurrency(product.price)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Selector de cantidad superpuesto */}
                                        {qty > 0 && (
                                            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur rounded-full px-2 py-1 flex items-center gap-3 shadow-lg" onClick={e => e.stopPropagation()}>
                                                <button onClick={() => updateQuantity(product.id, -1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors">
                                                    <Minus size={18} />
                                                </button>
                                                <span className="font-bold w-4 text-center text-gray-900">{qty}</span>
                                                <button onClick={() => updateQuantity(product.id, 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors">
                                                    <Plus size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </section>

                    {/* EXTRAS Y PERSONALIZADOS */}
                    <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <div className="bg-orange-600 text-white rounded-full p-1 h-6 w-6 flex items-center justify-center">
                                <Plus size={14} strokeWidth={3} />
                            </div>
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Extras & Personalizados</h2>
                        </div>
                        <p className="text-gray-900 font-medium text-sm mb-3">Monto Custom (Picaritas, Galletas, etc.)</p>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">₡</span>
                            <input
                                type="number"
                                value={customAmount}
                                onChange={(e) => setCustomAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-10 pr-4 text-xl font-bold text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                            />
                        </div>
                    </section>

                    {/* METODO DE PAGO */}
                    <section>
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Método de Pago</h2>
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
                                            isSelected ? `${method.border} bg-white shadow-sm ring-1 ring-${method.border.split('-')[1]}-100` : "border-transparent bg-white shadow-sm hover:border-gray-200"
                                        )}
                                    >
                                        <Icon className={cn(isSelected ? method.color : "text-gray-400")} size={28} />
                                        <span className={cn(
                                            "font-bold text-sm",
                                            isSelected ? method.color : "text-gray-500"
                                        )}>{method.id}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </section>

                </div>

                {/* Lado Derecho: Resumen y Cobro (Ticket / Receipt Area) */}
                <div className="w-full lg:w-96">
                    <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 sticky top-24">
                        <div className="mb-8">
                            <p className="text-gray-500 font-medium mb-1">Total a Pagar</p>
                            <h2 className="text-5xl font-black text-gray-900 tracking-tight">{formatCurrency(grandTotal)}</h2>
                        </div>

                        <button
                            onClick={handleConfirm}
                            disabled={grandTotal === 0}
                            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-lg py-5 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 transform hover:-translate-y-0.5"
                        >
                            <CheckCircle2 size={24} />
                            Confirmar Venta
                        </button>

                        <div className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-gray-400">
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
