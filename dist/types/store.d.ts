/// <reference types="lodash" />
import type { Dayjs } from 'dayjs';
import type React from 'react';
import type { GanttLocale, GanttProps as GanttProperties } from './Gantt';
import { Gantt } from './types';
export declare const ONE_DAY_MS = 86400000;
export declare const getViewTypeList: (locale: any) => Gantt.SightConfig[];
declare function isRestDay(date: string): boolean;
declare class GanttStore {
    width: number;
    height: number;
    viewWidth: number;
    tableWidth: number;
    translateX: number;
    sightConfig: Gantt.SightConfig;
    bodyWidth: number;
    rowHeight: number;
    disabled: boolean;
    viewTypeList: Gantt.SightConfig[];
    collapse: boolean;
    showSelectionIndicator: boolean;
    draggingType: Gantt.MoveType | null;
    gestureKeyPress: boolean;
    clientX: number;
    onUpdate: GanttProperties['onUpdate'];
    isRestDay: typeof isRestDay;
    constructor({ rowHeight, disabled, customSights, locale, tableSize }: {
        rowHeight: number;
        disabled: boolean;
        customSights: Gantt.SightConfig[];
        locale: GanttLocale;
        tableSize: {
            minWidth?: number;
            maxWidth?: number;
        };
    });
    locale: {
        today: string;
        day: string;
        days: string;
        week: string;
        week_in_month: string;
        month: string;
        quarter: string;
        halfYear: string;
        firstHalf: string;
        secondHalf: string;
        majorFormat: {
            day: string;
            week: string;
            week_in_month: string;
            month: string;
            quarter: string;
            halfYear: string;
        };
        minorFormat: {
            day: string;
            week: string;
            week_in_month: string;
            month: string;
            quarter: string;
            halfYear: string;
        };
    };
    _wheelTimer: number | undefined;
    scrollTimer: number | undefined;
    data: Gantt.Item[];
    originData: Gantt.Record[];
    columns: Gantt.Column[];
    dependencies: Gantt.Dependence[];
    scrolling: boolean;
    scrollTop: number;
    selectionIndicatorTop: number;
    dragging: Gantt.Bar | null;
    mainElementRef: React.RefObject<HTMLDivElement>;
    chartElementRef: React.RefObject<HTMLDivElement>;
    isPointerPress: boolean;
    startDateKey: string;
    endDateKey: string;
    autoScrollPos: number;
    getStartDate(): string;
    getFirstDayOfLastMonth(): string;
    setIsRestDay(function_: (date: string) => boolean): void;
    setData(data: Gantt.Record[], startDateKey: string, endDateKey: string): void;
    toggleCollapse(): void;
    setRowCollapse(item: Gantt.Item, collapsed: boolean): void;
    setOnUpdate(onUpdate: GanttProperties['onUpdate']): void;
    setColumns(columns: Gantt.Column[]): void;
    setDependencies(dependencies: Gantt.Dependence[]): void;
    setHideTable(isHidden?: boolean): void;
    handlePanMove(translateX: number): void;
    handlePanEnd(): void;
    syncSize(size: {
        width?: number;
        height?: number;
    }): void;
    handleResizeTableWidth(width: number): void;
    initWidth(): void;
    setTranslateX(translateX: number): void;
    switchSight(type: Gantt.Sight): void;
    scrollToToday(): void;
    updateBarListOrder(newOrder: Gantt.Bar[]): void;
    getTranslateXByDate(date: string): number;
    get todayTranslateX(): number;
    get scrollBarWidth(): number;
    get scrollLeft(): number;
    get scrollWidth(): number;
    get bodyClientHeight(): number;
    get getColumnsWidth(): number[];
    get totalColumnWidth(): number;
    get bodyScrollHeight(): number;
    get pxUnitAmp(): number;
    /** 当前开始时间毫秒数 */
    get translateAmp(): number;
    getDurationAmp(): number;
    getWidthByDate: (startDate: Dayjs, endDate: Dayjs) => number;
    getMajorList(): Gantt.Major[];
    majorAmp2Px(ampList: Gantt.MajorAmp[]): {
        label: string;
        left: number;
        width: number;
        key: string;
    }[];
    getMinorList(): Gantt.Minor[];
    startXRectBar: (startX: number) => {
        left: number;
        width: number;
    };
    minorAmp2Px(ampList: Gantt.MinorAmp[]): Gantt.Minor[];
    getTaskBarThumbVisible(barInfo: Gantt.Bar): boolean;
    scrollToBar(barInfo: Gantt.Bar, type: 'left' | 'right'): void;
    get getBarList(): Gantt.Bar[];
    handleWheel: (event: WheelEvent) => void;
    handleScroll: (event: React.UIEvent<HTMLDivElement, UIEvent>) => void;
    scrollY: import("lodash").DebouncedFunc<(scrollTop: number) => void>;
    get getVisibleRows(): {
        start: number;
        count: number;
    };
    handleMouseMove: import("lodash").DebouncedFunc<(event: any) => void>;
    handleMouseLeave(): void;
    showSelectionBar(event: MouseEvent): void;
    getHovered: (top: number) => boolean;
    handleDragStart(barInfo: Gantt.Bar, type: Gantt.MoveType): void;
    handleDragEnd(): void;
    handleInvalidBarLeave(): void;
    handleInvalidBarHover(barInfo: Gantt.Bar, left: number, width: number): void;
    handleInvalidBarDragStart(barInfo: Gantt.Bar): void;
    handleInvalidBarDragEnd(barInfo: Gantt.Bar, oldSize: {
        width: number;
        x: number;
    }): void;
    updateBarSize(barInfo: Gantt.Bar, { width, x }: {
        width: number;
        x: number;
    }): void;
    getMovedDay(ms: number): number;
    /** 更新时间 */
    updateTaskDate(barInfo: Gantt.Bar, oldSize: {
        width: number;
        x: number;
    }, type: 'move' | 'left' | 'right' | 'create'): Promise<void>;
    isToday(key: string): boolean;
}
export default GanttStore;
