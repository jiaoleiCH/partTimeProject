

cc.Class({
    extends: cc.Component,

    properties: {
        beganBtn : cc.Node,
        logoNode : cc.Node,
        rankBtn : cc.Node,
        shareBtn : cc.Node,
        rankNode : cc.Node,
    },

    init () {
        this.startEvent();
        this.beganBtn.on('click',this.startGame,this);
        this.rankBtn.on('click',this.rankEvent,this);
        this.shareBtn.on('click',this.shareEvent,this);
    },

    startEvent () {
        this.node.parent.getComponent('GameCtrl').fixResolution();
        let visbleSize = cc.view.getVisibleSize();
        this.logoNode.y = visbleSize.height * 0.5 - 280;
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            this.beganBtn.active = false;
        } else {
            this.beganBtn.active = true;
        }
        if (window.wx != undefined && cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.getSystemInfo({
                success : res =>{
                    if(res.model.indexOf('iPhone X') > -1){
                        this.logoNode.y = visbleSize.height * 0.5 - 280 -60;
                    }
                }
            })
        }
    },

    startGame () {
        // let visbleSize = cc.view.getVisibleSize();
        // let action = cc.sequence(cc.spawn(cc.fadeOut(1),cc.moveTo(1,cc.v2(visbleSize.width * 0.5 + this.startSpr.width * 0.5 , 0))),cc.callFunc(()=>{
        //     this.node.active = false;
        //     this.node.parent.getComponent('GameCtrl').init();
        // }))
        // this.startSpr.runAction(action);
        this.node.active = false;
        this.node.parent.getComponent('GameCtrl').init();
    },

    rankEvent () {
        this.rankNode.active = true;
        this._rankCtrl.friendRankEvent();
    },

    shareEvent () {
        let title = "玩游戏做钻石王老五";
        let paramList = "";
        let imageUrl = "share1.jpg";
        let success = () => {
            //Todo 按照分享类型响应事件   
        }
        VDWeChat.share(title, paramList, imageUrl, success);
    }


});