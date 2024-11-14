'use strict';

const { Controller } = require('ee-core');
const Log = require('ee-core/log');
const Addon = require('ee-core/addon');
const { app, BrowserWindow, WebContentsView } = require('electron');
const path = require('path');
const fs = require('fs');
const Services = require('ee-core/services');
class UserController extends Controller {
    constructor(ctx) {
        super(ctx);
    }
    //获取用户画像信息（不存在则初始化）
    async getUserPortrait(args,event) {
        const {card_id,platform,phone_number} = args;
        if (!this._isValidString(platform) || !this._isValidString(card_id) ||!this._isValidString(phone_number)) {
            return {status:false,message:"参数有误"};
        }
        return await Services.get('user').getUserPortrait(args);
    }

    //添加跟进记录
    async addFollowRecord(args,event) {
        const {card_id,platform,phone_number} = args;
        if (!this._isValidString(platform) || !this._isValidString(card_id) ||!this._isValidString(phone_number)) {
            return {status:false,message:"参数有误"};
        }
        return await Services.get('user').addFollowRecord(args);
    }
    //更新用户信息
    async updateUserInfo(args,event) {
        Log.info('更新用户信息：',args)
        const {card_id,platform,phone_number} = args;
        if (!this._isValidString(platform) || !this._isValidString(card_id) ||!this._isValidString(phone_number)) {
            return {status:false,message:"参数有误"};
        }
        return await Services.get('user').updateUserInfo(args);
    }

    _isValidString(input) {
        return typeof input === 'string' && input.trim() !== '';
    }
}

UserController.toString = () => '[class UserController]';
module.exports = UserController;
