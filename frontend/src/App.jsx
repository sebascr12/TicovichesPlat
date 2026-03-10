import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta del POS independiente, sin el Sidebar para máxima usabilidad */}
        <Route path="/" element={<POS />} />

        {/* Rutas administrativas */}
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<div className="p-8"><h1 className="text-2xl font-bold">Inventario</h1><p className="text-gray-500 mt-2">Próximamente...</p></div>} />
          <Route path="/settings" element={<div className="p-8"><h1 className="text-2xl font-bold">Ajustes</h1><p className="text-gray-500 mt-2">Próximamente...</p></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
