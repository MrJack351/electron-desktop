'use strict';
const { machineId, machineIdSync } = require('node-machine-id');

const Addon = require('ee-core/addon');
const { Service } = require('ee-core');
const { BrowserWindow } = require('electron');
const {app} = require("electron");
/**
 * 示例服务（service层为单例）
 * @class
 */
class LoginService extends Service {

    constructor(ctx) {
        super(ctx);
    }

    /**
     * 获取机器码
     */
    async getMachineCode() {
        // 获取基于硬件的原始机器码（更难伪造）
        const hardwareId = machineIdSync({ original: true });
        // console.log('硬件唯一编码:', hardwareId);
        return  hardwareId;
    }

    async saveAuthCode(args, event) {
        const { authCode, expiryDate } = args;
        app.authCode = authCode;
        app.expiryDate = expiryDate;

        // 将 `expiryDate` 转换为数字格式
        const date = this.formatTimestamp(Number(expiryDate));
        const mainId = Addon.get('window').getMWCid();
        const mainWin = BrowserWindow.fromId(mainId);
        mainWin.setTitle(`授权有效期:${date}`);
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始，所以需要加 1
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

}

LoginService.toString = () => '[class LoginService]';
module.exports = LoginService;
