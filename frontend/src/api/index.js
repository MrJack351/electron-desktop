/**
 * 主进程与渲染进程通信频道定义
 * 格式：控制器.文件名.方法
 * Definition of communication channels between main process and rendering process
 */
const ipcRoute = {
    // updater
    getAppInfo: 'controller.updater.appInfo',
    checkForUpdater: 'controller.updater.checkForUpdater',
    downloadApp: 'controller.updater.downloadApp',
    relaunchApp: 'controller.updater.relaunchApp',
}

/**
 * 自定义频道
 * 格式：自定义（推荐添加一个前缀）
 * custom chennel
 */
const specialIpcRoute = {
    appUpdater: 'custom.app.updater', // updater channel
}

export {
    ipcRoute,
    specialIpcRoute
}
