import './vertex-ai-proxy-interceptor.js';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Offline PWA Service Worker Registration
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Basic service worker inline registration to cache app shell
    const swCode = `
      const CACHE_NAME = 'ninja-sifir-v1';
      self.addEventListener('install', (e) => {
        self.skipWaiting();
      });
      self.addEventListener('activate', (e) => {
        e.waitUntil(clients.claim());
      });
      self.addEventListener('fetch', (e) => {
        e.respondWith(
          caches.match(e.request).then((res) => res || fetch(e.request).catch(() => caches.match('/')))
        );
      });
    `;
    const blob = new Blob([swCode], { type: 'application/javascript' });
    const swUrl = URL.createObjectURL(blob);
    navigator.serviceWorker.register(swUrl).catch(() => {
      // Offline fallback handling
    });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
