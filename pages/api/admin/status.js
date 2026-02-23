import sql from '../../../lib/db';

export default async function handler(req, res) {
    // GET: Fetch the current custom minting status
    if (req.method === 'GET') {
        try {
            const result = await sql`
        SELECT value FROM settings WHERE key = 'minting_status'
      `;
            const status = result[0]?.value || 'Coming Soon';
            return res.status(200).json({ status });
        } catch (error) {
            console.error('Database error fetching minting status:', error);
            return res.status(500).json({ error: 'Failed to fetch minting status' });
        }
    }

    // PUT: Update the custom minting status
    if (req.method === 'PUT') {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        try {
            await sql`
        INSERT INTO settings (key, value) 
        VALUES ('minting_status', ${status})
        ON CONFLICT (key) DO UPDATE SET value = ${status}
      `;
            return res.status(200).json({ success: true, message: 'Minting status updated successfully' });
        } catch (error) {
            console.error('Database error updating minting status:', error);
            return res.status(500).json({ error: 'Failed to update minting status' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
