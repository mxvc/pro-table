/**
 * 工具栏
 */
import { ReloadOutlined } from '@ant-design/icons';
import type { TableColumnType } from 'antd';
import { Tooltip } from 'antd';
import type { LabelTooltipType } from 'antd/lib/form/FormItemLabel';
import React, { useEffect, useMemo } from 'react';
import Container from '../../container';
import type { ActionType, OptionSearchProps, ProTableProps } from '../../typing';
import ColumnSetting from '../ColumnSetting';
import type { ListToolBarProps } from '../ListToolBar';
import ListToolBar from '../ListToolBar';
import DensityIcon from './DensityIcon';
import './index.less';
import {omitUndefined} from "../../proutils";

export type SettingOptionType = {
  draggable?: boolean;
  checkable?: boolean;
  checkedReset?: boolean;
  listsHeight?: number;
  extra?: React.ReactNode;
  children?: React.ReactNode;
};
export type OptionConfig = {
  density?: boolean;
  reload?: OptionsType;
  setting?: boolean | SettingOptionType;
  search?: (OptionSearchProps & { name?: string }) | boolean;
};

export type OptionsFunctionType = (
  e: React.MouseEvent<HTMLSpanElement>,
  action?: ActionType,
) => void;

export type OptionsType = OptionsFunctionType | boolean;

export type ToolBarProps<T = unknown> = {
  headerTitle?: React.ReactNode;
  tooltip?: string | LabelTooltipType;
  toolbar?: ListToolBarProps;
  toolBarRender?: (
    action: ActionType | undefined,
    rows: {
      selectedRowKeys?: (string | number)[];
      selectedRows?: T[];
    },
  ) => React.ReactNode[];
  action: React.MutableRefObject<ActionType | undefined>;
  options?: OptionConfig | false;
  selectedRowKeys?: (string | number)[];
  selectedRows?: T[];
  className?: string;
  onSearch?: (keyWords: string) => void;
  columns: TableColumnType<T>[];
};



/**
 * 渲染默认的 工具栏
 *
 * @param options
 * @param className
 */
function renderDefaultOption<T>(
  options: OptionConfig,
  defaultOptions: OptionConfig,
  actions: React.MutableRefObject<ActionType | undefined>,
  columns: TableColumnType<T>[],
) {
  return Object.keys(options)
    .filter((item) => item)
    .map((key) => {
      const value = options[key];
      if (!value) {
        return null;
      }

      let onClick: OptionsFunctionType =
        value === true ? defaultOptions[key] : (event) => value?.(event, actions.current);

      if (typeof onClick !== 'function') {
        onClick = () => {};
      }

      if (key === 'setting') {
        return (
          <ColumnSetting {...(options[key] as SettingOptionType)} columns={columns} key={key} />
        );
      }

      if (key === 'reload'){
      return  <span key={key} onClick={onClick}>
            <Tooltip title='刷新'><ReloadOutlined /></Tooltip>
          </span>
      }

      if(key === 'density'){
        return  <span key={key} onClick={onClick}>
            <Tooltip title='表格密度'> <DensityIcon /></Tooltip>
          </span>
      }

      return null;
    })
    .filter((item) => item);
}

function ToolBar<T>({
  headerTitle,
  toolBarRender,
  action,
  options: propsOptions,
  selectedRowKeys,
  selectedRows,
  toolbar,
  onSearch,
  columns,
}: ToolBarProps<T>) {
  const counter = Container.useContainer();

  const optionDom = useMemo(() => {
    const defaultOptions = {
      reload: () => action?.current?.reload(),
      density: true,
      setting: true,
      search: false,
    };
    if (propsOptions === false) {
      return [];
    }

    const options = {
      ...defaultOptions,
      ...propsOptions,
    };

    return renderDefaultOption<T>(
      options,
      {
        ...defaultOptions,
      },
      action,
      columns,
    );
  }, [action, columns, propsOptions]);
  // 操作列表
  const actions = toolBarRender
    ? toolBarRender(action?.current, { selectedRowKeys, selectedRows })
    : [];

  const searchConfig = useMemo(() => {
    if (!propsOptions) {
      return false;
    }
    if (!propsOptions.search) return false;

    /** 受控的value 和 onChange */
    const defaultSearchConfig = {
      value: counter.keyWords,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => counter.setKeyWords(e.target.value),
    };

    if (propsOptions.search === true) return defaultSearchConfig;

    return {
      ...defaultSearchConfig,
      ...propsOptions.search,
    };
  }, [counter, propsOptions]);

  useEffect(() => {
    if (counter.keyWords === undefined) {
      onSearch?.('');
    }
  }, [counter.keyWords, onSearch]);

  return (
    <ListToolBar
      title={headerTitle}
      search={searchConfig}
      onSearch={onSearch}
      actions={actions}
      settings={optionDom}
      {...toolbar}
    />
  );
}

export type ToolbarRenderProps<T> = {
  hideToolbar: boolean;
  onFormSearchSubmit: (params: any) => void;
  tableColumn: any[];
  tooltip?: string | LabelTooltipType;
  selectedRows: T[];
  selectedRowKeys: React.Key[];
  headerTitle: React.ReactNode;
  options: ProTableProps<T, any, any>['options'];
  toolBarRender?: ToolBarProps<T>['toolBarRender'];
  actionRef: React.MutableRefObject<ActionType | undefined>;
};

/** 这里负责与table交互，并且减少 render次数 */
export default class ToolbarRender<T> extends React.Component<ToolbarRenderProps<T>> {
  onSearch = (keyword: string) => {
    const { options, onFormSearchSubmit, actionRef } = this.props;

    if (!options || !options.search) {
      return;
    }
    const { name = 'keyword' } = options.search === true ? {} : options.search;

    /** 如果传入的 onSearch 返回值为 false，应该直接拦截请求 */
    const success = (options.search as OptionSearchProps)?.onSearch?.(keyword);

    if (success === false) return;

    // 查询的时候的回到第一页
    actionRef?.current?.setPageInfo?.({
      current: 1,
    });

    onFormSearchSubmit(
      omitUndefined({
        _timestamp: Date.now(),
        [name]: keyword,
      }),
    );
  };

  render = () => {
    const {
      hideToolbar,
      tableColumn,
      options,
      tooltip,
      selectedRows,
      selectedRowKeys,
      headerTitle,
      actionRef,
      toolBarRender,
    } = this.props;

    // 不展示 toolbar
    if (hideToolbar) {
      return null;
    }
    return (
      <ToolBar<T>
        tooltip={tooltip}
        columns={tableColumn}
        options={options}
        headerTitle={headerTitle}
        action={actionRef}
        onSearch={this.onSearch}
        selectedRows={selectedRows}
        selectedRowKeys={selectedRowKeys}
        toolBarRender={toolBarRender}
      />
    );
  };
}


