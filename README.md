# NexaChat · 多平台多账号管理与聊天工作台

NexaChat 用于集中管理 WhatsApp、Telegram 等平台账号，并提供独立会话环境与聊天辅助工具。当前最新客户端为 **3.2.0**，已完成架构和界面重构。

本页汇总 **3.2 重构版、旧版付费客户端、免费开源版**。三个版本分别说明，便于按功能需求选择和查阅；旧版截图与介绍保留在下方对应章节。

> **全套源码交付 · 定制化部署**：支持自主维护与二次开发，可按品牌和业务需求沟通部署及定制方案。咨询请联系 Telegram：[@zhonghe785](https://t.me/zhonghe785) 或 [@LinkSengs](https://t.me/LinkSengs)。

[查看 3.2](#新版32) · [对比三个版本](#版本对比) · [旧版付费](#付费版本) · [免费开源](#免费版本) · [源码与定制部署](#源码与部署) · [联系咨询](#联系方式)

<a id="版本对比"></a>

## 三个版本的区别

| 对比项 | 3.2 重构版（最新） | 旧版付费客户端（C# / CEF，1.x） | 免费开源版 |
|---|---|---|---|
| 版本定位 | 迁移到 Electron 并完成架构、界面重构的多平台工作台 | C# 桌面宿主版本；所提供源码配置为 1.3.4 | 本仓库的基础多账号管理项目 |
| 平台入口 | 平台清单驱动，含 WhatsApp、Telegram 等；功能随平台接入状态变化 | 平台清单与脚本 / 插件驱动；含 WhatsApp、Telegram 和 Google 等入口，部分入口默认隐藏 | WhatsApp、Telegram 多账号管理 |
| 会话与环境 | 独立会话数据、代理、指纹、语言及时区配置；会话搜索与批量操作 | 每会话独立 CEF 浏览器、缓存与登录态，支持代理、指纹和启动网址配置 | 独立 Cookie 与会话环境、每会话代理 |
| 聊天翻译 | 发送与接收翻译、发送前预览；部分平台提供语音转文字和 AI 回复 | 发送与接收翻译、发送前预览，按平台及联系人维护翻译配置 | WhatsApp 实时翻译、可配置翻译语言 |
| 客户与话术工具 | 联系人画像、跟进记录、快捷回复、云素材 | 联系人画像、标签与跟进记录，平台 / 通用分组快捷回复，图片 / 视频云素材 | 旧截图展示用户画像管理 |
| 消息与运营 | 消息同步、WhatsApp 进粉统计、站内信、桌面通知 | WhatsApp / Telegram 消息本地记录与同步、未读角标、站内信、端口额度与心跳状态、发送前关键词 / 钱包检测 | 旧截图展示新消息通知 |
| 界面 | 重构后的统一工作台、中英文、浅色与深色主题、命令面板 | Vue 工作台、多语言与深色主题，右侧会话配置、翻译、画像、快捷回复和素材面板 | 基础桌面界面；首页统计为演示 |
| 桌面平台 | Windows x64、macOS Apple Silicon | Windows x64 | 以本仓库原有开发与打包配置为准 |
| 技术与代码入口 | Vue 3 + TypeScript + 定制 Electron；独立新版仓库和 NexaChat 新后端 | Vue 3 + TypeScript + C# WinForms / .NET Framework 4.8 + FBroSharp / CEF；SQLite 本地存储、Inno Setup 打包 | electron-egg + Spring Boot / Vue 翻译后台 |
| 更新与维护 | 客户端更新、签名校验、诊断工具与平台脚本更新 | 应用内更新、断点续传与安装前校验，云端平台脚本更新、诊断包和缓存清理 | 原文未说明完整更新与诊断链路 |
| 适合的需求 | 使用最新工作台，按平台和部署配置启用聊天与运营能力 | 维护原有 Windows C# 客户端或查阅其功能、数据与发布链路 | 学习基础实现或在本仓库进行二次开发 |

**阅读说明：**旧版付费客户端的源码配置版本为 1.3.4，保留的原始截图来自 v1.1.0；两者分别反映不同时间的实现与界面。免费开源版以本仓库原有说明为准。“原文未说明”仅表示资料未记载。各付费版本的在线功能取决于平台能力、账号授权和服务端配置；具体体验与授权请联系下方支持入口。

**3.2 的主要变化：**旧版已经提供会话隔离、聊天翻译、画像、快捷回复和云素材等业务能力；3.2 在此基础上将 C# / CEF 宿主迁移为定制 Electron，重构工作台与模块结构，接入 NexaChat 新后端，并提供 macOS Apple Silicon 支持及按平台启用的语音转文字、AI 回复等能力。

## 目录

- [三个版本的区别](#版本对比)
- [NexaChat 3.2 重构版](#新版32)
- [旧版付费客户端与原始截图](#付费版本)
- [免费开源版与原始截图](#免费版本)
- [全套源码与定制化部署](#源码与部署)
- [免责声明](#免责声明)
- [联系方式](#联系方式)

---

<a id="新版32"></a>

## NexaChat 3.2 · 最新重构版

3.2 将平台入口、会话管理、独立环境配置和聊天工具整合到同一工作台。会话列表位于左侧，当前会话位于中间，翻译、画像、快捷回复和素材等工具位于右侧，便于在多账号之间切换。

### 功能概览

- **多平台、多账号会话**：在一个工作台中切换平台、创建和管理多个独立会话；会话支持启动、停止、批量操作与状态查看。
- **独立会话环境**：会话各自保存站点数据，可分别配置代理、浏览器指纹、地区、语言及时区等参数。
- **聊天辅助工具**：按平台能力提供发送与接收翻译、翻译预览、语音转文字、AI 回复、快捷回复、联系人画像与跟进记录、素材库等功能。
- **账号与运营管理**：提供账号同步、未读和运行状态、消息同步、WhatsApp 进粉统计、站内信与桌面通知等能力；实际可用功能依平台和服务端配置而异。
- **桌面工作流**：支持中英文界面、浅色与深色主题、命令面板、会话搜索、代理管理、客户端更新与诊断工具。

### 最新界面预览

以下截图由 NexaChat 3.2 客户端界面的离屏截图流程生成。截图使用隔离的演示数据和模拟主机，账号、聊天内容及代理信息均为虚构示例。

**多账号聊天与实时翻译**

![NexaChat 3.2 多账号会话与翻译面板](images/nexachat-v3.2/workbench-translate--zh-CN--light--1440x900.png)

<details>
<summary>工作台</summary>

![NexaChat 3.2 工作台首页](images/nexachat-v3.2/home--zh-CN--light--1440x900.png)

</details>

<details>
<summary>联系人画像与跟进</summary>

![NexaChat 3.2 联系人画像与跟进记录](images/nexachat-v3.2/workbench-portrait--zh-CN--light--1440x900.png)

</details>

<details>
<summary>快捷回复</summary>

![NexaChat 3.2 快捷回复面板](images/nexachat-v3.2/workbench-quick--zh-CN--light--1440x900.png)

</details>

<details>
<summary>代理管理</summary>

![NexaChat 3.2 代理管理](images/nexachat-v3.2/settings-proxy--zh-CN--light--1440x900.png)

</details>

<details>
<summary>会话指纹与网络配置</summary>

![NexaChat 3.2 会话代理和指纹配置](images/nexachat-v3.2/session-config-proxy-open--zh-CN--light--1440x900.png)

</details>

### 平台与能力

平台入口由平台清单驱动。WhatsApp 和 Telegram 集成了主要聊天辅助能力；其他平台按各自接入状态提供会话浏览、翻译、画像或快捷回复等功能。可用能力可能因平台、客户端版本和服务端配置而不同。

### 技术架构

- **桌面界面**：Vue 3、TypeScript、Vite。
- **桌面主机**：Electron 主进程，搭配定制的 fingerprint-electron 运行时，为每个会话建立独立浏览器环境。
- **平台接入**：由平台清单、平台脚本和能力配置管理入口与平台差异。
- **服务端**：NexaChat 新后端提供客户端 API、管理台和后台任务。翻译、额度、消息同步等在线能力需要按部署配置接入服务端。

客户端支持 Windows x64 与 macOS Apple Silicon。部分平台能力需要服务端或对应平台服务配合；首次使用时请按实际部署信息登录并配置。

### 项目结构

新版客户端主要目录如下：

| 目录 | 用途 |
|---|---|
| `electron/` | Electron 主进程、会话生命周期、持久化数据、代理与指纹配置 |
| `qd/` | Vue 桌面界面 |
| `platform/config/`、`platform/js/` | 平台清单、能力配置与平台适配脚本 |
| `server/` | NexaChat 后端与管理台 |
| `telegram-tt/` | 可选的 Telegram Web A 定制客户端 |

### 新版开发入口

以下命令在独立的新版 NexaChat 仓库中执行。本仓库免费开源版的启动说明见下方对应章节。

需要 Node.js 22.13 或更高版本及 npm。首次运行还需安装项目指定的定制 Electron 运行时。

```powershell
npm --prefix qd ci
npm --prefix qd run build
cd electron
npm install
npm run runtime:install -- --download
npm run dev
```

更多构建、部署和运行说明请查看新版仓库中的 `AGENTS.md`、`electron/README.md`、`qd/README.md`、`server/README.md` 与 `DEPLOYMENT.md`。

---

<a id="付费版本"></a>

## 旧版付费客户端 · C# / CEF（1.x）

旧版 NexaChat 是面向多平台客服、运营和外贸沟通的 Windows 桌面工作台。本节根据旧版仓库的项目说明、平台接入指南、右侧面板说明和打包文档补充；下方原始介绍与图片继续保留。

**版本口径：**所提供旧版源码的 `App.config` 与程序集版本均指向 **1.3.4**；下方历史截图显示 **v1.1.0**。截图用于保留历史界面，不代表 1.3.4 的全部功能。

### 架构与会话隔离

- **界面**：Vue 3、Vite、TypeScript、Tailwind CSS 与 Vue Router。
- **桌面宿主**：C# WinForms、.NET Framework 4.8，内嵌 FBroSharp / CEF 浏览器；通过前后端桥接调用和统一事件分发连接界面与宿主。
- **独立会话**：每个会话拥有独立浏览器实例、缓存目录和登录态，并可配置代理、浏览器指纹及启动网址；会话切换使用统一可视宿主与各会话后台停靠区域。
- **数据与发布**：SQLite 本地数据库，数据与日志位于 Windows 用户的 `%LOCALAPPDATA%/NexaChat/` 下；安装包使用 Inno Setup。

### 已有业务能力

- **跨语言聊天**：发送与接收翻译、发送前译文预览、消息译文展示，按平台和联系人保存翻译配置。
- **客户与话术管理**：联系人基本信息、标签、备注和跟进记录；按平台与通用分组管理文本快捷回复；从云素材库发送图片或视频。
- **消息与资源状态**：WhatsApp / Telegram 消息本地记录与同步、未读消息和平台角标、站内信，以及账号心跳、计费模式和端口额度状态。
- **发送前检测**：关键词和钱包检测，按服务端返回的拦截结果阻止发送。
- **更新与维护**：客户端应用内更新、后台下载、断点续传和安装前校验，平台脚本云端更新、诊断包导出与缓存清理。

平台由 `platforms.json` 和适配脚本 / 插件配置。所提供清单默认显示 Telegram、WhatsApp 和 Google，其他入口部分默认隐藏；翻译、画像、快捷回复与素材等工具按平台能力显示。右侧面板文档列出的入口为会话配置、翻译、画像、快捷回复和素材。

### 历史介绍与原始截图

<details>
<summary>展开原有介绍与 v1.1.0 历史截图</summary>

<a id="功能特点"></a>

### 功能特点

- ws；tg消息智能同步
- 违禁词拦截发送
- 客户端多语言支持
- 全新客户端 UI 优化多会话体验
- 多会话脚本优化；翻译支持实时显示
- 内核级别指纹支持
- socks代理支持

<a id="下载体验"></a>

### 最新版本下载体验联系

- **Telegram**: [@LinkSengs](https://t.me/LinkSengs) 

#### 界面预览

- **登录页面**  
  ![登录页面](images/nexachat/login.png)

- **首页**  
  ![首页](images/nexachat/home.png)

<a id="会话管理"></a>

#### 会话管理

- **WhatsApp 会话管理**  
  ![ws](images/nexachat/ws.png)

- **Telegram 会话管理**  
  ![tg](images/nexachat/tg.png)

<a id="指纹代理设置"></a>

#### 会话代理设置
![proxySetting1](images/nexachat/zhiwen1.png)
![proxySetting2](images/nexachat/zhiwen2.png)
![proxySetting3](images/nexachat/zhiwen3.png)

<a id="双向聊天实时翻译"></a>

#### 双向聊天实时翻译
![translate](images/nexachat/translate.png)

<a id="用户画像"></a>

#### 用户画像
![userInfo](images/nexachat/userinfo.png)

<a id="快捷回复"></a>

#### 快捷回复
![quickReply](images/nexachat/quk.png)

</details>

---

<a id="免费版本"></a>

## 免费版本

本节保留本仓库免费开源版的架构、使用说明和原始图片。

<details>
<summary>展开免费开源版介绍、启动说明与原始截图</summary>

WhatsApp 多账号管理、Telegram 多账号管理、WhatsApp 实时翻译

<a id="项目架构"></a>

### 项目架构

- **桌面端**：electron-egg
- **翻译端**：Spring Boot 2.6.4、Mybatis-Plus、JWT、Spring Security、Redis、Vue 的前后端分离的后台管理系统

<a id="功能介绍"></a>

### 功能介绍

1. 账号多开，独立环境独立 cookie 数据，可无限多开管理账号
2. 独立代理，每个会话可以单独配置代理信息
3. 聚合翻译，软件内置翻译功能，聊天实时翻译，可自定义翻译语言

<a id="文档"></a>

### 文档

- 桌面端使用基于 electron 开源框架 electron-egg: https://www.kaka996.com
- 后台翻译授权后台管理端: https://eladmin.vip

<a id="项目截图"></a>

### 项目截图

<a id="桌面端"></a>

#### 桌面端

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

#### 后台翻译端

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

### 项目启动流程

1. 先将后台翻译授权系统启动
2. 启动成功后再启动该项目，进入根目录 package.json 文件，安装依赖然后运行 `npm dev` 即可

<a id="备注"></a>

### 备注

- 项目目前只实现了基本的功能，有能力的可以直接拉取项目二次开发
- 如果嫌弃麻烦也可以直接下载我打包后的软件直接体验
- 欢迎提交宝贵意见，如有 bug，请提交 issue，我看到有时间会进行修复

</details>

---

<a id="源码与部署"></a>

## 全套源码与定制化部署

提供 NexaChat 全套源码交付与定制化部署服务，满足自主维护、二次开发和业务落地需求。

| 服务 | 内容 |
|---|---|
| 全套源码交付 | 提供软件源码，便于自主维护、功能扩展与二次开发；交付范围及版本可联系咨询。 |
| 定制化部署 | 根据品牌、运行环境和业务需求，沟通部署配置及功能定制方案。 |
| 软件体验与授权咨询 | 了解版本功能、体验方式与授权方案，选择适合业务需求的版本。 |

欢迎说明所需版本、使用场景及定制需求，我们将据此沟通交付和部署方案。[联系咨询](#联系方式)

---

<a id="免责声明"></a>

## 免责声明

- 在使用本项目之前，您应自行评估并承担相应的风险。项目贡献者不保证本项目适合您的特定需求或用途，也不保证项目的完整性、准确性和及时性。

- 使用本项目即表示您同意自行承担所有风险和责任。对于因使用或无法使用本项目而引起的任何索赔、损害或其他责任，项目贡献者概不负责。

<a id="联系方式"></a>

## 联系方式

咨询 **全套源码、定制化部署、软件体验与授权**，欢迎通过 Telegram 联系：

- **Telegram**：[@zhonghe785](https://t.me/zhonghe785)
- **Telegram**: [@LinkSengs](https://t.me/LinkSengs)
