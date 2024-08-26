import { omitUndefined } from '@ant-design/pro-utils';
import type { FormInstance, TablePaginationConfig } from 'antd';
import { Button, Card, Form, Space } from 'antd';
import omit from 'omit.js';
import React from 'react';
import type { ActionType, ProTableProps } from '../../typing';
import './index.less';
import { getField } from '@ant-design/pro-table';

type BaseFormProps<T, U> = {
  pagination?: TablePaginationConfig | false;
  beforeSearchSubmit?: (params: Partial<U>) => any;
  action: React.MutableRefObject<ActionType | undefined>;
  onSubmit?: (params: U) => void;
  onReset?: () => void;
  loading: boolean;
  onFormSearchSubmit: (params: U) => void;
  columns: ProTableProps<T, U, any>['columns'];

  form?: FormInstance;
  formRef: React.RefObject<any>;
};
export default class FormSearch<T, U> extends React.Component<
  BaseFormProps<T, U> & { ghost?: boolean }
> {
  /** 查询表单相关的配置 */

  onSubmit = (value: U, firstLoad: boolean) => {
    const {
      pagination,
      beforeSearchSubmit = (searchParams: Partial<U>) => searchParams,
      action,
      onSubmit,
      onFormSearchSubmit,
    } = this.props;
    // 只传入 pagination 中的 current 和 pageSize 参数
    const pageInfo = pagination
      ? omitUndefined({
          current: pagination.current,
          pageSize: pagination.pageSize,
        })
      : {};

    const submitParams = {
      ...value,
      _timestamp: Date.now(),
      ...pageInfo,
    };
    const omitParams = omit(beforeSearchSubmit(submitParams), Object.keys(pageInfo!)) as U;
    onFormSearchSubmit(omitParams);
    if (!firstLoad) {
      // back first page
      action.current?.setPageInfo?.({
        current: 1,
      });
    }
    // 不是第一次提交就不触发，第一次提交是 js 触发的
    // 为了解决 https://github.com/ant-design/pro-components/issues/579
    if (onSubmit && !firstLoad) {
      onSubmit?.(value);
    }
  };

  onReset = (value: Partial<U>) => {
    const {
      pagination,
      beforeSearchSubmit = (searchParams: Partial<U>) => searchParams,
      action,
      onFormSearchSubmit,
      onReset,
    } = this.props;
    const pageInfo = pagination
      ? omitUndefined({
          current: pagination.current,
          pageSize: pagination.pageSize,
        })
      : {};

    const omitParams = omit(
      beforeSearchSubmit({ ...value, ...pageInfo }),
      Object.keys(pageInfo!),
    ) as U;
    onFormSearchSubmit(omitParams);
    // back first page
    action.current?.setPageInfo?.({
      current: 1,
    });
    onReset?.();
  };

  render = () => {
    const { columns, loading, form } = this.props;
    if (columns == null) {
      return;
    }

    const columnsFilter = columns.filter(
      (col) => col.hideInSearch !== true && col.valueType !== 'option',
    );

    return (
      <Card style={{ marginBottom: 16 }}>
        <Form
          layout="inline"
          onFinish={(values) => this.onSubmit(values, false)}
          onReset={() => this.onReset({})}
          {...form}
          ref={this.props.formRef}
        >
          {columnsFilter.map((col, index) => {
            const label = col.title as React.ReactNode;
            const Field = getField(col.valueType);

            return (
              <Form.Item label={label} name={col.dataIndex} key={index}>
                <Field mode="edit" />
              </Form.Item>
            );
          })}

          <Space>
            <Button htmlType="reset">重置</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              查询
            </Button>
          </Space>
        </Form>
      </Card>
    );
  };
}
