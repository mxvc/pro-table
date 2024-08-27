import React from "react";
import {Input} from "antd";
import {FieldProps} from "../valueType";

export default class  extends React.Component<FieldProps, any> {
    render() {
        if (this.props.mode == 'read') {
            return this.props.value;
        }

        return (
            <Input value={this.props.value} onChange={this.props.onChange} {...this.props.fieldProps} />
        );
    }
}
