enyo.kind({
    name: "ciiat.NavPanel",
    kind: "FittableRows",
    classes: "onyx ciiat-nav",
    published: {
        hasAccount: true,
        menus: null,
        currentMenu: null
    },
    events: {
        onSelectMenu: ""
    },
    components: [
        { kind: "Image", name: "userPic", classes: "item-menu-top", allowHtml: true, ontap: "userTap" },
        {name: "userName", classes: "item-menu-name",allowHtml: true, content:"匿名"},
         { kind: "List", fit: true, touch: true, reorderable: true, onSetupItem: "setupItem",
            name: "navList",
            classes: 'ciiat-list',
            components: [
                { name: "item", classes: "item-menu", ontap: "itemTap", components: [
                   { name: "icon", allowHtml: true, classes: "item-picture" },
                   { name: "title", allowHtml: true, classes: "item-title" },
                   { name: "count", allowHtml: true, classes: "item-count" },
                 ]
                }
			]
        },
        { name: "settings", classes: "onyx-simple item-menu-bottom", kind: "onyx.Button", content: "<i class='fa fa-cogs'></i>", allowHtml: true, ontap: "settingsTap" },
    ],
    create: function () {
        this.inherited(arguments);
        if (!this.menus) {
            this.menus = [
                { id: 'nav1', title: "菜单一", icon: "fa fa-book" },
                { id: 'nav2', title: "菜单二", icon: "fa fa-envelope" },
                { id: 'nav3', title: "菜单三", icon: "fa fa-group" },
            ];
        }
    },
    rendered: function () {
        this.inherited(arguments);
        this.menusChanged();
        this.currentMenuChanged();
        this.hasAccountChanged();
    },
    menusChanged: function () {
        this.$.navList.setCount(this.menus.length);
        this.$.navList.reset();
    },
    hasAccountChanged: function () {
        this.$.userPic.setShowing(this.hasAccount);
        this.$.userName.setShowing(this.hasAccount);
        if (!this.hasAccount) {
            this.applyStyle("padding-top", "57px");
        }
    },
    currentMenuChanged: function (old) {
        if (this.currentMenu == 'account') {
            this.$.navList.select(null);
            this.$.settings.removeClass('active');
            this.$.userPic.addClass('active');
        }
        else if (this.currentMenu == 'settings') {
            this.$.navList.select(null);
            this.$.userPic.removeClass('active');
            this.$.settings.addClass('active');
        }
        else {
            var find = _.findWhere(this.menus, { id: this.currentMenu });
            if (find) {
                var index = _.indexOf(this.menus, find);
                this.$.navList.select(index);
            }
        }
        this.doSelectMenu({ currentMenu: this.currentMenu });
    },
    setupItem: function (inSender, inEvent) {
        var i = inEvent.index;
        var item = this.menus[i];
        if (item) {
            this.$.item.addRemoveClass("active", inSender.isSelected(i));
            this.$.title.setContent(item.title);
            this.$.icon.setContent('<i class="' + item.icon + '"></i>');
            this.$.count.setContent(item.count);
            if (item.icon) {
                this.$.title.setShowing(inSender.isSelected(i));
                this.$.icon.setShowing(!inSender.isSelected(i));
            }
            else {
                this.$.title.setShowing(true);
                this.$.icon.setShowing(false);
            }
            this.$.count.setShowing(item.count);
        }
    },
    itemTap: function (inSender, inEvent) {
        var i = inEvent.index;
        var item = this.menus[i];
        this.setCurrentMenu(item.id);
    },
    userTap: function (inSender, inEvent) {
        this.setCurrentMenu('account');
    },
    settingsTap: function (inSender, inEvent) {
        this.setCurrentMenu('settings');
    }
});