import {html, LitElement} from "@polymer/lit-element";
// import roundSlider from 'round-slider';
// import roundSliderCSS from "round-slider/dist/roundslider.min.css";
// import { RoundSlider } from "@thomasloven/round-slider";
// import "@thomasloven/round-slider";


// const thermostatConfig = {
//   radius: 150,
//   step: 1,
//   circleShape: "pie",
//   startAngle: 315,
//   width: 5,
//   lineCap: "round",
//   handleSize: "+10",
//   showTooltip: false,
// };

const modeIcons = {
  auto: "hass:calendar-sync",
  heat_cool: "hass:autorenew",
  heat: "hass:fire",
  cool: "hass:snowflake",
  off: "hass:power",
  fan_only: "hass:fan",
  dry: "hass:water-percent"
};

// const modeText = {
//   auto: "Auto",
//   heat_cool: "Heat/Cool",
//   heat: "Heat",
//   cool: "Cool",
//   off: "Off",
//   fan_only: "Fan",
//   dry: "Dry"
// };

const UPDATE_PROPS = ['stateObj']

function formatTemp(temps) {
  return temps.filter(Boolean).join("-");
}

class MagiQtouchCard extends LitElement {

  static get properties() {
    return {
      _hass: Object,
      _config: Object,
      entity: Object,
      stateObj: {
        type: Object,
        notify: true
      },
      mode: String,
      name: String,
      min_slider: Number,
      max_slider: Number
    }
  }

  constructor() {
    super();

    this._hass = null;
    this._config = null;
    this.entity = null;
    this.stateObj = null;
    this.name = null;
    this.mode = null;
    this.min_slider = null;
    this.max_slider = null
  }

  set hass(hass) {
    this._hass = hass;

    if (this._hass && this._config.entity) {

      this.entity = this.validateEntity(this._config.entity);

      this.setStateObj(this._config.entity);

      this.name = this._config.name || this.stateObj.attributes.friendly_name;

      this.min_slider = this._config.min_slider || this.stateObj.attributes.min_temp;
      this.max_slider = this._config.max_slider || this.stateObj.attributes.max_temp;

      this.mode = modeIcons[this.stateObj.state || ""] ?
        this.stateObj.state :
        "unknown-mode";
    }
  }

  setStateObj(entity_conf) {
    this.stateObj = (typeof entity_conf === "string" ?
      this._hass.states[entity_conf] :
      this._hass.states[entity_conf.entity]);
  }

  render() {
    if (!this._hass || !this.stateObj) {
      return html``;
    }

    let broadCard = this.clientWidth > 390;

    return html`
      ${this.renderStyle()}
      <ha-card
        class="${this.mode} ${broadCard ? 'large' : "small"}">
        <div id="root">
        <div id="controls">
        <round-slider id="thermostat"
              min=0
              value=0
              max=150
              step=1
              @value-changing=${this.dragEvent}
              @value-changed=${this.newSetting}
            ></round-slider>
            </div>
        <div id="slider-center">
            <div class="current-temperature">
              <div class="current-temperature-text">
                ${this.stateObj.attributes.current_temperature} </div>
                ${(this.stateObj.attributes.current_temperature) ? html`<div class="uom">${this._hass.config.unit_system.temperature}</div>` : ""}

            </div>

              <div id="set-temperature"></div>
              <div class="current-mode">${this.computeCurrentModeName()}</div>
              <span class="s_or_t">
                Fan Speed
                <ha-switch
                  id="SpeedOrTemperature"
                  class="${this.mode === "cool" ? 'switch-cool' : 'switch-fan'}"
                  @change=${this.SpeedOrTemperatureClick}
                ></ha-switch>
                Temperature
              </span>
              <div class="modes">
                ${(this.stateObj.attributes.hvac_modes.slice(0).reverse() || []).map((modeItem) => this.renderIcon(modeItem))}
              </div>
              <div class="title">${this.name}</div>


          </div>
          <!-- <div id="tooltip">
          </div> -->
        </div>
      </ha-card>
    `;
  }

  renderStyle() {
    return html`
      <style>
        :host {
          display: block;
        }
        ha-card {
          overflow: hidden;
          --rail-border-color: transparent;
          --auto-color: green;
          --eco-color: springgreen;
          --cool-color: #2b9af9;
          --heat-color: #ff8100;
          --manual-color: #44739e;
          --off-color: #635976;
          --fan_only-color: #e5f45f;
          --dry-color: #efbd07;
          --idle-color: #8a8a8a;
          --unknown-color: #bac;
          --switch-fan-unchecked-button-color: #e5f45d;
          --switch-fan-unchecked-track-color: #e7f65f;
          --switch-cool-unchecked-button-color: #2b9af9;
          --switch-cool-unchecked-track-color: #2d9cfb;
        }
        #root {
          position: relative;
          overflow: hidden;
        }
        .auto,
        .heat_cool {
          --mode-color: var(--auto-color);
        }
        .cool {
          --mode-color: var(--cool-color);
        }
        .heat {
          --mode-color: var(--heat-color);
        }
        .manual {
          --mode-color: var(--manual-color);
        }
        .off {
          --mode-color: var(--off-color);
        }
        .fan_only {
          --mode-color: var(--fan_only-color);
        }
        .eco {
          --mode-color: var(--eco-color);
        }
        .dry {
          --mode-color: var(--dry-color);
        }
        .idle {
          --mode-color: var(--idle-color);
        }
        .unknown-mode {
          --mode-color: var(--unknown-color);
        }
        .no-title {
          --title-position-top: 33% !important;
        }
        .switch-fan {
          --switch-unchecked-button-color: var(--switch-fan-unchecked-button-color);
          --switch-unchecked-track-color: var(--switch-fan-unchecked-track-color);
        }
        .switch-cool {
          --switch-unchecked-button-color: var(--switch-cool-unchecked-button-color);
          --switch-unchecked-track-color: var(--switch-cool-unchecked-track-color);
        }
        /* .large {
          --thermostat-padding-top: 25px;
          --thermostat-margin-bottom: 25px;
          --title-font-size: 28px;
          --title-position-top: 27%;

          --set-temperature-font-size: 25px;
          --current-temperature-font-size: 71px;
          --current-temperature-position-top: 45%;
          --current-temperature-text-padding-left: 15px;
          --uom-font-size: 20px;
          --uom-margin-left: -18px;
          --current-mode-font-size: 18px;
          --set-temperature-margin-bottom: -5px;
        } */
        .small, .large {
          --thermostat-padding-top: 15px;
          --thermostat-margin-bottom: 42px;
          --title-font-size: 18px;
          --title-position-top: 28%;

          --set-temperature-font-size: 25px;
          --current-temperature-font-size: 70px;
          --current-temperature-position-top: 12%;
          --current-temperature-text-padding-left: 5px;
          --uom-font-size: 25px;
          --uom-left: -2px;
          --uom-top: 14px;
          --current-mode-font-size: 14px;
          --set-temperature-margin-bottom: 0px;
        }

        #controls {
            display: flex;
            justify-content: center;
            padding: 16px;
            position: relative;
        }

        #thermostat {
          height: 100%;
          width: 100%;
          position: relative;
          max-width: 250px;
          min-width: 100px;
          margin: 0 auto var(--thermostat-margin-bottom);
          padding-top: var(--thermostat-padding-top);
        }

        round-slider {
          --round-slider-path-color: var(--slider-track-color);
          --round-slider-bar-color: var(--mode-color);
          /* --round-slider-path-color: var(--mode-color); */
          padding-bottom: 10%;
          z-index: 2;
        }

        #slider-center {
          position: absolute;
          width: calc(100% - 40px);
          height: 60%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          box-sizing: border-box;
          border-radius: 100%;
          left: 20px;
          top: 31%;
          text-align: center;
          overflow-wrap: break-word;
          /*pointer-events: none;*/
        }
        .current-temperature {
          /* position: absolute;
          top: var(--current-temperature-position-top);
          left: 50%;
          padding-left: calc(0px - var(--uom-margin-left));
          transform: translate(-50%, -50%); */
          display: inline-flex;
          justify-content: center;
          position: relative;
          left: 1%;
        }
        .current-temperature-text {
          font-size: var(--current-temperature-font-size);
          line-height: normal;
          display: inline-block;
          /* padding-left: var(--current-temperature-text-padding-left); */
        }
        .uom {
          display: inline-block;
          font-size: var(--uom-font-size);
          vertical-align: top;
          margin-left: var(--uom-left);
          padding-top: var(--uom-top);
        }
        #set-temperature {
          font-size: var(--set-temperature-font-size);
          margin-bottom: var(--set-temperature-margin-bottom);
          min-height: 1.1em;
          padding-top: 12px;
        }
        .s_or_t {
          padding-top: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        #SpeedOrTemperature {
        min-height: 1.1em;
          padding: 0px 4px;
          z-index: 3;
          position: relative;
        }
        .current-mode {
          font-size: var(--current-mode-font-size);
          color: var(--secondary-text-color);
        }
        .modes {
          /* margin-top: 8px; */
          z-index: 3;
          position: relative;
        }
        .modes ha-icon {
          color: var(--disabled-text-color);
          cursor: pointer;
          display: inline-block;
          margin: 0 10px;
        }
        .modes ha-icon-button.selected-icon ha-icon {
          color: var(--mode-color);
        }

        .title {
          font-size: var(--title-font-size);
          /* position: absolute; */
          /* top: var(--title-position-top); */
          /* left: 50%;
          transform: translate(-50%, -50%); */
          /* padding-top: 8px; */
        }

        #tooltip {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100%;
          text-align: center;
          z-index: 15;
          color: var(--primary-text-color);
        }
        .more-info {
          position: absolute;
          cursor: pointer;
          top: 0;
          right: 0;
          z-index: 25;
          color: var(--secondary-text-color);
        }
      </style>
    `;
  }

  renderIcon(mode) {
    if (!modeIcons[mode]) {
      console.log("no icon for: " + mode);
      return html``;
    }

    return html`
      <ha-icon-button
        class="${this.mode === mode ? 'selected-icon' : ''}"
        .mode="${mode}"
        @click="${this.handleModeClick}"
      ><ha-icon icon="${modeIcons[mode]}"></ha-icon></ha-icon-button>
    `;
  }

  handleModeClick(e) {
    let selected = e.currentTarget.mode;
    // if (selected == "cool") {
    //   if (this.shadowRoot.querySelector("#SpeedOrTemperature")) {
    //     selected = "auto"
    //   }
    // }
    console.log("Mode: " + selected);
    this._hass.callService("climate", "set_hvac_mode", {
      entity_id: this.stateObj.entity_id,
      hvac_mode: selected,
    });
  }

  shouldUpdate(changedProps) {
    return UPDATE_PROPS.some(prop => changedProps.has(prop))
  }

  firstUpdated() {
    console.log("firstUpdated");
    this.updated(null);
    // jQuery("#thermostat", this.shadowRoot).roundSlider({
    //   ...thermostatConfig,
    //   radius: this.clientWidth / 3,
    //   min: this.min_slider,
    //   max: this.max_slider,
    //   sliderType: this.mode === "heat_cool" ? "range" : "min-range",
    //   change: (event) => this.newSetting(event),
    //   drag: (event) => this.dragEvent(event),
    // });
  }

  updated(changedProps) {
    let slider;
    // let sliderValue;
    // let uiValue;
    let stSwitch;
    let stSwitchState;

    // if (this.mode === "cool" || this.mode === "heat" || this.mode === "heat_cool") {
    // } else {
    //   sliderValue = uiValue = this.entity.attributes.temperature;
    //   sliderValue = uiValue = Number.isFinite(Number(this.stateObj.attributes.temperature))
    //     ? this.stateObj.attributes.temperature
    //     : null;
    // }

    // console.log(jQuery("#thermostat", this.shadowRoot));
    // console.log(jQuery("#thermostat", this.shadowRoot).value);
    // jQuery("#thermostat", this.shadowRoot).value = uiValue ? sliderValue : "";
    // console.log(jQuery("#thermostat", this.shadowRoot)[0]);
    // console.log(jQuery("#thermostat", this.shadowRoot).value);
    // console.log(jQuery("#thermostat", this.shadowRoot));
    // jQuery("#thermostat", this.shadowRoot).RoundSlider({
    //   // sliderType: this.mode === "heat_cool" ? "range" : "min-range",
    //   value: uiValue ? sliderValue : "",
    //   disabled: sliderValue === null
    // });

    stSwitchState = this.stateObj.attributes.current_temperature == "Temperature";

    stSwitch = jQuery("#SpeedOrTemperature", this.shadowRoot)[0];

    slider = jQuery("#thermostat", this.shadowRoot)[0];

    if (this.stateObj.state == "fan_only") { // TODO: is this supported for heat / heat_cool modes?
      stSwitch.disabled = true;
    } else {
      stSwitch.disabled = false;
    }

    // console.log(this.stateObj);
    if (this.stateObj.state == "fan_only" ||
      this.stateObj.attributes.fan_mode != "Temperature"
    ) {
      let current_fan = parseInt(this.stateObj.attributes.fan_mode);
      console.log("current fan: " + current_fan);
      slider.min = 0;
      slider.value = current_fan;
      slider.max = 10;
      this.shadowRoot.querySelector("#set-temperature").innerHTML = current_fan;
      stSwitchState = false;

    } else {
     let current_temperature = this.entity.attributes.temperature;
     console.log("current temp: " + current_temperature);
     slider.max = this.stateObj.attributes.max_temp;
      slider.min = this.stateObj.attributes.min_temp;
      slider.value = current_temperature;
      this.shadowRoot.querySelector("#set-temperature").innerHTML = current_temperature;
      stSwitchState = this.stateObj.attributes.fan_mode == "Temperature";
    }

    stSwitch.checked = stSwitchState

    // console.log(this.stateObj);
    // slider.disabled = "false"; //this.stateObj.state == "UNAVAILABLE" ? "true" : "false";
    console.log(jQuery("#thermostat", this.shadowRoot));

  }

  SpeedOrTemperatureClick(e) {
    let _switch = this.shadowRoot.querySelector("#SpeedOrTemperature");
    if (_switch.disabled) {
      return
    }

    const FAN_SPEED_BY_TEMP = "Temperature";
    const FAN_SPEED_TO_PREV = "Previous";

    if (this.mode === "cool") {
      if (! _switch.checked) {
        // Switch to fan speed mode (at previous speed setting)
        this._hass.callService("climate", "set_fan_mode", {
          entity_id: this.entity.entity_id,
          fan_mode: FAN_SPEED_TO_PREV
        });
      } else {
        // Switch to temperature control
        this._hass.callService("climate", "set_fan_mode", {
          entity_id: this.entity.entity_id,
          fan_mode: FAN_SPEED_BY_TEMP
        });
      }
    }
  }

  newSetting(e) {
    console.log("newSetting");
    //console.log(e);
    if (e.detail.value == 0) {
      // While we display 0 on the slider we don't support actual fan speed of 0
      e.detail.value = 1;
      e.target.value = 1;
    }
    console.log(e.detail);

    // Round Slider has been adjusted
    if (this.mode === "fan_only") {
      this._hass.callService("climate", "set_fan_mode", {
        entity_id: this.entity.entity_id,
        fan_mode: e.detail.value
      });
    } else if (this.mode === "cool") {
      let _switch = this.shadowRoot.querySelector("#SpeedOrTemperature");
      if (_switch.checked) {
        // Temperature mode
        this._hass.callService("climate", "set_temperature", {
          entity_id: this.entity.entity_id,
          temperature: e.detail.value,
        });
      } else {
        // Fan speed mode
        this._hass.callService("climate", "set_fan_mode", {
          entity_id: this.entity.entity_id,
          fan_mode: e.detail.value
        });
      }
    } else {
      this._hass.callService("climate", "set_temperature", {
        entity_id: this.entity.entity_id,
        temperature: e.detail.value,
      });
    }
  }

  dragEvent(event) {
    //console.log("Drag")
    //console.log(event.detail);
    if (event.detail.value == 0) {
      // While we display 0 on the slider we don't support actual fan speed of 0
      event.detail.value = 1;
      event.target.value = 1;
    }
    this.shadowRoot.querySelector("#set-temperature").innerHTML = String(event.detail.value);
  }

  validateEntity(entity) {
    let output = this._hass.states[entity] ? this._hass.states[entity] : null;

    if (!output) {
      throw new Error("Invalid entity.");
    }

    return output;
  }

  computeCurrentModeName() {
    // let lang = this._hass.selectedLanguage || this._hass.language;
    // return this._hass.resources[lang][`state.climate.${this.stateObj.state}`] || this.stateObj.state
    return this.stateObj.attributes.hvac_action
      ? this._hass.localize(
        `state_attributes.climate.hvac_action.${this.stateObj.attributes.hvac_action}`
      )
      : this._hass.localize(
        `component.climate.state._.${this.stateObj.state}`
      );
  }

  setConfig(config) {
    if (typeof config.entity === "string" && config.entity.split(".")[0] !== "climate") {
        throw new Error("Specify magiqtouch entity.");
    }

    this._config = config;
  }

  getCardSize() {
    return 4;
  }
}

customElements.define("magiqtouch-thermostat", MagiQtouchCard);