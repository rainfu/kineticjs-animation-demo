enyo.kind({
    name: "MainView.GameView",
    kind: "FittableRows",
    classes: "onyx",
    published: {
        game: null
    },
    components: [
        { fit: true, name: "gameMain", classes: "gameMain", id: "gameMain" }
      ],
    create: function () {
        this.inherited(arguments);
    },
    rendered: function () {
        this.inherited(arguments);
    },
    refreshGame: function (game) {
        if (!this.cView) {
            var m_View = require('/views/main/bb/Treatment');
            this.cView = new m_View.Treatment({ el: this.$.gameMain });
            this.cView.initCanvas(this.$.gameMain.getBounds().width, this.$.gameMain.getBounds().height);
        }
        this.cView.setGame(game);
    },
    getColorTheme: function (colorTheme) {
        if (colorTheme == 'random') {
            return app.colorThemeCollection.shuffle()[0];
        }
        else {
            return app.colorThemeCollection.findWhere({ name: colorTheme });
        }
    },
    afterRoute: function (name) {
        var game = app.gameCollection.findWhere({ id: name });
        this.setGame(game);
        this.refreshGame(game);
    }
});
