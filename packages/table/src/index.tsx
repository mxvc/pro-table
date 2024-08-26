import {
  ConfigConsumer,
  ConfigProvider,
  ConfigProviderWrap,
} from '@ant-design/pro-provider';
import type { ProFieldValueType } from '@ant-design/pro-utils';
import Search from './components/Form';


import type { ColumnsState } from './container';
import ProTable from './Table';
import type { ActionType, ProColumns, ProColumnType, ProTableProps, RequestData } from './typing';


export type {
  ProTableProps,
  ActionType,
  ColumnsState,
  ProColumns,
  ProColumnType,
  RequestData,
};
export {
  ConfigProviderWrap,
  Search,
  ConfigProvider,
  ConfigConsumer,
  ProTable,

};
export * from './utils/valueType'
export default ProTable;
