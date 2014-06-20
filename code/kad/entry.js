require('/views/RootView');
window.app = app = new App.RootView();
enyo.ready(function () {
    app.renderInto('main');
});

