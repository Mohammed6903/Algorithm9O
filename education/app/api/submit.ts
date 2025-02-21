import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        // Process the request data (req.body) here
        const data = req.body;
        console.log('Received data:', data);

        // Perform any necessary actions with the data

        // Send a response back to the client
        res.status(200).json({ message: 'Success' });
    } else {
        res.status(405).end(); // Method Not Allowed
    }
}
