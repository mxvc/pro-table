import { Input } from 'antd';
import React from 'react';

const valueTypeMap = new Map();

export function registerField(key: string, field:any) {
  valueTypeMap.set(key,field)
}

export function getValueTypeMap() {
  return valueTypeMap;
}

export function getField(key: string) {
  return valueTypeMap.get(key) || valueTypeMap.get('text')
}

export declare type FieldProps = {
  mode: 'read' | 'edit';
  value: any;
  onChange: any;
  fieldProps: any;
};

class FieldText extends React.Component<FieldProps, any> {
  render() {
    if (this.props.mode == 'read') {
      return this.props.value;
    }

    return (
      <Input value={this.props.value} onChange={this.props.onChange} {...this.props.fieldProps} />
    );
  }
}

registerField('text', FieldText);
