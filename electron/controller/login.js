'use strict';

const { Controller } = require('ee-core');
const Log = require('ee-core/log');
const Services = require('ee-core/services');
const Addon = require('ee-core/addon');
const Ps = require('ee-core/ps');
const { app} = require('electron');
/**
 * example
 * @class
 */
class LoginController extends Controller {

    constructor(ctx) {
        super(ctx);
    }


    /**
     * 所有方法接收两个参数
     * @param args 前端传的参数
     * @param event - ipc通信时才有值。详情见：控制器文档
     */

    async getMachineCode (args,event) {
        try{
            const machineCode = await Services.get('login').getMachineCode();
            return {status:true,message:'操作成功',data: {machineCode:machineCode}};
        }catch(err){
            return {status:false,message:`发生错误${err.message}`};
        }

    }

    async saveAuthCode (args,event) {
        try {
            await Services.get('login').saveAuthCode(args,event);
            return {status:true,message:'存储授权码成功'}
        }catch(err){
            return {status:false,message:'存储授权码发生错误'}
        }
    }



}

LoginController.toString = () => '[class LoginController]';
module.exports = LoginController;
