
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Copy, Refresh } from 'lucide-react';
import { generateSecurePassword } from '@/utils/passwordSecurity';

interface PasswordSuggestionProps {
  onUsePassword: (password: string) => void;
  onDismiss?: () => void;
}

const PasswordSuggestion: React.FC<PasswordSuggestionProps> = ({ 
  onUsePassword,
  onDismiss 
}) => {
  const [suggestedPassword, setSuggestedPassword] = useState(() => generateSecurePassword());
  const [copied, setCopied] = useState(false);
  
  const handleCopyPassword = () => {
    navigator.clipboard.writeText(suggestedPassword).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  const handleRefreshPassword = () => {
    setSuggestedPassword(generateSecurePassword());
    setCopied(false);
  };
  
  return (
    <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 mb-4 animate-fade-in">
      <h3 className="text-sm font-medium text-yellow-800 mb-2">
        Suggested stronger password:
      </h3>
      
      <div className="flex items-center gap-2 mb-3">
        <div className="bg-white px-3 py-2 border border-gray-200 rounded text-sm font-mono flex-grow break-all">
          {suggestedPassword}
        </div>
        <Button 
          type="button" 
          size="icon" 
          variant="outline" 
          onClick={handleRefreshPassword}
          title="Generate new password"
          className="flex-shrink-0"
        >
          <Refresh size={16} />
        </Button>
        <Button 
          type="button" 
          size="icon" 
          variant="outline" 
          onClick={handleCopyPassword}
          title="Copy to clipboard"
          className="flex-shrink-0"
        >
          <Copy size={16} />
          {copied && (
            <span className="absolute top-full mt-1 text-xs bg-black text-white px-2 py-1 rounded">
              Copied!
            </span>
          )}
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={() => onUsePassword(suggestedPassword)}
          className="text-xs py-1 h-auto"
        >
          Use this password
        </Button>
        {onDismiss && (
          <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            onClick={onDismiss}
            className="text-xs py-1 h-auto"
          >
            No thanks
          </Button>
        )}
      </div>
    </div>
  );
};

export default PasswordSuggestion;
