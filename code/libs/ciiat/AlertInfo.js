enyo.kind({
    name: "onyx.AlertInfo",
    kind: "onyx.Popup",
    layoutKind: "FittableRowsLayout",
    classes: "enyo-fit enyo-center onyx-alert",
    centered: true,
    modal: true,
    floating: true,
    autoDismiss: false,
    scrim: true,
    published: {
        message: "",
        confirmText: "YES",
        cancelText: "NO",
        doCancel: false,
        dynamic: false,
        onCancel: (function (inContext) { }),
        onConfirm: (function (inContext) { })
    },
    components: [
		{ name: "message",style:"margin-bottom:30px",allowHtml:true, fit: true },
		{ layoutKind: "FittableColumnsLayout", components: [
			{ name: "confirm", kind: "onyx.Button", ontap: "confirm", classes: "onyx-blue", content: this.confirmText, fit: true },
			{ name: "cancel", kind: "onyx.Button",style:"width: 50% !important;margin-left:10px;", ontap: "cancel", showing: false, content: this.cancelText }
		]
		}
	],
    create: function () {
        this.inherited(arguments);
        this.messageChanged();
        this.dynamicChanged();
    },
    dynamicChanged: function (oldValue) {
        this.onCancelTextChanged();
        this.onConfirmTextChanged();
        this.onDoCancelChanged();
    },
    onCancelTextChanged: function (oldCancelText) {
        this.$.cancel.setContent(this.cancelText);
    },
    onConfirmTextChanged: function (oldConfirmText) {
        this.$.confirm.setContent(this.confirmText);
    },
    onDoCancelChanged: function (oldValue) {
        this.$.cancel.setShowing(this.doCancel);
    },
    messageChanged: function (oldMessage) {
        this.$.message.setContent(this.message);
    },
    confirm: function (inSender, inEvent) {
        this.setShowing(false);
        this.onConfirm(this.owner);
        this.destroy();
    },
    cancel: function (inSender, inEvent) {
        this.onCancel(this.owner);
        this.setShowing(false);
        this.destroy();
    }
});

function enyoAlert(message, context, options) {
	var _node = context.createComponent({});
	_node.render();
	var _alert = new onyx.AlertInfo().renderInto(_node.node);
	_alert.setMessage(message);
	_alert.setOwner(context);

	if(options != null) {
		_alert.setDoCancel( typeof options.onCancel == "function" || typeof options.cancelText == "string");
		for(var _option in options ) {
			_alert[_option] = options[_option];
		}
		_alert.setDynamic(true);
	}

	_alert.setShowing(true);
	return _alert;
}
