import { FieldLabel, parseValueToMoment } from '@ant-design/pro-utils';
import { ConfigProvider, DatePicker, TimePicker } from 'antd';
import moment from 'moment';
import React, { useContext, useState } from 'react';
import type { ProFieldFC, ProFieldLightProps } from '../../index';

/**
 * 时间选择组件
 *
 * @param
 */
const FieldTimePicker: ProFieldFC<
  {
    text: string | number;
    format: string;
  } & ProFieldLightProps
> = (
  {
    text,
    mode,
    light,
    label,
    format,
    render,
    renderFormItem,
    plain,
    fieldProps,
    lightLabel,
    labelTrigger,
  },
  ref,
) => {
  const [open, setOpen] = useState<boolean>(false);
  const size = useContext(ConfigProvider.SizeContext);
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('pro-field-date-picker');

  const finalFormat = fieldProps?.format || format || 'HH:mm:ss';

  const isNumberOrMoment = moment.isMoment(text) || typeof text === 'number';

  if (mode === 'read') {
    const dom = (
      <span ref={ref}>
        {text ? moment(text, isNumberOrMoment ? undefined : finalFormat).format(finalFormat) : '-'}
      </span>
    );
    if (render) {
      return render(text, { mode, ...fieldProps }, <span>{dom}</span>);
    }
    return dom;
  }
  if (mode === 'edit' || mode === 'update') {
    let dom;
    const { disabled, onChange, placeholder, allowClear, value } = fieldProps;
    const momentValue = parseValueToMoment(value, finalFormat) as moment.Moment;
    if (light) {
      const valueStr: string = (momentValue && momentValue.format(finalFormat)) || '';
      dom = (
        <div
          className={`${prefixCls}-light`}
          onClick={(e) => {
            // 点击label切换下拉菜单
            const isLabelClick = lightLabel?.current?.labelRef?.current?.contains(
              e.target as HTMLElement,
            );
            if (isLabelClick) {
              setOpen(!open);
            } else {
              setOpen(true);
            }
          }}
        >
          <TimePicker
            value={momentValue}
            format={format}
            ref={ref}
            {...fieldProps}
            onChange={(v) => {
              onChange?.(v);
              setTimeout(() => {
                setOpen(false);
              }, 0);
            }}
            onOpenChange={(isOpen) => {
              if (!labelTrigger) {
                setOpen(isOpen);
              }
            }}
            open={open}
          />
          <FieldLabel
            label={label}
            disabled={disabled}
            placeholder={placeholder}
            size={size}
            value={valueStr}
            allowClear={allowClear}
            onClear={() => onChange?.(null)}
            expanded={open}
            ref={lightLabel}
          />
        </div>
      );
    } else {
      dom = (
        <DatePicker.TimePicker
          ref={ref}
          format={format}
          bordered={plain === undefined ? true : !plain}
          {...fieldProps}
          value={momentValue}
        />
      );
    }
    if (renderFormItem) {
      return renderFormItem(text, { mode, ...fieldProps }, dom);
    }
    return dom;
  }
  return null;
};

/**
 * 时间区间选择
 *
 * @param param0
 * @param ref
 */
const FieldTimeRangePicker: ProFieldFC<{
  text: React.ReactText[];
  format: string;
}> = ({ text, mode, format, render, renderFormItem, plain, fieldProps }) => {
  const finalFormat = fieldProps?.format || format || 'HH:mm:ss';
  const [startText, endText] = Array.isArray(text) ? text : [];
  const startTextIsNumberOrMoment = moment.isMoment(startText) || typeof startText === 'number';
  const endTextIsNumberOrMoment = moment.isMoment(endText) || typeof endText === 'number';

  const parsedStartText: string = startText
    ? moment(startText, startTextIsNumberOrMoment ? undefined : finalFormat).format(finalFormat)
    : '';
  const parsedEndText: string = endText
    ? moment(endText, endTextIsNumberOrMoment ? undefined : finalFormat).format(finalFormat)
    : '';

  if (mode === 'read') {
    const dom = (
      <div>
        <div>{parsedStartText || '-'}</div>
        <div>{parsedEndText || '-'}</div>
      </div>
    );
    if (render) {
      return render(text, { mode, ...fieldProps }, <span>{dom}</span>);
    }
    return dom;
  }
  if (mode === 'edit' || mode === 'update') {
    const { value } = fieldProps;
    const momentValue = parseValueToMoment(value, finalFormat) as moment.Moment[];

    const dom = (
      <TimePicker.RangePicker
        format={format}
        bordered={plain === undefined ? true : !plain}
        {...fieldProps}
        value={momentValue}
      />
    );
    if (renderFormItem) {
      return renderFormItem(text, { mode, ...fieldProps }, dom);
    }
    return dom;
  }
  return null;
};

export { FieldTimeRangePicker };

export default React.forwardRef(FieldTimePicker);
