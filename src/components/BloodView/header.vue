<template>
  <header class="min-w-full text-gray-600">
    <div class="flex items-center justify-between px-5 py-3 shadow-md">
      <div class="flex items-center gap-4">
        <span class="text-2xl font-bold">血缘分析</span>
        <el-button @click="renderXml" type="primary">重新渲染</el-button>
      </div>
      <div class="flex items-center gap-4">
        <el-upload
          ref="upload"
          :auto-upload="false"
          class="flex items-center"
          title="上传"
          :on-change="fileChange"
          :on-exceed="handleExceed"
          :show-file-list="false"
          :limit="1"
          accept="text/xml"
        >
          <template #trigger>
            <el-button class="!p-2">
              <svg
                t="1724743992133"
                class="icon"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="4273"
                width="20"
                height="20"
              >
                <path
                  d="M153.6 902.656a32.256 32.256 0 0 1 0-64h716.8a32.256 32.256 0 0 1 0 64z m390.656-665.6v494.592a32.256 32.256 0 0 1-64 0V237.056L236.032 481.28a31.744 31.744 0 1 1-45.056-45.056l294.912-295.424a36.864 36.864 0 0 1 51.2 0l294.912 294.912a31.744 31.744 0 0 1-45.056 45.056z"
                  fill="#5A5A68"
                  p-id="4274"
                ></path>
              </svg>
            </el-button>
          </template>
        </el-upload>
        <el-popover
          :visible="open"
          placement="bottom"
          title="设置"
          :width="300"
          :teleported="false"
        >
          <template #reference>
            <el-button class="!p-2" @click="open = !open">
              <svg
                t="1724655351674"
                class="icon"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="4287"
                width="20"
                height="20"
              >
                <path
                  d="M512 357c-85.5 0-155 69.5-155 155s69.5 155 155 155 155-69.5 155-155-69.5-155-155-155z m0 250c-52.4 0-95-42.6-95-95s42.6-95 95-95 95 42.6 95 95-42.6 95-95 95z"
                  fill="#B3B3B3"
                  p-id="4288"
                ></path>
                <path
                  d="M910.1 405.8c-1.9-7.8-6.9-14.5-13.8-18.6-6.9-4.1-15.1-5.3-22.9-3.3-33.6 8.7-69.3-7.3-86.8-38.8-17.6-31.8-13.2-72.6 10.8-99.3 10.7-11.9 10.2-30.1-1.1-41.4-48.4-48-107.8-83.4-171.9-102.3-15.9-4.7-32.5 4.4-37.2 20.2-10.4 34.8-40.6 58.2-75.2 58.2s-64.8-23.4-75.2-58.2c-4.7-15.8-21.4-24.9-37.2-20.2-64.1 18.9-123.5 54.2-171.9 102.3-11.3 11.3-11.9 29.5-1.1 41.4 24 26.7 28.5 67.5 10.8 99.3-17.5 31.5-53.2 47.5-86.8 38.8-7.8-2-16-0.8-22.9 3.3-6.9 4.1-11.8 10.8-13.8 18.6-8.6 34.6-12.9 70.4-12.9 106.5 0 33.6 3.8 67.2 11.3 99.6 1.8 8 6.8 14.8 13.9 19 7 4.2 15.4 5.3 23.3 3.2 34-9.3 70.1 6.5 87.9 38.5 18.5 33.3 13 75.1-13.2 101.9-11.5 11.7-11.5 30.4 0 42 48.5 49.4 108.6 85.8 173.6 105.3 7.9 2.4 16.4 1.4 23.6-2.7 7.1-4.1 12.3-11 14.2-19 8.8-37 40.3-62.8 76.5-62.8s67.7 25.8 76.5 62.8c1.9 8 7.1 14.9 14.2 19 4.6 2.7 9.8 4 15 4 2.9 0 5.8-0.4 8.6-1.3 65-19.5 125-55.9 173.6-105.3 11.5-11.7 11.5-30.4 0-42-26.2-26.7-31.7-68.6-13.2-101.9 17.8-32 53.9-47.8 87.9-38.5 7.9 2.2 16.3 1 23.3-3.2s12-11.1 13.9-19c7.5-32.5 11.3-66 11.3-99.6-0.2-36.1-4.6-71.9-13.1-106.5z m-51.7 165.6c-50.2-1.4-98.5 25.6-124.3 72-26.2 47.2-23.9 104.7 3.9 148.9-30.5 26.8-65.3 48.1-102.5 62.7-8.9-17.9-21.5-34-36.9-46.7-24.5-20.2-55.3-31.3-86.7-31.3-31.4 0-62.2 11.1-86.7 31.3-15.4 12.7-28 28.7-36.9 46.7-37.2-14.6-71.9-35.9-102.5-62.7 27.7-44.2 30.1-101.8 3.9-148.9-25.8-46.5-74-73.4-124.3-72-3-19.5-4.6-39.3-4.6-59.2 0-22.2 1.9-44.3 5.7-66 19.3 0.3 38.6-3.4 56.5-11.1 28.3-12.3 51.4-33.3 66.7-60.8 15-27 21-57.5 17.4-88.3-2.4-20.1-8.7-39.1-18.5-56.2 30.7-26.4 65.5-47.3 102.7-61.5 9.3 16.8 21.8 31.5 37.1 43.5 24.2 18.9 53.1 28.8 83.6 28.8 30.4 0 59.3-10 83.6-28.8 15.3-11.9 27.9-26.6 37.1-43.5 37.1 14.2 72 35.1 102.7 61.5-9.9 17-16.2 36-18.5 56.2-3.6 30.8 2.4 61.4 17.4 88.3 15.3 27.5 38.4 48.6 66.7 60.8 17.9 7.7 37.2 11.5 56.5 11.1 3.8 21.7 5.7 43.8 5.7 66-0.2 19.9-1.7 39.7-4.8 59.2z"
                  fill="#B3B3B3"
                  p-id="4289"
                ></path>
              </svg>
            </el-button>
          </template>
          <template #default>
            <el-form ref="formRef" label-width="auto">
              <el-form-item label="水印文字：" prop="waterMaker">
                <el-input v-model="textWaterMaker" placeholder="" clearable />
              </el-form-item>
              <el-form-item label="选择线条高亮颜色：" prop="highlight">
                <el-color-picker v-model="highlightColor" show-alpha />
              </el-form-item>
              <el-form-item label="起始表颜色：" prop="sourceColor">
                <el-color-picker v-model="sourceColor" show-alpha />
              </el-form-item>
              <el-form-item label="中间表颜色：" prop="midColor">
                <el-color-picker v-model="midColor" show-alpha />
              </el-form-item>
              <el-form-item label="最终表颜色：" prop="endColor">
                <el-color-picker v-model="endColor" show-alpha />
              </el-form-item>
              <el-form-item label="布局方式：" prop="showLayout">
                <el-radio-group v-model="showLayout">
                  <el-radio label="asdie+main">编码区+内容区</el-radio>
                  <el-radio label="main">内容区</el-radio>
                  <el-radio label="asdie">编码区</el-radio>
                </el-radio-group>
              </el-form-item>
              <div class="flex justify-end">
                <el-button @click="cancel">关 闭</el-button>
              </div>
            </el-form>
          </template>
        </el-popover>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { parseXml, transformBoold } from "./utils/common";
import {
  genFileId,
  UploadInstance,
  UploadProps,
  UploadRawFile,
} from "element-plus";

interface SettingForm {
  waterMaker: string;
  highlight: string;
  layout: string;
  sourceColor: string;
  midColor: string;
  endColor: string;
}

const props = defineProps<SettingForm>();

const emits = defineEmits([
  "update:waterMaker",
  "update:highlight",
  "update:layout",
  "update:sourceColor",
  "update:midColor",
  "update:endColor",
  "upload",
  "render",
]);

// #region 水印文字和高亮颜色,布局方式
const textWaterMaker = computed({
  get() {
    return props.waterMaker;
  },
  set(val: string) {
    emits("update:waterMaker", val);
  },
});

const highlightColor = computed({
  get() {
    return props.highlight;
  },
  set(val: string) {
    emits("update:highlight", val);
  },
});

const showLayout = computed({
  get() {
    return props.layout;
  },
  set(val: string) {
    emits("update:layout", val);
  },
});

const sourceColor = computed({
  get() {
    return props.sourceColor;
  },
  set(val: string) {
    emits("update:sourceColor", val);
  },
});

const midColor = computed({
  get() {
    return props.midColor;
  },
  set(val: string) {
    emits("update:midColor", val);
  },
});

const endColor = computed({
  get() {
    return props.endColor;
  },
  set(val: string) {
    emits("update:endColor", val);
  },
});
// #endregion

const cancel = () => {
  open.value = false;
};

const open = ref<boolean>(false);

// #region 上传文件
const upload = ref<UploadInstance>();

const fileChange = (file: any) => {
  // 解析xml文件成text
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      if (e.target?.result) {
        const { tableData, midTableData, endTableData, relationData } =
          parseXml(e.target?.result as string);
        emits(
          "upload",
          {
            withProcessData: {
              data: transformBoold({
                tableData: [...tableData, ...midTableData, ...endTableData],
                relationData,
              }),
            },
          },
          e.target?.result as string
        );
      }
    } catch (err) {
      console.log(err);
      alert("文件解析失败");
    }
  };

  reader.readAsText(file.raw);
};

const handleExceed: UploadProps["onExceed"] = (files: any) => {
  upload.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  upload.value!.handleStart(file);
};
// #endregion

// #region 重新渲染
const renderXml = () => {
  emits("render");
};
// #endregion
</script>
<style scoped></style>
