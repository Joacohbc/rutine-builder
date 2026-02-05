import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useInventory } from '@/hooks/useInventory';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

interface InventorySelectorProps {
    selectedItemIds: number[];
    onChange: (ids: number[]) => void;
    label?: string;
}

export function InventorySelector({ selectedItemIds, onChange, label }: InventorySelectorProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { items: inventoryItems } = useInventory();

    const toggleEquipment = (eqId: number) => {
        if (selectedItemIds.includes(eqId)) {
            onChange(selectedItemIds.filter(id => id !== eqId));
        } else {
            onChange([...selectedItemIds, eqId]);
        }
    };

    return (
        <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                    {label || t('exercise.equipment', 'Required Equipment')}
                </label>
                <button type="button" onClick={() => navigate('/')} className="text-primary text-xs font-bold hover:text-primary/80 transition-colors">
                    {t('inventory.manage', 'Manage Inventory')}
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {inventoryItems.map(item => {
                    const isSelected = selectedItemIds.includes(item.id!);
                    return (
                        <div
                            key={item.id}
                            onClick={() => toggleEquipment(item.id!)}
                            className={cn(
                                "flex items-center p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden",
                                isSelected
                                    ? "bg-primary/10 border-primary shadow-[0_0_0_1px_var(--color-primary)]"
                                    : "bg-surface-input border-transparent hover:border-border"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-colors shrink-0",
                                isSelected ? "bg-primary text-white" : "bg-surface-highlight text-text-muted"
                            )}>
                                <Icon name={item.icon} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={cn("text-sm font-bold truncate", isSelected ? "text-primary" : "text-text-main")}>{item.name}</p>
                                <p className="text-[10px] text-text-muted">{t('common.inventory', 'Inventory')}</p>
                            </div>
                            {isSelected && (
                                <div className="absolute top-2 right-2 text-primary">
                                    <Icon name="check_circle" size={16} filled />
                                </div>
                            )}
                        </div>
                    );
                })}

                <button type="button" onClick={() => navigate('/')} className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border hover:bg-surface-highlight text-text-muted transition-colors">
                    <Icon name="add" />
                    <span className="text-sm font-medium">{t('common.addItem', 'Add Item')}</span>
                </button>
            </div>
        </section>
    );
}
