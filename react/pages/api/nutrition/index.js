// Same-origin proxy to the Flask nutrition service.
//
// Bug fix: the frontend used to call the Flask backend's absolute URL
// (https://fit-track-backend.onrender.com) directly from the browser. That
// hardcoded a single deployment, broke local/dev/docker-compose setups, and
// depended on the backend's CORS config staying open. Routing through this
// Next.js API route means the browser only ever talks to its own origin,
// and the actual backend URL is just a server-side env var.
const FLASK_API_URL = process.env.FLASK_API_URL;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

    const { name } = req.body || {};
    if (!name || !name.trim()) {
        return res.status(200).json({ foods: { food: [] } });
    }

    try {
        const response = await fetch(`${FLASK_API_URL}/nutrition/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        });

        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (error) {
        console.error('Error proxying nutrition request:', error);
        return res.status(502).json({ error: 'Unable to reach nutrition service' });
    }
}
