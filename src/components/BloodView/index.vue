<template>
  <div class="flex flex-col w-full h-full">
    <Header
      id="header"
      v-model:highlight="highlight"
      v-model:waterMaker="waterMaker"
      v-model:layout="layout"
      v-model:sourceColor="sourceColor"
      v-model:midColor="midColor"
      v-model:endColor="endColor"
      @upload="setLineageData"
      @render="renderGraph"
      class="flex-none"
    />
    <div class="flex flex-auto">
      <Aside
        v-show="showAside"
        id="aside"
        class="flex-none h-full"
        :class="setAsideClass"
        v-model:xmlData="xmlData"
        ref="asideRef"
      />
      <Main
        ref="mainRef"
        v-show="showMain"
        class="flex-1"
        :layout="layout"
        :highlight="highlight"
        :waterMaker="waterMaker"
        :lineageData="lineageData"
        :sourceColor="sourceColor"
        :midColor="midColor"
        :endColor="endColor"
        v-model:nodeSize="nodeSize"
      />
    </div>
    <Footer :nodeSize="nodeSize" class="flex-none" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import Header from "./header.vue";
import Aside from "./aside.vue";
import Main from "./main.vue";
import { transformBoold, parseXml } from "./utils/common";
import { getOption, setOption } from "./utils/local-storage";

/* 连线高亮色 */
const highlight = ref<string>("#FF0000");

/* 水印文字 */
const waterMaker = ref<string>("");

/* 血缘数据 */
const lineageData = ref<any>();

/* xml数据 */
const xmlData = ref<string>("");

/* 节点大小 */
const nodeSize = ref<number>(0);

/* 布局方式 */
const layout = ref<string>("asdie+main");

/* 起始表颜色 */
const sourceColor = ref<string>("#91c050");

/* 中间表颜色 */
const midColor = ref<string>("#d26b58");

/* 最终表颜色 */
const endColor = ref<string>("#419a60");

const asideRef = ref<any>(null);

const mainRef = ref<any>(null);

const setLineageData = (val: any, xml: string) => {
  lineageData.value = val;
  xmlData.value = xml;
  asideRef.value.jsonEditRef.setValue(xml);
};

const renderGraph = () => {
  /* 校验语法 */
  const valid = asideRef.value.jsonEditRef.getEditorAnnotations();

  if (valid) {
    const { tableData, midTableData, endTableData, relationData } = parseXml(
      xmlData.value as string
    );

    lineageData.value = {
      withProcessData: {
        data: transformBoold({
          tableData: [...tableData, ...midTableData, ...endTableData],
          relationData,
        }),
      },
    };
  } else {
    alert("请检查xml格式");
  }
};

const showAside = computed(() => {
  return ["asdie+main", "asdie"].includes(layout.value);
});

const showMain = computed(() => {
  return ["asdie+main", "main"].includes(layout.value);
});

const setAsideClass = computed(() => {
  if (layout.value === "asdie") {
    return "w-screen";
  } else {
    return "w-[400px]";
  }
});

const _getOption = () => {
  const option = JSON.parse(getOption() as string);
  highlight.value = option.highlight;
  waterMaker.value = option.waterMaker;
  layout.value = option.layout;
  sourceColor.value = option.sourceColor;
  midColor.value = option.midColor;
  endColor.value = option.endColor;
};

const _setOption = () => {
  const option = JSON.stringify({
    highlight: highlight.value,
    waterMaker: waterMaker.value,
    layout: layout.value,
    sourceColor: sourceColor.value,
    midColor: midColor.value,
    endColor: endColor.value,
  });
  setOption(option);
};

onMounted(() => {
  window.addEventListener("beforeunload", _setOption);
  if (getOption()) {
    _getOption();
  } else {
    _setOption();
  }
});

onUnmounted(() => {
  window.removeEventListener("beforeunload", _setOption);
});
</script>
<style scoped>
/* @import "./index.scss"; */
</style>
