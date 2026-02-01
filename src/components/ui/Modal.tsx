import { 
  type ReactNode, 
  type HTMLAttributes,
  useEffect,
  useRef,
  createContext,
  useContext,
} from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

interface ModalContextValue {
  onClose: () => void;
  variant: ModalVariant;
}

const ModalContext = createContext<ModalContextValue | null>(null);

const useModalContext = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('Modal compound components must be used within Modal');
  }
  return context;
};

type ModalVariant = 'fullscreen' | 'bottomsheet' | 'dialog' | 'viewer';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: ModalVariant;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeIcon?: 'close' | 'arrow_back';
  backdrop?: boolean;
  backdropBlur?: boolean;
  backdropOpacity?: 50 | 60 | 70 | 80 | 90;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  variant = 'dialog',
  size = 'md',
  showCloseButton = true,
  closeIcon = 'close',
  backdrop = true,
  backdropBlur = true,
  backdropOpacity = 50,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className,
  contentClassName,
  children,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle focus management
  useEffect(() => {
    if (!isOpen) return;

    // Store previous focus
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus modal
    const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements && focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      // Restore body scroll
      document.body.style.overflow = '';
      
      // Restore focus
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen]);

  // Handle focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full',
  };

  const variantContainerClasses = {
    fullscreen: 'fixed inset-0 z-[60]',
    bottomsheet: 'fixed inset-0 z-[60]',
    dialog: 'fixed inset-0 z-[60]',
    viewer: 'fixed inset-0 z-[60]',
  };

  const variantBackdropClasses = {
    fullscreen: '', // No backdrop for fullscreen
    bottomsheet: `bg-black/${backdropOpacity} ${backdropBlur ? 'backdrop-blur-sm' : ''} flex flex-col items-center justify-end sm:justify-center`,
    dialog: `bg-black/${backdropOpacity} ${backdropBlur ? 'backdrop-blur-sm' : ''} flex items-center justify-center p-4 overflow-y-auto`,
    viewer: `bg-black/${backdropOpacity > 70 ? backdropOpacity : 90} flex flex-col items-center justify-center p-4`,
  };

  const variantContentClasses = {
    fullscreen: 'bg-background-light dark:bg-background-dark flex flex-col w-full h-full',
    bottomsheet: 'bg-surface-light dark:bg-surface-dark w-full max-w-md h-[80vh] sm:h-auto sm:max-h-[80vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col',
    dialog: 'bg-surface-light dark:bg-surface-dark w-full rounded-3xl shadow-2xl border border-gray-200 dark:border-surface-highlight my-8',
    viewer: 'w-full max-w-4xl',
  };

  const content = (
    <div
      className={cn(variantContainerClasses[variant], className)}
      role="dialog"
      aria-modal="true"
      ref={modalRef}
    >
      <div
        className={cn(
          variant !== 'fullscreen' && variantBackdropClasses[variant]
        )}
        onClick={handleBackdropClick}
      >
        <div
          className={cn(
            variantContentClasses[variant],
            variant === 'dialog' && sizeClasses[size],
            contentClassName
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <ModalContext.Provider value={{ onClose, variant }}>
            {children}
          </ModalContext.Provider>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

// Modal.Header Component
interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement> {
  showCloseButton?: boolean;
  closeIcon?: 'close' | 'arrow_back';
  children?: ReactNode;
}

Modal.Header = function ModalHeader({
  showCloseButton = true,
  closeIcon = 'close',
  className,
  children,
  ...props
}: ModalHeaderProps) {
  const { onClose, variant } = useModalContext();

  const variantClasses = {
    fullscreen: 'flex items-center gap-3 p-4 border-b border-gray-200 dark:border-surface-highlight',
    bottomsheet: 'flex justify-between items-center p-6 pb-4',
    dialog: 'p-6 pb-4',
    viewer: 'absolute top-4 right-4 z-10',
  };

  if (variant === 'viewer') {
    return showCloseButton ? (
      <div className={cn(variantClasses[variant], className)} {...props}>
        <button
          onClick={onClose}
          className="text-white hover:bg-white/10 rounded-full p-2 transition-colors"
          aria-label="Close"
        >
          <Icon name="close" size={32} />
        </button>
      </div>
    ) : null;
  }

  return (
    <div className={cn(variantClasses[variant], className)} {...props}>
      {variant === 'fullscreen' && showCloseButton && (
        <button
          onClick={onClose}
          className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-highlight rounded-full p-2 transition-colors"
          aria-label="Close"
        >
          <Icon name={closeIcon} />
        </button>
      )}
      {children}
      {variant !== 'fullscreen' && showCloseButton && (
        <button
          onClick={onClose}
          className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-highlight rounded-full p-2 transition-colors"
          aria-label="Close"
        >
          <Icon name="close" />
        </button>
      )}
    </div>
  );
};

// Modal.Title Component
interface ModalTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

Modal.Title = function ModalTitle({ className, children, ...props }: ModalTitleProps) {
  const { variant } = useModalContext();

  const variantClasses = {
    fullscreen: 'text-2xl font-bold text-gray-900 dark:text-white',
    bottomsheet: 'text-xl font-bold text-gray-900 dark:text-white',
    dialog: 'text-xl font-bold text-gray-900 dark:text-white',
    viewer: 'text-xl font-bold text-white',
  };

  return (
    <h2 className={cn(variantClasses[variant], className)} {...props}>
      {children}
    </h2>
  );
};

// Modal.Body Component
interface ModalBodyProps extends HTMLAttributes<HTMLDivElement> {
  scrollable?: boolean;
  children: ReactNode;
}

Modal.Body = function ModalBody({
  scrollable = true,
  className,
  children,
  ...props
}: ModalBodyProps) {
  const { variant } = useModalContext();

  const variantClasses = {
    fullscreen: scrollable ? 'flex-1 overflow-y-auto p-4' : 'flex-1 p-4',
    bottomsheet: scrollable ? 'flex-1 overflow-y-auto px-6' : 'px-6',
    dialog: scrollable ? 'p-6 pt-0' : 'p-6 pt-0',
    viewer: 'flex items-center justify-center',
  };

  return (
    <div className={cn(variantClasses[variant], className)} {...props}>
      {children}
    </div>
  );
};

// Modal.Footer Component
interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

Modal.Footer = function ModalFooter({ className, children, ...props }: ModalFooterProps) {
  const { variant } = useModalContext();

  const variantClasses = {
    fullscreen: 'p-4 border-t border-gray-200 dark:border-surface-highlight',
    bottomsheet: 'p-6 pt-4 border-t border-gray-200 dark:border-surface-highlight',
    dialog: 'p-6 pt-4',
    viewer: 'p-4',
  };

  return (
    <div className={cn(variantClasses[variant], className)} {...props}>
      {children}
    </div>
  );
};
