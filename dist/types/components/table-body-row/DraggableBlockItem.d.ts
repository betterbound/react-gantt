import type { DraggableSyntheticListeners } from '@dnd-kit/core';
import React from 'react';
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
declare const _default: React.FunctionComponent<DraggableBlockItemProps>;
export default _default;
