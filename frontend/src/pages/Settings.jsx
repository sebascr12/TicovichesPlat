import React from 'react';
import { Settings as SettingsIcon, ShieldAlert } from 'lucide-react';

const Settings = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                    <SettingsIcon size={28} className="text-orange-600" />
                    Ajustes del Sistema
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Configuraciones generales de la plataforma y credenciales.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden p-8 transition-colors duration-300">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-slate-700">
                    <div className="bg-orange-50 dark:bg-orange-500/10 p-2 rounded-lg text-orange-600 dark:text-orange-500">
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Seguridad y Credenciales</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Próximamente podrás cambiar la contraseña del usuario Cajero desde este panel.</p>
                    </div>
                </div>

                <div className="space-y-5 max-w-md">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nueva Contraseña para Vendedor</label>
                        <input type="password" disabled className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none opacity-50 cursor-not-allowed" placeholder="En desarrollo..." />
                    </div>
                    <button disabled className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 px-6 rounded-xl transition-colors opacity-50 cursor-not-allowed shadow-sm w-full sm:w-auto">
                        Actualizar Contraseña
                    </button>
                    <p className="text-xs text-orange-600/80 dark:text-orange-400/80 font-medium">Esta función será desbloqueada en la próxima actualización (v1.1).</p>
                </div>
            </div>
        </div>
    );
};

export default Settings;
