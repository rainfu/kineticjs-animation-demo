enyo.kind({
    name: "MainView.MenuView",
    kind: "FittableRows",
    classes: "onyx",
    published: {
        country: null,
        hasShowWizard: false
    },
    components: [
        {
            fit: true,
            name: "btnView",
            classes: "onyx bntView",
            kind: "FittableRows",
            components: [
            { tag: "br" },
            { kind: "onyx.Button", name: "btnStart", classes: "onyx-blue mainBtn", content: $L("Grid Animation"), ontap: "grid" },
             { tag: "br" },
            { kind: "onyx.Button", classes: "onyx-gray mainBtn", content: $L('Circle Animation'), ontap: "circle" },
            { tag: "br" },
             { kind: "onyx.Button", classes: "onyx-affirmative mainBtn", content: $L('Grating Animation'), ontap: "grating" },
            { tag: "br" },
            { kind: "onyx.Button", classes: "onyx-light mainBtn", content: $L('Settings'), ontap: "showSettings" },
            { name: "settingsPopupView", onHide: "onSettingsHide", kind: "SettingsView.SettingsPopupView" }

         ]
        }
    ],
    create: function () {
        this.inherited(arguments);
    },
    rendered: function () {
        this.inherited(arguments);
        this.start();
    },
    start: function () {
        var padding = (app.getBounds().height - 200) / 2;
        this.$.btnView.applyStyle('padding-top', padding + "px");
    },
    grid: function () {
        app.playAudio('click');
        this.startGame('grid');
    },
    circle: function () {
        app.playAudio('click');
        this.startGame('circle');
    },
    grating: function () {
        app.playAudio('click');
        this.startGame('grating');
    },
    startGame: function (type) {
        var game = app.gameCollection.at(0);
        game.set({
            score: 0,
            level: 1,
            speed: 0,
            bgType: type
        });
        app.router.navigate('main/game/' + game.get('id'), { trigger: true });
    },
    showSettings: function () {
        app.playAudio('click');
        this.$.settingsPopupView.show();
    }
});
