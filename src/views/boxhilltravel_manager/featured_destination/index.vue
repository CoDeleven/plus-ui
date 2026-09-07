<template>
  <div class="p-2 boxhilltravel_manager-featured_destination-page">
    <el-card v-show="showSearch" shadow="hover" class="mb-3">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item :label="bt('destination')" prop="destinationName">
          <el-input v-model="queryParams.destinationName" :placeholder="bt('enterDestinationName')" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item :label="bt('tag')" prop="label">
          <el-input v-model="queryParams.label" :placeholder="bt('enterTag')" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item :label="bt('status')" prop="status">
          <el-select v-model="queryParams.status" :placeholder="bt('selectStatus')" clearable>
            <el-option :label="bt('enabledStatus')" :value="1" />
            <el-option :label="bt('disabledStatus')" :value="0" />
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
          <span class="text-base font-semibold">{{ bt('featuredDestinations') }}</span>
          <div class="flex items-center gap-2">
            <el-button v-hasPermi="['boxhilltravel_manager:featured_destination:add']" type="primary" plain icon="Plus" @click="handleAdd">{{ bt('add') }}</el-button>
            <el-button v-hasPermi="['boxhilltravel_manager:featured_destination:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">{{ bt('delete') }}</el-button>
            <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="featuredDestinationList" border @selection-change="handleSelectionChange">
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
        <el-table-column :label="bt('tag')" prop="label" min-width="120" show-overflow-tooltip />
        <el-table-column :label="bt('sortOrder')" align="center" prop="sortOrder" width="120">
          <template #default="scope">
            <el-input-number v-model="scope.row.sortOrder" :min="0" :controls="false" size="small" @change="value => handleSortChange(scope.row, value)" />
          </template>
        </el-table-column>
        <el-table-column :label="bt('status')" align="center" width="110">
          <template #default="scope">
            <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0" @change="value => handleStatusChange(scope.row, value)" />
          </template>
        </el-table-column>
        <el-table-column :label="bt('updatedAt')" align="center" prop="updateTime" width="170">
          <template #default="scope">{{ parseTime(scope.row.updateTime, '{y}-{m}-{d} {h}:{i}') }}</template>
        </el-table-column>
        <el-table-column :label="bt('actions')" align="center" width="130" fixed="right">
          <template #default="scope">
            <el-tooltip :content="bt('edit')" placement="top">
              <el-button v-hasPermi="['boxhilltravel_manager:featured_destination:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
            </el-tooltip>
            <el-tooltip :content="bt('delete')" placement="top">
              <el-button v-hasPermi="['boxhilltravel_manager:featured_destination:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="560px" append-to-body>
      <el-form ref="featuredDestinationFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item :label="bt('destination')" prop="destinationId">
          <el-select
            v-model="form.destinationId"
            filterable
            remote
            clearable
            reserve-keyword
            :placeholder="bt('selectCountryDestination')"
            :remote-method="searchDestinationOptions"
            :loading="destinationLoading"
          >
            <el-option v-for="item in destinationOptions" :key="item.id" :label="getDestinationOptionLabel(item)" :value="item.id">
              <span>{{ item.nameEn || item.name }}</span>
              <span class="float-right text-xs text-gray-400">{{ item.name }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="bt('displayTag')" prop="label">
          <el-input v-model="form.label" :placeholder="bt('tagPlaceholder')" maxlength="50" clearable />
        </el-form-item>
        <el-form-item :label="bt('sortOrder')" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" controls-position="right" />
        </el-form-item>
        <el-form-item :label="bt('status')" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">{{ bt('enabledStatus') }}</el-radio>
            <el-radio :value="0">{{ bt('disabledStatus') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="bt('remark')" prop="remark">
          <el-input v-model="form.remark" type="textarea" :placeholder="bt('enterRemark')" />
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

<script setup name="FeaturedDestination" lang="ts">

import { useBoxhillI18n } from '../useBoxhillI18n';
import {  addFeaturedDestination,
  changeFeaturedDestinationStatus,
  delFeaturedDestination,
  getFeaturedDestination,
  listFeaturedDestination,
  updateFeaturedDestination,
  updateFeaturedDestinationSort
} from '@/api/boxhilltravel_manager/featured_destination';
import type { FeaturedDestinationForm, FeaturedDestinationQuery, FeaturedDestinationVO } from '@/api/boxhilltravel_manager/featured_destination/types';
import { listDestination } from '@/api/boxhilltravel_manager/destination';
import type { DestinationVO } from '@/api/boxhilltravel_manager/destination/types';
import { useLoading } from '@/hooks/async/useLoading';
import { useFormDialog } from '@/hooks/dialog/useFormDialog';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useSearchToggle } from '@/hooks/form/useSearchToggle';
import { useTableSelection } from '@/hooks/table/useTableSelection';
import modal from '@/plugins/modal';
import { parseTime } from '@/utils/ruoyi';

const { bt } = useBoxhillI18n();

const featuredDestinationList = ref<FeaturedDestinationVO[]>([]);
const destinationOptions = ref<DestinationVO[]>([]);
const destinationLoading = ref(false);
const buttonLoading = ref(false);
const total = ref(0);
const { loading, withLoading } = useLoading(true);
const { showSearch } = useSearchToggle();

const queryFormRef = ref<ElFormInstance>();
const featuredDestinationFormRef = ref<ElFormInstance>();
const { ids, multiple, handleSelectionChange } = useTableSelection<FeaturedDestinationVO>(item => item.id);

const initFormData: FeaturedDestinationForm = {
  id: undefined,
  destinationId: undefined,
  label: undefined,
  sortOrder: 1,
  status: 1,
  remark: undefined
};

const data = reactive<PageData<FeaturedDestinationForm, FeaturedDestinationQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    destinationName: undefined,
    label: undefined,
    status: undefined,
    params: {}
  },
  rules: {
    destinationId: [{ required: true, message: bt('destinationRequired'), trigger: 'change' }],
    sortOrder: [{ required: true, message: bt('sortRequired'), trigger: 'change' }],
    status: [{ required: true, message: bt('text004'), trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);
const { dialog, resetForm: reset, showDialog, closeDialog } = useFormDialog({
  form,
  formRef: featuredDestinationFormRef,
  initialFormData: initFormData
});

const getList = async () => {
  await withLoading(async () => {
    const res = await listFeaturedDestination(queryParams.value);
    featuredDestinationList.value = res.data?.rows || [];
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

const getDestinationOptionLabel = (row: DestinationVO) => `${row.nameEn || row.name} / ${row.name}`;

const searchDestinationOptions = async (keyword = '') => {
  destinationLoading.value = true;
  try {
    const res = await listDestination({ pageNum: 1, pageSize: 10000, level: 2, nameEn: keyword || undefined, status: 1, params: {} });
    destinationOptions.value = res.data?.rows || [];
  } finally {
    destinationLoading.value = false;
  }
};

const ensureDestinationOption = async (row?: FeaturedDestinationVO) => {
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

const cancel = () => {
  reset();
  closeDialog();
};

const handleAdd = async () => {
  reset();
  await searchDestinationOptions();
  showDialog(bt('addFeaturedDestination'));
};

const handleUpdate = async (row: FeaturedDestinationVO) => {
  reset();
  const res = await getFeaturedDestination(row.id);
  Object.assign(form.value, res.data);
  await ensureDestinationOption(res.data);
  showDialog(bt('editFeaturedDestination'));
};

const submitForm = () => {
  featuredDestinationFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    const request = form.value.id ? updateFeaturedDestination(form.value) : addFeaturedDestination(form.value);
    await request.finally(() => (buttonLoading.value = false));
    modal.msgSuccess(form.value.id ? bt('updateSuccess') : bt('addSuccess'));
    closeDialog();
    await getList();
  });
};

const handleDelete = async (row?: FeaturedDestinationVO) => {
  const _ids = row?.id || ids.value;
  await modal.confirm(bt('confirmDeleteFeaturedDestination', { ids: _ids }));
  await delFeaturedDestination(_ids);
  modal.msgSuccess(bt('deleteSuccess'));
  await getList();
};

const handleSortChange = async (row: FeaturedDestinationVO, value: number | undefined) => {
  await updateFeaturedDestinationSort(row.id, Number(value) || 0);
  modal.msgSuccess(bt('sortUpdated'));
};

const handleStatusChange = async (row: FeaturedDestinationVO, value: string | number | boolean) => {
  await changeFeaturedDestinationStatus(row.id, Number(value));
  modal.msgSuccess(bt('statusUpdated'));
};

onMounted(() => {
  getList();
  searchDestinationOptions();
});
</script>
