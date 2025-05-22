import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface OTPModalProps {
  isOpen: boolean;
  onVerify: (otp: string) => void;
  onClose: () => void;
}

export default function OTPModal({ isOpen, onVerify, onClose }: OTPModalProps) {
  const [otp, setOtp] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Verification Required</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Please enter the verification code sent to ode808prod@gmail.com
        </p>
        
        <Input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="mb-4"
          maxLength={6}
        />
        
        <div className="flex gap-4">
          <Button onClick={() => onVerify(otp)} className="flex-1">
            Verify
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}