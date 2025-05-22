import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import "./src/env"

// https://astro.build/config
export default defineConfig({
    vite: {
        plugins: [tailwindcss()],
    },
});
