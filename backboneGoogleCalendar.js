var CalendarManager = CalendarManager || {};

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

CalendarManager.obtainAuthorization = function(googleApi, clientId, callback){
  var _this = this;
  this.gapi = googleApi;
  googleApi.auth.authorize({ 
    client_id: clientId, 
    scope: this.authorizationScopes, 
    immediate: true
  }, function(result) {
    _this.handleAuthenticationResut(result, callback);
  });
};

CalendarManager.sync = function(method, model, options){
  switch(method) {
    case 'read':
      if(model.model) {
        //collection read
        this.manager.gapi.client.load('calendar', 'v3', function() {
          var request = gapi.client.calendar.events.list({
            calendarId: model.calendarId,
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

CalendarManager.makeEventModel = function(calendarId) {
  return Backbone.Model.extend({
    calendarId: calendarId,
    manager: this,
    sync: this.sync
  });
};

CalendarManager.makeCalendar = function(calendarId) {
  var BackboneGoogleCalendar = Backbone.Collection.extend({
    calendarId: calendarId,
    manager: this,
    model: this.makeEventModel(calendarId),
    sync: this.sync
  });
  return new BackboneGoogleCalendar();
};