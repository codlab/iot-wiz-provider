import { rgbToHsv, findChanges, hsvToColor } from "./utils";

import EventEmitter2 from "eventemitter2";
const ct = require('color-temperature');

export interface BulbParameters {
  host: string,
  port: number,
  sysInfo: any,
  status: any,
  client: any
}

export default class Bulb extends EventEmitter2 {
  constructor(params: BulbParameters) {
    super();

    const { host, port, sysInfo, status, client } = params;

    this.host = host;
    this.port = port;
    this.client = client;
    this.status = status;
    this.seenOnDiscovery = false;
    this.lightStatePromise = null;
    this.lightStatePromiseResolve = null;
    this.colorChange = null;
    this.setSysInfo(sysInfo);
  }

  get kelvinRange() {
    return {min: 2200, max: 6500};
  }

  get id() {
    return this.sysInfo.deviceId;
  }

  get UUID() {
    return this.sysInfo.deviceId;
  }

  get alias() {
    return this.sysInfo.deviceId;
  }

  get deviceId() {
    return this.sysInfo.deviceId;
  }

  // eslint-disable-next-line class-methods-use-this
  get deviceType() {
    return 'bulb';
  }

  buildState = () => {
    if (this.sysInfo === undefined)
      return {
        on_off: false,
        r: 255,
        g: 255,
        b: 255,
        brightness: 0,
      };
    const color =
      'temp' in this.sysInfo
        ? { ...rgbToHsv(ct.colorTemperature2rgb(this.sysInfo.temp)) }
        : { ...rgbToHsv(this.sysInfo) };
    return {
      on_off: this.sysInfo.state,
      brightness: Math.round(this.sysInfo.dimming * 1.1 - 10),
      ...color,
    };
  };

  setSysInfo = (sysInfo: any) => {
    const oldState = this.buildState();
    this.sysInfo = sysInfo;
    const newState = this.buildState();
    if (oldState.on_off && !newState.on_off) {
      this.emit('lightstate-off');
    } else if (!oldState.on_off && newState.on_off) {
      this.emit('lightstate-on');
    }

    const [hasChanged, diff] = findChanges(oldState, newState);
    if (hasChanged) {
      this.emit('lightstate-update', diff);
    }
  };

  getLightState = () => {
    return this.buildState();
  };

  setLightState = (state: any) => {
    let color = 'temp' in this.sysInfo ? {
      temp: this.sysInfo.temp,
    } : {
      r: this.sysInfo.r,
      g: this.sysInfo.g,
      b: this.sysInfo.b,
    };
    if ('hue' in state || 'saturation' in state) {
      if (this.colorChange === null) {
        this.colorChange = state;
        return;
      } else {
        const {hue, saturation} = {...this.colorChange, ...state};
        this.colorChange = null;
        color = hsvToColor(hue / 360, saturation / 100);
      }
    }
    const sysInfo = {
      dimming: 'brightness' in state ? Math.round((Math.max(1, state.brightness) + 10) / 1.1): this.sysInfo.dimming,
      state: state.brightness === 0 ? false : ('on_off' in state ? state.on_off : this.sysInfo.state),
      ...color,
    };
    this.client.log.debug(`Setting sysInfo to ${sysInfo}`);
    this.sysInfo = sysInfo;
    this.client.setPilot(this.host, sysInfo);
    return;
  };
}