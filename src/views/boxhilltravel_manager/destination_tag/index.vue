<template>
  <div class="p-2 boxhilltravel_manager-destination_tag-page">
    <el-card v-show="showSearch" shadow="hover" class="mb-3">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item :label="bt('destination')" prop="destinationName">
          <el-input v-model="queryParams.destinationName" :placeholder="bt('enterDestinationName')" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item :label="bt('tag')" prop="dictValue">
          <el-select v-model="queryParams.dictValue" :placeholder="bt('selectTag')" clearable>
            <el-option v-for="item in tagOptions" :key="item.dictValue" :label="item.dictLabel" :value="item.dictValue" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">{{ bt('search') }}</el-button>
          <el-button icon="Refresh" @click="resetQuery">{{ bt('reset') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-base font-semibold">{{ bt('destinationTags') }}</span>
          <div class="flex items-center gap-2">
            <el-button v-hasPermi="['boxhilltravel_manager:destination_tag:add']" type="primary" plain icon="Plus" @click="handleAdd">{{ bt('add') }}</el-button>
            <el-button v-hasPermi="['boxhilltravel_manager:destination_tag:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">{{ bt('delete') }}</el-button>
            <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="destinationTagList" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column :label="bt('cover')" align="center" width="90">
          <template #default="scope">
            <image-preview v-if="scope.row.destinationImageUrl" :src="scope.row.destinationImageUrl" :width="52" :height="52" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column :label="bt('destination')" min-width="180" show-overflow-tooltip>
          <template #default="scope">
            <div class="font-medium text-gray-900">{{ scope.row.destinationNameEn || scope.row.destinationName || '-' }}</div>
            <div class="text-xs text-gray-500">{{ scope.row.regionNameEn || scope.row.regionName || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="bt('level')" align="center" width="100">
          <template #default="scope">
            <span>{{ getDestinationLevelText(scope.row.destinationLevel) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="bt('tag')" min-width="130" show-overflow-tooltip>
          <template #default="scope">
            <el-tag>{{ scope.row.dictLabel || scope.row.dictValue }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="bt('sortOrder')" align="center" prop="sortOrder" width="110" />
        <el-table-column :label="bt('updatedAt')" align="center" prop="updateTime" width="170">
          <template #default="scope">{{ parseTime(scope.row.updateTime, '{y}-{m}-{d} {h}:{i}') }}</template>
        </el-table-column>
        <el-table-column :label="bt('actions')" align="center" width="130" fixed="right">
          <template #default="scope">
            <el-tooltip :content="bt('edit')" placement="top">
              <el-button v-hasPermi="['boxhilltravel_manager:destination_tag:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
            </el-tooltip>
            <el-tooltip :content="bt('delete')" placement="top">
              <el-button v-hasPermi="['boxhilltravel_manager:destination_tag:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="560px" append-to-body>
      <el-form ref="destinationTagFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item :label="bt('destination')" prop="destinationId">
          <el-select
            v-model="form.destinationId"
            filterable
            remote
            clearable
            reserve-keyword
            :placeholder="bt('selectDestination')"
            :remote-method="searchDestinationOptions"
            :loading="destinationLoading"
          >
            <el-option v-for="item in destinationOptions" :key="item.id" :label="getDestinationOptionLabel(item)" :value="item.id">
              <div class="flex items-center justify-between gap-3">
                <span class="truncate">{{ item.nameEn || item.name }}</span>
                <span class="shrink-0 text-xs text-gray-400">{{ getDestinationLevelText(item.level) }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="bt('tag')" prop="dictValue">
          <el-select v-model="form.dictValue" :placeholder="bt('selectTag')" filterable clearable>
            <el-option v-for="item in tagOptions" :key="item.dictValue" :label="item.dictLabel" :value="item.dictValue">
              <div class="flex items-center justify-between gap-3">
                <span class="truncate">{{ item.dictLabel }}</span>
                <span class="shrink-0 text-xs text-gray-400">{{ item.dictValue }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="bt('sortOrder')" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" controls-position="right" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">{{ bt('confirm') }}</el-button>
          <el-button @click="cancel">{{ bt('cancel') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="DestinationTag" lang="ts">

import { useBoxhillI18n } from '../useBoxhillI18n';
import {
  addDestinationTag,
  delDestinationTag,
  getDestinationTag,
  listDestinationTag,
  updateDestinationTag,
  updateDestinationTagSort
} from '@/api/boxhilltravel_manager/destination_tag';
import type { DestinationTagForm, DestinationTagQuery, DestinationTagVO } from '@/api/boxhilltravel_manager/destination_tag/types';
import { listDestination } from '@/api/boxhilltravel_manager/destination';
import type { DestinationVO } from '@/api/boxhilltravel_manager/destination/types';
import { getDicts } from '@/api/system/dict/data';
import type { DictDataVO } from '@/api/system/dict/data/types';
import { useLoading } from '@/hooks/async/useLoading';
import { useFormDialog } from '@/hooks/dialog/useFormDialog';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useSearchToggle } from '@/hooks/form/useSearchToggle';
import { useTableSelection } from '@/hooks/table/useTableSelection';
import modal from '@/plugins/modal';
import { parseTime } from '@/utils/ruoyi';

const { bt } = useBoxhillI18n();

const destinationTagList = ref<DestinationTagVO[]>([]);
const destinationOptions = ref<DestinationVO[]>([]);
const tagOptions = ref<DictDataVO[]>([]);
const destinationLoading = ref(false);
const buttonLoading = ref(false);
const total = ref(0);
const { loading, withLoading } = useLoading(true);
const { showSearch } = useSearchToggle();

const queryFormRef = ref<ElFormInstance>();
const destinationTagFormRef = ref<ElFormInstance>();
const { ids, multiple, handleSelectionChange } = useTableSelection<DestinationTagVO>(item => item.id);

const initFormData: DestinationTagForm = {
  id: undefined,
  destinationId: undefined,
  dictValue: undefined,
  sortOrder: 0
};

const data = reactive<PageData<DestinationTagForm, DestinationTagQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    destinationName: undefined,
    dictValue: undefined,
    params: {}
  },
  rules: {
    destinationId: [{ required: true, message: bt('destinationRequired'), trigger: 'change' }],
    dictValue: [{ required: true, message: bt('tagRequired'), trigger: 'change' }],
    sortOrder: [{ required: true, message: bt('sortRequired'), trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);
const { dialog, resetForm: reset, showDialog, closeDialog } = useFormDialog({
  form,
  formRef: destinationTagFormRef,
  initialFormData: initFormData
});

const getDestinationLevelText = (level?: number) => {
  if (Number(level) === 1) return 'Continent';
  if (Number(level) === 2) return 'Country';
  if (Number(level) === 3) return 'City';
  return '-';
};

const getDestinationOptionLabel = (row: DestinationVO) => `${row.nameEn || row.name} / ${row.name}`;

const loadTagOptions = async () => {
  const res = await getDicts('holidays_destination_tag');
  tagOptions.value = res.data || [];
};

const searchDestinationOptions = async (keyword = '') => {
  destinationLoading.value = true;
  try {
    const res = await listDestination({ pageNum: 1, pageSize: 100, nameEn: keyword || undefined, status: 1, level: 2, params: {} });
    destinationOptions.value = res.data?.rows || [];
  } finally {
    destinationLoading.value = false;
  }
};

const ensureDestinationOption = async (row?: DestinationTagVO) => {
  if (!row?.destinationId) return;
  if (destinationOptions.value.some(item => String(item.id) === String(row.destinationId))) return;
  destinationOptions.value.unshift({
    id: row.destinationId,
    name: row.destinationName || '',
    nameEn: row.destinationNameEn || '',
    parentId: row.regionId || 0,
    level: row.destinationLevel || 2,
    image: row.destinationImage || '',
    imageUrl: row.destinationImageUrl || '',
    description: row.destinationDescription || '',
    sort: 0,
    status: 1
  });
};

const toDestinationTagRow = (row: unknown) => row as DestinationTagVO;

const getList = async () => {
  await withLoading(async () => {
    const res = await listDestinationTag(queryParams.value);
    destinationTagList.value = res.data?.rows || [];
    total.value = res.data?.total || 0;
  });
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const { resetQuery } = useSearchReset({
  queryFormRef,
  queryParams,
  pageNumKey: 'pageNum',
  pageSizeKey: 'pageSize',
  initialPageSize: 10,
  resetExtras: () => {},
  afterReset: handleQuery
});

const cancel = () => {
  reset();
  closeDialog();
};

const handleAdd = async () => {
  reset();
  await Promise.all([searchDestinationOptions(), loadTagOptions()]);
  showDialog(bt('addDestinationTag'));
};

const handleUpdate = async (row: unknown) => {
  reset();
  const current = toDestinationTagRow(row);
  const res = await getDestinationTag(current.id);
  Object.assign(form.value, res.data);
  await Promise.all([ensureDestinationOption(res.data), loadTagOptions()]);
  showDialog(bt('editDestinationTag'));
};

const submitForm = () => {
  destinationTagFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    const request = form.value.id ? updateDestinationTag(form.value) : addDestinationTag(form.value);
    await request.finally(() => (buttonLoading.value = false));
    modal.msgSuccess(form.value.id ? bt('updateSuccess') : bt('addSuccess'));
    closeDialog();
    await getList();
  });
};

const handleDelete = async (row?: unknown) => {
  const current = row ? toDestinationTagRow(row) : undefined;
  const selectedIds = current?.id || ids.value;
  await modal.confirm(bt('confirmDeleteDestinationTag', { ids: selectedIds }));
  await delDestinationTag(selectedIds);
  modal.msgSuccess(bt('deleteSuccess'));
  await getList();
};

const handleSortChange = async (row: unknown, value: number | undefined) => {
  const current = toDestinationTagRow(row);
  await updateDestinationTagSort(current.id, Number(value) || 0);
  modal.msgSuccess(bt('sortUpdated'));
};

onMounted(() => {
  getList();
  searchDestinationOptions();
  loadTagOptions();
});
</script>
