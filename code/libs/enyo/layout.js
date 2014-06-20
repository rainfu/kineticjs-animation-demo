if (enyo && enyo.version) {
	enyo.version.layout = "2.4.0";
}

/**
    _enyo.ContextualLayout_ provides the base positioning logic for a contextual
    layout strategy. This layout strategy is intended for use with a popup in a
    decorator/activator scenario, where the popup will be positioned relative to
    the activator. For example, [onyx.ContextualPopup](#onyx.ContextualPopup),
    would be used like so:

        {kind: "onyx.ContextualPopupDecorator", components: [
            {content: "Show Popup"},
            {kind: "onyx.ContextualPopup",
                title: "Sample Popup",
                actionButtons: [
                    {content: "Button 1", classes: "onyx-button-warning"},
                    {content: "Button 2"}
                ],
                components: [
                    {content: "Sample component in popup"}
                ]
            }
        ]}

    The decorator contains the popup and activator, with the activator being the
    first child component (i.e., the "Show Popup" button). The contextual layout
    strategy is applied because, in the definition of _onyx.ContextualPopup_,
    its _layoutKind_ property is set to _enyo.ContextualLayout_.

    Note that a popup using ContextualLayout as its _layoutKind_ is expected to
    declare several specific properties:

    * _vertFlushMargin_: The vertical flush layout margin, i.e., how close the
        popup's edge may come to the vertical screen edge (in pixels) before
        being laid out "flush" style

    * _horizFlushMargin_: The horizontal flush layout margin, i.e., how close
        the popup's edge may come to the horizontal screen edge (in pixels)
        before being laid out "flush" style

    * _widePopup_: A popup wider than this value (in pixels) is considered wide
        (for layout calculation purposes)

    * _longPopup_: A popup longer than this value (in pixels) is considered long
        (for layout calculation purposes)

    * _horizBuffer_: Horizontal flush popups are not allowed within this buffer
        area (in pixels) on the left or right screen edge

    * _activatorOffset_: The popup activator's offset on the page (in pixels);
        this should be calculated whenever the popup is to be shown
*/
enyo.kind({
	name: "enyo.ContextualLayout",
	kind: "Layout",
	//* Adjusts the popup position, as well as the nub location and direction.
	adjustPosition: function() {
		if (this.container.showing && this.container.hasNode()) {
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
			var topFlushPt = this.container.vertFlushMargin;
			var bottomFlushPt = innerHeight - this.container.vertFlushMargin;
			var leftFlushPt = this.container.horizFlushMargin;
			var rightFlushPt = innerWidth - this.container.horizFlushMargin;

			//Rule 1 - Activator Location based positioning
			//if the activator is in the top or bottom edges of the view, check if the popup needs flush positioning
			if ((this.offset.top + this.offset.height) < topFlushPt || this.offset.top > bottomFlushPt) {
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
			} else if ((this.offset.left + this.offset.width) < leftFlushPt || this.offset.left > rightFlushPt) {
				//if flush positioning didn't work then try just positioning horizontally (rule 1.b.iii & rule 1.b.iv)
				if (this.applyHorizontalPositioning()){
					return;
				}
			}

			//Rule 2 - no specific logic below for this rule since it is inheritent to the positioning functions, ie we attempt to never
			//position a popup where there isn't enough room for it.

			//Rule 3 - Popup Size based positioning
			var clientRect = this.getBoundingRect(this.container.node);

			//if the popup is wide then use vertical positioning
			if (clientRect.width > this.container.widePopup) {
				if (this.applyVerticalPositioning()){
					return;
				}
			}
			//if the popup is long then use horizontal positioning
			else if (clientRect.height > this.container.longPopup) {
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
		this.container.addClass("vertical");

		var clientRect = this.getBoundingRect(this.container.node);
		var innerHeight = this.getViewHeight();

		if (this.container.floating){
			if (this.offset.top < (innerHeight / 2)) {
				this.applyPosition({top: this.offset.top + this.offset.height, bottom: "auto"});
				this.container.addClass("below");
			} else {
				this.applyPosition({top: this.offset.top - clientRect.height, bottom: "auto"});
				this.container.addClass("above");
			}
		} else {
			//if the popup's bottom goes off the screen then put it on the top of the invoking control
			if ((clientRect.top + clientRect.height > innerHeight) && ((innerHeight - clientRect.bottom) < (clientRect.top - clientRect.height))){
				this.container.addClass("above");
			} else {
				this.container.addClass("below");
			}
		}

		//if moving the popup above or below the activator puts it past the edge of the screen then vertical doesn't work
		clientRect = this.getBoundingRect(this.container.node);
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

		var clientRect = this.getBoundingRect(this.container.node);
		var innerWidth = this.getViewWidth();

		if (this.container.floating){
			//Get the left edge delta to horizontally center the popup
			var centeredLeft = this.offset.left + this.offset.width/2 - clientRect.width/2;
			if (centeredLeft + clientRect.width > innerWidth) {//popup goes off right edge of the screen if centered
				this.applyPosition({left: this.offset.left + this.offset.width - clientRect.width});
				this.container.addClass("left");
			} else if (centeredLeft < 0) {//popup goes off left edge of the screen if centered
				this.applyPosition({left:this.offset.left});
				this.container.addClass("right");
			} else {//center the popup
				this.applyPosition({left: centeredLeft});
			}

		} else {
			//Get the left edge delta to horizontally center the popup
			var centeredLeftDelta = this.offset.left + this.offset.width/2 - clientRect.left - clientRect.width/2;
			if (clientRect.right + centeredLeftDelta > innerWidth) {//popup goes off right edge of the screen if centered
				this.applyPosition({left: this.offset.left + this.offset.width - clientRect.right});
				this.container.addRemoveClass("left", true);
			} else if (clientRect.left + centeredLeftDelta < 0) {//popup goes off left edge of the screen if centered
				this.container.addRemoveClass("right", true);
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

		var clientRect = this.getBoundingRect(this.container.node);
		var innerWidth = this.getViewWidth();

		//If the activator's right side is within our left side cut off use flush positioning
		if ((this.offset.left + this.offset.width/2) < leftFlushPt){
			//if the activator's left edge is too close or past the screen left edge
			if (this.offset.left + this.offset.width/2 < this.container.horizBuffer){
				this.applyPosition({left:this.container.horizBuffer + (this.container.floating ? 0 : -clientRect.left)});
			} else {
				this.applyPosition({left:this.offset.width/2  + (this.container.floating ? this.offset.left : 0)});
			}

			this.container.addClass("right");
			this.container.addClass("corner");
			return true;
		}
		//If the activator's left side is within our right side cut off use flush positioning
		else if (this.offset.left + this.offset.width/2 > rightFlushPt) {
			if ((this.offset.left+this.offset.width/2) > (innerWidth-this.container.horizBuffer)){
				this.applyPosition({left:innerWidth - this.container.horizBuffer - clientRect.right});
			} else {
				this.applyPosition({left: (this.offset.left + this.offset.width/2) - clientRect.right});
			}
			this.container.addClass("left");
			this.container.addClass("corner");
			return true;
		}

		return false;
	},
	//move the popup left or right of the activator & verify that it fits on screen
	initHorizontalPositioning: function() {
		this.resetPositioning();

		var clientRect = this.getBoundingRect(this.container.node);
		var innerWidth = this.getViewWidth();

		//adjust horizontal positioning of the popup & nub vertical positioning
		if (this.container.floating){
			if ((this.offset.left + this.offset.width) < innerWidth/2) {
				this.applyPosition({left: this.offset.left + this.offset.width});
				this.container.addRemoveClass("left", true);
			} else {
				this.applyPosition({left: this.offset.left - clientRect.width});
				this.container.addRemoveClass("right", true);
			}
		} else {
			if (this.offset.left - clientRect.width > 0) {
				this.applyPosition({left: this.offset.left - clientRect.left - clientRect.width});
				this.container.addRemoveClass("right", true);
			} else {
				this.applyPosition({left: this.offset.width});
				this.container.addRemoveClass("left", true);
			}
		}
		this.container.addRemoveClass("horizontal", true);

		//if moving the popup left or right of the activator puts it past the edge of the screen then horizontal won't work
		clientRect = this.getBoundingRect(this.container.node);
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

		var clientRect = this.getBoundingRect(this.container.node);
		var innerHeight = this.getViewHeight();
		var activatorCenter = this.offset.top + this.offset.height/2;

		if (this.container.floating){
			//if the activator's center is within 10% of the center of the view, vertically center the popup
			if ((activatorCenter >= (innerHeight/2 - 0.05 * innerHeight)) && (activatorCenter <= (innerHeight/2 + 0.05 * innerHeight))) {
				this.applyPosition({top: this.offset.top + this.offset.height/2 - clientRect.height/2, bottom: "auto"});
			} else if (this.offset.top + this.offset.height < innerHeight/2) { //the activator is in the top 1/2 of the screen
				this.applyPosition({top: this.offset.top, bottom: "auto"});
				this.container.addRemoveClass("high", true);
			} else { //otherwise the popup will be positioned in the bottom 1/2 of the screen
				this.applyPosition({top: this.offset.top - clientRect.height + this.offset.height*2, bottom: "auto"});
				this.container.addRemoveClass("low", true);
			}
		} else {
			//if the activator's center is within 10% of the center of the view, vertically center the popup
			if ((activatorCenter >= (innerHeight/2 - 0.05 * innerHeight)) && (activatorCenter <= (innerHeight/2 + 0.05 * innerHeight))) {
				this.applyPosition({top: (this.offset.height - clientRect.height)/2});
			} else if (this.offset.top + this.offset.height < innerHeight/2) { //the activator is in the top 1/2 of the screen
				this.applyPosition({top: -this.offset.height});
				this.container.addRemoveClass("high", true);
			} else { //otherwise the popup will be positioned in the bottom 1/2 of the screen
				this.applyPosition({top: clientRect.top - clientRect.height - this.offset.top + this.offset.height});
				this.container.addRemoveClass("low", true);
			}
		}
		return true;
	},
	applyHorizontalFlushPositioning: function(leftFlushPt, rightFlushPt) {
		//if we can't fit the popup left or right of the activator then forget vertical positioning
		if (!this.initHorizontalPositioning()) {
			return false;
		}

		var clientRect = this.getBoundingRect(this.container.node);
		var innerHeight = this.getViewHeight();

		//adjust vertical positioning (high or low nub & popup position)
		if (this.container.floating){
			if (this.offset.top < (innerHeight/2)){
				this.applyPosition({top: this.offset.top + this.offset.height/2});
				this.container.addRemoveClass("high", true);
			} else {
				this.applyPosition({top:this.offset.top + this.offset.height/2 - clientRect.height});
				this.container.addRemoveClass("low", true);
			}
		} else {
			if (((clientRect.top + clientRect.height) > innerHeight) && ((innerHeight - clientRect.bottom) < (clientRect.top - clientRect.height))) {
				this.applyPosition({top: clientRect.top - clientRect.height - this.offset.top - this.offset.height/2});
				this.container.addRemoveClass("low", true);
			} else {
				this.applyPosition({top: this.offset.height/2});
				this.container.addRemoveClass("high", true);
			}
		}

		//If the activator's right side is within our left side cut off use flush positioning
		if ((this.offset.left + this.offset.width) < leftFlushPt){
			this.container.addClass("left");
			this.container.addClass("corner");
			return true;
		}
		//If the activator's left side is within our right side cut off use flush positioning
		else if (this.offset.left > rightFlushPt) {
			this.container.addClass("right");
			this.container.addClass("corner");
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
	applyPosition: function(inRect) {
		var s = "";
		for (var n in inRect) {
			s += (n + ":" + inRect[n] + (isNaN(inRect[n]) ? "; " : "px; "));
		}
		this.container.addStyles(s);
	},
	resetPositioning: function() {
		this.container.removeClass("right");
		this.container.removeClass("left");
		this.container.removeClass("high");
		this.container.removeClass("low");
		this.container.removeClass("corner");
		this.container.removeClass("below");
		this.container.removeClass("above");
		this.container.removeClass("vertical");
		this.container.removeClass("horizontal");

		this.applyPosition({left: "auto"});
		this.applyPosition({top: "auto"});
	},
	reflow: function() {
		this.offset = this.container.activatorOffset;
		this.adjustPosition();
	}
});

/**
	_enyo.FittableLayout_ provides the base positioning and boundary logic for
	the fittable layout strategy. The fittable layout strategy is based on
	laying out items in either a set of rows or a set of columns, with most of
	the items having natural size, but one item expanding to fill the remaining
	space. The item that expands is labeled with the attribute _fit: true_.

	The subkinds [enyo.FittableColumnsLayout](#enyo.FittableColumnsLayout) and
	[enyo.FittableRowsLayout](#enyo.FittableRowsLayout) (or _their_ subkinds)
	are used for layout rather than _enyo.FittableLayout_ because they specify
	properties that the framework expects to be available when laying items out.

	For more information, see the documentation on
	[Fittables](building-apps/layout/fittables.html) in the Enyo Developer Guide.
*/

enyo.kind({
	name: 'enyo.FittableLayout',
	kind: 'Layout',

	//* @protected
	constructor: enyo.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			
			// Add the force-ltr class if we're in RTL mode, but this control is set explicitly to NOT be in RTL mode.
			this.container.addRemoveClass("force-left-to-right", (enyo.Control.prototype.rtl && !this.container.get("rtl")) );
		};
	}),
	calcFitIndex: function() {
		var aChildren = this.container.children,
			oChild,
			n;

		for (n=0; n<aChildren.length; n++) {
			oChild = aChildren[n];
			if (oChild.fit && oChild.showing) {
				return n;
			}
		}
	},

	getFitControl: function() {
		var aChildren = this.container.children,
			oFitChild = aChildren[this.fitIndex];

		if (!(oFitChild && oFitChild.fit && oFitChild.showing)) {
			this.fitIndex = this.calcFitIndex();
			oFitChild = aChildren[this.fitIndex];
		}
		return oFitChild;
	},

	shouldReverse: function() {
		return this.container.rtl && this.orient === "h";
	},

	getFirstChild: function() {
		var aChildren = this.getShowingChildren();

		if (this.shouldReverse()) {
			return aChildren[aChildren.length - 1];
		} else {
			return aChildren[0];
		}
	},

	getLastChild: function() {
		var aChildren = this.getShowingChildren();

		if (this.shouldReverse()) {
			return aChildren[0];
		} else {
			return aChildren[aChildren.length - 1];
		}
	},

	getShowingChildren: function() {
		var a = [],
			n = 0,
			aChildren = this.container.children,
			nLength   = aChildren.length;

		for (;n<nLength; n++) {
			if (aChildren[n].showing) {
				a.push(aChildren[n]);
			}
		}

		return a;
	},

	_reflow: function(sMeasureName, sClienMeasure, sAttrBefore, sAttrAfter) {
		this.container.addRemoveClass('enyo-stretch', !this.container.noStretch);

		var oFitChild       = this.getFitControl(),
			oContainerNode  = this.container.hasNode(),  // Container node
			nTotalSize     = 0,                          // Total container width or height without padding
			nBeforeOffset   = 0,                         // Offset before fit child
			nAfterOffset    = 0,                         // Offset after fit child
			oPadding,                                    // Object containing t,b,r,l paddings
			oBounds,                                     // Bounds object of fit control
			oLastChild,
			oFirstChild,
			nFitSize;

		if (!oFitChild || !oContainerNode) { return; }

		oPadding   = enyo.dom.calcPaddingExtents(oContainerNode);
		oBounds    = oFitChild.getBounds();
		nTotalSize = oContainerNode[sClienMeasure] - (oPadding[sAttrBefore] + oPadding[sAttrAfter]);

		if (this.shouldReverse()) {
			oFirstChild  = this.getFirstChild();
			nAfterOffset = nTotalSize - (oBounds[sAttrBefore] + oBounds[sMeasureName]);

			var nMarginBeforeFirstChild = enyo.dom.getComputedBoxValue(oFirstChild.hasNode(), 'margin', sAttrBefore) || 0;

			if (oFirstChild == oFitChild) {
				nBeforeOffset = nMarginBeforeFirstChild;
			} else {
				var oFirstChildBounds      = oFirstChild.getBounds(),
					nSpaceBeforeFirstChild = oFirstChildBounds[sAttrBefore];

				nBeforeOffset = oBounds[sAttrBefore] + nMarginBeforeFirstChild - nSpaceBeforeFirstChild;
			}
		} else {
			oLastChild    = this.getLastChild();
			nBeforeOffset = oBounds[sAttrBefore] - (oPadding[sAttrBefore] || 0);

			var nMarginAfterLastChild = enyo.dom.getComputedBoxValue(oLastChild.hasNode(), 'margin', sAttrAfter) || 0;

			if (oLastChild == oFitChild) {
				nAfterOffset = nMarginAfterLastChild;
			} else {
				var oLastChildBounds = oLastChild.getBounds(),
					nFitChildEnd     = oBounds[sAttrBefore] + oBounds[sMeasureName],
					nLastChildEnd    = oLastChildBounds[sAttrBefore] + oLastChildBounds[sMeasureName] +  nMarginAfterLastChild;

				nAfterOffset = nLastChildEnd - nFitChildEnd;
			}
		}

		nFitSize = nTotalSize - (nBeforeOffset + nAfterOffset);
		oFitChild.applyStyle(sMeasureName, nFitSize + 'px');
	},

	//* @public
	/**
		Updates the layout to reflect any changes to contained components or the
		layout container.
	*/
	reflow: function() {
		if (this.orient == 'h') {
			this._reflow('width', 'clientWidth', 'left', 'right');
		} else {
			this._reflow('height', 'clientHeight', 'top', 'bottom');
		}
	}
});

/**
	_enyo.FittableColumnsLayout_ provides a container in which items are laid
	out in a set of vertical columns, with most of the items having natural
	size, but one expanding to fill the remaining space. The one that expands is
	labeled with the attribute _fit: true_.

	_enyo.FittableColumnsLayout_ is meant to be used as a value for the
	_layoutKind_ property of other kinds. _layoutKind_ provides a way to add
	layout behavior in a pluggable fashion while retaining the ability to use a
	specific base kind.

	For more information, see the documentation on
	[Fittables](building-apps/layout/fittables.html) in the Enyo Developer Guide.
*/
enyo.kind({
	name        : 'enyo.FittableColumnsLayout',
	kind        : 'FittableLayout',
	orient      : 'h',
	layoutClass : 'enyo-fittable-columns-layout'
});


/**
	_enyo.FittableRowsLayout_ provides a container in which items are laid out
	in a set of horizontal rows, with most of the items having natural size, but
	one expanding to fill the remaining space. The one that expands is labeled
	with the attribute _fit: true_.

	_enyo.FittableRowsLayout_ is meant to be used as a value for the
	_layoutKind_ property of other kinds. _layoutKind_ provides a way to add
	layout behavior in a pluggable fashion while retaining the ability to use a
	specific base kind.

	For more information, see the documentation on
	[Fittables](building-apps/layout/fittables.html) in the Enyo Developer Guide.
*/
enyo.kind({
	name        : 'enyo.FittableRowsLayout',
	kind        : 'FittableLayout',
	layoutClass : 'enyo-fittable-rows-layout',
	orient      : 'v'
});

/**
	_enyo.FittableRows_ provides a container in which items are laid out in a
	set	of horizontal rows, with most of the items having natural size, but one
	expanding to fill the remaining space. The one that expands is labeled with
	the attribute _fit: true_.

	For more information, see the documentation on
	[Fittables](building-apps/layout/fittables.html) in the Enyo Developer Guide.
*/
enyo.kind({
	name: "enyo.FittableRows",
	layoutKind: "FittableRowsLayout",
	/** By default, items in rows stretch to fit horizontally; set to true to
		avoid this behavior */
	noStretch: false
});

/**
	_enyo.FittableColumns_ provides a container in which items are laid out in a
	set of vertical columns, with most items having natural size, but one
	expanding to fill the remaining space. The one that expands is labeled with
	the attribute _fit: true_.

	For more information, see the documentation on
	[Fittables](building-apps/layout/fittables.html) in the Enyo Developer Guide.
*/

enyo.kind({
	name: "enyo.FittableColumns",
	layoutKind: "FittableColumnsLayout",
	/** By default, items in columns stretch to fit vertically; set to true to
		avoid this behavior */
	noStretch: false
});

/**
	_enyo.FittableHeaderLayout_ extends
	[enyo.FittableColumnsLayout](#enyo.FittableColumnsLayout), providing a
	container in which items are laid out in a set of vertical columns, with most
	items having natural size, but one expanding to fill the remaining space. The
	one that expands is labeled with the attribute _fit: true_.

	For more information, see the documentation on
	[Fittables](building-apps/layout/fittables.html) in the Enyo Developer Guide.

*/
enyo.kind({
	name: "enyo.FittableHeaderLayout",
	kind: "FittableColumnsLayout",
	applyFitSize: enyo.inherit(function (sup) {
		return function(measure, total, before, after) {
			var padding = before - after;
			var f = this.getFitControl();

			if (padding < 0) {
				f.applyStyle("padding-left", Math.abs(padding) + "px");
				f.applyStyle("padding-right", null);
			} else if (padding > 0) {
				f.applyStyle("padding-left", null);
				f.applyStyle("padding-right", Math.abs(padding) + "px");
			} else {
				f.applyStyle("padding-left", null);
				f.applyStyle("padding-right", null);
			}

			sup.apply(this, arguments);
		};
	})
});

/**
	_enyo.FlyweightRepeater_ is a control that displays a repeating list of
	rows, suitable for displaying medium-sized lists (up to ~100 items). A
	flyweight strategy is employed to render one set of row controls, as needed,
	for as many rows as are contained in the repeater.

	The FlyweightRepeater's _components_ block contains the controls to be used
	for a single row. This set of controls will be rendered for each row. You
	may customize row rendering by handling the _onSetupItem_ event.

	The controls inside a FlyweightRepeater are non-interactive. This means that
	calling methods that would normally cause rendering to occur (e.g.,
	_set("content", value)_) will not do so. However, you may force a row to
	render by calling _renderRow(inRow)_.

	In addition, you may force a row to be temporarily interactive by calling
	_prepareRow(inRow)_. Call the _lockRow()_ method when the	interaction is
	complete.

	For more information, see the documentation on
	[Lists](building-apps/layout/lists.html) in the Enyo Developer Guide.
*/
enyo.kind({
	name: "enyo.FlyweightRepeater",
	published: {
		//* Number of rows to render
		count: 0,
		/**
			If true, the selection mechanism is disabled. Tap events are still
			sent, but items won't be automatically re-rendered when tapped.
		*/
		noSelect: false,
		//* If true, multiple selections are allowed
		multiSelect: false,
		//* If true, the selected item will toggle
		toggleSelected: false,
		/**
			Used to specify CSS classes for the repeater's wrapper component
			(client). Input is identical to enyo.Control.setClasses()
		*/
		clientClasses: '',
		/**
			Used to specify custom styling for the repeater's wrapper component
			(client). Input is identical to enyo.Control.setStyle()
		*/
		clientStyle: '',
		/**
			Offset applied to row number during generation. Used to allow a
			items to use a natural index instead of being forced to be
			0-based.  Must be positive, as row -1 is used for undefined rows
			in the event system.
		*/
		rowOffset: 0,
		/**
			Direction items will be laid out--either "v" for vertical
			or "h" for horizontal
		*/
		orient: "v"
	},
	events: {
		/**
			Fires once per row at render time.

			_inEvent.index_ contains the current row index.

			_inEvent.selected_ is a boolean indicating whether the current row
			is selected.
		*/
		onSetupItem: "",
		//* Fires after an individual row has been rendered from a call to _renderRow()_.
		onRenderRow: ""
	},
	//* design-time attribute, indicates if row indices run
	//* from [0.._count_-1] (false) or [_count_-1..0] (true)
	bottomUp: false,
	//* @protected
	components: [
		{kind: "Selection", onSelect: "selectDeselect", onDeselect: "selectDeselect"},
		{name: "client"}
	],
	create: enyo.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);
			this.noSelectChanged();
			this.multiSelectChanged();
			this.clientClassesChanged();
			this.clientStyleChanged();
		};
	}),
	noSelectChanged: function() {
		if (this.noSelect) {
			this.$.selection.clear();
		}
	},
	multiSelectChanged: function() {
		this.$.selection.setMulti(this.multiSelect);
	},
	clientClassesChanged: function() {
		this.$.client.setClasses(this.clientClasses);
	},
	clientStyleChanged: function() {
		this.$.client.setStyle(this.clientStyle);
	},
	setupItem: function(inIndex) {
		this.doSetupItem({index: inIndex, selected: this.isSelected(inIndex)});
	},
	//* Renders the list.
	generateChildHtml: enyo.inherit(function(sup) {
		return function() {
			var h = "";
			this.index = null;
			// note: can supply a rowOffset
			// and indicate if rows should be rendered top down or bottomUp
			for (var i=0, r=0; i<this.count; i++) {
				r = this.rowOffset + (this.bottomUp ? this.count - i-1 : i);
				this.setupItem(r);
				this.$.client.setAttribute("data-enyo-index", r);
				if (this.orient == "h") {
					this.$.client.setStyle("display:inline-block;");
				}
				h += sup.apply(this, arguments);
				this.$.client.teardownRender();
			}
			return h;
		};
	}),
	previewDomEvent: function(inEvent) {
		var i = this.index = this.rowForEvent(inEvent);
		inEvent.rowIndex = inEvent.index = i;
		inEvent.flyweight = this;
	},
	decorateEvent: enyo.inherit(function(sup) {
		return function(inEventName, inEvent, inSender) {
			// decorate event with index found via dom iff event does not already contain an index.
			var i = (inEvent && inEvent.index != null) ? inEvent.index : this.index;
			if (inEvent && i != null) {
				inEvent.index = i;
				inEvent.flyweight = this;
			}
			sup.apply(this, arguments);
		};
	}),
	tap: function(inSender, inEvent) {
		// ignore taps if selecting is disabled or if they don't target a row
		if (this.noSelect || inEvent.index === -1) {
			return;
		}
		if (this.toggleSelected) {
			this.$.selection.toggle(inEvent.index);
		} else {
			this.$.selection.select(inEvent.index);
		}
	},
	selectDeselect: function(inSender, inEvent) {
		this.renderRow(inEvent.key);
	},
	//* @public
	//* Returns the repeater's _selection_ component.
	getSelection: function() {
		return this.$.selection;
	},
	//* Gets the selection state for the given row index.
	isSelected: function(inIndex) {
		return this.getSelection().isSelected(inIndex);
	},
	//* Renders the row specified by _inIndex_.
	renderRow: function(inIndex) {
		// do nothing if index is out-of-range
		if (inIndex < this.rowOffset || inIndex >= this.count + this.rowOffset) {
			return;
		}
		//this.index = null;
		// always call the setupItem callback, as we may rely on the post-render state
		this.setupItem(inIndex);
		var node = this.fetchRowNode(inIndex);
		if (node) {
			enyo.dom.setInnerHtml(node, this.$.client.generateChildHtml());
			this.$.client.teardownChildren();
			this.doRenderRow({rowIndex: inIndex});
		}
	},
	//* Fetches the DOM node for the given row index.
	fetchRowNode: function(inIndex) {
		if (this.hasNode()) {
			return this.node.querySelector('[data-enyo-index="' + inIndex + '"]');
		}
	},
	//* Fetches the row number corresponding with the target of a given event.
	rowForEvent: function(inEvent) {
		if (!this.hasNode()) {
			return -1;
		}
		var n = inEvent.target;
		while (n && n !== this.node) {
			var i = n.getAttribute && n.getAttribute("data-enyo-index");
			if (i !== null) {
				return Number(i);
			}
			n = n.parentNode;
		}
		return -1;
	},
	//* Prepares the row specified by _inIndex_ such that changes made to the
	//* controls inside the repeater will be rendered for the given row.
	prepareRow: function(inIndex) {
		// do nothing if index is out-of-range
		if (inIndex < this.rowOffset || inIndex >= this.count + this.rowOffset) {
			return;
		}
		// update row internals to match model
		this.setupItem(inIndex);
		var n = this.fetchRowNode(inIndex);
		enyo.FlyweightRepeater.claimNode(this.$.client, n);
	},
	//* Prevents rendering of changes made to controls inside the repeater.
	lockRow: function() {
		this.$.client.teardownChildren();
	},
	//* Prepares the row specified by _inIndex_ such that changes made to the
	//* controls in the row will be rendered in the given row; then performs the
	//* function _inFunc_, and, finally, locks the row.
	performOnRow: function(inIndex, inFunc, inContext) {
		// do nothing if index is out-of-range
		if (inIndex < this.rowOffset || inIndex >= this.count + this.rowOffset) {
			return;
		}
		if (inFunc) {
			this.prepareRow(inIndex);
			enyo.call(inContext || null, inFunc);
			this.lockRow();
		}
	},
	statics: {
		//* Associates a flyweight rendered control (_inControl_) with a
		//* rendering context specified by _inNode_.
		claimNode: function(inControl, inNode) {
			var n;
			if (inNode) {
				if (inNode.id !== inControl.id) {
					n = inNode.querySelector("#" + inControl.id);
				}
				else {
					// inNode is already the right node, so just use it
					n = inNode;
				}
			}
			// FIXME: consider controls generated if we found a node or tag: null, the later so can teardown render
			inControl.generated = Boolean(n || !inControl.tag);
			inControl.node = n;
			if (inControl.node) {
				inControl.rendered();
			} else {
				//enyo.log("Failed to find node for",  inControl.id, inControl.generated);
			}
			// update control's class cache based on the node contents
			for (var i=0, c$=inControl.children, c; (c=c$[i]); i++) {
				this.claimNode(c, inNode);
			}
		}
	}
});

/**
	_enyo.List_ is a control that displays a scrolling list of rows, suitable
	for displaying very large lists. It is optimized such that only a small
	portion of the list is rendered at a given time. A flyweight pattern is
	employed, in which controls placed inside the list are created once, but
	rendered for each list item. For this reason, it's best to use only simple
	controls in	a List, such as [enyo.Control](#enyo.Control) and
	[enyo.Image](#enyo.Image).

	A List's _components_ block contains the controls to be used for a single
	row. This set of controls will be rendered for each row. You may customize
	row rendering by handling the _onSetupItem_ event.

	Events fired from within list rows contain the _index_ property, which may
	be used to identify the row	from which the event originated.

	Beginning with Enyo 2.2, lists have built-in support for swipeable and
	reorderable list items.  Individual list items are swipeable by default; to
	enable reorderability, set the _reorderable_ property to _true_.

	For more information, see the documentation on
	[Lists](building-apps/layout/lists.html) in the Enyo Developer Guide.
*/
enyo.kind({
	name: "enyo.List",
	kind: "Scroller",
	classes: "enyo-list",
	published: {
		/**
			The number of rows contained in the list. Note that as the amount of
			list data changes, _setRows_ can be called to adjust the number of
			rows. To re-render the list at the current position when the count
			has changed, call the _refresh_ method.  If the whole data model of
			the list has changed and you want to redisplay from the top, call
			the _reset_ method instead.
		*/
		count: 0,
		/**
			The number of rows to be shown on a given list page segment.
			There is generally no need to adjust this value.
		*/
		rowsPerPage: 50,
		/**
			Direction list will be rendered & scrollable--either "v" for vertical
			or "h" for horizontal
		*/
		orient: "v",
		/**
			If true, renders the list such that row 0 is at the bottom of the
			viewport and the beginning position of the list is scrolled to the
			bottom
		*/
		bottomUp: false,
		/**
			If true, the selection mechanism is disabled. Tap events are still
			sent, but items won't be automatically re-rendered when tapped.
		*/
		noSelect: false,
		//* If true, multiple selections are allowed
		multiSelect: false,
		//* If true, the selected item will toggle
		toggleSelected: false,
		//* If true, the list will assume all rows have the same size for optimization
		fixedSize: false,
		//* If true, the list will allow the user to reorder list items
		reorderable: false,
		//* If true and _reorderable_ is true, reorderable item will be centered on finger
		//* when created. When false, it will be created over old item and will then track finger.
		centerReorderContainer: true,
		//* Array containing components shown as the placeholder when reordering list items.
		reorderComponents: [],
		//* Array containing components for the pinned version of a row. If not provided, reordering
		//* will not support pinned mode.
		pinnedReorderComponents: [],
		//* Array containing any swipeable components that will be used
		swipeableComponents: [],
		//* If true, swipe functionality is enabled
		enableSwipe: false,
		//* If true, tells list to persist the current swipeable item
		persistSwipeableItem: false
	},
	events: {
		/**
			Fires once per row at render time.
			_inEvent.index_ contains the current row index.
		*/
		onSetupItem: "",
		//* Reorder events
		onSetupReorderComponents: "",
		onSetupPinnedReorderComponents: "",
		onReorder: "",
		//* Swipe events
		onSetupSwipeItem: "",
		onSwipeDrag: "",
		onSwipe: "",
		onSwipeComplete: ""
	},
	handlers: {
		onAnimateFinish: "animateFinish",
		onRenderRow: "rowRendered",
		ondragstart: "dragstart",
		ondrag: "drag",
		ondragfinish: "dragfinish",
		onup: "up",
		onholdpulse: "holdpulse",
		onflick: "flick"
	},
	//* @protected
	rowSize: 0,
	listTools: [
		{name: "port", classes: "enyo-list-port enyo-border-box", components: [
			{name: "generator", kind: "FlyweightRepeater", canGenerate: false, components: [
				{tag: null, name: "client"}
			]},
			{name: "holdingarea", allowHtml: true, classes: "enyo-list-holdingarea"},
			{name: "page0", allowHtml: true, classes: "enyo-list-page"},
			{name: "page1", allowHtml: true, classes: "enyo-list-page"},
			{name: "placeholder", classes: "enyo-list-placeholder"},
			{name: "swipeableComponents", style: "position:absolute; display:block; top:-1000px; left:0;"}
		]}
	],

	//* Reorder vars
	// how long, in ms, to wait for to active reordering
	reorderHoldTimeMS: 600,
	// index of the row that we're moving
	draggingRowIndex: -1,
	initHoldCounter: 3,
	holdCounter: 3,
	holding: false,
	// node of the dragged row, used to keep touch events alive
	draggingRowNode: null,
	// index of the row before which we'll show the placeholder item.  If the placeholder
	// is at the end of the list, this will be one larger than the row count.
	placeholderRowIndex: -1,
	// determines scroll height at top/bottom of list where dragging will cause scroll
	dragToScrollThreshold: 0.1,
	// used to determine direction of scrolling during reordering
	prevScrollTop: 0,
	// how many MS between scroll events when autoscrolling
	autoScrollTimeoutMS: 20,
	// holds timeout ID for autoscroll
	autoScrollTimeout: null,
	// keep last event Y coordinate to update placeholder position during autoscroll
	autoscrollPageY: 0,
	// set to true to indicate that we're in pinned reordering mode
	pinnedReorderMode: false,
	// y-coordinate of the original location of the pinned row
	initialPinPosition: -1,
	// set to true after drag-and-drop has moved the reordering item at least one space
	// used to activate pin mode if item is dropped immediately
	itemMoved: false,
	// this tracks the page where the being-dragged item is so we can detect
	// when we switch pages and need to adjust rendering
	currentPageNumber: -1,
	// timeout for completing reorder operation
	completeReorderTimeout: null,

	//* Swipeable vars
	// Index of swiped item
	swipeIndex: null,
	// Direction of swipe
	swipeDirection: null,
	// True if a persistent item is currently persisting
	persistentItemVisible: false,
	// Side from which the persisting item came
	persistentItemOrigin: null,
	// True if swipe was completed
	swipeComplete: false,
	// Timeout used to wait before completing swipe action
	completeSwipeTimeout: null,
	// Time in MS to wait before completing swipe action
	completeSwipeDelayMS: 500,
	// Time in MS for normal swipe animation
	normalSwipeSpeedMS: 200,
	// Time in seconds for fast swipe animation
	fastSwipeSpeedMS: 100,
	// Percentage of a swipe needed to force completion of the swipe
	percentageDraggedThreshold: 0.2,

	importProps: enyo.inherit(function(sup) {
		return function(inProps) {
			// force touch on desktop when we have reorderable items to work around
			// problems with native scroller
			if (inProps && inProps.reorderable) {
				this.touch = true;
			}
			sup.apply(this, arguments);
		};
	}),
	create: enyo.inherit(function(sup) {
		return function() {
			this.pageSizes = [];
			this.orientV = this.orient == "v";
			this.vertical = this.orientV ? "default" : "hidden";
			sup.apply(this, arguments);
			this.$.generator.orient = this.orient;
			this.getStrategy().translateOptimized = true;
			this.$.port.addRemoveClass("horizontal",!this.orientV);
			this.$.port.addRemoveClass("vertical",this.orientV);
			this.$.page0.addRemoveClass("vertical",this.orientV);
			this.$.page1.addRemoveClass("vertical",this.orientV);
			this.bottomUpChanged();  // Initializes pageBound also
			this.noSelectChanged();
			this.multiSelectChanged();
			this.toggleSelectedChanged();
			// setup generator to default to "full-list" values
			this.$.generator.setRowOffset(0);
			this.$.generator.setCount(this.count);
		};
	}),
	initComponents: enyo.inherit(function(sup) {
		return function() {
			this.createReorderTools();
			sup.apply(this, arguments);
			this.createSwipeableComponents();
		};
	}),
	createReorderTools: function() {
		this.createComponent({
			name: "reorderContainer",
			classes: "enyo-list-reorder-container",
			ondown: "sendToStrategy",
			ondrag: "sendToStrategy",
			ondragstart: "sendToStrategy",
			ondragfinish: "sendToStrategy",
			onflick: "sendToStrategy"
		});
	},
	createStrategy: enyo.inherit(function(sup) {
		return function() {
			this.controlParentName = "strategy";
			sup.apply(this, arguments);
			this.createChrome(this.listTools);
			this.controlParentName = "client";
			this.discoverControlParent();
		};
	}),
	createSwipeableComponents: function() {
		for (var i=0;i<this.swipeableComponents.length;i++) {
			this.$.swipeableComponents.createComponent(this.swipeableComponents[i], {owner: this.owner});
		}
	},
	rendered: enyo.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);
			this.$.generator.node = this.$.port.hasNode();
			this.$.generator.generated = true;
			this.reset();
		};
	}),
	resizeHandler: enyo.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);
			this.refresh();
		};
	}),
	bottomUpChanged: function() {
		this.$.generator.bottomUp = this.bottomUp;
		this.$.page0.applyStyle(this.pageBound, null);
		this.$.page1.applyStyle(this.pageBound, null);

		if (this.orientV) {
			this.pageBound = this.bottomUp ? "bottom" : "top";
		} else {
			if (this.rtl) {
				this.pageBound = this.bottomUp ? "left" : "right";
			} else {
				this.pageBound = this.bottomUp ? "right" : "left";
			}
		}

		if (!this.orientV && this.bottomUp){
			this.$.page0.applyStyle("left", "auto");
			this.$.page1.applyStyle("left", "auto");
		}

		if (this.hasNode()) {
			this.reset();
		}
	},
	noSelectChanged: function() {
		this.$.generator.setNoSelect(this.noSelect);
	},
	multiSelectChanged: function() {
		this.$.generator.setMultiSelect(this.multiSelect);
	},
	toggleSelectedChanged: function() {
		this.$.generator.setToggleSelected(this.toggleSelected);
	},
	countChanged: function() {
		if (this.hasNode()) {
			this.updateMetrics();
		}
	},
	sendToStrategy: function(s,e) {
		this.$.strategy.dispatchEvent("on" + e.type, e, s);
	},
	updateMetrics: function() {
		this.defaultPageSize = this.rowsPerPage * (this.rowSize || 100);
		this.pageCount = Math.ceil(this.count / this.rowsPerPage);
		this.portSize = 0;
		for (var i=0; i < this.pageCount; i++) {
			this.portSize += this.getPageSize(i);
		}
		this.adjustPortSize();
	},
	//* Hold pulse handler - use this to delay before running hold logic
	holdpulse: function(inSender,inEvent) {
		// don't activate if we're not supporting reordering or if we've already
		// activated the reorder logic
		if (!this.getReorderable() || this.isReordering()) {
			return;
		}
		// first pulse event that exceeds our minimum hold time activates
		if (inEvent.holdTime >= this.reorderHoldTimeMS) {
			// determine if we should handle the hold event
			if (this.shouldStartReordering(inSender, inEvent)) {
				this.startReordering(inEvent);
				return false;
			}
		}
	},
	//* DragStart event handler
	dragstart: function(inSender, inEvent) {
		// stop dragstart from propogating if we're in reorder mode
		if (this.isReordering()) {
			return true;
		}
		if (this.isSwipeable()) {
			return this.swipeDragStart(inSender, inEvent);
		}
	},
	//* Drag event handler
	drag: function(inSender, inEvent) {
		// determine if we should handle the drag event
		if (this.shouldDoReorderDrag(inEvent)) {
			inEvent.preventDefault();
			this.reorderDrag(inEvent);
			return true;
		}
		else if (this.isSwipeable()) {
			inEvent.preventDefault();
			this.swipeDrag(inSender, inEvent);
			return true;
		}
	},
	//* Dragfinish event handler
	dragfinish: function(inSender, inEvent) {
		if (this.isReordering()) {
			this.finishReordering(inSender, inEvent);
		}
		else if (this.isSwipeable()) {
			this.swipeDragFinish(inSender, inEvent);
		}
	},
	//* up event handler
	up: function(inSender, inEvent) {
		if (this.isReordering()) {
			this.finishReordering(inSender, inEvent);
		}
	},
	generatePage: function(inPageNo, inTarget) {
		this.page = inPageNo;
		var r = this.rowsPerPage * this.page;
		this.$.generator.setRowOffset(r);
		var rpp = Math.min(this.count - r, this.rowsPerPage);
		this.$.generator.setCount(rpp);
		var html = this.$.generator.generateChildHtml();
		inTarget.setContent(html);
		// prevent reordering row from being draw twice
		if (this.getReorderable() && this.draggingRowIndex > -1) {
			this.hideReorderingRow();
		}
		var bounds = inTarget.getBounds();
		var pageSize = this.orientV ? bounds.height : bounds.width;
		// if rowSize is not set, use the height or width from the first generated page
		if (!this.rowSize && pageSize > 0) {
			this.rowSize = Math.floor(pageSize / rpp);
			this.updateMetrics();
		}
		// update known page sizes
		if (!this.fixedSize) {
			var s0 = this.getPageSize(inPageNo);
			if (s0 != pageSize && pageSize > 0) {
				this.pageSizes[inPageNo] = pageSize;
				this.portSize += pageSize - s0;
			}
		}
	},
	//* map a row index number to the page number it would be in
	pageForRow: function(inIndex) {
		return Math.floor(inIndex / this.rowsPerPage);
	},
	// preserve original DOM node because it may be needed to route touch events
	preserveDraggingRowNode: function(pageNo) {
		if (this.draggingRowNode && this.pageForRow(this.draggingRowIndex) === pageNo) {
			this.$.holdingarea.hasNode().appendChild(this.draggingRowNode);
			this.draggingRowNode = null;
			this.removedInitialPage = true;
		}
	},
	update: function(inScrollStart) {
		var updated = false;
		// get page info for position
		var pi = this.positionToPageInfo(inScrollStart);
		// zone line position
		var pos = pi.pos + this.scrollerSize/2;
		// leap-frog zone position
		var k = Math.floor(pos/Math.max(pi.size, this.scrollerSize) + 1/2) + pi.no;
		// which page number for page0 (even number pages)?
		var p = (k % 2 === 0) ? k : k-1;
		if (this.p0 != p && this.isPageInRange(p)) {
			this.preserveDraggingRowNode(this.p0);
			this.generatePage(p, this.$.page0);
			this.positionPage(p, this.$.page0);
			this.p0 = p;
			updated = true;
			this.p0RowBounds = this.getPageRowSizes(this.$.page0);
		}
		// which page number for page1 (odd number pages)?
		p = (k % 2 === 0) ? Math.max(1, k-1) : k;
		// position data page 1
		if (this.p1 != p && this.isPageInRange(p)) {
			this.preserveDraggingRowNode(this.p1);
			this.generatePage(p, this.$.page1);
			this.positionPage(p, this.$.page1);
			this.p1 = p;
			updated = true;
			this.p1RowBounds = this.getPageRowSizes(this.$.page1);
		}
		if (updated) {
			// reset generator back to "full-list" values
			this.$.generator.setRowOffset(0);
			this.$.generator.setCount(this.count);
			if (!this.fixedSize) {
				this.adjustBottomPage();
				this.adjustPortSize();
			}
		}
	},
	getPageRowSizes: function(page) {
		var rows = {};
		var allDivs = page.hasNode().querySelectorAll("div[data-enyo-index]");
		for (var i=0, index, bounds; i < allDivs.length; i++) {
			index = allDivs[i].getAttribute("data-enyo-index");
			if (index !== null) {
				bounds = enyo.dom.getBounds(allDivs[i]);
				rows[parseInt(index, 10)] = {height: bounds.height, width: bounds.width};
			}
		}
		return rows;
	},
	updateRowBounds: function(index) {
		if (this.p0RowBounds[index]) {
			this.updateRowBoundsAtIndex(index, this.p0RowBounds, this.$.page0);
		}
		else if (this.p1RowBounds[index]) {
			this.updateRowBoundsAtIndex(index, this.p1RowBounds, this.$.page1);
		}
	},
	updateRowBoundsAtIndex: function(index, rows, page) {
		var rowDiv = page.hasNode().querySelector('div[data-enyo-index="' + index + '"]');
		var bounds = enyo.dom.getBounds(rowDiv);
		rows[index].height = bounds.height;
		rows[index].width = bounds.width;
	},
	updateForPosition: function(inPos) {
		this.update(this.calcPos(inPos));
	},
	calcPos: function(inPos) {
		return (this.bottomUp ? (this.portSize - this.scrollerSize - inPos) : inPos);
	},
	adjustBottomPage: function() {
		var bp = this.p0 >= this.p1 ? this.$.page0 : this.$.page1;
		this.positionPage(bp.pageNo, bp);
	},
	adjustPortSize: function() {
		this.scrollerSize = this.orientV ? this.getBounds().height : this.getBounds().width;
		var s = Math.max(this.scrollerSize, this.portSize);
		this.$.port.applyStyle((this.orientV ? "height" : "width"), s + "px");
		if (!this.orientV) {
			this.$.port.applyStyle("height", this.getBounds().height + "px");
		}
	},
	positionPage: function(inPage, inTarget) {
		inTarget.pageNo = inPage;
		var p = this.pageToPosition(inPage);
		inTarget.applyStyle(this.pageBound, p + "px");
	},
	pageToPosition: function(inPage) {
		var p = 0;
		var page = inPage;
		while (page > 0) {
			page--;
			p += this.getPageSize(page);
		}
		return p;
	},
	positionToPageInfo: function(inP) {
		var page = -1;
		var p = this.calcPos(inP);
		var s = this.defaultPageSize;
		while (p >= 0) {
			page++;
			s = this.getPageSize(page);
			p -= s;
		}
		page = Math.max(page, 0);
		return {
			no: page,
			size: s,
			pos: p + s,
			startRow: (page * this.rowsPerPage),
			endRow: Math.min((page + 1) * this.rowsPerPage - 1, this.count - 1)
		};
	},
	isPageInRange: function(inPage) {
		return inPage == Math.max(0, Math.min(this.pageCount-1, inPage));
	},
	getPageSize: function(inPageNo) {
		var size = this.pageSizes[inPageNo];
		// estimate the size based on how many rows are in this page
		if (!size) {
			var firstRow = this.rowsPerPage * inPageNo;
			var numRows = Math.min(this.count - firstRow, this.rowsPerPage);
			size = this.defaultPageSize * (numRows / this.rowsPerPage);
		}
		// can never return size of 0, as that would lead to infinite loops
		return Math.max(1, size);
	},
	invalidatePages: function() {
		this.p0 = this.p1 = null;
		this.p0RowBounds = {};
		this.p1RowBounds = {};
		// clear the html in our render targets
		this.$.page0.setContent("");
		this.$.page1.setContent("");
	},
	invalidateMetrics: function() {
		this.pageSizes = [];
		this.rowSize = 0;
		this.updateMetrics();
	},
	scroll: enyo.inherit(function(sup) {
		return function(inSender, inEvent) {
			var r = sup.apply(this, arguments);
			var pos = this.orientV ? this.getScrollTop() : this.getScrollLeft();
			if (this.lastPos === pos) {
				return r;
			}
			this.lastPos = pos;
			this.update(pos);
			if (this.pinnedReorderMode) {
				this.reorderScroll(inSender, inEvent);
			}
			return r;
		};
	}),
	setScrollTop: enyo.inherit(function(sup) {
		return function(inScrollTop) {
			this.update(inScrollTop);
			sup.apply(this, arguments);
			this.twiddle();
		};
	}),
	getScrollPosition: function() {
		return this.calcPos(this[(this.orientV ? "getScrollTop" : "getScrollLeft")]());
	},
	setScrollPosition: function(inPos) {
		this[(this.orientV ? "setScrollTop" : "setScrollLeft")](this.calcPos(inPos));
	},
	//* @public
	//* Scrolls the list so the last item is visible.
	scrollToBottom: enyo.inherit(function(sup) {
		return function() {
			this.update(this.getScrollBounds().maxTop);
			sup.apply(this, arguments);
		};
	}),
	//* Scrolls to the specified row.
	scrollToRow: function(inRow) {
		var page = this.pageForRow(inRow);
		var h = this.pageToPosition(page);
		// update the page
		this.updateForPosition(h);
		// call pageToPosition again and this time should return the right pos since the page info is populated
		h = this.pageToPosition(page);
		this.setScrollPosition(h);
		if (page == this.p0 || page == this.p1) {
			var rowNode = this.$.generator.fetchRowNode(inRow);
			if (rowNode) {
				// calc row offset
				var offset = (this.orientV ? rowNode.offsetTop : rowNode.offsetLeft);
				if (this.bottomUp) {
					offset = this.getPageSize(page) - (this.orientV ? rowNode.offsetHeight : rowNode.offsetWidth) - offset;
				}
				var p = this.getScrollPosition() + offset;
				this.setScrollPosition(p);
			}
		}
	},
	//* Scrolls to the beginning of the list.
	scrollToStart: function() {
		this[this.bottomUp ? (this.orientV ? "scrollToBottom" : "scrollToRight") : "scrollToTop"]();
	},
	//* Scrolls to the end of the list.
	scrollToEnd: function() {
		this[this.bottomUp ? (this.orientV ? "scrollToTop" : "scrollToLeft") : (this.orientV ? "scrollToBottom" : "scrollToRight")]();
	},
	//* Re-renders the list at the current position.
	refresh: function() {
		this.invalidatePages();
		this.update(this[(this.orientV ? "getScrollTop" : "getScrollLeft")]());
		this.stabilize();

		//FIXME: Necessary evil for Android 4.0.4 refresh bug
		if (enyo.platform.android === 4) {
			this.twiddle();
		}
	},
	/**
		Re-renders the list from the beginning.  This is used when changing the
		data model for the list.  This also clears the selection state.
	*/
	reset: function() {
		this.getSelection().clear();
		this.invalidateMetrics();
		this.invalidatePages();
		this.stabilize();
		this.scrollToStart();
	},
	/**
		Returns the [enyo.Selection](#enyo.Selection) component that
		manages the selection state for	this list.
	*/
	getSelection: function() {
		return this.$.generator.getSelection();
	},
	/**
		Sets the selection state for the given row index.
		_inData_ is an optional data value stored in the selection object.

		Modifying selection will not automatically rerender the row,
		so use [renderRow](#enyo.List::renderRow) or [refresh](#enyo.List::refresh)
		to update the view.
	*/
	select: function(inIndex, inData) {
		return this.getSelection().select(inIndex, inData);
	},
	/**
		Clears the selection state for the given row index.

		Modifying selection will not automatically re-render the row,
		so use [renderRow](#enyo.List::renderRow) or [refresh](#enyo.List::refresh)
		to update the view.
	*/
	deselect: function(inIndex) {
		return this.getSelection().deselect(inIndex);
	},
	//* Gets the selection state for the given row index.
	isSelected: function(inIndex) {
		return this.$.generator.isSelected(inIndex);
	},
	/**
		Re-renders the specified row. Call this method after making
		modifications to a row, to force it to render.
    */
    renderRow: function(inIndex) {
		this.$.generator.renderRow(inIndex);
    },
	//* Updates row bounds when rows are re-rendered.
	rowRendered: function(inSender, inEvent) {
		this.updateRowBounds(inEvent.rowIndex);
	},
	//* Prepares the row to become interactive.
	prepareRow: function(inIndex) {
		this.$.generator.prepareRow(inIndex);
	},
	//* Restores the row to being non-interactive.
	lockRow: function() {
		this.$.generator.lockRow();
	},
	/**
		Performs a set of tasks by running the function _inFunc_ on a row (which
		must be interactive at the time the tasks are performed). Locks the	row
		when done.
	*/
	performOnRow: function(inIndex, inFunc, inContext) {
		this.$.generator.performOnRow(inIndex, inFunc, inContext);
	},
	//* @protected
	animateFinish: function(inSender) {
		this.twiddle();
		return true;
	},
	// FIXME: Android 4.04 has issues with nested composited elements; for example, a SwipeableItem,
	// can incorrectly generate taps on its content when it has slid off the screen;
	// we address this BUG here by forcing the Scroller to "twiddle" which corrects the bug by
	// provoking a dom update.
	twiddle: function() {
		var s = this.getStrategy();
		enyo.call(s, "twiddle");
	},
	// return page0 or page1 control depending on pageNumber odd/even status
	pageForPageNumber: function(pageNumber, checkRange) {
		if (pageNumber % 2 === 0) {
			return (!checkRange || (pageNumber === this.p0)) ? this.$.page0 : null;
		}
		else {
			return (!checkRange || (pageNumber === this.p1)) ? this.$.page1 : null;
		}
		return null;
	},
	/**
		---- Reorder functionality ------------
	*/
	//* Determines whether we should handle the hold event as a reorder hold.
	shouldStartReordering: function(inSender, inEvent) {
		if (!this.getReorderable() ||
			inEvent.rowIndex == null ||
			inEvent.rowIndex < 0 ||
			this.pinnedReorderMode ||
			inSender !== this.$.strategy ||
			inEvent.index == null ||
			inEvent.index < 0) {
			return false;
		}
		return true;
	},
	//* Processes hold event and prepares for reordering.
	startReordering: function(inEvent) {
		// disable drag to scroll on strategy
		this.$.strategy.listReordering = true;

		this.buildReorderContainer();
		this.doSetupReorderComponents(inEvent);
		this.styleReorderContainer(inEvent);

		this.draggingRowIndex = this.placeholderRowIndex = inEvent.rowIndex;
		this.draggingRowNode = inEvent.target;
		this.removedInitialPage = false;
		this.itemMoved = false;
		this.initialPageNumber = this.currentPageNumber = this.pageForRow(inEvent.rowIndex);
		this.prevScrollTop = this.getScrollTop();

		// fill row being reordered with placeholder
		this.replaceNodeWithPlaceholder(inEvent.rowIndex);
	},
	/**
		Fills reorder container with draggable reorder components defined by the
		application.
	*/
	buildReorderContainer: function() {
		this.$.reorderContainer.destroyClientControls();
		for (var i=0;i<this.reorderComponents.length;i++) {
			this.$.reorderContainer.createComponent(this.reorderComponents[i], {owner:this.owner});
		}
		this.$.reorderContainer.render();
	},
	//* Prepares floating reorder container.
	styleReorderContainer: function(e) {
		this.setItemPosition(this.$.reorderContainer, e.rowIndex);
		this.setItemBounds(this.$.reorderContainer, e.rowIndex);
		this.$.reorderContainer.setShowing(true);
		if (this.centerReorderContainer) {
			this.centerReorderContainerOnPointer(e);
		}
	},
	//* Copies the innerHTML of _node_ into a new component inside of
	//* _reorderContainer_.
	appendNodeToReorderContainer: function(node) {
		this.$.reorderContainer.createComponent({allowHtml: true, content: node.innerHTML}).render();
	},
	//* Centers the floating reorder container on the user's pointer.
	centerReorderContainerOnPointer: function(e) {
		var containerPosition = enyo.dom.calcNodePosition(this.hasNode());
		var x = e.pageX - containerPosition.left - parseInt(this.$.reorderContainer.domStyles.width, 10)/2;
		var y = e.pageY - containerPosition.top + this.getScrollTop() - parseInt(this.$.reorderContainer.domStyles.height, 10)/2;
		if (this.getStrategyKind() != "ScrollStrategy") {
			x -= this.getScrollLeft();
			y -= this.getScrollTop();
		}
		this.positionReorderContainer(x,y);
	},
	/**
		Moves the reorder container to the specified _x_ and _y_ coordinates.
		Animates and kicks off timer to turn off animation.
	*/
	positionReorderContainer: function(x,y) {
		this.$.reorderContainer.addClass("enyo-animatedTopAndLeft");
		this.$.reorderContainer.addStyles("left:"+x+"px;top:"+y+"px;");
		this.setPositionReorderContainerTimeout();
	},
	setPositionReorderContainerTimeout: function() {
		this.clearPositionReorderContainerTimeout();
		this.positionReorderContainerTimeout = setTimeout(this.bindSafely(
			function() {
				this.$.reorderContainer.removeClass("enyo-animatedTopAndLeft");
				this.clearPositionReorderContainerTimeout();
			}), 100);
	},
	clearPositionReorderContainerTimeout: function() {
		if (this.positionReorderContainerTimeout) {
			clearTimeout(this.positionReorderContainerTimeout);
			this.positionReorderContainerTimeout = null;
		}
	},
	//* Determines whether we should handle the drag event.
	shouldDoReorderDrag: function() {
		if (!this.getReorderable() || this.draggingRowIndex < 0 || this.pinnedReorderMode) {
			return false;
		}
		return true;
	},
	//* Handles the drag event as a reorder drag.
	reorderDrag: function(inEvent) {
		// position reorder node under mouse/pointer
		this.positionReorderNode(inEvent);

		// determine if we need to auto-scroll the list
		this.checkForAutoScroll(inEvent);

		// if the current index the user is dragging over has changed, move the placeholder
		this.updatePlaceholderPosition(inEvent.pageY);
	},
	updatePlaceholderPosition: function(pageY) {
		var index = this.getRowIndexFromCoordinate(pageY);
		if (index !== -1) {
			// cursor moved over a new row, so determine direction of movement
			if (index >= this.placeholderRowIndex) {
				this.movePlaceholderToIndex(Math.min(this.count, index + 1));
			}
			else {
				this.movePlaceholderToIndex(index);
			}
		}
	},
	//* Positions the reorder node based on the dx and dy of the drag event.
	positionReorderNode: function(e) {
		var reorderNodeBounds = this.$.reorderContainer.getBounds();
		var left = reorderNodeBounds.left + e.ddx;
		var top = reorderNodeBounds.top + e.ddy;
		top = (this.getStrategyKind() == "ScrollStrategy") ? top + (this.getScrollTop() - this.prevScrollTop) : top;
		this.$.reorderContainer.addStyles("top: "+top+"px ; left: "+left+"px");
		this.prevScrollTop = this.getScrollTop();
	},
	/**
		Checks if the list should scroll when dragging and, if so, starts the
		scroll timeout timer. Auto-scrolling happens when the user drags an item
		within the top/bottom boundary percentage defined in
		_this.dragToScrollThreshold_.
	*/
	checkForAutoScroll: function(inEvent) {
		var position = enyo.dom.calcNodePosition(this.hasNode());
		var bounds = this.getBounds();
		var perc;
		this.autoscrollPageY = inEvent.pageY;
		if (inEvent.pageY - position.top < bounds.height * this.dragToScrollThreshold) {
			perc = 100*(1 - ((inEvent.pageY - position.top) / (bounds.height * this.dragToScrollThreshold)));
			this.scrollDistance = -1*perc;
		} else if (inEvent.pageY - position.top > bounds.height * (1 - this.dragToScrollThreshold)) {
			perc = 100*((inEvent.pageY - position.top - bounds.height*(1 - this.dragToScrollThreshold)) / (bounds.height - (bounds.height * (1 - this.dragToScrollThreshold))));
			this.scrollDistance = 1*perc;
		} else {
			this.scrollDistance = 0;
		}
		// stop scrolling if distance is zero (i.e., user isn't scrolling to the edges of
		// the list); otherwise, start it if not already started
		if (this.scrollDistance === 0) {
			this.stopAutoScrolling();
		} else {
			if (!this.autoScrollTimeout) {
				this.startAutoScrolling();
			}
		}
	},
	//* Stops auto-scrolling.
	stopAutoScrolling: function() {
		if (this.autoScrollTimeout) {
			clearTimeout(this.autoScrollTimeout);
			this.autoScrollTimeout = null;
		}
	},
	//* Starts auto-scrolling.
	startAutoScrolling: function() {
		this.autoScrollTimeout = setInterval(this.bindSafely(this.autoScroll), this.autoScrollTimeoutMS);
	},
	//* Scrolls the list by the distance specified in _this.scrollDistance_.
	autoScroll: function() {
		if (this.scrollDistance === 0) {
			this.stopAutoScrolling();
		} else {
			if (!this.autoScrollTimeout) {
				this.startAutoScrolling();
			}
		}
		this.setScrollPosition(this.getScrollPosition() + this.scrollDistance);
		this.positionReorderNode({ddx: 0, ddy: 0});

		// if the current index the user is dragging over has changed, move the placeholder
		this.updatePlaceholderPosition(this.autoscrollPageY);
	},
	/**
		Moves the placeholder (i.e., the gap between rows) to the row currently
		under the user's pointer. This provides a visual cue, showing the user
		where the item being dragged will go if it is dropped.
	*/
	movePlaceholderToIndex: function(index) {
		var node, nodeParent;
		if (index < 0) {
			return;
		}
		else if (index >= this.count) {
			node = null;
			nodeParent = this.pageForPageNumber(this.pageForRow(this.count - 1)).hasNode();
		}
		else {
			node = this.$.generator.fetchRowNode(index);
			nodeParent = node.parentNode;
		}
		// figure next page for placeholder
		var nextPageNumber = this.pageForRow(index);

		// don't add pages beyond the original page count
		if (nextPageNumber >= this.pageCount) {
			nextPageNumber = this.currentPageNumber;
		}

		// move the placeholder to just after our "index" node
		nodeParent.insertBefore(
			this.placeholderNode,
			node);

		if (this.currentPageNumber !== nextPageNumber) {
			// if moving to different page, recalculate page sizes and reposition pages
			this.updatePageSize(this.currentPageNumber);
			this.updatePageSize(nextPageNumber);
			this.updatePagePositions(nextPageNumber);
		}

		// save updated state
		this.placeholderRowIndex = index;
		this.currentPageNumber = nextPageNumber;

		// remember that we moved an item (to prevent pinning at the wrong time)
		this.itemMoved = true;
	},
	/**
		Turns off reordering. If the user didn't drag the item being reordered
		outside of its original position, goes into pinned reorder mode.
	*/
	finishReordering: function(inSender, inEvent) {
		if (!this.isReordering() || this.pinnedReorderMode || this.completeReorderTimeout) {
			return;
		}
		this.stopAutoScrolling();
		// enable drag-scrolling on strategy
		this.$.strategy.listReordering = false;
		// animate reorder container to proper position and then complete
		// reordering actions
		this.moveReorderedContainerToDroppedPosition(inEvent);
		this.completeReorderTimeout = setTimeout(
			this.bindSafely(this.completeFinishReordering, inEvent), 100);

		inEvent.preventDefault();
		return true;
	},
	//*
	moveReorderedContainerToDroppedPosition: function() {
		var offset = this.getRelativeOffset(this.placeholderNode, this.hasNode());
		var top = (this.getStrategyKind() == "ScrollStrategy") ? offset.top : offset.top - this.getScrollTop();
		var left = offset.left - this.getScrollLeft();
		this.positionReorderContainer(left,top);
	},
	/**
		After the reordered item has been animated to its position, completes
		the reordering logic.
	*/
	completeFinishReordering: function(inEvent) {
		this.completeReorderTimeout = null;
		// adjust placeholderRowIndex to now be the final resting place
		if (this.placeholderRowIndex > this.draggingRowIndex) {
			this.placeholderRowIndex = Math.max(0, this.placeholderRowIndex - 1);
		}
		// if the user dropped the item in the same location where it was picked up, and they
		// didn't move any other items in the process, pin the item and go into pinned reorder mode
		if (this.draggingRowIndex == this.placeholderRowIndex &&
			this.pinnedReorderComponents.length && !this.pinnedReorderMode && !this.itemMoved) {
			this.beginPinnedReorder(inEvent);
			return;
		}
		this.removeDraggingRowNode();
		this.removePlaceholderNode();
		this.emptyAndHideReorderContainer();
		// clear this early to prevent scroller code from using disappeared placeholder
		this.pinnedReorderMode = false;
		this.reorderRows(inEvent);
		this.draggingRowIndex = this.placeholderRowIndex = -1;
		this.refresh();
	},
	//* Go into pinned reorder mode
	beginPinnedReorder: function(e) {
		this.buildPinnedReorderContainer();
		this.doSetupPinnedReorderComponents(enyo.mixin(e, {index: this.draggingRowIndex}));
		this.pinnedReorderMode = true;
		this.initialPinPosition = e.pageY;
	},
	//* Clears contents of reorder container, then hides.
	emptyAndHideReorderContainer: function() {
		this.$.reorderContainer.destroyComponents();
		this.$.reorderContainer.setShowing(false);
	},
	//* Fills reorder container with pinned controls.
	buildPinnedReorderContainer: function() {
		this.$.reorderContainer.destroyClientControls();
		for (var i=0;i<this.pinnedReorderComponents.length;i++) {
			this.$.reorderContainer.createComponent(this.pinnedReorderComponents[i], {owner:this.owner});
		}
		this.$.reorderContainer.render();
	},
	//* Swaps the rows that were reordered, and sends up reorder event.
	reorderRows: function(inEvent) {
		// send reorder event
		this.doReorder(this.makeReorderEvent(inEvent));
		// update display
		this.positionReorderedNode();
		// fix indices for reordered rows
		this.updateListIndices();
	},
	//* Adds _reorderTo_ and _reorderFrom_ properties to the reorder event.
	makeReorderEvent: function(e) {
		e.reorderFrom = this.draggingRowIndex;
		e.reorderTo = this.placeholderRowIndex;
		return e;
	},
	//* Moves the node being reordered to its new position and shows it.
	positionReorderedNode: function() {
		// only do this if the page with the initial item is still rendered
		if (!this.removedInitialPage) {
			var insertNode = this.$.generator.fetchRowNode(this.placeholderRowIndex);
			if (insertNode) {
				insertNode.parentNode.insertBefore(this.hiddenNode, insertNode);
				this.showNode(this.hiddenNode);
			}
			this.hiddenNode = null;
			if (this.currentPageNumber != this.initialPageNumber) {
				var mover, movee;
				var currentPage = this.pageForPageNumber(this.currentPageNumber);
				var otherPage = this.pageForPageNumber(this.currentPageNumber + 1);
				// if moved down, move current page's firstChild to the end of previous page
				if (this.initialPageNumber < this.currentPageNumber) {
					mover = currentPage.hasNode().firstChild;
					otherPage.hasNode().appendChild(mover);
				// if moved up, move current page's lastChild before previous page's firstChild
				} else {
					mover = currentPage.hasNode().lastChild;
					movee = otherPage.hasNode().firstChild;
					otherPage.hasNode().insertBefore(mover, movee);
				}
				this.correctPageSizes();
				this.updatePagePositions(this.initialPageNumber);
			}
		}
	},
	//* Updates indices of list items as needed to preserve reordering.
	updateListIndices: function() {
		// don't do update if we've moved further than one page, refresh instead
		if (this.shouldDoRefresh()) {
			this.refresh();
			this.correctPageSizes();
			return;
		}

		var from = Math.min(this.draggingRowIndex, this.placeholderRowIndex);
		var to = Math.max(this.draggingRowIndex, this.placeholderRowIndex);
		var direction = (this.draggingRowIndex - this.placeholderRowIndex > 0) ? 1 : -1;
		var node, i, newIndex, currentIndex;

		if (direction === 1) {
			node = this.$.generator.fetchRowNode(this.draggingRowIndex);
			if (node) {
				node.setAttribute("data-enyo-index", "reordered");
			}
			for (i=(to-1),newIndex=to;i>=from;i--) {
				node = this.$.generator.fetchRowNode(i);
				if (!node) {
					continue;
				}
				currentIndex = parseInt(node.getAttribute("data-enyo-index"), 10);
				newIndex = currentIndex + 1;
				node.setAttribute("data-enyo-index", newIndex);
			}
			node = this.hasNode().querySelector('[data-enyo-index="reordered"]');
			node.setAttribute("data-enyo-index", this.placeholderRowIndex);

		} else {
			node = this.$.generator.fetchRowNode(this.draggingRowIndex);
			if (node) {
				node.setAttribute("data-enyo-index", this.placeholderRowIndex);
			}
			for (i=(from+1), newIndex=from;i<=to;i++) {
				node = this.$.generator.fetchRowNode(i);
				if (!node) {
					continue;
				}
				currentIndex = parseInt(node.getAttribute("data-enyo-index"), 10);
				newIndex = currentIndex - 1;
				node.setAttribute("data-enyo-index", newIndex);
			}
		}
	},
	//* Determines if an item was reordered far enough that it warrants a refresh.
	shouldDoRefresh: function() {
		return (Math.abs(this.initialPageNumber - this.currentPageNumber) > 1);
	},
	//* Gets node height, width, top, and left values.
	getNodeStyle: function(index) {
		var node = this.$.generator.fetchRowNode(index);
		if (!node) {
			return;
		}
		var offset = this.getRelativeOffset(node, this.hasNode());
		var dimensions = enyo.dom.getBounds(node);
		return {h: dimensions.height, w: dimensions.width, left: offset.left, top: offset.top};
	},
	//* Gets offset relative to a positioned ancestor node.
	getRelativeOffset: function (n, p) {
		var ro = {top: 0, left: 0};
		if (n !== p && n.parentNode) {
			do {
				ro.top += n.offsetTop || 0;
				ro.left += n.offsetLeft || 0;
				n = n.offsetParent;
			} while (n && n !== p);
		}
		return ro;
	},
	replaceNodeWithPlaceholder: function(index) {
		var node = this.$.generator.fetchRowNode(index);
		if (!node) {
			enyo.log("No node - "+index);
			return;
		}
		// create and style placeholder node
		this.placeholderNode = this.createPlaceholderNode(node);
		// hide existing node
		this.hiddenNode = this.hideNode(node);
		// insert placeholder node where original node was
		var currentPage = this.pageForPageNumber(this.currentPageNumber);
		currentPage.hasNode().insertBefore(this.placeholderNode,this.hiddenNode);
	},
	/**
		Creates and returns a placeholder node with dimensions matching those of
		the passed-in node.
	*/
	createPlaceholderNode: function(node) {
		var placeholderNode = this.$.placeholder.hasNode().cloneNode(true);
		var nodeDimensions = enyo.dom.getBounds(node);
		placeholderNode.style.height = nodeDimensions.height + "px";
		placeholderNode.style.width = nodeDimensions.width + "px";
		return placeholderNode;
	},
	//* Removes the placeholder node from the DOM.
	removePlaceholderNode: function() {
		this.removeNode(this.placeholderNode);
		this.placeholderNode = null;
	},
	removeDraggingRowNode: function() {
		this.draggingRowNode = null;
		var holdingArea = this.$.holdingarea.hasNode();
		holdingArea.innerHTML = "";
	},
	//* Removes the passed-in node from the DOM.
	removeNode: function(node) {
		if (!node || !node.parentNode) {
			return;
		}
		node.parentNode.removeChild(node);
	},
	/**
		Updates _this.pageSizes_ to support the placeholder node's jumping
		from one page to the next.
	*/
	updatePageSize: function(pageNumber) {
		if (pageNumber < 0) {
			return;
		}
		var pageControl = this.pageForPageNumber(pageNumber, true);
		if (pageControl) {
			var s0 = this.pageSizes[pageNumber];
			// FIXME: use height/width depending on orientation
			var pageSize = Math.max(1, pageControl.getBounds().height);
			this.pageSizes[pageNumber] = pageSize;
			this.portSize += pageSize - s0;
		}
	},
	/**
		Repositions the two passed-in pages to support the placeholder node's
		jumping from one page to the next.
	*/
	updatePagePositions: function(nextPageNumber) {
		this.positionPage(this.currentPageNumber, this.pageForPageNumber(this.currentPageNumber));
		this.positionPage(nextPageNumber, this.pageForPageNumber(nextPageNumber));
	},
	//* Corrects page sizes array after reorder is complete.
	correctPageSizes: function() {
		var initPageNumber = this.initialPageNumber%2;
		this.updatePageSize(this.currentPageNumber, this.$["page"+this.currentPage]);
		if (initPageNumber != this.currentPageNumber) {
			this.updatePageSize(this.initialPageNumber, this.$["page"+initPageNumber]);
		}
	},
	hideNode: function(node) {
		node.style.display = "none";
		return node;
	},
	showNode: function(node) {
		node.style.display = "block";
		return node;
	},
	//* @public
	//* Called by client code to finalize a pinned mode reordering, such as when the "Drop" button is pressed
	//* on the pinned placeholder row.
	dropPinnedRow: function(inEvent) {
		// animate reorder container to proper position and then complete reording actions
		this.moveReorderedContainerToDroppedPosition(inEvent);
		this.completeReorderTimeout = setTimeout(
			this.bindSafely(this.completeFinishReordering, inEvent), 100);
		return;
	},
	cancelPinnedMode: function(inEvent) {
		// make it look like we're dropping in original location
		this.placeholderRowIndex = this.draggingRowIndex;
		this.dropPinnedRow(inEvent);
	},
	//* @protected
	//* Returns the row index that is under the given position on the page.  If the
	//* position is off the end of the list, this will return this.count.  If the position
	//* is before the start of the list, you'll get -1.
	getRowIndexFromCoordinate: function(y) {
		// FIXME: this code only works with vertical lists
		var cursorPosition = this.getScrollTop() + y - enyo.dom.calcNodePosition(this.hasNode()).top;
		// happens if we try to drag past top of list
		if (cursorPosition < 0) {
			return -1;
		}
		var pageInfo = this.positionToPageInfo(cursorPosition);
		var rows = (pageInfo.no == this.p0) ? this.p0RowBounds : this.p1RowBounds;
		// might have only rendered one page, so catch that here
		if (!rows) {
			return this.count;
		}
		var posOnPage = pageInfo.pos;
		var placeholderHeight = this.placeholderNode ? enyo.dom.getBounds(this.placeholderNode).height : 0;
		var totalHeight = 0;
		for (var i=pageInfo.startRow; i <= pageInfo.endRow; ++i) {
			// do extra check for row that has placeholder as we'll return -1 here for no match
			if (i === this.placeholderRowIndex) {
				// for placeholder
				totalHeight += placeholderHeight;
				if (totalHeight >= posOnPage) {
					return -1;
				}
			}
			// originally dragged row is hidden, so don't count it
			if (i !== this.draggingRowIndex) {
				totalHeight += rows[i].height;
				if (totalHeight >= posOnPage) {
					return i;
				}
			}
		}
		return i;
	},
	//* Gets the position of a node (identified via index) on the page.
	getIndexPosition: function(index) {
		return enyo.dom.calcNodePosition(this.$.generator.fetchRowNode(index));
	},
	//* Sets _$item_'s position to match that of the list row at _index_.
	setItemPosition: function($item,index) {
		var clonedNodeStyle = this.getNodeStyle(index);
		var top = (this.getStrategyKind() == "ScrollStrategy") ? clonedNodeStyle.top : clonedNodeStyle.top - this.getScrollTop();
		var styleStr = "top:"+top+"px; left:"+clonedNodeStyle.left+"px;";
		$item.addStyles(styleStr);
	},
	//* Sets _$item_'s width and height to match those of the list row at _index_.
	setItemBounds: function($item,index) {
		var clonedNodeStyle = this.getNodeStyle(index);
		var styleStr = "width:"+clonedNodeStyle.w+"px; height:"+clonedNodeStyle.h+"px;";
		$item.addStyles(styleStr);
	},
	/**
		When in pinned reorder mode, repositions the pinned placeholder when the
		user has scrolled far enough.
	*/
	reorderScroll: function(inSender, e) {
		// if we are using the standard scroll strategy, we have to move the pinned row with the scrolling
		if (this.getStrategyKind() == "ScrollStrategy") {
			this.$.reorderContainer.addStyles("top:"+(this.initialPinPosition+this.getScrollTop()-this.rowSize)+"px;");
		}
		// y coordinate on screen of the pinned item doesn't change as we scroll things
		this.updatePlaceholderPosition(this.initialPinPosition);
	},
	hideReorderingRow: function() {
		var hiddenNode = this.hasNode().querySelector('[data-enyo-index="'+this.draggingRowIndex+'"]');
		// hide existing node
		if (hiddenNode) {
			this.hiddenNode = this.hideNode(hiddenNode);
		}
	},
	isReordering: function() {
		return (this.draggingRowIndex > -1);
	},

	/**
		---- Swipeable functionality ------------
	*/

	isSwiping: function() {
		// we're swiping when the index is set and we're not in the middle of completing or backing out a swipe
		return (this.swipeIndex != null && !this.swipeComplete && this.swipeDirection != null);
	},
	/**
		When a drag starts, gets the direction of the drag as well as the index
		of the item being dragged, and resets any pertinent values. Then kicks
		off the swipe sequence.
	*/
	swipeDragStart: function(inSender, inEvent) {
		// if we're not on a row or the swipe is vertical or if we're in the middle of reordering, just say no
		if (inEvent.index == null || inEvent.vertical) {
			return true;
		}

		// if we are waiting to complete a swipe, complete it
		if (this.completeSwipeTimeout) {
			this.completeSwipe(inEvent);
		}

		// reset swipe complete flag
		this.swipeComplete = false;

		if (this.swipeIndex != inEvent.index) {
			this.clearSwipeables();
			this.swipeIndex = inEvent.index;
		}
		this.swipeDirection = inEvent.xDirection;

		// start swipe sequence only if we are not currently showing a persistent item
		if (!this.persistentItemVisible) {
			this.startSwipe(inEvent);
		}

		// reset dragged distance (for dragfinish)
		this.draggedXDistance = 0;
		this.draggedYDistance = 0;

		return true;
	},
	/**
		When a drag is in progress, updates the position of the swipeable
		container based on the ddx of the event.
	*/
	swipeDrag: function(inSender, inEvent) {
		// if a persistent swipeableItem is still showing, handle it separately
		if (this.persistentItemVisible) {
			this.dragPersistentItem(inEvent);
			return this.preventDragPropagation;
		}
		// early exit if there's no matching dragStart to set item
		if (!this.isSwiping()) {
			return false;
		}
		// apply new position
		this.dragSwipeableComponents(this.calcNewDragPosition(inEvent.ddx));
		// save dragged distance (for dragfinish)
		this.draggedXDistance = inEvent.dx;
		this.draggedYDistance = inEvent.dy;
		return true;
	},
	/*
		When the current drag completes, decides whether to complete the swipe
		based on how far the user pulled the swipeable container.
	*/
	swipeDragFinish: function(inSender, inEvent) {
		// if a persistent swipeableItem is still showing, complete drag away or bounce
		if (this.persistentItemVisible) {
			this.dragFinishPersistentItem(inEvent);
		// early exit if there's no matching dragStart to set item
		} else if (!this.isSwiping()) {
			return false;
		// otherwise if user dragged more than 20% of the width, complete the swipe. if not, back out.
		} else {
			var percentageDragged = this.calcPercentageDragged(this.draggedXDistance);
			if ((percentageDragged > this.percentageDraggedThreshold) && (inEvent.xDirection === this.swipeDirection)) {
				this.swipe(this.fastSwipeSpeedMS);
			} else {
				this.backOutSwipe(inEvent);
			}
		}

		return this.preventDragPropagation;
	},
	// reorder takes precedence over swipes, and not having it turned on or swipeable controls defined also disables this
	isSwipeable: function() {
		return this.enableSwipe && this.$.swipeableComponents.controls.length !== 0 &&
			!this.isReordering() && !this.pinnedReorderMode;
	},
	// Positions the swipeable components block at the current row.
	positionSwipeableContainer: function(index,xDirection) {
		var node = this.$.generator.fetchRowNode(index);
		if (!node) {
			return;
		}
		var offset = this.getRelativeOffset(node, this.hasNode());
		var dimensions = enyo.dom.getBounds(node);
		var x = (xDirection == 1) ? -1*dimensions.width : dimensions.width;
		this.$.swipeableComponents.addStyles("top: "+offset.top+"px; left: "+x+"px; height: "+dimensions.height+"px; width: "+dimensions.width+"px;");
	},
	/**
		Calculates new position for the swipeable container based on the user's
		drag action. Don't allow the container to drag beyond either edge.
	*/
	calcNewDragPosition: function(dx) {
		var parentBounds = this.$.swipeableComponents.getBounds();
		var xPos = parentBounds.left;
		var dimensions = this.$.swipeableComponents.getBounds();
		var xlimit = (this.swipeDirection == 1) ? 0 : -1*dimensions.width;
		var x = (this.swipeDirection == 1)
			? (xPos + dx > xlimit)
				? xlimit
				: xPos + dx
			: (xPos + dx < xlimit)
				? xlimit
				: xPos + dx;
		return x;
	},
	dragSwipeableComponents: function(x) {
		this.$.swipeableComponents.applyStyle("left",x+"px");
	},
	/**
		Begins swiping sequence by positioning the swipeable container and
		bubbling the setupSwipeItem event.
	*/
	startSwipe: function(e) {
		// modify event index to always have this swipeItem value
		e.index = this.swipeIndex;
		this.positionSwipeableContainer(this.swipeIndex,e.xDirection);
		this.$.swipeableComponents.setShowing(true);
		this.setPersistentItemOrigin(e.xDirection);
		this.doSetupSwipeItem(e);
	},
	// If a persistent swipeableItem is still showing, drags it away or bounces it.
	dragPersistentItem: function(e) {
		var xPos = 0;
		var x = (this.persistentItemOrigin == "right")
			? Math.max(xPos, (xPos + e.dx))
			: Math.min(xPos, (xPos + e.dx));
		this.$.swipeableComponents.applyStyle("left",x+"px");
	},
	// If a persistent swipeableItem is still showing, completes drag away or bounce.
	dragFinishPersistentItem: function(e) {
		var completeSwipe = (this.calcPercentageDragged(e.dx) > 0.2);
		var dir = (e.dx > 0) ? "right" : (e.dx < 0) ? "left" : null;
		if (this.persistentItemOrigin == dir) {
			if (completeSwipe) {
				this.slideAwayItem();
			} else {
				this.bounceItem(e);
			}
		} else {
			this.bounceItem(e);
		}
	},
	setPersistentItemOrigin: function(xDirection) {
		this.persistentItemOrigin = xDirection == 1 ? "left" : "right";
	},
	calcPercentageDragged: function(dx) {
		return Math.abs(dx/this.$.swipeableComponents.getBounds().width);
	},
	swipe: function(speed) {
		this.swipeComplete = true;
		this.animateSwipe(0,speed);
	},
	backOutSwipe: function(e) {
		var dimensions = this.$.swipeableComponents.getBounds();
		var x = (this.swipeDirection == 1) ? -1*dimensions.width : dimensions.width;
		this.animateSwipe(x,this.fastSwipeSpeedMS);
		this.swipeDirection = null;
	},
	bounceItem: function(e) {
		var bounds = this.$.swipeableComponents.getBounds();
		if (bounds.left != bounds.width) {
			this.animateSwipe(0,this.normalSwipeSpeedMS);
		}
	},
	slideAwayItem: function() {
		var $item = this.$.swipeableComponents;
		var parentWidth = $item.getBounds().width;
		var xPos = (this.persistentItemOrigin == "left") ? -1*parentWidth : parentWidth;
		this.animateSwipe(xPos,this.normalSwipeSpeedMS);
		this.persistentItemVisible = false;
		this.setPersistSwipeableItem(false);
	},
	clearSwipeables: function() {
		this.$.swipeableComponents.setShowing(false);
		this.persistentItemVisible = false;
		this.setPersistSwipeableItem(false);
	},
	// Completes swipe and hides active swipeable item.
	completeSwipe: function(e) {
		if (this.completeSwipeTimeout) {
			clearTimeout(this.completeSwipeTimeout);
			this.completeSwipeTimeout = null;
		}
		// if this wasn't a persistent item, hide it upon completion and send swipe complete event
		if (!this.getPersistSwipeableItem()) {
			this.$.swipeableComponents.setShowing(false);
			// if the swipe was completed, update the current row and bubble swipeComplete event
			if (this.swipeComplete) {
				this.doSwipeComplete({index: this.swipeIndex, xDirection: this.swipeDirection});
			}
		} else {
			// persistent item will only be visible if the swipe was completed
			if (this.swipeComplete) {
				this.persistentItemVisible = true;
			}
		}
		this.swipeIndex = null;
		this.swipeDirection = null;
	},
	animateSwipe: function(targetX,totalTimeMS) {
		var t0 = enyo.now();
		var $item = this.$.swipeableComponents;
		var origX = parseInt($item.domStyles.left,10);
		var xDelta = targetX - origX;

		this.stopAnimateSwipe();

		var fn = this.bindSafely(function() {
			var t = enyo.now() - t0;
			var percTimeElapsed = t/totalTimeMS;
			var currentX = origX + (xDelta)*Math.min(percTimeElapsed,1);

			// set new left
			$item.applyStyle("left",currentX+"px");

			// schedule next frame
			this.job = enyo.requestAnimationFrame(fn);

			// potentially override animation TODO

			// go until we've hit our total time
			if (t/totalTimeMS >= 1) {
				this.stopAnimateSwipe();
				this.completeSwipeTimeout = setTimeout(this.bindSafely(function() {
					this.completeSwipe();
				}), this.completeSwipeDelayMS);
			}
		});

		this.job = enyo.requestAnimationFrame(fn);
	},
	stopAnimateSwipe: function() {
		if (this.job) {
			this.job = enyo.cancelRequestAnimationFrame(this.job);
		}
	}
});

/**
_enyo.PulldownList_ is a list that provides a pull-to-refresh feature, which
allows new data to be retrieved and updated in the list.

PulldownList provides the _onPullRelease_ event to allow an application to start
retrieving new data.  The _onPullComplete_ event indicates that the pull is
complete and it's time to update the list with the new data.

	{name: "list", kind: "PulldownList", onSetupItem: "setupItem",
		onPullRelease: "pullRelease", onPullComplete: "pullComplete",
		components: [
			{name: "item"}
		]}

	pullRelease: function() {
		this.search();
	},
	processSearchResults: function(inRequest, inResponse) {
		this.results = inResponse.results;
		this.$.list.setCount(this.results.length);
		this.$.list.completePull();
	},
	pullComplete: function() {
		this.$.list.reset();
	}
*/
enyo.kind({
	name: "enyo.PulldownList",
	kind: "List",
	//* @protected
	// Sets touch to true in inherited Scroller kind for touch-based scrolling strategy
	touch: true,
	// The pull notification area at the top of the list
	pully: null,
	pulldownTools: [
		{name: "pulldown", classes: "enyo-list-pulldown", components: [
			{name: "puller", kind: "Puller"}
		]}
	],
	events: {
		//* Fires when user initiates a pull action.
		onPullStart: "",
		//* Fires when user cancels a pull action.
		onPullCancel: "",
		//* Fires while a pull action is in progress.
		onPull: "",
		//* Fires when the list is released following a pull action, indicating
		//* that we are ready to retrieve data.
		onPullRelease: "",
		//* Fires when data retrieval is complete, indicating that the data is
		//* is ready to be displayed.
		onPullComplete: ""
	},
	handlers: {
		onScrollStart: "scrollStartHandler",
		onScrollStop: "scrollStopHandler",
		ondragfinish: "dragfinish"
	},
	//* Message displayed when list is not being pulled
	pullingMessage: "Pull down to refresh...",
	//* Message displayed while a pull action is in progress
	pulledMessage: "Release to refresh...",
	//* Message displayed while data is being retrieved
	loadingMessage: "Loading...",
	//
	pullingIconClass: "enyo-puller-arrow enyo-puller-arrow-down",
	pulledIconClass: "enyo-puller-arrow enyo-puller-arrow-up",
	loadingIconClass: "",
	//* @protected
	create: enyo.inherit(function(sup) {
		return function() {
			var p = {kind: "Puller", showing: false, text: this.loadingMessage, iconClass: this.loadingIconClass, onCreate: "setPully"};
			this.listTools.splice(0, 0, p);
			sup.apply(this, arguments);
			this.setPulling();
		};
	}),
	initComponents: enyo.inherit(function(sup) {
		return function() {
			this.createChrome(this.pulldownTools);
			this.accel = enyo.dom.canAccelerate();
			this.translation = this.accel ? "translate3d" : "translate";
			this.strategyKind = this.resetStrategyKind();
			sup.apply(this, arguments);
		};
	}),
	// Temporarily use TouchScrollStrategy on iOS devices (see ENYO-1714)
	resetStrategyKind: function() {
		return (enyo.platform.android >= 3)
			? "TranslateScrollStrategy"
			: "TouchScrollStrategy";
	},
	setPully: function(inSender, inEvent) {
		this.pully = inEvent.originator;
	},
	scrollStartHandler: function() {
		this.firedPullStart = false;
		this.firedPull = false;
		this.firedPullCancel = false;
	},
	scroll: enyo.inherit(function(sup) {
		return function(inSender, inEvent) {
			var r = sup.apply(this, arguments);
			if (this.completingPull) {
				this.pully.setShowing(false);
			}
			var s = this.getStrategy().$.scrollMath || this.getStrategy();
			var over = -1*this.getScrollTop();
			if (s.isInOverScroll() && over > 0) {
				enyo.dom.transformValue(this.$.pulldown, this.translation, "0," + over + "px" + (this.accel ? ",0" : ""));
				if (!this.firedPullStart) {
					this.firedPullStart = true;
					this.pullStart();
					this.pullHeight = this.$.pulldown.getBounds().height;
				}
				if (over > this.pullHeight && !this.firedPull) {
					this.firedPull = true;
					this.firedPullCancel = false;
					this.pull();
				}
				if (this.firedPull && !this.firedPullCancel && over < this.pullHeight) {
					this.firedPullCancel = true;
					this.firedPull = false;
					this.pullCancel();
				}
			}
			return r;
		};
	}),
	scrollStopHandler: function() {
		if (this.completingPull) {
			this.completingPull = false;
			this.doPullComplete();
		}
	},
	dragfinish: function() {
		if (this.firedPull) {
			var s = this.getStrategy().$.scrollMath || this.getStrategy();
			s.setScrollY(-1*this.getScrollTop() - this.pullHeight);
			this.pullRelease();
		}
	},
	//* @public
	//* Signals that the list should execute pull completion. This is usually
	//* called after the application has received the new data.
	completePull: function() {
		this.completingPull = true;
		var s = this.getStrategy().$.scrollMath || this.getStrategy();
		s.setScrollY(this.pullHeight);
		s.start();
	},
	//* @protected
	pullStart: function() {
		this.setPulling();
		this.pully.setShowing(false);
		this.$.puller.setShowing(true);
		this.doPullStart();
	},
	pull: function() {
		this.setPulled();
		this.doPull();
	},
	pullCancel: function() {
		this.setPulling();
		this.doPullCancel();
	},
	pullRelease: function() {
		this.$.puller.setShowing(false);
		this.pully.setShowing(true);
		this.doPullRelease();
	},
	setPulling: function() {
		this.$.puller.setText(this.pullingMessage);
		this.$.puller.setIconClass(this.pullingIconClass);
	},
	setPulled: function() {
		this.$.puller.setText(this.pulledMessage);
		this.$.puller.setIconClass(this.pulledIconClass);
	}
});

enyo.kind({
	name: "enyo.Puller",
	classes: "enyo-puller",
	published: {
		text: "",
		iconClass: ""
	},
	events: {
		onCreate: ""
	},
	components: [
		{name: "icon"},
		{name: "text", tag: "span", classes: "enyo-puller-text"}
	],
	create: enyo.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);
			this.doCreate();
			this.textChanged();
			this.iconClassChanged();
		};
	}),
	textChanged: function() {
		this.$.text.setContent(this.text);
	},
	iconClassChanged: function() {
		this.$.icon.setClasses(this.iconClass);
	}
});

/**
    _enyo.AroundList_ is an <a href="#enyo.List">enyo.List</a> that allows
    content to be displayed around its rows.

        {kind: "enyo.AroundList", onSetupItem: "setupItem",
            aboveComponents: [
                {content: "Content above the list"}
            ],
            components: [
                {content: "List item"}
            ]
        }
*/
enyo.kind({
	name: "enyo.AroundList",
	kind: "enyo.List",
	//* @protected
	listTools: [
		{name: "port", classes: "enyo-list-port enyo-border-box", components: [
			{name: "aboveClient"},
			{name: "generator", kind: "FlyweightRepeater", canGenerate: false, components: [
				{tag: null, name: "client"}
			]},
			{name: "holdingarea", allowHtml: true, classes: "enyo-list-holdingarea"},
			{name: "page0", allowHtml: true, classes: "enyo-list-page"},
			{name: "page1", allowHtml: true, classes: "enyo-list-page"},
			{name: "belowClient"},
			{name: "placeholder"},
			{name: "swipeableComponents", style: "position:absolute; display:block; top:-1000px; left:0px;"}
		]}
	],
	//* @public
	//* Block of components to be rendered above the list
	aboveComponents: null,
	//* @protected
	initComponents: enyo.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);
			if (this.aboveComponents) {
				this.$.aboveClient.createComponents(this.aboveComponents, {owner: this.owner});
			}
			if (this.belowComponents) {
				this.$.belowClient.createComponents(this.belowComponents, {owner: this.owner});
			}
		};
	}),
	updateMetrics: function() {
		this.defaultPageSize = this.rowsPerPage * (this.rowSize || 100);
		this.pageCount = Math.ceil(this.count / this.rowsPerPage);
		this.aboveHeight = this.$.aboveClient.getBounds().height;
		this.belowHeight = this.$.belowClient.getBounds().height;
		this.portSize = this.aboveHeight + this.belowHeight;
		for (var i=0; i < this.pageCount; i++) {
			this.portSize += this.getPageSize(i);
		}
		this.adjustPortSize();
	},
	positionPage: function(inPage, inTarget) {
		inTarget.pageNo = inPage;
		var y = this.pageToPosition(inPage);
		var o = this.bottomUp ? this.belowHeight : this.aboveHeight;
		y += o;
		inTarget.applyStyle(this.pageBound, y + "px");
	},
	scrollToContentStart: function() {
		var y = this.bottomUp ? this.belowHeight : this.aboveHeight;
		this.setScrollPosition(y);
	}
});

/**
	_enyo.GridList.ImageItem_ is a convenience component that may be used
	inside an <a href="#enyo.DataGridList">enyo.DataGridList</a> to display an
	image grid with an optional caption and sub-caption.
*/

enyo.kind({
	name: "enyo.GridListImageItem",
	classes: "enyo-gridlist-imageitem",
	components: [
		{name: "image", kind: "enyo.Image", classes:"image"},
		{name: "caption", classes: "caption"},
		{name: "subCaption", classes: "sub-caption"}
	],
	published: {
		//* The absolute URL path to the image
		source: "",
		//* The primary caption to be displayed with the image
		caption: "",
		//* The second caption line to be displayed with the image
		subCaption: "",
		/**
            Set to true to add the _selected_ class to the image tile; set to
            false to remove the _selected_ class
        */
		selected: false,
		//* When true, caption & subCaption are centered; otherwise left-aligned
		centered: true,
		/** 
			By default, the image width fits the width of the item, and the height
			is sized naturally, based on the aspect ratio of the image.  Set this 
			property to _constrain_ to letterbox the image in the available space,
			or _cover_ to cover the available space with the image (cropping the
			larger dimension).  Note, when _imageSizing_ is set, you must indicate
			whether the caption and subCaption are used, based on the _useCaption_
			and _useSubCaption_ flags, for proper sizing.
		*/
		imageSizing: "",
		/**
			When using an _imageSizing_ option, set to false if the caption space
			should not be reserved.  Has no effect when imageSizing is default.
		*/
		useCaption: true,
		/**
			When using an _imageSizing_ option, set to false if the subcaption space
			should not be reserved.  Has no effect when imageSizing is default.
		*/
		useSubCaption: true
	},
	bindings: [
		{from: ".source", to: ".$.image.src"},
		{from: ".caption", to: ".$.caption.content"},
		{from: ".caption", to: ".$.caption.showing", kind: "enyo.EmptyBinding"},
		{from: ".subCaption", to: ".$.subCaption.content"},
		{from: ".subCaption", to: ".$.subCaption.showing", kind: "enyo.EmptyBinding"}
	],
	create: enyo.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);
			this.selectedChanged();
			this.imageSizingChanged();
			this.centeredChanged();
		};
	}),
	selectedChanged: function() {
		this.addRemoveClass("selected", this.selected);
	},
	disabledChanged: function() {
		this.addRemoveClass("disabled", this.disabled);
	},
	imageSizingChanged: function() {
		this.$.image.setSizing(this.imageSizing);
		this.addRemoveClass("sized-image", !!this.imageSizing);
		if (this.imageSizing) {
			this.useCaptionChanged();
			this.useSubCaptionChanged();
		}
	},
	useCaptionChanged: function() {
		this.addRemoveClass("use-caption", this.useCaption);
	},
	useSubCaptionChanged: function() {
		this.addRemoveClass("use-subcaption", this.useSubCaption);
	},
	centeredChanged: function() {
		this.addRemoveClass("centered", this.centered);
	}
});

/**
	_enyo.GridFlyweightRepeater_ extends
	<a href="#enyo.FlyweightRepeater">enyo.FlyweightRepeater</a>
	to lay out items in a grid pattern.
*/
enyo.kind({
	name: "enyo.GridFlyWeightRepeater",
	kind: "enyo.FlyweightRepeater",
	events: {
		/**
			Fires once per item at pre-render time, to determine the item's dimensions.

			_inEvent.index_ contains the current item index.

			_inEvent.selected_ is a boolean indicating whether the current item is selected.
		*/
		onSizeupItem: ""
	},
	itemsPerRow: 0,
	//* @protected
	_itemsFromPreviousPage: 0,
	generateChildHtml: function() {
		if (this.itemFluidWidth || this.itemFixedSize) {
			return this._generateChildHtmlEqualSizedItems();
		}
		return this._generateChildHtmlVariableSizedItems();
	},
	//* @protected
	_generateChildHtmlEqualSizedItems: function() {
		var cw = this.owner.hasNode().clientWidth;
		var cl = this.$.client, ht = "";
		var itemWidthPercent = 0, itemScaledWidth = this.itemWidth, itemScaledHeight = this.itemHeight;
		if (this.itemFluidWidth) {
			itemWidthPercent = 100/this.itemsPerRow;
			var totalMargin = 0;
			if (this.itemSpacing >= 0) {
				totalMargin = (this.itemsPerRow + 1) * this.itemSpacing;
				itemWidthPercent = 100/this.itemsPerRow - ((100 * totalMargin)/(this.itemsPerRow * cw));
			}
			itemScaledWidth = (itemWidthPercent/100)*cw;
			itemScaledHeight = itemScaledWidth * (this.itemHeight/this.itemWidth);
		}
		for (var i=this.rowOffset; i < this.rowOffset + this.count; i++) {
			// Setup each item
			cl.setAttribute("data-enyo-index", i);
			this.doSetupItem({index: i, selected: this.isSelected(i)});
			if (this.itemFluidWidth) {
				cl.addStyles("width:" + itemWidthPercent + "%;height:" + itemScaledHeight + "px;");
			} else {
				cl.addStyles("width:" + this.itemWidth + "px;height:" + this.itemHeight + "px;");
			}
			if (this.itemSpacing >= 0) {
				cl.addStyles("margin-top:" + this.itemSpacing + "px; margin-left:" + this.itemSpacing + "px;");
				if (i % this.itemsPerRow == this.itemsPerRow-1) {
					cl.addStyles("margin-right:" + this.itemSpacing + "px;");
				} else {
					cl.addStyles("margin-right: 0px;");
				}
				// Add bottom margin for items in last row
				if (i >= this.count-this.itemsPerRow) {
					cl.addStyles("margin-bottom:" + this.itemSpacing + "px;");
				}
			}
			ht += cl.generateHtml();
			cl.teardownRender();
		}
		return ht;
	},
	//* @protected
	_generateChildHtmlVariableSizedItems: function() {
		this.index = null;
		var item = null;
		var cl = this.$.client;
		var cw = this.owner.hasNode().clientWidth;
		var w = 0, rw = 0, h = 0, rh = 0, raw = 0, rah = 0,  rowIndex = 0, itemW = 0, itemH = 0, w2h = this.itemMinWidth/this.itemMinHeight;
		var rows = [{index: 0, items: []}];
		var dummy = this.owner.$._dummy_.hasNode();
		var i, r;

		if (this.owner.page === 0) {
			this._itemsFromPreviousPage = 0;
		}
		var count = this.count + this._itemsFromPreviousPage;
		for (i=0, r = i + this.rowOffset - this._itemsFromPreviousPage; i < count; i++, r++) {
			itemW = 0;
			itemH = 0;
			this.doSizeupItem({index: r, selected: this.isSelected(r)});
			itemW = this.itemWidth;
			itemH = this.itemHeight;
			if (!itemW || itemW <= 0) {
				//Try setupitem
				this.doSetupItem({index: r, selected: this.isSelected(r)});
				dummy.innerHTML = cl.generateChildHtml();
				itemW = dummy.clientWidth;
				itemH = dummy.clientHeight;
			}
			if (!itemW || itemW <= 0) {
				//Use default values
				itemW = this.itemMinWidth;
				itemH = this.itemMinHeight;
			}
			if (!itemH || itemH <= 0) {
				itemH = this.itemMinHeight;
			}
			w2h = itemW/itemH;
			w = Math.min(itemW, cw);
			if (this.itemMinWidth && this.itemMinWidth > 0) {
				w = Math.max(itemW, this.itemMinWidth);
			}
			var lastRowInPage = (i == count - 1);
			h = w/w2h;

			rw += w;
			rh += h;

			item = {index: r, pageIndex: i, width: w, height: h};
			rows[rowIndex].items.push(item);
			if (!this.normalizeRows) {
				continue;
			}

			raw = rw/(rows[rowIndex].items.length);
			rah = rh/(rows[rowIndex].items.length);

			if (rw >= cw || lastRowInPage) {
				rows[rowIndex].avgHeight = rah;
				rows[rowIndex].index = rowIndex;

				// Spill over items collected so far on this page to next page if they don't scale well to fill up remaining gutter
				var itemsInRow = rows[rowIndex].items.length;
				var gutterPeritem = (cw-rw)/itemsInRow;

				// If remaining items in the row need to be stretched more than 50% of the avg item width in the row, ditch/spill them over into the next page
				this._itemsFromPreviousPage = 0;
				if ((lastRowInPage && gutterPeritem + raw > (1.5 * raw))) {
					// Remove all these items from this row and push them to next page
					this._itemsFromPreviousPage = itemsInRow;
					rows[rowIndex] = {avgHeight: 0, index: rowIndex, items: []};
					break;
				}
				this._normalizeRow(rows[rowIndex]);
				if (!lastRowInPage) {
					rowIndex++;
					rows[rowIndex] = { avgHeight: 0, index: 0, items: [] };
				}
				rw = rh = rah = raw = w = h = itemW = itemH = 0;
			}
		}
		dummy.innerHTML = "";

		// Now that we have completed normalization of items into rows and pages, we have the computed item widths and heights. Render the items now.
		var ht = "", clh = "";
		var row;
		for (i=0; i < rows.length; i++) {
			row = rows[i];
			if (!row.items || row.items.length===0) {
				continue;
			}
			for (var j=0; j < row.items.length; j++) {
				item = row.items[j];
				this.doSetupItem({index: item.index, selected: this.isSelected(item.index)});
				cl.setAttribute("data-enyo-index", item.index);
				cl.addStyles("width:" + item.width + "px;height:" + item.height + "px;");
				if (this.itemSpacing >= 0) {
					cl.addStyles("margin-top:" + this.itemSpacing + "px;margin-left:" + this.itemSpacing + "px;");
				}
				clh = cl.generateHtml();
				cl.teardownRender();
				ht += clh;
			}
		}
		return ht;
	},
	//* @protected
	// Normalizes items in each GridList row so that they maintain the correct (original) aspect ratio while ensuring the height of each item is the same.
	_normalizeRow: function(inRowData) {
		if (!this.normalizeRows) {
			return;
		}
		if (!inRowData.items || inRowData.items.length === 0) {
			return;
		}
		var cw = this.owner.hasNode().clientWidth;
		// Use avg height to scale heights of all items in row to the same height
		var item;
		var runningWidth = 0, nw = 0;
		var newWidths = "";
		var itemW = 0, itemH = 0, scale = 0, gutter = 0;
		var i;

		for (i=0; i < inRowData.items.length; i++) {
			item = inRowData.items[i];
			itemW = item.width;
			itemH = item.height;

			nw = Math.floor((inRowData.avgHeight/itemH) * itemW);
			newWidths += " " + nw;

			item.width = nw;
			item.height = inRowData.avgHeight;
			runningWidth += nw;
			if (this.itemSpacing >= 0) {
				// Spacing can range from 0-10px only - so cap at 10 - otherwise looks ugly
				runningWidth += this.itemSpacing;
				if (i==inRowData.items.length-1) {
					// Accomodate right margin on last item
					runningWidth += this.itemSpacing;
				}
			}
		}
		gutter = cw - runningWidth;

		// Now scale the whole row uniformly up or down depending on positive or negative width gutter
		scale = cw/(cw-gutter);//Math.abs(1 + gutter/clientWidth);
		runningWidth = 0;
		nw = 0;
		newWidths = "";
		for (i=0; i < inRowData.items.length; i++) {
			item = inRowData.items[i];
			itemW = item.width;
			itemH = item.height;

			nw = Math.floor(itemW * scale);
			newWidths += " " + nw;
			var nh = Math.floor(itemH * scale);
			item.width = nw;
			item.height = nh;

			runningWidth += nw;
			if (this.itemSpacing >= 0) {
				// Spacing can range from 0-10px only - so cap at 10 - otherwise looks ugly
				runningWidth += this.itemSpacing;
				if (i==inRowData.items.length-1) {
					// Accomodate right margin on last item
					runningWidth += this.itemSpacing;
				}
			}
		}
		gutter = cw - runningWidth;

		// Adjust the remaining spill over gutter to last item
		item = inRowData.items[inRowData.items.length-1];
		itemW = item.width;
		itemH = item.height;
		item.width = (itemW + gutter);
		item.height = itemH;
	}
});

/**
	_enyo.GridList_ extends <a href="#enyo.List">enyo.List</a>, allowing the
	display of multiple items per row, based on the available container width.
	Three rendering modes are supported: _fixedSize_, _fluidWidth_, and
	_variableSize_ (with or without normalization of rows).

	In _fixedSize_ mode, all items are of the same size, which may be configured
	upfront by setting the _itemWidth_ and _itemHeight_ properties at creation
	time.

	In _fluidWidth_ mode, all items are of the same size, but that size may grow
	or shrink to fit the available container width, while honoring the
	_itemMinWidth_ property.

	When the _itemWidth_ and _itemHeight_ are not known at creation time, you may
	set _normalizeRows_ to true and handle the _sizeupItem_ event to set the
	dimensions of each item at runtime.

		enyo.kind( {
			name: "App",
			components: [
				{
					name: "gridList",
					kind: "enyo.GridList",
					onSizeupItem: "sizeupItem",
					onSetupItem: "setupItem",
					itemMinWidth: 160,
					itemSpacing: 2,
					components: [
						{name: "img", kind: "enyo.Image"}
					]
				},
			],
			...
			//array of all item data
			_data: [],  // example: [{width: 100, height: 100, source: "http://www.flickr.com/myimage.jpg"},....]
			sizeupItem: function(inSender, inEvent) {
				var item = this._data[inEvent.index];
				inSender.setItemWidth(item.width);
				inSender.setItemHeight(item.height);
			},
			setupItem: function(inSender, inEvent) {
				var item = this._data[inEvent.index];
				this.$.img.setSrc(item.source);
				this.$.img.addStyles("width:100%; height: auto;");
				return true;
			}
			...
		});
*/

enyo.kind(
    {
        name: "enyo.GridList",
        kind: "enyo.List",
        classes: "enyo-gridlist",
        published: {
            /**
                Set to true if you want all items to be of same size with fluid
                width (percentage-based width depending on how many items can fit
                in the available container width while honoring _itemMinWidth_).
                The _sizeupItem_ event is not fired in this case.
            */
            itemFluidWidth: false,
            /**
                Set to true if you want all items to be of the same size, with
                fixed dimensions (configured by setting _itemWidth_ and _itemHeight_
                upfront). The _sizeupItem_ event is not fired in this case.
            */
            itemFixedSize: false,
            /**
                Minimum item width (in pixels). This is used to calculate the
                optimal _rowsPerPage_ (items per page) setting based on the
                available width of the container.
            */
            itemMinWidth: 160,
            /**
                Minimum item height (in pixels). This is used to calculate the
                optimal _rowsPerPage_ (items per page) setting based on the
                available width of the container.
            */
            itemMinHeight: 160,
            /**
                Width of each item (in pixels). The _sizeupItem_ event may be
                handled to set the width of each item at runtime. This value may
                be set upfront for all fixed-size items; for variable-sized
                items, any _itemWidth_ values set upfront will be ignored.
            */
            itemWidth: 160,
            /**
                Height of each item (in pixels). The _sizeupItem_ event may be
                handled to set the height of each item at runtime. This value
                may be set upfront for all fixed-size items; for variable-sized
                items, any _itemHeight_ values set upfront will be ignored.
            */
            itemHeight: 160,
            //* Spacing (in pixels) between GridList items.
            itemSpacing: 0,
            /**
                Set to true if you want the items in each GridList row to be
                normalized to the same height. If either _itemFluidWidth_ or
                _itemFixedSize_ is set to true, this setting will be ignored
                (i.e., rows will not be normalized for improved performance),
                since we already know that the items have the same height.
            */
            normalizeRows: false
        },
        horizontal: "hidden",
        events: {
            /**
                Fires once per item only in cases when items are NOT fluid-width
                or fixed-size at pre-render time.  This gives the developer an
                opportunity to set the dimensions of the item.

                _inEvent.index_ contains the current item index.
            */
            onSizeupItem: ""
        },
        /**
            Designed to be called after the GridList data is ready, this method
            sets the _count_ on the list and renders it. This is a convenience
            method that calls _setCount()_ and then _reset()_ on the List, so
            the developer does not have to invoke the two methods separately.
        */
        show: function(count) {
            this._calculateItemsPerRow();
            this.setCount(count);
            this.reset();
        },
        create: enyo.inherit(function(sup) {
            return function() {
                this._setComponents();
                sup.apply(this, arguments);
                this.itemFluidWidthChanged();
                this.itemFixedSizeChanged();
                this.itemMinWidthChanged();
                this.itemMinHeightChanged();
                this.itemWidthChanged();
                this.itemHeightChanged();
                this.itemSpacingChanged();
                this.normalizeRowsChanged();
                this.$.generator.setClientClasses("enyo-gridlist-row");
            };
        }),
        // Relays the published-property changes over to the GridFlyweightRepeater.
        itemFluidWidthChanged: function() {
            this.$.generator.itemFluidWidth = this.itemFluidWidth;
            this.setNormalizeRows(!this.itemFluidWidth && !this.itemFixedSize);
        },
        itemFixedSizeChanged: function() {
            this.$.generator.itemFixedSize = this.itemFixedSize;
            this.setNormalizeRows(!this.itemFluidWidth && !this.itemFixedSize);
        },
        itemWidthChanged: function() {
            this.$.generator.itemWidth = this.itemWidth;
        },
        itemHeightChanged: function() {
            this.$.generator.itemHeight = this.itemHeight;
        },
        itemMinWidthChanged: function() {
            var n = this.hasNode();
            if (n) {
                if (!this.itemMinWidth) {
                    this.itemMinWidth = 160;
                }
                this.itemMinWidth = Math.min(this.itemMinWidth, n.clientWidth);
            }
            this.$.generator.itemMinWidth = this.itemMinWidth;
        },
        itemMinHeightChanged: function() {
            var n = this.hasNode();
            if (n) {
                if (!this.itemMinHeight) {
                    this.itemMinHeight = 160;
                }
                this.itemMinHeight = Math.min(this.itemMinHeight, n.clientHeight);
            }
            this.$.generator.itemMinHeight = this.itemMinHeight;
        },
        itemSpacingChanged: function() {
            if (this.itemSpacing < 0) {
                this.itemSpacing = 0;
            }
            this.itemSpacing = this.itemSpacing;
            this.$.generator.itemSpacing = this.itemSpacing;
        },
        normalizeRowsChanged: function() {
            this.$.generator.normalizeRows = this.normalizeRows;
        },
        //* @protected
        bottomUpChanged: function() {
            //Don't let users change this (bottomUp is a published property of List but is not supported by GridList)
            this.bottomUp = false;
            this.pageBound = 'top';
        },
        //* @protected
        reflow: enyo.inherit(function(sup) {
            return function() {
                this._calculateItemsPerRow();
                sup.apply(this, arguments);
            };
        }),
        //* @protected
        _calculateItemsPerRow: function() {
            var n = this.hasNode();
            if (n) {
                this.itemsPerRow = Math.floor((n.clientWidth - this.itemSpacing)/(this.itemMinWidth + this.itemSpacing));
                var visibleRows = Math.round((n.clientHeight - this.itemSpacing)/(this.itemMinHeight + this.itemSpacing));
                if (this.itemFixedSize || this.itemFluidWidth) {
                    var itemsPerRow = Math.floor((n.clientWidth - this.itemSpacing)/(this.itemWidth + this.itemSpacing));
                    var low = Math.floor(itemsPerRow);
                    var high = Math.ceil(itemsPerRow);
                    var gutter = n.clientWidth - this.itemSpacing - (high * (this.itemWidth + this.itemSpacing));
                    this.itemsPerRow = (gutter > 0) ? high : low;
                    visibleRows = Math.round((n.clientHeight - this.itemSpacing)/(this.itemHeight + this.itemSpacing));
                }
                // Make sure there's at least 1 item per row
                this.itemsPerRow = Math.max(1, this.itemsPerRow);
                this.rowsPerPage = 3 * this.itemsPerRow * visibleRows;
                this.$.generator.itemsPerRow = this.itemsPerRow;
            }
        },
        //* @protected
        _setComponents: function() {
            // TODO: The entire implementation of GridList needs an overhaul, but for now this ugly cloning is
            // needed to prevent the generator kind modification below from modifying enyo.Lists's generator
            this.listTools = enyo.clone(this.listTools);
            this.listTools[0] = enyo.clone(this.listTools[0]);
            this.listTools[0].components = enyo.clone(this.listTools[0].components);
            var c = this.listTools[0].components;
            // Create a dummy component to dynamically compute the dimensions of items at run-time (once for each item during sizeupItem) based on the actual content inside the item (only for variable sized items where sizeupItem is called).
           // this.createComponent(new enyo.Component({name: "_dummy_", allowHtml: true, classes: "enyo-gridlist-dummy", showing: false}, {owner: this}));
            // Override List's listTools array to use GridFlyweightRepeater instead of FlyweightRepeater
            for (var i=0; i<c.length; i++) {
                if (c[i].name == 'generator') {
                    c[i] = enyo.clone(c[i]);
                    c[i].kind = "enyo.GridFlyWeightRepeater";
                    return;
                }
            }
        }
    }
);

/**
	_enyo.Slideable_ is a control that can be dragged either horizontally or
	vertically between a minimum and a maximum value. When released from
	dragging, a	Slideable will animate to its minimum or maximum position,
	depending on the direction of the drag.

	The _min_ value specifies a position to the left of, or above, the initial
	position, to which the Slideable may be dragged.
	The _max_ value specifies a position to the right of, or below, the initial
	position, to which the Slideable may be dragged.
	The _value_ property specifies the current position of the Slideable,
	between the minimum and maximum positions.

	_min_, _max_, and _value_ may be specified in units of "px" or "%".

	The _axis_ property determines whether the Slideable slides left-to-right
	("h") or up-and-down ("v").

	The following control is placed 90% off the screen to the right, and slides
	to its natural position.

		{kind: "enyo.Slideable", value: -90, min: -90, unit: "%",
			classes: "enyo-fit", style: "width: 300px;",
			components: [
				{content: "stuff"}
			]
		}
*/
enyo.kind({
	name: "enyo.Slideable",
	kind: "Control",
	published: {
		//* Direction of sliding; can be "h" or "v"
		axis: "h",
		//* Current position of the Slideable (a value between _min_ and _max_)
		value: 0,
		//* Unit for _min_, _max_, and _value_; can be "px" or "%"
		unit: "px",
		//* A minimum value to slide to
		min: 0,
		//* A maximum value to slide to
		max: 0,
		//* When truthy, apply CSS styles to allow GPU compositing of slideable content
		//* if the platform allows.
		accelerated: "auto",
		//* Set to false to prevent the Slideable from dragging with elasticity
		//* past its _min_ or _max_ value
		overMoving: true,
		//* Set to false to disable dragging
		draggable: true
	},
	events: {
		//* Fires when the Slideable finishes animating.
		onAnimateFinish: "",
		//* Fires when the position (i.e., _value_) of the Slideable changes.
		onChange: ""
	},
	//* Set to true to prevent a drag from bubbling beyond the Slideable
	preventDragPropagation: false,
	//* @protected
	tools: [
		{kind: "Animator", onStep: "animatorStep", onEnd: "animatorComplete"}
	],
	handlers: {
		ondragstart: "dragstart",
		ondrag: "drag",
		ondragfinish: "dragfinish"
	},
	kDragScalar: 1,
	dragEventProp: "dx",
	unitModifier: false,
	canTransform: false,
	//* @protected
	create: enyo.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);
			this.acceleratedChanged();
			this.transformChanged();
			this.axisChanged();
			this.valueChanged();
			this.addClass("enyo-slideable");
		};
	}),
	initComponents: enyo.inherit(function(sup) {
		return function() {
			this.createComponents(this.tools);
			sup.apply(this, arguments);
		};
	}),
	rendered: enyo.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);
			this.canModifyUnit();
			this.updateDragScalar();
		};
	}),
	resizeHandler: enyo.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);
			this.updateDragScalar();
		};
	}),
	canModifyUnit: function() {
		if (!this.canTransform) {
			var b = this.getInitialStyleValue(this.hasNode(), this.boundary);
			// If inline style of "px" exists, while unit is "%"
			if (b.match(/px/i) && (this.unit === "%")) {
				// Set unitModifier - used to over-ride "%"
				this.unitModifier = this.getBounds()[this.dimension];
			}
		}
	},
	getInitialStyleValue: function(inNode, inBoundary) {
		var s = enyo.dom.getComputedStyle(inNode);
		if (s) {
			return s.getPropertyValue(inBoundary);
		} else if (inNode && inNode.currentStyle) {
			return inNode.currentStyle[inBoundary];
		}
		return "0";
	},
	updateBounds: function(inValue, inDimensions) {
		var inBounds = {};
		inBounds[this.boundary] = inValue;
		this.setBounds(inBounds, this.unit);

		this.setInlineStyles(inValue, inDimensions);
	},
	updateDragScalar: function() {
		if (this.unit == "%") {
			var d = this.getBounds()[this.dimension];
			this.kDragScalar = d ? 100 / d : 1;

			if (!this.canTransform) {
				this.updateBounds(this.value, 100);
			}
		}
	},
	transformChanged: function() {
		this.canTransform = enyo.dom.canTransform();
	},
	acceleratedChanged: function() {
		if (!enyo.platform.android || enyo.platform.android <= 2) {
			enyo.dom.accelerate(this, this.accelerated);
		}
	},
	axisChanged: function() {
		var h = this.axis == "h";
		this.dragMoveProp = h ? "dx" : "dy";
		this.shouldDragProp = h ? "horizontal" : "vertical";
		this.transform = h ? "translateX" : "translateY";
		this.dimension = h ? "width" : "height";
		this.boundary = h ? "left" : "top";
	},
	setInlineStyles: function(inValue, inDimensions) {
		var inBounds = {};

		if (this.unitModifier) {
			inBounds[this.boundary] = this.percentToPixels(inValue, this.unitModifier);
			inBounds[this.dimension] = this.unitModifier;
			this.setBounds(inBounds);
		} else {
			if (inDimensions) {
				inBounds[this.dimension] = inDimensions;
			} else {
				inBounds[this.boundary] = inValue;
			}
			this.setBounds(inBounds, this.unit);
		}
	},
	valueChanged: function(inLast) {
		var v = this.value;
		if (this.isOob(v) && !this.isAnimating()) {
			this.value = this.overMoving ? this.dampValue(v) : this.clampValue(v);
		}
		// FIXME: android cannot handle nested compositing well so apply acceleration only if needed
		// desktop chrome doesn't like this code path so avoid...
		if (enyo.platform.android > 2) {
			if (this.value) {
				if (inLast === 0 || inLast === undefined) {
					enyo.dom.accelerate(this, this.accelerated);
				}
			} else {
				enyo.dom.accelerate(this, false);
			}
		}

		// If platform supports transforms
		if (this.canTransform) {
			enyo.dom.transformValue(this, this.transform, this.value + this.unit);
		// else update inline styles
		} else {
			this.setInlineStyles(this.value, false);
		}
		this.doChange();
	},
	getAnimator: function() {
		return this.$.animator;
	},
	isAtMin: function() {
		return this.value <= this.calcMin();
	},
	isAtMax: function() {
		return this.value >= this.calcMax();
	},
	calcMin: function() {
		return this.min;
	},
	calcMax: function() {
		return this.max;
	},
	clampValue: function(inValue) {
		var min = this.calcMin();
		var max = this.calcMax();
		return Math.max(min, Math.min(inValue, max));
	},
	dampValue: function(inValue) {
		return this.dampBound(this.dampBound(inValue, this.min, 1), this.max, -1);
	},
	dampBound: function(inValue, inBoundary, inSign) {
		var v = inValue;
		if (v * inSign < inBoundary * inSign) {
			v = inBoundary + (v - inBoundary) / 4;
		}
		return v;
	},
	percentToPixels: function(value, dimension) {
		return Math.floor((dimension / 100) * value);
	},
	pixelsToPercent: function(value) {
		var boundary = this.unitModifier ? this.getBounds()[this.dimension] : this.container.getBounds()[this.dimension];
		return (value / boundary) * 100;
	},
	// dragging
	shouldDrag: function(inEvent) {
		return this.draggable && inEvent[this.shouldDragProp];
	},
	isOob: function(inValue) {
		return inValue > this.calcMax() || inValue < this.calcMin();
	},
	dragstart: function(inSender, inEvent) {
		if (this.shouldDrag(inEvent)) {
			inEvent.preventDefault();
			this.$.animator.stop();
			inEvent.dragInfo = {};
			this.dragging = true;
			this.drag0 = this.value;
			this.dragd0 = 0;
			return this.preventDragPropagation;
		}
	},
	drag: function(inSender, inEvent) {
		if (this.dragging) {
			inEvent.preventDefault();
			var d = this.canTransform ? inEvent[this.dragMoveProp] * this.kDragScalar : this.pixelsToPercent(inEvent[this.dragMoveProp]);
			var v = this.drag0 + d;
			var dd = d - this.dragd0;
			this.dragd0 = d;
			if (dd) {
				inEvent.dragInfo.minimizing = dd < 0;
			}
			this.setValue(v);
			return this.preventDragPropagation;
		}
	},
	dragfinish: function(inSender, inEvent) {
		if (this.dragging) {
			this.dragging = false;
			this.completeDrag(inEvent);
			inEvent.preventTap();
			return this.preventDragPropagation;
		}
	},
	completeDrag: function(inEvent) {
		if (this.value !== this.calcMax() && this.value != this.calcMin()) {
			this.animateToMinMax(inEvent.dragInfo.minimizing);
		}
	},
	// animation
	isAnimating: function() {
		return this.$.animator.isAnimating();
	},
	play: function(inStart, inEnd) {
		this.$.animator.play({
			startValue: inStart,
			endValue: inEnd,
			node: this.hasNode()
		});
	},
	//* @public
	//* Animates to the given value.
	animateTo: function(inValue) {
		this.play(this.value, inValue);
	},
	//* Animates to the minimum value.
	animateToMin: function() {
		this.animateTo(this.calcMin());
	},
	//* Animates to the maximum value.
	animateToMax: function() {
		this.animateTo(this.calcMax());
	},
	//* @protected
	animateToMinMax: function(inMin) {
		if (inMin) {
			this.animateToMin();
		} else {
			this.animateToMax();
		}
	},
	animatorStep: function(inSender) {
		this.setValue(inSender.value);
		return true;
	},
	animatorComplete: function(inSender) {
		this.doAnimateFinish(inSender);
		return true;
	},
	//* @public
	//* Toggles between _min_ and _max_ values with animation.
	toggleMinMax: function() {
		this.animateToMinMax(!this.isAtMin());
	}
});

/**
	_enyo.Arranger_ is an [enyo.Layout](#enyo.Layout) that considers one of the
	controls it lays out as active. The other controls are placed relative to
	the active control as makes sense for the layout.

	Arranger supports dynamic layouts, meaning it's possible to transition
	between its layouts	via animation. Typically, arrangers should lay out
	controls using CSS transforms, since these are optimized for animation. To
	support this, the controls in an Arranger are absolutely positioned, and
	the Arranger kind has an _accelerated_ property, which marks controls for
	CSS compositing. The default setting of _"auto"_ ensures that this will
	occur if enabled by the platform.

	For more information, see the documentation on
	[Arrangers](building-apps/layout/arrangers.html) in the Enyo Developer Guide.
*/
enyo.kind({
	name: "enyo.Arranger",
	kind: "Layout",
	layoutClass: "enyo-arranger",
	/**
		Sets controls being laid out to use CSS compositing. A setting of "auto"
		will mark controls for compositing if the platform supports it.
	*/
	accelerated: "auto",
	//* Property of the drag event used to calculate the amount a drag moves the layout
	dragProp: "ddx",
	//* Property of the drag event used to calculate the direction of a drag
	dragDirectionProp: "xDirection",
	//* Property of the drag event used to calculate whether a drag should occur
	canDragProp: "horizontal",
	/**
		If set to true, transitions between non-adjacent arrangements will go
		through the intermediate arrangements. This is useful when direct
		transitions between arrangements would be visually jarring.
	*/
	incrementalPoints: false,
	/**
		Called when removing an arranger (for example, when switching a Panels
		control to a different arrangerKind). Subclasses should implement this
		function to reset whatever properties they've changed on child controls.
		You *must* call the superclass implementation in your subclass's
		_destroy_ function.
	*/
	destroy: enyo.inherit(function(sup) {
		return function() {
			var c$ = this.container.getPanels();
			for (var i=0, c; (c=c$[i]); i++) {
				c._arranger = null;
			}
			sup.apply(this, arguments);
		};
	}),
	/**
		Arranges the given array of controls (_inC_) in the layout specified by
		_inName_. When implementing this method, rather than apply styling
		directly to controls, call _arrangeControl(inControl, inArrangement)_
		with an _inArrangement_	object with styling settings. These will then be
		applied via the	_flowControl(inControl, inArrangement)_ method.
	*/
	arrange: function(inC, inName) {
	},
	/**
		Sizes the controls in the layout. This method is called only at reflow
		time. Note that sizing is separated from other layout done in the
		_arrange_ method because it is expensive and not suitable for dynamic
		layout.
	*/
	size: function() {
	},
	/**
		Called when a layout transition begins. Implement this method to perform
		tasks that should only occur when a transition starts; for example, some
		controls could be shown or hidden. In addition, the	_transitionPoints_
		array may be set on the container to dictate the named arrangments
		between which the transition occurs.
	*/
	start: function() {
		var f = this.container.fromIndex, t = this.container.toIndex;
		var p$ = this.container.transitionPoints = [f];
		// optionally add a transition point for each index between from and to.
		if (this.incrementalPoints) {
			var d = Math.abs(t - f) - 2;
			var i = f;
			while (d >= 0) {
				i = i + (t < f ? -1 : 1);
				p$.push(i);
				d--;
			}
		}
		p$.push(this.container.toIndex);
	},
	/**
		Called when a layout transition completes. Implement this method to
		perform tasks that should only occur when a transition ends; for
		example, some controls could be shown or hidden.
	*/
	finish: function() {
	},
	/**
	Called when dragging the layout, this method returns the difference in
	pixels between the arrangement _inA0_ for layout setting _inI0_	and
	arrangement _inA1_ for layout setting _inI1_. This data is used to calculate
	the percentage that a drag should move the layout between two active states.
	*/
	calcArrangementDifference: function(inI0, inA0, inI1, inA1) {
	},
	//* @protected
	canDragEvent: function(inEvent) {
		return inEvent[this.canDragProp];
	},
	calcDragDirection: function(inEvent) {
		return inEvent[this.dragDirectionProp];
	},
	calcDrag: function(inEvent) {
		return inEvent[this.dragProp];
	},
	drag: function(inDp, inAn, inA, inBn, inB) {
		var f = this.measureArrangementDelta(-inDp, inAn, inA, inBn, inB);
		return f;
	},
	measureArrangementDelta: function(inX, inI0, inA0, inI1, inA1) {
		var d = this.calcArrangementDifference(inI0, inA0, inI1, inA1);
		var s = d ? inX / Math.abs(d) : 0;
		s = s * (this.container.fromIndex > this.container.toIndex ? -1 : 1);
		//enyo.log("delta", s);
		return s;
	},
	_arrange: function(inIndex) {
		// guard against being called before we've been rendered
		if (!this.containerBounds) {
			this.reflow();
		}
		var c$ = this.getOrderedControls(inIndex);
		this.arrange(c$, inIndex);
	},
	arrangeControl: function(inControl, inArrangement) {
		inControl._arranger = enyo.mixin(inControl._arranger || {}, inArrangement);
	},
	// called before HTML is generated
	flow: function() {
		this.c$ = [].concat(this.container.getPanels());
		this.controlsIndex = 0;
		for (var i=0, c$=this.container.getPanels(), c; (c=c$[i]); i++) {
			enyo.dom.accelerate(c, !c.preventAccelerate && this.accelerated);
			if (enyo.platform.safari) {
				// On Safari-desktop, sometimes having the panel's direct child set to accelerate isn't sufficient
				// this is most often the case with Lists contained inside another control, inside a Panels
				var grands=c.children;
				for (var j=0, kid; (kid=grands[j]); j++) {
					enyo.dom.accelerate(kid, this.accelerated);
				}
			}
		}
	},
	// called during "rendered" phase
	reflow: function() {
		var cn = this.container.hasNode();
		this.containerBounds = cn ? {width: cn.clientWidth, height: cn.clientHeight} : {};
		this.size();
	},
	flowArrangement: function() {
		var a = this.container.arrangement;
		if (a) {
			for (var i=0, c$=this.container.getPanels(), c; (c=c$[i]) && (a[i]); i++) {
				this.flowControl(c, a[i]);
			}
		}
	},
	//* @public
	/**
		Lays out the control (_inControl_) according to the settings stored in
		the	_inArrangment_ object. By default, _flowControl_ will apply settings
		of left, top, and opacity. This method should only be implemented to
		apply other settings made via _arrangeControl_.
	*/
	flowControl: function(inControl, inArrangement) {
		enyo.Arranger.positionControl(inControl, inArrangement);
		var o = inArrangement.opacity;
		if (o != null) {
			enyo.Arranger.opacifyControl(inControl, o);
		}
	},
	//* @protected
	// Gets an array of controls arranged in state order.
	// note: optimization, dial around a single array.
	getOrderedControls: function(inIndex) {
		var whole = Math.floor(inIndex);
		var a = whole - this.controlsIndex;
		var sign = a > 0;
		var c$ = this.c$ || [];
		for (var i=0; i<Math.abs(a); i++) {
			if (sign) {
				c$.push(c$.shift());
			} else {
				c$.unshift(c$.pop());
			}
		}
		this.controlsIndex = whole;
		return c$;
	},
	statics: {
		// Positions a control via transform: translateX/Y if supported and falls back to left/top if not.
		positionControl: function(inControl, inBounds, inUnit) {
			var unit = inUnit || "px";
			if (!this.updating) {
				// IE10 uses setBounds because of control hit caching problems seem in some apps
				if (enyo.dom.canTransform() && !inControl.preventTransform && !enyo.platform.android && enyo.platform.ie !== 10) {
					var l = inBounds.left, t = inBounds.top;
					l = enyo.isString(l) ? l : l && (l + unit);
					t = enyo.isString(t) ? t : t && (t + unit);
					enyo.dom.transform(inControl, {translateX: l || null, translateY: t || null});
				} else {
					// If a previously positioned control has subsequently been marked with
					// preventTransform, we need to clear out any old translation values.
					if (enyo.dom.canTransform() && inControl.preventTransform) {
						enyo.dom.transform(inControl, {translateX: null, translateY: null});
					}
					inControl.setBounds(inBounds, inUnit);
				}
			}
		},
		opacifyControl: function(inControl, inOpacity) {
			var o = inOpacity;
			// FIXME: very high/low settings of opacity can cause a control to
			// blink so cap this here.
			o = o > 0.99 ? 1 : (o < 0.01 ? 0 : o);
			// note: we only care about ie8
			if (enyo.platform.ie < 9) {
				inControl.applyStyle("filter", "progid:DXImageTransform.Microsoft.Alpha(Opacity=" + (o * 100) + ")");
			} else {
				inControl.applyStyle("opacity", o);
			}
		}
	}
});

/**
	_enyo.CardArranger_ is an [enyo.Arranger](#enyo.Arranger) that displays only
	one active control. The non-active controls are hidden with
	_setShowing(false)_. Transitions between arrangements are handled by fading
	from one control to the next.

	For more information, see the documentation on
	[Arrangers](building-apps/layout/arrangers.html) in the Enyo Developer Guide.
*/
enyo.kind({
	name: "enyo.CardArranger",
	kind: "Arranger",
	//* @protected
	layoutClass: "enyo-arranger enyo-arranger-fit",
	calcArrangementDifference: function(inI0, inA0, inI1, inA1) {
		return this.containerBounds.width;
	},
	arrange: function(inC, inName) {
		for (var i=0, c, v; (c=inC[i]); i++) {
			v = (i === 0) ? 1 : 0;
			this.arrangeControl(c, {opacity: v});
		}
	},
	start: enyo.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);
			var c$ = this.container.getPanels();
			for (var i=0, c; (c=c$[i]); i++) {
				var wasShowing=c.showing;
				c.setShowing(i == this.container.fromIndex || i == (this.container.toIndex));
				if (c.showing && !wasShowing) {
					c.resized();
				}
			}
		};
	}),
	finish: enyo.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);
			var c$ = this.container.getPanels();
			for (var i=0, c; (c=c$[i]); i++) {
				c.setShowing(i == this.container.toIndex);
			}
		};
	}),
	destroy: enyo.inherit(function(sup) {
		return function() {
			var c$ = this.container.getPanels();
			for (var i=0, c; (c=c$[i]); i++) {
				enyo.Arranger.opacifyControl(c, 1);
				if (!c.showing) {
					c.setShowing(true);
				}
			}
			sup.apply(this, arguments);
		};
	})
});

/**
	_enyo.CardSlideInArranger_ is an [enyo.Arranger](#enyo.Arranger) that
	displays only one active control. The non-active controls are hidden with
	_setShowing(false)_. Transitions between arrangements are handled by
	sliding the new control	over the current one.

	Note that CardSlideInArranger always slides controls in from the right. If
	you want an arranger that slides to the right and left, try
	[enyo.LeftRightArranger](#enyo.LeftRightArranger).

	For more information, see the documentation on
	[Arrangers](building-apps/layout/arrangers.html) in the Enyo Developer Guide.
*/
enyo.kind({
	name: "enyo.CardSlideInArranger",
	kind: "CardArranger",
	//* @protected
	start: function() {
		var c$ = this.container.getPanels();
		for (var i=0, c; (c=c$[i]); i++) {
			var wasShowing=c.showing;
			c.setShowing(i == this.container.fromIndex || i == (this.container.toIndex));
			if (c.showing && !wasShowing) {
				c.resized();
			}
		}
		var l = this.container.fromIndex;
		i = this.container.toIndex;
		this.container.transitionPoints = [
			i + "." + l + ".s",
			i + "." + l + ".f"
		];
	},
	finish: enyo.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);
			var c$ = this.container.getPanels();
			for (var i=0, c; (c=c$[i]); i++) {
				c.setShowing(i == this.container.toIndex);
			}
		};
	}),
	arrange: function(inC, inName) {
		var p = inName.split(".");
		var f = p[0], s= p[1], starting = (p[2] == "s");
		var b = this.containerBounds.width;
		for (var i=0, c$=this.container.getPanels(), c, v; (c=c$[i]); i++) {
			v = b;
			if (s == i) {
				v = starting ? 0 : -b;
			}
			if (f == i) {
				v = starting ? b : 0;
			}
			if (s == i && s == f) {
				v = 0;
			}
			this.arrangeControl(c, {left: v});
		}
	},
	destroy: enyo.inherit(function(sup) {
		return function() {
			var c$ = this.container.getPanels();
			for (var i=0, c; (c=c$[i]); i++) {
				enyo.Arranger.positionControl(c, {left: null});
			}
			sup.apply(this, arguments);
		};
	})
});

/**
	_enyo.CarouselArranger_ is an [enyo.Arranger](#enyo.Arranger) that displays
	the active control, along with some number of inactive controls to fill the
	available space. The active control is positioned on the left side of the
	container, and the rest of the views are laid out to the right.

	One of the controls may have _fit: true_ set, in which case it will take up
	any remaining space after all of the other controls have been sized.

	For best results with CarouselArranger, you should set a minimum width for
	each control via a CSS style, e.g., _min-width: 25%_ or _min-width: 250px_.

	Transitions between arrangements are handled by sliding the new controls in
	from the right and sliding the old controls off to the left.

	For more information, see the documentation on
	[Arrangers](building-apps/layout/arrangers.html) in the Enyo Developer Guide.
*/
enyo.kind({
	name: "enyo.CarouselArranger",
	kind: "Arranger",
	//* @protected
	size: function() {
		var c$ = this.container.getPanels();
		var padding = this.containerPadding = this.container.hasNode() ? enyo.dom.calcPaddingExtents(this.container.node) : {};
		var pb = this.containerBounds;
		var i, e, s, m, c;
		pb.height -= padding.top + padding.bottom;
		pb.width -= padding.left + padding.right;
		// used space
		var fit;
		for (i=0, s=0; (c=c$[i]); i++) {
			m = enyo.dom.calcMarginExtents(c.hasNode());
			c.width = c.getBounds().width;
			c.marginWidth = m.right + m.left;
			s += (c.fit ? 0 : c.width) + c.marginWidth;
			if (c.fit) {
				fit = c;
			}
		}
		if (fit) {
			var w = pb.width - s;
			fit.width = w >= 0 ? w : fit.width;
		}
		for (i=0, e=padding.left; (c=c$[i]); i++) {
			c.setBounds({top: padding.top, bottom: padding.bottom, width: c.fit ? c.width : null});
		}
	},
	arrange: function(inC, inName) {
		if (this.container.wrap) {
			this.arrangeWrap(inC, inName);
		} else {
			this.arrangeNoWrap(inC, inName);
		}
	},
	arrangeNoWrap: function(inC, inName) {
		var i, aw, cw, c;
		var c$ = this.container.getPanels();
		var s = this.container.clamp(inName);
		var nw = this.containerBounds.width;
		// do we have enough content to fill the width?
		for (i=s, cw=0; (c=c$[i]); i++) {
			cw += c.width + c.marginWidth;
			if (cw > nw) {
				break;
			}
		}
		// if content width is less than needed, adjust starting point index and offset
		var n = nw - cw;
		var o = 0;
		if (n > 0) {
			for (i=s-1, aw=0; (c=c$[i]); i--) {
				aw += c.width + c.marginWidth;
				if (n - aw <= 0) {
					o = (n - aw);
					s = i;
					break;
				}
			}
		}
		// arrange starting from needed index with detected offset so we fill space
		var w, e;
		for (i=0, e=this.containerPadding.left + o; (c=c$[i]); i++) {
			w = c.width + c.marginWidth;
			if (i < s) {
				this.arrangeControl(c, {left: -w});
			} else {
				this.arrangeControl(c, {left: Math.floor(e)});
				e += w;
			}
		}
	},
	arrangeWrap: function(inC, inName) {
		for (var i=0, e=this.containerPadding.left, c; (c=inC[i]); i++) {
			this.arrangeControl(c, {left: e});
			e += c.width + c.marginWidth;
		}
	},
	calcArrangementDifference: function(inI0, inA0, inI1, inA1) {
		var i = Math.abs(inI0 % this.c$.length);
		return inA0[i].left - inA1[i].left;
	},
	destroy: enyo.inherit(function(sup) {
		return function() {
			var c$ = this.container.getPanels();
			for (var i=0, c; (c=c$[i]); i++) {
				enyo.Arranger.positionControl(c, {left: null, top: null});
				c.applyStyle("top", null);
				c.applyStyle("bottom", null);
				c.applyStyle("left", null);
				c.applyStyle("width", null);
			}
			sup.apply(this, arguments);
		};
	})
});

/**
	_enyo.CollapsingArranger_ is an [enyo.Arranger](#enyo.Arranger) that
	displays the active control, along with some number of inactive	controls to
	fill the available space. The active control is positioned on the left side
	of the container and the rest of the views are laid out to the right. The
	last control, if visible, will expand to fill whatever space is not taken
	up by the previous controls.

	For best results with CollapsingArranger, you should set a minimum width
	for each control via a CSS style, e.g., _min-width: 25%_ or
	_min-width: 250px_.

	Transitions between arrangements are handled by sliding the new control	in
	from the right and collapsing the old control to the left.

	For more information, see the documentation on
	[Arrangers](building-apps/layout/arrangers.html) in the Enyo Developer Guide.
*/
enyo.kind({
	name: "enyo.CollapsingArranger",
	kind: "CarouselArranger",
	/**
		The distance (in pixels) that each panel should be offset from the left
		when it is selected. This allows controls on the underlying panel to the
		left of the selected one to be partially revealed.
	*/
	peekWidth: 0,
	//* @protected
	size: enyo.inherit(function(sup) {
		return function() {
			this.clearLastSize();
			sup.apply(this, arguments);
		};
	}),
	// clear size from last if it's not actually the last
	// (required for adding another control)
	clearLastSize: function() {
		for (var i=0, c$=this.container.getPanels(), c; (c=c$[i]); i++) {
			if (c._fit && i != c$.length-1) {
				c.applyStyle("width", null);
				c._fit = null;
			}
		}
	},
	constructor: enyo.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);
			this.peekWidth = this.container.peekWidth != null ? this.container.peekWidth : this.peekWidth;
		};
	}),
	arrange: function(inC, inIndex) {
		var c$ = this.container.getPanels();
		for (var i=0, e=this.containerPadding.left, c, n=0; (c=c$[i]); i++) {
			if(c.getShowing()){
				this.arrangeControl(c, {left: e + n * this.peekWidth});
				if (i >= inIndex) {
					e += c.width + c.marginWidth - this.peekWidth;
				}
				n++;
			} else {
				this.arrangeControl(c, {left: e});
				if (i >= inIndex) {
					e += c.width + c.marginWidth;
				}
			}
			// FIXME: overdragging-ish
			if (i == c$.length - 1 && inIndex < 0) {
				this.arrangeControl(c, {left: e - inIndex});
			}
		}
	},
	calcArrangementDifference: function(inI0, inA0, inI1, inA1) {
		var i = this.container.getPanels().length-1;
		return Math.abs(inA1[i].left - inA0[i].left);
	},
	flowControl: enyo.inherit(function(sup) {
		return function(inControl, inA) {
			sup.apply(this, arguments);
			if (this.container.realtimeFit) {
				var c$ = this.container.getPanels();
				var l = c$.length-1;
				var last = c$[l];
				if (inControl == last) {
					this.fitControl(inControl, inA.left);
				}
			}

		};
	}),
	finish: enyo.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);
			if (!this.container.realtimeFit && this.containerBounds) {
				var c$ = this.container.getPanels();
				var a$ = this.container.arrangement;
				var l = c$.length-1;
				var c = c$[l];
				this.fitControl(c, a$[l].left);
			}
		};
	}),
	fitControl: function(inControl, inOffset) {
		inControl._fit = true;
		inControl.applyStyle("width", (this.containerBounds.width - inOffset) + "px");
		inControl.resized();
	}
});

/**
	_enyo.DockRightArranger_ is an [enyo.Arranger](#enyo.Arranger) that
	displays the active control, along with some number of inactive controls to
	fill the available space. The active control is positioned on the right
	side of the container and the rest of the views are laid out to the right.

	For best results with DockRightArranger, you should set a minimum width
	for each control via a CSS style, e.g., _min-width: 25%_ or
	_min-width: 250px_.

	Transitions between arrangements are handled by sliding the new control	in
	from the right. If the width of the old control(s) can fit within the
	container, they will slide to the left. If not, the old control(s) will
	collapse to the left.

	For more information, see the documentation on
	[Arrangers](building-apps/layout/arrangers.html) in the Enyo Developer Guide.
*/
enyo.kind({
	name: "enyo.DockRightArranger",
	kind: "Arranger",
	//* If true, the base panel (index 0) will fill the width of the container,
	//* while newer controls will slide in and collapse on top of it
	basePanel: false,
	//* How many px should panels overlap
	overlap: 0,
	//* Column width
	layoutWidth: 0,
	//* @protected
	constructor: enyo.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);
			this.overlap = this.container.overlap != null ? this.container.overlap : this.overlap;
			this.layoutWidth = this.container.layoutWidth != null ? this.container.layoutWidth : this.layoutWidth;
		};
	}),
	size: function() {
		var c$ = this.container.getPanels();
		var padding = this.containerPadding = this.container.hasNode() ? enyo.dom.calcPaddingExtents(this.container.node) : {};
		var pb = this.containerBounds;
		var i, m, c;
		pb.width -= padding.left + padding.right;
		var nw = pb.width;
		var len = c$.length;
		var offset;
		// panel arrangement positions
		this.container.transitionPositions = {};

		for (i=0; (c=c$[i]); i++) {
			c.width = ((i===0) && (this.container.basePanel)) ? nw : c.getBounds().width;
		}

		for (i=0; (c=c$[i]); i++) {

			if ((i===0) && (this.container.basePanel)) {
				c.setBounds({width: nw});
			}
			c.setBounds({top: padding.top, bottom: padding.bottom});

			for (var j=0; (c=c$[j]); j++) {
				var xPos;
				// index 0 always should always be left-aligned at 0px
				if ((i===0) && (this.container.basePanel)) {
					xPos = 0;
				// else newer panels should be positioned off the viewport
				} else if (j < i) {
					xPos = nw;
				// else active panel should be right-aligned
				} else if (i === j) {
					offset = nw > this.layoutWidth ? this.overlap : 0;
					xPos = (nw - c$[i].width) + offset;
				} else {
					break;
				}
				this.container.transitionPositions[i + "." + j] = xPos;
			}

			if (j < len) {
				var leftAlign = false;
				for (var k=i+1; k<len; k++) {
					offset = 0;
					// position panel to left: 0px
					if (leftAlign) {
						offset = 0;
					// else if next panel cannot fit within container
					} else if ( (c$[i].width + c$[k].width - this.overlap) > nw ) {
					//} else if ( (c$[i].width + c$[k].width) > nw ) {
						offset = 0;
						leftAlign = true;
					} else {
						offset = c$[i].width - this.overlap;
						for (m=i; m<k; m++) {
							var _w = offset + c$[m+1].width - this.overlap;
							if (_w < nw) {
								offset = _w;
							} else {
								offset = nw;
								break;
							}
						}
						offset = nw - offset;
					}
					this.container.transitionPositions[i + "." + k] = offset;
				}
			}

		}
	},
	arrange: function(inC, inName) {
		var i, c;
		var c$ = this.container.getPanels();
		var s = this.container.clamp(inName);

		for (i=0; (c=c$[i]); i++) {
			var xPos = this.container.transitionPositions[i + "." + s];
			this.arrangeControl(c, {left: xPos});
		}
	},
	calcArrangementDifference: function(inI0, inA0, inI1, inA1) {
		var p = this.container.getPanels();
		var w = (inI0 < inI1) ? p[inI1].width : p[inI0].width;
		return w;
	},
	destroy: enyo.inherit(function(sup) {
		return function() {
			var c$ = this.container.getPanels();
			for (var i=0, c; (c=c$[i]); i++) {
				enyo.Arranger.positionControl(c, {left: null, top: null});
				c.applyStyle("top", null);
				c.applyStyle("bottom", null);
				c.applyStyle("left", null);
				c.applyStyle("width", null);
			}
			sup.apply(this, arguments);
		};
	})
});

/**
	_enyo.LeftRightArranger_ is an [enyo.Arranger](#enyo.Arranger) that displays
	the active control and some of the previous and next controls. The active
	control is centered horizontally in the container, and the previous and next
	controls are laid out to the left and right, respectively.

	Transitions between arrangements are handled by sliding the new control in
	from the right and sliding the active control out to the left.

	For more information, see the documentation on
	[Arrangers](building-apps/layout/arrangers.html) in the Enyo Developer Guide.
*/
enyo.kind({
	name: "enyo.LeftRightArranger",
	kind: "Arranger",
	//* The margin width (i.e., how much of the previous and next controls
	//* are visible) in pixels
	margin: 40,
	//* @protected
	axisSize: "width",
	offAxisSize: "height",
	axisPosition: "left",
	constructor: enyo.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);
			this.margin = this.container.margin != null ? this.container.margin : this.margin;
		};
	}),
	size: function() {
		var c$ = this.container.getPanels();
		var port = this.containerBounds[this.axisSize];
		var box = port - this.margin -this.margin;
		for (var i=0, b, c; (c=c$[i]); i++) {
			b = {};
			b[this.axisSize] = box;
			b[this.offAxisSize] = "100%";
			c.setBounds(b);
		}
	},
	start: enyo.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);

			var s = this.container.fromIndex;
			var f = this.container.toIndex;
			var c$ = this.getOrderedControls(f);
			var o = Math.floor(c$.length/2);

			for (var i=0, c; (c=c$[i]); i++) {
				if (s > f){
					if (i == (c$.length - o)){
						c.applyStyle("z-index", 0);
					} else {
						c.applyStyle("z-index", 1);
					}
				} else {
					if (i == (c$.length-1 - o)){
						c.applyStyle("z-index", 0);
					} else {
						c.applyStyle("z-index", 1);
					}
				}
			}
		};
	}),
	arrange: function(inC, inIndex) {
		var i,c,b;
		if (this.container.getPanels().length==1){
			b = {};
			b[this.axisPosition] = this.margin;
			this.arrangeControl(this.container.getPanels()[0], b);
			return;
		}
		var o = Math.floor(this.container.getPanels().length/2);
		var c$ = this.getOrderedControls(Math.floor(inIndex)-o);
		var box = this.containerBounds[this.axisSize] - this.margin -this.margin;
		var e = this.margin - box * o;
		for (i=0; (c=c$[i]); i++) {
			b = {};
			b[this.axisPosition] = e;
			this.arrangeControl(c, b);
			e += box;
		}
	},
	calcArrangementDifference: function(inI0, inA0, inI1, inA1) {
		if (this.container.getPanels().length==1){
			return 0;
		}

		var i = Math.abs(inI0 % this.c$.length);
		//enyo.log(inI0, inI1);
		return inA0[i][this.axisPosition] - inA1[i][this.axisPosition];
	},
	destroy: enyo.inherit(function(sup) {
		return function() {
			var c$ = this.container.getPanels();
			for (var i=0, c; (c=c$[i]); i++) {
				enyo.Arranger.positionControl(c, {left: null, top: null});
				enyo.Arranger.opacifyControl(c, 1);
				c.applyStyle("left", null);
				c.applyStyle("top", null);
				c.applyStyle("height", null);
				c.applyStyle("width", null);
			}
			sup.apply(this, arguments);
		};
	})
});

//* @public
/**
	_enyo.TopBottomArranger_ is an [enyo.Arranger](#enyo.Arranger) that displays
	the active control and some of the previous and next controls. The active
	control is centered vertically in the container, and the previous and next
	controls are laid out above and below, respectively.

	Transitions between arrangements are handled by sliding the new control in
	from the bottom and sliding the active control out the top.

	For more information, see the documentation on
	[Arrangers](building-apps/layout/arrangers.html) in the Enyo Developer Guide.
*/
enyo.kind({
	name: "enyo.TopBottomArranger",
	kind: "LeftRightArranger",
	//* Property of the drag event used to calculate the amount a drag moves
	//* the layout
	dragProp: "ddy",
	//* Property of the drag event used to calculate the direction of a drag
	dragDirectionProp: "yDirection",
	//* Property of the drag event used to calculate whether a drag should occur
	canDragProp: "vertical",
	//* @protected
	axisSize: "height",
	offAxisSize: "width",
	axisPosition: "top"
});

//* @public
/**
	_enyo.SpiralArranger_ is an [enyo.Arranger](#enyo.Arranger) that arranges
	controls in a spiral. The active control is positioned on top and the other
	controls are laid out in a spiral pattern below.

	Transitions between arrangements are handled by rotating the new control up
	from below and rotating the active control down to the end of the spiral.

	For more information, see the documentation on
	[Arrangers](building-apps/layout/arrangers.html) in the Enyo Developer Guide.
*/
enyo.kind({
	name: "enyo.SpiralArranger",
	kind: "Arranger",
	//* Always go through incremental arrangements when transitioning
	incrementalPoints: true,
	//* The amount of space between successive controls
	inc: 20,
	//* @protected
	size: function() {
		var c$ = this.container.getPanels();
		var b = this.containerBounds;
		var w = this.controlWidth = b.width/3;
		var h = this.controlHeight = b.height/3;
		for (var i=0, c; (c=c$[i]); i++) {
			c.setBounds({width: w, height: h});
		}
	},
	arrange: function(inC, inName) {
		var s = this.inc;
		for (var i=0, l=inC.length, c; (c=inC[i]); i++) {
			var x = Math.cos(i/l * 2*Math.PI) * i * s + this.controlWidth;
			var y = Math.sin(i/l * 2*Math.PI) * i * s + this.controlHeight;
			this.arrangeControl(c, {left: x, top: y});
		}
	},
	start: enyo.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);
			var c$ = this.getOrderedControls(this.container.toIndex);
			for (var i=0, c; (c=c$[i]); i++) {
				c.applyStyle("z-index", c$.length - i);
			}
		};
	}),
	calcArrangementDifference: function(inI0, inA0, inI1, inA1) {
		return this.controlWidth;
	},
	destroy: enyo.inherit(function(sup) {
		return function() {
			var c$ = this.container.getPanels();
			for (var i=0, c; (c=c$[i]); i++) {
				c.applyStyle("z-index", null);
				enyo.Arranger.positionControl(c, {left: null, top: null});
				c.applyStyle("left", null);
				c.applyStyle("top", null);
				c.applyStyle("height", null);
				c.applyStyle("width", null);
			}
			sup.apply(this, arguments);
		};
	})
});

//* @public
/**
	_enyo.GridArranger_ is an [enyo.Arranger](#enyo.Arranger) that arranges
	controls in a grid. The active control is positioned at the top-left of the
	grid and the other controls are laid out from left to right and then from
	top to bottom.

	Transitions between arrangements are handled by moving the active control to
	the end of the grid and shifting the other controls	to the left, or by
	moving it up to the previous row, to fill the space.

	For more information, see the documentation on
	[Arrangers](building-apps/layout/arrangers.html) in the Enyo Developer Guide.
*/
enyo.kind({
	name: "enyo.GridArranger",
	kind: "Arranger",
	//* Always go through incremental arrangements when transitioning
	incrementalPoints: true,
	//* @public
	//* Column width
	colWidth: 100,
	//* Column height
	colHeight: 100,
	//* @protected
	size: function() {
		var c$ = this.container.getPanels();
		var w=this.colWidth, h=this.colHeight;
		for (var i=0, c; (c=c$[i]); i++) {
			c.setBounds({width: w, height: h});
		}
	},
	arrange: function(inC, inIndex) {
		var w=this.colWidth, h=this.colHeight;
		var cols = Math.max(1, Math.floor(this.containerBounds.width / w));
		var c;
		for (var y=0, i=0; i<inC.length; y++) {
			for (var x=0; (x<cols) && (c=inC[i]); x++, i++) {
				this.arrangeControl(c, {left: w*x, top: h*y});
			}
		}
	},
	flowControl: enyo.inherit(function(sup) {
		return function(inControl, inA) {
			sup.apply(this, arguments);
			enyo.Arranger.opacifyControl(inControl, inA.top % this.colHeight !== 0 ? 0.25 : 1);
		};
	}),
	calcArrangementDifference: function(inI0, inA0, inI1, inA1) {
		return this.colWidth;
	},
	destroy: enyo.inherit(function(sup) {
		return function() {
			var c$ = this.container.getPanels();
			for (var i=0, c; (c=c$[i]); i++) {
				enyo.Arranger.positionControl(c, {left: null, top: null});
				c.applyStyle("left", null);
				c.applyStyle("top", null);
				c.applyStyle("height", null);
				c.applyStyle("width", null);
			}
			sup.apply(this, arguments);
		};
	})
});

/**
The _enyo.Panels_ kind is designed to satisfy a variety of common use cases
for application layout. Using _enyo.Panels_, controls may be arranged as
(among other things) a carousel, a set of collapsing panels, a card stack
that fades between panels, or a grid.

Any Enyo control may be placed inside an _enyo.Panels_, but by convention we
refer to each of these controls as a "panel". From the set of panels in an
_enyo.Panels_, one is considered to be active. The active panel is set by
index using the _setIndex()_ method. The actual layout of the panels
typically changes each time the active panel is set, such that the new
active panel has the most prominent position.

For more information, see the documentation on
[Panels](building-apps/layout/panels.html) in the Enyo Developer Guide.
*/
enyo.kind({
	name: "enyo.Panels",
	classes: "enyo-panels",
	published: {
		/**
			The index of the active panel. The layout of panels is controlled by
			the layoutKind, but as a rule, the active panel is displayed in the
			most prominent position. For example, in the (default) CardArranger
			layout, the active panel is shown and the other panels are hidden.
		*/
		index: 0,
		//* Controls whether the user can drag between panels.
		draggable: true,
		//* Controls whether the panels animate when transitioning; for example,
		//* when _setIndex_ is called.
		animate: true,
		//* Controls whether panels "wrap around" when moving past the end.
		//* The actual effect depends upon the arranger in use.
		wrap: false,
		//* Sets the arranger kind to be used for dynamic layout.
		arrangerKind: "CardArranger",
		//* By default, each panel will be sized to fit the Panels' width when
		//* the screen size is narrow enough (less than 800px). Set to false
		//* to avoid this behavior.
		narrowFit: true
	},
	events: {
		/**
			Fires at the start of a panel transition, when _setIndex_ is called
			and also during dragging.

			_inEvent.fromIndex_ contains the index of the old panel.

			_inEvent.toIndex_ contains the index of the new panel.
		*/
		onTransitionStart: "",
		/**
			Fires at the end of a panel transition, when _setIndex_ is called
			and also during dragging.

			_inEvent.fromIndex_ contains the index of the old panel.

			_inEvent.toIndex_ contains the index of the new panel.
		*/
		onTransitionFinish: ""
	},
	//* @protected
	handlers: {
		ondragstart: "dragstart",
		ondrag: "drag",
		ondragfinish: "dragfinish",
		onscroll: "domScroll"
	},
	tools: [
		{kind: "Animator", onStep: "step", onEnd: "completed"}
	],
	fraction: 0,
	create: enyo.inherit(function(sup) {
		return function() {
			this.transitionPoints = [];
			sup.apply(this, arguments);
			this.arrangerKindChanged();
			this.narrowFitChanged();
			this.indexChanged();
		};
	}),
	rendered: enyo.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);
			enyo.makeBubble(this, "scroll");
		};
	}),
	domScroll: function(inSender, inEvent) {
		if (this.hasNode()) {
			if (this.node.scrollLeft > 0) {
				// Reset scrollLeft position
				this.node.scrollLeft = 0;
			}
		}
	},
	initComponents: enyo.inherit(function(sup) {
		return function() {
			this.createChrome(this.tools);
			sup.apply(this, arguments);
		};
	}),
	arrangerKindChanged: function() {
		this.setLayoutKind(this.arrangerKind);
	},
	narrowFitChanged: function() {
		this.addRemoveClass("enyo-panels-fit-narrow", this.narrowFit && enyo.Panels.isScreenNarrow());
	},
	destroy: enyo.inherit(function(sup) {
		return function() {
			// When the entire panels is going away, take note so we don't try and do single-panel
			// remove logic such as changing the index and reflowing when each panel is destroyed
			this.destroying = true;
			sup.apply(this, arguments);
		};
	}),
	removeControl: enyo.inherit(function(sup) {
		return function(inControl) {
			// Skip extra work during panel destruction.
			if (this.destroying) {
				return sup.apply(this, arguments);
			}
			// adjust index if the current panel is being removed
			// so it's either the previous panel or the first one.
			var newIndex = -1;
			var controlIndex = enyo.indexOf(inControl, this.controls);
			if (controlIndex === this.index) {
				newIndex = Math.max(controlIndex - 1, 0);
			}
			sup.apply(this, arguments);
			if (newIndex !== -1 && this.controls.length > 0) {
				this.setIndex(newIndex);
				this.flow();
				this.reflow();
			}
		};
	}),
	isPanel: function() {
		// designed to be overridden in kinds derived from Panels that have
		// non-panel client controls
		return true;
	},
	flow: enyo.inherit(function(sup) {
		return function() {
			this.arrangements = [];
			sup.apply(this, arguments);
		};
	}),
	reflow: enyo.inherit(function(sup) {
		return function() {
			this.arrangements = [];
			sup.apply(this, arguments);
			this.refresh();
		};
	}),

	//* @public
	/**
		Returns an array of contained panels.
		Subclasses can override this if they don't want the arranger to layout all of their children
	*/
	getPanels: function() {
		var p = this.controlParent || this;
		return p.children;
	},
	//* Returns a reference to the active panel--i.e., the panel at the specified index.
	getActive: function() {
		var p$ = this.getPanels();
		//Constrain the index within the array of panels, needed if wrapping is enabled
		var index = this.index % p$.length;
		if (index < 0) {
			index += p$.length;
		}
		return p$[index];
	},
	/**
		Returns a reference to the <a href="#enyo.Animator">enyo.Animator</a>
		instance used to animate panel transitions. The Panels' animator can be used
		to set the duration of panel transitions, e.g.:

			this.getAnimator().setDuration(1000);
	*/
	getAnimator: function() {
		return this.$.animator;
	},
	/**
		Sets the active panel to the panel specified by the given index.
		Note that if the _animate_ property is set to true, the active panel
		will animate into view.
	*/
	setIndex: function(inIndex) {
		// override setIndex so that indexChanged is called
		// whether this.index has actually changed or not. Also, do
		// index clamping here.
		var prevIndex = this.get("index"),
			newIndex = this.clamp(inIndex);
		this.index = newIndex;
		this.notifyObservers("index", prevIndex, newIndex);
	},
	/**
		Sets the active panel to the panel specified by the given index.
		Regardless of the value of the _animate_ property, the transition to the
		next panel will not animate and will be immediate.
	*/
	setIndexDirect: function(inIndex) {
		this.setIndex(inIndex);
		this.completed();
	},
	/**
		Selects the named component owned by the Panels and returns its index.
	*/
	selectPanelByName: function(name) {
		if (!name) {
			return;
		}
		var idx = 0;
		var panels = this.getPanels();
		var len = panels.length;
		for (; idx < len; ++idx) {
			if (name === panels[idx].name) {
				this.setIndex(idx);
				return idx;
			}
		}
	},
	//* Transitions to the previous panel--i.e., the panel whose index value is
	//* one less than that of the current active panel.
	previous: function() {
		var prevIndex = this.index - 1;
		if (this.wrap && prevIndex < 0) {
			prevIndex = this.getPanels().length - 1;
		}
		this.setIndex(prevIndex);
	},
	//* Transitions to the next panel--i.e., the panel whose index value is one
	//* greater than that of the current active panel.
	next: function() {
		var nextIndex = this.index+1;
		if (this.wrap && nextIndex >= this.getPanels().length) {
			nextIndex = 0;
		}
		this.setIndex(nextIndex);
	},
	//* @protected
	clamp: function(inValue) {
		var l = this.getPanels().length;
		if (this.wrap) {
			// FIXME: dragging makes assumptions about direction and from->start indexes.
			//return inValue < 0 ? l : (inValue > l ? 0 : inValue);
			inValue %= l;
			return (inValue < 0) ? inValue + l : inValue;
		} else {
			return Math.max(0, Math.min(inValue, l - 1));
		}
	},
	indexChanged: function(inOld) {
		this.lastIndex = inOld;
		if (!this.dragging && this.$.animator) {
			if (this.$.animator.isAnimating()) {
				if (this.finishTransitionInfo) {
					this.finishTransitionInfo.animating = true;
				}
				this.completed();
			}
			this.$.animator.stop();
			if (this.hasNode()) {
				if (this.animate) {
					this.startTransition(true);
					this.$.animator.play({
						startValue: this.fraction
					});
				} else {
					this.refresh();
				}
			}
		}
	},
	step: function(inSender) {
		this.fraction = inSender.value;
		this.stepTransition();
		return true;
	},
	completed: function() {
		if (this.$.animator.isAnimating()) {
			this.$.animator.stop();
		}
		this.fraction = 1;
		this.stepTransition();
		this.finishTransition(true);
		return true;
	},
	dragstart: function(inSender, inEvent) {
		if (this.draggable && this.layout && this.layout.canDragEvent(inEvent)) {
			inEvent.preventDefault();
			this.dragstartTransition(inEvent);
			this.dragging = true;
			this.$.animator.stop();
			return true;
		}
	},
	drag: function(inSender, inEvent) {
		if (this.dragging) {
			inEvent.preventDefault();
			this.dragTransition(inEvent);
		}
	},
	dragfinish: function(inSender, inEvent) {
		if (this.dragging) {
			this.dragging = false;
			inEvent.preventTap();
			this.dragfinishTransition(inEvent);
		}
	},
	dragstartTransition: function(inEvent) {
		if (!this.$.animator.isAnimating()) {
			var f = this.fromIndex = this.index;
			this.toIndex = f - (this.layout ? this.layout.calcDragDirection(inEvent) : 0);
		} else {
			this.verifyDragTransition(inEvent);
		}
		this.fromIndex = this.clamp(this.fromIndex);
		this.toIndex = this.clamp(this.toIndex);
		//this.log(this.fromIndex, this.toIndex);
		this.fireTransitionStart();
		if (this.layout) {
			this.layout.start();
		}
	},
	dragTransition: function(inEvent) {
		// note: for simplicity we choose to calculate the distance directly between
		// the first and last transition point.
		var d = this.layout ? this.layout.calcDrag(inEvent) : 0;
		var t$ = this.transitionPoints, s = t$[0], f = t$[t$.length-1];
		var as = this.fetchArrangement(s);
		var af = this.fetchArrangement(f);
		var dx = this.layout ? this.layout.drag(d, s, as, f, af) : 0;
		var dragFail = d && !dx;
		if (dragFail) {
			//this.log(dx, s, as, f, af);
		}
		this.fraction += dx;
		var fr = this.fraction;
		if (fr > 1 || fr < 0 || dragFail) {
			if (fr > 0 || dragFail) {
				this.dragfinishTransition(inEvent);
			}
			this.dragstartTransition(inEvent);
			this.fraction = 0;
			// FIXME: account for lost fraction
			//this.dragTransition(inEvent);
		}
		this.stepTransition();
	},
	dragfinishTransition: function(inEvent) {
		this.verifyDragTransition(inEvent);
		this.setIndex(this.toIndex);
		// note: if we're still dragging, then we're at a transition boundary
		// and should fire the finish event
		if (this.dragging) {
			this.fireTransitionFinish();
		}
	},
	verifyDragTransition: function(inEvent) {
		var d = this.layout ? this.layout.calcDragDirection(inEvent) : 0;
		var f = Math.min(this.fromIndex, this.toIndex);
		var t = Math.max(this.fromIndex, this.toIndex);
		if (d > 0) {
			var s = f;
			f = t;
			t = s;
		}
		if (f != this.fromIndex) {
			this.fraction = 1 - this.fraction;
		}
		//this.log("old", this.fromIndex, this.toIndex, "new", f, t);
		this.fromIndex = f;
		this.toIndex = t;
	},
	refresh: function() {
		if (this.$.animator && this.$.animator.isAnimating()) {
			this.$.animator.stop();
		}
		this.startTransition(false);
		this.fraction = 1;
		this.stepTransition();
		this.finishTransition(false);
	},
	startTransition: function(sendEvents) {
		this.fromIndex = this.fromIndex != null ? this.fromIndex : this.lastIndex || 0;
		this.toIndex = this.toIndex != null ? this.toIndex : this.index;
		//this.log(this.id, this.fromIndex, this.toIndex);
		if (this.layout) {
			this.layout.start();
		}
		if (sendEvents) {
			this.fireTransitionStart();
		}
	},
	finishTransition: function(sendEvents) {
		if (this.layout) {
			this.layout.finish();
		}
		this.transitionPoints = [];
		this.fraction = 0;
		this.fromIndex = this.toIndex = null;
		if (sendEvents) {
			this.fireTransitionFinish();
		}
	},
	fireTransitionStart: function() {
		var t = this.startTransitionInfo;
		if (this.hasNode() && (!t || (t.fromIndex != this.fromIndex || t.toIndex != this.toIndex))) {
			this.startTransitionInfo = {fromIndex: this.fromIndex, toIndex: this.toIndex};
			this.doTransitionStart(enyo.clone(this.startTransitionInfo));
		}
	},
	fireTransitionFinish: function() {
		var t = this.finishTransitionInfo;
		if (this.hasNode() && (!t || (t.fromIndex != this.lastIndex || t.toIndex != this.index))) {
			if (t && t.animating) {
				this.finishTransitionInfo = {fromIndex: t.toIndex, toIndex: this.lastIndex};
			} else {
				this.finishTransitionInfo = {fromIndex: this.lastIndex, toIndex: this.index};
			}
			this.doTransitionFinish(enyo.clone(this.finishTransitionInfo));
		}
	},
	// gambit: we interpolate between arrangements as needed.
	stepTransition: function() {
		if (this.hasNode()) {
			// select correct transition points and normalize fraction.
			var t$ = this.transitionPoints;
			var r = (this.fraction || 0) * (t$.length-1);
			var i = Math.floor(r);
			r = r - i;
			var s = t$[i], f = t$[i+1];
			// get arrangements and lerp between them
			var s0 = this.fetchArrangement(s);
			var s1 = this.fetchArrangement(f);
			this.arrangement = s0 && s1 ? enyo.Panels.lerp(s0, s1, r) : (s0 || s1);
			if (this.arrangement && this.layout) {
				this.layout.flowArrangement();
			}
		}
	},
	fetchArrangement: function(inName) {
		if ((inName != null) && !this.arrangements[inName] && this.layout) {
			this.layout._arrange(inName);
			this.arrangements[inName] = this.readArrangement(this.getPanels());
		}
		return this.arrangements[inName];
	},
	readArrangement: function(inC) {
		var r = [];
		for (var i=0, c$=inC, c; (c=c$[i]); i++) {
			r.push(enyo.clone(c._arranger));
		}
		return r;
	},
	statics: {
		//* @public
		/**
			Returns true depending on detection of iOS and Android phone form factors,
			or when window width is 800px or less.
		*/
		isScreenNarrow: function() {
			var ua = navigator.userAgent, w = enyo.dom.getWindowWidth();
			switch (enyo.platform.platformName) {
				case "ios":
					return (/iP(?:hone|od;(?: U;)? CPU) OS (\d+)/).test(ua);
				case "android":
					return (/Mobile/).test(ua) && (enyo.platform.android > 2 ? true : w <= 800);
				case "androidChrome":
					return (/Mobile/).test(ua);
			}
			return w <= 800;
		},
		//* @protected
		lerp: function(inA0, inA1, inFrac) {
			var r = [];
			for (var i=0, k$=enyo.keys(inA0), k; (k=k$[i]); i++) {
				r.push(this.lerpObject(inA0[k], inA1[k], inFrac));
			}
			return r;
		},
		lerpObject: function(inNew, inOld, inFrac) {
			var b = enyo.clone(inNew), n, o;
			// inOld might be undefined when deleting panels
			if (inOld) {
				for (var i in inNew) {
					n = inNew[i];
					o = inOld[i];
					if (n != o) {
						b[i] = n - (n - o) * inFrac;
					}
				}
			}
			return b;
		}
	}
});

/**
	_enyo.Node_ is a control that creates structured trees based on Enyo's child
	component hierarchy format, e.g.:

		{kind: "Node", icon: "images/folder-open.png", content: "Tree",
			expandable: true, expanded: true, components: [
				{icon: "images/file.png", content: "Alpha"},
				{icon: "images/folder-open.png", content: "Bravo",
					expandable: true, expanded: false, components: [
						{icon: "images/file.png", content: "Bravo-Alpha"},
						{icon: "images/file.png", content: "Bravo-Bravo"},
						{icon: "images/file.png", content: "Bravo-Charlie"}
					]
				}
			]
		}

	The default kind of components within a node is itself _enyo.Node_, so only
	the	top-level node of the tree needs to be explicitly defined as such.

	When an expandable tree node expands, an _onExpand_ event is sent; when it
	is tapped, a _nodeTap_ event is sent.

	When the optional property _onlyIconExpands_ is set to true, expandable
	nodes may only be opened by tapping the icon; tapping the content label
	will fire the _nodeTap_ event, but will not expand the node.
*/

enyo.kind({
	name: "enyo.Node",
	published: {
		//* @public
		//* Whether or not the Node is expandable and has child branches
		expandable: false,
		//* Open/closed state of the current Node
		expanded: false,
		//* Path to image to be used as the icon for this Node
		icon: "",
		/**
			Optional flag that, when true, causes the Node to expand only when
			the icon is tapped; not when the contents are tapped
		*/
		onlyIconExpands: false,
		//* @protected
		//* Adds or removes the Enyo-selected CSS class.
		selected: false
	},
	style: "padding: 0 0 0 16px;",
	content: "Node",
	defaultKind: "Node",
	classes: "enyo-node",
	components: [
		{name: "icon", kind: "Image", showing: false},
		{kind: "Control", name: "caption", Xtag: "span", style: "display: inline-block; padding: 4px;", allowHtml: true},
		{kind: "Control", name: "extra", tag: 'span', allowHtml: true}
	],
	childClient: [
		{kind: "Control", name: "box", classes: "enyo-node-box", Xstyle: "border: 1px solid orange;", components: [
			{kind: "Control", name: "client", classes: "enyo-node-client", Xstyle: "border: 1px solid lightblue;"}
		]}
	],
	handlers: {
		ondblclick: "dblclick"
	},
	events: {
		//* @public
		//* Fired when the Node is tapped
		onNodeTap: "nodeTap",
		//* Fired when the Node is double-clicked
		onNodeDblClick: "nodeDblClick",
		/**
			Fired when the Node expands or contracts, as indicated by the
			'expanded' property in the event data
		*/
		onExpand: "nodeExpand",
		//* Fired when the Node is destroyed
		onDestroyed: "nodeDestroyed"
	},
	//
	//* @protected
	create: enyo.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);
			//this.expandedChanged();
			//this.levelChanged();
			this.selectedChanged();
			this.iconChanged();
		};
	}),
	destroy: enyo.inherit(function(sup) {
		return function() {
			this.doDestroyed();
			sup.apply(this, arguments);
		};
	}),
	initComponents: enyo.inherit(function(sup) {
		return function() {
			// TODO: optimize to create the childClient on demand
			//this.hasChildren = this.components;
			if (this.expandable) {
				this.kindComponents = this.kindComponents.concat(this.childClient);
			}
			sup.apply(this, arguments);
		};
	}),
	//
	contentChanged: function() {
		//this.$.caption.setContent((this.expandable ? (this.expanded ? "-" : "+") : "") + this.content);
		this.$.caption.setContent(this.content);
	},
	iconChanged: function() {
		this.$.icon.setSrc(this.icon);
		this.$.icon.setShowing(Boolean(this.icon));
	},
	selectedChanged: function() {
		this.addRemoveClass("enyo-selected", this.selected);
	},
	rendered: enyo.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);
			if (this.expandable && !this.expanded) {
				this.quickCollapse();
			}
		};
	}),
	//
	addNodes: function(inNodes) {
		this.destroyClientControls();
		for (var i=0, n; (n=inNodes[i]); i++) {
			this.createComponent(n);
		}
		this.$.client.render();
	},
	addTextNodes: function(inNodes) {
		this.destroyClientControls();
		for (var i=0, n; (n=inNodes[i]); i++) {
			this.createComponent({content: n});
		}
		this.$.client.render();
	},
	//
	tap: function(inSender, inEvent) {
		if(!this.onlyIconExpands) {
			this.toggleExpanded();
			this.doNodeTap();
		} else {
			if((inEvent.target==this.$.icon.hasNode())) {
				this.toggleExpanded();
			} else {
				this.doNodeTap();
			}
		}
		return true;
	},
	dblclick: function(inSender, inEvent) {
		this.doNodeDblClick();
		return true;
	},
	//
	toggleExpanded: function() {
		this.setExpanded(!this.expanded);
	},
	quickCollapse: function() {
		this.removeClass("enyo-animate");
		this.$.box.applyStyle("height", "0");
		var h = this.$.client.getBounds().height;
		this.$.client.setBounds({top: -h});
	},
	_expand: function() {
		this.addClass("enyo-animate");
		var h = this.$.client.getBounds().height;
		this.$.box.setBounds({height: h});
		this.$.client.setBounds({top: 0});
		setTimeout(this.bindSafely(function() {
			// things may have happened in the interim, make sure
			// we only fix height if we are still expanded
			if (this.expanded) {
				this.removeClass("enyo-animate");
				this.$.box.applyStyle("height", "auto");
			}
		}), 225);
	},
	_collapse: function() {
		// disable transitions
		this.removeClass("enyo-animate");
		// fix the height of our box (rather than 'auto'), this
		// gives webkit something to lerp from
		var h = this.$.client.getBounds().height;
		this.$.box.setBounds({height: h});
		// yield the thead so DOM can make those changes (without transitions)
		setTimeout(this.bindSafely(function() {
			// enable transitions
			this.addClass("enyo-animate");
			// shrink our box to 0
			this.$.box.applyStyle("height", "0");
			// slide the contents up
			this.$.client.setBounds({top: -h});
		}), 25);
	},
	expandedChanged: function(inOldExpanded) {
		if (!this.expandable) {
			this.expanded = false;
		} else {
			var event = {expanded: this.expanded};
			this.doExpand(event);
			if (!event.wait) {
				this.effectExpanded();
			}
		}
	},
	effectExpanded: function() {
		if (this.$.client) {
			if (!this.expanded) {
				this._collapse();
			} else {
				this._expand();
			}
		}
		//this.contentChanged();
	}
});


/**
	_enyo.PanZoomView_ is a control that displays arbitrary content at a given
	scaling factor, with enhanced support for double-tap/double-click to zoom,
	panning, mousewheel zooming and pinch-zoom (on touchscreen devices that
	support it).

		{kind: "PanZoomView", scale: "auto", contentWidth: 500, contentHeight: 500,
			style: "width:500px; height:400px;",
			components: [{content: "Hello World"}]
		}

	An _onZoom_ event is triggered when the user changes the zoom level.

	If you wish, you may add <a href="#enyo.ScrollThumb">enyo.ScrollThumb</a>
	indicators, disable zoom animation, allow panning overscroll (with a
	bounce-back effect), and control the propagation of drag events, all via
	boolean properties.

	For the PanZoomView to work, you must either specify the width and height of
	the scaled content (via the _contentWidth_ and _contentHeight_ properties) or
	bubble an _onSetDimensions_ event from one of the underlying components.

	Note that it's best to specify a size for the PanZoomView in order to avoid
	complications.
*/

enyo.kind({
	name: "enyo.PanZoomView",
	kind: enyo.Scroller,
	/**
		If true, allows for overscrolling during panning, with a bounce-back
		effect. (Defaults to false.)
	*/
	touchOverscroll: false,
	/**
		If true, a ScrollThumb is used to indicate scroll position/bounds.
		(Defaults to false.)
	*/
	thumb: false,
	/**
		If true (the default), animates the zoom action triggered by a double-tap
		(or double-click)
	*/
	animate: true,
	/**
		If true (the default), allows propagation of vertical drag events when
		already at the top or bottom of the pannable area
	*/
	verticalDragPropagation: true,
	/**
		If true (the default), allows propagation of horizontal drag events when
		already at the left or right edge of the pannable area
	*/
	horizontalDragPropagation: true,
	published: {
		/**
			The scale at which the content should be displayed. This may be any
			positive numeric value or one of the following key words (which will
			be resolved to a value dynamically):

			* "auto": Fits the content to the size of the PanZoomView
			* "width": Fits the content the width of the PanZoomView
			* "height": Fits the content to the height of the PanZoomView
			* "fit": Fits the content to the height and width of the PanZoomView.
				Overflow of the larger dimension is cropped and the content is centered
				on this axis
		*/
		scale: "auto",
		//* If true, disables the zoom functionality
		disableZoom: false
	},
	events: {
		/**
			Fires whenever the user adjusts the zoom via double-tap/double-click,
			mousewheel, or pinch-zoom.

			_inEvent.scale_ contains the new scaling factor.
		*/
		onZoom:""
	},
	//* @protected
	touch: true,
	preventDragPropagation: false,
	handlers: {
		ondragstart: "dragPropagation",
		onSetDimensions: "setDimensions"
	},
	components:[
		{
			name: "animator",
			kind: "Animator",
			onStep: "zoomAnimationStep",
			onEnd: "zoomAnimationEnd"
		},
		{
			name:"viewport",
			style:"overflow:hidden;min-height:100%;min-width:100%;",
			classes:"enyo-fit",
			ongesturechange: "gestureTransform",
			ongestureend: "saveState",
			ontap: "singleTap",
			ondblclick:"doubleClick",
			onmousewheel:"mousewheel",
			components:[
				{name: "content"}
			]
		}
	],
	create: enyo.inherit(function(sup) {
		return function() {
			// remember scale keyword
			this.scaleKeyword = this.scale;

			// Cache instance components
			var instanceComponents = this.components;
			this.components = [];
			sup.apply(this, arguments);
			this.$.content.applyStyle("width", this.contentWidth + "px");
			this.$.content.applyStyle("height", this.contentHeight + "px");

			if(this.unscaledComponents){
				var owner = this.hasOwnProperty("unscaledComponents") ? this.getInstanceOwner() : this;
				this.createComponents(this.unscaledComponents, {owner: owner});
			}

			// Change controlParentName so PanZoomView instance components are created into viewport
			this.controlParentName = "content";
			this.discoverControlParent();
			this.createComponents(instanceComponents);

			this.canTransform = enyo.dom.canTransform();
			if(!this.canTransform) {
				this.$.content.applyStyle("position", "relative");
			}
			this.canAccelerate = enyo.dom.canAccelerate();

			//	For panzoomview, disable drags during gesture (to fix flicker: ENYO-1208)
			this.getStrategy().setDragDuringGesture(false);
		};
	}),
	rendered: enyo.inherit(function(sup) {
		return function(){
			sup.apply(this, arguments);
			this.getOriginalScale();
		};
	}),
	dragPropagation: function(inSender, inEvent) {
		// Propagate drag events at the edges of the content as desired by the
		// verticalDragPropagation and horizontalDragPropagation properties
		var bounds = this.getStrategy().getScrollBounds();
		var verticalEdge = ((bounds.top===0 && inEvent.dy>0) || (bounds.top>=bounds.maxTop-2 && inEvent.dy<0));
		var horizontalEdge = ((bounds.left===0 && inEvent.dx>0) || (bounds.left>=bounds.maxLeft-2 && inEvent.dx<0));
		return !((verticalEdge && this.verticalDragPropagation) || (horizontalEdge && this.horizontalDragPropagation));
	},
	mousewheel: function(inSender, inEvent) {
		inEvent.pageX |= (inEvent.clientX + inEvent.target.scrollLeft);
		inEvent.pageY |= (inEvent.clientY + inEvent.target.scrollTop);
		var zoomInc = (this.maxScale - this.minScale)/10;
		var oldScale = this.scale;
		if((inEvent.wheelDelta > 0) || (inEvent.detail < 0)) { //zoom in
			this.scale = this.limitScale(this.scale + zoomInc);
		} else if((inEvent.wheelDelta < 0) || (inEvent.detail > 0)) { //zoom out
			this.scale = this.limitScale(this.scale - zoomInc);
		}
		this.eventPt = this.calcEventLocation(inEvent);
		this.transform(this.scale);
		if(oldScale != this.scale) {
			this.doZoom({scale:this.scale});
		}
		this.ratioX = this.ratioY = null;
		// Prevent default scroll wheel action and prevent event from bubbling up to to touch scroller
		inEvent.preventDefault();
		return true;
	},
	resizeHandler: enyo.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);
			this.scaleChanged();
		};
	}),
	setDimensions: function(inSender, inEvent){
		this.$.content.applyStyle("width", inEvent.width + "px");
		this.$.content.applyStyle("height", inEvent.height + "px");
		this.originalWidth = inEvent.width;
		this.originalHeight = inEvent.height;
		this.scale = this.scaleKeyword;
		this.scaleChanged();
		return true;
	},
	getOriginalScale : function(){
		if(this.$.content.hasNode()){
			this.originalWidth  = this.$.content.node.clientWidth;
			this.originalHeight = this.$.content.node.clientHeight;
			this.scale = this.scaleKeyword;
			this.scaleChanged();
		}
	},
	scaleChanged: function() {
		var containerNode = this.hasNode();
		if(containerNode) {
			this.containerWidth = containerNode.clientWidth;
			this.containerHeight = containerNode.clientHeight;
			var widthScale = this.containerWidth / this.originalWidth;
			var heightScale = this.containerHeight / this.originalHeight;
			this.minScale = Math.min(widthScale, heightScale);
			this.maxScale = (this.minScale*3 < 1) ? 1 : this.minScale*3;
			//resolve any keyword scale values to solid numeric values
			if(this.scale == "auto") {
				this.scale = this.minScale;
			} else if(this.scale == "width") {
				this.scale = widthScale;
			} else if(this.scale == "height") {
				this.scale = heightScale;
			} else if(this.scale == "fit") {
				this.fitAlignment = "center";
				this.scale = Math.max(widthScale, heightScale);
			} else {
				this.maxScale = Math.max(this.maxScale, this.scale);
				this.scale = this.limitScale(this.scale);
			}
		}
		this.eventPt = this.calcEventLocation();
		this.transform(this.scale);
		// start scroller
		if(this.getStrategy().$.scrollMath) {
			this.getStrategy().$.scrollMath.start();
		}
		this.align();
	},
	align: function() {
		if (this.fitAlignment && this.fitAlignment === "center") {
			var sb = this.getScrollBounds();
			this.setScrollLeft(sb.maxLeft / 2);
			this.setScrollTop(sb.maxTop / 2);
		}
	},
	gestureTransform: function(inSender, inEvent) {
		this.eventPt = this.calcEventLocation(inEvent);
		this.transform(this.limitScale(this.scale * inEvent.scale));
	},
	calcEventLocation: function(inEvent) {
		//determine the target coordinates on the panzoomview from an event
		var eventPt = {x: 0, y:0};
		if(inEvent && this.hasNode()) {
			var rect = this.node.getBoundingClientRect();
			eventPt.x = Math.round((inEvent.pageX - rect.left) - this.bounds.x);
			eventPt.x = Math.max(0, Math.min(this.bounds.width, eventPt.x));
			eventPt.y = Math.round((inEvent.pageY - rect.top) - this.bounds.y);
			eventPt.y = Math.max(0, Math.min(this.bounds.height, eventPt.y));
		}
		return eventPt;
	},
	transform: function(scale) {
		this.tapped = false;

		var prevBounds = this.bounds || this.innerBounds(scale);
		this.bounds = this.innerBounds(scale);

		//style cursor if needed to indicate the content is movable
		if(this.scale>this.minScale) {
			this.$.viewport.applyStyle("cursor", "move");
		} else {
			this.$.viewport.applyStyle("cursor", null);
		}
		this.$.viewport.setBounds({width: this.bounds.width + "px", height: this.bounds.height + "px"});

		//determine the exact ratio where on the content was tapped
		this.ratioX = this.ratioX || (this.eventPt.x + this.getScrollLeft()) / prevBounds.width;
		this.ratioY = this.ratioY || (this.eventPt.y + this.getScrollTop()) / prevBounds.height;
		var scrollLeft, scrollTop;
		if(this.$.animator.ratioLock) { //locked for smartzoom
			scrollLeft = (this.$.animator.ratioLock.x * this.bounds.width) - (this.containerWidth / 2);
			scrollTop = (this.$.animator.ratioLock.y * this.bounds.height) - (this.containerHeight / 2);
		} else {
			scrollLeft = (this.ratioX * this.bounds.width) - this.eventPt.x;
			scrollTop = (this.ratioY * this.bounds.height) - this.eventPt.y;
		}
		scrollLeft = Math.max(0, Math.min((this.bounds.width - this.containerWidth), scrollLeft));
		scrollTop = Math.max(0, Math.min((this.bounds.height - this.containerHeight), scrollTop));

		if(this.canTransform) {
			var params = {scale: scale};
			// translate needs to be first, or scale and rotation will not be in the correct spot
			if(this.canAccelerate) {
				//translate3d rounded values to avoid distortion; ref: http://martinkool.com/post/27618832225/beware-of-half-pixels-in-css
				params = enyo.mixin({translate3d: Math.round(this.bounds.left) + "px, " + Math.round(this.bounds.top) + "px, 0px"}, params);
			} else {
				params = enyo.mixin({translate: this.bounds.left + "px, " + this.bounds.top + "px"}, params);
			}
			enyo.dom.transform(this.$.content, params);
		} else if (enyo.platform.ie) {
			// IE8 does not support transforms, but filter should work
			// http://www.useragentman.com/IETransformsTranslator/
			var matrix = "\"progid:DXImageTransform.Microsoft.Matrix(M11="+scale+", M12=0, M21=0, M22="+scale+", SizingMethod='auto expand')\"";
			this.$.content.applyStyle("-ms-filter", matrix);
			this.$.content.setBounds({width: this.bounds.width*scale + "px", height: this.bounds.height*scale + "px",
					left:this.bounds.left + "px", top:this.bounds.top + "px"});
			this.$.content.applyStyle("width", scale*this.bounds.width);
			this.$.content.applyStyle("height", scale*this.bounds.height);
		} else {
			// ...no transforms and not IE... there's nothin' I can do.
		}

		//adjust scroller to new position that keeps ratio with the new content size
		this.setScrollLeft(scrollLeft);
		this.setScrollTop(scrollTop);

		this.positionClientControls(scale);

		//this.stabilize();
	},
	limitScale: function(scale) {
		if(this.disableZoom) {
			scale = this.scale;
		} else if(scale > this.maxScale) {
			scale = this.maxScale;
		} else if(scale < this.minScale) {
			scale = this.minScale;
		}
		return scale;
	},
	innerBounds: function(scale) {
		var width = this.originalWidth * scale;
		var height = this.originalHeight * scale;
		var offset = {x:0, y:0, transX:0, transY:0};
		if(width<this.containerWidth) {
			offset.x += (this.containerWidth - width)/2;
		}
		if(height<this.containerHeight) {
			offset.y += (this.containerHeight - height)/2;
		}
		if(this.canTransform) { //adjust for the css translate, which doesn't alter content offsetWidth and offsetHeight
			offset.transX -= (this.originalWidth - width)/2;
			offset.transY -= (this.originalHeight - height)/2;
		}
		return {left:offset.x + offset.transX, top:offset.y + offset.transY, width:width, height:height, x:offset.x, y:offset.y};
	},
	saveState: function(inSender, inEvent) {
		var oldScale = this.scale;
		this.scale *= inEvent.scale;
		this.scale = this.limitScale(this.scale);
		if(oldScale != this.scale) {
			this.doZoom({scale:this.scale});
		}
		this.ratioX = this.ratioY = null;
	},
	doubleClick: function(inSender, inEvent) {
		//IE 8 fix; dblclick fires rather than multiple successive click events
		if(enyo.platform.ie==8) {
			this.tapped = true;
			//normalize event
			inEvent.pageX = inEvent.clientX + inEvent.target.scrollLeft;
			inEvent.pageY = inEvent.clientY + inEvent.target.scrollTop;
			this.singleTap(inSender, inEvent);
			inEvent.preventDefault();
		}
	},
	singleTap: function(inSender, inEvent) {
		setTimeout(this.bindSafely(function() {
			this.tapped = false;
		}), 300);
		if(this.tapped) { //dbltap
			this.tapped = false;
			this.smartZoom(inSender, inEvent);
		} else {
			this.tapped = true;
		}
	},
	smartZoom: function(inSender, inEvent) {
		var containerNode = this.hasNode();
		var imgNode = this.$.content.hasNode();
		if(containerNode && imgNode && this.hasNode() && !this.disableZoom) {
			var prevScale = this.scale;
			if(this.scale!=this.minScale) { //zoom out
				this.scale = this.minScale;
			} else { //zoom in
				this.scale = this.maxScale;
			}
			this.eventPt = this.calcEventLocation(inEvent);
			if(this.animate) {
				//lock ratio position of event, and animate the scale change
				var ratioLock = {
					x: ((this.eventPt.x + this.getScrollLeft()) / this.bounds.width),
					y: ((this.eventPt.y + this.getScrollTop()) / this.bounds.height)
				};
				this.$.animator.play({
					duration:350,
					ratioLock: ratioLock,
					baseScale:prevScale,
					deltaScale:this.scale - prevScale
				});
			} else {
				this.transform(this.scale);
				this.doZoom({scale:this.scale});
			}
		}
	},
	zoomAnimationStep: function(inSender, inEvent) {
		var currScale = this.$.animator.baseScale + (this.$.animator.deltaScale * this.$.animator.value);
		this.transform(currScale);
		return true;
	},
	zoomAnimationEnd: function(inSender, inEvent) {
		this.stabilize();
		this.doZoom({scale:this.scale});
		this.$.animator.ratioLock = undefined;
		return true;
	},
	positionClientControls: function(scale) {
		this.waterfallDown("onPositionPin", {
			scale: scale,
			bounds: this.bounds
		});
	}
});


/**
    _enyo.ImageViewPin_ is a control that can be used to display non-zooming
    content inside of a zoomable _enyo.ImageView_ control. The _anchor_ and
    _position_ properties can be used to position both the ImageViewPin and	its
    content in a specific location inside of the ImageView.
*/
enyo.kind({
	name: "enyo.ImageViewPin",
	kind: "enyo.Control",
	published: {
		/**
			If true, the anchor point for this pin will be highlighted in yellow,
			which can be useful for debugging. Defaults to false.
		*/
		highlightAnchorPoint: false,
		/**
			The coordinates at which this control should be anchored inside
			of the parent ImageView control. This position is relative to the
			ImageView control's original size. Works like standard CSS positioning,
			and accepts both px and percentage values. Defaults to _{top: 0px,
			left: 0px}_.

			* top: distance from the parent's top edge
			* bottom: distance from the parent's bottom edge (overrides top)
			* left: distance from the parent's left edge
			* right: distance from the parennt's right edge (overrides left)
		*/
		anchor: {
			top: 0,
			left: 0
		},
		/**
			The coordinates at which the contents of this control should be
			positioned relative to the ImageViewPin itself. Works like standard
			CSS positioning. Only accepts px values. Defaults to _{top: 0px,
			left: 0px}_.

			* top: distance from the ImageViewPin's top edge
			* bottom: distance from the ImageViewPin's bottom edge
			* left: distance from the ImageViewPin's left edge
			* right: distance from the ImageViewPin's right edge
		*/
		position: {
			top: 0,
			left: 0
		}
	},
	//* @protected
	style: "position:absolute;z-index:1000;width:0px;height:0px;",
	handlers: {
		onPositionPin: "reAnchor"
	},
	create: enyo.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);
			this.styleClientControls();
			this.positionClientControls();
			this.highlightAnchorPointChanged();
			this.anchorChanged();
		};
	}),
	// Absolutely position to client controls
	styleClientControls: function() {
		var controls = this.getClientControls();
		for (var i=0;i<controls.length;i++) {
			controls[i].applyStyle("position","absolute");
		}
	},
	// Apply specified positioning to client controls
	positionClientControls: function() {
		var controls = this.getClientControls();
		for (var i=0;i<controls.length;i++) {
			for (var p in this.position) {
				controls[i].applyStyle(p, this.position[p]+"px");
			}
		}
	},
	// Update styling on anchor point
	highlightAnchorPointChanged: function() {
		this.addRemoveClass("pinDebug", this.highlightAnchorPoint);
	},
	// Create coords{} object for each anchor containing value and units
	anchorChanged: function() {
		var coords = null, a = null;
		for (a in this.anchor) {
			coords = this.anchor[a].toString().match(/^(\d+(?:\.\d+)?)(.*)$/);
			if (!coords) {
				continue;
			}
			this.anchor[a+"Coords"] = {
				value: coords[1],
				units: coords[2] || "px"
			};
		}
	},
	/*
		Apply positioning to ImageViewPin specified in this.anchor{}.
		Called anytime the parent ImageView is rescaled. If right/bottom
		are specified, they override top/left.
	*/
	reAnchor: function(inSender, inEvent) {
		var scale = inEvent.scale;
		var bounds = inEvent.bounds;
		var left = (this.anchor.right)
			// Right
			? (this.anchor.rightCoords.units == "px")
				? (bounds.width + bounds.x - this.anchor.rightCoords.value*scale)
				: (bounds.width*(100-this.anchor.rightCoords.value)/100 + bounds.x)
			// Left
			: (this.anchor.leftCoords.units == "px")
				? (this.anchor.leftCoords.value*scale + bounds.x)
				: (bounds.width*this.anchor.leftCoords.value/100 + bounds.x);
		var top = (this.anchor.bottom)
			// Bottom
			? (this.anchor.bottomCoords.units == "px")
				? (bounds.height + bounds.y - this.anchor.bottomCoords.value*scale)
				: (bounds.height*(100-this.anchor.bottomCoords.value)/100 + bounds.y)
			// Top
			: (this.anchor.topCoords.units == "px")
				? (this.anchor.topCoords.value*scale + bounds.y)
				: (bounds.height*this.anchor.topCoords.value/100 + bounds.y);
		this.applyStyle("left", left+"px");
		this.applyStyle("top", top+"px");
	}
});

/**
	_enyo.ImageView_ is a control that displays an image at a given scaling
	factor, with enhanced support for double-tap/double-click to zoom, panning,
	mousewheel zooming and pinch-zoom (on touchscreen devices that support it).

		{kind: "ImageView", src: "assets/globe.jpg", scale: "auto",
			style: "width:500px; height:400px;"}

	The _onload_ and _onerror_ events bubble up from the underlying image
	element	and an _onZoom_ event is triggered when the user changes the zoom
	level of the image.

	If you wish, you may add <a href="#enyo.ScrollThumb">enyo.ScrollThumb</a>
	indicators, disable zoom animation, allow panning overscroll (with a
	bounce-back effect), and control the propagation of drag events, all via
	boolean properties.

	Note that it's best to specify a size for the ImageView in order to avoid
	complications.
*/
enyo.kind({
	name: "enyo.ImageView",
	kind: "enyo.PanZoomView",
	subKindComponents: [
		{kind:"Image", ondown: "down", style: "vertical-align: text-top;"}
	],
	create: enyo.inherit(function(sup) {
		return function() {
			// move components (most likely imageViewPins) to unscaledComponents
			this.unscaledComponents = this.components;
			this.components = [];

			//amend kindComponents
			this.kindComponents[1].components[0].components = this.subKindComponents;

			sup.apply(this, arguments);

			// set content as inline-block to mimic behaviour of an image
			this.$.content.applyStyle("display", "inline-block");

			//offscreen buffer image to get initial image dimensions
			//before displaying a scaled down image that can fit in the container
			this.bufferImage = new Image();
			this.bufferImage.onload = enyo.bind(this, "imageLoaded");
			this.bufferImage.onerror = enyo.bind(this, "imageError");
			this.srcChanged();
			//	Needed to kickoff pin redrawing (otherwise they wont' redraw on intitial scroll)
			if(this.getStrategy().$.scrollMath) {
				this.getStrategy().$.scrollMath.start();
			}
		};
	}),
	destroy: enyo.inherit(function(sup) {
		return function() {
			if (this.bufferImage) {
				this.bufferImage.onerror = undefined;
				this.bufferImage.onerror = undefined;
				delete this.bufferImage;
			}
			sup.apply(this, arguments);
		};
	}),
	down: function(inSender, inEvent) {
		// Fix to prevent image drag in Firefox
		inEvent.preventDefault();
	},
	srcChanged: function() {
		if(this.src && this.src.length>0 && this.bufferImage && this.src!=this.bufferImage.src) {
			this.bufferImage.src = this.src;
		}
	},
	imageLoaded: function(inEvent) {
		this.scale = this.scaleKeyword;
		this.originalWidth = this.contentWidth = this.bufferImage.width;
		this.originalHeight = this.contentHeight = this.bufferImage.height;

		//scale to fit before setting src, so unscaled image isn't visible
		this.scaleChanged();
		this.$.image.setSrc(this.bufferImage.src);
		
		// There appears to be a bug in Safari where due to the translation of these elements it
		// doesn't correctly render unless prodded
		if (enyo.platform.safari) {
			var n = this.$.image.hasNode()
				, src = this.bufferImage.src;
			if (n) {
				setTimeout(function () { n.src = src; }, 100);
			}
		}

		//Needed to ensure scroller contents height/width is calculated correctly when contents use enyo-fit
		enyo.dom.transformValue(this.getStrategy().$.client, "translate3d", "0px, 0px, 0");

		this.positionClientControls(this.scale);
		this.align();
	},
	imageError: function(inEvent) {
		enyo.error("Error loading image: " + this.src);
		//bubble up the error event
		this.bubble("onerror", inEvent);
	}
});

/**
	_enyo.ImageCarousel_ is an <a href="#enyo.Panels">enyo.Panels</a> that
	uses <a href="#enyo.CarouselArranger">enyo.CarouselArranger</a> as its
	arrangerKind. An ImageCarousel dynamically creates and loads instances of
	<a href="#enyo.ImageView">enyo.ImageView</a> as needed, creating a gallery
	of images.

		{kind:"ImageCarousel", images:[
			"assets/mercury.jpg",
			"assets/venus.jpg",
			"assets/earth.jpg",
			"assets/mars.jpg",
			"assets/jupiter.jpg",
			"assets/saturn.jpg",
			"assets/uranus.jpg",
			"assets/neptune.jpg"
		], defaultScale:"auto"},

	All of the events (_onload_, _onerror_, and _onZoom_) from the contained
	ImageView objects are bubbled up to the ImageCarousel, which also inherits
	the _onTransitionStart_ and _onTransitionFinish_ events from _enyo.Panels_.

	The _images_ property is an array containing the file paths of the images in
	the gallery.  The _images_ array may be altered and updated at any time, and
	the current index may be manipulated at runtime via the inherited
	_getIndex()_ and _setIndex()_ functions.

	Note that it's best to specify a size for the ImageCarousel in order to
	avoid complications.
*/

enyo.kind({
	name: "enyo.ImageCarousel",
	kind: enyo.Panels,
	arrangerKind: "enyo.CarouselArranger",
	/**
		The default scale value to be applied to each ImageView. Can be "auto",
		"width", "height", or any positive numeric value.
	*/
	defaultScale: "auto",
	//* If true, ImageView instances are created with zooming disabled.
	disableZoom:  false,
	/**
		If true, any ImageViews that are not in the immediate viewing area
		(i.e., the currently active image and the first image on either
		side of it) will be destroyed to free up memory. This has the benefit of
		using minimal memory (which is good for mobile devices), but has the
		downside that, if you want to view the images again, the ImageViews will
		have to be re-created and the images re-fetched (thus increasing the
		number of image-related GET calls). Defaults to false.
	*/
	lowMemory: false,
	published: {
		//* Array of image source file paths
		images:[]
	},
	//* @protected
	handlers: {
		onTransitionStart: "transitionStart",
		onTransitionFinish: "transitionFinish"
	},
	create: enyo.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);
			this.imageCount = this.images.length;
			if (this.images.length>0) {
				this.initContainers();
				this.loadNearby();
			}
		};
	}),
	initContainers: function() {
		for (var i=0; i<this.images.length; i++) {
			if (!this.$["container" + i]) {
				this.createComponent({
					name: "container" + i,
					style: "height:100%; width:100%;"
				});
				this.$["container" + i].render();
			}
		}
		for (i=this.images.length; i<this.imageCount; i++) {
			if (this.$["image" + i]) {
				this.$["image" + i].destroy();
			}
			this.$["container" + i].destroy();
		}
		this.imageCount = this.images.length;
	},
	loadNearby: function() {
		var range = this.getBufferRange();
		for (var i in range) {
			this.loadImageView(range[i]);
		}
	},
	getBufferRange: function() {
		var range = [];
		if (this.layout.containerBounds) {
			var prefetchRange = 1;
			var bounds = this.layout.containerBounds;
			var c, i, x, xEnd;
			// get the lower range
			i=this.index-1;
			x=0;
			xEnd = bounds.width * prefetchRange;
			while (i>=0 && x<=xEnd) {
				c = this.$["container" + i];
				x+= c.width + c.marginWidth;
				range.unshift(i);
				i--;
			}
			// get the upper range
			i=this.index;
			x=0;
			xEnd = bounds.width * (prefetchRange + 1);
			while (i<this.images.length && x<=xEnd) {
				c = this.$["container" + i];
				x+= c.width + c.marginWidth;
				range.push(i);
				i++;
			}
		}
		return range;
	},
	reflow: enyo.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);
			this.loadNearby();
		};
	}),
	loadImageView: function(index) {
		// NOTE: wrap bugged in enyo.CarouselArranger, but once fixed, wrap should work in this
		if (this.wrap) {
			// Used this modulo technique to get around javascript issue with negative values
			// ref: http://javascript.about.com/od/problemsolving/a/modulobug.htm
			index = ((index % this.images.length)+this.images.length)%this.images.length;
		}
		if (index>=0 && index<=this.images.length-1) {
			if (!this.$["image" + index]) {
				this.$["container" + index].createComponent({
					name: "image" + index,
					kind: "ImageView",
					scale: this.defaultScale,
					disableZoom: this.disableZoom,
					src: this.images[index],
					verticalDragPropagation: false,
					style: "height:100%; width:100%;"
				}, {owner: this});
				this.$["image" + index].render();
			} else {
				if (this.$["image" + index].src != this.images[index]) {
					this.$["image" + index].setSrc(this.images[index]);
					this.$["image" + index].setScale(this.defaultScale);
					this.$["image" + index].setDisableZoom(this.disableZoom);
				}
			}
		}
		return this.$["image" + index];
	},
	setImages: function(inImages) {
		// always invoke imagesChanged because this is an array property
		// which might otherwise seem to be the same object
		this.set("images", inImages);
	},
	imagesChanged: function() {
		this.initContainers();
		this.loadNearby();
	},
	indexChanged: enyo.inherit(function(sup) {
		return function() {
			this.loadNearby();
			if (this.lowMemory) {
				this.cleanupMemory();
			}
			sup.apply(this, arguments);
		};
	}),
	transitionStart: function(inSender, inEvent) {
		if (inEvent.fromIndex==inEvent.toIndex) {
			return true; //prevent from bubbling if there's no change
		}
	},
	transitionFinish: function(inSender, inEvent) {
		this.loadNearby();
		if (this.lowMemory) {
			this.cleanupMemory();
		}
	},
	//* @public
	//* Returns the currently displayed ImageView.
	getActiveImage: function() {
		return this.getImageByIndex(this.index);
	},
	//* Returns the ImageView with the specified index.
	getImageByIndex: function(index) {
		return this.$["image" + index] || this.loadImageView(index);
	},
	/**
		Destroys any ImageView objects that are not in the immediate viewing
		area (i.e., the currently active image and the first image on either
		side of it) to free up memory. If you set the Image Carousel's
		_lowMemory_ property to true, this function will be called automatically
		as needed.
	*/
	cleanupMemory: function() {
		var buffer = this.getBufferRange();
		for (var i=0; i<this.images.length; i++) {
			if (enyo.indexOf(i, buffer) ===-1) {
				if (this.$["image" + i]) {
					this.$["image" + i].destroy();
				}
			}
		}
	}
});
