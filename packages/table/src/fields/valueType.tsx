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




