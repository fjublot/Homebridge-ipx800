# homebridge-http-jeedom
Supports Jeedom through https API calls.

Based on https://github.com/rudders/homebridge-http

# Installation

1. Install homebridge using: npm install -g homebridge
2. Install this plugin using: npm install -g homebridge-http-jeedom
3. Update your configuration file. See sample-config.json in this repository for a sample.

# Configuration

List of available services (and configuration var):
SwitchService
        -onCommandID
        -offCommandID
        -stateCommandID
TemperatureService
        -temperatureCommandID
HumidityService
        -humidityCommandID

* 'jeedom_url' ==> URL address of your Jeedom server
* 'jeedom_api' ==> Get your Jeedom API in "Configuration" in Jeedom
* 'xxxCommandID' ==> Unique ID of the command, available in the detail view of the command in Jeedom.

Configuration sample:


 ```
"accessories": [
        "accessories": [
        {
            "accessory": "HttpJeedom",
            "jeedom_url": "https://jeedom.domain.com/jeedom",
            "jeedom_api": "x8r0pcqgjfghrthtx158",
            "service": "TemperatureService",
            "name": "Living Room Temperature",
            "temperatureCommandID": "185"
        }
    ]

```
