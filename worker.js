export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname === '/config.js') {
            return new Response(
                `window.AZURE_MAPS_KEY = "${env.AZURE_MAPS_KEY}";`,
                { headers: { 'Content-Type': 'application/javascript' } }
            );
        }

        return env.ASSETS.fetch(request);
    }
}
