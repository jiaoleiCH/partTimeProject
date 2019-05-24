

cc.Class({
    extends: cc.Component,

    properties: {
        randContent : cc.Sprite,
        closeBtn : cc.Node,
    },

    init () {
        this.initData();
        this.initClickEvent();
        return this;
    },

    initData () {
        
    },

    initClickEvent () {
        // this.friendRankBtn.on('click',this.friendRankEvent,this);
        this.closeBtn.on('click',this.closeEvent,this);
    },

    closeEvent () {
        this.node.active = false;
        VDWeChat.sendMessage({
            messageType: 4,
        });
        !GameOver ?  VDWeChat.userInfoButton.show() : null;
    },

    friendRankEvent () {
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
