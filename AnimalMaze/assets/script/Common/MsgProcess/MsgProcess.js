import Http from 'Http';
import WeChat from 'WeChat';
import Utils from 'Utils';
import {EVN, Config, Method} from 'Config';

let Data = {
    proName : "animalmaze",         // 项目名
    sign : null,                // 用户唯一标识
    shareCounts : 0,            // 用户已经分享次数
    convertCounts : 0,          // 用户已经兑换次数
    maxConvertCounnts : 1,      // 用户最大兑换次数
    clienConfig : null,         // 客户端配置
    businessConfig : {},      // 商家配置
    converting : false,         // 是否正在兑换
    navigate : false,           // 是否正在跳转
    clicked : false,            // 是否点击了按钮
}

let MSG_MAP = {
    clienConfig     : "clienConfig",        // 客户端配置
    businessConfig  : "businessConfig",     // 商家配置
    login           : "login",              // 登录
    shareScheme     : "shareScheme",        // 通知服务器分享成功
    uploadIntegral1 : "uploadIntegral1",    // 上传分数
    uploadRank      : "uploadRank",          // 上传排行榜分数
}

let Utils2 = {
    setLocalData(key, data) {
        if(!key || data === null) console.error('setLocalData error | data or key is not null at Utils2.setLocalData');
        Utils.setLocalData(`${Config.evn == EVN.debug ? 'test_' : ''}${key}_${Data.proName}`, data);
    },

    getLocalData(key) {
        if(!key) cc.error('getLocalData error | data or key is not null at Utils2.getLocalData');
        return Utils.getLocalData(`${Config.evn == EVN.debug ? 'test_' : ''}${key}_${Data.proName}`);
    },

    removeLocalData(key) {
        if(!key) cc.error('removeLocalData error | data or key is not null at Utils2.removeLocalData');
        Utils.removeLocalData(`${Config.evn == EVN.debug ? 'test_' : ''}${key}_${Data.proName}`);
    }
}

/**
 * 注入全局消息监听机制
 */
let MSG = {
    _funcList: [],

    on(msg,func,obj) {
        if(!msg && !func) return -1;
        if(func && obj) {
            func = func.bind(obj);
        }
        this._funcList[msg] ? this._funcList[msg].push(func) : (()=>{this._funcList[msg]=[];this._funcList[msg].push(func);})();
        return this._funcList[msg].length - 1;
    },

    off(msg) {
        if(mag && this._funcList[msg]) {
            this._funcList[msg] = null;
        }
    },

    offAllMsg() {
        for (let key in this._funcList) {
            this.off(key);
        }
    },

    removeFuncByIndex(msg, index) {
        if(msg && this._funcList[msg]) {
            if(index != undefined && index > -1 && this._funcList[msg][index]) {
                // this._funcList[msg].splice(index,1);
                this._funcList[msg][index] = null;
            }
        }
    },

    clear(msg) {
        if(msg && this._funcList[msg]) {
            this._funcList[msg] = [];
        }
    },

    /**
     * ## 发送消息
     * #### 参数 : (接收任意个参数)
     *        1 第一个参数是消息表示,类型: string. ep:"login", 
     *        2 最后一个参数为回调函数,在服务器返回消息后调用
     *    
     * @example      
    ```js
    // get clien Config
    let data = {
        proName : "mammon" + "{}" + (CLIENT_ID ? CLIENT_ID : -1) + "{}" + (TEMPLATE_ID ? TEMPLATE_ID : -1),
        // config : JSON.stringify({"previewVersion":"1.3","online":{"moreGame":1,"share":1},"preview":{"moreGame":0,"share":0}})
    }
    VDMSG.sendMsg(VDMSGMAP.clienConfig, data, () => {
        
    })

    // get business Config
    let data = {
        proName : "mammon",
        businessId : CLIENT_ID,
        templateId : TEMPLATE_ID
    }
    VDMSG.sendMsg(VDMSGMAP.businessConfig, data, () => {
        
    })

    // login
    let data = {
        js_code : VDWeChat.userData.code,
        userInfo : VDWeChat.userData.userInfo,
        pro_name : "mammon",
        businessId : CLIENT_ID,
        templateId : TEMPLATE_ID,
        conversionNum : VDData.businessConfig.exchangeCounts == null ? 1 : VDData.businessConfig.exchangeCounts
    }
    VDMSG.sendMsg(VDMSGMAP.login, data, (res) => {

    })

    // share Scheme
    let data = {
        sign : VDData.sign,
        shareType : VDData.businessConfig.shareType != null ? VDData.businessConfig.shareType : 1,
        addConversionNum : VDData.businessConfig.addExchangeCounts != null ? VDData.businessConfig.addExchangeCounts : 1,
        shareNum : VDData.shareCounts + 1,
        conversionNum : VDData.businessConfig.exchangeCounts == null ? 1 : VDData.businessConfig.exchangeCounts
    }
    VDMSG.sendMsg(VDMSGMAP.shareScheme, data, () => {
        
    })

    // upload score
    let data = {
        sign : VDData.sign,
        score : GameScore,
        templateId : TEMPLATE_ID,
        conversionNum : VDData.businessConfig.exchangeCounts == null ? 1 : VDData.businessConfig.exchangeCounts
    }
    VDMSG.sendMsg(VDMSGMAP.uploadIntegral1, data, (res) => {

    })
    ```
    */
    sendMsg(msg,data) {
        if(msg && this._funcList[msg]) {
            this._funcList[msg].forEach(func => {
                func ? func(data) : null;
            });
        }
    }
};

MSG.sendMsg_ = MSG.sendMsg;

MSG.sendMsg = (sign, ...data)=> {
    console.log(`---------发送${sign}消息开始---------`);
    let data_ = [...data];
    let cb_ = null;
    typeof(data_[data_.length-1]) == "function" ? cb_ = data_.pop() : null;
    MSG.sendMsg_(sign, {
        data: data_,
        cb : cb_,
    });
}

/*{
    data:{},
    cb:()=>{}
}*/

let middleware = {

    // 获取客户端配置
    _clienConfig() {
        let data_ = [...arguments][0];
        Http.sendData(Config.requstUrl + "updateClientConfig", data_.data[0], (err,res) => {
            // console.log("get client config:","err : " ,err , "  res :  ", res);
            if(!err){
                if (res.code == -1) {
                    console.log("服务器异常")
                    WeChat.tipsFunc = () => {
                        if (WeChat.userInfoButton) {
                            WeChat.userInfoButton.destroy();
                            WeChat.userInfoButton = null;
                        }
                        cc.director.loadScene("start");
                    }
                    WeChat.showTips("服务器异常!");
                } else if (res.code == -2) {
                    console.log("参数异常")
                } else if (res.code == 0) {
                    if (res.data.config === null) {
                        res.data.config = Config.clientCfg;
                    }
                    Data.clienConfig = Method.parseClientCfg(res.data.config);
                    data_.cb ? data_.cb(res) : null;
                    console.log(`---------完成${MSG_MAP.clienConfig}消息回调---------`);
                }
            } else {
                WeChat.tipsFunc = () => {
                    if (WeChat.userInfoButton) {
                        WeChat.userInfoButton.destroy();
                        WeChat.userInfoButton = null;
                    }
                cc.director.loadScene("start");
                }
                WeChat.showTips("网络较差, 请重连!");
            }
        });
    },

    // 获取商家配置
    _businessConfig() {
        let data_ = [...arguments][0];
        Http.sendData(Config.requstUrl + "BusinessConfig", data_.data[0], (err,res) => {
            // console.log("get client config:","err : " ,err , "  res :  ", res);
            if(!err){
                if (res.code == 0) {
                    Data.businessConfig = res.data;
                    Method.loadTexture(Data.businessConfig, "bgUrl");
                    data_.cb ? data_.cb(res) : null;
                    console.log(`---------完成${MSG_MAP.businessConfig}消息回调---------`);
                }
            } else {
                WeChat.tipsFunc = () => {
                    if (WeChat.userInfoButton) {
                        WeChat.userInfoButton.destroy();
                        WeChat.userInfoButton = null;
                    }
                cc.director.loadScene("start");
                }
                WeChat.showTips("网络较差, 请重连!");
            }
        });
    },

    // 登录
    _login() {
        let data_ = [...arguments][0];
        Http.sendData(Config.requstUrl + "login", data_.data[0], (err,res) => {
            if(!err){
                if (res.code == -1) {
                    console.log("服务器异常")
                    WeChat.tipsFunc = () => {
                        if (WeChat.userInfoButton) {
                            WeChat.userInfoButton.destroy();
                            WeChat.userInfoButton = null;
                        }
                        cc.director.loadScene("game");
                    }
                    WeChat.showTips("服务器异常!");
                } else if (res.code == -2) {
                    console.log("参数异常");
                } else if (res.code == 1003) {
                    console.log("js_code无效");
                } else if (res.code == 1004) {
                    console.log("openid 无效");
                } else if (res.code == 0) {
                    if (parseInt(res.data.kill)) {
                        console.log("用户已被封杀");
                        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
                            WeChat.showTips("您已被封号,请及时联系客服!");
                        }
                    } else {
                        Data.sign = res.data.sign;
                        Data.shareCounts = res.data.shareCount == null ? 0 : parseInt(res.data.shareCount);
                        Data.convertCounts = res.data.conversionCount;
                        Data.maxConvertCounnts = res.data.conversionCountMax == null ? 1 : res.data.conversionCountMax;
                        Utils2.setLocalData("diamond", {time : new Date().toLocaleDateString(), counts : Data.convertCounts});
                        data_.cb ? data_.cb(res) : null;
                        console.log(`---------完成${MSG_MAP.login}消息回调---------`);
                    }
                }
            } else {
                WeChat.tipsFunc = () => {
                    if (WeChat.userInfoButton) {
                        WeChat.userInfoButton.destroy();
                        WeChat.userInfoButton = null;
                    }
                cc.director.loadScene("game");
                }
                WeChat.showTips("网络较差, 请重连!");
            }
        });
    },

    // 通知服务器分享成功
    _shareScheme() {
        if (Data.shareCounts >= (Data.businessConfig.shareCount == null ? 1 : Data.businessConfig.shareCount)) return;
        let data_ = [...arguments][0];
        Http.sendData(Config.requstUrl + "shareScheme", data_.data[0], (err,res) => {
            // console.log("get client config:","err : " ,err , "  res :  ", res);
            if(!err){
                if (res.code == -1) {
                    console.log("服务器异常")
                    WeChat.tipsFunc = () => {
                        if (WeChat.userInfoButton) {
                            WeChat.userInfoButton.destroy();
                            WeChat.userInfoButton = null;
                        }
                        cc.director.loadScene("game");
                    }
                    WeChat.showTips("服务器异常!");
                } else if (res.code == -2) {
                    console.log("参数异常")
                } else if (res.code == 0) {
                    Data.convertCounts = res.data.conversionCount;
                    Data.maxConvertCounnts = res.data.conversionCountMax == null ? 1 : res.data.conversionCountMax;
                    Data.shareCounts = res.data.shareCount;
                    Utils2.setLocalData("diamond", {time : new Date().toLocaleDateString(), counts : Data.convertCounts});
                    data_.cb ? data_.cb(res) : null;
                    console.log(`---------完成${MSG_MAP.shareScheme}消息回调---------`);
                }
            } else {
                WeChat.tipsFunc = () => {
                    if (WeChat.userInfoButton) {
                        WeChat.userInfoButton.destroy();
                        WeChat.userInfoButton = null;
                    }
                    cc.director.loadScene("game");
                }
                WeChat.showTips("网络较差, 请重连!");
            }
        });
    },

    // 上传分数
    _uploadIntegral1() {
        let data_ = [...arguments][0];
        Http.sendData(Config.requstUrl + "uploadIntegral1", data_.data[0], (err,res) => {
            // console.log("get client config:","err : " ,err , "  res :  ", res);
            if(!err){
                if (res.code == -1) {
                    console.log("服务器异常")
                    WeChat.tipsFunc = () => {
                        if (WeChat.userInfoButton) {
                            WeChat.userInfoButton.destroy();
                            WeChat.userInfoButton = null;
                        }
                        cc.director.loadScene("game");
                    }
                    WeChat.showTips("服务器异常!");
                } else if (res.code == -2) {
                    console.log("参数异常")
                } else if (res.code == 0) {
                    data_.cb ? data_.cb(res) : null;
                    console.log(`---------完成${MSG_MAP.uploadIntegral1}消息回调---------`);
                }
            } else {
                WeChat.tipsFunc = () => {
                    if (WeChat.userInfoButton) {
                        WeChat.userInfoButton.destroy();
                        WeChat.userInfoButton = null;
                    }
                cc.director.loadScene("game");
                }
                WeChat.showTips("网络较差, 请重连!");
            }
            Data.converting = false;
        });
    },

    _uploadRank() {
        let data_ = [...arguments][0];
        Http.sendData(Config.requstUrl + "UploadRank", data_.data[0], (err,res) => {
            // console.log("get client config:","err : " ,err , "  res :  ", res);
            if(!err){
                if (res.code == -1) {
                    console.log("服务器异常")
                    WeChat.tipsFunc = () => {
                        if (WeChat.userInfoButton) {
                            WeChat.userInfoButton.destroy();
                            WeChat.userInfoButton = null;
                        }
                        cc.director.loadScene("game");
                    }
                    WeChat.showTips("服务器异常!");
                } else if (res.code == -2) {
                    console.log("参数异常")
                } else if (res.code == 0) {
                    data_.cb ? data_.cb(res) : null;
                    console.log(`---------完成${MSG_MAP.uploadRank}消息回调---------`);
                }
            } else {
                WeChat.tipsFunc = () => {
                    if (WeChat.userInfoButton) {
                        WeChat.userInfoButton.destroy();
                        WeChat.userInfoButton = null;
                    }
                cc.director.loadScene("game");
                }
                WeChat.showTips("网络较差, 请重连!");
            }
        });
    }
}

!(function(){
    for (let key in MSG_MAP) {
        MSG.on(key, middleware[`_${key}`] ? middleware[`_${key}`] : console.error(`_${key} is undefined in middleware`));
    }
    console.log("请求根地址=====>\t", Config.requstUrl,"\n客户端版本号=====>\t",Config.clientVersion,MSG._funcList);
})();

module.exports = {
    Data : Data,
    MSG_MAP : MSG_MAP,
    MSG : MSG,
    Utils2 : Utils2,
};