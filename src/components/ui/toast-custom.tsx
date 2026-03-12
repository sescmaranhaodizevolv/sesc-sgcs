import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

interface ToastProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  onClose?: () => void;
}

const toastConfig = {
  success: {
    bg: '#00a63e',
    icon: CheckCircle2,
    label: 'Sucesso'
  },
  error: {
    bg: '#d4183d',
    icon: AlertCircle,
    label: 'Erro'
  },
  info: {
    bg: '#1964e5',
    icon: Info,
    label: 'Info'
  },
  warning: {
    bg: '#f97316',
    icon: AlertTriangle,
    label: 'Atenção'
  }
};

export function CustomToast({ type, message, onClose }: ToastProps) {
  const config = toastConfig[type];
  const Icon = config.icon;

  return (
    <div 
      className="relative rounded-[8px] shadow-lg min-w-[320px] max-w-[400px]" 
      style={{ backgroundColor: config.bg }}
    >
      <div className="flex flex-row items-center size-full">
        <div className="box-border flex gap-[16px] items-center px-[16px] py-[10px] relative w-full">
          {/* Icon */}
          <div className="relative shrink-0 size-[24px]">
            <Icon className="size-full text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 flex items-center justify-between min-h-px min-w-px">
            <div className="flex gap-[8px] items-center">
              {/* Divider */}
              <div className="flex items-center">
                <div className="h-[20px] w-[1px] bg-white" />
              </div>
              {/* Message */}
              <p className="text-[14px] leading-[1.4] text-white">
                {message}
              </p>
            </div>

            {/* Close Button */}
            {onClose && (
              <button 
                onClick={onClose}
                className="ml-4 shrink-0 size-[16px] text-white hover:opacity-80 transition-opacity"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions to use with sonner
export const showSuccessToast = (message: string) => {
  return { type: 'success' as const, message };
};

export const showErrorToast = (message: string) => {
  return { type: 'error' as const, message };
};

export const showInfoToast = (message: string) => {
  return { type: 'info' as const, message };
};

export const showWarningToast = (message: string) => {
  return { type: 'warning' as const, message };
};
