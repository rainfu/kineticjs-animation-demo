enyo.kind({
    name: "SettingsView.SettingsAboutView",
    kind: "FittableRows",
    components: [
        {
            fit: true,
            name: "aboutMainView",
            kind: "Panels",
            draggable: false,
            arrangerKind: "CardSlideInArranger",
            components: [
            {
                kind: "FittableRows",
                classes: "onyx-popup-content",
                components: [
                 {
                     kind: "onyx.Groupbox",
                     components: [
                   {
                       kind: "FittableColumns",
                       components: [
                            { content: $L("Name"), classes: "label" },
                            { fit: true },
                            { name: "softname", classes: "label" }
                        ]
                   },
                    {

                        kind: "FittableColumns",
                        components: [
                            { content: $L("Version"), classes: "label" },
                            { fit: true },
                            { name: "softversion", classes: "label" }
                        ]
                    },
                    {

                        kind: "FittableColumns",
                        components: [
                            { content: $L("Home"), classes: "label" },
                            { fit: true },
                            { name: "softweb", ontap: "openWeb", content: "<i class='fa fa-home fa-lg'></i>", style: "margin-right:10px;", allowHtml: true, classes: "label" },
                        ]
                    },
                    {

                        kind: "FittableColumns",
                        components: [
                            { content: $L("Developer"), classes: "label" },
                            { fit: true },
                            { name: "softdev", style: "margin-right:10px;", classes: "label" },
                            { name: "softdevweibo", sytle: "color:red", ontap: "openDevWeibo", allowHtml: true, content: "<i class='fa fa-weibo'></i>", classes: "label" }
                        ]
                    }
		        ]
                 }
                ]
            }
          ]
        }

     ],
    create: function () {
        this.inherited(arguments);
    },
    rendered: function () {
        this.inherited(arguments);
        this.$.softname.setContent($L(app.settings.get('softname')));
        this.$.softversion.setContent($L(app.settings.get('softversion')));
        this.$.softdev.setContent($L(app.settings.get('softdev')));
    },
    switchView: function (inSender, inEvent) {
        var name = inEvent.originator.getName();
        switch (name) {
            case "feedback":
                this.switchPage(1);
                break;
            case "aboutus":
                this.switchPage(2);
                break;
            case "award":
                this.switchPage(3);
                break;

        }
    },
    switchPage: function (index) {
        this.$.aboutMainView.setIndex(index);
    },
    back: function () {
        this.switchPage(0);
    },
    openWeb: function () {
        ciiat.Utils.openUrl(app.settings.get('softweb'));
    },
    openWeibo: function () {
        ciiat.Utils.openUrl(app.settings.get('softweibo'));
    },
    openDevWeibo: function () {
        ciiat.Utils.openUrl(app.settings.get('softdevweibo'));
    }
});
