import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

export interface SelectOption {
  label: string;
  value: string;
}

interface ListItemSelectProps {
  icon: string;
  label: string;
  valueLabel?: string;
  value?: string;
  options: SelectOption[];
  onSelect: (value: string) => void;
  title: string;
}

export function ListItemSelect({ 
  icon, 
  label, 
  valueLabel, 
  value, 
  options, 
  onSelect, 
  title 
}: ListItemSelectProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (selectedValue: string) => {
    onSelect(selectedValue);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative flex flex-col w-full">
        <button
          onClick={() => setIsOpen(true)}
          type="button"
          className="flex items-center gap-4 px-4 min-h-[60px] justify-between w-full hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary">
              <Icon name={icon} size={18} />
            </div>
            <p className="text-slate-900 dark:text-white text-base font-medium leading-normal flex-1 truncate text-left">
              {label}
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2 text-slate-500 dark:text-slate-400">
            {valueLabel && (
              <p className="text-sm font-normal leading-normal">{valueLabel}</p>
            )}
            <Icon name="chevron_right" size={20} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        variant="bottom-sheet"
      >
        <div className="flex flex-col p-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{title}</h3>
          <div className="flex flex-col gap-2">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl transition-all",
                  value === option.value
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-surface-light dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-white/5 border border-slate-200 dark:border-slate-800"
                )}
              >
                <span className="font-medium">{option.label}</span>
                {value === option.value && (
                  <Icon name="check" size={20} />
                )}
              </button>
            ))}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="mt-4 w-full py-4 text-center text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {t('common.cancel', 'Cancel')}
          </button>
        </div>
      </Modal>
    </>
  );
}
