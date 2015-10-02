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

  var isAuthorized = false;
  var authorizationScopes = ['https://www.googleapis.com/auth/calendar'];

  var collectionParse = function(response, options) {
    return response.result.items;
  };

  var eventCollectionSync = function(method, model, options) {
    var _this = this;
    switch(method) {
      case 'read':
        return this.manager.gapi.client.load('calendar', 'v3', function() {
          var request = _this.manager.gapi.client.calendar.events.list(_.extend({
            calendarId: model.calendarId,
            orderBy: 'starttime',
            singleEvents: true, 
            showDeleted: true,
          }, options.data));
                
          request.then(function(resp) {
            options.success(resp);
          }, function(reason) {
            options.failure(reason);
          });
        });
        break;
      case 'create':
        break;
      case 'update':
        break;
      case 'delete':
        break;
    }
  };

  CalendarManager.obtainAuthorization = function(googleApi, clientId, immediate, callback) {
    this.gapi = googleApi;
    console.log(clientId);
    googleApi.auth.authorize({ 
      client_id: clientId, 
      scope: this.authorizationScopes, 
      immediate: immediate
    }, function(authResult) {
      if(authResult && !authResult.error) {
        isAuthorized = true;
      } else {
        isAuthorized = false;
      }
      if(callback) {
        var out = isAuthorized ? null : authResult;
        callback(out);
      }
    });
  };

  CalendarManager.makeEventModel = function(calendarId, eventModelCfg) {
    eventModelCfg || (eventModelCfg = {});
    return Backbone.Model.extend(_.extend({
      calendarId: calendarId,
      manager: this,
      sync: eventSync
    }, eventModelCfg));
  };

  CalendarManager.makeEventCollection = function(calendarId, eventCollectionCfg, eventModelCfg) {
    eventCollectionCfg || (eventCollectionCfg = {});
    var BackboneGoogleCalendar = Backbone.Collection.extend(_.extend({
      calendarId: calendarId,
      manager: this,
      model: this.makeEventModel(calendarId, eventModelCfg),
      parse: collectionParse,
      sync: eventCollectionSync
    }, eventCollectionCfg));
    return new BackboneGoogleCalendar();
  };

  return CalendarManager;

}));