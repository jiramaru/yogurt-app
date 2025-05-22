import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Store OTP in memory (in production, use a proper database/cache)
let currentOTP: string | null = null;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ode808prod@gmail.com',
    pass: process.env.EMAIL_APP_PASSWORD, // Create an app password in Gmail settings
  },
});

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST: Generate and send OTP
export async function POST() {
  try {
    const otp = generateOTP();
    currentOTP = otp;

    await transporter.sendMail({
      from: 'ode808prod@gmail.com',
      to: 'ode808prod@gmail.com',
      subject: 'Dashboard Access Verification',
      text: `Your verification code is: ${otp}`,
      html: `
        <div style="padding: 20px; background-color: #f5f5f5;">
          <h2>Dashboard Access Verification</h2>
          <p>Your verification code is:</p>
          <h1 style="color: #333; font-size: 32px;">${otp}</h1>
          <p>This code will expire in 5 minutes.</p>
        </div>
      `,
    });

    // Clear OTP after 5 minutes
    setTimeout(() => {
      if (currentOTP === otp) {
        currentOTP = null;
      }
    }, 5 * 60 * 1000);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}

// PUT: Verify OTP
export async function PUT(request: Request) {
  try {
    const { otp } = await request.json();

    if (otp === currentOTP) {
      currentOTP = null; // Clear OTP after successful verification
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid verification code' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}