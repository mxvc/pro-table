import {Input} from "antd";

export declare type FieldPropsType = {
    render: ((text: any) => JSX.Element) ;
    renderFormItem: ((text: any, props: {value?: any;  onChange?: (...rest: any[]) => void; fieldProps?: any}) => JSX.Element) ;
};

const valueTypeMap = {}

export function registerField(key: string, field: FieldPropsType){
    valueTypeMap[key] = field
}

export function getValueTypeMap(){
    return valueTypeMap;
}

// @ts-ignore
export function getField(key): FieldPropsType{
    return valueTypeMap[key] || valueTypeMap['default']
}


const defaultField: FieldPropsType = {
    render: (text) => text,
    renderFormItem: (text, props) => {
        return <Input value={text} onChange={props.onChange} {...props.fieldProps} />
    }
}

registerField('text', defaultField)
registerField('default', defaultField)
