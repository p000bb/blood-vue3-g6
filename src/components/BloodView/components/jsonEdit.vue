<template>
  <div>
    <div ref="ace_dom" class="ace" />
  </div>
</template>
<script setup lang="ts">
import ace from "ace-builds";
import "ace-builds/src-noconflict/ext-language_tools";
import { computed, onMounted, ref, watchEffect } from "vue";

const funcEditor = ref<ace.Ace.Editor | null>(null);
const ace_dom = ref<Element | null>(null);

const emits = defineEmits(["update:modelValue"]);

const val = computed({
  get() {
    return props.modelValue ?? "";
  },
  set(val: string) {
    emits("update:modelValue", val);
  },
});
// const val = ref<string>("");

const props = defineProps({
  type: {
    type: String,
    default: "json",
  },
  modelValue: {
    type: String,
    default: "",
  },
  readonly: {
    type: Boolean,
    default: false,
  },
});

watchEffect(() => {
  if (!funcEditor.value) return;
  if (props.type) {
    funcEditor.value?.session.setMode("ace/mode/" + props.type);
  } else {
    funcEditor.value?.session.setMode("ace/mode/json");
  }
});

const init = () => {
  if (!ace_dom.value) return;
  
  ace.config.set(
    "basePath",
    "https://ks3-cn-beijing.ksyun.com/vform2021/ace-mini"
  );

  if (funcEditor.value) {
    funcEditor.value.destroy();
  }

  funcEditor.value = ace.edit(ace_dom.value, {
    fontSize: 14,
    tabSize: 2,
    readOnly: Boolean(props.readonly),
    highlightActiveLine: true,
    wrap: "free",
    value: props.modelValue,
    theme: "ace/theme/tomorrow_night_eighties",
  });

  funcEditor.value.setOptions({
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true,
  });

  //   val.value = props.modelValue;

  funcEditor.value.on("change", () => {
    val.value = funcEditor.value?.getValue() || "";
    // emits("update:modelValue", val.value);
  });
};

// 语法校验
const getEditorAnnotations = () => {
  return (
    funcEditor.value &&
    funcEditor.value
      .getSession()
      .getAnnotations()
      ?.filter((item: any) => item.type === "error")?.length === 0
  );
};

const validate = () => {
  return new Promise((resolve, reject) => {
    funcEditor.value &&
    funcEditor.value
      .getSession()
      .getAnnotations()
      ?.filter((item: any) => item.type === "error")?.length === 0
      ? resolve(true)
      : reject(false);
  });
};

const getValue = () => {
  return val.value;
};

const setValue = (val: string) => {
  funcEditor.value?.setValue(val);
};

defineExpose({
  getEditorAnnotations,
  getValue,
  validate,
  setValue,
});

onMounted(() => {
  init();
});
</script>

<style scoped>
.ace {
  width: 100%;
  height: 100%;
}
</style>
