var Service, Characteristic;
var request = require("request");

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-http-domotika", "HttpDomotika", HttpDomotikaAccessory);
}

function HttpDomotikaAccessory(log, config) {
	this.log = log;
    this.config = config;
  
    if (this.config.service == "LockMechanism") {
      this.service = new Service.LockMechanism(this.config.name);
      this.service
        .getCharacteristic(Characteristic.LockCurrentState)
        .on('get', this.getState.bind(this));
      this.service
        .getCharacteristic(Characteristic.LockTargetState)
        //.on('get', this.getState.bind(this))
        .on('set', this.setStateLockMechanism.bind(this));
    	
    }

    if (this.config.service == "Switch") {
      this.service = new Service.Switch(this.config.name);
      this.service
        .getCharacteristic(Characteristic.On)
        .on('get', this.getState.bind(this))
        .on('set', this.setSwitch.bind(this));
     }

    if (this.config.service == "LightBulb") {
      this.service = new Service.Lightbulb(this.config.name);
      
      this.service
        .getCharacteristic(Characteristic.On)
        .on('get', this.getStateLightbulb.bind(this))
        .on('set', this.setSwitch.bind(this));
      
      
      this.service
        .getCharacteristic(Characteristic.Brightness)
        .on('get', this.getStateLightbulb.bind(this));
     }

    if (this.config.service == "SecuritySystem") {
      this.service = new Service.SecuritySystem(this.config.name);
      this.service
        .getCharacteristic(Characteristic.SecuritySystemCurrentState)
        .on('get', this.getStateSecuritySystem.bind(this));
      this.service
        .getCharacteristic(Characteristic.SecuritySystemTargetState)
        .on('get', this.getStateSecuritySystem.bind(this))
        .on('set', this.setStateSecuritySystem.bind(this));
     }

    if (this.config.service == "WindowCovering") {
      this.service = new Service.WindowCovering(this.config.name);
      this.service
        .getCharacteristic(Characteristic.CurrentPosition)
        .on('get', this.getTemperature.bind(this));
      this.service
        .getCharacteristic(Characteristic.TargetPosition)
        .on('get', this.getTemperature.bind(this))
        .on('set', this.setWindowCovering.bind(this));
    }
    
    if (this.config.service == "TemperatureSensor") {
      this.service = new Service.TemperatureSensor(this.config.name);
      
      this.service
        .getCharacteristic(Characteristic.CurrentTemperature)
        .on('get', this.getTemperature.bind(this));
     }

}

HttpDomotikaAccessory.prototype = {

		httpRequest: function(url, callback) {
		  this.log(url);
      request({
			  url: url,
			  method: "GET",
			  rejectUnauthorized: false
			},
			function(error, response, body) {
				callback(error, response, body)
			})
		},

		//This function builds the URL.
		setUrl: function(className, classNumero, cmdID) {
			var url;
			url = this.config.url + "?app=api&apikey=" + this.config.apikey + "&class=" + className + "&numero=" + classNumero + "&command=" + cmdID;
			return url;
		},

  
    getState:function(callback) {
      this.log("Getting current state...");
			var url;
			url = this.setUrl(this.config.get.className, this.config.get.numero, "GetState");
			this.httpRequest(url, function(error, response, responseBody) {        
        if (!error && response.statusCode == 200) {
          var json = JSON.parse(responseBody);
          var state = json.value; // "1" or "0"
          var msg = json.message; // "locked" or "unlocked"
          
          this.log("State is %s", state);   
          var locked = state == "1"
          callback(null, locked); // success
        }
        else {
          this.log("Error getting state (status code %s): %s", response.statusCode, error);
          callback(error);
        }
      }.bind(this));
    },

     getStateLightbulb:function(callback) {
      this.log("Getting current state...");
			var url;
			url = this.setUrl(this.config.get.className, this.config.get.numero, "GetState");
			this.httpRequest(url, function(error, response, responseBody) {        
        if (!error && response.statusCode == 200) {
          var json = JSON.parse(responseBody);
          var state = json.value; // entre "0" or "99"
          var msg = json.message; 
          
          this.log("State is %s", state);   
          callback(null, state); // success
        }
        else {
          this.log("Error getting state (status code %s): %s", response.statusCode, error);
          callback(error);
        }
      }.bind(this));
    },

 
    getTemperature:function(callback) {
      this.log("Getting current state...");
			var url;
			url = this.setUrl(this.config.get.className, this.config.get.numero, "GetState");
			this.httpRequest(url, function(error, response, responseBody) {        
        if (!error && response.statusCode == 200) {
          var json = JSON.parse(responseBody);
          var state = json.value; 
          
          this.log("State is %s", state);
          callback(null, state); // success
        }
        else {
          this.log("Error getting state (status code %s): %s", response.statusCode, error);
          callback(error);
        }
      }.bind(this));
    },
  
    getStateSecuritySystem:function(callback) {
      this.log("Getting current state...");
			var url;
			url = this.setUrl(this.config.get.className, this.config.get.numero, "GetState");
			this.httpRequest(url, function(error, response, responseBody) {        
        if (!error && response.statusCode == 200) {
          var json = JSON.parse(responseBody);
          var state = json.value; // "1" or "0"
          var msg = json.message; // "locked" or "unlocked"
          
          this.log("SecuritySystem state is %s", state);
          if (state == 0)
            var locked = Characteristic.SecuritySystemCurrentState.DISARMED;
          else
            var locked = Characteristic.SecuritySystemCurrentState.AWAY_ARM;
            
          callback(null, locked); // success
        }
        else {
          this.log("Error getting state (status code %s): %s", response.statusCode, error);
          callback(error);
        }
      }.bind(this));
    },

     setStateSecuritySystem:function(state, callback) {
      if ((state == 3) || (state == 0)) {
        var targetState = "DISARMED";
      }
      else
        var targetState = "AWAY_ARM";


      this.log("Getting current state...");
			var url;
			url = this.setUrl(this.config.get.className, this.config.get.numero, "GetState");
			this.httpRequest(url, function(error, response, responseBody) {        
        if (!error && response.statusCode == 200) {
          var json = JSON.parse(responseBody);
          var readState = json.value; // "1" or "0"
          var msg = json.message; // "locked" or "unlocked"
          var locked = (readState == 0) ? "DISARMED" : "AWAY_ARM";
          this.log("Set state to %s", targetState);
          this.log("SecuritySystem état courant :  " + locked);
          
          if (locked != targetState) {
        			url = this.setUrl(this.config.set.className, this.config.set.numero, "Switch");
        			this.httpRequest(url, function(error, response, responseBody) {            
                if (!error && response.statusCode == 200) {
                  this.log("Demande traitée.");
                  // we succeeded, so update the "current" state as well
                  var currentState = (targetState == "DISARMED") ?
                    Characteristic.SecuritySystemCurrentState.DISARMED : Characteristic.SecuritySystemCurrentState.AWAY_ARM;
                  
                  this.service
                    .setCharacteristic(Characteristic.SecuritySystemCurrentState, currentState);
            
                  var json = JSON.parse(responseBody);
            
                  callback(null); // success
                }
                else {
                  this.log("Error '%s' setting lock state. Response: %s", error, responseBody);
                  callback(error || new Error("Error setting lock state."));
                }
              }.bind(this));
          }
          else
              callback(null); // success
        
          
        }
        else {
              this.log("Error getting state (status code %s): %s", response.statusCode, error);
              callback(error);
        }
      }.bind(this));

    },
 
    setStateLockMechanism:function(state, callback) {
      var lockState = (state == Characteristic.LockTargetState.SECURED) ? "locked" : "unlocked";
      this.log("Set state to %s", lockState);
			url = this.setUrl(this.config.set.className, this.config.set.numero, "Switch");
			this.httpRequest(url, function(error, response, responseBody) {            
        if (!error && response.statusCode == 200) {
          this.log("Demande traitée.");
          // we succeeded, so update the "current" state as well
          var currentState = (state == Characteristic.LockTargetState.SECURED) ?
            Characteristic.LockCurrentState.SECURED : Characteristic.LockCurrentState.UNSECURED;
          
          this.service
            .setCharacteristic(Characteristic.LockCurrentState, currentState);
    
          var json = JSON.parse(responseBody);
    
          callback(null); // success
        }
        else {
          this.log("Error '%s' setting lock state. Response: %s", error, responseBody);
          callback(error || new Error("Error setting lock state."));
        }
      }.bind(this));
    },
  
    setWindowCovering:function(state, callback) {
      this.log("Target : "+state)
      if (state <50) {
			   url = this.setUrl(this.config.set.close.className, this.config.set.close.numero, "Switch");
         targetState=0;
      }
      else {
			   url = this.setUrl(this.config.set.open.className, this.config.set.open.numero, "Switch");
         targetState=100;
			}
      this.httpRequest(url, function(error, response, responseBody) {            
        if (!error && response.statusCode == 200) {
          this.log("Demande traitée.");
          // we succeeded, so update the "current" state as well          
          this.service
            .setCharacteristic(Characteristic.CurrentPosition, targetState);
    
          //var json = JSON.parse(responseBody);
    
          callback(null); // success
        }
        else {
          this.log("Error '%s' setting lock state. Response: %s", error, responseBody);
          callback(error || new Error("Error setting lock state."));
        }
      }.bind(this));
    },

    setSwitch:function(state, callback) {
      var lockState = (state == Characteristic.On) ? "off" : "on";
      this.log("Set state to %s", lockState);
			if (!this.config.set.switchCommandID && (!this.config.set.onCommandID || !this.config.set.offCommandID) ) {
				this.log.warn("No command ID defined, please check config.json file");
				callback(new Error("No command ID defined"));
				return;
			}

      if (!this.config.set.switchCommandID) { 
			if (state) {
				url = this.setUrl(this.config.set.className, this.config.set.numero, this.config.set.onCommandID);
        message = "On";
			} else {
				url = this.setUrl(this.config.set.className, this.config.set.numero, this.config.set.offCommandID);
        message = "Off";
			}
      }
      else {
				url = this.setUrl(this.config.set.className, this.config.set.numero, this.config.set.switchCommandID);
        message = "Switch";

      }

			this.httpRequest(url, function(error, response, responseBody) {            
        if (!error && response.statusCode == 200) {
          this.log("Demande traitée.");
          /* we succeeded, so update the "current" state as well
          var currentState = (state == Characteristic.On) ?
            Characteristic.O : Characteristic.Off;
          
          this.service
            .setCharacteristic(Characteristic.On, currentState);
    
          var json = JSON.parse(responseBody);
        */
          callback(null); // success
        
        }
        else {
          this.log("Error '%s' setting lock state. Response: %s", error, responseBody);
          callback(error || new Error("Error setting lock state."));
        }
      }.bind(this));
    },
  
    getServices:function() {
      return [this.service];
    }
}