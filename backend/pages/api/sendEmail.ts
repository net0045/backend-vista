import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Nastav CORS hlavičky pro všechny typy requestů
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Pokud jde o preflight request (OPTIONS), ukonči ručně
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Only POST requests allowed' });
    return;
  }

  const { email, code } = req.body;

  if (!email || !code) {
    res.status(400).json({ message: 'Email and code are required' });
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const result = await transporter.sendMail({
      from: `"Vista Hotel" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Ověřovací kód',
      html: `<p>Váš kód je: <b>${code}</b></p>`,
    });

    console.log('Email odeslán:', result.accepted);
    res.status(200).json({ success: true });
  } catch (err) {
    const error = err as Error;
    console.error('Chyba při odesílání emailu:', error.message);
    res.status(500).json({ error: error.message });
  }
}
