import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import addons from '../addon-manifests';
import getAddonTranslations from '../get-addon-translations';
import SettingsStore from '../settings-store';
import styles from './settings.css';

const urlParameters = new URLSearchParams(location.search);
const locale = urlParameters.get('locale') || 'en';
const addonTranslations = getAddonTranslations(locale);

const settingsTranslations = require('../settings-l10n/en.json');
if (locale !== 'en') {
  try {
    Object.assign(settingsTranslations, require(`../settings-l10n/${locale}.json`));
  } catch (e) {
    // ignore
  }
}

const nbsp = '\u00a0';

const AddonCredits = ({credits}) => (
  credits.map((author, index) => {
    const isLast = index === credits.length - 1;
    return (
      <span
        className={styles.credit}
        key={index}
      >
        <a
          href={author.link}
          target="_blank"
          rel="noreferrer"
        >
          {author.name}
        </a>
        {isLast ? null : ', '}
      </span>
    );
  })
);
AddonCredits.propTypes = {
  credits: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    link: PropTypes.string
  }))
};

const SettingComponent = ({
  addonId,
  setting,
  value
}) => {
  const settingId = setting.id;
  const settingName = addonTranslations[`${addonId}/@settings-name-${settingId}`] || setting.name;
  return (
    <div
      className={styles.setting}
    >
      {setting.type === 'boolean' && (
        <label>
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => SettingsStore.setAddonSetting(addonId, settingId, e.target.checked)}
          />
          {nbsp}
          {settingName}
        </label>
      )}
      {setting.type === 'integer' && (
        <label>
          <input
            type="number"
            min={setting.min}
            max={setting.max}
            step="1"
            value={value}
            onChange={(e) => SettingsStore.setAddonSetting(addonId, settingId, +e.target.value)}
          />
          {nbsp}
          {settingName}
        </label>
      )}
      {setting.type === 'color' && (
        <label>
          <input
            type="color"
            value={value}
            onChange={(e) => SettingsStore.setAddonSetting(addonId, settingId, e.target.value)}
          />
          {nbsp}
          {settingName}
        </label>
      )}
      {setting.type === 'select' && (
        <label>
          <select onChange={(e) => SettingsStore.setAddonSetting(addonId, settingId, e.target.value)}>
            {setting.potentialValues.map((value) => {
              const valueId = value.id;
              const valueName = addonTranslations[`${addonId}/@settings-select-${settingId}-${valueId}`] || value.name;
              return (
                <option
                  key={valueId}
                  value={valueId}
                >
                  {valueName}
                </option>
              );
            })}
          </select>
          {nbsp}
          {settingName}
        </label>
      )}
    </div>
  );
};
SettingComponent.propTypes = {
  addonId: PropTypes.string,
  setting: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string
  }),
  value: PropTypes.any
};

const NoticeComponent = ({
  addonId,
  notice
}) => {
  const noticeId = notice.id;
  const text = addonTranslations[`${addonId}/@info-${noticeId}`] || notice.text;
  return (
    <div
      className={styles.notice}
      type={notice.type}
    >
      {settingsTranslations["tw.addons.settings.notice.info"]}
      {text}
    </div>
  );
};
NoticeComponent.propTypes = {
  addonId: PropTypes.string,
  notice: PropTypes.shape({
    type: PropTypes.string,
    text: PropTypes.string,
    id: PropTypes.string
  })
};

const PresetComponent = ({
  addonId,
  presets
}) => (
  <select
    className={styles.presets}
    onChange={(e) => SettingsStore.applyAddonPreset(addonId, e.target.value)}
    value="_presets"
  >
    <option
      disabled
      value="_presets"
    >
      {settingsTranslations['tw.addons.settings.presets']}
    </option>
    {presets.map((preset) => {
      const presetId = preset.id;
      const name = addonTranslations[`${addonId}/@preset-name-${presetId}`] || preset.name;
      const description = addonTranslations[`${addonId}/@preset-name-${presetId}`] || preset.name;
      return (
        <option
          key={presetId}
          value={presetId}
        >
          {name}
        </option>
      );
    })}
  </select>
);
PresetComponent.propTypes = {
  addonId: PropTypes.string,
  presets: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    id: PropTypes.string,
    description: PropTypes.string,
    values: PropTypes.object
  }))
};

const AddonComponent = ({
  id,
  settings,
  manifest
}) => (
  <div className={classNames(styles.addon, {[styles.addonDirty]: settings.dirty})}>
    <label className={styles.addonTitle}>
      <input
        type="checkbox"
        onChange={(e) => SettingsStore.setAddonEnabled(id, e.target.checked)}
        checked={settings.enabled}
      />
      {nbsp}
      {addonTranslations[`${id}/@name`] || manifest.name}
    </label>
    {settings.enabled && (
      <div className={styles.side}>
        {manifest.presets && (
          <PresetComponent
            addonId={id}
            presets={manifest.presets}
          />
        )}
        {manifest.settings && (
          <button
            className={styles.resetButton}
            onClick={() => SettingsStore.resetAddon(id)}
          >
            {settingsTranslations['tw.addons.settings.reset']}
          </button>
        )}
      </div>
    )}
    <div className={styles.description}>
      {addonTranslations[`${id}/@description`] || manifest.description}
    </div>
    {settings.enabled && (
      <div>
        {/* notices are temporarily disabled because they're currently only used to notify a refresh is required */}
        {/* we already handle notifying users of that different than upstream */}
        {/* {manifest.info && (
          <div className={styles.noticeContainer}>
            {manifest.info.map((info) => (
              <NoticeComponent
                key={info.id}
                addonId={id}
                notice={info}
              />
            ))}
          </div>
        )} */}
        {manifest.credits && (
          <div className={styles.credits}>
            {settingsTranslations["tw.addons.settings.credits"]}
            <AddonCredits credits={manifest.credits} />
          </div>
        )}
        {manifest.settings && (
          <div className={styles.settingContainer}>
            {manifest.settings.map((setting) => (
              <SettingComponent
                key={setting.id}
                addonId={id}
                setting={setting}
                value={settings[setting.id]}
              />
            ))}
          </div>
        )}
      </div>
    )}
  </div>
);
AddonComponent.propTypes = {
  id: PropTypes.string,
  settings: PropTypes.object,
  manifest: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    info: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string
    })),
    settings: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string
    })),
    presets: PropTypes.array
  })
};

const DirtyComponent = (props) => (
  <div className={styles.dirtyOuter}>
    <div className={styles.dirtyInner}>
      {settingsTranslations["tw.addons.settings.dirty"]}
      {props.onReloadNow && (
        <button
          className={styles.dirtyButton}
          onClick={props.onReloadNow}
        >
          {settingsTranslations["tw.addons.settings.dirtyButton"]}
        </button>
      )}
    </div>
  </div>
);
DirtyComponent.propTypes = {
  onReloadNow: PropTypes.func
};

class AddonSettingsComponent extends React.Component {
  constructor (props) {
    super(props);
    this.handleSettingStoreChanged = this.handleSettingStoreChanged.bind(this);
    this.handleReloadNow = this.handleReloadNow.bind(this);
    this.handleResetAll = this.handleResetAll.bind(this);
    this.state = {
      dirty: false
    };
    for (const [id, manifest] of Object.entries(this.props.addons)) {
      const addonState = {
        enabled: SettingsStore.getAddonEnabled(id),
        dirty: false
      };
      if (manifest.settings) {
        for (const setting of manifest.settings) {
          addonState[setting.id] = SettingsStore.getAddonSetting(id, setting.id);
        }
      }
      this.state[id] = addonState;
    }
    this.changeTimeout = null;
  }
  componentDidMount () {
    SettingsStore.addEventListener('setting-changed', this.handleSettingStoreChanged);
  }
  componentWillUnmount () {
    SettingsStore.removeEventListener('setting-changed', this.handleSettingStoreChanged);
  }
  handleSettingStoreChanged (e) {
    const {addonId, settingId, value, reloadRequired} = e.detail;
    this.setState((state) => ({
      [addonId]: {
        ...state[addonId],
        [settingId]: value
      }
    }));
    if (reloadRequired) {
      this.setState((state) => ({
        [addonId]: {
          ...state[addonId],
          dirty: true
        }
      }));
      this.setState({
        dirty: true
      });
    }
    if (this.props.onSettingsChanged) {
      this.props.onSettingsChanged();
    }
  }
  handleReloadNow () {
    this.props.onReloadNow();
    this.setState({
      dirty: false
    });
    for (const addonId of Object.keys(addons)) {
      if (this.state[addonId].dirty) {
        this.setState((state) => ({
          [addonId]: {
            ...state[addonId],
            dirty: false
          }
        }));
      }
    }
  }
  handleResetAll () {
    if (confirm(settingsTranslations['tw.addons.settings.confirmResetAll'])) {
      SettingsStore.resetAllAddons();
    }
  }
  render () {
    return (
      <div>
        {this.state.dirty && (
          <DirtyComponent
            onReloadNow={this.props.onReloadNow && this.handleReloadNow}
          />
        )}
        <div className={styles.addonContainer}>
          {Object.entries(this.props.addons).map(([id, manifest]) => {
            const state = this.state[id];
            return (
              <AddonComponent
                key={id}
                id={id}
                settings={state}
                manifest={manifest}
              />
            );
          })}
          <button
            className={styles.resetAllButton}
            onClick={this.handleResetAll}
          >
            {settingsTranslations["tw.addons.settings.resetAll"]}
          </button>
        </div>
      </div>
    );
  }
}
AddonSettingsComponent.propTypes = {
  addons: PropTypes.object,
  onReloadNow: PropTypes.func,
  onSettingsChanged: PropTypes.func
};
AddonSettingsComponent.defaultProps = {
  addons
};

export default AddonSettingsComponent;