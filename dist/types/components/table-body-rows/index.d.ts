/// <reference types="react" />
import type { Gantt } from '../../types';
interface Props {
    barList: Gantt.Bar[];
}
declare const _default: (({ barList }: Props) => JSX.Element) & {
    displayName: string;
};
export default _default;
