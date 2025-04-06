/// <reference types="react" />
import type { DraggableSyntheticListeners } from '@dnd-kit/core';
import type { Gantt } from '../../types';
interface DraggableBlockItemProps {
    bar: Gantt.Bar;
    isActive?: boolean;
    listeners?: DraggableSyntheticListeners;
    transform?: {
        x: number;
        y: number;
    };
    transition?: string;
    setActivatorNodeRef?: (element: HTMLElement | null) => void;
}
declare const DraggableBlockItem: (({ bar, isActive, listeners, transform, transition, setActivatorNodeRef, }: DraggableBlockItemProps) => JSX.Element) & {
    displayName: string;
};
export default DraggableBlockItem;
