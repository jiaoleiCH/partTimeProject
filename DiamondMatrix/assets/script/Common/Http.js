const netWorkError = {
    Code: -1,
    Message: '网络不给力，请稍后重试'
}


var Get = function (url, callback) {
    var xhr = cc.loader.getXMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
            callback(true, xhr.responseText);
        } else {
            callback(false, { Code: xhr.status, Message: xhr.statusText });
        }
    };
    xhr.onerror = function () {
        callback(false, netWorkError);
    };
    xhr.send();
}

var Post = function (url, params, callback) {
    if (callback === undefined) {
        callback = params;
        params = '';
    }
    // xhr.onload
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader('Content-Type', 'application/JSON');//'application/json'
    xhr.onreadystatechange = function () {
        // console.log('--请求数据状态---'+xhr.readyState+'  '+xhr.status)
        if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
            var response = xhr.responseText;
            console.log('--收到的信息--'+JSON.stringify(response));
            callback(false, JSON.parse(response));
            
           // callback(true, response);
        }
    };
    
    xhr.onerror = function () {
        callback(true, netWorkError);
    };
    xhr.send(params);
}

function sendData(address, data, callback){
    callback = callback || function(){};
    console.log("--发送的请求--", data);
    Post(address, JSON.stringify(data), callback); 
}

function getData(address, callback){
    Get(address, callback);
}


module.exports = {
    GET: Get,
    POST: Post,
    getData:getData,
    sendData:sendData,
}