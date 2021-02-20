var core = {
  "start": function () {
    core.load();
  },
  "install": function () {
    core.load();
  },
  "load": function () {
    var context = config.interface.context;
    var url = app.interface.path + '?' + context;
    /*  */
    app.button.popup(context === "popup" ? url : '');
    /*  */
    app.contextmenu.create({
      "id": "tab", 
      "type": "radio", 
      "title": "Open in tab",  
      "checked": context === "tab",
      "contexts": ["browser_action"],
    });
    /*  */
    app.contextmenu.create({
      "id": "win", 
      "type": "radio", 
      "title": "Open in win",  
      "checked": context === "win",
      "contexts": ["browser_action"],
    });
    /*  */
    app.contextmenu.create({
      "id": "popup", 
      "type": "radio", 
      "title": "Open in popup",  
      "checked": context === "popup",
      "contexts": ["browser_action"],
    });
  }
};

app.window.on.removed(function (e) {
  if (e === app.interface.id) {
    app.interface.id = '';
  }
});

app.contextmenu.on.clicked(function (e) {
  app.interface.close(config.interface.context);
  config.interface.context = e.menuItemId;
  /*  */
  var context = config.interface.context;
  var url = app.interface.path + '?' + context;
  app.button.popup(context === "popup" ? url : '');
});

app.button.on.clicked(function () {
  var context = config.interface.context;
  var url = app.interface.path + '?' + context;
  /*  */
  if (context === "popup") app.button.popup(url);
  else {
    if (app.interface.id) {
      if (context === "tab") {
        app.tab.get(app.interface.id, function (tab) {
          if (tab) {
            app.tab.update(app.interface.id, {"active": true});
          }
        });
      }
      /*  */
      if (context === "win") {
        app.window.get(app.interface.id, function (win) {
          if (win) {
            app.window.update(app.interface.id, {"focused": true});
          }
        });
      }
    } else {
      if (context === "tab") app.tab.open(url);
      if (context === "win") app.interface.create(url);
    }
  }
});

app.on.startup(core.start);
app.on.connect(app.connect);
app.on.installed(core.install);