import { ColumnHeightOutlined } from '@ant-design/icons';
import { Dropdown, Menu, Tooltip } from 'antd';
import React from 'react';
import Container from '../../container';

export type DensitySize = 'middle' | 'small' | 'large' | undefined;

const DensityIcon = () => {
  const counter = Container.useContainer();
  return (
    <Dropdown
      overlay={
        <Menu
          selectedKeys={[counter.tableSize as string]}
          onClick={({ key }) => {
            counter.setTableSize?.(key as DensitySize);
          }}
          style={{
            width: 120,
          }}
          items={[
            { key: 'large', label:  '很大' },
            { key: 'middle', label: '中等' },
            { key: 'small', label: '紧凑' },
          ]}
        />
      }
      trigger={['click']}
    >
      <Tooltip title='表格密度'>
        <ColumnHeightOutlined />
      </Tooltip>
    </Dropdown>
  );
};

export default React.memo(DensityIcon);
