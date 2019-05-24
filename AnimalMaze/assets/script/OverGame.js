

cc.Class({
    extends: cc.Component,

    properties: {
        scoreLab : cc.Label,
        againBtn : cc.Node,
        startGame : cc.Node,
        btnNode : cc.Node,
        shareBtn : cc.Node,
        shareCountLab : cc.Label,
        rankBtn : cc.Node,
        rankNode : cc.Node,
    },

    init (gameCtrl) {
        this.initData(gameCtrl);
        this._controlVersion();
        this.initClickEvent();
        return this;
    },

    initData (gameCtrl) {
        this._gameCtrl = gameCtrl;
        this._rankCtrl = this.rankNode.getComponent('RankCtrl').init(gameCtrl);
    },

    _controlVersion() {
        if(cc.sys.platform == cc.sys.WECHAT_GAME) {
            this.btnNode.active = true;
        } 
    },

    initClickEvent () {
        this.againBtn.on('click',this.againGameEvent,this);
        this.rankBtn.on("click",this.rankEvent,this);
        this.shareBtn.on('click',this.shareEvent,this);
    },

    setOverVisible (f) {
        this.node.active = f;
    },

    setFinishScore (s) {
        this.scoreLab.string = s;
        this._rankCtrl.submitScore(s);
    },

    againGameEvent () {
        // VDGameScore = 0;
        VDIsShare = false;
        AgainGame = true;
        VDWeChat.sendMessage({
            messageType: 4,
        });
        let func = () => {
            this.setOverVisible(false);
        }
        this._gameCtrl.againGame(func);
    },

    shareEvent () {
        let title =  "玩游戏做钻石王老五";
        let paramList = "";
        let imageUrl = "share.png";
        let success = () => {
            //Todo 按照分享类型响应事件
            VDGameScore = VDGameScore * 2;
            this.setFinishScore(VDGameScore);
            this._gameCtrl.setScore();
        }
        
        VDWeChat.share(title, paramList, imageUrl, success);
    },

    rankEvent () {
        this.rankNode.active = true;
        this._rankCtrl.friendRankEvent();
    }
    

});
