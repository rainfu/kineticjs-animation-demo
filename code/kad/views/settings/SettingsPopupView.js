require('/views/settings/SettingsBaseView');
require('/views/settings/SettingsAboutView');
enyo.kind({
    name: "SettingsView.SettingsPopupView",
    kind: "onyx.Popup",
    centered: true,
    floating: true,
    modal: true,
    scrim: true,
    classes: "onyx-popup-user",
    style: "height:380px;opacity:.9",
    published: {
        type: null
    },
    components: [
    {
        name: "mainView",
        layoutKind: "FittableRowsLayout",
        components: [
        {
            name: 'headerbar',
            classes: 'onyx-popup-title button',
            kind: "FittableColumns",
            components: [
            { fit: true, classes: "center", components: [
                { kind: "onyx.RadioGroup", controlClasses: "onyx-tabbutton", onActivate: "switchView", components: [
                        { name: "btnBase",active:true, content: $L("Settings") },
                        { name: "btnAbout", content: $L("About") }
		            ]
                }
                ]
            }
                ]
        },
        {
            name: "panelView",
            kind: "Panels",
            fit: true,
            draggable: false,
            arrangerKind: "CardSlideInArranger",
            classes: "mainContent",
            style: "min-height:320px;",
            components: [
                             { name: "settingsBaseView", kind: "SettingsView.SettingsBaseView"
                            },
                             { name: "settingsAboutView", kind: "SettingsView.SettingsAboutView"
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
        //this.switchPage(1);
    },
    typeChanged: function () {
        if (this.type) {
            if (this.type == 'base') {
                this.$.btnBase.setActive(true);
            }
            else if (this.type == 'about') {
                this.$.btnAbout.setActive(true);
            }
        }
    },
    switchView: function (inSender, inEvent) {
        if (inEvent.originator.getActive()) {
            var name = inEvent.originator.getName();
            switch (name) {
                case "btnBase":
                    this.$.panelView.setIndex(0);
                    break;
                case "btnAbout":
                    this.$.panelView.setIndex(1);
                    break;
            }
        }
    }
});
