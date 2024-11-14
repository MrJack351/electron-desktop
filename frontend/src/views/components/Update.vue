<template>
  <div id="effect-login-index">
    <div class="one-block-1">
      <span>
        当前版本:{{appVersion}} {{versionTips}}
      </span>
    </div>
    <div class="one-block-2">
      <el-space>
        <el-button @click="checkForUpdater">检查更新</el-button>
        <el-button v-if="available" @click="download">立即更新</el-button>
      </el-space>
    </div>
    <el-dialog
        v-model="modalVisible"
        @close="confirmOk"
        :close-on-click-modal="false"
        :show-close="false"
        :title="modalTitle"
    >
      <span>{{ modalText }}</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="confirmOk">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {ipcRoute, specialIpcRoute} from '@/api';
import {ipc} from '@/utils/ipcRenderer';
import {ElMessage} from 'element-plus';

const appVersion = ref('');
const versionTips = ref('');
const available = ref(false);
const modalVisible = ref(false);
const modalTitle = ref("更新提示");
const modalText = ref('更新完成请重新启动');

onMounted(() => {
  init()
})

function init() {
  ipc.removeAllListeners(specialIpcRoute.appUpdater);
  ipc.on(specialIpcRoute.appUpdater, (event, result) => {
    result = JSON.parse(result);
    console.log('收到新消息：',result);
    const {version, status, percent, error} = result;
    if (status == 1) {
      available.value = true;
      versionTips.value = "有可用更新 v" + version;
    } else if (status == 2) {
      versionTips.value = "已经是最新版本";
    } else if (status == 3) {
      versionTips.value = "已下载 " + percent + '%';
    } else if (status == 4) {
      versionTips.value = "下载完成";
      showModal();
    } else {
      ElMessage.error(error);
    }
  })
  ipc.invoke(ipcRoute.getAppInfo).then(result => {
    console.log(result);
    const {currentVersion} = result;
    appVersion.value = currentVersion;
  })
}

function checkForUpdater() {
  ipc.invoke(ipcRoute.checkForUpdater, {});
}

function download() {
  ipc.invoke(ipcRoute.downloadApp, {});
}

function showModal() {
  modalVisible.value = true;
}

function confirmOk() {
  modalVisible.value = false;
  ipc.invoke(ipcRoute.relaunchApp);
}

</script>

<style lang="less" scoped>
#effect-login-index {
  padding: 0px 10px;
  text-align: left;
  width: 100%;

  .one-block-1 {
    font-size: 16px;
    padding-top: 10px;
  }

  .one-block-2 {
    padding-top: 10px;
  }
}

.dialog-footer {
  text-align: right;
}
</style>
