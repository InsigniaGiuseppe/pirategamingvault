
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { X, Copy, Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportCredentialsAsJSON, importCredentialsFromJSON } from '@/services/credentialService';

interface CredentialSharingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

const CredentialSharingModal = ({ isOpen, onClose, onImportSuccess }: CredentialSharingModalProps) => {
  const [importData, setImportData] = useState('');
  const [activeTab, setActiveTab] = useState('export');
  const { toast } = useToast();
  
  const handleCopyToClipboard = () => {
    const jsonData = exportCredentialsAsJSON();
    navigator.clipboard.writeText(jsonData).then(() => {
      toast({
        title: 'Copied to clipboard',
        description: 'Credential data has been copied to clipboard.',
      });
    });
  };
  
  const handleDownloadJSON = () => {
    const jsonData = exportCredentialsAsJSON();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'pirate-credentials.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleImport = () => {
    if (!importData) {
      toast({
        variant: 'destructive',
        title: 'No data provided',
        description: 'Please paste the credential JSON data.',
      });
      return;
    }
    
    const success = importCredentialsFromJSON(importData);
    if (success) {
      toast({
        title: 'Import successful',
        description: 'Credentials have been successfully imported.',
      });
      onImportSuccess();
      onClose();
    } else {
      toast({
        variant: 'destructive',
        title: 'Import failed',
        description: 'The provided data is not valid credential data.',
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-xl shadow-saas border-none max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-black text-center">
            Share Credentials
          </DialogTitle>
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X size={16} className="text-black" />
          </button>
        </DialogHeader>
        
        <div className="mt-4">
          <Tabs defaultValue="export" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="export">Export</TabsTrigger>
              <TabsTrigger value="import">Import</TabsTrigger>
            </TabsList>
            
            <TabsContent value="export" className="space-y-4">
              <div className="text-sm text-gray-600 mb-2">
                Copy or download your credential data to share with other devices or users:
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleCopyToClipboard}
                  className="flex-1 bg-white text-black border-2 border-black hover:bg-black hover:text-white"
                >
                  <Copy size={16} className="mr-2" />
                  Copy to Clipboard
                </Button>
                
                <Button
                  onClick={handleDownloadJSON}
                  className="flex-1 bg-white text-black border-2 border-black hover:bg-black hover:text-white"
                >
                  <Download size={16} className="mr-2" />
                  Download JSON
                </Button>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-60 overflow-auto">
                <pre className="text-xs whitespace-pre-wrap break-all">
                  {exportCredentialsAsJSON()}
                </pre>
              </div>
            </TabsContent>
            
            <TabsContent value="import" className="space-y-4">
              <div className="text-sm text-gray-600 mb-2">
                Paste the credential JSON data to import:
              </div>
              
              <Textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste JSON credential data here..."
                className="min-h-[150px] bg-white border-2 border-gray-300"
              />
              
              <Button
                onClick={handleImport}
                className="w-full bg-white text-black border-2 border-black hover:bg-black hover:text-white"
              >
                <Upload size={16} className="mr-2" />
                Import Credentials
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CredentialSharingModal;
