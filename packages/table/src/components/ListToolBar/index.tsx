/**
 * 列表工具栏组件（不带业务逻辑），相当于布局文件，内容由ToolBar填充
 *
 * 原来的左右判断太复杂，调整为设置title属性，由用户自行设置
 */
import { Input, Space } from 'antd';
import type { SearchProps } from 'antd/lib/input';
import classNames from 'classnames';
import React from 'react';
import './index.less';
type SearchPropType = SearchProps | boolean;

export type ListToolBarProps = {
  prefixCls?: string;
  className?: string;
  style?: React.CSSProperties;
  /** 标题 */
  title?: React.ReactNode;

  /** 搜索输入栏相关配置 */
  search?: SearchPropType;
  /** 搜索回调 */
  onSearch?: (keyWords: string) => void;
  /** 工具栏右侧操作区 */
  actions?: React.ReactNode[];
  /** 工作栏右侧设置区 */
  settings?: React.ReactNode[];
};

export default class ListToolBar extends React.Component<ListToolBarProps> {
  static defaultProps = { actions: [], settings: [] };

  render() {
    const {
      title,
      className,
      style,
      search,
      onSearch,

      actions, // toolbarRender 的内容
      settings,
    } = this.props;

    const isMobile = window.innerWidth < 768;

    const placeholder = '搜索...';

    const prefixCls = 'ant-pro-table-list-toolbar';

    return (
      <div style={style} className={classNames(`${prefixCls}`, className)}>
        <div
          className={classNames(`${prefixCls}-container`, {
            [`${prefixCls}-container-mobile`]: isMobile,
          })}
        >
          <div className={`${prefixCls}-left`}>{title}</div>

          <Space
            className={`${prefixCls}-right`}
            direction={isMobile ? 'vertical' : 'horizontal'}
            size={16}
            align={isMobile ? 'end' : 'center'}
          >
            {search ? (
              <div className={`${prefixCls}-search`}>
                <Input.Search
                  style={{ width: 200 }}
                  placeholder={placeholder}
                  {...(search as SearchProps)}
                  onSearch={(...restParams) => {
                    onSearch?.(restParams?.[0]);
                    (search as SearchProps).onSearch?.(...restParams);
                  }}
                />
              </div>
            ) : null}

            {this.renderActions(actions)}
            {settings?.length ? (
              <Space size={12} align="center" className={`${prefixCls}-setting-items`}>
                {settings.map((setting, index) => {
                  return (
                    <div key={index} className={`${prefixCls}-setting-item`}>
                      {setting}
                    </div>
                  );
                })}
              </Space>
            ) : null}
          </Space>
        </div>
      </div>
    );
  }

  renderActions = (actions: React.ReactNode[] | undefined) => {
    if (!Array.isArray(actions)) {
      return actions;
    }
    if (actions.length < 1) {
      return null;
    }
    return (
      <Space align="center">
        {actions.map((action, index) => {
          if (!React.isValidElement(action)) {
            // eslint-disable-next-line react/no-array-index-key
            return <React.Fragment key={index}>{action}</React.Fragment>;
          }
          return React.cloneElement(action, {
            // eslint-disable-next-line react/no-array-index-key
            key: index,
            ...action?.props,
          });
        })}
      </Space>
    );
  };
}
