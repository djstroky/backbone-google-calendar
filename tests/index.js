// JSON outputting copied from http://stackoverflow.com/a/7220510/269834
var syntaxHighlight = function(json) {
  if (typeof json != 'string') {
    json = JSON.stringify(json, undefined, 2);
  }
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
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
    CalendarManager.obtainAuthorization(gapi, clientId, false, handleAuthResult);
  }

  /**
   * Handle response from authorization server.
   *
   * @param {Object} authResult Authorization result.
   */
  var handleAuthResult = function(isAuthorized, result) {
    if (isAuthorized) {
      // Hide auth UI, then load client library.
      $('#authorize-div').hide();
      $('#authorized-div').show();
      $('#output').html('authorization successful');
    } else {
      // Show auth UI, allowing the user to initiate authorization by
      // clicking authorize button.
      $('#authorize-div').show();
      $('#authorized-div').hide();
      $('#output').html('Not authorized.  Error: <pre>' + syntaxHighlight(result) + '</pre>');
    }
  }

  $('#authorize-button').click(attemptToAuthorize);
  $('#calendar-create-button').click(function() {  });
  $('#calendar-list-button').click(function() {  });
  $('#calendar-get-button').click(function() {  });
  $('#event-create-button').click(function() {  });
  $('#event-list-button').click(function() {  });
  $('#event-get-button').click(function() {  });

  gapiReadyTask = function() {
    $('#output').html('attemptToAuthorize using immediate');
    CalendarManager.obtainAuthorization(gapi, clientId, true, handleAuthResult);
  }

});