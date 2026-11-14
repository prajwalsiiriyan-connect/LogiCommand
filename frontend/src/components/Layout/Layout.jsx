import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { io } from 'socket.io-client';
import Sidebar from './Sidebar';
import Navbar  from './Navbar';
import { useToast } from '../../context/ToastContext';

export default function Layout() {
  const [collapsed,   setCollapsed]   = useState(false);
  const [liveAlerts,  setLiveAlerts]  = useState(0);
  const toast = useToast();

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || '/', {
  path: '/socket.io',
  transports: ['websocket', 'polling'],
});
    socket.on('connect',         () => socket.emit('join_dashboard'));
    socket.on('shipment_update', (data) => {
      const msg = data.status === 'Delayed'
        ? `⚠️ ${data.shipmentId} delayed at ${data.currentLocation}`
        : `📦 ${data.shipmentId} → ${data.currentLocation}`;
      toast.info(msg, 5000);
      setLiveAlerts((n) => n + 1);
    });
    socket.on('live_alert', (data) => {
      if (data.type === 'warning') toast.warning(data.message, 5000);
    });
    socket.on('new_alert', () => setLiveAlerts((n) => n + 1));
    return () => socket.disconnect();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar liveAlerts={liveAlerts} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
