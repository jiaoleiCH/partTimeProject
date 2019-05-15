import NodeCache from 'NodeCache';

var msgType = cc.Enum({
    updateFriendRank : 1,   
    updateWorldRank  : 2,
    submitScore : 3,
    clear : 4,
    friendRankActive : 5,
    worldRankActive : 6,
})


cc.Class({
    extends: cc.Component,

    properties: {
        friendRankNode : cc.Node,
        worldRankNode : cc.Node,

        friendContent : cc.Node,
        worldContent : cc.Node,
    },


    start () {
        console.log('========进入子域========');
        this.init();
        // this.initClickEvent();
    },

    init () {
        this.initData();
    },

    initData () {
        window.WCGAME = false;
        window.VDNodeCache = NodeCache;
        this._createType = 0;
        this._lastMsgType = 0;
        this._friendDataMaxNum = 50;
        VDNodeCache.Preload(()=>{
            this.initOnMsg();
        })
        if(cc.sys.platform == cc.sys.WECHAT_GAME) {
            WCGAME = true;
        }
    },

    initClickEvent () {
        this.friendBtn.on('click',this.friendRankEvent,this);
        this.worldBtn.on('click',this.worldRankEvent,this);
    },

    friendRankEvent () {
        this.friendRankNode.active = true;
        this.worldRankNode.active = false;
    },

    worldRankEvent () {
        this.friendRankNode.active = false;
        this.worldRankNode.active = true;
    },

    initOnMsg () {
        if (window.wx != undefined) {
            window.wx.onMessage((data) => {
                this._createType = data.messageType;
                if ((data.messageType == msgType.updateFriendRank || data.messageType == msgType.updateWorldRank) && 
                    (this._lastMsgType == data.messageType)) {
                    return;
                }
                this._lastMsgType = data.messageType;
                // console.log('=====监听主域发送的请求=====', data)
                if(data.messageType == msgType.updateFriendRank){           //更新好友排行榜
                    this.updateFriendRank(data.messageType,data.friendDataKVkey);
                    // console.log('========更新好友排行榜==========');
                }else if (data.messageType == msgType.updateWorldRank) {    //更新世界排行榜
                    this.updateWorldRank(data.messageType,data.worldRankData,data.myRankData);
                    // console.log('========更新世界排行榜==========',data.worldRankData);
                }else if (data.messageType == msgType.submitScore) {    //提交分数
                    this.submitScore(data.friendDataKVkey,data.score);
                }else if (data.messageType == msgType.clear) {    //清除排行榜
                    this.removeChild();
                }else if(data.messageType == msgType.friendRankActive) {
                    // this.updateFriendRank();
                    this.friendRankNode.active = true;
                    this.worldRankNode.active = false;
                }else if(data.messageType == msgType.worldRankActive) {
                    this.friendRankNode.active = false;
                    this.worldRankNode.active = true;
                }
            });
        }
    },

    updateFriendRank (msgType,key) {
        this.friendRankNode.active = true;
        this.worldRankNode.active = false;
        this.removeChild();
        if(WCGAME){
            wx.getUserInfo({
                openIdList: ['selfOpenId'],
                success: (userRes) => {
                    let userData = userRes.data[0];
                    // console.log("用户数据成功:", userData);
                    this.getAllFriendsData(userData, key, msgType);
                },
                fail: (res) => {
                    // console.log('getuserdata fail == ');
                    // console.log("用户数据失败:", res);
                }
            });
        }
    },

    getAllFriendsData (userData, key, msgType) {
        console.log("获取好友数据成功:",key);
        wx.getFriendCloudStorage({
            keyList: [key],
            success: res => {
                let data = res.data;
                let readAllData = [];
                for (let i = 0; i < data.length; ++i) {
                    if (data[i].KVDataList[0]) {
                        readAllData.push(data[i]);
                    }
                }
                // console.log("真正的好友数据:", readAllData,data);
                readAllData.sort((a, b) => {
                    if (a.KVDataList.length == 0 && b.KVDataList.length == 0) {
                        return 0;
                    }
                    if (a.KVDataList.length == 0) {
                        return 1;
                    }
                    if (b.KVDataList.length == 0) {
                        return -1;
                    }
                    return JSON.parse(b.KVDataList[0].value).score - JSON.parse(a.KVDataList[0].value).score;
                });
                let myRankIndex;
                for (let i = 0; i < readAllData.length; i++) {
                    if (readAllData[i].avatarUrl == userData.avatarUrl) {
                        myRankIndex = i;
                        break;
                    }
                }
                // console.log('====自己的排名====' , myRankIndex);
                this.initFriendRank(readAllData,myRankIndex,msgType);
            },
            fail: res => {
            },
        });
    },

    initFriendRank (data,myRankIndex,msgType) {
        for (let i = 0; i < data.length; i++) {
            if(data[i] && i < this._friendDataMaxNum){
                let itemNode = VDNodeCache.GetNodeByType(VDNodeCache.Config.rankItem);
                itemNode.getComponent('itemCtrl').init(data[i],i,myRankIndex,msgType);
                this.friendContent.addChild(itemNode);
                itemNode.getComponent('itemCtrl').setLabelColor(data[i],i,myRankIndex,msgType);
            }
        }
    },

    updateWorldRank (msgType,worldData,myRankData) {
        this.removeChild();
        this.friendRankNode.active = false;
        this.worldRankNode.active = true;
        for (let i = 0; i < worldData.length; i++) {
            let itemNode = VDNodeCache.GetNodeByType(VDNodeCache.Config.rankItem);
            let itemData = {};
            itemData.worldData = JSON.parse(worldData[i]);
            itemData.myRankData = myRankData;
            // console.log('-----itemData-----',itemData);
            itemNode.getComponent('itemCtrl').init(itemData,i,-1,msgType,myRankData);
            this.worldContent.addChild(itemNode);
            itemNode.getComponent('itemCtrl').setLabelColor(itemData,i,-1,msgType,myRankData);
        }
    },

    //提交得分
    submitScore(key, score) { 
        if (window.wx != undefined) {
            window.wx.getUserCloudStorage({
                // 以key/value形式存储
                keyList: [key],
                success: (res) => {
                    // console.log("提交分数成功:", res);
                    if (res.KVDataList.length != 0) {
                        if (JSON.parse(res.KVDataList[0].value).score >= score) {
                            // this.updateFriendRank(key);
                        } else {
                            this.saveWXCloudData(key, score);
                        }
                    } else {
                        this.saveWXCloudData(key, score);
                    }
                },
                fail: function (res) {
                    // console.log("提交分数失败:", res);
                },
                complete: function (res) {
                }
            });
        } else {

        }
    },

    saveWXCloudData (key, score) {
        // 对用户托管数据进行写数据操作
        window.wx.setUserCloudStorage({
            // KVDataList: [{key: key, value: "" + score}],
            KVDataList: [
                {
                    key: key,
                    value: JSON.stringify({
                        score: score,
                        update_time: Date.now(),
                    })
                }
            ],
            success: (res) => {
                console.log("====保存分数成功====:", res);
                // this.updateFriendRank(key);
            },
            fail: (res) => {
                // console.log("保存分数失败:", res);
            },
            complete: (res) => {
            }
        });
    },

    removeChild () {
        let friendItemArr = this.friendContent.getChildren();
        for(let i = 0; i < friendItemArr.length; i++){
            VDNodeCache.PutNode(friendItemArr[i]);
        }
        let worldItemArr = this.worldContent.getChildren();
        for(let i = 0; i < worldItemArr.length; i++){
            VDNodeCache.PutNode(worldItemArr[i]);
        }
        this.friendContent.destroyAllChildren();
        this.worldContent.destroyAllChildren();
    }

    // update (dt) {},
});
