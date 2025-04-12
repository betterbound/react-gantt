import type { Gantt } from './types';
interface ConvertBar {
    data: Gantt.Item[];
    pxUnitAmp: number;
    rowHeight: number;
    disabled: boolean;
    depth?: number;
    parents?: Gantt.Item[] | undefined;
}
export interface ConvertedBarList {
    activeId: string;
    overId: string;
    parents: {
        id: string;
        depth: number;
    }[];
}
export declare function getChildrenCount(barList: Gantt.Bar[]): number;
export declare function convertBarList(barList: Gantt.Bar[], activeId: string, overId: string): ConvertedBarList;
export declare function convertItem(barList: Gantt.Bar[], depth?: number, parents?: Gantt.Bar[] | undefined): Gantt.Item[];
export declare function convertBar({ data, pxUnitAmp, rowHeight, disabled, depth, parents }: ConvertBar): Gantt.Bar<import("./types").DefaultRecordType>[];
/**
 * 将树形数据向下递归为一维数组
 *
 * @param {any} arr 数据源
 */
export declare function flattenDeep(array?: Gantt.Bar[], depth?: number): Gantt.Bar[];
export declare function getMaxRange(bar: Gantt.Bar): {
    translateX: number;
    width: number;
};
export declare function transverseData(data: Gantt.Record[], startDateKey: string, endDateKey: string): Gantt.Item<import("./types").DefaultRecordType>[];
export {};
