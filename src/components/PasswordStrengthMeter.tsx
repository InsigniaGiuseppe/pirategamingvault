
import React from 'react';
import { evaluatePasswordStrength, getPasswordFeedback } from '@/utils/passwordSecurity';

interface PasswordStrengthMeterProps {
  password: string;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const score = evaluatePasswordStrength(password);
  const { text, color } = getPasswordFeedback(score);
  
  // Don't show anything if password is empty
  if (!password) return null;
  
  return (
    <div className="mt-1 space-y-2">
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${color.replace('text-', 'bg-')}`} 
          style={{ width: `${score}%` }}
        />
      </div>
      <div className="flex justify-between text-xs">
        <span className={color}>{text}</span>
        <span className="text-gray-500">{score}/100</span>
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
