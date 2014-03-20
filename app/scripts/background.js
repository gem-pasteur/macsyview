chrome.app.runtime.onLaunched.addListener(function() {
  w = chrome.app.window.create('../index.html', {'state':'maximized'});
});
