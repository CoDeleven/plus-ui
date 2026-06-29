<template>
  <div class="search-select-input">
    <el-input
      :model-value="modelValue"
      :placeholder="inputPlaceholder"
      :clearable="clearable"
      :disabled="disabled"
      @update:model-value="handleInputUpdate"
      @keyup.enter="emit('enter')"
    >
      <template #prepend>
        <el-select
          class="search-select-input__select"
          :model-value="selectValue"
          :placeholder="selectPlaceholder"
          :clearable="selectClearable"
          :disabled="disabled"
          :style="{ width: selectWidth }"
          @update:model-value="handleSelectUpdate"
        >
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </template>
    </el-input>
  </div>
</template>

<script setup name="SearchSelectInput" lang="ts">
export type SearchSelectInputValue = string | number;

export interface SearchSelectInputOption {
  label: string;
  value: SearchSelectInputValue;
}

withDefaults(
  defineProps<{
    modelValue?: string | number;
    selectValue?: SearchSelectInputValue;
    options: SearchSelectInputOption[];
    inputPlaceholder?: string;
    selectPlaceholder?: string;
    selectWidth?: string;
    clearable?: boolean;
    selectClearable?: boolean;
    disabled?: boolean;
  }>(),
  {
    modelValue: undefined,
    selectValue: undefined,
    inputPlaceholder: '请输入',
    selectPlaceholder: '请选择',
    selectWidth: '120px',
    clearable: true,
    selectClearable: true,
    disabled: false
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value?: string | number): void;
  (e: 'update:selectValue', value?: SearchSelectInputValue): void;
  (e: 'enter'): void;
}>();

const handleInputUpdate = (value?: string | number) => {
  emit('update:modelValue', value);
};

const handleSelectUpdate = (value?: SearchSelectInputValue) => {
  emit('update:selectValue', value);
};
</script>

<style scoped>
.search-select-input {
  min-width: 360px;
}

.search-select-input :deep(.el-input) {
  width: 100%;
}

.search-select-input :deep(.el-input-group__prepend) {
  padding: 0;
  overflow: hidden;
  color: var(--el-text-color-regular);
  background-color: var(--el-bg-color);
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  box-shadow: 1px 0 0 0 var(--el-input-border-color) inset, 0 1px 0 0 var(--el-input-border-color) inset,
    0 -1px 0 0 var(--el-input-border-color) inset;
}

.search-select-input :deep(.el-input-group--prepend > .el-input__wrapper) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  box-shadow: 0 0 0 1px var(--el-input-border-color) inset;
}

.search-select-input :deep(.el-input-group--prepend > .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--el-input-hover-border-color) inset;
}

.search-select-input :deep(.el-input-group--prepend > .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
}

.search-select-input :deep(.el-input-group__prepend .search-select-input__select) {
  display: block;
  margin: 0;
}

.search-select-input :deep(.el-input-group__prepend .el-select__wrapper) {
  min-height: var(--el-component-size);
  height: var(--el-component-size);
  padding: 0 28px 0 14px;
  background-color: transparent;
  border-radius: var(--el-input-border-radius) 0 0 var(--el-input-border-radius);
  box-shadow: none !important;
}

.search-select-input :deep(.el-input-group__prepend .el-select__wrapper.is-hovering),
.search-select-input :deep(.el-input-group__prepend .el-select__wrapper.is-focused) {
  box-shadow: none !important;
}

.search-select-input :deep(.el-input-group__prepend .el-select__selection) {
  min-width: 0;
}

.search-select-input :deep(.el-input-group__prepend .el-select__selected-item) {
  max-width: 100%;
}

.search-select-input :deep(.el-input-group__prepend .el-select__placeholder) {
  color: var(--el-text-color-regular);
}

.search-select-input :deep(.el-input-group__prepend .el-select__caret) {
  color: var(--el-text-color-placeholder);
}
</style>
