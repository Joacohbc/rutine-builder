import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useInventory } from '@/hooks/useInventory';
import { Layout } from '@/components/ui/Layout';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { TagSelector } from '@/components/ui/TagSelector';
import { Form, type FormFieldValues } from '@/components/ui/Form';
import { exerciseValidators } from '@/lib/validations';
import { cn } from '@/lib/utils';

interface ExerciseFormProps {
    initialValues: FormFieldValues;
    onSubmit: (values: FormFieldValues) => Promise<void>;
    isEditing: boolean;
}

export function ExerciseForm({ initialValues, onSubmit, isEditing }: ExerciseFormProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { items: inventoryItems } = useInventory();

    return (
        <Form
            onSubmit={onSubmit}
            defaultValues={initialValues}
            className="h-full"
        >
            <Layout
                header={
                    <div className="flex items-center justify-between px-6 py-4 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md z-50">
                        <button type="button" onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-surface-highlight text-gray-900 dark:text-white transition-colors">
                            <Icon name="close" />
                        </button>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white">{isEditing ? t('exercise.edit', 'Edit Exercise') : t('exercise.new', 'New Exercise')}</h1>
                        <Button size="sm" type="submit" className="bg-primary text-white rounded-full px-6">{t('common.save', 'Save')}</Button>
                    </div>
                }
            >
                <div className="flex flex-col gap-8 mt-4">
                    {/* Exercise Title */}
                    <Form.Input
                        name="title"
                        label={t('exercise.title', 'Exercise Title')}
                        placeholder={t('exercise.titlePlaceholder', 'e.g. Incline Bench Press')}
                        validator={exerciseValidators.title}
                        className="font-bold text-lg"
                    />

                    {/* Description */}
                    <Form.Textarea
                        name="description"
                        label={t('exercise.description', 'Description')}
                        placeholder={t('exercise.descriptionPlaceholder', 'Add cues, form tips, or setup instructions...')}
                    />

                    {/* Multimedia Gallery */}
                    <Form.Media name="media" />

                    {/* Required Equipment */}
                    <Form.Field name="primaryEquipmentIds">
                        {({ value, setValue }) => {
                            const selectedEquipment = (value as number[]) || [];
                            const toggleEquipment = (eqId: number) => {
                                if (selectedEquipment.includes(eqId)) {
                                    setValue(selectedEquipment.filter(id => id !== eqId));
                                } else {
                                    setValue([...selectedEquipment, eqId]);
                                }
                            };

                            return (
                                <section className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('exercise.equipment', 'Required Equipment')}</label>
                                        <button type="button" onClick={() => navigate('/')} className="text-primary text-xs font-bold hover:text-primary-dark transition-colors">
                                            {t('inventory.manage', 'Manage Inventory')}
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {inventoryItems.map(item => {
                                            const isSelected = selectedEquipment.includes(item.id!);
                                            return (
                                                <div
                                                    key={item.id}
                                                    onClick={() => toggleEquipment(item.id!)}
                                                    className={cn(
                                                        "flex items-center p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden",
                                                        isSelected
                                                            ? "bg-primary/10 border-primary shadow-[0_0_0_1px_rgba(179,157,219,1)]"
                                                            : "bg-surface-input border-transparent hover:border-gray-600"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-colors shrink-0",
                                                        isSelected ? "bg-primary text-white" : "bg-white/5 text-gray-500"
                                                    )}>
                                                        <Icon name={item.icon} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={cn("text-sm font-bold truncate", isSelected ? "text-primary" : "text-gray-300")}>{item.name}</p>
                                                        <p className="text-[10px] text-gray-500">{t('common.inventory', 'Inventory')}</p>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="absolute top-2 right-2 text-primary">
                                                            <Icon name="check_circle" size={16} filled />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        <button type="button" onClick={() => navigate('/')} className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-gray-600 hover:bg-white/5 text-gray-400 transition-colors">
                                            <Icon name="add" />
                                            <span className="text-sm font-medium">{t('common.addItem', 'Add Item')}</span>
                                        </button>
                                    </div>
                                </section>
                            );
                        }}
                    </Form.Field>

                    {/* Tags */}
                    <Form.Field name="tagIds" validator={exerciseValidators.tagIds}>
                        {({ value, setValue, error }) => (
                            <div className="flex flex-col gap-1">
                                <TagSelector
                                    label={t('exercise.tags')}
                                    type="exercise"
                                    selectedTagIds={(value as number[]) || []}
                                    onChange={setValue}
                                />
                                {error && <span className="text-xs text-red-500 pl-1">{error}</span>}
                            </div>
                        )}
                    </Form.Field>
                </div>
            </Layout>
        </Form>
    );
}
