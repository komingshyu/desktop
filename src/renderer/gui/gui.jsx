import React from 'react';
import ReactDOM from 'react-dom';
import {ipcRenderer} from 'electron';
import {compose} from 'redux';
import GUI from 'scratch-gui';
import {AppStateHOC} from 'scratch-gui';
import AddonLoaderHOC from '../../addons/loader.jsx';

require('./update-checker');
require('./filesystem-api-impl');
require('./prompt-impl');

const onStorageInit = (storage) => {
  storage.addWebStore(
    [storage.AssetType.ImageVector, storage.AssetType.ImageBitmap, storage.AssetType.Sound],
    asset => `library-files/${asset.assetId}.${asset.dataFormat}`
  );
};

const onLoadAddons = () => {
  require('../../addons/index');
};

const onClickLogo = () => {
  ipcRenderer.send('about');
};

const darkModeMedia = window.matchMedia('(prefers-color-scheme: dark)');
darkModeMedia.onchange = () => document.body.setAttribute('theme', darkModeMedia.matches ? 'dark' : 'light');
darkModeMedia.onchange();

const DesktopHOC = function (WrappedComponent) {
  class DesktopComponent extends React.Component {
    render() {
      return (
        <WrappedComponent
          projectId="0"
          canEditTitle
          isScratchDesktop
          canModifyCloudData={false}
          onStorageInit={onStorageInit}
          onLoadAddons={onLoadAddons}
          onClickLogo={onClickLogo}
        />
      );
    }
  }
  return DesktopComponent;
};

const WrappedGUI = compose(
  AppStateHOC,
  DesktopHOC,
  AddonLoaderHOC
)(GUI);

ReactDOM.render(<WrappedGUI />, require('../app-target'));

export default WrappedGUI;