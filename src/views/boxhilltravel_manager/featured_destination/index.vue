<template>
  <div class="p-2 boxhilltravel_manager-featured_destination-page">
    <el-card v-show="showSearch" shadow="hover" class="mb-3">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="目的地" prop="destinationName">
          <el-input v-model="queryParams.destinationName" placeholder="请输入目的地名称" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="标签" prop="label">
          <el-input v-model="queryParams.label" placeholder="请输入标签" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-base font-semibold">Featured Destinations</span>
          <div class="flex items-center gap-2">
            <el-button v-hasPermi="['boxhilltravel_manager:featured_destination:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
            <el-button v-hasPermi="['boxhilltravel_manager:featured_destination:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">删除</el-button>
            <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="featuredDestinationList" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="封面" align="center" width="90">
          <template #default="scope">
            <image-preview v-if="scope.row.destinationImageUrl" :src="scope.row.destinationImageUrl" :width="52" :height="52" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="目的地" min-width="180" show-overflow-tooltip>
          <template #default="scope">
            <div class="font-medium text-gray-900">{{ scope.row.destinationNameEn || scope.row.destinationName || '-' }}</div>
            <div class="text-xs text-gray-500">{{ scope.row.regionNameEn || scope.row.regionName || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="标签" prop="label" min-width="120" show-overflow-tooltip />
        <el-table-column label="排序" align="center" prop="sortOrder" width="120">
          <template #default="scope">
            <el-input-number v-model="scope.row.sortOrder" :min="0" :controls="false" size="small" @change="value => handleSortChange(scope.row, value)" />
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" width="110">
          <template #default="scope">
            <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0" @change="value => handleStatusChange(scope.row, value)" />
          </template>
        </el-table-column>
        <el-table-column label="更新时间" align="center" prop="updateTime" width="170">
          <template #default="scope">{{ parseTime(scope.row.updateTime, '{y}-{m}-{d} {h}:{i}') }}</template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="130" fixed="right">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['boxhilltravel_manager:featured_destination:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['boxhilltravel_manager:featured_destination:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="560px" append-to-body>
      <el-form ref="featuredDestinationFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="目的地" prop="destinationId">
          <el-select
            v-model="form.destinationId"
            filterable
            remote
            clearable
            reserve-keyword
            placeholder="请选择国家级目的地"
            :remote-method="searchDestinationOptions"
            :loading="destinationLoading"
          >
            <el-option v-for="item in destinationOptions" :key="item.id" :label="getDestinationOptionLabel(item)" :value="item.id">
              <span>{{ item.nameEn || item.name }}</span>
              <span class="float-right text-xs text-gray-400">{{ item.name }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="展示标签" prop="label">
          <el-input v-model="form.label" placeholder="如 Editor's Pick / Trending" maxlength="50" clearable />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" controls-position="right" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="FeaturedDestination" lang="ts">
import {
  addFeaturedDestination,
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
    destinationId: [{ required: true, message: '目的地不能为空', trigger: 'change' }],
    sortOrder: [{ required: true, message: '排序不能为空', trigger: 'change' }],
    status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
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
  showDialog('新增 Featured Destination');
};

const handleUpdate = async (row: FeaturedDestinationVO) => {
  reset();
  const res = await getFeaturedDestination(row.id);
  Object.assign(form.value, res.data);
  await ensureDestinationOption(res.data);
  showDialog('修改 Featured Destination');
};

const submitForm = () => {
  featuredDestinationFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    const request = form.value.id ? updateFeaturedDestination(form.value) : addFeaturedDestination(form.value);
    await request.finally(() => (buttonLoading.value = false));
    modal.msgSuccess(form.value.id ? '修改成功' : '新增成功');
    closeDialog();
    await getList();
  });
};

const handleDelete = async (row?: FeaturedDestinationVO) => {
  const _ids = row?.id || ids.value;
  await modal.confirm('确认删除 Featured Destination 编号为 "' + _ids + '" 的数据项？');
  await delFeaturedDestination(_ids);
  modal.msgSuccess('删除成功');
  await getList();
};

const handleSortChange = async (row: FeaturedDestinationVO, value: number | undefined) => {
  await updateFeaturedDestinationSort(row.id, Number(value) || 0);
  modal.msgSuccess('排序已更新');
};

const handleStatusChange = async (row: FeaturedDestinationVO, value: string | number | boolean) => {
  await changeFeaturedDestinationStatus(row.id, Number(value));
  modal.msgSuccess('状态已更新');
};

onMounted(() => {
  getList();
  searchDestinationOptions();
});
</script>
