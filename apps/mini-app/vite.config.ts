import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        allowedHosts: [
            'subpharyngeal-scrutinizingly-dierdre.ngrok-free.dev',
        ],
        host: true, // Listen on all addresses (needed for docker/network access)
        port: 5173,
    },
});
