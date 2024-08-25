/**
 * 列表工具栏组件（不带业务逻辑），相当于布局文件，内容由ToolBar填充
 *
 * 原来的左右判断太复杂，调整为设置title属性，由用户自行设置
 */
import {Input, Space} from 'antd';
import type {SearchProps} from 'antd/lib/input';
import classNames from 'classnames';
import React, {useMemo} from 'react';
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
const ListToolBar: React.FC<ListToolBarProps> = ({
                                                     title,
                                                     className,
                                                     style,
                                                     search,
                                                     onSearch,

                                                     actions = [], // toolbarRender 的内容
                                                     settings = [],
                                                 }) => {

    const width = window.innerWidth;
    const isMobile = width < 768;

    const placeholder = '搜索...';

    const prefixCls = 'ant-pro-table-list-toolbar';



    /** 没有 key 的时候帮忙加一下 key 不加的话很烦人 */
    const actionDom = useMemo(() => {

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
    }, [actions]);


    const leftTitleDom = <div className={`${prefixCls}-left`}>{title}</div>;
    const rightTitleDom = useMemo(() => {
        return (
            <Space
                className={`${prefixCls}-right`}
                direction={isMobile ? 'vertical' : 'horizontal'}
                size={16}
                align={isMobile ? 'end' : 'center'}
            >
                {search ? <div className={`${prefixCls}-search`}>
                    <Input.Search
                        style={{width: 200}}
                        placeholder={placeholder}
                        {...(search as SearchProps)}
                        onSearch={(...restParams) => {
                            onSearch?.(restParams?.[0]);
                            (search as SearchProps).onSearch?.(...restParams);
                        }}
                    />
                </div> : null}

                {actionDom}
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
        );
    }, [
        actionDom,
        isMobile,
        prefixCls,
        settings,
    ]);


    return (
        <div style={style} className={classNames(`${prefixCls}`, className)}>
            <div className={classNames(`${prefixCls}-container`, {[`${prefixCls}-container-mobile`]: isMobile})}>
                {leftTitleDom}
                {rightTitleDom}
            </div>
        </div>
    );
};

export default ListToolBar;
