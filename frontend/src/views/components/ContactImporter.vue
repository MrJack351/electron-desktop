<template>
  <el-drawer
      ref="uploadRef"
      class="drawer-config"
      :modal="true"
      size="290"
      :show-close="true"
      :remove="removeFile"
      v-model="drawerVisible"
      direction="ltr"
      @close="handleClose"
  >
    <template #header>
      <div class="drawer-header">
        <h3>导入联系人</h3>
      </div>
    </template>
    <template #default>
      <!-- 模式切换按钮 -->
      <el-row class="drawer-header-row" :loading="loading">
        <el-col :span="24">
          <el-radio-group v-model="importMode" size="small">
            <el-radio-button value="file">文件导入</el-radio-button>
            <el-radio-button value="textarea">文本导入</el-radio-button>
            <el-radio-button value="database">本地读取</el-radio-button>
          </el-radio-group>
        </el-col>
      </el-row>
      <el-row>
        <!-- 文件上传模式 -->
        <el-col :span="24" v-if="importMode === 'file'" style="padding:20px 20px 5px 20px">
          <el-upload
              ref="uploadRef"
              :drag="true"
              action=""
              :auto-upload="false"
              :show-file-list="true"
              accept=".txt"
              @change="handleFileChange"
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将 .txt 文件拖到此处，或点击上传</div>
            <div class="el-upload__tip">仅支持 .txt 文件，每行一个号码</div>
          </el-upload>
        </el-col>
        <!-- 文本框模式 -->
        <el-col :span="24" v-if="importMode === 'textarea'" style="padding:20px 20px 5px 20px">
          <el-input
              type="textarea"
              v-model="contactText"
              placeholder="在此输入联系人号码，每行一个"
              :rows="6"
          ></el-input>
        </el-col>
        <!-- 数据库读取 -->
        <el-col :span="24" v-if="importMode === 'database'" style="padding:20px 20px 5px 20px"/>

        <el-col :span="12">
          <el-button type="primary" v-if="importMode !=='database'" size="default" @click="readData">读取数据</el-button>
        </el-col>
        <el-col :span="12">
          <el-button type="primary" v-if="importMode !=='database'" size="default" :disabled="!contacts.length > 0" :loading="filterButtonLoading" @click="filterNumber">一键过滤</el-button>
        </el-col>
      </el-row>
      <el-row>
        <el-table :data="tableData" v-loading="tableLoading" style="width: 100%">
          <el-table-column :show-overflow-tooltip="true" align="center" label="号码" prop="phone_number" />
          <el-table-column label="状态" align="center" prop="phone_status">
            <template #default="{ row }">
              <!-- 状态为 "true" 时显示绿色标签 -->
              <el-tag
                  v-if="row.phone_status === 'true'"
                  type="success"
                  effect="plain"
              >
                存在
              </el-tag>

              <!-- 状态为 "false" 时显示灰色标签 -->
              <el-tag
                  v-else-if="row.phone_status === 'false'"
                  type="info"
                  effect="plain"
              >
                不存在
              </el-tag>

              <!-- 状态为 "-" 时显示黄色标签 -->
              <el-tag
                  v-else
                  type="warning"
                  effect="plain"
              >
                待检测
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作">
            <template #default="scope">
              <div class="no-wrap">
                <el-button
                    :icon="Message"
                    circle
                    :disabled="!(scope.row.phone_status === 'true')"
                    size="small"
                    type="primary"
                    @click="sendMessage(scope.row)"
                />
                <el-button
                    :icon="Delete"
                    circle
                    v-if="importMode === 'database'"
                    size="small"
                    type="danger"
                    @click="deleteNumber(scope.row)"
                />
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-row>
    </template>
    <template #footer>
      <el-row class="drawer-footer">
        <el-col :span="24" style="display: flex; justify-content: center;">
          <el-button @click="cancelImport">关闭</el-button>
<!--          <el-button type="primary" @click="confirmClick">导入</el-button>-->
        </el-col>
      </el-row>
    </template>
  </el-drawer>
</template>

<script setup>
import {onMounted, ref, watch} from 'vue';
import { Message,Delete} from '@element-plus/icons-vue';
const uploadRef = ref(null);
const loading = ref(false);
const selectedFile = ref(null); // 用于保存选中的文件对象
const contacts = ref([]);       // 存储解析后的联系人列表
import { ipc } from '@/utils/ipcRenderer';
// 定义通信频道，即路由
const ipcApiRoute = {
  filterNumber: 'controller.window.filterNumber',
  sendMessage: 'controller.window.sendMessage',
  getPhoneNumberList: 'controller.window.getPhoneNumberList',
  deletePhoneNumber: 'controller.window.deletePhoneNumber',
};
const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  cardData: {
    type: Object,
    default: ''
  }
});

const emit = defineEmits(['update:visible']);

const drawerVisible = ref(props.visible);
const importMode = ref('file'); // 导入模式，默认为文件上传模式
const contactText = ref('');    // 文本框输入的联系人数据
const tableData = ref([]);    // 文本框输入的联系人数据
const tableLoading = ref(false);
const filterFlag = ref(false);
const filterButtonLoading = ref(false);
// 监听父组件传入的 visible 属性
// 监听父组件传入的 `visible` 属性变化
watch(
    // 监听的属性
    () => props.visible,
    // 当 `visible` 属性发生变化时执行此回调函数
    (newVal) => {
      // 将 `drawerVisible` 的值同步为 `props.visible` 的新值
      drawerVisible.value = newVal;
      // 如果新值为 `true`（即抽屉可见），则重置数据
      if (newVal) {
        // 清空联系人列表
        contacts.value = [];
        // 清空表格数据
        tableData.value = [];
        importMode.value = 'file';
        tableData.value = [];
        // 清空文本输入的联系人数据
        contactText.value = '';
      }
    }
);
// 监听 `importMode` 的值变化
watch(
    () => importMode.value,  // 监听的目标，即 `importMode` 的值

    (newVal) => {
      // 当 `importMode` 的值变为 'database' 时，执行特定操作
      if (newVal === 'database') {
        getTableData()
      }else {
        contacts.value = [];
        filterButtonLoading.value = false;
        filterFlag.value = false;
        tableLoading.value = false;
        tableData.value = [];
      }
    }
);
onMounted(()=>{
  // 先移除之前的监听器，避免重复监听
  ipc.removeAllListeners('number_filter-notify');
  // 添加新的监听器
  ipc.on('number_filter-notify', (event, data) => {
    // 在这里处理接收到的数据
    filterFlag.value = true;
    const row = tableData.value.find(item => item.phone_number === data.phoneNumber);
    if (row){
      row.phone_status = data.result.phone_status;
    }
  });
})

// 关闭时触发 update:visible 事件通知父组件
const handleClose = () => {
  emit('update:visible', false);
  contactText.value = '';
  contacts.value = [];
  selectedFile.value = null; // 重置选中的文件对象
};

// 当文件选择变化时，保存文件对象
const handleFileChange = (file) => {
  console.log("文件选择完成:", file);
  selectedFile.value = file.raw; // 保存文件对象
};

const removeFile = () => {
  contacts.value = []
}
// 点击“读取数据”按钮时读取文件内容
const readData = () => {
  loading.value = true;
  if (importMode.value === 'file') {
    if (!selectedFile.value) {
      alert('未选择文件');
      loading.value = false;
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      // 获取文件内容并按行分割
      const fileContent = event.target.result;
      contacts.value = fileContent
          .split('\n')
          .map(line => line.trim())
          .filter(line => line !== '');

      // 初始化表格数据，确保在文件读取完成后
      tableData.value = contacts.value.map(item => ({
        phone_number: item.toString(),
        status: 'false',
      }));
      // 文件读取完成后清空文件列表和 selectedFile
      if (uploadRef.value) {
        uploadRef.value.clearFiles();
      }
      selectedFile.value = null; // 清空文件对象，确保下次不使用旧数据
      loading.value = false;
    };

    reader.onerror = (error) => {
      console.error("文件读取出错：", error);
      loading.value = false;
    };

    // 读取文件内容为文本
    reader.readAsText(selectedFile.value);

  } else {
    if (!contactText.value || contactText.value.trim() === '') {
      alert('请输入有效数据');
      loading.value = false;
      return;
    }

    // 文本框模式，解析 contactText 中的数据
    parseContacts(contactText.value);

    // 初始化表格数据
    tableData.value = contacts.value.map(item => ({
      phone_number: item.toString(),
      phone_status: '-',
    }));
    loading.value = false;
  }
};
// 号码过滤函数
const waitForFlagToBeTrue = () => {
  return new Promise((resolve) => {
    const checkFlag = () => {
      if (filterFlag.value) {
        resolve(); // 当 filterFlag 为 true 时，继续执行
      } else {
        setTimeout(checkFlag, 100); // 每隔 100ms 检查一次
      }
    };
    checkFlag();
  });
};

const filterNumber = async () => {
  filterButtonLoading.value = true;
  filterFlag.value = true;
  for (const row of tableData.value) {
    if (!filterFlag.value) await waitForFlagToBeTrue();
    filterFlag.value = false;
    // 准备调用的参数
    const args = {
      cardId: props.cardData.cardId,
      platform: props.cardData.platform,
      phoneNumber: row.phone_number
    };
    try {
      // 调用 ipc 方法并等待结果
      const result = await ipc.invoke(ipcApiRoute.filterNumber, args)
      if (result.status) {
        filterFlag.value = true;
        row.phone_status = result.data.phoneStatus;
        //跳过这条记录进行下一条
        continue;
      }
    } catch (error) {
      console.error('号码过滤过程中出错:', error);
    }
    // 将 filterFlag 设为 false 等待下一次检测时手动恢复
    filterFlag.value = false;
  }
  filterFlag.value = true;
  // 过滤完成后恢复按钮的状态
  filterButtonLoading.value = false;
};
//发送消息
const sendMessage = (row)=>{
  const args = {cardId: props.cardData.cardId,platform:props.cardData.platform,phoneNumber:row.phone_number};
  ipc.invoke(ipcApiRoute.sendMessage, args)
}
const deleteNumber = (row)=>{
  const args = {platform:props.cardData.platform,phoneNumber:row.phone_number};
  ipc.invoke(ipcApiRoute.deletePhoneNumber, args).then(res => {
    if (res.status) {
      getTableData()
    }
  })
}
const getTableData = () => {
  tableLoading.value = true;
  // 准备调用的参数
  const args = {
    cardId: props.cardData.cardId,
    platform: props.cardData.platform,
  };
  ipc.invoke(ipcApiRoute.getPhoneNumberList,args).then((res) => {
    if (res.status) {
      tableData.value = res.data;
    }
    tableLoading.value = false;
  })
}
// 解析联系人数据
const parseContacts = (content) => {
  const lines = content.split('\n');
  const uniqueContacts = new Set();

  lines.forEach(line => {
    const contact = line.trim();
    if (contact) {  // 忽略空行
      uniqueContacts.add(contact);
    }
  });

  contacts.value = Array.from(uniqueContacts);
};

// 点击 "确认导入" 时处理
const confirmClick = () => {

  handleClose();
};

// 取消导入
const cancelImport = () => {
  handleClose();
};
</script>

<style scoped>
.no-wrap {
  display: flex;          /* 使用 flex 布局 */
  gap: 1px;               /* 设置按钮之间的间距 */
  white-space: nowrap;    /* 禁止换行 */
  justify-content: center;    /* 垂直居中对齐 */
}
.drawer-config {
  padding: 0;
}

.drawer-header {
  margin-top: 10px;
}

.drawer-header h3 {
  margin: 10px;
}

.drawer-header-row {
  text-align: center;
}

.drawer-footer {
  display: flex;
  justify-content: center;
}
</style>
