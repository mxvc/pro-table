import { Alert, ConfigProvider, Space } from 'antd';
import React, { useContext } from 'react';
import './index.less';

export type AlertRenderType<T> =
  | ((props: {
      selectedRowKeys: (number | string)[];
      selectedRows: T[];
      onCleanSelected: () => void;
    }) => React.ReactNode)
  | false;

export type TableAlertProps<T> = {
  selectedRowKeys: (number | string)[];
  selectedRows: T[];
  alwaysShowAlert?: boolean;
  alertInfoRender?: AlertRenderType<T>;
  onCleanSelected: () => void;
  alertOptionRender?: AlertRenderType<T>;
};

const defaultAlertOptionRender = (props: {  onCleanSelected: () => void }) => {
  const { onCleanSelected } = props;
  return [
    <a onClick={onCleanSelected} key="0">
     清空
    </a>,
  ];
};

function TableAlert<T>({
  selectedRowKeys = [],
  onCleanSelected,
  alwaysShowAlert,
  selectedRows,
  alertInfoRender = ({  }) => (
    <Space>
      已选择
      {selectedRowKeys.length}
      项&nbsp;&nbsp;
    </Space>
  ),
  alertOptionRender = defaultAlertOptionRender,
}: TableAlertProps<T>) {

  const option =
    alertOptionRender &&
    alertOptionRender({
      onCleanSelected,
      selectedRowKeys,
      selectedRows,
    });

  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const className = getPrefixCls('pro-table-alert');
  if (alertInfoRender === false) {
    return null;
  }
  const dom = alertInfoRender({ selectedRowKeys, selectedRows, onCleanSelected });

  if (dom === false || (selectedRowKeys.length < 1 && !alwaysShowAlert)) {
    return null;
  }
  return (
    <div className={className}>
      <Alert
        message={
          <div className={`${className}-info`}>
            <div className={`${className}-info-content`}>{dom}</div>
            {option ? <div className={`${className}-info-option`}>{option}</div> : null}
          </div>
        }
        type="info"
      />
    </div>
  );
}

export default TableAlert;
