import castArray from "lodash.castarray";

export function normalizeMac(mac = '') {
  return mac.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

export function compareMac(mac: string|undefined = '', macPattern: any) {
  const macPatterns = castArray(macPattern).map(p => {
    return new RegExp(
      `^${p
        .replace(/[^A-Za-z0-9?*]/g, '')
        .replace(/[?]/g, '.')
        .replace(/[*]/g, '.*')
        .toUpperCase()}$`
    );
  });
  const normalizedMac = normalizeMac(mac);
  return macPatterns.findIndex(p => p.test(normalizedMac)) !== -1;
}


export function findChanges(a: any, b: any) {
    let changed = false;
    const diff = {};
    (new Set([...Object.keys(a), ...Object.keys(b)])).forEach(key => {
      if (a[key] !== b[key] && b[key] !== undefined) {
        changed = true;
        diff[key] = b[key];
      } 
    });
    return [changed, diff];
  }

  
  // from https://gist.github.com/mjackson/5311256
  export function rgbToHsv({ r, g, b, red, green, blue }) {
    r = red || r;
    g = green || g;
    b = blue || b;
    (r /= 255), (g /= 255), (b /= 255);

    var max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    var h,
      s,
      v = max;

    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if (max == min) {
      h = 0; // achromatic
    } else {
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }

      h /= 6;
    }
    return { hue: Math.round(h * 360), saturation: Math.round(s * 100) };
  }

export function hsvToColor(h, s) {
    // First, convert to RGB
    const v = 1;
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch (i % 6) {
      case 0:
        (r = v), (g = t), (b = p);
        break;
      case 1:
        (r = q), (g = v), (b = p);
        break;
      case 2:
        (r = p), (g = v), (b = t);
        break;
      case 3:
        (r = p), (g = q), (b = v);
        break;
      case 4:
        (r = t), (g = p), (b = v);
        break;
      case 5:
        (r = v), (g = p), (b = q);
        break;
    }
    const rgb = { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };

    // See if it might actually be a color temperature
    const h360 = h * 360;
    const s100 = s * 100;
    if (
      (h360 >= 0 && h360 <= 30 && s100 >= 0 && s100 <= 76) ||
      (h360 >= 220 && h360 <= 360 && s100 >= 0 && s100 <= 25)
    ) {
      const possibleKelvin = ct.rgb2colorTemperature({
        red: rgb.r,
        green: rgb.g,
        blue: rgb.b
      });
      this.client.log.debug(`Considering possible Kelvin conversio of ${possibleKelvin}`);
      // check if bulb supports it
      if (possibleKelvin >= this.kelvinRange.min && possibleKelvin <= this.kelvinRange.max) {
        return { temp: possibleKelvin };
      }
    }

    return rgb;
  }