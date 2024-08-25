import type { ProFieldEmptyText } from '@ant-design/pro-field';
import type {
  ProFieldValueType,
} from '@ant-design/pro-utils';
import { genCopyable, isNil, LabelIconTip } from '@ant-design/pro-utils';
import { Space } from 'antd';
import get from 'rc-util/lib/utils/get';
import React from 'react';
import { isMergeCell } from '.';
import type { useContainer } from '../container';
import type { ActionType, ProColumns } from '../typing';
import cellRenderToFromItem from './cellRenderToFromItem';

/** 转化列的定义 */
type ColumnRenderInterface<T> = {
  columnProps: ProColumns<T>;
  text: any;
  rowData: T;
  index: number;
  columnEmptyText?: ProFieldEmptyText;
  counter: ReturnType<typeof useContainer>;
  subName: string[];
};

/**
 * 增加了 icon 的功能 render title
 *
 * @param item
 */
export const renderColumnsTitle = (item: ProColumns<any>) => {
  const { title } = item;
  const ellipsis = typeof item?.ellipsis === 'boolean' ? item?.ellipsis : item?.ellipsis?.showTitle;
  if (title && typeof title === 'function') {
    return title(item, 'table', <LabelIconTip label={null} tooltip={item.tooltip || item.tip} />);
  }
  return <LabelIconTip label={title} tooltip={item.tooltip || item.tip} ellipsis={ellipsis} />;
};
/**
 * 默认的 filter 方法
 *
 * @param value
 * @param record
 * @param dataIndex
 * @returns
 */
export const defaultOnFilter = (value: string, record: any, dataIndex: string | string[]) => {
  const recordElement = Array.isArray(dataIndex)
    ? get(record, dataIndex as string[])
    : record[dataIndex];
  const itemValue = String(recordElement) as string;

  return String(itemValue) === String(value);
};

/**
 * 这个组件负责单元格的具体渲染
 *
 * @param param0
 */
export function columnRender<T>({
  columnProps,
  text,
  rowData,
  index,
  columnEmptyText,
  counter,
  subName,
}: ColumnRenderInterface<T>): any {
  const { action, prefixName } = counter;
  const { renderText = (val: any) => val } = columnProps;

  const renderTextStr = renderText(text, rowData, index, action as ActionType);
  const mode =     'read';

  const textDom = cellRenderToFromItem<T>({
    text: renderTextStr,
    valueType: (columnProps.valueType as ProFieldValueType) || 'text',
    index,
    rowData,
    subName,
    columnProps: {
      ...columnProps,
      // 为了兼容性，原来写了个错别字
      // @ts-ignore
      entry: rowData,
      entity: rowData,
    },
    counter,
    columnEmptyText,
    mode,
    prefixName,
  });

  const dom: React.ReactNode =   genCopyable(textDom, columnProps, renderTextStr);



  if (!columnProps.render) {
    const isReactRenderNode =
      React.isValidElement(dom) || ['string', 'number'].includes(typeof dom);
    return !isNil(dom) && isReactRenderNode ? dom : null;
  }

  // @ts-ignore
  const renderDom = columnProps.render(
    dom,
    rowData,
    index,
    action,
    {
      ...columnProps,
      type: 'table',
    },
  );

  // 如果是合并单元格的，直接返回对象
  if (isMergeCell(renderDom)) {
    return renderDom;
  }

  if (renderDom && columnProps.valueType === 'option' && Array.isArray(renderDom)) {
    return <Space size={16}>{renderDom}</Space>;
  }
  return renderDom as React.ReactNode;
}
