import {ProTable} from '@ant-design/pro-table';
import {ProProvider} from '@ant-design/pro-provider'
import request from 'umi-request';
import {Checkbox} from "antd";
import React from "react";


class CheckboxFormField extends React.Component {

    render() {

        return <Checkbox indeterminate={this.props.value == null} checked={this.props.value} onChange={e => this.props.onChange(e.target.checked)}></Checkbox>
    }
}


export default () => {
    return (
        <>
            <ProProvider.Provider value={{
                valueTypeMap: {
                    boolean: {
                        render: (text) => text ? '是' : '否',
                        renderFormItem: (text, props) => (
                             <CheckboxFormField {...props.fieldProps}/>
                        ),
                    }
                }
            }}>


                <ProTable
                    columns={[
                        {
                            title: '标题',
                            dataIndex: 'title',
                        },


                        {
                            title: 'locked',
                            dataIndex: 'locked',
                            valueType: 'boolean',
                        },

                    ]}
                    request={async (params = {}, sort, filter) => {
                        console.log(sort, filter);
                        return request('https://proapi.azurewebsites.net/github/issues', {
                            params,
                        });
                    }}
                    pagination={{pageSize: 5}}
                    rowKey="id"
                />


            </ProProvider.Provider>


        </>
    );
};
