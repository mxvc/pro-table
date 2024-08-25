import {PlusOutlined} from '@ant-design/icons';
import {ProTable} from '@ant-design/pro-table';
import {Button} from 'antd';
import request from 'umi-request';


const columns = [
    {
        title: '标题',
        dataIndex: 'title',
    },
    {
        title: '状态',
        dataIndex: 'state',
        valueType: 'select',
        valueEnum: {
            all: {text: '超长'.repeat(50)},
            open: {
                text: '未解决',
                status: 'Error',
            },
            closed: {
                text: '已解决',
                status: 'Success',
                disabled: true,
            },
            processing: {
                text: '解决中',
                status: 'Processing',
            },
        },
    },

    {
        title: '创建时间',
        key: 'showTime',
        dataIndex: 'created_at',
        valueType: 'dateTime',
        sorter: true,
        hideInSearch: true,
    },
    {
        title: '创建时间',
        dataIndex: 'created_at',
        valueType: 'dateRange',
        hideInTable: true,
        search: {
            transform: (value) => {
                return {
                    startTime: value[0],
                    endTime: value[1],
                };
            },
        },
    },
    {
        title: '操作',
        valueType: 'option',
        key: 'option',
        render: (text, record, _, action) => [
            <a key="view">
                查看
            </a>,


        ],
    },
];


export default () => {
    return (
        <ProTable
            columns={columns}
            request={async (params = {}, sort, filter) => {
                console.log(sort, filter);
                return request('https://proapi.azurewebsites.net/github/issues', {
                    params,
                });
            }}
            tooltip='1'
            headerTitle='你好2'
            options={{
                search:true,
            }}
            pagination={{pageSize:5}}
            rowKey="id"
            toolBarRender={() => [
                <Button key="button" icon={<PlusOutlined/>} type="primary">
                    新建
                </Button>,
            ]}
        />
    );
};
