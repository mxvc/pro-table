import type { MenuDataItem } from '@ant-design/pro-components';
import { PageContainer, ProLayout } from '@ant-design/pro-components';
import { Input } from 'antd';
import { useState } from 'react';
import complexMenu from './complexMenu';

const filterByMenuDate = (data: MenuDataItem[], keyWord: string): MenuDataItem[] =>
  data
    .map((item) => {
      if (
        (item.name && item.name.includes(keyWord)) ||
        filterByMenuDate(item.routes || [], keyWord).length > 0
      ) {
        return {
          ...item,
          children: filterByMenuDate(item.children || [], keyWord),
          routes: filterByMenuDate(item.routes || [], keyWord),
        };
      }

      return undefined;
    })
    .filter((item) => item) as MenuDataItem[];

export default () => {
  const [keyWord, setKeyWord] = useState('');
  return (
    <div
      style={{
        height: '100vh',
      }}
    >
      <ProLayout
        location={{
          pathname: '/home/overview',
        }}
        menuExtraRender={({ collapsed }) =>
          !collapsed && (
            <Input.Search
              onSearch={(e) => {
                setKeyWord(e);
              }}
            />
          )
        }
        menuDataRender={() => complexMenu}
        postMenuData={(menus) => filterByMenuDate(menus || [], keyWord)}
      >
        <PageContainer content="欢迎使用">
          <div>Hello World</div>
        </PageContainer>
      </ProLayout>
    </div>
  );
};
