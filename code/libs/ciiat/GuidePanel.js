enyo.kind({
    name: "ciiat.GuideItem",
    kind: "FittableRows",
    published: {
        item: null
    },
    classes: "ciiat-adv",
    components: [
        {
            fit: true,
            name: "advContent",
            kind: "FittableRows",
            classes: "ciiat-advContent",
            components: [
             { tag: "p", classes: "ciiat-adv-title", name: "title", allowHtml: true },
            { fit: true, kind: "Image", classes: "ciiat-adv-pic", allowHtml: true, name: "pic" },
            { classes: "ciiat-adv-des", allowHtml: true, name: "des" }
         ]
        }
    ],
    create: function () {
        this.inherited(arguments);
    },
    rendered: function () {
        this.inherited(arguments);
        this.itemChanged();
    },
    itemChanged: function () {
        if (!this.item) return;
        this.$.title.setContent(this.item.title);
        this.$.title.setShowing(this.item.title);
        this.$.des.setContent(this.item.des);
        this.$.des.setShowing(this.item.des);
        this.$.pic.setSrc(this.item.pic);
        this.$.pic.setShowing(this.item.pic);
        this.reflow();

    }
});
enyo.kind({
    name: "ciiat.GuidePanel",
    classes: "onyx ciiat-guide",
    kind: "FittableRows",
    published: {
        advs: [
                { pic: "images/ciiat/adv/1.png" },
                { pic: "images/ciiat/adv/2.png" },
                { pic: "images/ciiat/adv/3.png" }
            ]
    },
    components: [
        {
            name: "advs",
            classes: "ciiat-advs",
            fit: true,
            kind: "ciiat.RoutePanels",
            onTransitionFinish: "changeGuideNumber",
            arrangerKind: "CardSlideInArranger"
        },
        {
            classes: "ciiat-advs-dots",
            kind: "FittableColumns",
            components: [
             {
                 fit: true,
                 name: "dots",
                 classes: "ciiat-dots",
                 style: "text-align:center;"
             }]
        },
        {
            classes: "ciiat-advs-button",
            kind: "FittableColumns",
            components: [
                    { kind: "onyx.Button", classes: "onyx-blue", name: "btnMain", allowHtml: true, content: "立即体验", ontap: "nav" },
             ]
        },

    ],
    create: function () {
        this.inherited(arguments);
    },
    rendered: function () {
        this.inherited(arguments);
        this.advsChanged();
    },
    advsChanged: function () {
        this.$.advs.destroyClientControls();
        this.$.dots.destroyClientControls();
        var self = this;
        var bounds = this.$.advs.getBounds();
       
        var height = bounds.height > 400 ? 400 : bounds.height;
        var margin = (bounds.height - height) / 2;
        var width = height > (bounds.width - 40) ? (bounds.width - 40) : height;
        width = width + "px";
        margin = margin + "px";
        height = height + "px";
        for (var i = 0; i < this.advs.length; i++) {
            var view = new ciiat.GuideItem({
                route:'adv/adv'+i,
                item: this.advs[i],
                ontap: "tapItem"
            });
            view.setContainer(this.$.advs);
            view.setOwner(this);
            this.$.dots.createComponent({
                name: ('dot' + i),
                classes: "ciiat-dot",
                content: "<i class='fa fa-circle'></i>",
                allowHtml: true,
                ontap: "changeGuideTap"
            }, { owner: this });
        }
        this.$.advs.render();
        if (this.$.dot0) {
            this.$.dot0.addClass('active');
        }
        this.$.dots.render();

    },
    changeGuideNumber: function (inSender, inEvent) {
        var index = this.$.advs.getIndex();
        this.changeGuideTo(index);
    },
    changeGuideTap: function (inSender, inEvent) {
        var index = inSender.name.replace('dot', '');
        this.$.advs.setIndex(index);
    },
    changeGuideTo: function (index) {
        var dots = this.$.dots.getClientControls();
        for (var i = 0; i < dots.length; i++) {
            var dot = dots[i];
            dot.removeClass('active');
            if (dot.name == ('dot' + index)) {
                dot.addClass('active');
            }
        };
    },
    tapItem: function (inSender, inEvent) {
    },
    nav: function () {
        app.router.navigate('login', { trigger: true });
    }
});
