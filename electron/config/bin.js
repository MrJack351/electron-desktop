/**
 * ee-bin 配置
 * 仅适用于开发环境
 */
module.exports = {
  // 添加一个命令对象
  /**
   * 增量更新命令
   * ee-bin updater --platform=
   */
  updater: {
    windows_64: {
      asarFile: './out/win-unpacked/resources/app.asar',
      output: {
        directory: './out',
        file: 'incremental-latest.json',
        zip: 'app.zip',
      },
      cleanCache: false,
    },
    macos_intel: {
      asarFile: './out/mac/seaToolbox.app/Contents/Resources/app.asar',
      output: {
        directory: './out',
        file: 'incremental-latest.json',
        zip: 'app.zip',
      },
      cleanCache: false,
    },
    macos_apple: {
      asarFile: './out/mac-arm64/seaToolbox.app/Contents/Resources/app.asar',
      output: {
        directory: './out',
        file: 'incremental-latest.json',
        zip: 'app.zip',
      },
      cleanCache: false,
    },
  },
    /**
   * development serve ("frontend" "electron" )
   * ee-bin dev
   */
  dev: {
    frontend: {
      directory: './frontend',
      cmd: 'npm',
      args: ['run', 'dev'],
      protocol: 'http://',
      hostname: 'localhost',
      port: 8080,
      indexPath: 'index.html'
    },
    electron: {
      directory: './',
      cmd: 'electron',
      args: ['.', '--env=local', '--color=always'],
    }
  },

  /**
   * 构建
   * ee-bin build
   */
  build: {
    frontend: {
      directory: './frontend',
      cmd: 'npm',
      args: ['run', 'build'],
    }
  },

  /**
   * 移动资源
   * ee-bin move
   */
  move: {
    frontend_dist: {
      dist: './frontend/dist',
      target: './public/dist'
    }
  },

  /**
   * 预发布模式（prod）
   * ee-bin start
   */
  start: {
    directory: './',
    cmd: 'electron',
    args: ['.', '--env=prod']
  },

  /**
   * 加密
   */
  encrypt: {
    type: 'confusion',
    files: [
      'electron/**/*.(js|json)',
      '!electron/config/encrypt.js',
      '!electron/config/nodemon.json',
      '!electron/config/builder.json',
      '!electron/config/bin.json',
    ],
    fileExt: ['.js'],
    confusionOptions: {
      compact: true,
      stringArray: true,
      stringArrayEncoding: ['none'],
      deadCodeInjection: false,
    }
  },

  /**
   * 执行自定义命令
   * ee-bin exec
   */
  exec: {
    node_v: {
      directory: './',
      cmd: 'node',
      args: ['-v'],
    },
    npm_v: {
      directory: './',
      cmd: 'npm',
      args: ['-v'],
    },
  },
};
