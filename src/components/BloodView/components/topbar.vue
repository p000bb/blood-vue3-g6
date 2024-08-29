<template>
  <div>
    <div class="flex items-center px-[10px] leading-8 gap-4">
      <div class="flex items-center gap-2 text-sm">
        <span>字段级血缘关系</span>
        <el-switch v-model="fieldCheckedRef" size="small" />
      </div>
      <!-- <el-select v-model="keyword" placeholder="请输入表名" class="w-20">
      </el-select> -->
      <!-- <div class="flex items-center gap-2 text-sm">
        <span>完整血缘链路</span>
        <el-switch v-model="wholeCheckedRef" size="small" />
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface TopBarProps {
  fieldChecked: boolean /* 字段级血缘关系 */;
  wholeChecked: boolean /* 完整血缘链路 */;
  keyword: string /* 搜索关键字 */;
}

const props = defineProps<TopBarProps>();

const emits = defineEmits([
  "update:fieldChecked",
  "update:wholeChecked",
  "update:keyword",
]);

const fieldCheckedRef = computed({
  get() {
    return props.fieldChecked;
  },
  set(val: boolean) {
    emits("update:fieldChecked", val);
  },
});

// const wholeCheckedRef = computed({
//   get() {
//     return props.wholeChecked;
//   },
//   set(val: boolean) {
//     emits("update:wholeChecked", val);
//   },
// });

// const keyword = computed({
//   get() {
//     return props.keyword;
//   },
//   set(val: string) {
//     emits("update:keyword", val);
//   },
// });
</script>
<style scoped></style>
