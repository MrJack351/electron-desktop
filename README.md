# WhatsApp 和 Telegram 多账号管理工具

## 目录

- [付费版本](#付费版本)
  - [功能特点](#功能特点)
  - [下载体验](#下载体验)
    - [会话管理](#会话管理)
    - [会话代理设置](#会话代理设置)
    - [双向聊天实时翻译](#双向聊天实时翻译)
    - [用户画像](#用户画像)
    - [快捷回复](#快捷回复)
  - [本地翻译接入](#本地翻译接入)
- [免费版本](#免费版本)
  - [项目架构](#项目架构)
  - [功能介绍](#功能介绍)
  - [文档](#文档)
  - [项目截图](#项目截图)
    - [桌面端](#桌面端)
    - [后台翻译端](#后台翻译端)
  - [项目启动流程](#项目启动流程)
  - [备注](#备注)
  - [免责声明](#免责声明)
- [联系方式](#联系方式)

---

<a id="付费版本"></a>
# 付费版本

<a id="功能特点"></a>
## 功能特点

- 架构优化，客户端代码重构，运行效率更高；开发更便捷
- 客户端多语言支持
- 单体版本，翻译服务可本地配置 API (更好保障隐私)
- 团队版本，适合团队使用后台可管理多个设备
- 页面布局优化，更清晰合理的 UI 布局；用户使用体验更好
- 多会话脚本优化；翻译支持实时显示
- 可对接多个社交聊天平台；脚本规范模块化接入平台更快

<a id="下载体验"></a>
## 下载体验

- **邀请码**：w0ndFe31n7iaF7woRIKN1OlI0g4wntdh
- **下载地址（Windows）**：https://wwbp.lanzouw.com/iZdLx2rp4dvi  
  密码: 3aei

### 界面预览

- **登录页面**  
  ![登录页面](images/server/login.png)

- **首页**  
  ![首页](images/server/home.png)
  ![首页2](images/server/home2.png)

<a id="会话管理"></a>
### 会话管理

- **WhatsApp 会话管理**  
  ![ws](images/server/ws.png)

- **Telegram 会话管理**  
  ![tg](images/server/tg.png)

<a id="会话代理设置"></a>
### 会话代理设置
![proxySetting](images/server/proxySetting.png)

<a id="双向聊天实时翻译"></a>
### 双向聊天实时翻译
![translate](images/server/translate.png)

<a id="用户画像"></a>
### 用户画像
![userInfo](images/server/userInfo.png)

<a id="快捷回复"></a>
### 快捷回复
![quickReply](images/server/quickReply.png)

#### 快捷发送
![quickReply2](images/server/quickReply2.png)

<a id="本地翻译接入"></a>
## 本地翻译接入
![localTranslate](images/server/localTranslate.png)

---

<a id="免费版本"></a>
# 免费版本

WhatsApp 多账号管理、Telegram 多账号管理、WhatsApp 实时翻译

<a id="项目架构"></a>
## 项目架构

- **桌面端**：electron-egg
- **翻译端**：Spring Boot 2.6.4、Mybatis-Plus、JWT、Spring Security、Redis、Vue 的前后端分离的后台管理系统

<a id="功能介绍"></a>
## 功能介绍

1. 账号多开，独立环境独立 cookie 数据，可无限多开管理账号
2. 独立代理，每个会话可以单独配置代理信息
3. 聚合翻译，软件内置翻译功能，聊天实时翻译，可自定义翻译语言

<a id="文档"></a>
## 文档

- 桌面端使用基于 electron 开源框架 electron-egg: https://www.kaka996.com
- 后台翻译授权后台管理端: https://eladmin.vip

<a id="项目截图"></a>
## 项目截图

<a id="桌面端"></a>
### 桌面端

- **登录**  
  ![登录页面](images/login.png)

- **首页**（统计功能还未实现，当前只是一个 demo）  
  ![首页](images/home.png)

- **会话管理(WhatsApp)**  
  ![首页](images/sessions-ws.png)

- **会话配置**  
  ![会话配置](images/session-config.png)

- **聊天翻译**  
  ![聊天实时翻译](images/translate-use.png)

- **用户画像管理**  
  ![用户画像管理](images/user-portrait-config.png)

- **新消息通知**  
  ![新消息通知](images/new-message-notify.png)

<a id="后台翻译端"></a>
### 后台翻译端

- **仓库地址**：https://github.com/MrJack351/translate-admin.git

- **授权管理**（新用户自动登录默认会赠送3天授权，如有需求可自行在源码修改）  
  ![授权管理](images/auth-manage.png)

- **翻译记录管理**（主要用于消息缓存，节省翻译 API 调用量）  
  ![消息记录](images/message-record.png)

- **翻译配置**（后台已对接五个平台翻译，API 需自行注册获取并设置，如需添加更多平台也可在源码自行添加）  
  ![翻译配置](images/translate-config.png)

- **编码管理**（每个平台对应的语言翻译的 code 不一致，需要自行添加并管理）  
  ![语言编码管理](images/code-manage.png)

- **本地编码配置**（因为每家翻译平台对应的编码存在不一致情况，所有设置了一个本地编码映射，统一管理编码）  
  ![本地语言管理](images/local-language-code-manage.png)

<a id="项目启动流程"></a>
## 项目启动流程

1. 先将后台翻译授权系统启动
2. 启动成功后再启动该项目，进入根目录 package.json 文件，安装依赖然后运行 `npm dev` 即可

<a id="备注"></a>
## 备注

- 项目目前只实现了基本的功能，有能力的可以直接拉取项目二次开发
- 如果嫌弃麻烦也可以直接下载我打包后的软件直接体验
- 欢迎提交宝贵意见，如有 bug，请提交 issue，我看到有时间会进行修复

<a id="免责声明"></a>
## 免责声明

- 在使用本项目之前，您应自行评估并承担相应的风险。项目贡献者不保证本项目适合您的特定需求或用途，也不保证项目的完整性、准确性和及时性。

- 使用本项目即表示您同意自行承担所有风险和责任。对于因使用或无法使用本项目而引起的任何索赔、损害或其他责任，项目贡献者概不负责。

<a id="联系方式"></a>
## 联系方式

如有问题或需要帮助，欢迎通过以下方式联系：

- **Telegram**: [@JackSengs](https://t.me/JackSengs)
