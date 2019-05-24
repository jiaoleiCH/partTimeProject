import NodeCache from 'NodeCache';
import Utils from 'Utils';
import WeChat from 'WeChat';
import Http from 'Http';
import {Data,MSG_MAP,MSG,Utils2} from 'MsgProcess';

cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad () {
        this.initData();
        this.goGame();
    },

    initData () {
        window.VDNodeCache = NodeCache;
        window.VDWeChat = WeChat;
        window.VDUtils = Utils;
        window.VDHttp = Http;
        window.VDData = Data;
        window.VDMSG_MAP = MSG_MAP;
        window.VDMSG = MSG;
        window.VDUtils2 = Utils2;

        window.GameTime = 120;

        //是否复活
        window.VdIsRelife = false;

        window.VDIsShare = false;

        //适配模式
        window.VDAdaptionMode = null;

        //关卡
        window.GameLevel = 1;

        //分数
        window.VDGameScore = 0;

        window.GameBgFrame = null;

        //游戏规则说明
        // window.ruleConfig = ruleConfig;
        window.GameOver = false;
        window.AgainGame = false;
        window.DiamondIndex = {
            'blue' : 0,
            'red'  : 1,
            'green' : 2,
            'gray' : 3,
        };

        window.TargetIndex = 0;
       
    },

    goGame () {
        cc.director.loadScene('game');
    },

});
