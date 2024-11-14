<template>
  <el-drawer
      class="drawer-user-portrait"
      :modal="true"
      size="290"
      :show-close="true"
      v-model="drawerVisible"
      direction="ltr"
      @close="handleClose"
  >
    <template #header>
      <div class="drawer-header">
        <h3>用户画像</h3>
      </div>
    </template>

    <template #default>
      <el-form :model="formData" label-width="70px" class="contact-form">
        <!-- 手机号 -->
        <el-form-item label="手机号">
          <el-input v-model="formData.phone_number" placeholder="请输入手机号" disabled></el-input>
        </el-form-item>

        <!-- 昵称 -->
        <el-form-item label="昵称">
          <el-input v-model="formData.nickname" placeholder="请输入昵称"></el-input>
        </el-form-item>

        <!-- 国家 -->
        <el-form-item label="国家">
          <el-input v-model="formData.country" placeholder="请输入国家"></el-input>
        </el-form-item>

        <!-- 性别 -->
        <el-form-item label="性别">
          <el-radio-group v-model="formData.gender">
            <el-radio :value="'男'">男</el-radio>
            <el-radio :value="'女'">女</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 备注 -->
        <el-form-item label="备注">
          <el-input v-model="formData.notes" type="textarea" placeholder="请输入备注" :rows="2"></el-input>
        </el-form-item>

        <!-- 跟进记录 -->
        <el-form-item label="跟进记录">
          <div style="display: flex; align-items: center;">
            <el-input type="textarea" v-model="newFollowUpContent" placeholder="输入内容" style="flex: 1; margin-right: 10px;"></el-input>
            <el-button
                type="primary"
                :icon="Plus"
            circle
            @click="addFollowUp"
            ></el-button>
          </div>
        </el-form-item>

        <div class="follow-up-list">
          <!-- 使用时间线组件 -->
          <el-timeline>
            <el-timeline-item
                top
                :icon="MoreFilled"
                color="#5C9EFF"
                v-for="(record, index) in followUpRecords"
                :key="index"
                :timestamp="record.time"
            >
              {{ record.content }}
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-form>
    </template>

    <template #footer>
      <el-row class="drawer-footer">
        <el-col :span="24" style="display: flex; justify-content: center;">
          <el-button @click="cancelImport">关闭</el-button>
          <el-button type="primary" @click="confirmClick">保存</el-button>
        </el-col>
      </el-row>
    </template>
  </el-drawer>
</template>

<script setup>
import {onMounted, ref, watch} from 'vue';
import { MoreFilled ,Plus} from '@element-plus/icons-vue'
import {ipc} from "@/utils/ipcRenderer";

const formData = ref({
  phone_number: '',
  platform: '',
  card_id: '',
  nickname: '',
  country: '',
  gender: '',
  notes: '',
});
const followUpRecords = ref([]);
const newFollowUpContent = ref(''); // 新增跟进内容输入框的内容

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
const userInfo = ref({})
// 定义通信频道，即路由
const ipcApiRoute = {
  addFollowRecord: 'controller.user.addFollowRecord',
  updateUserInfo: 'controller.user.updateUserInfo',
  getUserPortrait: 'controller.user.getUserPortrait',
};
const emit = defineEmits(['update:visible']);
const drawerVisible = ref(props.visible);
onMounted(()=>{
  ipc.removeAllListeners('open-user-portrait');
  // 添加新打开用户画像panel监听
  ipc.on('open-user-portrait', (event, res) => {
    drawerVisible.value = !drawerVisible.value;
    if (res.status) {
      userInfo.value = res.userInfo;
      formData.value.phone_number = res.userInfo.phone_number;
      formData.value.platform = res.userInfo.platform;
      formData.value.card_id = res.userInfo.card_id;
      followUpRecords.value = res.record;
      getUserPortraitData()
    }
  });
})
watch(
    () => props.visible,
    (newVal) => {
      drawerVisible.value = newVal;
    }
);

const handleClose = () => {
  drawerVisible.value = false;
};

// 添加跟进记录
const addFollowUp = () => {
  if (newFollowUpContent.value.trim()) {
    const time = new Date().toLocaleString()
    const content = newFollowUpContent.value
    const args = {time,content,platform:userInfo.value.platform,card_id:userInfo.value.card_id,phone_number:userInfo.value.phone_number};
    ipc.invoke(ipcApiRoute.addFollowRecord, args).then(res=>{
      if (res.status) {
        followUpRecords.value.push({
          time,
          content
        });
        newFollowUpContent.value = ''; // 清空输入框
      }
    })
  }
};

// 点击“保存”时触发的函数
const confirmClick = async () => {
  const args = {
    phone_number: formData.value.phone_number,
    platform: formData.value.platform,
    card_id: formData.value.card_id,
    nickname: formData.value.nickname,
    country: formData.value.country,
    gender: formData.value.gender,
    notes: formData.value.notes,
  }
  ipc.invoke(ipcApiRoute.updateUserInfo, args).then(res=>{
    if (res.status) {
      getUserPortraitData()
    }
  })
};

const getUserPortraitData = ()=>{
  const args = {card_id:userInfo.value.card_id,platform:userInfo.value.platform,phone_number:userInfo.value.phone_number}
  ipc.invoke(ipcApiRoute.getUserPortrait, args).then(res=>{
    formData.value = res.userInfo;
    followUpRecords.value = res.record;
  })
}

const cancelImport = () => {
  handleClose();
};
</script>

<style scoped>
.drawer-user-portrait {
  padding: 0;
}

.drawer-header {
  margin-top: 10px;
}

.drawer-header h3 {
  margin: 10px;
}

.user-portrait-form {
  padding: 20px;
}

.drawer-footer {
  display: flex;
  justify-content: center;
}

.follow-up-list {
  margin-top: 10px;
}
</style>
