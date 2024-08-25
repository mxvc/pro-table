import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons';
import { isBrowser } from '@ant-design/pro-utils';
import { Tooltip } from 'antd';
import React from 'react';

class FullScreenIcon extends React.Component {

  state = {
    fullscreen:false
  }

  componentDidMount() {
    if (!isBrowser()) {
      return;
    }
    document.onfullscreenchange = () => {
      this.setState({
        fullscreen:!!document.fullscreenElement
      })
    };
  }

  render() {
    return this.state.fullscreen ? (
        <Tooltip title='退出全屏'>
          <FullscreenExitOutlined/>
        </Tooltip>
    ) : (
        <Tooltip title='全屏'>
          <FullscreenOutlined/>
        </Tooltip>
    );
  }
}

export default React.memo(FullScreenIcon);
