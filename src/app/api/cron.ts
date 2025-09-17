import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = req.query.secret;
  
  if (secret !== process.env.TELEGRAM_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Chama sua rota do Telegram
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-telegram?secret=${secret}`, {
      method: 'POST'
    });
    
    const data = await response.json();
    res.status(200).json(data);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// Configuração para Vercel Cron
export const config = {
  runtime: 'edge',
};