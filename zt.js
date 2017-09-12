/**
 * Created by zhangtao on 2017/7/4.
 */
document.write("<script language='javascript' src='jsencrypt.min.js'></script>");
document.write("<script language='javascript' src='aes.js'></script>");
document.write("<script language='javascript' src='bcryptjs.js'></script>");
document.write("<script language='javascript' src='rollups/hmac-sha512.js'></script>");
document.write("<script language='javascript' src='components/mode-ecb.js'></script>");
var publickey='MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDBmvUfXbsv0jsiSNsKl3MW6MZCDXBXmGfnZYeBJSQN8NoNjKniqpkjOdpd1V8YGMWyoWNGexALcMOe/gDIPxLZQMzm4Ucf0LuB2qs2eHDw6Z2zeOmQq3oPtuePeeTNapkuhxBbwudofSSFuwd6Hzfme3yXuMiVVr2jHv0w6oSFrQIDAQAB';
function convertFromHex(hex) {
    var hex = hex.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

function convertToHex(str) {
    var hex = '';
    for (var i = 0; i < str.length; i++) {
        hex += '' + str.charCodeAt(i).toString(16);
    }
    return hex;
}
function getUUID(len, radix) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [], i;
    radix = radix || chars.length;

    if (len) {
        for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
    } else {
        var r;
        // getUUID[8] = getUUID[13] = getUUID[18] = getUUID[23] = '-';
        // getUUID[14] = '4';
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random()*16;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }
    return uuid.join('');
}

function encryptRSA(key){
    var encrypt = new JSEncrypt();
    encrypt.setPublicKey(publickey);
    var encrypted = encrypt.encrypt(key);
    console.log('RSA密文：' + encrypted.toString());

    return encrypted;
}
function encryptAES(str,key) {
    var AESkey = CryptoJS.enc.Utf8.parse(key.toString());
    var encrypt = CryptoJS.enc.Utf8.parse(str.toString());
    var encrypted = CryptoJS.AES.encrypt(encrypt, AESkey, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    }).toString();
    console.log('AES密文：' + encrypted.toString());

    return encrypted;

}

function decryptAES(word) {
    var key = CryptoJS.enc.Utf8.parse("abcdefgabcdefg12");
    console.log('16进制待解密密文：' + word);
    var decrypts = convertFromHex(word);
    console.log('待解密密文：' + decrypts);
    var decrypt1 = CryptoJS.AES.decrypt(decrypts, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    var jiemimingwen = CryptoJS.enc.Utf8.stringify(decrypt1).toString();
    console.log('解密明文：' + jiemimingwen);

    var jsonyuanwen = eval("(" + jiemimingwen + ")");
    console.log('jsonyuanwen：' + jsonyuanwen.account);

    return jsonyuanwen;
}

function getLoginData(dAccount, dSalt) {
    var AESkeys=getUUID(16,16);
    console.log('AESkeys：' +AESkeys);
    var data = new Object();
    data.dAccount = dAccount;
    data.dSalt = dSalt;
    var jsonstr = JSON.stringify(data);
    console.log('明文：' + jsonstr);

    var lock = convertToHex(encryptAES(jsonstr,AESkeys).toString()).toString();
    console.log('16进制AES密文：' + lock);
    var key = convertToHex(encryptRSA(AESkeys).toString()).toString();
    console.log('16进制RSA密文：' + key);

    var loginData=new Object();
    loginData.key=key;
    loginData.lock=lock;

    var loginJSON=JSON.stringify(loginData);
    console.log('loginJSON：' + loginJSON);
    return loginJSON;
}