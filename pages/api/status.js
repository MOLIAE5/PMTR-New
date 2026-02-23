import sql from '../../lib/db';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const result = await sql`
        SELECT value FROM settings WHERE key = 'minting_status'
      `;
            // Default to "Coming Soon" if not set
            const status = result[0]?.value || 'Coming Soon';
            return res.status(200).json({ status });
        } catch (error) {
            console.error('Database error fetching minting status from public endpoint:', error);
            return res.status(500).json({ error: 'Failed to fetch minting status' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
