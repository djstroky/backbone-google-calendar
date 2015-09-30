(function(factory) {

  // Baseline setup copied and modified from Backbone.js

  // Establish the root object, `window` (`self`) in the browser, or `global` on the server.
  // We use `self` instead of `window` for `WebWorker` support.
  var root = (typeof self == 'object' && self.self == self && self) ||
            (typeof global == 'object' && global.global == global && global);

  // Set up Backbone appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define(['backbone', 'underscore', 'exports'], function(backbone, _, exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global CalendarManager.
      root.Backbone = factory(root, exports, backbone, _);
    });

  // Next for Node.js or CommonJS.
  } else if (typeof exports !== 'undefined') {
    var _ = require('underscore'), 
      backbone = require('backbone');
    factory(root, exports, backbone, _);

  // Finally, as a browser global.
  } else {
    root.CalendarManager = factory(root, {}, root.Backbone, root._);
  }

}(function(root, CalendarManager, Backbone, _) {

  CalendarManager.isAuthorized = false;
  CalendarManager.authorizationScopes = ['https://www.googleapis.com/auth/calendar'];

  CalendarManager.handleAuthenticationResut = function(authResult, callback) {
    if(authResult && !authResult.error) {
      this.isAuthorized = true;
    } else {
      this.isAuthorized = false;
    }
    if(callback) {
      callback(this.isAuthorized, authResult);
    }
  };

  CalendarManager.obtainAuthorization = function(googleApi, clientId, immediate, callback) {
    console.log('obtainAuthorization');
    var _this = this;
    this.gapi = googleApi;
    googleApi.auth.authorize({ 
      client_id: clientId, 
      scope: this.authorizationScopes, 
      immediate: immediate
    }, function(result) {
      _this.handleAuthenticationResut(result, callback);
    });
  };


  CalendarManager.collectionParse = function(response, options) {
    return response.result.items;
  };

  CalendarManager.modelParse = function(response, options) {
    response.startDate = response.start.date;
    response.startDatetime = response.start.dateTime;
    response.endDate = response.end.date;
    response.endDatetime = response.end.dateTime;
    return response;
  };

  CalendarManager.sync = function(method, model, options) {
    switch(method) {
      case 'read':
        if(model.model) {
          //collection read
          this.manager.gapi.client.load('calendar', 'v3', function() {
            var request = gapi.client.calendar.events.list({
              calendarId: model.calendarId,
              orderBy: 'starttime',
              singleEvents: true, 
              showDeleted: true,
              timeMin: options.timeMin,
              timeMax: options.timeMax
            });
                  
            request.then(function(resp) {
              options.success(resp);
            }, function(reason) {
              options.failure(reason);
            });
          });
        } else {
          //model read
        }
        break;
      case 'create':
        break;
      case 'update':
      case 'patch':
        break;
      case 'delete':
        break;
    }
  };

  CalendarManager.makeEventModel = function(calendarId, eventModelCfg) {
    eventModelCfg || (eventModelCfg = {});
    return Backbone.Model.extend(_.extend({
      calendarId: calendarId,
      manager: this,
      parse: this.modelParse,
      sync: this.sync
    }, eventModelCfg));
  };

  CalendarManager.makeCalendar = function(calendarId, calendarCfg, eventModelCfg) {
    calendarCfg || (calendarCfg = {});
    var BackboneGoogleCalendar = Backbone.Collection.extend(_.extend({
      calendarId: calendarId,
      manager: this,
      model: this.makeEventModel(calendarId, eventModelCfg),
      parse: this.collectionParse,
      sync: this.sync
    }, calendarCfg));
    return new BackboneGoogleCalendar();
  };

  return CalendarManager;

}));