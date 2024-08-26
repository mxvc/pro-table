import type { FormInstance, TablePaginationConfig } from 'antd';
import { ConfigProvider, Table, Card } from 'antd';
import type { GetRowKey, SortOrder, TableCurrentDataSource } from 'antd/lib/table/interface';
import classNames from 'classnames';
import React, {
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { stringify } from 'use-json-comparison';
import type { ActionType } from '.';
import FormSearch from './components/SearchForm';
import Toolbar from './components/ToolBar';
import Container from './container';
import './index.less';
import type {
  OptionSearchProps,
  PageInfo,
  ProTableProps,
  RequestData,
  TableRowSelection,
  UseFetchDataAction,
} from './typing';
import useFetchData from './useFetchData';
import { genColumnKey, mergePagination, parseDefaultColumnConfig, useActionType } from './utils';
import { columnSort } from './utils/columnSort';
import { genProColumnToColumn } from './utils/genProColumnToColumn';
import {omitUndefined, useDeepCompareEffect, useDeepCompareEffectDebounce, useMountMergeState} from "./proutils";

function TableRender<T extends Record<string, any>, U, ValueType>(
  props: ProTableProps<T, U, ValueType> & {
    action: UseFetchDataAction<any>;
    tableColumn: any[];
    toolbarDom: JSX.Element | null;
    searchNode: JSX.Element | null;
    onSortChange: (sort: any) => void;
    onFilterChange: (sort: any) => void;
    getRowKey: GetRowKey<any>;
  },
) {
  const {
    rowKey,
    tableClassName,
    action,
    tableColumn: tableColumns,
    pagination,
    rowSelection,
    size,
    defaultSize,
    tableStyle,
    toolbarDom,
    searchNode,
    style,
    name,
    onSortChange,
    onFilterChange,
    options,
    className,
    getRowKey,
    ...rest
  } = props;
  const counter = Container.useContainer();

  /** 需要遍历一下，不然不支持嵌套表格 */
  const columns = useMemo(() => {
    const loopFilter = (column: any[]): any[] => {
      return column
        .map((item) => {
          // 删掉不应该显示的
          const columnKey = genColumnKey(item.key, item.index);
          const config = counter.columnsMap[columnKey];
          if (config && config.show === false) {
            return false;
          }
          if (item.children) {
            return {
              ...item,
              children: loopFilter(item.children),
            };
          }
          return item;
        })
        .filter(Boolean);
    };
    return loopFilter(tableColumns);
  }, [counter.columnsMap, tableColumns]);

  /** 如果所有列中的 filters=true| undefined 说明是用的是本地筛选 任何一列配置 filters=false，就能绕过这个判断 */
  const useLocaleFilter = useMemo(
    () =>
      columns?.every(
        (column) =>
          (column.filters === true && column.onFilter === true) ||
          (column.filters === undefined && column.onFilter === undefined),
      ),
    [columns],
  );

  const getTableProps = () => ({
    ...rest,
    size,
    rowSelection: rowSelection === false ? undefined : rowSelection,
    className: tableClassName,
    style: tableStyle,
    columns: columns.map((item) => (item.isExtraColumns ? item.extraColumn : item)),
    loading: action.loading,
    dataSource: action.dataSource,
    pagination,
    onChange: (
      changePagination: TablePaginationConfig,
      filters: Record<string, (React.Key | boolean)[] | null>,
      sorter: any,
      extra: TableCurrentDataSource<T>,
    ) => {
      rest.onChange?.(changePagination, filters, sorter, extra);
      if (!useLocaleFilter) {
        onFilterChange(omitUndefined<any>(filters));
      }
      // 制造筛选的数据
      // 制造一个排序的数据
      if (Array.isArray(sorter)) {
        const data = sorter.reduce<Record<string, any>>(
          (pre, value) => ({
            ...pre,
            [`${value.field}`]: value.order,
          }),
          {},
        );
        onSortChange(omitUndefined<any>(data));
      } else {
        const sorterOfColumn = sorter.column?.sorter;
        const isSortByField = sorterOfColumn?.toString() === sorterOfColumn;
        onSortChange(
          omitUndefined({
            [`${isSortByField ? sorterOfColumn : sorter.field}`]: sorter.order as SortOrder,
          }) || {},
        );
      }
    },
  });

  /** 默认的 table dom，如果是编辑模式，外面还要包个 form */
  const baseTableDom = <Table<T> {...getTableProps()} rowKey={rowKey} />;

  /** 自定义的 render */
  const tableDom = props.tableViewRender
    ? props.tableViewRender(
        {
          ...getTableProps(),
          rowSelection: rowSelection !== false ? rowSelection : undefined,
        },
        baseTableDom,
      )
    : baseTableDom;

  const tableContentDom = useMemo(() => {
    return (
      <>
        {toolbarDom}
        {tableDom}
      </>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.loading, tableDom, toolbarDom]);

  /** Table 区域的 dom，为了方便 render */
  const tableAreaDom = (
    <Card
      bodyStyle={
        toolbarDom
          ? {
              paddingTop: 0,
            }
          : {
              padding: 0,
            }
      }
    >
      {tableContentDom}
    </Card>
  );

  const renderTable = () => {
    if (props.tableRender) {
      return props.tableRender(props, tableAreaDom, {
        toolbar: toolbarDom || undefined,
        table: tableDom || undefined,
      });
    }
    return tableAreaDom;
  };

  const proTableDom = (
    <div
      className={classNames(className, {
        [`${className}-polling`]: action.pollingLoading,
      })}
      style={style}
      ref={counter.rootDomRef}
    >
      {searchNode}

      {renderTable()}
    </div>
  );

  // 如果不需要的全屏，ConfigProvider 没有意义
  if (!options) {
    return proTableDom;
  }
  return (
    <ConfigProvider
      getPopupContainer={() => {
        return (counter.rootDomRef.current || document.body) as any as HTMLElement;
      }}
    >
      {proTableDom}
    </ConfigProvider>
  );
}

const emptyObj = {};
 declare type ParamsType = Record<string, any>;
const ProTable = <T extends Record<string, any>, U extends ParamsType, ValueType>(
  props: ProTableProps<T, U, ValueType> & {
    defaultClassName: string;
  },
) => {
  const {
    request,
    className: propsClassName,
    params = emptyObj,
    defaultData,
    headerTitle,
    postData,
    ghost,
    pagination: propsPagination,
    actionRef: propsActionRef,
    columns: propsColumns = [],
    toolBarRender,
    onLoad,
    onRequestError,

    options,
    search,
    onLoadingChange,
    rowSelection: propsRowSelection = false,
    beforeSearchSubmit,
    defaultClassName,

    rowKey,
    polling,

    revalidateOnFocus = false,
  } = props;
  let { formRef } = props;
  const defaultRef = useRef<FormInstance>() as React.RefObject<FormInstance>;
  if (formRef == null) {
    formRef = defaultRef;
  }

  const className = classNames(defaultClassName, propsClassName);

  /** 通用的来操作子节点的工具类 */
  const actionRef = useRef<ActionType>();

  useImperativeHandle(propsActionRef, () => actionRef.current);

  /** 单选多选的相关逻辑 */
  const [selectedRowKeys, setSelectedRowKeys] = useMountMergeState<React.ReactText[] | undefined>(
    propsRowSelection ? propsRowSelection?.defaultSelectedRowKeys || [] : undefined,
    {
      value: propsRowSelection ? propsRowSelection.selectedRowKeys : undefined,
    },
  );

  const selectedRowsRef = useRef<T[]>([]);

  const setSelectedRowsAndKey = useCallback(
    (keys: React.ReactText[], rows: T[]) => {
      setSelectedRowKeys(keys);
      if (!propsRowSelection || !propsRowSelection?.selectedRowKeys) {
        selectedRowsRef.current = rows;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setSelectedRowKeys],
  );

  const [formSearch, setFormSearch] = useMountMergeState<Record<string, any> | undefined>(() => {
    // 如果手动模式，或者 search 不存在的时候设置为 undefined
    // undefined 就不会触发首次加载
    if (search !== false) {
      return undefined;
    }
    return {};
  });

  const [proFilter, setProFilter] = useMountMergeState<Record<string, React.ReactText[] | null>>(
    {},
  );
  const [proSort, setProSort] = useMountMergeState<Record<string, SortOrder>>({});

  /** 设置默认排序和筛选值 */
  useEffect(() => {
    const { sort, filter } = parseDefaultColumnConfig(propsColumns);
    setProFilter(filter);
    setProSort(sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /** 需要初始化 不然默认可能报错 这里取了 defaultCurrent 和 current 为了保证不会重复刷新 */
  const fetchPagination =
    typeof propsPagination === 'object'
      ? (propsPagination as TablePaginationConfig)
      : { defaultCurrent: 1, defaultPageSize: 20, pageSize: 20, current: 1 };

  const counter = Container.useContainer();

  // ============================ useFetchData ============================
  const fetchData = useMemo(() => {
    if (!request) return undefined;
    return async (pageParams?: Record<string, any>) => {
      const actionParams = {
        ...(pageParams || {}),
        ...formSearch,
        ...params,
      };

      // eslint-disable-next-line no-underscore-dangle
      delete (actionParams as any)._timestamp;
      const response = await request(actionParams as unknown as U, proSort, proFilter);
      return response as RequestData<T>;
    };
  }, [formSearch, params, proFilter, proSort, request]);

  const action = useFetchData(fetchData, defaultData, {
    pageInfo: propsPagination === false ? false : fetchPagination,
    loading: props.loading,
    dataSource: props.dataSource,
    onDataSourceChange: props.onDataSourceChange,
    onLoad,
    onLoadingChange,
    onRequestError,
    postData,
    revalidateOnFocus,
    manual: formSearch === undefined,
    polling,
    effects: [stringify(params), stringify(formSearch), stringify(proFilter), stringify(proSort)],
    debounceTime: props.debounceTime,
    onPageInfoChange: (pageInfo) => {
      if (!propsPagination || !fetchData) return;

      // 总是触发一下 onChange 和  onShowSizeChange
      // 目前只有 List 和 Table 支持分页, List 有分页的时候打断 Table 的分页
      propsPagination?.onChange?.(pageInfo.current, pageInfo.pageSize);
      propsPagination?.onShowSizeChange?.(pageInfo.current, pageInfo.pageSize);
    },
  });
  // ============================ END ============================

  /** SelectedRowKeys受控处理selectRows */
  const preserveRecordsRef = React.useRef(new Map<any, T>());

  // ============================ RowKey ============================
  const getRowKey = React.useMemo<GetRowKey<any>>(() => {
    if (typeof rowKey === 'function') {
      return rowKey;
    }
    return (record: T, index?: number) => {
      if (index === -1) {
        return (record as any)?.[rowKey as string];
      }
      // 如果 props 中有name 的话，用index 来做行号，这样方便转化为 index
      if (props.name) {
        return index?.toString();
      }
      return (record as any)?.[rowKey as string] ?? index?.toString();
    };
  }, [props.name, rowKey]);

  useMemo(() => {
    if (action.dataSource?.length) {
      const newCache = new Map<any, T>();
      const keys = action.dataSource.map((data) => {
        const dataRowKey = getRowKey(data, -1);
        newCache.set(dataRowKey, data);
        return dataRowKey;
      });
      preserveRecordsRef.current = newCache;
      return keys;
    }
    return [];
  }, [action.dataSource, getRowKey]);

  useEffect(() => {
    selectedRowsRef.current = selectedRowKeys!?.map(
      (key): T => preserveRecordsRef.current?.get(key) as T,
    );
  }, [selectedRowKeys]);

  /** 页面编辑的计算 */
  const pagination = useMemo(() => {
    const newPropsPagination = propsPagination === false ? false : { ...propsPagination };
    const pageConfig = {
      ...action.pageInfo,
      setPageInfo: ({ pageSize, current }: PageInfo) => {
        const { pageInfo } = action;
        // pageSize 发生改变，并且你不是在第一页，切回到第一页
        // 这样可以防止出现 跳转到一个空的数据页的问题
        if (pageSize === pageInfo.pageSize || pageInfo.current === 1) {
          action.setPageInfo({ pageSize, current });
          return;
        }

        // 通过request的时候清空数据，然后刷新不然可能会导致 pageSize 没有数据多
        action.setDataSource([]);
        action.setPageInfo({
          pageSize,
          // 目前只有 List 和 Table 支持分页, List 有分页的时候 还是使用之前的当前页码
          current: 1,
        });
      },
    };
    if (newPropsPagination) {
      delete newPropsPagination.onChange;
      delete newPropsPagination.onShowSizeChange;
    }
    return mergePagination<T>(newPropsPagination, pageConfig);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propsPagination, action]);

  useDeepCompareEffect(() => {
    // request 存在且params不为空，且已经请求过数据才需要设置。
    if (params && action.dataSource && action?.pageInfo?.current !== 1) {
      action.setPageInfo({
        current: 1,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  // 设置 name 到 store 中，里面用了 ref ，所以不用担心直接 set
  counter.setPrefixName(props.name);

  /** 清空所有的选中项 */
  const onCleanSelected = useCallback(() => {
    if (propsRowSelection && propsRowSelection.onChange) {
      propsRowSelection.onChange([], [], {
        type: 'none',
      });
    }
    setSelectedRowsAndKey([], []);
  }, [propsRowSelection, setSelectedRowsAndKey]);

  counter.setAction(actionRef.current);
  counter.propsRef.current = props;

  /** 绑定 action */
  useActionType(actionRef, action, {
    onCleanSelected: () => {
      // 清空选中行
      onCleanSelected();
    },
    resetAll: () => {
      // 清空选中行
      onCleanSelected();
      // 清空筛选
      setProFilter({});
      // 清空排序
      setProSort({});
      // 清空 toolbar 搜索
      counter.setKeyWords(undefined);
      // 重置页码
      action.setPageInfo({
        current: 1,
      });

      // 重置表单
      formRef?.current?.resetFields();
      setFormSearch({});
    },
  });

  if (propsActionRef) {
    // @ts-ignore
    propsActionRef.current = actionRef.current;
  }

  // ---------- 列计算相关 start  -----------------
  const tableColumn = useMemo(() => {
    return genProColumnToColumn<T>({
      columns: propsColumns,
      counter,
      rowKey,
      childrenColumnName: props.expandable?.childrenColumnName,
    }).sort(columnSort(counter.columnsMap));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propsColumns, counter?.sortKeyColumns, counter?.columnsMap]);

  /** Table Column 变化的时候更新一下，这个参数将会用于渲染 */
  useDeepCompareEffectDebounce(
    () => {
      if (tableColumn && tableColumn.length > 0) {
        // 重新生成key的字符串用于排序
        const columnKeys = tableColumn.map((item) => genColumnKey(item.key, item.index));
        counter.setSortKeyColumns(columnKeys);
      }
    },
    [tableColumn],
    ['render', 'renderFormItem'],
    100,
  );

  /** 同步 Pagination，支持受控的 页码 和 pageSize */
  useDeepCompareEffect(() => {
    const { pageInfo } = action;
    const { current = pageInfo?.current, pageSize = pageInfo?.pageSize } = propsPagination || {};
    if (
      propsPagination &&
      (current || pageSize) &&
      (pageSize !== pageInfo?.pageSize || current !== pageInfo?.current)
    ) {
      action.setPageInfo({
        pageSize: pageSize || pageInfo.pageSize,
        current: current || pageInfo.current,
      });
    }
  }, [propsPagination && propsPagination.pageSize, propsPagination && propsPagination.current]);

  /** 行选择相关的问题 */
  const rowSelection: TableRowSelection = {
    selectedRowKeys,
    ...propsRowSelection,
    onChange: (keys, rows, info) => {
      if (propsRowSelection && propsRowSelection.onChange) {
        propsRowSelection.onChange(keys, rows, info);
      }
      setSelectedRowsAndKey(keys, rows);
    },
  };

  const onFormSearchSubmit = <Y extends ParamsType>(values: Y): any => {
    // 判断search.onSearch返回值决定是否更新formSearch
    if (options && options.search) {
      const { name = 'keyword' } = options.search === true ? {} : options.search;

      /** 如果传入的 onSearch 返回值为 false，则不要把options.search.name对应的值set到formSearch */
      const success = (options.search as OptionSearchProps)?.onSearch?.(counter.keyWords!);

      if (success !== false) {
        setFormSearch({
          ...values,
          [name]: counter.keyWords,
        });
        return;
      }
    }

    setFormSearch(values);
  };

  const loading = useMemo(() => {
    if (typeof action.loading === 'object') {
      return action.loading?.spinning || false;
    }
    return action.loading;
  }, [action.loading]);

  const searchNode =
    search === false ? null : (
      <FormSearch<T, U>
        pagination={pagination}
        beforeSearchSubmit={beforeSearchSubmit}
        action={actionRef}
        columns={propsColumns}
        onFormSearchSubmit={(values) => {
          onFormSearchSubmit(values);
        }}
        ghost={ghost}
        onReset={props.onReset}
        onSubmit={props.onSubmit}
        loading={!!loading}
        form={props.form}
        formRef={formRef}
      />
    );

  /** 内置的工具栏 */
  const toolbarDom =
    toolBarRender === false ? null : (
      <Toolbar<T>
        headerTitle={headerTitle}
        hideToolbar={options === false && !headerTitle && !toolBarRender && !toolbar}
        selectedRows={selectedRowsRef.current}
        selectedRowKeys={selectedRowKeys!}
        tableColumn={tableColumn}
        onFormSearchSubmit={(newValues) => {
          setFormSearch({
            ...formSearch,
            ...newValues,
          });
        }}
        options={options}
        actionRef={actionRef}
        toolBarRender={toolBarRender}
      />
    );

  return (
    <TableRender
      {...props}
      size={counter.tableSize}
      onSizeChange={counter.setTableSize}
      pagination={pagination}
      searchNode={searchNode}
      rowSelection={propsRowSelection !== false ? rowSelection : undefined}
      className={className}
      tableColumn={tableColumn}
      action={action}
      toolbarDom={toolbarDom}
      onSortChange={setProSort}
      onFilterChange={setProFilter}
      getRowKey={getRowKey}
    />
  );
};

/**
 * 🏆 Use Ant Design Table like a Pro! 更快 更好 更方便
 *
 * @param props
 */
const ProviderWarp = <
  DataType extends Record<string, any>,
  Params extends ParamsType = ParamsType,
  ValueType = 'text',
>(
  props: ProTableProps<DataType, Params, ValueType>,
) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);

  return (
    <Container.Provider initialState={props}>
        <ProTable<DataType, Params, ValueType>
          defaultClassName={getPrefixCls('pro-table')}
          {...props}
        />
    </Container.Provider>
  );
};

ProviderWarp.Summary = Table.Summary;

export default ProviderWarp;
