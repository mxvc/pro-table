import { ConfigConsumer, ConfigProvider } from '@ant-design/pro-provider';
import Search from './components/Form';

import type { ColumnsState } from './container';
import ProTable from './Table';
import type { ActionType, ProColumns, ProColumnType, ProTableProps, RequestData } from './typing';

export type { ProTableProps, ActionType, ColumnsState, ProColumns, ProColumnType, RequestData };
export { Search, ConfigProvider, ConfigConsumer, ProTable };
export * from './utils/valueType';
export default ProTable;
