<template>
  <div>
    <div ref="wrapperRef" class="relative">
      <!-- 顶部栏 -->
      <div class="g6-component-topbar">
        <TopBar
          ref="topBarRef"
          v-model:fieldChecked="fieldChecked"
          v-model:wholeChecked="wholeChecked"
          v-model:keyword="keyword"
        />
      </div>
      <!-- 工具栏 -->
      <div class="g6-component-toolbar" ref="toolbarRef">
        <ToolBar :graph="graphRef" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TopBar from "./components/topbar.vue";
import ToolBar from "./components/toolbar.vue";
import { computed, nextTick, onMounted, ref, watch } from "vue";
import G6 from "@antv/g6";
import {
  collapseData,
  getLeftRelation,
  getRightRelation,
  transformData,
} from "./utils/common";
import {
  handleHighlightColor,
  handleNodeColor,
  handleTextWaterMarker,
  renderGraph,
  setLeftStats,
  setRightStats,
} from "./utils/graphUtil";

interface MainProps {
  layout: string /* 布局方式 */;
  waterMaker: string /* 水印文字 */;
  highlight: string /* 连线颜色 */;
  sourceColor: string /* 起始表颜色 */;
  midColor: string /* 中间表颜色 */;
  endColor: string /* 最终表颜色 */;
  lineageData: any /* 血缘数据 */;
  nodeSize: number /* 节点大小 */;
}

// #region 修改节点属性
const emits = defineEmits(["update:nodeSize"]);

const nodeSizeRef = computed({
  get() {
    return props.nodeSize ?? 0;
  },
  set(val) {
    emits("update:nodeSize", val);
  },
});
// #endregion

// #region 属性
const props = defineProps<MainProps>();

const wrapperRef = ref<any>(null);
const toolbarRef = ref<any>(null);
const graphRef = ref<any>(null);
const topBarRef = ref<any>(null);

const lineageWholeData = ref<any>(null);

const lineagePartData = ref<any>(null);
/* 字段级血缘关系 */
const fieldChecked = ref<boolean>(true);
/* 完整血缘链路 */
const wholeChecked = ref<boolean>(true);
/* 搜索关键字 */
const keyword = ref<string>("");
// #endregion

// #region 处理节点点击事件
const handleNodeClick = (
  graph: any,
  item: any,
  currentAnchor: string,
  name: string
) => {
  const model = item.getModel();
  const edges = item.getEdges();

  const leftActiveEdges: any[] = [];

  getLeftRelation(edges, model, currentAnchor, leftActiveEdges);

  const rightActiveEdges: any[] = [];

  getRightRelation(edges, model, currentAnchor, rightActiveEdges);

  // 清除状态
  clearAllStats(graph);

  // 设置当前节点状态
  graph.setItemState(item, name + "-" + currentAnchor, true);

  // 设置左关联边及节点状态
  setLeftStats(graph, leftActiveEdges, props.highlight, name);

  // 设置右关联边及节点状态
  setRightStats(graph, rightActiveEdges, props.highlight, name);
};
// #endregion

// #region 处理连线点击事件
const handleEdgeClick = (graph: any, item: any, name: string) => {
  const sourceNode = item.getSource();
  const sourceModel = sourceNode.getModel();
  const sourceEdges = sourceNode.getInEdges();

  // 获取当前连线的 source 节点
  const sourceAnchor = item.getModel()["sourceAnchor"];

  const leftActiveEdges: any[] = [];
  leftActiveEdges.push(item);

  getLeftRelation(sourceEdges, sourceModel, sourceAnchor, leftActiveEdges);

  const targetNode = item.getTarget();
  const targetModel = targetNode.getModel();
  const targetEdges = targetNode.getOutEdges();

  // 获取当前连线的 target 节点
  const targetAnchor = item.getModel()["targetAnchor"];

  const rightActiveEdges: any[] = [];
  rightActiveEdges.push(item);

  getRightRelation(targetEdges, targetModel, targetAnchor, rightActiveEdges);

  // 清除状态
  clearAllStats(graph);

  // 设置左关联边及节点状态
  setLeftStats(graph, leftActiveEdges, props.highlight, name);

  // 设置右关联边及节点状态
  setRightStats(graph, rightActiveEdges, props.highlight, name);
};
// #endregion

// #region 清除状态
const clearAllStats = (graph: any) => {
  if (!graph) return;
  graph.setAutoPaint(false);
  // 清除节点状态
  graph.getNodes().forEach(function (node: any) {
    graph.clearItemStates(node);
  });
  // 清除边状态
  graph.getEdges().forEach(function (edge: any) {
    graph.clearItemStates(edge);
  });
  graph.paint();
  graph.setAutoPaint(true);
};
// #endregion

// #region 事件绑定
const bindEvents = (graph: any) => {
  // 监听节点点击事件
  graph.off("node:click").on("node:click", (evt: any) => {
    const { item, target } = evt;
    const currentAnchor = target.get("name");
    if (!currentAnchor) return;

    if (fieldChecked.value) {
      handleNodeClick(graph, item, currentAnchor, "highlight");
    } else {
      handleNodeClick(graph, item, currentAnchor, "tableHighlight");
    }
  });

  // 监听连线点击事件
  graph.off("edge:click").on("edge:click", (evt: any) => {
    const { item } = evt;
    if (fieldChecked.value) {
      handleEdgeClick(graph, item, "highlight");
    } else {
      handleEdgeClick(graph, item, "tableHighlight");
    }
  });

  //监听只在 canvas 空白处点击事件
  graph.off("canvas:click").on("canvas:click", (_ev: any) => {
    // 清除状态
    clearAllStats(graph);
  });
};
// #endregion

// #region 初始化Graph
const initGraph = () => {
  if (!graphRef.value) {
    // 实例化 Minimap
    const minimap = new G6.Minimap();
    // 工具栏
    const toolbar = new G6.ToolBar({
      getContent: () => {
        return toolbarRef.value || "";
      },
    });

    //网格画布
    const grid = new G6.Grid();
    const container: any = wrapperRef.value;
    const windowWidth =
      document.documentElement.clientWidth -
      (document.querySelector("#aside")?.clientWidth || 0);
    const windowHeight = document.documentElement.clientHeight;
    const width = windowWidth;
    const height = window.outerHeight - 181 || windowHeight;
    // 实例化 Graph
    graphRef.value = new G6.Graph({
      container: container || "",
      width: width,
      height: height,
      plugins: [grid, minimap, toolbar],
      fitView: true,
      modes: {
        default: ["drag-canvas", "zoom-canvas", "drag-node"],
      },
      // 布局配置
      layout: {
        type: "dagre",
        rankdir: "LR", // 可选，默认为图的中心
        align: "UL", // 可选
        controlPoints: true,
        nodesep: 100,
        ranksep: 100,
        begin: [1000, 1000],
      },
      defaultNode: {
        type: "dice-er-box",
        color: "#096DD9",
        boxStyle: {
          stroke: "#096DD9",
          lineWidth: 6,
          radius: 4,
        },
        style: {
          fill: "#096DD9",
        },
        labelCfg: {
          style: {
            fill: "#ffffff",
            fontSize: 20,
          },
        },
      },
      defaultEdge: {
        type: "dice-er-edge",
        style: {
          stroke: "#6C6B6B",
          lineWidth: 2,
          endArrow: true,
        },
      },
    });
  }
};
// #endregion

// #region 监听布局
watch(
  () => props.layout,
  (_val) => {
    if (graphRef.value) {
      nextTick(() => {
        const windowWidth =
          document.documentElement.clientWidth -
          (document.querySelector("#aside")?.clientWidth || 0);
        const windowHeight = document.documentElement.clientHeight;
        const height = window.outerHeight - 181 || windowHeight;
        const width = windowWidth;
        graphRef.value.changeSize(width, height);
        graphRef.value.fitView();
      });
    }
  }
);
// #endregion

// #region 监听血缘数据变化
watch(
  () => props.lineageData,
  (val) => {
    fieldChecked.value = true;
    wholeChecked.value = true;
    if (val) {
      lineageWholeData.value = val.withProcessData;
      lineagePartData.value = val.noProcessData;

      const data = transformData(val.withProcessData.data);

      nodeSizeRef.value = data.nodes.length;
      renderGraph(graphRef.value, data);
    }
  },
  {
    immediate: true,
    deep: true,
  }
);
// #endregion

// #region 监听水印文字变化
watch(
  () => props.waterMaker,
  (val: string) => {
    if (val) {
      handleTextWaterMarker(graphRef.value, val || "");
    }
  }
);
// #endregion

// #region 监听高亮色变化
watch(
  () => props.highlight,
  (val) => {
    if (val) {
      handleHighlightColor(graphRef.value, val);
    }
  }
);
// #endregion

// #region 监听起始表颜色变化
watch(
  () => props.sourceColor,
  (val) => {
    if (val) {
      handleNodeColor(graphRef.value, 0, val);
    }
  }
);
// #endregion

// #region 监听中间表颜色变化
watch(
  () => props.midColor,
  (val) => {
    if (val) {
      handleNodeColor(graphRef.value, 1, val);
    }
  }
);
// #endregion

// #region 监听最终表颜色变化
watch(
  () => props.endColor,
  (val) => {
    if (val) {
      handleNodeColor(graphRef.value, 2, val);
    }
  }
);
// #endregion

// #region 监听字段级血缘关系变化
watch(
  () => fieldChecked.value,
  (val) => {
    if (!lineageWholeData.value) {
      return;
    }
    let data: any;
    if (val) {
      if (wholeChecked.value) {
        data = transformData(lineageWholeData.value.data);
      }
    } else {
      if (wholeChecked.value) {
        data = collapseData(lineageWholeData.value.data);
      }
    }
    nodeSizeRef.value = data.nodes.length;
    renderGraph(graphRef.value, data);
  }
);
// #endregion

// #region 监听graphRef变化
watch(
  () => graphRef.value,
  (val) => {
    if (val) {
      const graph = graphRef.value;
      // 设置文字水印
      props.waterMaker && graph.setTextWaterMarker(props.waterMaker);
      bindEvents(graph);
    }
  }
);
// #endregion

onMounted(() => {
  initGraph();
});
</script>
<style scoped>
.g6-component-topbar {
  position: absolute;
  left: unset;
  bottom: unset;
  top: 10px;
  right: 200px;
  padding: 0;
  text-align: center;
}

.g6-component-toolbar {
  background: rgb(255, 255, 255);
  position: absolute;
  left: unset !important;
  bottom: unset !important;
  top: 10px !important;
  right: 24px !important;
  padding: 0px !important;
  text-align: center;
  box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2),
    0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12);
}

:deep(.g6-minimap) {
  width: 200px;
  height: 120px;
  position: absolute;
  bottom: 50px !important;
  right: 24px !important;
  left: unset !important;
  top: unset !important;
  background: #fff;
  box-shadow: 0 8px 10px -5px rgba(0, 0, 0, 0.2),
    0 16px 24px 2px rgba(0, 0, 0, 0.14), 0 6px 30px 5px rgba(0, 0, 0, 0.12);
}
</style>
