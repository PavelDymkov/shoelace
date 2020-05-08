import { Component, Prop, State, h } from '@stencil/core';
import color from 'color';
import { clamp } from '../../utilities/math';

@Component({
  tag: 'sl-color-picker',
  styleUrl: 'color-picker.scss',
  shadow: true
})
export class ColorPicker {
  alphaSlider: HTMLElement;
  alphaHandle: HTMLElement;
  grid: HTMLElement;
  gridHandle: HTMLElement;
  hueSlider: HTMLElement;
  hueHandle: HTMLElement;
  input: HTMLSlInputElement;
  menu: HTMLElement;
  trigger: HTMLElement;

  constructor() {
    this.handleHueInput = this.handleHueInput.bind(this);
    this.handleSaturationInput = this.handleSaturationInput.bind(this);
    this.handleLightnessInput = this.handleLightnessInput.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
    this.handleAlphaInput = this.handleAlphaInput.bind(this);
    this.handleAlphaDrag = this.handleAlphaDrag.bind(this);
    this.handleAlphaKeyDown = this.handleAlphaKeyDown.bind(this);
    this.handleGridDrag = this.handleGridDrag.bind(this);
    this.handleGridKeyDown = this.handleGridKeyDown.bind(this);
    this.handleHueDrag = this.handleHueDrag.bind(this);
    this.handleHueKeyDown = this.handleHueKeyDown.bind(this);
    this.handleUserChange = this.handleUserChange.bind(this);
  }

  @State() hue = 0;
  @State() saturation = 100;
  @State() lightness = 100;
  @State() alpha = 100;

  /** The current color. */
  @Prop({ mutable: true, reflect: true }) value = '';

  /**
   * The format to use for the generated color `value`. If opacity is enabled, these will translate to HEXA, RGBA, and
   * HSLA respectively. Note that browser support for HEXA doesn't include pre-Chromium Edge, so it's usually safer to
   * use RGBA or HSLA when using opacity.
   */
  @Prop() format: 'hex' | 'rgb' | 'hsl' = 'hex';

  /** Whether to show the opacity slider. */
  @Prop() opacity = false;

  /** An array of predefined color swatches to display. */
  @Prop() swatches = [
    '#d0021b',
    '#f5a623',
    '#f8e71c',
    '#8b572a',
    '#7ed321',
    '#417505',
    '#bd10e0',
    '#9013fe',
    '#4a90e2',
    '#50e3c2',
    '#b8e986',
    '#000',
    '#444',
    '#888',
    '#ccc',
    '#fff'
  ];

  componentWillLoad() {
    this.setColor(`hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${this.alpha}%)`);
  }

  handleHueInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.hue = clamp(Number(target.value), 0, 360);
  }

  handleSaturationInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.saturation = clamp(Number(target.value), 0, 100);
  }

  handleLightnessInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.lightness = clamp(Number(target.value), 0, 100);
  }

  handleAlphaInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.alpha = clamp(Number(target.value), 0, 100);
  }

  handleAlphaDrag(event: any) {
    const container = this.alphaSlider;
    const { width } = container.getBoundingClientRect();

    this.alphaHandle.focus();
    event.preventDefault();

    this.handleDrag(event, container, x => {
      this.alpha = clamp(Math.round((x / width) * 100), 0, 100);
      this.syncInputValue();
    });
  }

  handleHueDrag(event: any) {
    const container = this.hueSlider;
    const { width } = container.getBoundingClientRect();

    this.hueHandle.focus();
    event.preventDefault();

    this.handleDrag(event, container, x => {
      this.hue = clamp(Math.round((x / width) * 360), 0, 360);
      this.syncInputValue();
    });
  }

  handleGridDrag(event: any) {
    const container = this.grid;
    const { width, height } = container.getBoundingClientRect();

    this.gridHandle.focus();
    event.preventDefault();

    this.handleDrag(event, container, (x, y) => {
      this.saturation = clamp(Math.round((x / width) * 100), 0, 100);
      this.lightness = clamp(Math.round(100 - (y / height) * 100), 0, 100);
      this.syncInputValue();
    });
  }

  handleDrag(event: any, container: HTMLElement, onMove: (x: number, y: number) => void) {
    const move = (event: any) => {
      const dims = container.getBoundingClientRect();
      const x = event.pageX - (dims.left + container.ownerDocument.defaultView.pageXOffset);
      const y = event.pageY - (dims.top + container.ownerDocument.defaultView.pageYOffset);
      onMove(x, y);
    };

    // Move on init
    move(event);

    const stop = () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('touchmove', move);
      document.removeEventListener('mouseup', stop);
      document.removeEventListener('touchend', stop);
    };

    document.addEventListener('mousemove', move);
    document.addEventListener('touchmove', move);
    document.addEventListener('mouseup', stop);
    document.addEventListener('touchend', stop);
  }

  handleAlphaKeyDown(event: KeyboardEvent) {
    const increment = event.shiftKey ? 10 : 1;

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.alpha = clamp(this.alpha - increment, 0, 100);
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.alpha = clamp(this.alpha + increment, 0, 100);
    }

    if (event.key === 'Home') {
      event.preventDefault();
      this.alpha = 0;
    }

    if (event.key === 'End') {
      event.preventDefault();
      this.alpha = 100;
    }
  }

  handleHueKeyDown(event: KeyboardEvent) {
    const increment = event.shiftKey ? 10 : 1;

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.hue = clamp(this.hue - increment, 0, 360);
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.hue = clamp(this.hue + increment, 0, 360);
    }

    if (event.key === 'Home') {
      event.preventDefault();
      this.hue = 0;
    }

    if (event.key === 'End') {
      event.preventDefault();
      this.hue = 360;
    }
  }

  handleGridKeyDown(event: KeyboardEvent) {
    const increment = event.shiftKey ? 10 : 1;

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.saturation = clamp(this.saturation - increment, 0, 100);
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.saturation = clamp(this.saturation + increment, 0, 100);
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.lightness = clamp(this.lightness + increment, 0, 100);
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.lightness = clamp(this.lightness - increment, 0, 100);
    }
  }

  handleUserChange(event: CustomEvent) {
    const target = event.target as HTMLInputElement;

    this.setColor(target.value);

    target.value = this.value;
  }

  normalizeColorString(colorString: string) {
    //
    // The color module we're using doesn't parse % values for the alpha channel in RGBA and HSLA. It also doesn't parse
    // hex colors when the # is missing. This pre-parser tries to normalize these edge cases to provide a better
    // experience for users who type in color values.
    //
    if (/rgba?/.test(colorString)) {
      const rgba = colorString
        .replace(/[^\d.%]/g, ' ')
        .split(' ')
        .map(val => val.trim())
        .filter(val => val.length);

      if (rgba[3] && rgba[3].indexOf('%') > -1) {
        rgba[3] = (Number(rgba[3].replace(/%/g, '')) / 100).toString();
      }

      return `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3]})`;
    }

    if (/hsla?/.test(colorString)) {
      const hsla = colorString
        .replace(/[^\d.%]/g, ' ')
        .split(' ')
        .map(val => val.trim())
        .filter(val => val.length);

      if (hsla[3] && hsla[3].indexOf('%') > -1) {
        hsla[3] = (Number(hsla[3].replace(/%/g, '')) / 100).toString();
      }

      return `hsla(${hsla[0]}, ${hsla[1]}, ${hsla[2]}, ${hsla[3]})`;
    }

    if (/^[0-9a-f]+$/.test(colorString)) {
      return `#${colorString}`;
    }

    return colorString;
  }

  parseColor(colorString: string) {
    function toHex(value: number) {
      const hex = Math.round(value).toString(16);
      return hex.length == 1 ? `0${hex}` : hex;
    }

    let parsed: any;

    // NOTE: The color module doesn't support % values for alpha channels, so we need to normalize them to 0-1 decimals
    colorString = this.normalizeColorString(colorString);

    try {
      parsed = color(colorString);
    } catch {
      return false;
    }

    const h = parsed.hsl().color[0];
    const s = parsed.hsl().color[1];
    const l = parsed.hsl().color[2];
    const a = parsed.hsl().valpha;

    const r = parsed.rgb().color[0];
    const g = parsed.rgb().color[0];
    const b = parsed.rgb().color[0];

    const hex = `#${toHex(parsed.rgb().color[0])}${toHex(parsed.rgb().color[1])}${toHex(
      parsed.rgb().color[2]
    )}`.toUpperCase();
    const hexa = hex + toHex((parsed.rgb().valpha || 1) * 255).toUpperCase();

    return {
      hsl: { h, s, l, string: `hsl(${h}, ${s}%, ${l}%)` },
      hsla: { h, s, l, a, string: `hsla(${h}, ${s}%, ${l}%, ${a})` },
      rgb: { r, g, b, string: `rgb(${r}, ${g}, ${b})` },
      rgba: { r, g, b, a, string: `rgba(${r}, ${g}, ${b}, ${a})` },
      hex,
      hexa
    };
  }

  setColor(colorString: string) {
    const newColor = this.parseColor(colorString);

    if (!newColor) {
      return false;
    }

    this.hue = newColor.hsla.h;
    this.saturation = newColor.hsla.s;
    this.lightness = newColor.hsla.l;
    this.alpha = this.opacity ? newColor.hsla.a * 100 : 100;

    this.syncInputValue();

    return true;
  }

  syncInputValue() {
    const currentColor = this.parseColor(`hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${this.alpha}%)`);

    if (!currentColor) {
      return false;
    }

    // Update the value
    if (this.format === 'hsl') {
      this.value = this.opacity ? currentColor.hsla.string : currentColor.hsl.string;
    } else if (this.format === 'rgb') {
      this.value = this.opacity ? currentColor.rgba.string : currentColor.rgb.string;
    } else {
      this.value = this.opacity ? currentColor.hexa : currentColor.hex;
    }
  }

  render() {
    const x = this.saturation;
    const y = 100 - this.lightness;

    return (
      <div ref={el => (this.trigger = el)} class="sl-color-picker">
        <div ref={el => (this.menu = el)} class="sl-color-picker__menu">
          <div
            ref={el => (this.grid = el)}
            class="sl-color-picker__grid"
            style={{
              backgroundColor: `hsl(${this.hue}deg, 100%, 50%)`
            }}
            onMouseDown={this.handleGridDrag}
            onTouchStart={this.handleGridDrag}
          >
            <span
              ref={el => (this.gridHandle = el)}
              class="sl-color-picker__grid-handle"
              style={{
                top: `${y}%`,
                left: `${x}%`
              }}
              role="slider"
              aria-label="HSL"
              aria-valuetext={`hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`}
              tabIndex={0}
              onKeyDown={this.handleGridKeyDown}
            />
          </div>

          <div class="sl-color-picker__controls">
            <div class="sl-color-picker__sliders">
              <div
                ref={el => (this.hueSlider = el)}
                class="sl-color-picker__hue sl-color-picker__slider"
                onMouseDown={this.handleHueDrag}
                onTouchStart={this.handleHueDrag}
              >
                <span
                  ref={el => (this.hueHandle = el)}
                  class="sl-color-picker__slider-handle"
                  style={{
                    left: `${this.hue === 0 ? 0 : 100 / (360 / this.hue)}%`
                  }}
                  role="slider"
                  aria-label="hue"
                  aria-orientation="horizontal"
                  aria-valuemin="0"
                  aria-valuemax="360"
                  aria-valuenow={this.hue}
                  tabIndex={0}
                  onKeyDown={this.handleHueKeyDown}
                />
              </div>

              {this.opacity && (
                <div
                  ref={el => (this.alphaSlider = el)}
                  class="sl-color-picker__alpha sl-color-picker__slider  sl-color-picker__transparent-bg"
                  onMouseDown={this.handleAlphaDrag}
                  onTouchStart={this.handleAlphaDrag}
                >
                  <div
                    class="sl-color-picker__alpha-gradient"
                    style={{
                      backgroundImage: `linear-gradient(
                        to right,
                        hsl(${this.hue}deg, ${this.saturation}%, ${this.lightness}%, 0%) 0%,
                        hsl(${this.hue}deg, ${this.saturation}%, ${this.lightness}%) 100%
                        )`
                    }}
                  />
                  <span
                    ref={el => (this.alphaHandle = el)}
                    class="sl-color-picker__slider-handle"
                    style={{
                      left: `${this.alpha}%`
                    }}
                    role="slider"
                    aria-label="alpha"
                    aria-orientation="horizontal"
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-valuenow={this.alpha}
                    tabIndex={0}
                    onKeyDown={this.handleAlphaKeyDown}
                  />
                </div>
              )}
            </div>

            <div
              class="sl-color-picker__preview  sl-color-picker__transparent-bg"
              style={{
                color: `hsla(${this.hue}deg, ${this.saturation}%, ${this.lightness}%, ${this.alpha}%)`
              }}
            />
          </div>

          <div class="sl-color-picker__user-input">
            <sl-input
              ref={el => (this.input = el)}
              size="small"
              type="text"
              pattern="[a-fA-F\d]+"
              value={this.value}
              onSlChange={this.handleUserChange}
            />
          </div>

          {this.swatches && (
            <div class="sl-color-picker__swatches">
              {this.swatches.map(swatch => (
                // @ts-ignore
                <div
                  class="sl-color-picker__swatch sl-color-picker__transparent-bg"
                  tabIndex={0}
                  onClick={() => this.setColor(swatch)} // eslint-disable-line
                  onKeyDown={event => event.key === 'Enter' && this.setColor(swatch)} // eslint-disable-line
                >
                  <div class="sl-color-picker__swatch-color" style={{ backgroundColor: swatch }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}
