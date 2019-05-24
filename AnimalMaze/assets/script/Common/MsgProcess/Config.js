let EVN = cc.Enum({
    debug : 1,
    online : 2,
})

let config = {
    // 网络请求地址
    // requstUrl : "http://192.168.1.231:14001/",
    // requstUrl : "http://192.168.1.233:14001/",
    // requstUrl : "https://vdgames.vdongchina.com/LG/",
    // requstUrl : "https://vd-game.vdongchina.com/p1/",
    requstUrl : "https://vd-game.vdongchina.com/LG/",
    // requstUrl : "https://test-lg.vdongchina.com/LG/",

    // 客户端版本号
    clientVersion : "1.2",

    // 环境
    evn : EVN.debug,

    // 默认客户端配置
    clientCfg : "{\"previewVersion\":\"0.0\",\"online\":{\"moreGame\":1,\"share\":1},\"preview\":{\"moreGame\":0,\"share\":0}}",
}

window.VDWecharKey = config.evn == EVN.debug ? 'animalMaze_test' : 'animalMaze_online';

let method = {
    parseClientCfg(data) {
        // console.log("版本====>", data);
        data = JSON.parse(data);
        let version = data.previewVersion;
        if (version === config.clientVersion) {
            return data.preview;
        } else {
            return data.online;
        }
    },

    loadTexture(data, key) {
        let url_ = data[key];
        if (url_) {
            let cut = url_.split(".");
            cc.loader.load({url: url_, type: cut[cut.length - 1]}, (err, texture) => {
                if (err) return;
            })
        }
    },
}

module.exports = {
    EVN : EVN,
    Config : config,
    Method : method,
}