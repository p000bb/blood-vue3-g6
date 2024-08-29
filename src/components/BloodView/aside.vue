<template>
  <div>
    <div class="h-full">
      <JsonEdit
        ref="jsonEditRef"
        v-model="xml"
        type="xml"
        class="json-edit"
        :style="jsonStyle"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import JsonEdit from "./components/jsonEdit.vue";

interface AsideProps {
  xmlData: string;
}

const props = defineProps<AsideProps>();

const emits = defineEmits(["update:xmlData"]);

const xml = computed({
  get() {
    return props.xmlData;
  },
  set(val) {
    emits("update:xmlData", val);
  },
});

const jsonStyle = ref<any>({});

const jsonEditRef = ref<any>(null);

onMounted(() => {
  jsonStyle.value = {
    height: `calc(100vh - 96px)`,
    width: "100%",
  };
});

defineExpose({
  jsonEditRef,
});
</script>
<style scoped lang="scss"></style>
