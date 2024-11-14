// 使用 CommonJS 语法
const { contextBridge, ipcRenderer } = require('electron');

// 在 contextBridge 中暴露 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  ipcRenderer: ipcRenderer,
  // 号码过滤通知
  sendFilterNotify: (data) => {
    ipcRenderer.send('filter-notify', data);
  },
  // 暴露通知函数，使用 Bulma 样式
  showNotification: ({ message = '默认通知', type = 'is-info' }) => {
    // 创建通知容器
    const notification = document.createElement('div');
    notification.classList.add('notification', type); // 使用 Bulma 的类

    // 设置通知的内HTML结构
    notification.innerHTML = `
      <button class="delete"></button>
      ${message}
    `;

    // 设置通知的基本样式和动画
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: '9999',
      width: '320px',
      opacity: '0', // 初始透明度
      transform: 'translateY(-20px)', // 初始位移
      transition: 'opacity 0.4s ease, transform 0.4s ease', // 动画效果
    });

    // 将通知元素添加到页面中
    document.body.appendChild(notification);

    // 显示通知的动画效果
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0)';
    }, 10);

    // 添加关闭按钮的事件
    const closeButton = notification.querySelector('.delete');
    closeButton.addEventListener('click', () => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-20px)';
      setTimeout(() => {
        notification.remove();
      }, 400);
    });

    // 自动移除通知
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-20px)';
      setTimeout(() => {
        notification.remove();
      }, 400);
    }, 3000); // 通知显示3秒后消失
  },
  languageList: () => {
    return ipcRenderer.invoke('language-list');
  },
  translateText: (args) => {
    return ipcRenderer.invoke('translate-text', args);
  },
  sendMsg: (args) => {
    return ipcRenderer.invoke('online-notify', args);
  },
  newMsgNotify: (args) => {
    return ipcRenderer.invoke('new-message-notify', args);
  },
  //打开用户画像弹窗
  showUserPortraitPanel: (args) => {
    return ipcRenderer.invoke('show-user-portrait-panel', args);
  }

});

// 在页面加载完成时发送消息，包括当前页面的 URL
window.addEventListener('load', () => {
  const currentURL = window.location.href;
  //执行对应平台的js代码
  ipcRenderer.send('execute-js-operation', currentURL);
  // window.electron.ipcRenderer.on('show-notify', async (event, args) => {
  //   const {type,message} = args;
  //   window.electron.showNotification(message, 'is-'+type);
  // });
});

