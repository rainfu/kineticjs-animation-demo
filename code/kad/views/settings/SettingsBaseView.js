enyo.kind({
    name: "SettingsView.SettingsBaseView",
    kind: "FittableRows",
    classes: "onyx-popup-content",
    components: [

            { kind: "onyx.Groupbox", components: [
            { kind: "FittableColumns", components: [
                    { content: $L("Music"), classes: "label" },
                    { fit: true },
                    { name: "isBgSound", style: "width:100px", onChange: "isBgSoundChanged", kind: "onyx.ToggleButton", onContent: $L("Yes"), offContent: $L("No") }
                 ]
            },

            { kind: "FittableColumns", components: [
                    { content: $L("Sound"), classes: "label" },
                    { fit: true },
                    { name: "isSoundEffect", style: "width:100px", onChange: "isSoundEffectChanged", kind: "onyx.ToggleButton", onContent: $L("Yes"), offContent: $L("No") }
                 ]
            }
            ]
            },

        { kind: "onyx.Groupbox", components: [
            
            { kind: "FittableColumns", style: "border-bottom:none", components: [
                    { content: $L("Reset to default"), classes: "label" },
                    { fit: true },
                    { name: "submit", ontap: "clearData", style: "width:100px", kind: "onyx.Button", content: $L("Reset") },
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
        var self = this;
        this.$.isSoundEffect.setValue(app.settings.get('isSoundEffect') ? app.settings.get('isSoundEffect') : false);
        this.$.isBgSound.setValue(app.settings.get('isBgSound') ? app.settings.get('isBgSound') : false);

    },
    isBgSoundChanged: function () {
        app.playAudio('click');
        var isBgSound = this.$.isBgSound.getValue();
        app.settings.save({
            isBgSound: isBgSound
        });
        if (isBgSound) {
            if (window.cordova || window.PhoneGap) {
                if (app.bgMedia)
                    app.bgMedia.stop();
                app.playAudio('bg');
            }
            else {
                app.playAudio('bg');
            }
        }
        else {
            app.stopAudio('bg');
        }
    },
    isSoundEffectChanged: function () {
        app.playAudio('click');
        var isSoundEffect = this.$.isSoundEffect.getValue();
        app.settings.save({
            isSoundEffect: isSoundEffect
        });
    },
    clearData: function () {
        app.playAudio('click');
        var self = this;
        enyoAlert($L("Are you sure?<br>All data will be reset!"), app.$.menuView, {
            cancelText: $L("Cancel"),
            confirmText: $L("Confirm"),
            onConfirm: function (context) {
                window.localStorage.clear();
                if (window.cordova || window.PhoneGap) {
                    location.reload();
                }
                else {
                    enyo.log('refersh local');
                    location.reload();
                }
            }
        });
    }
});
