

cc.Class({
    extends: cc.Component,

    properties: {
        friendRankBtn : cc.Node,
        randContent : cc.Sprite,
        closeBtn : cc.Node,
    },

    init (gameCtrl) {
        this.initData(gameCtrl);
        this.initClickEvent();
        return this;
    },

    initData (gameCtrl) {
        this._gameCtrl = gameCtrl;
    },

    initClickEvent () {
        this.friendRankBtn.on('click',this.friendRankEvent,this);
        this.closeBtn.on('click',this.closeEvent,this);
    },

    closeEvent () {
        this.node.active = false;
        VDWeChat.sendMessage({
            messageType: 4,
        });
    },

    friendRankEvent () {
        this.friendRankBtn.getComponent(cc.Sprite).spriteFrame = this.btnFrame[1];
        this.worldRankBtn.getComponent(cc.Sprite).spriteFrame = this.btnFrame[2];
        VDWeChat.sendMessage({
            messageType: 1,
            friendDataKVkey: VDWecharKey,
        });
    },

    sendFriendMsg (score) {
        VDWeChat.sendMessage({
            messageType: 3,
            friendDataKVkey: VDWecharKey,
            worldRankData : null,
            score : score
        });
        VDWeChat.sendMessage({
            messageType: 1,
            friendDataKVkey: VDWecharKey,
            worldRankData : null,
        });
    },

    submitScore (score) {
        VDWeChat.sendMessage({
            messageType: 3,
            friendDataKVkey: VDWecharKey,
            worldRankData : null,
            score : score
        });

    },

    // update (dt) {},s
});
