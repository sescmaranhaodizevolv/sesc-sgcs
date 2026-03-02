import { toast as sonnerToast } from 'sonner';
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

/**
 * Sistema de toasts customizado para o SGCS
 * Baseado no design institucional do Sesc
 */

const createToast = (
  type: 'success' | 'error' | 'info' | 'warning',
  message: string
) => {
  const configs = {
    success: {
      icon: '✓',
      bg: 'linear-gradient(135deg, #00a63e 0%, #008a33 100%)',
      iconBg: '#ffffff',
      iconColor: '#00a63e',
    },
    error: {
      icon: '✕',
      bg: 'linear-gradient(135deg, #d4183d 0%, #b01530 100%)',
      iconBg: '#ffffff',
      iconColor: '#d4183d',
    },
    info: {
      icon: 'i',
      bg: 'linear-gradient(135deg, #1964e5 0%, #1450c2 100%)',
      iconBg: '#ffffff',
      iconColor: '#1964e5',
    },
    warning: {
      icon: '!',
      bg: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      iconBg: '#ffffff',
      iconColor: '#f97316',
    },
  };

  const config = configs[type];

  const toastFn = type === 'success' ? sonnerToast.success :
                  type === 'error' ? sonnerToast.error :
                  type === 'warning' ? sonnerToast.warning :
                  sonnerToast.info;

  toastFn(message, {
    style: {
      background: config.bg,
      color: '#ffffff',
      border: 'none',
      borderRadius: '12px',
      padding: '16px 20px',
      fontSize: '14px',
      fontWeight: '500',
      lineHeight: '1.5',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08)',
      minWidth: '320px',
      maxWidth: '500px',
    },
    className: 'custom-toast',
    duration: 4000,
  });
};

export const toast = {
  /**
   * Toast de sucesso (verde #00a63e)
   * Use para: Confirmação de ações bem-sucedidas
   */
  success: (message: string) => {
    createToast('success', message);
  },

  /**
   * Toast de erro (vermelho #d4183d)
   * Use para: Erros, falhas em operações
   */
  error: (message: string) => {
    createToast('error', message);
  },

  /**
   * Toast de informação (azul #1964e5)
   * Use para: Informações gerais, avisos neutros
   */
  info: (message: string) => {
    createToast('info', message);
  },

  /**
   * Toast de atenção (laranja #f97316)
   * Use para: Alertas importantes, ações que requerem atenção
   */
  warning: (message: string) => {
    createToast('warning', message);
  },
};
