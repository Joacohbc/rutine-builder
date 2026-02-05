import type { InventoryCondition } from '@/types';

export function getInventoryConditionColors(condition: InventoryCondition) {
	switch (condition) {
		case 'new':
		case 'good':
			return 'bg-success/10 text-success border-success/20 border';
		case 'worn':
			return 'bg-warning/10 text-warning border-warning/20 border';
		case 'poor':
			return 'bg-error/10 text-error border-error/20 border';
		default:
			return 'bg-surface-highlight text-text-muted border-border border';
	}
}
