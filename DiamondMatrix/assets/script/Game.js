

cc.Class({
    extends: cc.Component,

    properties: {
        gameNode : cc.Node,
        startGameNode : cc.Node,
        bg : cc.Node
    },

    onLoad () {
        // this.registerGlobalVarible();
        this.fixResolution();
        this.init();
    },

    init () {
        this._openCollisionManage();
        this.initData();

        var funcList = [
            this.preLoadPrefabs,
            // this.updateGameBg,
            
            // this.initServer,
        ]
        this.startAction(funcList.length);
        funcList.forEach(func => func ? (func.bind(this))() : null);
        
    },

    initData () {
        this._signList = [];
        GameTime = 30;
        GameLevel = 1;
        VDGameScore = 0;
        window.GameOver = false;
    },

    fixResolution () {
        let frameSize = cc.view.getFrameSize();
        let cvs = this.node.getComponent(cc.Canvas);
        let ratio = frameSize.width / frameSize.height;
        if( ratio <= 0.5625) {
            cvs.fitHeight = false;
            cvs.fitWidth = true;
            VDAdaptionMode = 1;
        } else {
            cvs.fitHeight = true;
            VDAdaptionMode = 2;
        }
        this.initGame();
    },

    // ************** login net **************
    login(callback) {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            console.log("微信平台");
            this.loginWX();
        } else {
            this.initGame();
            console.log("其他平台");
        }
    },

    loginWX(callback) {
        VDWeChat.loginFunc = () => {
            console.log("登陆微信成功");
            this.WXAuthorize();
        }
        VDWeChat.login();
    },

    WXAuthorize() {
        // VDWeChat.StartUpData.onShowFunc = () => {
        //     // this.synIntegralFromMLY();
        //     // if (GameOver) {
        //     //     GameScore = 0;
        //     // }
        //     console.log('*********onShow**********');
        //     cc.director.resume();
        // }
        VDWeChat.isUsingNewGetUserInfo = true;
        VDWeChat.bandingOnShowFunc();
        VDWeChat.openShareTicketSetting();
        VDWeChat.passiveShareData = {
            imageUrl: VDData.businessConfig.shareImgUrl ? VDData.businessConfig.shareImgUrl : "share.jpg",
            title: VDData.businessConfig.shareTitle ? VDData.businessConfig.shareTitle : "别致的消除游戏尽在《钻石矩阵》",
            paramList: null,
        }
        VDWeChat.openShareSetting();

        VDWeChat.getUserInfoFunc = () => {
            this.goToGame();
            // this.loginServer(() => {
            //     // this.synIntegralFromMLY();
            //     this.goToGame();
            // });
        }
        VDWeChat.getUserInfoBtnImageData = {
            path: 'res/btn_start.png',
            width:328,
            height:140,
            desginWidth:720,
            adjustPos: {x:0,y:210},
        }
        VDWeChat.getUserInfo();
    },

    loginServer(callback) {
        var data = {
            js_code : VDWeChat.userData.code,
            userInfo : VDWeChat.userData.userInfo,
            pro_name : VDData.proName,
            businessId : CLIENT_ID,
            templateId : TEMPLATE_ID,
            conversionNum : VDData.businessConfig.exchangeCounts == null ? 1 : VDData.businessConfig.exchangeCounts
        }
        VDMSG.sendMsg(VDMSG_MAP.login, data, (res) => {
            callback ? callback() : null;
        })
    },

    /**
    * 更换游戏背景
    */
    updateGameBg() {
        let size = cc.view.getVisibleSize();
        if(VDData.businessConfig){
            let url = VDData.businessConfig.bgUrl;
            if (url) {
                let cut = url.split(".");
                cc.loader.load({url: url, type: cut[cut.length - 1]}, (err, texture) => {
                    if (err) return;
                    this.bg.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                    this.bg.width = size.width;
                    this.bg.height = size.height;
                })
            } else {
                this.bg.width = size.width;
                this.bg.height = size.height;
            }
        }

       
        this.overAction();
    },

    goToGame () {
        this.startGameNode.getComponent('StartGame').init();
        this.startGameNode.getComponent('StartGame').startGame();
    },

     /**
     * 开始行为
     * @param {int} counts 总共需要做的数量
     */
    startAction(counts) {
        for (let i = 0; i < counts; i++) {
            this._signList[i] = 1;
        }
    },

    /**
     * 结束行为
     * 在 行为结束的时候 调用
     */
    overAction() {
        this._signList.length > 0 ? this._signList.pop() : null;
        // this._signList.length <= 0 ? this.initGame() : null;
        this._signList.length <= 0 ? this.login() : null;
    },

    preLoadPrefabs () {
        let callback = () => {
            VDNodeCache.Preload(()=>{
                this.overAction();
            })
        }
        callback();
    },

     /**
     * 预加载游戏场景
     */
    preLoadScene() {
        cc.director.preloadScene('game');
        this.overAction();
    },

    initGame () {
        this.gameNode.getComponent('GameCtrl').fixResolution();
        // this.startGameNode.active = true;
        this.startGameNode.getComponent('StartGame').init();
        
        // this._
    },

    _openCollisionManage () {
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
        // manager.enabledDebugDraw = true;
    },

    
    

    
});
