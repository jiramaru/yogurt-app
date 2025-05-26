import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();
    
    if (!process.env.EMAIL_SERVER_HOST || 
        !process.env.EMAIL_SERVER_PORT || 
        !process.env.EMAIL_SERVER_USER || 
        !process.env.EMAIL_APP_PASSWORD) {
      console.error('Missing email configuration:', {
        host: !!process.env.EMAIL_SERVER_HOST,
        port: !!process.env.EMAIL_SERVER_PORT,
        user: !!process.env.EMAIL_SERVER_USER,
        pass: !!process.env.EMAIL_APP_PASSWORD
      });
      throw new Error('Email configuration is incomplete');
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: false, // Changed to true for Gmail
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    // Verify SMTP connection configuration
    await transporter.verify().catch((err) => {
      console.error('SMTP Verification failed:', err);
      throw err;
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER,
      to: process.env.EMAIL_SERVER_USER,
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      text: `
        Name: ${name}
        Email: ${email}
        Subject: ${subject}
        Message: ${message}
      `,
      html: `
        <h3>Délices de Isy</h3>
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Objet:</strong> ${subject}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    });

    return NextResponse.json(
      { message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    );
  }
}