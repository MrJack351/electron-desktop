'use strict';

const { Controller } = require('ee-core');
const Log = require('ee-core/log');
const Addon = require('ee-core/addon');
const { app, BrowserWindow, WebContentsView } = require('electron');
const path = require('path');
const fs = require('fs');
const Services = require('ee-core/services');
class WindowController extends Controller {
    constructor(ctx) {
        super(ctx);
    }

    async addSession(args, event) {
        const { cardId, platform } = args;

        if (cardId === undefined || cardId === '' || platform === '' || platform === undefined) {
            return { status: false, message: '参数不能为空' };
        }

        try {
            return await Services.get('window').addCard(args);
        } catch (error) {
            Log.error('添加会话时出错:', error);
            return { status: false, message: '添加会话时出现异常，请稍后重试' };
        }
    }

    async refreshSession(args, event) {
        const { platform, cardId } = args;

        if (cardId === undefined || cardId === '' || platform === '' || platform === undefined) {
            return { status: false, message: '参数不能为空' };
        }

        try {
            return await Services.get('window').refreshCard(args);
        } catch (error) {
            Log.error('刷新会话时出错:', error);
            return { status: false, message: '刷新会话时出现异常，请稍后重试' };
        }
    }

    async deleteSession(args, event) {
        const { platform, cardId } = args;

        if (cardId === undefined || cardId === '' || platform === '' || platform === undefined) {
            return { status: false, message: '参数不能为空' };
        }
        try {
            return await Services.get('window').deleteCard(args);
        } catch (error) {
            Log.error('删除会话时出错:', error);
            return { status: false, message: '删除会话时出现异常，请稍后重试' };
        }
    }

    async selectSession(args, event) {
        const { cardId, platform } = args;

        if (cardId === undefined || cardId === '' || platform === '' || platform === undefined) {
            return { status: false, message: '参数不能为空' };
        }

        try {
            return await Services.get('window').selectCard(args);
        } catch (error) {
            Log.error('选择会话时出错:', error);
            return { status: false, message: '选择会话时出现异常，请稍后重试' };
        }
    }

    async initSession(args, event) {
        const { cardId, platform } = args;
        if (cardId === undefined || cardId === '' || platform === '' || platform === undefined) {
            return { status: false, message: '参数不能为空' };
        }
        try {
            return await Services.get('window').initCard(args);
        } catch (error) {
            Log.error('选择会话时出错:', error);
            return { status: false, message: `启动会话出错${error.message}` };
        }
    }

    async getSessions(args, event) {
        const { platform } = args;

        if (platform === undefined || platform === '') {
            return { status: false, message: '参数不能为空', data: [] };
        }

        try {
            const result = await Services.get('window').getCards(args);
            return { status: true, message: '查询成功', data: result };
        } catch (error) {
            Log.error('获取会话信息时出错:', error);
            return { status: false, message: '获取会话信息时出现异常，请稍后重试', data: [] };
        }
    }

    async addConfigInfo(args, event) {
        const { card_id } = args;

        if (card_id === undefined || card_id === '') {
            return { status: false, message: '参数不能为空' };
        }

        try {
            return await Services.get('window').saveCardConfig(args);
        } catch (error) {
            Log.error('添加配置信息时出错:', error);
            return { status: false, message: '保存配置时出现异常，请稍后重试' };
        }
    }

    async getConfigInfo(args, event) {
        const { cardId } = args;
        if (cardId === undefined || cardId === '') {
            return {status:false,message:'参数不能为空'}
        }
        try{
            const result = await Services.get('window').getCardConfig(args)
            return {status:true,message:'查询成功', data:result}
        }catch(err){
            return {status:false,message:`查询发生错误:${err.message}`};
        }
    }

    async hideWindow(args, event) {
        try {
            await Services.get('window').hideAllWindow();
            return {status:true,message:'隐藏所有窗口成功'}
        } catch (error) {
            return {status:false,message:'隐藏所有窗口发生错误'}
        }
    }
    async logout(args, event) {
        try{
            await Services.get('window').logOut();
            return {status:true,message:'退出成功'}
        }catch (error) {
            return {status:false,message:'发生错误'}
        }
    }

    async filterNumber(args, event) {
        // 解构参数
        const { platform, cardId, phoneNumber } = args;
        // 检查参数是否为空或不符合要求
        if (!this._isValidString(platform) || !this._isValidString(cardId) ||!this._isValidString(phoneNumber)) {
            return {status:false,message:'传入参数有误'}
        }
        try {
            // 参数验证通过，继续执行过滤逻辑
            return await Services.get('window').filterNumber(args);
        } catch (error) {
            Log.error("过滤过程中出错:", error);
            return {status:false,message:error.message};
        }
    }

    async getPhoneNumberList(args, event) {
        // 解构参数
        const { platform, cardId } = args;
        // 检查参数是否为空或不符合要求
        if (!this._isValidString(platform) || !this._isValidString(cardId)) {
            return {status:false,message:'传入参数有误'}
        }
        return await Services.get('window').getPhoneNumberList(args);
    }
    async deletePhoneNumber(args, event) {
        // 解构参数
        const {platform, phoneNumber } = args;
        // 检查参数是否为空或不符合要求
        if (!this._isValidString(phoneNumber) || !this._isValidString(platform)) {
            return {status:false,message:'传入参数有误'}
        }
        return await Services.get('window').deletePhoneNumber(args);
    }

    async sendMessage(args, event) {
        // 解构参数
        const { platform, cardId, phoneNumber } = args;
        // 检查参数是否为空或不符合要求
        if (!this._isValidString(platform) || !this._isValidString(cardId) ||!this._isValidString(phoneNumber)) {
            return {status:false,message:'传入参数有误'}
        }
        try {
            // 参数验证通过，继续执行过滤逻辑
            return await Services.get('window').sendMessage(args);
        } catch (error) {
            Log.error("发送消息出错:", error);
            return {status:false,message:error.message};
        }
    }

    _isValidString(input) {
        return typeof input === 'string' && input.trim() !== '';
    }
}

WindowController.toString = () => '[class WindowController]';
module.exports = WindowController;
