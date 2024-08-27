import { ProTable } from '@ant-design/pro-table';
import request from 'umi-request';
import { Checkbox } from 'antd';
import React from 'react';
import { registerField } from '@ant-design/pro-table';

class CheckboxFormField extends React.Component {
  render() {
    if (this.props.mode === 'read') {
      return this.props.value ? '是' : '否';
    }

    return (
      <Checkbox
        indeterminate={this.props.value == null}
        checked={this.props.value}
        onChange={(e) => this.props.onChange(e.target.checked)}
      ></Checkbox>
    );
  }
}

registerField('booleanX', CheckboxFormField);

export default () => {
  return (
    <>
      <ProTable
        columns={[
          {
            title: 'locked',
            dataIndex: 'locked',
            valueType: 'booleanX',
          },
        ]}
        request={async (params = {}, sort, filter) => {
          console.log(sort, filter);
          return request('https://proapi.azurewebsites.net/github/issues', {
            params,
          });
        }}
        pagination={{ pageSize: 5 }}
        rowKey="id"
      />
    </>
  );
};
