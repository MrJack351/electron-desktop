'use strict';

const { Controller } = require('ee-core');
const Log = require('ee-core/log');
const Addon = require('ee-core/addon');
const { app, BrowserWindow, WebContentsView ,session} = require('electron');
const path = require('path');
const fs = require('fs');
const { Service } = require('ee-core');
const message = require("ee-core/message");
/**
 * 示例服务（service层为单例）
 * @class
 */
class UserService extends Service {

    constructor(ctx) {
        super(ctx);
    }

    async getUserPortrait (args,event) {
        const {card_id,platform,phone_number} = args;
        try{
            //查询用户画像信息
            let user = await app.sdb.selectOne('user_portrait',{platform:platform,phone_number:phone_number});
            let record = []
            if (user) {
                //查询跟进记录
                record = await app.sdb.select('follow_up_record',{platform:platform,phone_number:phone_number,card_id:card_id});
            }else {
                //创建新的记录
                await app.sdb.insert('user_portrait',{card_id:card_id,platform:platform,phone_number:phone_number});
                user = {card_id:card_id,platform:platform,phone_number:phone_number,country:'',gender:'',notes:''}
                Log.info('用户不存在记录：新建记录')
            }
            return {status:true,message:'查询成功',userInfo:user,record:record};
        }catch (e){
            return {status:false,message:'查询出错'+e.message};
        }

    }
    async addFollowRecord (args,event) {
        const {card_id,platform,phone_number,content,time} = args;
        try{
            await app.sdb.insert('follow_up_record',{card_id:card_id,platform:platform,phone_number:phone_number,content:content,time:time});
            return {status:true,message:'添加成功'};
        }catch (e){
            return {status:false,message:'添加失败：'+e.message};
        }
    }
    async updateUserInfo (args,event) {
        const {card_id,platform,phone_number,country,gender,notes,nickname} = args;
        try{
            let user = await app.sdb.selectOne('user_portrait',{card_id:card_id,platform:platform,phone_number:phone_number});
            if (!user) {
                return {status:false,message:'未查询到当前记录，保存失败'}
            }
            await app.sdb.update('user_portrait',{card_id:card_id,platform:platform,phone_number:phone_number,nickname:nickname,country:country,gender:gender,notes:notes},{card_id:card_id,platform:platform,phone_number:phone_number});
            return {status:true,message:'保存成功'};
        }catch (e){
            return {status:false,message:'保存失败：'+e.message};
        }
    }

}

UserService.toString = () => '[class UserService]';
module.exports = UserService;
