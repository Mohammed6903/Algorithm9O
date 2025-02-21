import React from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

interface LoadingModalProps {
  isOpen: boolean;
  status: 'processing' | 'completed' | 'failed' | null;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ isOpen, status }) => {
  // Format status message for display
  const getStatusMessage = (status: LoadingModalProps['status']) => {
    if (!status) return 'Processing...';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="sr-only">Processing Status</DialogTitle>
        
        <div className="flex flex-col items-center justify-center p-6 space-y-6">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg">Processing Your Content</h3>
            <p className="text-sm text-gray-500">
              Status: {getStatusMessage(status)}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoadingModal;