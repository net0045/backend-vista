import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import NextCors from 'nextjs-cors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ✅ Správný CORS support přes knihovnu
  await NextCors(req, res, {
    // 👇 nastavuj jen doménu, kterou potřebuješ (dočasně *)
    origin: '*',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    optionsSuccessStatus: 200,
  });

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const { email, code } = req.body;
  console.log('Přišel požadavek na odeslání emailu:', email, code);

  if (!email || !code) {
    return res.status(400).json({ message: 'Email and code are required' });
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
