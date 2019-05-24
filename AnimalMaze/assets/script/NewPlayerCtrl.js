

cc.Class({
    extends: cc.Component,

    properties: {
        stepSpr : cc.Sprite,
    },

    init (gameCtrl) {
        this.initData(gameCtrl);
        this.initClickEvent();
        return this;
    },

    fixResolution () {
        let visibleSize = cc.view.getVisibleSize();
        this.node.width = visibleSize.width;
        this.node.height = visibleSize.height;
        this.stepSpr.node.width = visibleSize.width;
        this.stepSpr.node.height = visibleSize.height;
    },

    initData (gameCtrl) {
        this._gameCtrl = gameCtrl;
    },

    initClickEvent() {
        this.node.on('click',this.clickEvent,this);
    },

    clickEvent () {
        this.node.active = false;
        VDUtils2.setLocalData('initGuide', "yes");
        this._gameCtrl.initGameRule();

    }


    // update (dt) {},
});
