if (enyo && enyo.version) {
	enyo.version.onyx = "2.4.0";
}

/**
	A control that displays an icon. The icon image is specified by setting the
	*src* property to a URL.

	In Onyx, icons have a size of 32x32 pixels. Since the icon image is applied
	as a CSS background, the height and width of an icon must be set if an image
	of a different size is used.

		{kind: "onyx.Icon", src: "images/search.png"}

	When an icon should act like a button, use an <a href="#onyx.IconButton">onyx.IconButton</a>.

*/
enyo.kind({
	name: "onyx.Icon",
	published: {
		//* URL specifying path to icon image
		src: "",
		//* When true, icon is shown as disabled.
		disabled: false
	},
	classes: "onyx-icon",
	//* @protected
	create: function() {
		this.inherited(arguments);
		if (this.src) {
			this.srcChanged();
		}
		this.disabledChanged();
	},
	disabledChanged: function() {
		this.addRemoveClass("disabled", this.disabled);
	},
	srcChanged: function() {
		this.applyStyle("background-image", "url(" + enyo.path.rewrite(this.src) + ")");
	}
});

/**
	_onyx.Button_ is an [enyo.Button](#enyo.Button) with Onyx styling	applied. The
	color of the button may be customized by specifying a background color.

	The *onyx-affirmative*, *onyx-negative*, and *onyx-blue* classes provide some
	built-in presets.

		{kind: "onyx.Button", content: "Button"},
		{kind: "onyx.Button", content: "Affirmative", classes: "onyx-affirmative"},
		{kind: "onyx.Button", content: "Negative", classes: "onyx-negative"},
		{kind: "onyx.Button", content: "Blue", classes: "onyx-blue"},
		{kind: "onyx.Button", content: "Custom", style: "background-color: purple; color: #F1F1F1;"}

	For more information, see the documentation on
	[Buttons](building-apps/controls/buttons.html) in the Enyo Developer Guide.
*/
enyo.kind({
	name: "onyx.Button",
	kind: "enyo.Button",
	classes: "onyx-button enyo-unselectable",
	handlers: {
		ondown: "down",
		onenter: "enter",
		ondragfinish: "dragfinish",
		onleave: "leave",
		onup: "up"
	},
	down: function(inSender, inEvent) {
		if (this.disabled) {
			return true;
		}
		this.addClass("pressed");
		this._isPressed = true;
	},
	enter: function(inSender, inEvent) {
		if (this.disabled) {
			return true;
		}
		if(this._isPressed) {
			this.addClass("pressed");
		}
	},
	dragfinish: function(inSender, inEvent) {
		if (this.disabled) {
			return true;
		}
		this.removeClass("pressed");
		this._isPressed = false;
	},
	leave: function(inSender, inEvent) {
		if (this.disabled) {
			return true;
		}
		this.removeClass("pressed");
	},
	up: function(inSender, inEvent) {
		if (this.disabled) {
			return true;
		}
		this.removeClass("pressed");
		this._isPressed = false;
	}
});

/**
	_onyx.IconButton_ is an icon that acts like a button. The icon image is
	specified by setting the _src_ property to a URL.

	If you want to combine an icon with text inside a button, use an
	[onyx.Icon](#onyx.Icon) inside an [onyx.Button](#onyx.Button).

	The image associated with the _src_ property of the IconButton is assumed
	to be 32x64-pixel strip with the top half showing the button's normal state
	and the bottom half showing its state when hovered-over or active.

	For more information, see the documentation on
	[Buttons](building-apps/controls/buttons.html) in the Enyo Developer Guide.
*/
enyo.kind({
	name: "onyx.IconButton",
	kind: "onyx.Icon",
	published: {
		//* Used when the IconButton is part of a <a href="#enyo.Group">enyo.Group</a>, true
		//* to indicate that this is the active button of the group, false otherwise.
		active: false
	},
	classes: "onyx-icon-button",
	handlers: {
		ondown: "down",
		onenter: "enter",
		ondragfinish: "dragfinish",
		onleave: "leave",
		onup: "up"
	},
	rendered: function() {
		this.inherited(arguments);
		this.activeChanged();
	},
	tap: function() {
		if (this.disabled) {
			return true;
		}
		this.setActive(true);
	},
	down: function(inSender, inEvent) {
		if (this.disabled) {
			return true;
		}
		this.addClass("pressed");
		this._isPressed = true;
	},
	enter: function(inSender, inEvent) {
		if (this.disabled) {
			return true;
		}
		if(this._isPressed) {
			this.addClass("pressed");
		}
	},
	dragfinish: function(inSender, inEvent) {
		if (this.disabled) {
			return true;
		}
		this.removeClass("pressed");
		this._isPressed = false;
	},
	leave: function(inSender, inEvent) {
		if (this.disabled) {
			return true;
		}
		this.removeClass("pressed");
	},
	up: function(inSender, inEvent) {
		if (this.disabled) {
			return true;
		}
		this.removeClass("pressed");
		this._isPressed = false;
	},
	activeChanged: function() {
		this.bubble("onActivate");
	}
});

/**
	A box that shows or hides a check mark when clicked.
	The onChange event is fired when it is clicked. Use getValue() to fetch
	the checked status.

		{kind: "onyx.Checkbox", onchange: "checkboxClicked"}

		checkboxClicked: function(inSender) {
			if (inSender.getValue()) {
				this.log("I've been checked!");
			}
		}
*/
enyo.kind({
	name: "onyx.Checkbox",
	classes: "onyx-checkbox",
	//* @protected
	kind: enyo.Checkbox,
	tag: "div",
	handlers: {
		// prevent double onchange bubble in IE
		onclick: ""
	},
	tap: function(inSender, e) {
		if (!this.disabled) {
			this.setChecked(!this.getChecked());
			this.bubble("onchange");
		}
		return !this.disabled;
	},
	dragstart: function() {
		// Override enyo.Input dragstart handler, to allow drags to propagate for Checkbox
	}
});

/**
	_onyx.Drawer_ is now an empty kind derived from [enyo.Drawer](#enyo.Drawer).
	All of its functionality has been moved into the latter kind, found in Enyo
	Core's _ui_ module.

	For more information, see the documentation on
	[Drawers](building-apps/layout/drawers.html) in the Enyo Developer Guide.
*/

enyo.kind({
	name: "onyx.Drawer",
	kind: "enyo.Drawer"
});
/**
	A control styled to indicate that an object can be grabbed and moved.  It
	should only be used in this limited context--to indicate that dragging the
	object will result in movement.

		{kind: "onyx.Toolbar", components: [
			{kind: "onyx.Grabber", ondragstart: "grabberDragstart",
				ondrag: "grabberDrag", ondragfinish: "grabberDragFinish"},
			{kind: "onyx.Button", content: "More stuff"}
		]}

	When using a Grabber inside a Fittable control, be sure to set "noStretch: true"
	on the Fittable or else give it an explicit height.  Otherwise, the Grabber
	may not be visible.
*/
enyo.kind({
	name: "onyx.Grabber",
	classes: "onyx-grabber"
});

/**
	_onyx.Groupbox_ displays rows of controls as a vertically-stacked group. It
	is designed to have container controls as its children, with each container
	representing a row in the Groupbox.

	A header may be added by specifying an
	<a href="#onyx.GroupboxHeader">onyx.GroupboxHeader</a> as the first control
	in the Groupbox, e.g.:

		{kind: "onyx.Groupbox", components: [
			{kind: "onyx.GroupboxHeader", content: "Sounds"},
				{components: [
					{content: "System Sounds"},
					{kind: "onyx.ToggleButton", value: true}
				]},
				{kind: "onyx.InputDecorator", components: [
					{kind: "onyx.Input"}
				]}
			]}
		]}

*/
enyo.kind({
	name: "onyx.Groupbox",
	classes: "onyx-groupbox"
});

/**
	A GroupboxHeader is designed to be placed inside an <a href="#onyx.Groupbox">onyx.Groupbox</a>. When a header for a group is desired,
	make a GroupboxHeader the first control inside a Groupbox.

		{kind: "onyx.Groupbox", components: [
			{kind: "onyx.GroupboxHeader", content: "Sounds"},
			{content: "Yawn"},
			{content: "Beep"}
		]}
*/
enyo.kind({
	name: "onyx.GroupboxHeader",
	classes: "onyx-groupbox-header"
});

/**
	_onyx.Input_ is an Onyx-styled input control, derived from
	[enyo.Input](#enyo.Input). Typically, an _onyx.Input_ is placed inside an
	[onyx.InputDecorator](#onyx.InputDecorator), which provides styling, e.g.:

		{kind: "onyx.InputDecorator", components: [
			{kind: "onyx.Input", placeholder: "Enter some text...", onchange: "inputChange"}
		]}

	For more information, see the documentation on [Text
	Fields](building-apps/controls/text-fields.html) in the Enyo Developer Guide.
*/
enyo.kind({
	name: "onyx.Input",
	kind: "enyo.Input",
	classes: "onyx-input"
});

/**
	_onyx.Popup_ is an enhanced [enyo.Popup](#enyo.Popup) with built-in scrim and
	z-index handling.

	To avoid obscuring popup contents, scrims require the dialog to be floating;
	otherwise, they won't render. A modal popup will get a transparent scrim
	unless the popup isn't floating. To get a translucent scrim	when modal,
	specify _scrim: true, scrimWhenModal: false_.

	For more information, see the documentation on
	[Popups](building-apps/controls/popups.html) in the Enyo Developer Guide.
*/
enyo.kind({
	name: "onyx.Popup",
	kind: "enyo.Popup",
	classes: "onyx-popup",
	published: {
		/**
			Determines whether a scrim will appear when the dialog is modal.
			Note that modal scrims are transparent, so you won't see them.
		*/
		scrimWhenModal: true,
		//* Determines whether or not to display a scrim. Only displays scrims
		//* when floating.
		scrim: false,
		/**
			Optional class name to apply to the scrim. Be aware that the scrim
			is a singleton and you will be modifying the scrim instance used for
			other popups.
		*/
		scrimClassName: "",
		//* Lowest z-index that can be applied to a popup.
		defaultZ: 120
	},
	//* @protected
	protectedStatics: {
		count: 0,
		highestZ: 120
	},
	showingChanged: function() {
		if(this.showing) {
			onyx.Popup.count++;
			this.applyZIndex();
		}
		else {
			if(onyx.Popup.count > 0) {
				onyx.Popup.count--;
			}
		}
		this.showHideScrim(this.showing);
		this.inherited(arguments);
	},
	showHideScrim: function(inShow) {
		if (this.floating && (this.scrim || (this.modal && this.scrimWhenModal))) {
			var scrim = this.getScrim();
			if (inShow) {
				// move scrim to just under the popup to obscure rest of screen
				var i = this.getScrimZIndex();
				this._scrimZ = i;
				scrim.showAtZIndex(i);
			} else {
				scrim.hideAtZIndex(this._scrimZ);
			}
			enyo.call(scrim, "addRemoveClass", [this.scrimClassName, scrim.showing]);
		}
	},
	getScrimZIndex: function() {
		// Position scrim directly below popup
		return onyx.Popup.highestZ >= this._zIndex ? this._zIndex - 1 : onyx.Popup.highestZ;
	},
	getScrim: function() {
		// show a transparent scrim for modal popups if scrimWhenModal is true
		// if scrim is true, then show a regular scrim.
		if (this.modal && this.scrimWhenModal && !this.scrim) {
			return onyx.scrimTransparent.make();
		}
		return onyx.scrim.make();
	},
	applyZIndex: function() {
		// Adjust the zIndex so that popups will properly stack on each other.
		this._zIndex = (onyx.Popup.count * 2) + this.findZIndex() + 1;
		if (this._zIndex <= onyx.Popup.highestZ) {
			this._zIndex = onyx.Popup.highestZ + 1;
		}
		if (this._zIndex > onyx.Popup.highestZ) {
			onyx.Popup.highestZ = this._zIndex;
		}
		// leave room for scrim
		this.applyStyle("z-index", this._zIndex);
	},
	findZIndex: function() {
		// a default z value
		var z = this.defaultZ;
		if (this._zIndex) {
			z = this._zIndex;
		} else if (this.hasNode()) {
			// Re-use existing zIndex if it has one
			z = Number(enyo.dom.getComputedStyleValue(this.node, "z-index")) || z;
		}
		if (z < this.defaultZ) {
			z = this.defaultZ;
		}
		this._zIndex = z;
		return this._zIndex;
	}
});

/**
	_onyx.TextArea_ is an Onyx-styled TextArea control, derived from
	[enyo.TextArea](#enyo.TextArea). Typically, an _onyx.TextArea_ is placed
	inside an [onyx.InputDecorator](#onyx.InputDecorator), which provides styling,
	e.g.:

		{kind: "onyx.InputDecorator", components: [
			{kind: "onyx.TextArea", onchange: "inputChange"}
		]}

	For more information, see the documentation on [Text
	Fields](building-apps/controls/text-fields.html) in the Enyo Developer Guide.
*/
enyo.kind({
	name: "onyx.TextArea",
	kind: "enyo.TextArea",
	classes: "onyx-textarea"
});

/**
	_onyx.RichText_ is an Onyx-styled rich text control, derived from
	[enyo.RichText](#enyo.RichText). Typically, an _onyx.RichText_ is placed
	inside an [onyx.InputDecorator](#onyx.InputDecorator), which provides styling,
	e.g.:

		{kind: "onyx.InputDecorator", components: [
			{kind: "onyx.RichText", style: "width: 100px;", onchange: "inputChange"}
		]}

	For more information, see the documentation on [Text
	Fields](building-apps/controls/text-fields.html) in the Enyo Developer Guide.
*/
enyo.kind({
	name: "onyx.RichText",
	kind: "enyo.RichText",
	classes: "onyx-richtext"
});

/**
	_onyx.InputDecorator_ is a control that provides input styling. Any controls
	in the InputDecorator will appear to be inside an area styled as an	input.
	Usually, an InputDecorator surrounds an	<a href="#onyx.Input">onyx.Input</a>.

		{kind: "onyx.InputDecorator", components: [
			{kind: "onyx.Input"}
		]}

	Other controls, such as buttons, may be placed to the right or left of the
	input control, e.g.:

		{kind: "onyx.InputDecorator", components: [
			{kind: "onyx.IconButton", src: "search.png"},
			{kind: "onyx.Input"},
			{kind: "onyx.IconButton", src: "cancel.png"}
		]}

	Note that the InputDecorator fits around the content inside it. If the
	decorator is sized, then its contents will likely need to be sized as well.

		{kind: "onyx.InputDecorator", style: "width: 500px;", components: [
			{kind: "onyx.Input", style: "width: 100%;"}
		]}
*/
enyo.kind({
	name: "onyx.InputDecorator",
	kind: "enyo.ToolDecorator",
	tag: "label",
	classes: "onyx-input-decorator",
	published:{
		//* Set to true to make the input look focused when it's not.
		alwaysLooksFocused:false
	},
	//* @protected
	handlers: {
		onDisabledChange: "disabledChange",
		onfocus: "receiveFocus",
		onblur: "receiveBlur"
	},
	create:function() {
		this.inherited(arguments);
		this.updateFocus(false);
	},
	alwaysLooksFocusedChanged:function(oldValue) {
		this.updateFocus(this.focus);
	},
	updateFocus:function(focus) {
		this.focused = focus;
		this.addRemoveClass("onyx-focused", this.alwaysLooksFocused || this.focused);
	},
	receiveFocus: function() {
		this.updateFocus(true);
	},
	receiveBlur: function() {
		this.updateFocus(false);
	},
	disabledChange: function(inSender, inEvent) {
		this.addRemoveClass("onyx-disabled", inEvent.originator.disabled);
	}
});
/**
	A control that activates an <a href="#onyx.Tooltip">onyx.Tooltip</a>. It
	surrounds a control such as a button and displays the tooltip when the
	control generates an _onEnter_ event:

		{kind: "onyx.TooltipDecorator", components: [
			{kind: "onyx.Button", content: "Tooltip"},
			{kind: "onyx.Tooltip", content: "I'm a tooltip for a button."}
		]}

	Here's an example with an <a href="#onyx.Input">onyx.Input</a> control and a
	decorator around the input:

		{kind: "onyx.TooltipDecorator", components: [
			{kind: "onyx.InputDecorator", components: [
				{kind: "onyx.Input", placeholder: "Just an input..."}
			]},
			{kind: "onyx.Tooltip", content: "I'm a tooltip for an input."}
		]}
*/
enyo.kind({
	name: "onyx.TooltipDecorator",
	defaultKind: "onyx.Button",
	//* @protected
	classes: "onyx-popup-decorator",
	handlers: {
		onenter: "enter",
		onleave: "leave"
	},
	enter: function() {
		this.requestShowTooltip();
	},
	leave: function() {
		this.requestHideTooltip();
	},
	tap: function() {
		this.requestHideTooltip();
	},
	requestShowTooltip: function() {
		this.waterfallDown("onRequestShowTooltip");
	},
	requestHideTooltip: function() {
		this.waterfallDown("onRequestHideTooltip");
	}
});

/**
	_onyx.Tooltip_ is a kind of <a href="#onyx.Popup">onyx.Popup</a> that works
	with an	<a href="#onyx.TooltipDecorator">onyx.TooltipDecorator</a>. It
	automatically displays a tooltip when the user hovers over the decorator.
	The tooltip is positioned around the decorator where there is available
	window space.

		{kind: "onyx.TooltipDecorator", components: [
			{kind: "onyx.Button", content: "Tooltip"},
			{kind: "onyx.Tooltip", content: "I'm a tooltip for a button."}
		]}

	You may manually display the tooltip by calling its _show_ method.
*/
enyo.kind({
	name: "onyx.Tooltip",
	kind: "onyx.Popup",
	classes: "onyx-tooltip below left-arrow",
	//* If true, tooltip is automatically dismissed when user stops hovering
	//* over the decorator
	autoDismiss: false,
	//* Hovering over the decorator for this length of time (in milliseconds)
	//* causes the tooltip to appear.
	showDelay: 500,
	//* Default margin-left value
	defaultLeft: -6,
	//* @protected
	handlers: {
		onRequestShowTooltip: "requestShow",
		onRequestHideTooltip: "requestHide"
	},
	requestShow: function() {
		this.showJob = setTimeout(this.bindSafely("show"), this.showDelay);
		return true;
	},
	cancelShow: function() {
		clearTimeout(this.showJob);
	},
	requestHide: function() {
		this.cancelShow();
		return this.inherited(arguments);
	},
	showingChanged: function() {
		this.cancelShow();
		this.adjustPosition(true);
		this.inherited(arguments);
	},
	applyPosition: function(inRect) {
		var s = "";
		for (var n in inRect) {
			s += (n + ":" + inRect[n] + (isNaN(inRect[n]) ? "; " : "px; "));
		}
		this.addStyles(s);
	},
	adjustPosition: function(belowActivator) {
		if (this.showing && this.hasNode()) {
			var b = this.node.getBoundingClientRect();

			//when the tooltip bottom goes below the window height move it above the decorator
			if (b.top + b.height > window.innerHeight) {
				this.addRemoveClass("below", false);
				this.addRemoveClass("above", true);
			} else {
				this.addRemoveClass("above", false);
				this.addRemoveClass("below", true);
			}

			//when the tooltip's right edge is out of the window, align its right edge with the decorator left edge (approx)
			if (b.left + b.width > window.innerWidth){
				this.applyPosition({'margin-left': -b.width, bottom: "auto"});
				//use the right-arrow
				this.addRemoveClass("left-arrow", false);
				this.addRemoveClass("right-arrow", true);
			}
		}
	},
	resizeHandler: function() {
		//reset the tooltip to align its left edge with the decorator
		this.applyPosition({'margin-left': this.defaultLeft, bottom: "auto"});
		this.addRemoveClass("left-arrow", true);
		this.addRemoveClass("right-arrow", false);

		this.adjustPosition(true);
		this.inherited(arguments);
	}
});


/**
	A control that activates an <a href="#onyx.Menu">onyx.Menu</a>. It loosely
	couples the Menu with an activating control, which may be a button or any
	other control with an _onActivate_ event. The decorator must surround both
	the	activating control and the menu itself.	When the control is activated,
	the	menu shows itself in the correct position relative to the activator.

		{kind: "onyx.MenuDecorator", components: [
			{content: "Show menu"},
			{kind: "onyx.Menu", components: [
				{content: "1"},
				{content: "2"},
				{classes: "onyx-menu-divider"},
				{content: "Label", classes: "onyx-menu-label"},
				{content: "3"},
			]}
		]}
 */
enyo.kind({
	name: "onyx.MenuDecorator",
	kind: "onyx.TooltipDecorator",
	defaultKind: "onyx.Button",
	// selection on ios prevents tap events, so avoid.
	classes: "onyx-popup-decorator enyo-unselectable",
	//* @protected
	handlers: {
		onActivate: "activated",
		onHide: "menuHidden"
	},
	activated: function(inSender, inEvent) {
		this.requestHideTooltip();
		if (inEvent.originator.active) {
			this.menuActive = true;
			this.activator = inEvent.originator;
			this.activator.addClass("active");
			this.requestShowMenu();
		}
	},
	requestShowMenu: function() {
		this.waterfallDown("onRequestShowMenu", {activator: this.activator});
	},
	requestHideMenu: function() {
		this.waterfallDown("onRequestHideMenu");
	},
	menuHidden: function() {
		this.menuActive = false;
		if (this.activator) {
			this.activator.setActive(false);
			this.activator.removeClass("active");
		}
	},
	enter: function(inSender) {
		if (!this.menuActive) {
			this.inherited(arguments);
		}
	},
	leave: function(inSender, inEvent) {
		if (!this.menuActive) {
			this.inherited(arguments);
		}
	}
});

/**
	_onyx.Menu_ is a subkind of [onyx.Popup](#onyx.Popup) that displays a list of
	[onyx.MenuItem](#onyx.MenuItem") objects and looks like a popup menu. It is
	meant to be used together with an [onyx.MenuDecorator](#onyx.MenuDecorator).
	The decorator couples the menu with an activating control, which may be a
	button or any other control with an _onActivate_ event. When the control is
	activated, the menu shows itself in the correct position relative to the
	activator.

		{kind: "onyx.MenuDecorator", components: [
			{content: "Show menu"},
			{kind: "onyx.Menu", components: [
				{content: "1"},
				{content: "2"},
				{classes: "onyx-menu-divider"},
				{content: "Label", classes: "onyx-menu-label"},
				{content: "3"},
			]}
		]}

	For more information, see the documentation on
	[Menus](building-apps/controls/menus.html) in the Enyo Developer Guide.
 */
enyo.kind({
	name: "onyx.Menu",
	kind: "onyx.Popup",
	//* If true, prevents controls outside the menu from receiving events while
	//* the menu is showing
	modal: true,
	defaultKind: "onyx.MenuItem",
	classes: "onyx-menu",
	published: {
		//* Maximum height of the menu
		maxHeight: 200,
		//* Toggle scrolling
		scrolling: true,
		//* Scroll strategy
		scrollStrategyKind: "TouchScrollStrategy"
	},
	handlers: {
		onActivate: "itemActivated",
		onRequestShowMenu: "requestMenuShow",
		onRequestHideMenu: "requestHide"
	},
	childComponents: [
		{name: "client", kind: "enyo.Scroller"}
	],
	showOnTop: false,
	scrollerName: "client",
	create: function() {
		this.inherited(arguments);
		this.maxHeightChanged();
	},
	initComponents: function() {
		if (this.scrolling) {
			this.createComponents(this.childComponents, {isChrome: true, strategyKind: this.scrollStrategyKind});
		}
		this.inherited(arguments);
	},
	getScroller: function() {
		return this.$[this.scrollerName];
	},
	maxHeightChanged: function() {
		if (this.scrolling) {
			this.getScroller().setMaxHeight(this.maxHeight + "px");
		}
	},
	itemActivated: function(inSender, inEvent) {
		inEvent.originator.setActive(false);
		return true;
	},
	showingChanged: function() {
		this.inherited(arguments);
		if (this.scrolling) {
			this.getScroller().setShowing(this.showing);
		}
		this.adjustPosition(true);
	},
	requestMenuShow: function(inSender, inEvent) {
		if (this.floating) {
			var n = inEvent.activator.hasNode();
			if (n) {
				var r = this.activatorOffset = this.getPageOffset(n);
				this.applyPosition({top: r.top + (this.showOnTop ? 0 : r.height), left: r.left, width: r.width});
			}
		}
		this.show();
		return true;
	},
	applyPosition: function(inRect) {
		var s = "";
		for (var n in inRect) {
			s += (n + ":" + inRect[n] + (isNaN(inRect[n]) ? "; " : "px; "));
		}
		this.addStyles(s);
	},
	getPageOffset: function(inNode) {
		// getBoundingClientRect returns top/left values which are relative to the viewport and not absolute
		var r = inNode.getBoundingClientRect();

		// IE8 doesn't return window.page{X/Y}Offset & r.{height/width}
		// FIXME: Perhaps use an alternate universal method instead of conditionals
		var pageYOffset = (window.pageYOffset === undefined) ? document.documentElement.scrollTop : window.pageYOffset;
		var pageXOffset = (window.pageXOffset === undefined) ? document.documentElement.scrollLeft : window.pageXOffset;
		var rHeight = (r.height === undefined) ? (r.bottom - r.top) : r.height;
		var rWidth = (r.width === undefined) ? (r.right - r.left) : r.width;

		return {top: r.top + pageYOffset, left: r.left + pageXOffset, height: rHeight, width: rWidth};
	},
	//* @protected
	/* Adjusts the menu position to fit inside the current window size.
	/* Note that we aren't currently adjusting picker scroller heights.
	*/
	adjustPosition: function() {
		if (this.showing && this.hasNode()) {
			if (this.scrolling && !this.showOnTop) {
				this.getScroller().setMaxHeight(this.maxHeight+"px");
			}
			this.removeClass("onyx-menu-up");

			//reset the left position before we get the bounding rect for proper horizontal calculation
			if (!this.floating) {
				this.applyPosition({left: "auto"});
			}

			var b = this.node.getBoundingClientRect();
			var bHeight = (b.height === undefined) ? (b.bottom - b.top) : b.height;
			var innerHeight = (window.innerHeight === undefined) ? document.documentElement.clientHeight : window.innerHeight;
			var innerWidth = (window.innerWidth === undefined) ? document.documentElement.clientWidth : window.innerWidth;

			//position the menu above the activator if it's getting cut off, but only if there's more room above than below
			this.menuUp = (b.top + bHeight > innerHeight) && ((innerHeight - b.bottom) < (b.top - bHeight));
			this.addRemoveClass("onyx-menu-up", this.menuUp);

			//if floating, adjust the vertical positioning
			if (this.floating) {
				var r = this.activatorOffset;
				//if the menu doesn't fit below the activator, move it up
				if (this.menuUp) {
					this.applyPosition({top: (r.top - bHeight + (this.showOnTop ? r.height : 0)), bottom: "auto"});
				}
				else {
					//if the top of the menu is above the top of the activator and there's room to move it down, do so
					if ((b.top < r.top) && (r.top + (this.showOnTop ? 0 : r.height) + bHeight < innerHeight))
					{
						this.applyPosition({top: r.top + (this.showOnTop ? 0 : r.height), bottom: "auto"});
					}
				}
			}

			//adjust the horizontal positioning to keep the menu from being cut off on the right
			if ((b.right) > innerWidth) {
				if (this.floating){
					this.applyPosition({left:innerWidth-b.width});
				} else {
					this.applyPosition({left: -(b.right - innerWidth)});
				}
			}

			//finally prevent the menu from being cut off on the left
			if (b.left < 0) {
				if (this.floating){
					this.applyPosition({left: 0, right:"auto"});
				} else {
					//handle the situation where a non-floating menu is right or left aligned
					if (this.getComputedStyleValue("right") == "auto"){
						this.applyPosition({left:-b.left});
					} else {
						this.applyPosition({right:b.left});
					}
				}
			}

			//adjust the scroller height based on room available - only doing this for menus currently
			if (this.scrolling && !this.showOnTop){
				b = this.node.getBoundingClientRect(); //update to the current menu position
				var scrollerHeight;
				if (this.menuUp){
					scrollerHeight = (this.maxHeight < b.bottom) ? this.maxHeight : b.bottom;
				} else {
					scrollerHeight = ((b.top + this.maxHeight) < innerHeight) ? this.maxHeight : (innerHeight - b.top);
				}
				this.getScroller().setMaxHeight(scrollerHeight+"px");
			}
		}
	},
	resizeHandler: function() {
		this.inherited(arguments);
		this.adjustPosition();
	},
	requestHide: function(){
		this.setShowing(false);
	}
});

/**
	_MenuItem_ is a button styled to look like a menu item, intended for use in
	an <a href="#onyx.Menu">onyx.Menu</a>. When the MenuItem is tapped, it
	tells the menu to hide itself and sends an _onSelect_ event with its
	content and a reference to itself. This event and its properties may be
	received by a client application to determine which menu item was selected.

		enyo.kind({
			handlers: {
				onSelect: "itemSelected"
			},
			components: [
				{kind: "onyx.MenuDecorator", components: [
					{content: "Open Menu (floating)"},
					{kind: "onyx.Menu", floating: true, components: [
						{content: "1"},
						{content: "2"},
						{classes: "onyx-menu-divider"},
						{content: "Label", classes: "onyx-menu-label"},
						{content: "3"},
					]}
				]}
			],
			itemSelected: function(inSender, inEvent) {
				enyo.log("Menu Item Selected: " + inEvent.originator.content);
			}
		})
 */
enyo.kind({
	name: "onyx.MenuItem",
	kind: "enyo.Button",
	events: {
		/**
			Fires when the menu item is selected.

			_inEvent.selected_ contains a reference to the menu item.

			_inEvent.content_ contains the menu item's content.
		*/
		onSelect: "",
		/**
			Fires when the content of an item changes.

			_inEvent.content_ contains the content of the item.
		*/
		onItemContentChange: ""
	},
	//* @protected
	classes: "onyx-menu-item",
	tag: "div",
	create: function(){
		this.silence();
		this.inherited(arguments);
		this.unsilence();
		if (this.active){
			this.bubble("onActivate");
		}
	},
	tap: function(inSender) {
		this.inherited(arguments);
		this.bubble("onRequestHideMenu");
		this.doSelect({selected:this, content:this.content});
	},
	contentChanged: function(inOld){
		this.inherited(arguments);
		this.doItemContentChange({content: this.content});
	}
});

/**
	_onyx.Submenu_ is a control that collapses several menu items into a drawer,
	which can be opened and closed by tapping on its label. It is meant to be
	placed inside an <a href="#onyx.Menu">onyx.Menu</a>.

		{kind: "onyx.MenuDecorator", components:[
			{content: "Open menu"},
			{kind: "onyx.Menu", components:[
				{content: "One"},
				{content: "Two"},
				{kind: "onyx.Submenu", content: "Sort by...", components: [
					{content: "A"},
					{content: "B"},
					{content: "C"}
				]},
				{content: "Three"}
			]}
		]}
 */
enyo.kind({
	name: "onyx.Submenu",
	defaultKind: "onyx.MenuItem",
	initComponents: function() {
		this.createChrome([
			{
				name: "label",
				kind: "enyo.Control",
				classes: "onyx-menu-item",
				content: this.content || this.name,
				isChrome: true,
				ontap: "toggleOpen"
			},
			{kind: "onyx.Drawer", name: "client", classes: "client onyx-submenu", isChrome: true, open: false}
		]);

		this.inherited(arguments);
	},
	//* @public
	toggleOpen: function() {
		this.setOpen(!this.getOpen());
	},
	setOpen: function(open) {
		this.$.client.setOpen(open);
	},
	getOpen: function() {
		return this.$.client.getOpen();
	}
});

/**
	A control that activates an <a href="#onyx.Picker">onyx.Picker</a>. It
	loosely couples the Picker with an activating
	<a href="#onyx.PickerButton">onyx.PickerButton</a>. The decorator must
	surround both the activating button and the picker itself. When the button
	is activated, the picker shows itself in the correct position relative to
	the activator.

		{kind: "onyx.PickerDecorator", components: [
			{}, //this uses the defaultKind property of PickerDecorator to inherit from PickerButton
			{kind: "onyx.Picker", components: [
				{content: "Gmail", active: true},
				{content: "Yahoo"},
				{content: "Outlook"},
				{content: "Hotmail"}
			]}
		]}
 */
enyo.kind({
	name: "onyx.PickerDecorator",
	kind: "onyx.MenuDecorator",
	classes: "onyx-picker-decorator",
	defaultKind: "onyx.PickerButton",
	handlers: {
		onChange: "change"
	},
	change: function(inSender, inEvent) {
		this.waterfallDown("onChange", inEvent);
	}
});

/**
	_onyx.PickerButton_ is a button that, when tapped, shows an
	[onyx.Picker](#onyx.Picker). Once an item is selected, the list of items
	closes, but the item stays selected and the PickerButton displays the choice
	that was made.

	For more information, see the documentation on
	[Pickers](building-apps/controls/pickers.html) in the Enyo Developer Guide.
 */
enyo.kind({
	name: "onyx.PickerButton",
	kind: "onyx.Button",
	handlers: {
		onChange: "change"
	},
	change: function(inSender, inEvent) {
		if (inEvent.content !== undefined){
			this.setContent(inEvent.content);
		}
	}
});

/**
	_onyx.Picker_, a subkind of [onyx.Menu](#onyx.Menu), is used to display a list
	of items that may be selected. It is meant to be used together with an
	[onyx.PickerDecorator](#onyx.PickerDecorator). The decorator loosely couples
	the picker with an [onyx.PickerButton](#onyx.PickerButton)--a button that,
	when tapped, shows the picker. Once an item is selected, the list of items
	closes, but the item stays selected and the PickerButton displays the choice
	that was made.

	To initialize the Picker to a particular value, set the _active_ property to
	true for the item that should be selected.

		{kind: "onyx.PickerDecorator", components: [
			{}, //this uses the defaultKind property of PickerDecorator to inherit from PickerButton
			{kind: "onyx.Picker", components: [
				{content: "Gmail", active: true},
				{content: "Yahoo"},
				{content: "Outlook"},
				{content: "Hotmail"}
			]}
		]}

	Each item in the list is an [onyx.MenuItem](#onyx.MenuItem), so a client app
	may listen for an _onSelect_ event with the item to determine which picker
	item was selected.

	For more information, see the documentation on
	[Pickers](building-apps/controls/pickers.html) in the Enyo Developer Guide.
 */
enyo.kind({
	name: "onyx.Picker",
	kind: "onyx.Menu",
	classes: "onyx-picker enyo-unselectable",
	published: {
		//* Currently selected item, if any
		selected: null
	},
	events: {
		/**
			Fires when the currently selected item changes.

			_inEvent.selected_ contains the currently selected item.

			_inEvent.content_ contains the content of the currently selected item.
		*/
		onChange: ""
	},
	handlers: {
		onItemContentChange: 'itemContentChange'
	},
	/**
		Set to true to render the picker in a floating layer outside of other
		controls. This can be used to guarantee that the picker will be shown
		on top of other controls.
	*/
	floating: true,
	//* @protected
	// overrides default value from onyx.Menu
	showOnTop: true,
	initComponents: function() {
		this.setScrolling(true);
		this.inherited(arguments);
	},
	showingChanged: function() {
		this.getScroller().setShowing(this.showing);
		this.inherited(arguments);
		if (this.showing && this.selected) {
			this.scrollToSelected();
		}
	},
	scrollToSelected: function() {
		this.getScroller().scrollToControl(this.selected, !this.menuUp);
	},
	itemActivated: function(inSender, inEvent) {
		this.processActivatedItem(inEvent.originator);
		return this.inherited(arguments);
	},
	processActivatedItem: function(inItem) {
		if (inItem.active) {
			this.setSelected(inItem);
		}
	},
	selectedChanged: function(inOld) {
		if (inOld) {
			inOld.removeClass("selected");
		}
		if (this.selected) {
			this.selected.addClass("selected");
			this.doChange({selected: this.selected, content: this.selected.content});
		}
	},
	itemContentChange: function(inSender, inEvent){
		if(inEvent.originator == this.selected){
			this.doChange({selected: this.selected, content: this.selected.content});
		}
	},
	resizeHandler: function() {
		this.inherited(arguments);
		this.adjustPosition();
	}
});

/**
	_onyx.FlyweightPicker_, a subkind of <a href="#onyx.Picker">onyx.Picker</a>,
	is a picker	that employs the flyweight pattern. It is used to display a
	large list of selectable items.	As with
	<a href="#enyo.FlyweightRepeater">enyo.FlyweightRepeater</a>,
	the _onSetupItem_ event allows for customization of item rendering.

	To initialize the FlyweightPicker to a particular value, call _setSelected_
	with the index of the item you wish to select, and call _setContent_ with
	the item that should be shown in the activator button.

	FlyweightPicker will send an _onSelect_ event with a selected item's
	information. This can be received by a client application to determine which
	item was selected.

		enyo.kind({
			handlers: {
				onSelect: "itemSelected"
			},
			components: [
				{kind: "onyx.PickerDecorator", components: [
					{},
					{name: "yearPicker", kind: "onyx.FlyweightPicker", count: 200,
						onSetupItem: "setupYear", components: [
							{name: "year"}
						]
					}
				]}
			],
			create: function() {
				var d = new Date();
				var y = d.getYear();
				this.$.yearPicker.setSelected(y);
				this.$.year.setContent(1900+y);
			},
			setupYear: function(inSender, inEvent) {
				this.$.year.setContent(1900+inEvent.index);
			},
			itemSelected: function(inSender, inEvent) {
				enyo.log("Picker Item Selected: " + inEvent.selected.content);
			}
		})
 */
enyo.kind({
	name: "onyx.FlyweightPicker",
	kind: "onyx.Picker",
	classes: "onyx-flyweight-picker",
	published: {
		//* How many rows to render
		count: 0
	},
	events: {
		/**
			Fires when a row is being initialized. The _index_ property contains
			the row index, while the _flyweight_ property contains the row
			control, for decoration.
		*/
		onSetupItem: "",
		/**
			Fires when an item is selected. The _content_ property contains the
			content of the selected item, while the _selected_ property contains
			its row index.
		*/
		onSelect: ""
	},
	//* @protected
	handlers: {
		onSelect: "itemSelect"
	},
	components: [
		{name: "scroller", kind: "enyo.Scroller", strategyKind: "TouchScrollStrategy", components: [
			{name: "flyweight", kind: "FlyweightRepeater", noSelect: true, ontap: "itemTap"}
		]}
	],
	scrollerName: "scroller",
	initComponents: function() {
		this.controlParentName = 'flyweight';
        this.inherited(arguments);
		//Force the flyweight's client control (MenuItem is default) to activate. This will
		//result in a call to processActivatedItem which preps our picker selection logic.
		//This is a workaround for changes caused by ENYO-1609 which resulted in ENYO-1611.
		this.$.flyweight.$.client.children[0].setActive(true);
    },
	create: function() {
		this.inherited(arguments);
		this.countChanged();
	},
	rendered: function() {
		this.inherited(arguments);
		this.selectedChanged();
	},
	scrollToSelected: function() {
		var n = this.$.flyweight.fetchRowNode(this.selected);
		this.getScroller().scrollToNode(n, !this.menuUp);
	},
	countChanged: function() {
		this.$.flyweight.count = this.count;
	},
	processActivatedItem: function(inItem) {
		this.item = inItem;
	},
	selectedChanged: function(inOld) {
		if (!this.item) {
			return;
		}
		if (inOld != null) {
			this.item.removeClass("selected");
			this.$.flyweight.renderRow(inOld);
		}
		var n;
		if (this.selected != null) {
			this.item.addClass("selected");
			this.$.flyweight.renderRow(this.selected);
			// need to remove the class from control to make sure it won't apply to other rows
			this.item.removeClass("selected");
			n = this.$.flyweight.fetchRowNode(this.selected);
		}
		this.doChange({selected: this.selected, content: n && n.textContent || this.item.content});
	},
	itemTap: function(inSender, inEvent) {
		this.setSelected(inEvent.rowIndex);
		//Send the select event that we want the client to receive.
		this.doSelect({selected: this.item, content: this.item.content});
	},
	itemSelect: function(inSender, inEvent) {
		//Block all select events that aren't coming from this control. This is to prevent
		// select events from MenuItems since they won't have the correct value in a Flyweight context.
		if (inEvent.originator != this) {
			return true;
		}
	}
});

/**
	_onyx.DatePicker_ is a group of <a href="#onyx.Picker">onyx.Picker</a>
	controls displaying the current date. The user may change the _day_,
	_month_, and _year_ values.

	By default, _DatePicker_ tries to determine the current locale and use its
	rules to format the date (including the month name). In order to do this
	successfully, the _ilib_ library must be loaded; if it is not loaded, the
	control defaults to using standard U.S. date format.

	The _day_ field is automatically populated with the proper number of days
	for the selected month and year.
 */
enyo.kind({
	name: "onyx.DatePicker",
	classes: "onyx-toolbar-inline",
	published: {
		//* If true, control is shown as disabled, and user can't select new values
		disabled: false,
		/**
			Current locale used for formatting. Can be set after control
			creation, in which case the control will be updated to reflect the
			new value.
		*/
		locale: "en-US",
		//* If true, the day field is hidden
		dayHidden: false,
		//* If true, the month field is hidden
		monthHidden: false,
		//* If true, the year field is hidden
		yearHidden: false,
		//* Optional minimum year value
		minYear: 1900,
		//* Optional maximum year value
		maxYear: 2099,
		/**
			The current Date object. When a Date object is passed to _setValue_,
			the control is updated to reflect the new value. _getValue_ returns
			a Date object.
		*/
		value: null
	},
	events: {
		/**
			Fires when one of the DatePicker's fields is selected.

			_inEvent.name_ contains the name of the DatePicker that generated
			the event.

			_inEvent.value_ contains the current Date value of the control.
		*/
		onSelect: ""
	},
	create: function() {
		this.inherited(arguments);
		if (ilib) {
			this.locale = ilib.getLocale();
		}
		this.initDefaults();
	},
	initDefaults: function() {
		var months;
		//Attempt to use the ilib library if it is loaded
		if (ilib) {
			months = [];
			this._tf = new ilib.DateFmt({locale:this.locale, timezone: "local"});
			months = this._tf.getMonthsOfYear({length: 'long'});
		}
		// Fall back to en_US as default
		else {
			months = [undefined, "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
			this.localeInfo.getMonthsOfYear = function() {
				return months;
			};
		}

		// use iLib's getTemplate as that returns locale-specific ordering
		this.setupPickers(this._tf ? this._tf.getTemplate() : 'mdy');

		this.dayHiddenChanged();
		this.monthHiddenChanged();
		this.yearHiddenChanged();

		//Fill month, year & day pickers with values
		var d = this.value = this.value || new Date();
		for (var i=0,m; (m=months[i + 1]); i++) {
			this.$.monthPicker.createComponent({content: m, value:i, active: i==d.getMonth()});
		}

		var y = d.getFullYear();
		this.$.yearPicker.setSelected(y-this.minYear);

		for (i=1; i<=this.monthLength(d.getYear(), d.getMonth()); i++) {
			this.$.dayPicker.createComponent({content:i, value:i, active: i==d.getDate()});
		}
	},
	monthLength: function(inYear, inMonth) {
		// determine number of days in a particular month/year
		return 32 - new Date(inYear, inMonth, 32).getDate();
	},
	setupYear: function(inSender, inEvent) {
		this.$.year.setContent(this.minYear+inEvent.index);
		return true;
	},
	setupPickers: function(ordering) {
		var orderingArr = ordering.split("");
		var o,f,l;
		var createdYear = false, createdMonth = false, createdDay = false;
		for(f = 0, l = orderingArr.length; f < l; f++) {
			o = orderingArr[f];
			switch (o.toLowerCase()){
			case 'd':
				if (!createdDay) {
					this.createDay();
					createdDay = true;
				}
				break;
			case 'm':
				if (!createdMonth) {
					this.createMonth();
					createdMonth = true;
				}
				break;
			case 'y':
				if (!createdYear) {
					this.createYear();
					createdYear = true;
				}
				break;
			default:
				break;
			}
		}
	},
	createYear: function() {
		var yearCount = this.maxYear - this.minYear;
		this.createComponent(
			{kind: "onyx.PickerDecorator", onSelect: "updateYear", components: [
				{classes:"onyx-datepicker-year", name: "yearPickerButton",  disabled: this.disabled},
				{name: "yearPicker", kind: "onyx.FlyweightPicker", count: ++yearCount, onSetupItem: "setupYear", components: [
					{name: "year"}
				]}
			]}
		);
	},
	createMonth: function() {
		this.createComponent(
			{kind: "onyx.PickerDecorator", onSelect: "updateMonth", components: [
				{classes:"onyx-datepicker-month", name: "monthPickerButton",  disabled: this.disabled},
				{name: "monthPicker", kind: "onyx.Picker"}
			]}
		);
	},
	createDay: function() {
		this.createComponent(
			{kind: "onyx.PickerDecorator", onSelect: "updateDay", components: [
				{classes:"onyx-datepicker-day", name: "dayPickerButton",  disabled: this.disabled},
				{name: "dayPicker", kind: "onyx.Picker"}
			]}
		);
	},
	localeChanged: function() {
		this.refresh();
	},
	dayHiddenChanged: function() {
		this.$.dayPicker.getParent().setShowing(this.dayHidden ? false : true);
	},
	monthHiddenChanged: function() {
		this.$.monthPicker.getParent().setShowing(this.monthHidden ? false : true);
	},
	yearHiddenChanged: function() {
		this.$.yearPicker.getParent().setShowing(this.yearHidden ? false : true);
	},
	minYearChanged: function() {
		this.refresh();
	},
	maxYearChanged: function() {
		this.refresh();
	},
	valueChanged: function(){
		this.refresh();
	},
	disabledChanged: function() {
		this.$.yearPickerButton.setDisabled(this.disabled);
		this.$.monthPickerButton.setDisabled(this.disabled);
		this.$.dayPickerButton.setDisabled(this.disabled);
	},
	updateDay: function(inSender, inEvent){
		var date = this.calcDate(this.value.getFullYear(),
								this.value.getMonth(),
								inEvent.selected.value);
		this.doSelect({name:this.name, value:date});
		this.setValue(date);
		return true;
	},
	updateMonth: function(inSender, inEvent){
		var date = this.calcDate(this.value.getFullYear(),
								inEvent.selected.value,
								this.value.getDate());
		this.doSelect({name:this.name, value:date});
		this.setValue(date);
		return true;
	},
	updateYear: function(inSender, inEvent){
		//if the node wasn't found (issue around FlyWeightRepeater/Picker) don't update the picker
		if (inEvent.originator.selected != -1) {
			var date = this.calcDate(this.minYear + inEvent.originator.selected,
									this.value.getMonth(),
									this.value.getDate());
			this.doSelect({name:this.name, value:date});
			this.setValue(date);
		}
		return true;
	},
	calcDate: function(year, month, day){
		return new Date(year,month,day,
						this.value.getHours(),
						this.value.getMinutes(),
						this.value.getSeconds(),
						this.value.getMilliseconds());
	},
	refresh: function(){
		this.destroyClientControls();
		this.initDefaults();
		this.render();
	}
});

/**
	_onyx.TimePicker_ is a group of <a href="#onyx.Picker">onyx.Picker</a>
	controls displaying the current time. The user may change the hour, minute,
	and AM/PM values.

	By default, _TimePicker_ tries to determine the current locale and use its
	rules to format the time (including AM/PM). In order to do this
	successfully, the _ilib_ library must be loaded; if it is not loaded, the
	control defaults to using standard U.S. time format.
 */
enyo.kind({
	name: "onyx.TimePicker",
	classes: "onyx-toolbar-inline",
	published: {
		//* If true, control is shown as disabled, and user can't select new values
		disabled: false,
		/**
			Current locale used for formatting. Can be set after control
			creation, in which case the control will be updated to reflect the
			new value.
		*/
		locale: "en-US",
		//* If true, 24-hour time is used. This is reset when locale is changed.
		is24HrMode: null,
		/**
			The current Date object. When a Date object is passed to _setValue_,
			the control is updated to reflect the new value. _getValue_ returns
			a Date object.
		*/
		value: null
	},
	events: {
		/**
			Fires when one of the TimePicker's fields is selected.

			_inEvent.name_ contains the name of the TimePicker that generated
			the event.

			_inEvent.value_ contains the current Date value of the control.
		*/
		onSelect: ""
	},
	create: function() {
		this.inherited(arguments);
		if (ilib) {
			this.locale = ilib.getLocale();
		}
		this.initDefaults();
	},
	initDefaults: function() {
		// defaults that match en_US for when ilib isn't loaded
		this._strAm = "AM";
		this._strPm = "PM";
		// Attempt to use the ilib lib (ie assume it is loaded)
		if (ilib) {
			this._tf = new ilib.DateFmt({locale:this.locale});

			var objAmPm = new ilib.DateFmt({locale:this.locale, type: "time", template: "a"});
			var timeobj = ilib.Date.newInstance({locale:this.locale, hour: 1});
			this._strAm = objAmPm.format(timeobj);
			timeobj.hour = 13;
			this._strPm = objAmPm.format(timeobj);

			if (this.is24HrMode == null) {
				this.is24HrMode = (this._tf.getClock() == "24");
			}
		}
		else if (this.is24HrMode == null) {
			this.is24HrMode = false;
		}

		this.setupPickers(this._tf ? this._tf.getTimeComponents() : 'hma');

		var d = this.value = this.value || new Date();

		// create hours
		var i;
		if (!this.is24HrMode){
			var h = d.getHours();
			h = (h === 0) ? 12 : h;
			for (i=1; i<=12; i++) {
				this.$.hourPicker.createComponent({content: i, value:i, active: (i == (h>12 ? h%12 : h))});
			}
		} else {
			for (i=0; i<24; i++) {
				this.$.hourPicker.createComponent({content: i, value:i, active: (i == d.getHours())});
			}
		}

		// create minutes
		for (i=0; i<=59; i++) {
			this.$.minutePicker.createComponent({content: (i < 10) ? ("0"+i):i, value:i, active: i == d.getMinutes()});
		}

		// create am/pm
		if (d.getHours() >= 12) {
			this.$.ampmPicker.createComponents([{content: this._strAm},{content:this._strPm, active: true}]);
		}
		else {
			this.$.ampmPicker.createComponents([{content: this._strAm, active: true},{content:this._strPm}]);
		}
		this.$.ampmPicker.getParent().setShowing(!this.is24HrMode);
	},
	setupPickers: function(timeComponents) {
		// order is always fixed hours, minutes, am/pm
		if (timeComponents.indexOf('h') !== -1) {
			this.createHour();
		}
		if (timeComponents.indexOf('m') !== -1) {
			this.createMinute();
		}
		if (timeComponents.indexOf('a') !== -1) {
			this.createAmPm();
		}
	},
	createHour: function() {
		this.createComponent(
			{kind: "onyx.PickerDecorator", onSelect: "updateHour", components: [
				{classes:"onyx-timepicker-hour", name: "hourPickerButton", disabled: this.disabled},
				{name: "hourPicker", kind: "onyx.Picker"}
			]}
		);
	},
	createMinute: function() {
		this.createComponent(
			{kind: "onyx.PickerDecorator", onSelect: "updateMinute", components: [
				{classes:"onyx-timepicker-minute", name: "minutePickerButton", disabled: this.disabled},
				{name: "minutePicker", kind: "onyx.Picker"}
			]}
		);
	},
	createAmPm: function() {
		this.createComponent(
			{kind: "onyx.PickerDecorator", onSelect: "updateAmPm", components: [
				{classes:"onyx-timepicker-ampm", name: "ampmPickerButton", disabled: this.disabled},
				{name: "ampmPicker", kind: "onyx.Picker"}
			]}
		);
	},
	disabledChanged: function() {
		this.$.hourPickerButton.setDisabled(this.disabled);
		this.$.minutePickerButton.setDisabled(this.disabled);
		this.$.ampmPickerButton.setDisabled(this.disabled);
	},
	localeChanged: function() {
		//reset 24 hour mode when changing locales
		this.is24HrMode = null;
		this.refresh();
	},
	is24HrModeChanged: function() {
		this.refresh();
	},
	valueChanged: function(){
		this.refresh();
	},
	updateHour: function(inSender, inEvent){
		var h = inEvent.selected.value;
		if (!this.is24HrMode){
			var ampm = this.$.ampmPicker.getParent().controlAtIndex(0).content;
			h = h + (h == 12 ? -12 : 0) + (this.isAm(ampm) ? 0 : 12);
		}
		this.setValue(this.calcTime(h, this.value.getMinutes()));
		this.doSelect({name:this.name, value:this.value});
		return true;
	},
	updateMinute: function(inSender, inEvent){
		this.setValue(this.calcTime(this.value.getHours(), inEvent.selected.value));
		this.doSelect({name:this.name, value:this.value});
		return true;
	},
	updateAmPm: function(inSender, inEvent){
		var h = this.value.getHours();
		if (!this.is24HrMode){
			h = h + (h > 11 ? (this.isAm(inEvent.content) ? -12 : 0) : (this.isAm(inEvent.content) ? 0 : 12));
		}
		this.setValue(this.calcTime(h, this.value.getMinutes()));
		this.doSelect({name:this.name, value:this.value});
		return true;
	},
	calcTime: function(hour, minute){
		return new Date(this.value.getFullYear(),
						this.value.getMonth(),
						this.value.getDate(),
						hour, minute,
						this.value.getSeconds(),
						this.value.getMilliseconds());
	},
	isAm: function(value){
		if (value == this._strAm){
			return true;
		} else {
			return false;
		}
	},
	refresh: function(){
		this.destroyClientControls();
		this.initDefaults();
		this.render();
	}
});

/**
	_onyx.RadioButton_ is a radio button designed for use within an
	[onyx.RadioGroup](#onyx.RadioGroup).

	For more information, see the documentation on
	[Buttons](building-apps/controls/buttons.html) in the Enyo Developer Guide.
*/
enyo.kind({
	name: "onyx.RadioButton",
	kind: "enyo.Button",
	classes: "onyx-radiobutton"
});

/**
	A group of <a href="#onyx.RadioButton">onyx.RadioButton</a> objects
	laid out horizontally. Within the same radio group, tapping on one radio button
	will release any previously tapped radio button.

		{kind: "onyx.RadioGroup", components: [
			{content: "foo", active: true},
			{content: "bar"},
			{content: "baz"}
		]}
*/
enyo.kind({
	name: "onyx.RadioGroup",
	kind: "enyo.Group",
	defaultKind: "onyx.RadioButton",
	//* @protected
	// set to true to provide radio button behavior
	highlander: true
});

/**
	_onyx.ToggleButton_ is a control that looks like a switch with labels for two
	states. Each time a	ToggleButton is tapped, it switches its value and fires an
	_onChange_ event.

	To get the value of the button, call _getValue()_.

	For more information, see the documentation on
	[Buttons](building-apps/controls/buttons.html) in the Enyo Developer Guide.
*/
enyo.kind({
	name: "onyx.ToggleButton",
	classes: "onyx-toggle-button",
	published: {
		//* Used when the ToggleButton is part of a <a href="#enyo.Group">enyo.Group</a>, true
		//* to indicate that this is the active button of the group, false otherwise.
		active: false,
		//* Boolean indicating whether toggle button is currently in the "on"
		//* state
		value: false,
		//* Label for toggle button's "on" state
		onContent: "On",
		//* Label for toggle button's "off" state
		offContent: "Off",
		//* If true, toggle button cannot be tapped and thus will not generate
		//* any events
		disabled: false
	},
	events: {
		/**
			Fires when the user changes the value of the toggle button,	but not
			when the value is changed programmatically.

			_inEvent.value_ contains the value of the toggle button.
		*/
		onChange: ""
	},
	//* @protected
	handlers: {
		ondragstart: "dragstart",
		ondrag: "drag",
		ondragfinish: "dragfinish"
	},
	components: [
		{name: "contentOn", classes: "onyx-toggle-content on"},
		{name: "contentOff", classes: "onyx-toggle-content off"},
		{classes: "onyx-toggle-button-knob"}
	],
	create: function() {
		this.inherited(arguments);
		this.value = Boolean(this.value || this.active);
		this.onContentChanged();
		this.offContentChanged();
		this.disabledChanged();
	},
	rendered: function() {
		this.inherited(arguments);
		this.updateVisualState();
	},
	updateVisualState: function() {
		this.addRemoveClass("off", !this.value);
		this.$.contentOn.setShowing(this.value);
		this.$.contentOff.setShowing(!this.value);
		this.setActive(this.value);
	},
	valueChanged: function() {
		this.updateVisualState();
		this.doChange({value: this.value});
	},
	activeChanged: function() {
		this.setValue(this.active);
		this.bubble("onActivate");
	},
	onContentChanged: function() {
		this.$.contentOn.setContent(this.onContent || "");
		this.$.contentOn.addRemoveClass("empty", !this.onContent);
	},
	offContentChanged: function() {
		this.$.contentOff.setContent(this.offContent || "");
		this.$.contentOff.addRemoveClass("empty", !this.onContent);
	},
	disabledChanged: function() {
		this.addRemoveClass("disabled", this.disabled);
	},
	updateValue: function(inValue) {
		if (!this.disabled) {
			this.setValue(inValue);
		}
	},
	tap: function() {
		this.updateValue(!this.value);
	},
	dragstart: function(inSender, inEvent) {
		if (inEvent.horizontal) {
			inEvent.preventDefault();
			this.dragging = true;
			this.dragged = false;
			return true;
		}
	},
	drag: function(inSender, inEvent) {
		if (this.dragging) {
			var d = inEvent.dx;
			if (Math.abs(d) > 10) {
				this.updateValue(d > 0);
				this.dragged = true;
			}
			return true;
		}
	},
	dragfinish: function(inSender, inEvent) {
		this.dragging = false;
		if (this.dragged) {
			inEvent.preventTap();
		}
	}
});
/**
	_onyx.ToggleIconButton_ is an icon that acts like a toggle switch. The icon
	image is specified by setting the _src_ property to a URL.

		{kind: "onyx.ToggleIconButton", src: "images/search.png", ontap: "buttonTap"}

	The image associated with the _src_ property is assumed	to be a 32x64-pixel
	strip, with the top half showing the button's normal state and the bottom
	half showing its state when hovered-over or active.
*/

enyo.kind({
	name: "onyx.ToggleIconButton",
	kind: "onyx.Icon",
	published: {
		/**
			Used when the ToggleIconButton is part of an enyo.Group; set to true
			to indicate that this is the active button in the group.
		*/
		active: false,
		//* Boolean indicating whether the button is currently in the "on" state
		value: false
	},
	events: {
		/**
			Fires when the user changes the value of the toggle button, but not
			when the value is changed programmatically.
		*/
		onChange: ""
	},
	classes: "onyx-icon-button onyx-icon-toggle",
	//* @protected
	activeChanged: function() {
		this.addRemoveClass("active", this.value);
		this.bubble("onActivate");
	},
	updateValue: function(inValue) {
		if (!this.disabled) {
			this.setValue(inValue);
			this.doChange({value: this.value});
		}
	},
	tap: function() {
		this.updateValue(!this.value);
	},
	valueChanged: function() {
		this.setActive(this.value);
	},
	create: function() {
		this.inherited(arguments);
		this.value = Boolean(this.value || this.active);
	},
	rendered: function() {
		this.inherited(arguments);
		this.valueChanged();
		this.removeClass('onyx-icon');
	}
});
/**
	_onyx.Toolbar_ is a horizontal bar containing controls used to perform common
	UI actions.

	A toolbar customizes the styling of the controls it hosts, including buttons,
	icons, and inputs.

		{kind: "onyx.Toolbar", components: [
			{kind: "onyx.Button", content: "Favorites"},
			{kind: "onyx.InputDecorator", components: [
				{kind: "onyx.Input", placeholder: "Enter a search term..."}
			]},
			{kind: "onyx.IconButton", src: "go.png"}
		]}

	For more information, see the documentation on
	[Toolbars](building-apps/controls/toolbars.html) in the Enyo Developer Guide.
*/
enyo.kind({
	name: "onyx.Toolbar",
	classes: "onyx onyx-toolbar onyx-toolbar-inline",
	create: function(){
		this.inherited(arguments);

		//workaround for android 4.0.3 rendering glitch (ENYO-674)
		if (this.hasClass('onyx-menu-toolbar') && (enyo.platform.android >= 4)){
			this.applyStyle("position", "static");
		}
	}
});

/**
	_onyx.ProgressBar_ is a  control that shows the current progress of a
	process in a horizontal bar.

		{kind: "onyx.ProgressBar", progress: 10}

	To animate progress changes, call the _animateProgressTo()_ method:

		this.$.progressBar.animateProgressTo(50);

	You may customize the color of the bar by applying a style via the
	_barClasses_ property, e.g.:

		{kind: "onyx.ProgressBar", barClasses: "onyx-dark"}

	For more information, see the documentation on [Progress
	Indicators](building-apps/controls/progress-indicators.html) in the Enyo
	Developer Guide.
*/
enyo.kind({
	name: "onyx.ProgressBar",
	classes: "onyx-progress-bar",
	published: {
		//* Current position of progress bar
		progress: 0,
		//* Minimum progress value (i.e., no progress made)
		min: 0,
		//* Maximum progress value (i.e., process complete)
		max: 100,
		//* CSS classes to apply to progress bar
		barClasses: "",
		//* If true, stripes are shown in progress bar
		showStripes: true,
		//* If true (and _showStripes_ is true), stripes shown in progress bar
		//* are animated
		animateStripes: true,
		//* Value increment that a sliders can be "snapped to" in either direction
		increment: 0
	},
	events: {
		//* Fires when progress bar finishes animating to a position.
		onAnimateProgressFinish: ""
	},
	//* @protected
	components: [
		{name: "progressAnimator", kind: "enyo.Animator", onStep: "progressAnimatorStep", onEnd: "progressAnimatorComplete"},
		{name: "bar", classes: "onyx-progress-bar-bar"}
	],
	create: function() {
		this.inherited(arguments);
		this.progressChanged();
		this.barClassesChanged();
		this.showStripesChanged();
		this.animateStripesChanged();
	},
	barClassesChanged: function(inOld) {
		this.$.bar.removeClass(inOld);
		this.$.bar.addClass(this.barClasses);
	},
	showStripesChanged: function() {
		this.$.bar.addRemoveClass("striped", this.showStripes);
	},
	animateStripesChanged: function() {
		this.$.bar.addRemoveClass("animated", this.animateStripes);
	},
	progressChanged: function() {
		this.progress = this.clampValue(this.min, this.max, this.progress);
		var p = this.calcPercent(this.progress);
		this.updateBarPosition(p);
	},
	calcIncrement: function(inValue) {
		return (Math.round(inValue / this.increment) * this.increment);
	},
	clampValue: function(inMin, inMax, inValue) {
		return Math.max(inMin, Math.min(inValue, inMax));
	},
	calcRatio: function(inValue) {
		return (inValue - this.min) / (this.max - this.min);
	},
	calcPercent: function(inValue) {
		return this.calcRatio(inValue) * 100;
	},
	updateBarPosition: function(inPercent) {
		this.$.bar.applyStyle("width", inPercent + "%");
	},
	//* @public
	//* Animates progress to the given value.
	animateProgressTo: function(inValue) {
		this.$.progressAnimator.play({
			startValue: this.progress,
			endValue: inValue,
			node: this.hasNode()
		});
	},
	//* @protected
	progressAnimatorStep: function(inSender) {
		this.setProgress(inSender.value);
		return true;
	},
	progressAnimatorComplete: function(inSender) {
		this.doAnimateProgressFinish(inSender);
		return true;
	}
});

/**
	_onyx.ProgressButton_ is a progress bar that has a cancel button on the right
	and may have other controls inside of it.

		{kind: "onyx.ProgressButton"},
		{kind: "onyx.ProgressButton", barClasses: "onyx-light", progress: 20, components: [
			{content: "0"},
			{content: "100", style: "float: right;"}
		]}

	For more information, see the documentation on [Progress
	Indicators](building-apps/controls/progress-indicators.html) in the Enyo
	Developer Guide.
*/
enyo.kind({
	name: "onyx.ProgressButton",
	kind: "onyx.ProgressBar",
	classes: "onyx-progress-button",
	events: {
		//* Fires when cancel button is tapped.
		onCancel: ""
	},
	//* @protected
	components: [
		{name: "progressAnimator", kind: "enyo.Animator", onStep: "progressAnimatorStep", onEnd: "progressAnimatorComplete"},
		{name: "bar", classes: "onyx-progress-bar-bar onyx-progress-button-bar"},
		{name: "client", classes: "onyx-progress-button-client"},
		{kind: "onyx.Icon", src: "$lib/onyx/images/progress-button-cancel.png", classes: "onyx-progress-button-icon", ontap: "cancelTap"}
	],
	cancelTap: function() {
		this.doCancel();
	}
});

/**
	_onyx.Scrim_ provides an overlay that will prevent taps from propagating to
	the controls that it covers.  A scrim may be "floating" or "non-floating". A
	floating scrim will fill the entire viewport, while a non-floating scrim
	will be constrained	by the dimensions of its container.

	The scrim should have a CSS class of _"onyx-scrim-transparent"_,
	_"onyx-scrim-translucent"_,	or any other class that has
	_"pointer-events: auto"_ in its style properties.

	You may specify the z-index at which you want the scrim to appear by calling
	_showAtZIndex_; if you do so, you must call _hideAtZIndex_ with the same
	value to hide the scrim.
*/

enyo.kind({
	name: "onyx.Scrim",
	//* Current visibility state of scrim
	showing: false,
	classes: "onyx-scrim enyo-fit",
	/**
		If true, scrim is rendered in a floating layer outside of other
		controls. This can be used to guarantee that the scrim will be shown
		on top of other controls.
	*/
	floating: false,
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.zStack = [];
		if (this.floating) {
			this.setParent(enyo.floatingLayer);
		}
	},
	showingChanged: function() {
	// auto render when shown.
		if (this.floating && this.showing && !this.hasNode()) {
			this.render();
		}
		this.inherited(arguments);
		//this.addRemoveClass(this.showingClassName, this.showing);
	},
	//* @protected
	addZIndex: function(inZIndex) {
		if (enyo.indexOf(inZIndex, this.zStack) < 0) {
			this.zStack.push(inZIndex);
		}
	},
	removeZIndex: function(inControl) {
		enyo.remove(inControl, this.zStack);
	},
	//* @public
	//* Shows scrim at the specified z-index. Note: If you use _showAtZIndex_,
	//* you must call _hideAtZIndex_ to properly unwind the z-index stack.
	showAtZIndex: function(inZIndex) {
		this.addZIndex(inZIndex);
		if (inZIndex !== undefined) {
			this.setZIndex(inZIndex);
		}
		this.show();
	},
	//* Hides scrim at the specified z-index.
	hideAtZIndex: function(inZIndex) {
		this.removeZIndex(inZIndex);
		if (!this.zStack.length) {
			this.hide();
		} else {
			var z = this.zStack[this.zStack.length-1];
			this.setZIndex(z);
		}
	},
	//* @protected
	// Set scrim to show at `inZIndex`
	setZIndex: function(inZIndex) {
		this.zIndex = inZIndex;
		this.applyStyle("z-index", inZIndex);
	},
	make: function() {
		return this;
	}
});

//* @protected
//
// Scrim singleton exposing a subset of Scrim API;
// is replaced with a proper enyo.Scrim instance.
//
enyo.kind({
	name: "onyx.scrimSingleton",
	kind: null,
	constructor: function(inName, inProps) {
		this.instanceName = inName;
		enyo.setPath(this.instanceName, this);
		this.props = inProps || {};
	},
	make: function() {
		var s = new onyx.Scrim(this.props);
		enyo.setPath(this.instanceName, s);
		return s;
	},
	showAtZIndex: function(inZIndex) {
		var s = this.make();
		s.showAtZIndex(inZIndex);
	},
	// in case somebody does this out of order
	hideAtZIndex: enyo.nop,
	show: function() {
		var s = this.make();
		s.show();
	}
});

new onyx.scrimSingleton("onyx.scrim", {floating: true, classes: "onyx-scrim-translucent"});
new onyx.scrimSingleton("onyx.scrimTransparent", {floating: true, classes: "onyx-scrim-transparent"});


/**
	_onyx.Slider_ is a control that presents a range of selection options in the
	form of a horizontal slider with a control knob. The knob may be tapped and
	dragged	to the desired location.

		{kind: "onyx.Slider", value: 30}

	_onChanging_ events are fired while the control knob is being dragged, and
	an _onChange_ event is fired when the position is set, either by finishing a
	drag or by tapping the bar.

	For more information, see the documentation on [Progress
	Indicators](building-apps/controls/progress-indicators.html) in the Enyo
	Developer Guide.
*/
enyo.kind({
	name: "onyx.Slider",
	kind: "onyx.ProgressBar",
	classes: "onyx-slider",
	published: {
		//* Position of slider, expressed as an integer between 0 and 100,
		//* inclusive
		value: 0,
		//* If true, current progress will be styled differently from rest of bar
		lockBar: true,
		//* If true, tapping on bar will change current position
		tappable: true
	},
	events: {
		//* Fires when bar position is set. The _value_ property contains the
		//* new position.
		onChange: "",
		//* Fires while control knob is being dragged. The _value_ property
		//* contains the current position.
		onChanging: "",
		//* Fires when animation to a position finishes.
		onAnimateFinish: ""
	},
	//* If true, stripes are shown in the slider bar
	showStripes: false,
	//* @protected
	handlers: {
		ondragstart: "dragstart",
		ondrag: "drag",
		ondragfinish: "dragfinish"
	},
	moreComponents: [
		{kind: "Animator", onStep: "animatorStep", onEnd: "animatorComplete"},
		{classes: "onyx-slider-taparea"},
		{name: "knob", classes: "onyx-slider-knob"}
	],
	create: function() {
		this.inherited(arguments);

		// add handlers for up/down events on knob for pressed state (workaround for inconsistent (timing-wise) active:hover styling)
		this.moreComponents[2].ondown = "knobDown";
		this.moreComponents[2].onup = "knobUp";

		this.createComponents(this.moreComponents);
		this.valueChanged();
	},
	valueChanged: function() {
		this.value = this.clampValue(this.min, this.max, this.value);
		var p = this.calcPercent(this.value);
		this.updateKnobPosition(p);
		if (this.lockBar) {
			this.setProgress(this.value);
		}
	},
	updateKnobPosition: function(inPercent) {
		this.$.knob.applyStyle("left", inPercent + "%");
	},
	calcKnobPosition: function(inEvent) {
		var x = inEvent.clientX - this.hasNode().getBoundingClientRect().left;
		return (x / this.getBounds().width) * (this.max - this.min) + this.min;
	},
	dragstart: function(inSender, inEvent) {
		if (inEvent.horizontal) {
			inEvent.preventDefault();
			this.dragging = true;
			inSender.addClass("pressed");
			return true;
		}
	},
	drag: function(inSender, inEvent) {
		if (this.dragging) {
			var v = this.calcKnobPosition(inEvent);
			v = (this.increment) ? this.calcIncrement(v) : v;
			this.setValue(v);
			this.doChanging({value: this.value});
			return true;
		}
	},
	dragfinish: function(inSender, inEvent) {
		this.dragging = false;
		inEvent.preventTap();
		this.doChange({value: this.value});
		inSender.removeClass("pressed");
		return true;
	},
	tap: function(inSender, inEvent) {
		if (this.tappable) {
			var v = this.calcKnobPosition(inEvent);
			v = (this.increment) ? this.calcIncrement(v) : v;
			this.tapped = true;
			this.animateTo(v);
			return true;
		}
	},
	knobDown: function(inSender, inEvent) {
		this.$.knob.addClass("pressed");
	},
	knobUp: function(inSender, inEvent) {
		this.$.knob.removeClass("pressed");
	},
	//* @public
	//* Animates to the given value.
	animateTo: function(inValue) {
		this.$.animator.play({
			startValue: this.value,
			endValue: inValue,
			node: this.hasNode()
		});
	},
	//* @protected
	animatorStep: function(inSender) {
		this.setValue(inSender.value);
		return true;
	},
	animatorComplete: function(inSender) {
		if (this.tapped) {
			this.tapped = false;
			this.doChange({value: this.value});
		}
		this.doAnimateFinish(inSender);
		return true;
	}
});

/**
	_onyx.RangeSlider_ is a control that combines a horizontal slider with two
	control knobs. The user may drag the knobs to select a desired range of
	values.

		{kind: "onyx.RangeSlider", rangeMin: 100, rangeMax: 500,
			rangeStart: 200, rangeEnd: 400, interval: 20}

	_onChanging_ events are fired while the control knobs are being dragged, and
	an _onChange_ event is fired when the position is set by finishing a drag.
*/
enyo.kind({
	name: "onyx.RangeSlider",
	kind: "onyx.ProgressBar",
	classes: "onyx-slider",
	published: {
		//* @public
		//* Minimum slider value
		rangeMin: 0,
		//* Maximum slider value
		rangeMax: 100,
		/**
			Value of first slider, expressed as an integer between _rangeMin_
			and _rangeMax_
		*/
		rangeStart: 0,
		/**
			Value of second slider, expressed as an integer between _rangeMin_
			and _rangeMax_
		*/
		rangeEnd: 100,
		//* @protected
		// Position of first slider, expressed as an integer between 0 and 100 (percentage)
		beginValue: 0,
		// Position of second slider, expressed as an integer between 0 and 100 (percentage)
		endValue: 0
	},
	//* @public
	events: {
		/**
			Fires when bar position is set.

			_inEvent.value_ contains the new position.

			_inEvent.startChanged_ is a boolean value indicating whether the
			first slider (_rangeStart_) triggered the event.
		*/
		onChange: "",
		/**
			Fires while control knob is being dragged.

			_inEvent.value_ contains the current position.
		*/
		onChanging: ""
	},
	//* If true, stripes are shown in the slider bar
	showStripes: false,
	//* If true, labels are shown above each slider knob
	showLabels: false,
	//* @protected
	handlers: {
		ondragstart: "dragstart",
		ondrag: "drag",
		ondragfinish: "dragfinish",
		ondown: "down"
	},
	moreComponents: [
		{name: "startKnob", classes: "onyx-slider-knob"},
		{name: "endKnob", classes: "onyx-slider-knob onyx-range-slider-knob"}
	],
	create: function() {
		this.inherited(arguments);
		this.createComponents(this.moreComponents);
		this.initControls();
	},
	rendered: function() {
		this.inherited(arguments);
		var p = this.calcPercent(this.beginValue);
		this.updateBarPosition(p);
	},
	initControls: function() {
		this.$.bar.applyStyle("position", "relative");
		this.refreshRangeSlider();
		if (this.showLabels) {
			this.$.startKnob.createComponent({name: "startLabel", kind: "onyx.RangeSliderKnobLabel"});
			this.$.endKnob.createComponent({name: "endLabel", kind: "onyx.RangeSliderKnobLabel"});
		}
		// add handlers for up/down events on knobs for pressed state (workaround for inconsistent (timing-wise) active:hover styling)
		this.$.startKnob.ondown = "knobDown";
		this.$.startKnob.onup = "knobUp";
		this.$.endKnob.ondown = "knobDown";
		this.$.endKnob.onup = "knobUp";
	},
	refreshRangeSlider: function() {
		// Calculate range percentages, in order to position sliders
		this.beginValue = this.calcKnobPercent(this.rangeStart);
		this.endValue = this.calcKnobPercent(this.rangeEnd);
		this.beginValueChanged();
		this.endValueChanged();
	},
	calcKnobRatio: function(inValue) {
		return (inValue - this.rangeMin) / (this.rangeMax - this.rangeMin);
	},
	calcKnobPercent: function(inValue) {
		return this.calcKnobRatio(inValue) * 100;
	},
	beginValueChanged: function(sliderPos) {
		if (sliderPos === undefined) {
			var p = this.calcPercent(this.beginValue);
			this.updateKnobPosition(p, this.$.startKnob);
		}
	},
	endValueChanged: function(sliderPos) {
		if (sliderPos === undefined) {
			var p = this.calcPercent(this.endValue);
			this.updateKnobPosition(p, this.$.endKnob);
		}
	},
	calcKnobPosition: function(inEvent) {
		var x = inEvent.clientX - this.hasNode().getBoundingClientRect().left;
		return (x / this.getBounds().width) * (this.max - this.min) + this.min;
	},
	updateKnobPosition: function(inPercent, inControl) {
		inControl.applyStyle("left", inPercent + "%");
		this.updateBarPosition();
	},
	updateBarPosition: function() {
		if ((this.$.startKnob !== undefined) && (this.$.endKnob !== undefined)) {
			var barStart = this.calcKnobPercent(this.rangeStart);
			var barWidth = this.calcKnobPercent(this.rangeEnd) - barStart;
			this.$.bar.applyStyle("left", barStart + "%");
			this.$.bar.applyStyle("width", barWidth + "%");
		}
	},
	calcRangeRatio: function(inValue) {
		return ((inValue / 100) * (this.rangeMax - this.rangeMin) + this.rangeMin) - (this.increment/2);
	},
	swapZIndex: function(inControl) {
		if (inControl === "startKnob") {
			this.$.startKnob.applyStyle("z-index", 1);
			this.$.endKnob.applyStyle("z-index", 0);
		} else if (inControl === "endKnob") {
			this.$.startKnob.applyStyle("z-index", 0);
			this.$.endKnob.applyStyle("z-index", 1);
		}
	},
	down: function(inSender, inEvent) {
		this.swapZIndex(inSender.name);
	},
	dragstart: function(inSender, inEvent) {
		if (inEvent.horizontal) {
			inEvent.preventDefault();
			this.dragging = true;
			inSender.addClass("pressed");
			return true;
		}
	},
	drag: function(inSender, inEvent) {
		if (this.dragging) {
			var knobPos = this.calcKnobPosition(inEvent);
			var _val, val, p;

			if ((inSender.name === "startKnob") && (knobPos >= 0)) {
				if (((knobPos <= this.endValue) && (inEvent.xDirection === -1)) || (knobPos <= this.endValue)) {
					this.setBeginValue(knobPos);
					_val = this.calcRangeRatio(this.beginValue);
					val = (this.increment) ? this.calcIncrement(_val+0.5*this.increment) : _val;
					p = this.calcKnobPercent(val);
					this.updateKnobPosition(p, this.$.startKnob);
					this.setRangeStart(val);
					this.doChanging({value: val});
				} else {
					return this.drag(this.$.endKnob, inEvent);
				}
			} else if ((inSender.name === "endKnob") && (knobPos <= 100)) {
				if (((knobPos >= this.beginValue) && (inEvent.xDirection === 1)) || (knobPos >= this.beginValue)) {
					this.setEndValue(knobPos);
					_val = this.calcRangeRatio(this.endValue);
					val = (this.increment) ? this.calcIncrement(_val+0.5*this.increment) : _val;
					p = this.calcKnobPercent(val);
					this.updateKnobPosition(p, this.$.endKnob);
					this.setRangeEnd(val);
					this.doChanging({value: val});
				} else {
					return this.drag(this.$.startKnob, inEvent);
				}
			}
			return true;
		}
	},
	dragfinish: function(inSender, inEvent) {
		this.dragging = false;
		inEvent.preventTap();
		var val;
		if (inSender.name === "startKnob") {
			val = this.calcRangeRatio(this.beginValue);
			this.doChange({value: val, startChanged: true});
		} else if (inSender.name === "endKnob") {
			val = this.calcRangeRatio(this.endValue);
			this.doChange({value: val, startChanged: false});
		}
		inSender.removeClass("pressed");
		return true;
	},
	knobDown: function(inSender, inEvent) {
		inSender.addClass("pressed");
	},
	knobUp: function(inSender, inEvent) {
		inSender.removeClass("pressed");
	},
	rangeMinChanged: function() {
		this.refreshRangeSlider();
	},
	rangeMaxChanged: function() {
		this.refreshRangeSlider();
	},
	rangeStartChanged: function() {
		this.refreshRangeSlider();
	},
	rangeEndChanged: function() {
		this.refreshRangeSlider();
	},
	setStartLabel: function(inContent) {
		this.$.startKnob.waterfallDown("onSetLabel", inContent);
	},
	setEndLabel: function(inContent) {
		this.$.endKnob.waterfallDown("onSetLabel", inContent);
	}
});

enyo.kind({
	name: "onyx.RangeSliderKnobLabel",
	classes: "onyx-range-slider-label",
	handlers: {
		onSetLabel: "setLabel"
	},
	setLabel: function(inSender, inContent) {
		this.setContent(inContent);
	}
});

/**
	A control designed to display a group of stacked items, typically used in
	lists. By default, items are highlighted when tapped. Set *tapHighlight* to
	false to prevent the highlighting.

		{kind: "onyx.Item", tapHighlight: false}
*/
enyo.kind({
	name: "onyx.Item",
	classes: "onyx-item",
	//* When true, the item will automatically highlight (by application of the onyx-highlight
	//* CSS class) when tapped. Set to false to disable this behavior.
	tapHighlight: true,
	//* @protected
	handlers: {
		onhold: "hold",
		onrelease: "release"
	},
	//* @public
	hold: function(inSender, inEvent) {
		if (this.tapHighlight) {
			onyx.Item.addRemoveFlyweightClass(this.controlParent || this, "onyx-highlight", true, inEvent);
		}
	},
	release: function(inSender, inEvent) {
		if (this.tapHighlight) {
			onyx.Item.addRemoveFlyweightClass(this.controlParent || this, "onyx-highlight", false, inEvent);
		}
	},
	//* @protected
	statics: {
		addRemoveFlyweightClass: function(inControl, inClass, inTrueToAdd, inEvent, inIndex) {
			var flyweight = inEvent.flyweight;
			if (flyweight) {
				var index = inIndex !== undefined ? inIndex : inEvent.index;
				flyweight.performOnRow(index, function() {
					inControl.addRemoveClass(inClass, inTrueToAdd);
				});
			}
		}
	}
});

/**
	A control that displays a spinner animation to indicate that activity is
	taking place. By default, onyx.Spinner will display a light spinner,
	suitable for displaying against a dark background. To render a dark spinner
	to be shown on a lighter background, add the "onyx-light" class to the
	spinner:

		{kind: "onyx.Spinner", classes: "onyx-light"}

	Typically, a spinner is shown to indicate activity and hidden to indicate
	that the activity has ended. The spinner animation will automatically start
	when a spinner is shown. If you wish, you may control the animation directly
	by calling the *start*, *stop*, and *toggle* methods.
*/
enyo.kind({
	name: "onyx.Spinner",
	classes: "onyx-spinner",
	//* @public
	//* Stops the spinner animation.
	stop: function() {
		this.setShowing(false);
	},
	//* Starts the spinner animation.
	start: function() {
		this.setShowing(true);
	},
	//* Toggles the spinner animation on or off.
	toggle: function() {
		this.setShowing(!this.getShowing());
	}
});


/**
	_onyx.MoreToolbar_ extends [enyo.Control](#enyo.Control), providing a toolbar
	that can adapt to different screen sizes by moving overflowing controls and
	content into an [onyx.Menu](#onyx.Menu).

		{kind: "onyx.MoreToolbar", components: [
			{content: "More Toolbar", unmoveable: true},
			{kind: "onyx.Button", content: "Alpha"},
			{kind: "onyx.Button", content: "Beta"},
			{kind: "onyx.Button", content: "Gamma", unmoveable: true},
			{kind: "onyx.Button", content: "Epsilon"}
		]},

	You may prevent a control from being moved into the menu by setting its
	_unmoveable_ property to true (the default is false).

	For more information, see the documentation on
	[Toolbars](building-apps/controls/toolbars.html) in the Enyo Developer Guide.
*/

enyo.kind({
	name: "onyx.MoreToolbar",
	//* @public
	classes: "onyx-toolbar onyx-more-toolbar",
	//* Style class to be applied to the menu
	menuClass: "",
	//* Style class to be applied to individual controls moved from the toolbar to the menu
	movedClass: "",
	//* @protected
	layoutKind: "FittableColumnsLayout",
	noStretch: true,
	handlers: {
		onHide: "reflow"
	},
	published: {
		//* Layout kind that will be applied to the client controls.
		clientLayoutKind: "FittableColumnsLayout"
	},
	tools: [
		{name: "client", noStretch:true, fit: true, classes: "onyx-toolbar-inline"},
		{name: "nard", kind: "onyx.MenuDecorator", showing: false, onActivate: "activated", components: [
			{kind: "onyx.IconButton", classes: "onyx-more-button"},
			{name: "menu", kind: "onyx.Menu", scrolling:false, classes: "onyx-more-menu"}
		]}
	],
	initComponents: function() {
		if(this.menuClass && this.menuClass.length>0 && !this.$.menu.hasClass(this.menuClass)) {
			this.$.menu.addClass(this.menuClass);
		}
		this.createChrome(this.tools);
		this.inherited(arguments);
		this.$.client.setLayoutKind(this.clientLayoutKind);
	},
	clientLayoutKindChanged: function(){
		this.$.client.setLayoutKind(this.clientLayoutKind);
	},
	reflow: function() {
		this.inherited(arguments);
		if (this.isContentOverflowing()) {
			this.$.nard.show();
			if (this.popItem()) {
				this.reflow();
			}
		} else if (this.tryPushItem()) {
			this.reflow();
		} else if (!this.$.menu.children.length) {
			this.$.nard.hide();
			this.$.menu.hide();
		}
	},
	activated: function(inSender, inEvent) {
		this.addRemoveClass("active",inEvent.originator.active);
	},
	popItem: function() {
		var c = this.findCollapsibleItem();
		if (c) {
			//apply movedClass is needed
			if(this.movedClass && this.movedClass.length>0 && !c.hasClass(this.movedClass)) {
				c.addClass(this.movedClass);
			}
			// passing null to add child to the front of the control list
			this.$.menu.addChild(c, null);
			var p = this.$.menu.hasNode();
			if (p && c.hasNode()) {
				c.insertNodeInParent(p);
			}
			return true;
		}
	},
	pushItem: function() {
		var c$ = this.$.menu.children;
		var c = c$[0];
		if (c) {
			//remove any applied movedClass
			if(this.movedClass && this.movedClass.length>0 && c.hasClass(this.movedClass)) {
				c.removeClass(this.movedClass);
			}
			this.$.client.addChild(c);
			var p = this.$.client.hasNode();
			if (p && c.hasNode()) {
				var nextChild;
				var currIndex;
				for(var i=0; i<this.$.client.children.length; i++) {
					var curr = this.$.client.children[i];
					if(curr.toolbarIndex !== undefined && curr.toolbarIndex != i) {
						nextChild = curr;
						currIndex = i;
						break;
					}
				}
				if(nextChild && nextChild.hasNode()) {
					c.insertNodeInParent(p, nextChild.node);
					var newChild = this.$.client.children.pop();
					this.$.client.children.splice(currIndex, 0, newChild);
				} else {
					c.appendNodeToParent(p);
				}
			}
			return true;
		}
	},
	tryPushItem: function() {
		if (this.pushItem()) {
			if (!this.isContentOverflowing()) {
				return true;
			} else {
				this.popItem();
			}
		}
	},
	isContentOverflowing: function() {
		if (this.$.client.hasNode()) {
			var c$ = this.$.client.children;
			var n = c$.length && c$[c$.length-1].hasNode();
			if(n) {
				this.$.client.reflow();
				//Workaround: scrollWidth value not working in Firefox, so manually compute
				//return (this.$.client.node.scrollWidth > this.$.client.node.clientWidth);
				return ((n.offsetLeft + n.offsetWidth) > this.$.client.node.clientWidth);
			}
		}
	},
	findCollapsibleItem: function() {
		var c$ = this.$.client.children;
		var c;
		for (var i=c$.length-1; (c=c$[i]); i--) {
			if (!c.unmoveable) {
				return c;
			} else {
				if(c.toolbarIndex===undefined) {
					c.toolbarIndex = i;
				}
			}
		}
	}
});

/**
    _onyx.IntegerPicker_, a subkind of [onyx.Picker](#onyx.Picker), is used to
    display a list of integers that may be selected, ranging from _min_ to
    _max_. It is meant to be used in conjunction with an
    [onyx.PickerDecorator](#onyx.PickerDecorator). The decorator loosely couples
    the picker with an [onyx.PickerButton](#onyx.PickerButton)--a button that,
    when tapped, shows the picker. Once an item is selected, the list of items
    closes,	but the item stays selected and the PickerButton displays the choice
    that was made.

    To initialize the IntegerPicker to a particular value, set the _value_
    property to the integer that should be selected.

        {kind: "onyx.PickerDecorator", components: [
            {}, //this uses the defaultKind property of PickerDecorator to inherit from PickerButton
            {kind: "onyx.IntegerPicker", min: 0, max: 25, value: 5}
        ]}

    Each item in the list is an [onyx.MenuItem](#onyx.MenuItem), so an
    application may listen for an _onSelect_ event with the item to determine
    which picker item was selected.

    For more information, see the documentation on
    [Pickers](building-apps/controls/pickers.html) in the Enyo Developer Guide.
 */
enyo.kind({
	name: "onyx.IntegerPicker",
	kind: "onyx.Picker",
	published: {
		value: 0,
		min: 0,
		max: 9
	},
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.rangeChanged();
	},
	minChanged: function() {
		this.destroyClientControls();
		this.rangeChanged();
		this.render();
	},
	maxChanged: function() {
		this.destroyClientControls();
		this.rangeChanged();
		this.render();
	},
	rangeChanged: function() {
		for (var i=this.min; i<=this.max; i++) {
			this.createComponent({content: i, active: (i===this.value) ? true : false});
		}
	},
    valueChanged: function(inOld) {
		var controls = this.getClientControls();
		var len = controls.length;
		// Validate our value
		this.value = Math.min(this.max, Math.max(this.value, this.min));
		for (var i=0; i<len; i++) {
			if (this.value === parseInt(controls[i].content, 10)) {
				this.setSelected(controls[i]);
				break;
			}
		}
	},
	selectedChanged: function(inOld) {
		if (inOld) {
			inOld.removeClass("selected");
		}
		if (this.selected) {
			this.selected.addClass("selected");
			this.doChange({selected: this.selected, content: this.selected.content});
		}
		this.setValue(parseInt(this.selected.content, 10));
	}
});

/**
	_onyx.ContextualPopup_ is a subkind of <a href="#enyo.Popup">enyo.Popup</a>.
	Contextual popups serve as child windows that appear near the point of
	initiation. Use them for prompting users to select from a defined set of
	options; for conducting other quick, single-step interactions in which
	context should be maintained; and for presenting simple views, such as
	previews.

	A contextual popup is meant to be used in conjunction with a decorator, such
	as an <a href="#onyx.MenuDecorator">onyx.MenuDecorator</a>. The decorator
	couples the popup with an activating control, which may be a button or any
	other control with an _onActivate_ event. When the control is activated, the
	popup shows itself in the correct position relative to the activator.

	Note that, by default, the popup is not floating, so toolbars and controls
	with high z-index values may obscure it. You may set the _floating_ property
	to true to have the popup always appear on top; however, the popup will not
	be in the containing document's flow and so will not scroll with the
	document.

	In addition, while contextual popups have their own positioning logic, they
	do not currently have their own sizing logic, so be sure to take this into
	account when using them.

		{kind: "onyx.MenuDecorator", components: [
			{content: "Show Popup"},
			{kind: "onyx.ContextualPopup",
				title: "Sample Popup",
				actionButtons: [
					{content:"Button 1", classes: "onyx-button-warning"},
					{content:"Button 2"}
				],
				components: [
					{content:"Sample component in popup"}
				]
			}
		]}
*/

enyo.kind({
	name: "onyx.ContextualPopup",
	kind: "enyo.Popup",
	modal: true,
	autoDismiss: true,
	floating:false,
	classes: "onyx-contextual-popup enyo-unselectable",
	published: {
		//* Maximum height of the menu
		maxHeight: 100,
		//* Toggle scrolling
		scrolling: true,
		//* Popup title content
		title: undefined,
		//* Buttons at bottom of popup
		actionButtons: []
	},

	statics: {
		subclass: function(ctor, props) {
			var proto = ctor.prototype;
			if (props.actionButtons) {
				proto.kindActionButtons = props.actionButtons;
				delete proto.actionButtons;
			}
		}
	},

	//layout parameters
	vertFlushMargin:60, //vertical flush layout margin
	horizFlushMargin:50, //horizontal flush layout margin
	widePopup:200, //popups wider than this value are considered wide (for layout purposes)
	longPopup:200, //popups longer than this value are considered long (for layout purposes)
	horizBuffer:16, //do not allow horizontal flush popups past spec'd amount of buffer space on left/right screen edge

	events: {
		onTap: ""
	},
	handlers: {
		onActivate: "childControlActivated",
		onRequestShowMenu: "requestShow",
		onRequestHideMenu: "requestHide"
	},
	components: [
		{name:"title", classes:"onyx-contextual-popup-title"},
		{classes:"onyx-contextual-popup-scroller", components:[
			{name:"client", kind: "enyo.Scroller", vertical:"auto", classes:"enyo-unselectable", thumb:false, strategyKind: "TouchScrollStrategy"}
		]},
		{name:"actionButtons", classes:"onyx-contextual-popup-action-buttons"}
	],
	scrollerName: "client",
	create: function() {
		this.inherited(arguments);
		this.maxHeightChanged();
		this.titleChanged();
		this.actionButtonsChanged();
	},
	getScroller: function() {
		return this.$[this.scrollerName];
	},
	titleChanged: function(){
		this.$.title.setContent(this.title);
	},
	actionButtonsChanged: function() {
		if (this.actionButtons) {
			enyo.forEach(this.actionButtons, function(button) {
				button.kind = "onyx.Button";
				button.classes = button.classes + " onyx-contextual-popup-action-button";
				button.popup = this;
				button.actionButton = true;
				this.$.actionButtons.createComponent(button, {
					owner: this.getInstanceOwner()
				});
			}, this);
		} else if (this.kindActionButtons) {
			enyo.forEach(this.kindActionButtons, function(button) {
				button.kind = "onyx.Button";
				button.classes = button.classes + " onyx-contextual-popup-action-button";
				button.popup = this;
				button.actionButton = true;
				this.$.actionButtons.createComponent(button, {
					owner: this
				});
			}, this);
		}
		if(this.hasNode()) {
			this.$.actionButtons.render();
		}
	},
	maxHeightChanged: function() {
		if (this.scrolling) {
			this.getScroller().setMaxHeight(this.maxHeight + "px");
		}
	},
	showingChanged: function() {
		this.inherited(arguments);
		if (this.scrolling) {
			this.getScroller().setShowing(this.showing);
		}
		this.adjustPosition();
	},
	childControlActivated: function(inSender, inEvent) {
		return true;
	},
	requestShow: function(inSender, inEvent) {
		var n = inEvent.activator.hasNode();
		if (n) {
			this.activatorOffset = this.getPageOffset(n);
		}
		this.show();
		return true;
	},
	applyPosition: function(inRect) {
		var s = "";
		for (var n in inRect) {
			s += (n + ":" + inRect[n] + (isNaN(inRect[n]) ? "; " : "px; "));
		}
		this.addStyles(s);
	},
	getPageOffset: function(inNode) {
		var r = this.getBoundingRect(inNode);

		var pageYOffset = (window.pageYOffset === undefined) ? document.documentElement.scrollTop : window.pageYOffset;
		var pageXOffset = (window.pageXOffset === undefined) ? document.documentElement.scrollLeft : window.pageXOffset;
		var rHeight = (r.height === undefined) ? (r.bottom - r.top) : r.height;
		var rWidth = (r.width === undefined) ? (r.right - r.left) : r.width;

		return {top: r.top + pageYOffset, left: r.left + pageXOffset, height: rHeight, width: rWidth};
	},
	//* @protected
	/* Adjusts the popup position + nub location & direction
	*/
	adjustPosition: function() {
		if (this.showing && this.hasNode()) {
			/****ContextualPopup positioning rules:
				1. Activator Location:
					a. If activator is located in a corner then position using a flush style.
						i.  Attempt vertical first.
						ii. Horizontal if vertical doesn't fit.
					b. If not in a corner then check if the activator is located in one of the 4 "edges" of the view & position the
						following way if so:
						i.   Activator is in top edge, position popup below it.
						ii.  Activator is in bottom edge, position popup above it.
						iii. Activator is in left edge, position popup to the right of it.
						iv.  Activator is in right edge, position popup to the left of it.

				2. Screen Size - the pop-up should generally extend in the direction where there’s room for it.
					Note: no specific logic below for this rule since it is built into the positioning functions, ie we attempt to never
					position a popup where there isn't enough room for it.

				3. Popup Size:
					i.  If popup content is wide, use top or bottom positioning.
					ii. If popup content is long, use horizontal positioning.

				4. Favor top or bottom:
					If all the above rules have been followed and location can still vary then favor top or bottom positioning.

				5. If top or bottom will work, favor bottom.
					Note: no specific logic below for this rule since it is built into the vertical position functions, ie we attempt to
					use a bottom position for the popup as much possible. Additionally within the vetical position function we center the
					popup if the activator is at the vertical center of the view.
			****/
			this.resetPositioning();
			var innerWidth = this.getViewWidth();
			var innerHeight = this.getViewHeight();

			//These are the view "flush boundaries"
			var topFlushPt = this.vertFlushMargin;
			var bottomFlushPt = innerHeight - this.vertFlushMargin;
			var leftFlushPt = this.horizFlushMargin;
			var rightFlushPt = innerWidth - this.horizFlushMargin;

			//Rule 1 - Activator Location based positioning
			//if the activator is in the top or bottom edges of the view, check if the popup needs flush positioning
			if ((this.activatorOffset.top + this.activatorOffset.height) < topFlushPt || this.activatorOffset.top > bottomFlushPt) {
				//check/try vertical flush positioning	(rule 1.a.i)
				if (this.applyVerticalFlushPositioning(leftFlushPt, rightFlushPt)) {
					return;
				}

				//if vertical doesn't fit then check/try horizontal flush (rule 1.a.ii)
				if (this.applyHorizontalFlushPositioning(leftFlushPt, rightFlushPt)) {
					return;
				}

				//if flush positioning didn't work then try just positioning vertically (rule 1.b.i & rule 1.b.ii)
				if (this.applyVerticalPositioning()){
					return;
				}
			//otherwise check if the activator is in the left or right edges of the view & if so try horizontal positioning
			} else if ((this.activatorOffset.left + this.activatorOffset.width) < leftFlushPt || this.activatorOffset.left > rightFlushPt) {
				//if flush positioning didn't work then try just positioning horizontally (rule 1.b.iii & rule 1.b.iv)
				if (this.applyHorizontalPositioning()){
					return;
				}
			}

			//Rule 2 - no specific logic below for this rule since it is inheritent to the positioning functions, ie we attempt to never
			//position a popup where there isn't enough room for it.

			//Rule 3 - Popup Size based positioning
			var clientRect = this.getBoundingRect(this.node);

			//if the popup is wide then use vertical positioning
			if (clientRect.width > this.widePopup) {
				if (this.applyVerticalPositioning()){
					return;
				}
			}
			//if the popup is long then use horizontal positioning
			else if (clientRect.height > this.longPopup) {
				if (this.applyHorizontalPositioning()){
					return;
				}
			}

			//Rule 4 - Favor top or bottom positioning
			if (this.applyVerticalPositioning()) {
				return;
			}
			//but if thats not possible try horizontal
			else if (this.applyHorizontalPositioning()){
				return;
			}

			//Rule 5 - no specific logic below for this rule since it is built into the vertical position functions, ie we attempt to
			//         use a bottom position for the popup as much possible.
		}
	},
	//move the popup below or above the activator & verify that it fits on screen
	initVerticalPositioning: function() {
		this.resetPositioning();
		this.addClass("vertical");

		var clientRect = this.getBoundingRect(this.node);
		var innerHeight = this.getViewHeight();

		if (this.floating){
			if (this.activatorOffset.top < (innerHeight / 2)) {
				this.applyPosition({top: this.activatorOffset.top + this.activatorOffset.height, bottom: "auto"});
				this.addClass("below");
			} else {
				this.applyPosition({top: this.activatorOffset.top - clientRect.height, bottom: "auto"});
				this.addClass("above");
			}
		} else {
			//if the popup's bottom goes off the screen then put it on the top of the invoking control
			if ((clientRect.top + clientRect.height > innerHeight) && ((innerHeight - clientRect.bottom) < (clientRect.top - clientRect.height))){
				this.addClass("above");
			} else {
				this.addClass("below");
			}
		}

		//if moving the popup above or below the activator puts it past the edge of the screen then vertical doesn't work
		clientRect = this.getBoundingRect(this.node);
		if ((clientRect.top + clientRect.height) > innerHeight || clientRect.top < 0){
			return false;
		}

		return true;
	},
	applyVerticalPositioning: function() {
		//if we can't fit the popup above or below the activator then forget vertical positioning
		if (!this.initVerticalPositioning()) {
			return false;
		}

		var clientRect = this.getBoundingRect(this.node);
		var innerWidth = this.getViewWidth();

		if (this.floating){
			//Get the left edge delta to horizontally center the popup
			var centeredLeft = this.activatorOffset.left + this.activatorOffset.width/2 - clientRect.width/2;
			if (centeredLeft + clientRect.width > innerWidth) {//popup goes off right edge of the screen if centered
				this.applyPosition({left: this.activatorOffset.left + this.activatorOffset.width - clientRect.width});
				this.addClass("left");
			} else if (centeredLeft < 0) {//popup goes off left edge of the screen if centered
				this.applyPosition({left:this.activatorOffset.left});
				this.addClass("right");
			} else {//center the popup
				this.applyPosition({left: centeredLeft});
			}

		} else {
			//Get the left edge delta to horizontally center the popup
			var centeredLeftDelta = this.activatorOffset.left + this.activatorOffset.width/2 - clientRect.left - clientRect.width/2;
			if (clientRect.right + centeredLeftDelta > innerWidth) {//popup goes off right edge of the screen if centered
				this.applyPosition({left: this.activatorOffset.left + this.activatorOffset.width - clientRect.right});
				this.addRemoveClass("left", true);
			} else if (clientRect.left + centeredLeftDelta < 0) {//popup goes off left edge of the screen if centered
				this.addRemoveClass("right", true);
			} else {//center the popup
				this.applyPosition({left: centeredLeftDelta});
			}
		}

		return true;
	},
	applyVerticalFlushPositioning: function(leftFlushPt, rightFlushPt) {
		//if we can't fit the popup above or below the activator then forget vertical positioning
		if (!this.initVerticalPositioning()) {
			return false;
		}

		var clientRect = this.getBoundingRect(this.node);
		var innerWidth = this.getViewWidth();

		//If the activator's right side is within our left side cut off use flush positioning
		if ((this.activatorOffset.left + this.activatorOffset.width/2) < leftFlushPt){
			//if the activator's left edge is too close or past the screen left edge
			if (this.activatorOffset.left + this.activatorOffset.width/2 < this.horizBuffer){
				this.applyPosition({left:this.horizBuffer + (this.floating ? 0 : -clientRect.left)});
			} else {
				this.applyPosition({left:this.activatorOffset.width/2  + (this.floating ? this.activatorOffset.left : 0)});
			}

			this.addClass("right");
			this.addClass("corner");
			return true;
		}
		//If the activator's left side is within our right side cut off use flush positioning
		else if (this.activatorOffset.left + this.activatorOffset.width/2 > rightFlushPt) {
			if ((this.activatorOffset.left+this.activatorOffset.width/2) > (innerWidth-this.horizBuffer)){
				this.applyPosition({left:innerWidth - this.horizBuffer - clientRect.right});
			} else {
				this.applyPosition({left: (this.activatorOffset.left + this.activatorOffset.width/2) - clientRect.right});
			}
			this.addClass("left");
			this.addClass("corner");
			return true;
		}

		return false;
	},
	//move the popup left or right of the activator & verify that it fits on screen
	initHorizontalPositioning: function() {
		this.resetPositioning();

		var clientRect = this.getBoundingRect(this.node);
		var innerWidth = this.getViewWidth();

		//adjust horizontal positioning of the popup & nub vertical positioning
		if (this.floating){
			if ((this.activatorOffset.left + this.activatorOffset.width) < innerWidth/2) {
				this.applyPosition({left: this.activatorOffset.left + this.activatorOffset.width});
				this.addRemoveClass("left", true);
			} else {
				this.applyPosition({left: this.activatorOffset.left - clientRect.width});
				this.addRemoveClass("right", true);
			}
		} else {
			if (this.activatorOffset.left - clientRect.width > 0) {
				this.applyPosition({left: this.activatorOffset.left - clientRect.left - clientRect.width});
				this.addRemoveClass("right", true);
			} else {
				this.applyPosition({left: this.activatorOffset.width});
				this.addRemoveClass("left", true);
			}
		}
		this.addRemoveClass("horizontal", true);

		//if moving the popup left or right of the activator puts it past the edge of the screen then horizontal won't work
		clientRect = this.getBoundingRect(this.node);
		if (clientRect.left < 0 || (clientRect.left + clientRect.width) > innerWidth){
			return false;
		}
		return true;

	},
	applyHorizontalPositioning: function() {
		//if we can't fit the popup left or right of the activator then forget horizontal positioning
		if (!this.initHorizontalPositioning()) {
			return false;
		}

		var clientRect = this.getBoundingRect(this.node);
		var innerHeight = this.getViewHeight();
		var activatorCenter = this.activatorOffset.top + this.activatorOffset.height/2;

		if (this.floating){
			//if the activator's center is within 10% of the center of the view, vertically center the popup
			if ((activatorCenter >= (innerHeight/2 - 0.05 * innerHeight)) && (activatorCenter <= (innerHeight/2 + 0.05 * innerHeight))) {
				this.applyPosition({top: this.activatorOffset.top + this.activatorOffset.height/2 - clientRect.height/2, bottom: "auto"});
			} else if (this.activatorOffset.top + this.activatorOffset.height < innerHeight/2) { //the activator is in the top 1/2 of the screen
				this.applyPosition({top: this.activatorOffset.top - this.activatorOffset.height, bottom: "auto"});
				this.addRemoveClass("high", true);
			} else { //otherwise the popup will be positioned in the bottom 1/2 of the screen
				this.applyPosition({top: this.activatorOffset.top - clientRect.height + this.activatorOffset.height*2, bottom: "auto"});
				this.addRemoveClass("low", true);
			}
		} else {
			//if the activator's center is within 10% of the center of the view, vertically center the popup
			if ((activatorCenter >= (innerHeight/2 - 0.05 * innerHeight)) && (activatorCenter <= (innerHeight/2 + 0.05 * innerHeight))) {
				this.applyPosition({top: (this.activatorOffset.height - clientRect.height)/2});
			} else if (this.activatorOffset.top + this.activatorOffset.height < innerHeight/2) { //the activator is in the top 1/2 of the screen
				this.applyPosition({top: -this.activatorOffset.height});
				this.addRemoveClass("high", true);
			} else { //otherwise the popup will be positioned in the bottom 1/2 of the screen
				this.applyPosition({top: clientRect.top - clientRect.height - this.activatorOffset.top + this.activatorOffset.height});
				this.addRemoveClass("low", true);
			}
		}
		return true;
	},
	applyHorizontalFlushPositioning: function(leftFlushPt, rightFlushPt) {
		//if we can't fit the popup left or right of the activator then forget vertical positioning
		if (!this.initHorizontalPositioning()) {
			return false;
		}

		var clientRect = this.getBoundingRect(this.node);
		var innerHeight = this.getViewHeight();

		//adjust vertical positioning (high or low nub & popup position)
		if (this.floating){
			if (this.activatorOffset.top < (innerHeight/2)){
				this.applyPosition({top: this.activatorOffset.top + this.activatorOffset.height/2});
				this.addRemoveClass("high", true);
			} else {
				this.applyPosition({top:this.activatorOffset.top + this.activatorOffset.height/2 - clientRect.height});
				this.addRemoveClass("low", true);
			}
		} else {
			if (((clientRect.top + clientRect.height) > innerHeight) && ((innerHeight - clientRect.bottom) < (clientRect.top - clientRect.height))) {
				this.applyPosition({top: clientRect.top - clientRect.height - this.activatorOffset.top - this.activatorOffset.height/2});
				this.addRemoveClass("low", true);
			} else {
				this.applyPosition({top: this.activatorOffset.height/2});
				this.addRemoveClass("high", true);
			}
		}

		//If the activator's right side is within our left side cut off use flush positioning
		if ((this.activatorOffset.left + this.activatorOffset.width) < leftFlushPt){
			this.addClass("left");
			this.addClass("corner");
			return true;
		}
		//If the activator's left side is within our right side cut off use flush positioning
		else if (this.activatorOffset.left > rightFlushPt) {
			this.addClass("right");
			this.addClass("corner");
			return true;
		}

		return false;
	},
	getBoundingRect:  function(inNode){
		// getBoundingClientRect returns top/left values which are relative to the viewport and not absolute
		var o = inNode.getBoundingClientRect();
		if (!o.width || !o.height) {
			return {
				left: o.left,
				right: o.right,
				top: o.top,
				bottom: o.bottom,
				width: o.right - o.left,
				height: o.bottom - o.top
			};
		}
		return o;
	},
	getViewHeight: function() {
		return (window.innerHeight === undefined) ? document.documentElement.clientHeight : window.innerHeight;
	},
	getViewWidth: function() {
		return (window.innerWidth === undefined) ? document.documentElement.clientWidth : window.innerWidth;
	},
	resetPositioning: function() {
		this.removeClass("right");
		this.removeClass("left");
		this.removeClass("high");
		this.removeClass("low");
		this.removeClass("corner");
		this.removeClass("below");
		this.removeClass("above");
		this.removeClass("vertical");
		this.removeClass("horizontal");

		this.applyPosition({left: "auto"});
		this.applyPosition({top: "auto"});
	},
	resizeHandler: function() {
		this.inherited(arguments);
		this.adjustPosition();
	},
	requestHide: function(){
		this.setShowing(false);
	}
});
