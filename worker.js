export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname === '/api/config') {
            return Response.json({ subscriptionKey: env.AZURE_MAPS_KEY });
        }

        return env.ASSETS.fetch(request);
    }
}
