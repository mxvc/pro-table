import { PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-table';
import { Button } from 'antd';
import request from 'umi-request';

const columns = [
  {
    title: '标题',
    dataIndex: 'title',
  },
  {
    title: '状态',
    dataIndex: 'state',
  },
];

export default () => {
  return (
    <ProTable
      columns={columns}
      cardBordered
      rowSelection={{}}
      request={async (params = {}, sort, filter) => {
        console.log(sort, filter);
        return request('https://proapi.azurewebsites.net/github/issues', {
          params,
        });
      }}
      rowKey="id"
      toolBarRender={() => [
        <Button key="button" icon={<PlusOutlined />} type="primary">
          新建
        </Button>,
      ]}
    />
  );
};
