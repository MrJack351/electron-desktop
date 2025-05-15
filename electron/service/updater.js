'use strict';
const { app: electronApp } = require('electron');
const { Service } = require('ee-core');
const Log = require('ee-core/log');
const CoreWindow = require('ee-core/electron/window');
const Electron = require('ee-core/electron');
const UtilsIS = require('ee-core/utils/is');
const Ps = require('ee-core/ps');
const UtilsHelper = require('ee-core/utils/helper');
const IncrUpdaterPlugin = require('ee-incremental-updater');

class UpdaterService extends Service {

    constructor(ctx) {
        super(ctx);
    }

    /**
     * 加载
     */
    load() {
        const status = {
            error: -1,
            available: 1,
            noAvailable: 2,
            downloading: 3,
            downloaded: 4,
        }
        const config = {
            // CDN 目录url 如果 https 无法下载，换成 http
            url: '',
            // 如果有特殊平台，可以指定一个固定的 json 文件
            // urlFile: 'incremental-latest-xxx.json',
            // 密钥
            token: '',
            // debug: false,
        };
        // 设置配置
        IncrUpdaterPlugin.setConfig(config);
        // 监听可用更新事件
        IncrUpdaterPlugin.on('update-available', (info) => {
            const content = {
                status: status.available,
                version: info.version,
            }
            this._sendToWindow(content);
        })
        // 监听不可用更新事件
        IncrUpdaterPlugin.on('update-not-available', () => {
            const content = {
                status: status.noAvailable,
            }
            this._sendToWindow(content);
        })
        // 监听下载进度事件
        // state 包含以下属性：
        // {
        //   time: { elapsed: 2.005, remaining: 1.27 },
        //   speed: 2857773.566084788,
        //   percent: 0.6121836146128672,
        //   size: { total: 9359669, transferred: 5729836 }
        // }
        IncrUpdaterPlugin.on("download-progress", (state) => {
            const content = {
                status: status.downloading,
                percent: String(Math.round(state.percent * 100)),
                totalSize: IncrUpdaterPlugin.bytesChange(state.size.total),
                transferredSize: IncrUpdaterPlugin.bytesChange(state.size.transferred),
            }

            this._sendToWindow(content);
        });
        // 监听下载完成事件
        IncrUpdaterPlugin.on("update-downloaded", () => {
            const content = {
                status: status.downloaded,
                desc: '下载完成',
            }
            this._sendToWindow(content);

            // 托盘插件默认会阻止窗口关闭，这里设置允许关闭窗口
            Electron.extra.closeWindow = true;
        });
        // 监听下载错误事件
        IncrUpdaterPlugin.on('error', (error) => {
            Log.error(error.msg);
        })
    }

    /**
     * 检查更新
     */
    async checkUpdate() {
        const res = await IncrUpdaterPlugin.checkAvailable();
        Log.info('检查更新：', res);
        Log.info('插件对象：', IncrUpdaterPlugin);
    }

    /**
     * 下载
     */
    async download() {
        IncrUpdaterPlugin.download();
    }

    /**
     * 重启
     */
    async relaunchApp() {
        // 打包安装后才调用
        if (!Ps.isPackaged()) return;

        // 安装并重启
        // 等待1秒,让日志打印完毕,因为经过测试上面代码大概在100ms内执行完毕,为了保险起见,等待1秒,让日志打印完毕
        IncrUpdaterPlugin.installApp();
        await UtilsHelper.sleep(1000)
        if (UtilsIS.macOS()) {
            electronApp.relaunch()
            electronApp.quit()
        } else {
            electronApp.quit()
        }
    }

    /**
     * 本地/当前版本
     */
    currentVersion() {
        const v = electronApp.getVersion();
        return v;
    }

    /**
     * 向窗口发消息
     */
    _sendToWindow(content = {}) {
        const textJson = JSON.stringify(content);
        const channel = 'custom.app.updater';
        const win = CoreWindow.getMainWindow();
        win.webContents.send(channel, textJson);
    }
}

UpdaterService.toString = () => '[class UpdaterService]';
module.exports = UpdaterService;
