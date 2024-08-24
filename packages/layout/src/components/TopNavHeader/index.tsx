import { useDebounceFn } from '@ant-design/pro-utils';
import classNames from 'classnames';
import ResizeObserver from 'rc-resize-observer';
import React, { useRef, useState } from 'react';
import type { GlobalHeaderProps } from '../GlobalHeader';
import BaseMenu from '../SiderMenu/BaseMenu';
import type { PrivateSiderMenuProps, SiderMenuProps } from '../SiderMenu/SiderMenu';
import { defaultRenderLogoAndTitle } from '../SiderMenu/SiderMenu';
import './index.less';

export type TopNavHeaderProps = SiderMenuProps & GlobalHeaderProps & PrivateSiderMenuProps;

/**
 * 抽离出来是为了防止 rightSize 经常改变导致菜单 render
 *
 * @param param0
 */
export const RightContent: React.FC<TopNavHeaderProps> = ({
  rightContentRender,
  prefixCls,
  ...props
}) => {
  const [rightSize, setRightSize] = useState<number | string>('auto');

  /** 减少一下渲染的次数 */
  const setRightSizeDebounceFn = useDebounceFn(async (width: number) => {
    setRightSize(width);
  }, 160);

  return (
    <div
      className={`${prefixCls}-right-content`}
      style={{
        minWidth: rightSize,
      }}
    >
      <div
        style={{
          paddingRight: 8,
        }}
      >
        <ResizeObserver
          onResize={({ width }: { width: number }) => {
            setRightSizeDebounceFn.run(width);
          }}
        >
          {rightContentRender && (
            <div className={`${prefixCls}-right-content-resize`}>
              {rightContentRender({
                ...props,
                // 测试专用
                //@ts-ignore
                rightContentSize: rightSize,
              })}
            </div>
          )}
        </ResizeObserver>
      </div>
    </div>
  );
};

const TopNavHeader: React.FC<TopNavHeaderProps> = (props) => {
  const ref = useRef(null);
  const {
    theme,
    onMenuHeaderClick,
    contentWidth,
    rightContentRender,
    className: propsClassName,
    style,
    headerContentRender,
    layout,
  } = props;
  const prefixCls = `${props.prefixCls || 'ant-pro'}-top-nav-header`;
  const headerDom = defaultRenderLogoAndTitle(
    { ...props, collapsed: false },
    layout === 'mix' ? 'headerTitleRender' : undefined,
  );

  const className = classNames(prefixCls, propsClassName, {
    light: theme === 'light',
  });

  const defaultDom = <BaseMenu {...props} {...props.menuProps} />;

  const headerContentDom = headerContentRender
    ? headerContentRender?.(props, defaultDom)
    : defaultDom;

  return (
    <div className={className} style={style}>
      <div ref={ref} className={`${prefixCls}-main ${contentWidth === 'Fixed' ? 'wide' : ''}`}>
        {headerDom && (
          <div className={`${prefixCls}-main-left`} onClick={onMenuHeaderClick}>
            <div className={`${prefixCls}-logo`} key="logo" id="logo">
              {headerDom}
            </div>
          </div>
        )}
        <div style={{ flex: 1 }} className={`${prefixCls}-menu`}>
          {headerContentDom}
        </div>
        {rightContentRender && (
          <RightContent rightContentRender={rightContentRender} prefixCls={prefixCls} {...props} />
        )}
      </div>
    </div>
  );
};

export default TopNavHeader;
