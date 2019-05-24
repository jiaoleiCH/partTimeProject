const querystring = require('querystring');
/*
调用 WeChat 脚本提供的 API 时 不需要 做任何的 微信小游戏的判断直接调用 内部会有 处理这个逻辑

API: login 登录
     getUserInfo 获取用户信息
     share 分享
     checkNewVersion 检查新版本
     showAD 展示横屏广告
     showViewAd 展示视频广告
     showTips 弹出消息弹窗
     moreGame 更多游戏 跳转
     sendMessage 向子域发送数据
     checkIsWeChatGame 检查是否是微信小游戏环境
**/

function cprVersion(ver1,ver2) {
    function toNum(a) {
        var a = a.toString();
        //也可以这样写 var c=a.split(/\./);
        var c = a.split('.');
        var r = ["0000", "000", "00", "0", ""];
        for (var i = 0; i < c.length; i++) {
          var len = c[i].length;
          c[i] = r[len] + c[i];
        }
        var res = c.join('');
        return res;
    }
    var _a = toNum(ver1), _b = toNum(ver2);
    if (_a == _b) return 0;
    if (_a > _b) return -1;
    if (_a < _b) return 1;
}

let T = {
    //-------------外部可配置的 函数 和 字段
    // 如果使用新型的 登录 需要配置登录按钮的图片路径
    isUsingNewGetUserInfo: false,
    basePath: './res/raw-assets/',
    getUserInfoBtnImageData: {
        path: '',
        width:200,
        height:100,
        desginWidth:720,
        adjustPos: {x:0,y:0},
    },
    // 被动分享配置
    passiveShareData: {
        imageUrl: '',
        title: '',
        paramList: null,
    },
    // 登录成功的回调
    loginFunc: null, // params | code // 登录时的 code
    // 登录失败的回调
    loginFailFunc : null,
    // 获取用户信息成功的回调
    getUserInfoFunc: null, // params | userInfo // 用户信息 如 头像信息
    // 用户信息按钮
    userInfoButton : null,
    // 友情提示回调
    tipsFunc: null,

    // 广告配置
    adData: {
        // 差评广告ID
        adUnitId:'',
        // 激励广告ID
        videoAdUnitId:'',
        // 激励广告播放成功的回调   观看成功回调
        playVideoSuccess: null, // params | res 播放成功后的参数 (暂时不需要用)
        // 激励广告播放失败的回调  中途关闭会回调
        playVideoFail: null,
    },

    // 更多游戏跳转
    moreGameData: {
        appid: 'wx7a945a7f45248c76', // 跳转小程序的 appid,
        path: '', // 暂时不用填写
        success: null, // 跳转成功的回调
        fail: null, // 跳转失败的回调
        envVersion: 'release', // 跳转的版本
        extraData : {},
    },

    // 启动参数
    StartUpData: {
        launchFunc: null, // 冷启动的时候会去调用 , 里面回去传调用时的参数  params | (query,option)
        onShowFunc: null, // 热启动  params | (query,res)
    },

    // 内部使用的函数
    _tmpOnShowFunc: null,

    //--------------- 外部 直接可以使用 数据
    userData: {},   // 用户数据
    modelData: {},  // 用户手机参数 数据
    optionData: {},  // 冷启动所携带的数据

    // 微信登录 获取用户信息
    login() {
        if(this.checkIsWeChatGame()) {
            wx.getSystemInfo({
                success: res => {
                    T.modelData = res;
                }
            });
            wx.login({
                success: data => {
                    T.userData.code = data.code;
                    if(T.loginFunc) {
                        T.loginFunc(data.code);
                    }
                },
                fail: res => {
                    if (T.loginFailFunc) {
                        T.loginFailFunc(res);
                    }
                }
            })
        }
    },

    // 获取用户信息
    getUserInfo() {
        if(!this.checkIsWeChatGame()) return;
        if(T.isUsingNewGetUserInfo && typeof (wx.createUserInfoButton) == 'function' && cprVersion(T.modelData.SDKVersion,'2.0.5') == -1) {
            // 新版本 获取用户信息的 API
            // 适配按钮
            let scale = 1;
            if(T.modelData.screenWidth && T.modelData.screenWidth > 0) {
                scale = T.modelData.screenWidth / T.getUserInfoBtnImageData.desginWidth;
            }
            let width_ = T.getUserInfoBtnImageData.width * scale;
            let height_ = T.getUserInfoBtnImageData.height * scale;
            let button = wx.createUserInfoButton({
                type:'image',
                image: T.getUserInfoBtnImageData.path,
                style: {
                    left: T.modelData.screenWidth/2 - (width_/2) + T.getUserInfoBtnImageData.adjustPos.x,
                    top: T.modelData.screenHeight/2 - (height_/2) + T.getUserInfoBtnImageData.adjustPos.y,
                    height:height_,
                    width:width_,
                },
                withCredentials: false,
            });
            button.onTap( res => {
                if(res) {
                    if(res.rawData) {
                        T.userData.rawData = res;
                    }
                    if (res.userInfo) {
                        button.destroy();
                        let userInfo = res.userInfo;
                        T.userData.userInfo = userInfo;
                        if(T.getUserInfoFunc) {
                            T.getUserInfoFunc(userInfo);
                        }
                    }
                }
            })
            button.show()
            T.userInfoButton = button;
        } else {
            wx.getUserInfo({
                success:res => {
                    let userInfo = res.userInfo;
                    T.userData.userInfo = userInfo;
                    if(T.getUserInfoFunc) {
                        T.getUserInfoFunc(userInfo);
                    }
                }
            })
        }
    },

    _openWeChatShare(title_, query_, imageUrl_, successFunc, failFunc) {
        if(this.checkIsWeChatGame()) {
            wx.shareAppMessage({
                title: title_,
                query: query_,
                imageUrl: imageUrl_,
                success: (res) => {
                    if(successFunc) {
                        successFunc(res)
                    }
                },
                fail: res => {
                    if(failFunc) {
                        failFunc(res)
                    }
                }
            })
        }
    },

    share(title,paramList,imageUrl,success,fail) {
        let query = querystring.stringify(paramList,"&");
        T._tmpOnShowFunc = success;
        T._openWeChatShare(title,query,imageUrl,success,fail);
    },
    
    // 检查新版本
    checkNewVersion() {
        if (this.checkIsWeChatGame() && typeof wx.getUpdateManager === 'function') {
            const updateManager = wx.getUpdateManager()

            updateManager.onCheckForUpdate(function (res) {})

            updateManager.onUpdateReady(function ( res ) {
                wx.showModal({
                    title: '更新提示',
                    content: '新版本来袭，是否重启应用？',
                    success: function (res) {
                      if (res.confirm) {
                        updateManager.applyUpdate()
                      }
                    }
                  })
            })

            updateManager.onUpdateFailed(function () {})
          }
    },

    bandingOnShowFunc() {
        // // 启动
        let option = wx.getLaunchOptionsSync();
        if(T.StartUpData.launchFunc) {
            T.StartUpData.launchFunc(option.query,option);
        }
        T.optionData = option;

        wx.onShow(res => {
            if(T.StartUpData.onShowFunc) {
                T.StartUpData.onShowFunc(res.query,res)
            }
            if(T._tmpOnShowFunc) {
                T._tmpOnShowFunc();
                T._tmpOnShowFunc = null;
            }
        })
    },

    // 打开分享券
    openShareTicketSetting() {
        wx.updateShareMenu({withShareTicket: true});
    },

    // 打开被动分享
    openShareSetting() {
        wx.showShareMenu({
            withShareTicket: true,
        });
        wx.onShareAppMessage(
            () => {
                let param = querystring.stringify(T.passiveShareData.paramList,"&");
                return {
                    title: T.passiveShareData.title,
                    imageUrl: T.passiveShareData.imageUrl,
                    query: param,
                }
            }
        );
    },

    // 广告  横幅广告
    checkIsShowAd() {
        return (this.checkIsWeChatGame() && wx && typeof(wx.createBannerAd) == 'function')
    },

    // 展示横幅广告
    showAD() {
        if(this.checkIsWeChatGame() && wx && typeof(wx.createBannerAd) == 'function') {
            this.destroyAd()
            // 插屏广告接入
            let bannerAd = wx.createBannerAd({
                adUnitId: T.adData.adUnitId,
                style: {
                    left: 0,
                    top: 0,
                    width: 350
                }
            })

            bannerAd.onResize(function(){
                bannerAd.style.left = screenWidth / 2 - bannerAd.style.realWidth / 2 + 0.1;
                bannerAd.style.top = screenHeight - bannerAd.style.realHeight + 0.1;
            })

            bannerAd.show()
            this._lastBannerAd = bannerAd
        }  
    },

    // 销毁横幅广告
    destroyAd() {
        if(this._lastBannerAd) {
            this._lastBannerAd.destroy()
            this._lastBannerAd = null
        }
    },

    // 广告  激励广告
    checkIsShowViewAd() {
        return (this.checkIsWeChatGame() && wx && typeof(wx.createRewardedVideoAd) == 'function')
    },

    // 播放视频广告
    showViewAd(){
        if(this.checkIsWeChatGame() && wx && typeof(wx.createRewardedVideoAd) == 'function') {
            let videoAd = wx.createRewardedVideoAd({
                adUnitId: T.adData.videoAdUnitId
            })
            
            videoAd.load()
            .then(() => videoAd.show())
            .catch(err => {
                // console.log(err.errMsg)
                videoAd.load.then(() => videoAd.show())
            })

            videoAd.onClose(res => {
                if (res && res.isEnded || res === undefined) {
                    // 正常播放结束，可以下发游戏奖励
                    if(T.adData.playVideoSuccess) {
                        T.adData.playVideoSuccess(res);
                    }
                  }
                  else {
                      // 播放中途退出，不下发游戏奖励
                      if(T.adData.playVideoFail) {
                        T.adData.playVideoFail();
                      }
                  }
            })

            videoAd.onError(res =>{
                console.log('错误',res)
            })
        } else {
            T.showTips('微信版本过低,请升级使用')
        }
    },

    // 弹出信息框
    showTips(content_,title_='友情提示') {
        if(!this.checkIsWeChatGame()) return
        wx.showModal({
            title: title_,
            content: content_,
            showCancel: false,
            success: res => {
                if (res.confirm) {
                    if(T.tipsFunc) {
                        T.tipsFunc();
                        T.tipsFunc = null;
                    }
                }
            },
            // fail : res => {
            //     if (res.cancel) {
                    
            //     }
            // },
        })
    },

    // 更多游戏跳转
    moreGame() {
        if(this.checkIsWeChatGame()) {
            if(typeof(wx.navigateToMiniProgram) == 'function') {
                wx.navigateToMiniProgram({
                    appId: T.moreGameData.appid,
                    path: T.moreGameData.path,
                    envVersion: T.moreGameData.envVersion,
                    extraData : T.moreGameData.extraData,
                    success: ()=>{  
                        if(T.moreGameData.success) {
                            T.moreGameData.success()
                        }
                    },
                    fail: ()=>{
                        if(T.moreGameData.fail) {
                            T.moreGameData.fail()
                        }
                    }
                })
            } else {
                if(T.moreGameData.fail) {
                    T.moreGameData.fail()
                }
                T.showTips('微信版本过低,请升级使用')
            }
        }
    },

    // 向子域发送数据
    sendMessage(data) {
        if(this.checkIsWeChatGame()) {
            if(typeof(wx.getOpenDataContext)=='function') {
                let content = wx.getOpenDataContext();
                content.postMessage(data);
            } else {
                cc.TB.wco.showTips();
            }
        }
    },

    checkIsWeChatGame() {
        return cc.sys.platform == cc.sys.WECHAT_GAME;
    }
}

module.exports = T;