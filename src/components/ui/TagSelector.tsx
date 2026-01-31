import { useState, useMemo } from 'react';
import { useTags } from '@/hooks/useTags';
import { useInventory } from '@/hooks/useInventory';
import { useExercises } from '@/hooks/useExercises';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';

interface TagSelectorProps {
  selectedTagIds: number[];
  onChange: (tagIds: number[]) => void;
  type: 'inventory' | 'exercise';
  label?: string;
}

const PRESET_COLORS = [
  '#ef4444', '#3b82f6', '#10b981', '#f59e0b', 
  '#6366f1', '#ec4899', '#8b5cf6', '#06b6d4'
];

export function TagSelector({ selectedTagIds, onChange, type, label = 'Muscles & Tags' }: TagSelectorProps) {
  const { tags, addTag } = useTags();
  const { items: inventoryItems } = useInventory();
  const { exercises } = useExercises();
  const [search, setSearch] = useState('');

  // Calculate most used tags for this type
  const suggestedTags = useMemo(() => {
    const usageCount: Record<number, number> = {};
    const relevantItems = type === 'inventory' ? inventoryItems : exercises;

    relevantItems.forEach((item) => {
      (item.tagIds || []).forEach((id: number) => {
        usageCount[id] = (usageCount[id] || 0) + 1;
      });
    });

    return tags
      .filter(tag => !selectedTagIds.includes(tag.id!))
      .sort((a, b) => (usageCount[b.id!] || 0) - (usageCount[a.id!] || 0))
      .slice(0, 4);
  }, [type, inventoryItems, exercises, tags, selectedTagIds]);

  const filteredTags = useMemo(() => {
    if (!search) return [];
    return tags.filter(tag => 
      tag.name.toLowerCase().includes(search.toLowerCase()) && 
      !selectedTagIds.includes(tag.id!)
    );
  }, [search, tags, selectedTagIds]);

  const handleAddTag = async () => {
    if (!search.trim()) return;
    
    // Check if tag already exists
    const existing = tags.find(t => t.name.toLowerCase() === search.toLowerCase());
    if (existing) {
      if (!selectedTagIds.includes(existing.id!)) {
        onChange([...selectedTagIds, existing.id!]);
      }
    } else {
      const color = PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
      const id = await addTag({ name: search.trim(), color });
      onChange([...selectedTagIds, id as number]);
    }
    setSearch('');
  };

  const toggleTag = (id: number) => {
    if (selectedTagIds.includes(id)) {
      onChange(selectedTagIds.filter(tid => tid !== id));
    } else {
      onChange([...selectedTagIds, id]);
    }
  };

  const selectedTags = tags.filter(t => selectedTagIds.includes(t.id!));

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</label>
      <div className="bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-surface-highlight rounded-2xl p-4 space-y-4">
        {/* Selected Tags */}
        <div className="flex flex-wrap gap-2">
          {selectedTags.map(tag => (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id!)}
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 transition-all hover:bg-primary/20"
              style={{ color: tag.color, backgroundColor: `${tag.color}15`, borderColor: `${tag.color}30` }}
            >
              <span className="text-sm font-medium">{tag.name}</span>
              <Icon name="close" size={14} className="opacity-60 group-hover:opacity-100" />
            </button>
          ))}
          
          {/* Suggestions */}
          {!search && suggestedTags.map(tag => (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id!)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-surface-highlight text-gray-600 dark:text-gray-400 border border-transparent transition-all hover:border-gray-300 dark:hover:border-gray-600"
            >
              <span className="text-sm font-medium">{tag.name}</span>
            </button>
          ))}
        </div>

        <div className="border-t border-gray-100 dark:border-surface-highlight pt-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name="sell" size={18} className="text-gray-400 group-focus-within:text-primary transition-colors" />
            </div>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Add custom tag or muscle..."
              className="pl-10 pr-10 border-none bg-transparent focus:ring-0 h-8"
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            />
            {search && (
              <button 
                onClick={handleAddTag}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-primary"
              >
                <Icon name="add" size={20} />
              </button>
            )}
          </div>
          
          {/* Search Results Dropdown-like (simplified for now) */}
          {search && filteredTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {filteredTags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id!)}
                  className="px-3 py-1 rounded-full text-xs bg-surface-highlight border border-gray-700 hover:border-primary transition-colors"
                >
                  {tag.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
