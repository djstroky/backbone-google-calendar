// JSON outputting copied and modified from http://stackoverflow.com/a/7220510/269834
var syntaxHighlight = function(json) {
  if (typeof json != 'string') {
    json = JSON.stringify(json, undefined, 2);
  }
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  var out = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      var cls = 'number';
      if (/^"/.test(match)) {
          if (/:$/.test(match)) {
              cls = 'key';
          } else {
              cls = 'string';
          }
      } else if (/true|false/.test(match)) {
          cls = 'boolean';
      } else if (/null/.test(match)) {
          cls = 'null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
  });
  return '<pre>' + out + '</pre>';
}

var error = function(errMsg, json) {
  $('#output').html(errMsg + syntaxHighlight(json));
}

var gapiReadyCallback = function() {
    $('#output').html('gapiReady');
    if(gapiReadyTask) {
      gapiReadyTask();
    }
  },
  gapiReadyTask;

$(document).on('ready',function() {

  /**
   * Check if current user has authorized this application.
   */
  var attemptToAuthorize = function() {
    $('#output').html('attemptToAuthorize');
    console.log(clientId);
    CalendarManager.obtainAuthorization(gapi, clientId, false, handleAuthResult);
  }

  /**
   * Handle response from authorization server.
   *
   * @param {Object} authResult Authorization result.
   */
  var handleAuthResult = function(authErr) {
    if (!authErr) {
      // Hide auth UI, then load client library.
      $('#authorize-div').hide();
      $('#authorized-div').show();
      $('#output').html('authorization successful' + syntaxHighlight(CalendarManager.gapi.auth.getToken()));
    } else {
      // Show auth UI, allowing the user to initiate authorization by
      // clicking authorize button.
      $('#authorize-div').show();
      $('#authorized-div').hide();
      error('Not authorized.  Error: ', authErr);
    }
  }

  $('#authorize-button').click(attemptToAuthorize);

  /************************************************************************************
   * Calendar api calls
   *************************************************************************************/
  $('#calendar-create-button').click(function() {  });
  $('#calendar-list-button').click(function() {  });
  $('#calendar-get-button').click(function() {  });

  /************************************************************************************
   * Event api calls
   *************************************************************************************/

  $('#event-create-button').click(function() {
    var Event = CalendarManager.makeEventModel($('#event-calendar-id-input').val());
      
    var event = new Event({

    });

    
  });

  $('#event-list-button').click(function() { 
    var eventCollection = CalendarManager.makeEventCollection($('#event-calendar-id-input').val()),
      yesterday = moment().subtract(1, 'days'),
      aWeekFromNow = moment().add(7, 'days');

    eventCollection.fetch({
      data: {
        timeMin: yesterday.toISOString(),
        timeMax: aWeekFromNow.toISOString()
      },
      success: function(collection, response, options) {
        var eventHTML = '';
        collection.each(function(event) {
          eventHTML += syntaxHighlight(event);
        });
        $('#output').html(eventHTML);
      },
      failure: function(result) {
        error('An error occurred: ', result);
      }
    });
  });
  $('#event-get-button').click(function() {  });

  gapiReadyTask = function() {
    $('#output').html('attemptToAuthorize using immediate');
    console.log(clientId);
    CalendarManager.obtainAuthorization(gapi, clientId, true, handleAuthResult);
  }

});