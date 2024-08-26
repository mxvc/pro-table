import type { TableColumnType, TableProps } from 'antd';
import { Table } from 'antd';
import type { useContainer } from '../container';
import type { ProColumnGroupType, ProColumns } from '../typing';
import { genColumnKey } from './index';
import { getField } from './valueType';
import React from 'react';
import {omitUndefinedAndEmptyArr} from "./proutils";
/**
 * 转化 columns 到 pro 的格式 主要是 render 方法的自行实现
 *
 * @param columns
 * @param map
 * @param columnEmptyText
 */
export function genProColumnToColumn<T>(
  params: {
    columns: ProColumns<T, any>[];
    counter: ReturnType<typeof useContainer>;
  } & Pick<TableProps<T>, 'rowKey' | 'childrenColumnName'>,
): (TableColumnType<T> & {
  index?: number;
  isExtraColumns?: boolean;
  extraColumn?: typeof Table.EXPAND_COLUMN | typeof Table.SELECTION_COLUMN;
})[] {
  const { columns, counter, rowKey = 'id', childrenColumnName = 'children' } = params;

  const subNameRecord = new Map();

  return columns
    ?.filter((item) => !item.hideInTable)
    ?.map((columnProps, columnsIndex) => {
      const {
        key,
        dataIndex,
        valueEnum,
        valueType = 'text',
        children,
      } = columnProps as ProColumnGroupType<T, any>;
      const columnKey = genColumnKey(key || dataIndex?.toString(), columnsIndex);
      // 这些都没有，说明是普通的表格不需要 pro 管理
      const noNeedPro = !valueEnum && !valueType && !children;
      if (noNeedPro) {
        return {
          index: columnsIndex,
          ...columnProps,
        };
      }

      /**
       * 是不是展开行和多选按钮
       */
      const isExtraColumns =
        columnProps === Table.EXPAND_COLUMN || columnProps === Table.SELECTION_COLUMN;

      if (isExtraColumns) {
        return {
          index: columnsIndex,
          isExtraColumns: true,
          hideInSearch: true,
          hideInTable: false,
          hideInForm: true,
          hideInSetting: true,
          extraColumn: columnProps,
        };
      }
      const config = counter.columnsMap[columnKey] || { fixed: columnProps.fixed };

      const keyName: React.Key = rowKey as string;

      const tempColumns = {
        index: columnsIndex,
        key: columnKey,
        ...columnProps,
        valueEnum,
        fixed: config.fixed,
        width: columnProps.width || (columnProps.fixed ? 200 : undefined),
        children: (columnProps as ProColumnGroupType<T, any>).children
          ? genProColumnToColumn({
              ...params,
              columns: (columnProps as ProColumnGroupType<T, any>)?.children,
            })
          : undefined,
        render: (text: any, rowData: T, index: number) => {
          let uniqueKey: any;
          if (Reflect.has(rowData as any, keyName)) {
            uniqueKey = rowData[keyName];
            const parentInfo = subNameRecord.get(uniqueKey) || [];
            rowData[childrenColumnName]?.forEach((item: any) => {
              const itemUniqueKey = item[keyName];
              if (!subNameRecord.has(itemUniqueKey)) {
                subNameRecord.set(itemUniqueKey, parentInfo.concat([index, childrenColumnName]));
              }
            });
          }

          if (!columnProps.render) {
            const Field = getField(columnProps.valueType);
            // @ts-ignore
            return <Field value={text} mode="read" />;
          }

          // @ts-ignore
          return columnProps.render(text, rowData, index);
        },
      };
      return omitUndefinedAndEmptyArr(tempColumns);
    }) as unknown as (TableColumnType<T> & {
    index?: number;
    isExtraColumns?: boolean;
    extraColumn?: typeof Table.EXPAND_COLUMN | typeof Table.SELECTION_COLUMN;
  })[];
}
