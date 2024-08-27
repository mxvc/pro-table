import React from "react";
import {Checkbox} from "antd";

 export default class  extends React.Component {

    render() {
        if (this.props.mode === 'read') {
            return this.props.value ? '是' : '否';
        }

        return (
            <Checkbox
                indeterminate={this.props.value == null}
                checked={this.props.value}
                onChange={(e) => this.props.onChange(e.target.checked)}
            ></Checkbox>
        );
    }

}
