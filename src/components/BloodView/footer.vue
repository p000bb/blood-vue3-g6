<template>
  <div>
    <footer className="h-8 min-w-full bg-white">
      <div className=" flex  border-t px-5 py-2 shadow-md">
        <p className="space-x-4 text-sm font-medium">
          <span>节点：{{ nodeSize }}</span>
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
interface FooterProps {
  nodeSize: number /* 节点大小 */;
}

defineProps<FooterProps>();
</script>
<style scoped></style>
