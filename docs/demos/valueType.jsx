import { ProTable } from '@tmgg/pro-table';
import request from 'umi-request';

export default () => {
  return (
    <>
      <ProTable
        columns={[
          {
            title: '标题',
            dataIndex: 'title',
          },

          {
            title: 'locked(switch）',
            dataIndex: 'locked',
            valueType: 'switch',
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
