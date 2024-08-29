<template>
  <div>
    <div class="flex flex-col justify-center gap-4">
      <el-tooltip
        v-for="item in options"
        effect="light"
        :content="item.description"
        placement="left"
        :key="item.key"
      >
        <el-button
          type="info"
          text
          @click="item.action"
          class="!m-0 !h-[50px] w-[40px] flex"
        >
          <el-icon class="m-auto">
            <component :is="item.name"></component>
          </el-icon>
        </el-button>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="tsx">
import { ref } from "vue";
import {
  Download,
  FullScreen,
  Menu,
  Pointer,
  RefreshLeft,
  ZoomIn,
  ZoomOut,
} from "@element-plus/icons-vue";
import {
  handleAutoZoom,
  handleDownloadImage,
  handleEnterFullscreen,
  handleExitFullscreen,
  handleRealZoom,
  handleRefreshLayout,
  handleZoomIn,
  handleZoomOut,
} from "../utils/graphUtil";

interface ToolBarProps {
  graph: any /* graph对象 */;
}

const props = defineProps<ToolBarProps>();

const isFull = ref<boolean>(false);

const setIsFull = (val: boolean) => {
  isFull.value = val;
};

const options = [
  {
    key: "zoomOut",
    name: <ZoomIn />,
    description: "放大",
    action: () => {
      _handleZoomOut();
    },
  },
  {
    key: "zoomIn",
    name: <ZoomOut />,
    description: "缩小",
    action: () => {
      _handleZoomIn();
    },
  },
  {
    key: "autoZoom",
    name: <Pointer />,
    description: "自适应",
    action: () => {
      _handleAutoZoom();
    },
  },
  {
    key: "realZoom",
    name: <Menu />,
    description: "视图居中",
    action: () => {
      _handleRealZoom();
    },
  },
  {
    key: "clearCanvas",
    name: <RefreshLeft />,
    description: "恢复布局",
    action: () => {
      _handleRefreshLayout();
    },
  },
  {
    key: "downloadImage",
    name: <Download />,
    description: "下载图片",
    action: () => {
      _handleDownloadImage();
    },
  },
  !isFull.value
    ? {
        key: "fullscreenOutlined",
        name: <FullScreen />,
        description: "全屏查看",
        action: () => {
          setIsFull(!isFull.value);
          _handleEnterFullscreen();
        },
      }
    : {
        key: "fullscreenExitOutlined",
        name: <FullScreen />,
        description: "退出全屏",
        action: () => {
          setIsFull(!isFull.value);
          _handleExitFullscreen();
        },
      },
];

const _handleZoomOut = () => {
  handleZoomOut(props.graph);
};

const _handleZoomIn = () => {
  handleZoomIn(props.graph);
};

const _handleAutoZoom = () => {
  handleAutoZoom(props.graph);
};

const _handleRealZoom = () => {
  handleRealZoom(props.graph);
};

const _handleRefreshLayout = () => {
  handleRefreshLayout(props.graph);
};

const _handleDownloadImage = () => {
  handleDownloadImage(props.graph);
};

const _handleEnterFullscreen = () => {
  handleEnterFullscreen(props.graph);
};

const _handleExitFullscreen = () => {
  handleExitFullscreen();
};
</script>
<style scoped></style>
