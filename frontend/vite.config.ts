import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, splitVendorChunkPlugin } from "vite";
import injectHTML from "vite-plugin-html-inject";
import tsConfigPaths from "vite-tsconfig-paths";

const buildVariables = () => {
	const defines: Record<string, string> = {
		__APP_ID__: JSON.stringify("bertie-foundation"),
		__API_PATH__: JSON.stringify(process.env.API_PATH || "/api"),
		__API_HOST__: JSON.stringify(process.env.API_HOST || ""),
		__API_PREFIX_PATH__: JSON.stringify(""),
		__API_URL__: JSON.stringify(process.env.API_URL || "http://localhost:8000"),
		__WS_API_URL__: JSON.stringify(process.env.WS_API_URL || "ws://localhost:8000"),
		__APP_BASE_PATH__: JSON.stringify("/"),
		__APP_TITLE__: JSON.stringify("Bertie Foundation"),
		__APP_FAVICON_LIGHT__: JSON.stringify("/favicon-light.svg"),
		__APP_FAVICON_DARK__: JSON.stringify("/favicon-dark.svg"),
		__APP_DEPLOY_USERNAME__: JSON.stringify(""),
		__APP_DEPLOY_APPNAME__: JSON.stringify(""),
		__APP_DEPLOY_CUSTOM_DOMAIN__: JSON.stringify(""),
		__STACK_AUTH_CONFIG__: JSON.stringify(undefined),
		__FIREBASE_CONFIG__: JSON.stringify(undefined),
	};

	return defines;
};

// https://vite.dev/config/
export default defineConfig({
	define: buildVariables(),
	plugins: [react(), splitVendorChunkPlugin(), tsConfigPaths(), injectHTML()],
	server: {
		proxy: {
			"/api": {
				target: "http://127.0.0.1:8000",
				changeOrigin: true,
			},
		},
	},
	resolve: {
		alias: {
			resolve: {
				alias: {
					"@": path.resolve(__dirname, "./src"),
				},
			},
		},
	},
});
