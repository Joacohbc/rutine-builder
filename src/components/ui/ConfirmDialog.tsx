import { type ReactNode } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

type ConfirmVariant = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  showIcon?: boolean;
  confirmButtonVariant?: 'primary' | 'secondary' | 'ghost';
}

const variantConfig = {
  danger: {
    icon: 'error',
    iconColor: 'text-red-500',
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    confirmVariant: 'primary' as const,
    confirmClass: 'bg-red-500 hover:bg-red-600 shadow-red-500/30',
  },
  warning: {
    icon: 'warning',
    iconColor: 'text-yellow-500',
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
    confirmVariant: 'primary' as const,
    confirmClass: 'bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/30',
  },
  info: {
    icon: 'info',
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    confirmVariant: 'primary' as const,
    confirmClass: '',
  },
  success: {
    icon: 'check_circle',
    iconColor: 'text-green-500',
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    confirmVariant: 'primary' as const,
    confirmClass: 'bg-green-500 hover:bg-green-600 shadow-green-500/30',
  },
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  showIcon = true,
  confirmButtonVariant,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="dialog"
      size="sm"
      showCloseButton={false}
    >
      <Modal.Body scrollable={false}>
        <div className="flex flex-col items-center text-center">
          {showIcon && (
            <div className={cn('rounded-full p-3 mb-4', config.iconBg)}>
              <Icon name={config.icon} size={32} className={config.iconColor} />
            </div>
          )}
          
          {title && (
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {title}
            </h2>
          )}
          
          <div className="text-gray-600 dark:text-gray-300 mb-6">
            {message}
          </div>

          <div className="flex gap-3 w-full">
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex-1"
            >
              {cancelText}
            </Button>
            <Button
              variant={confirmButtonVariant || config.confirmVariant}
              onClick={handleConfirm}
              className={cn('flex-1', config.confirmClass)}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
