import {Input} from "antd";
import React from "react";



const valueTypeMap = {}

// @ts-ignore
export function registerField(key, field){
    valueTypeMap[key] = field
}

export function getValueTypeMap(){
    return valueTypeMap;
}

// @ts-ignore
export function getField(key){
    return valueTypeMap[key] || valueTypeMap['text']
}


export declare type FieldProps =  {
    mode: 'read'| 'edit'
    value: any
    onChange: any
    fieldProps:any
}

class FieldText extends React.Component<FieldProps, any>{

    render() {
        if(this.props.mode == 'read'){
            return this.props.value;
        }

        return <Input value={this.props.value} onChange={this.props.onChange} {...this.props.fieldProps} />
    }
}



registerField('text', FieldText)
