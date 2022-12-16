[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)

# Lovelace MagIQtouch Thermostat Card

A custom Lovelace card for controlling the Seeley MagIQtouch thermostats for gas Heating and/or Evap Cooling systems.

Intended for use with my [magiqtouch integration](https://github.com/andrewleech/ha_magiqtouch)

![Example thermostat](https://github.com/andrewleech/lovelace-magiqtouch-thermostat/raw/master/thermostat.png)

## Installation with HACS

1. Add this repo (https://github.com/andrewleech/lovelace-magiqtouch-thermostat) as a custom repo in HACS, category: Lovelace
    https://hacs.xyz/docs/faq/custom_repositories/
2. Select this repo on the HACS Frontend section, then the download button.

## Manual installation
1. Download the repo as a zip or with git clone and copy contents of the `/dist` folder to a `/www/magiqtouch` folder in your HA configuration folder.
2. Add the card in Lovelace "Manage Resources" as a Javascript Module with the url: /local/magiqtouch/magiqtouch.js?v=1

## Example usage:
Install the matching integration with HACS from: https://github.com/andrewleech/ha_magiqtouch

Add a new Manual card in your front-end with the yaml:

```yaml
type: custom:magiqtouch-thermostat
name: MagiQtouch
entity: climate.magiqtouch
```
