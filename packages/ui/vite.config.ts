import { defineConfig } from 'vite'

export default defineConfig({
	build: {
		lib: {
			entry: 'src/index.ts',
			formats: ['es'],
			fileName: () => 'connect-ui.js'
		},
		rollupOptions: {
			external: ['@swaptox/connect-core']
		}
	}
})
