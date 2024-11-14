<div align=center>
<h1><strong>基于Electron实现的WhatsApp，Telegram多账号管理工具</strong></h1>
</div>
<br>

## 项目架构
- 桌面端：electron-egg
- 翻译端：Spring Boot 2.6.4 、 Mybatis-Plus、 JWT、Spring Security、Redis、Vue的前后端分离的后台管理系统
## 功能介绍
1. 账号多开，独立环境独立cookie数据，可无限多开管理账号
2. 独立代理，每个会话可以单独配置代理信息
3. 聚合翻译，软件内置翻译功能，聊天实时翻译，可自定义翻译语言
## 文档
- 桌面端使用基于electron开源框架 https://gitee.com/dromara/electron-egg
- 后台翻译授权端 https://eladmin.vip
## 项目截图
### 桌面端
- 登录
 ![登录页面](images/login.png)
- 首页(统计功能还未实现，当前只是一个demo)
 ![首页](images/home.png)
- 会话管理(WhatsApp)
 ![首页](images/sessions-ws.png)
- 会话配置
 ![会话配置](images/session-config.png)
- 聊天翻译
 ![聊天实时翻译](images/translate-use.png)
- 用户画像管理
 ![用户画像管理](images/user-portrait-config.png)
- 新消息通知
 ![新消息通知](images/new-message-notify.png)
### 后台翻译端
- 授权管理（新用户自动登录默认会赠送3天授权，如有需求可自行在源码修改）
 ![授权管理](images/auth-manage.png)
- 翻译记录管理（主要用于消息缓存，节省翻译api调用量）
 ![消息记录](images/message-record.png)
- 翻译配置(后台已对接五个平台翻译，api需自行注册获取并设置，如需添加更多平台也可在源码自行添加)
 ![翻译配置](images/translate-config.png)
- 编码管理(每个平台对应的语言翻译的code不一致，需要自行添加并管理)
 ![语言编码管理](images/code-manage.png)
- 本地编码配置，因为每家翻译平台对应的编码存在不一致情况，所有设置了一个本地编码映射，统一管理编码
 ![本地语言管理](images/local-language-code-manage.png)
## 项目启动流程
