import { FieldIndexColumn, FieldStatus } from '@ant-design/pro-field';
import type { IntlType } from '@ant-design/pro-provider';
import {
  ConfigConsumer,
  ConfigProvider,
  ConfigProviderWrap,
} from '@ant-design/pro-provider';
import type { ProFieldValueType, RowEditableConfig } from '@ant-design/pro-utils';
import Search from './components/Form';
import type { ListToolBarProps } from './components/ListToolBar';
import ListToolBar from './components/ListToolBar';
import type { ColumnsState } from './container';
import ProTable from './Table';
import type { ActionType, ProColumns, ProColumnType, ProTableProps, RequestData } from './typing';

type ProColumnsValueType = ProFieldValueType;
type TableRowEditable<T> = RowEditableConfig<T>;

export type {
  ProTableProps,
  IntlType,
  ActionType,
  TableRowEditable,
  ColumnsState,
  ProColumnsValueType,
  ProColumns,
  ProColumnType,
  RequestData,
  ListToolBarProps,
};
export {
  ConfigProviderWrap,
  ListToolBar,
  FieldStatus as TableStatus,
  Search,
  ConfigProvider as IntlProvider,
  ConfigProvider,
  ConfigConsumer as IntlConsumer,
  ConfigConsumer,
  FieldIndexColumn as IndexColumn,

  ProTable,
};

export default ProTable;
