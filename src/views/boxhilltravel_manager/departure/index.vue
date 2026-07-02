<template>
  <div class="p-2 page-shell boxhilltravel_manager-departure-page">
    <div class="search-wrap">
      <el-card shadow="hover" class="search-panel" :class="{ 'is-collapsed': !showSearch }">
        <template #header>
          <div class="panel-heading search-panel-toggle" @click.stop="showSearch = !showSearch">
            <div><h3>筛选条件</h3></div>
          </div>
        </template>
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form">
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
              <el-option v-for="item in departureStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <el-card shadow="hover" class="table-panel">
      <template #header>
        <div class="toolbar-shell">
          <div class="table-heading">
            <h3>团期列表{{ lockedTourName ? ' - ' + lockedTourName : '' }}</h3>
          </div>
          <div class="toolbar-actions">
            <el-button v-hasPermi="['boxhilltravel_manager:departure:add']" type="primary" plain icon="Plus" @click="handleAdd">
              新增
            </el-button>
            <el-button
              v-hasPermi="['boxhilltravel_manager:departure:edit']"
              type="success"
              plain
              icon="Edit"
              :disabled="single"
              @click="handleUpdate()"
            >
              修改
            </el-button>
            <el-button
              v-hasPermi="['boxhilltravel_manager:departure:remove']"
              type="danger"
              plain
              icon="Delete"
              :disabled="multiple"
              @click="handleDelete()"
            >
              删除
            </el-button>
            <right-toolbar v-model:show-search="showSearch" :search="false" @query-table="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" border class="data-table" :data="departureList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="ID" align="center" prop="id" />
        <el-table-column label="出发日期" align="center" prop="departureDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.departureDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="返程日期" align="center" prop="returnDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.returnDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="行程天数" align="center" prop="durationDays" />
        <el-table-column label="团期类型" align="center" prop="departureType">
          <template #default="scope">
            <span>{{ departureTypeLabel(scope.row.departureType) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="核载人数" align="center" prop="maxCapacity" />
        <el-table-column label="最小成团人数" align="center" prop="minCapacity" />
        <el-table-column label="已预订人数" align="center" prop="bookedCount" />
        <el-table-column label="剩余名额" align="center" prop="availableCount" />
        <el-table-column label="原价" align="center" prop="basePrice" />
        <el-table-column label="售价" align="center" prop="salePrice" />
        <el-table-column label="折扣率" align="center" prop="discountRate" />
        <el-table-column label="状态" align="center" prop="status" width="120">
          <template #default="scope">
            <span>{{ departureStatusLabel(scope.row.status) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button
                v-hasPermi="['boxhilltravel_manager:departure:edit']"
                link
                type="primary"
                icon="Edit"
                @click="handleUpdate(scope.row)"
              />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button
                v-hasPermi="['boxhilltravel_manager:departure:remove']"
                link
                type="primary"
                icon="Delete"
                @click="handleDelete(scope.row)"
              />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="total"
        @pagination="getList"
      />
    </el-card>

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="750px" append-to-body>
      <el-form ref="departureFormRef" :model="form" :rules="rules" label-width="150px">
        <el-form-item label="出发日期" prop="departureDate">
          <el-date-picker
            v-model="form.departureDate"
            clearable
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择出发日期"
          />
        </el-form-item>
        <el-form-item label="返程日期" prop="returnDate">
          <el-date-picker
            v-model="form.returnDate"
            clearable
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择返程日期"
          />
        </el-form-item>
        <el-form-item label="行程天数" prop="durationDays">
          <el-input-number v-model="form.durationDays" controls-position="right" />
        </el-form-item>
        <el-form-item label="团期类型" prop="departureType">
          <el-select v-model="form.departureType" placeholder="请选择团期类型">
            <el-option v-for="item in departureTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="核载人数" prop="maxCapacity">
          <el-input-number v-model="form.maxCapacity" controls-position="right" />
        </el-form-item>
        <el-form-item label="最小成团人数" prop="minCapacity">
          <el-input-number v-model="form.minCapacity" controls-position="right" />
        </el-form-item>
        <el-form-item label="原价" prop="basePrice">
          <el-input-number v-model="form.basePrice" controls-position="right" />
        </el-form-item>
        <el-form-item label="售价" prop="salePrice">
          <el-input-number v-model="form.salePrice" controls-position="right" />
        </el-form-item>
        <el-form-item label="折扣率" prop="discountRate">
          <span>{{ discountRateDisplay }}</span>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option v-for="item in departureStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
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

<script setup name="Departure" lang="ts">
import {
  addDeparture,
  delDeparture,
  getDeparture,
  listDeparture,
  updateDeparture
} from '@/api/boxhilltravel_manager/departure';
import type { DepartureForm, DepartureQuery, DepartureVO } from '@/api/boxhilltravel_manager/departure/types';
import { useLoading } from '@/hooks/async/useLoading';
import { useFormDialog } from '@/hooks/dialog/useFormDialog';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useSearchToggle } from '@/hooks/form/useSearchToggle';
import { useTableSelection } from '@/hooks/table/useTableSelection';
import modal from '@/plugins/modal';
import { parseTime } from '@/utils/ruoyi';
import { useRoute } from 'vue-router';

const route = useRoute();
const lockedTourId = computed(() => {
  const tourId = route.query.tourId;
  return Array.isArray(tourId) ? tourId[0] : tourId;
});
const lockedTourName = computed(() => {
  const tourName = route.query.tourName;
  return Array.isArray(tourName) ? tourName[0] : tourName;
});
const hasLockedTour = computed(() => lockedTourId.value !== undefined && lockedTourId.value !== '');

const departureTypeOptions = [
  { label: '固定', value: 1 },
  { label: '不固定', value: 2 }
];

const departureStatusOptions = [
  { label: '可预订', value: 1 },
  { label: '已满', value: 2 },
  { label: '已结束', value: 3 },
  { label: '已取消', value: 4 }
];

const departureTypeLabel = (value?: number) => departureTypeOptions.find(item => item.value === value)?.label || '-';
const departureStatusLabel = (value?: number) => departureStatusOptions.find(item => item.value === value)?.label || '-';

const departureList = ref<DepartureVO[]>([]);
const buttonLoading = ref(false);
const { loading, withLoading } = useLoading(true);
const { showSearch } = useSearchToggle();
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const departureFormRef = ref<ElFormInstance>();

const initFormData: DepartureForm = {
  id: undefined,
  tourId: undefined,
  departureDate: undefined,
  returnDate: undefined,
  durationDays: undefined,
  departureType: undefined,
  maxCapacity: undefined,
  minCapacity: undefined,
  bookedCount: undefined,
  availableCount: undefined,
  basePrice: undefined,
  salePrice: undefined,
  discountRate: undefined,
  status: undefined,
  remark: undefined
};

const data = reactive<PageData<DepartureForm, DepartureQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10000,
    tourId: undefined,
    status: undefined,
    params: {}
  },
  rules: {
    tourId: [{ required: true, message: '线路ID不能为空', trigger: 'change' }],
    departureDate: [{ required: true, message: '出发日期不能为空', trigger: 'blur' }],
    returnDate: [{ required: true, message: '返程日期不能为空', trigger: 'blur' }],
    durationDays: [{ required: true, message: '行程天数不能为空', trigger: 'change' }],
    departureType: [{ required: true, message: '团期类型不能为空', trigger: 'change' }],
    maxCapacity: [{ required: true, message: '核载人数不能为空', trigger: 'change' }],
    basePrice: [{ required: true, message: '原价不能为空', trigger: 'change' }],
    salePrice: [{ required: true, message: '售价不能为空', trigger: 'change' }],
    status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);
const { ids, single, multiple, handleSelectionChange } = useTableSelection<DepartureVO>(item => item.id);
const {
  dialog,
  resetForm: reset,
  openDialog,
  showDialog,
  closeDialog
} = useFormDialog({
  form,
  formRef: departureFormRef,
  initialFormData: initFormData
});

const lockTourParams = () => {
  queryParams.value.tourId = lockedTourId.value;
};

const lockTourForm = () => {
  form.value.tourId = lockedTourId.value;
};

const warnNoLockedTour = () => {
  modal.msgWarning('请先从线路列表进入团期管理');
};

const refreshDiscountRate = () => {
  form.value.discountRate = calculatedDiscountRate.value;
};

const calculatedDiscountRate = computed(() => {
  const basePrice = Number(form.value.basePrice);
  const salePrice = Number(form.value.salePrice);
  if (!Number.isFinite(basePrice) || !Number.isFinite(salePrice) || basePrice <= 0) {
    return undefined;
  }
  return Number((salePrice / basePrice).toFixed(2));
});

const discountRateDisplay = computed(() => {
  return calculatedDiscountRate.value === undefined ? '-' : calculatedDiscountRate.value.toFixed(2);
});

const buildSubmitForm = (): DepartureForm => {
  const data = { ...form.value };
  delete data.bookedCount;
  delete data.availableCount;
  data.departureDate = normalizeDateValue(data.departureDate);
  data.returnDate = normalizeDateValue(data.returnDate);
  data.discountRate = calculatedDiscountRate.value;
  return data;
};

const normalizeDateValue = (value: unknown) => {
  if (!value) {
    return undefined;
  }

  const pad = (num: number) => String(num).padStart(2, '0');

  if (Array.isArray(value)) {
    const [year, month = 1, day = 1] = value as number[];
    if (!year) {
      return undefined;
    }
    return `${year}-${pad(month)}-${pad(day)}`;
  }

  if (value instanceof Date) {
    return parseTime(value, '{y}-{m}-{d}') || undefined;
  }

  const text = String(value).trim();
  if (!text) {
    return undefined;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const normalized = text.replace('T', ' ').replace(/\.\d+/, '').replace(/Z$/, '');
  const match = normalized.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) {
    return match[1];
  }

  return parseTime(text, '{y}-{m}-{d}') || text;
};

/** 查询当前线路下的团期列表 */
const getList = async () => {
  await withLoading(async () => {
    lockTourParams();
    if (!hasLockedTour.value) {
      departureList.value = [];
      total.value = 0;
      return;
    }
    const res = await listDeparture(queryParams.value);
    departureList.value = res.data?.rows || [];
    total.value = res.data?.total || 0;
  });
};

const cancel = () => {
  reset();
  closeDialog();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  lockTourParams();
  queryParams.value.pageNum = 1;
  getList();
};

const { resetQuery } = useSearchReset({
  queryFormRef,
  queryParams,
  pageNumKey: 'pageNum',
  pageSizeKey: 'pageSize',
  initialPageSize: 10000,
  resetExtras: () => {
    lockTourParams();
  },
  afterReset: () => {
    handleQuery();
  }
});

/** 新增按钮操作 */
const handleAdd = () => {
  if (!hasLockedTour.value) {
    warnNoLockedTour();
    return;
  }
  openDialog('添加团期');
  lockTourForm();
};

/** 修改按钮操作 */
const handleUpdate = async (row?: Partial<DepartureVO>) => {
  if (!hasLockedTour.value) {
    warnNoLockedTour();
    return;
  }
  reset();
  const _id = row?.id || ids.value[0];
  if (!_id) {
    return;
  }
  const res = await getDeparture(_id);
  Object.assign(form.value, res.data);
  form.value.departureDate = normalizeDateValue(res.data?.departureDate);
  form.value.returnDate = normalizeDateValue(res.data?.returnDate);
  lockTourForm();
  refreshDiscountRate();
  showDialog('修改团期');
};

/** 提交按钮 */
const submitForm = () => {
  lockTourForm();
  refreshDiscountRate();
  departureFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      if (!hasLockedTour.value) {
        warnNoLockedTour();
        return;
      }
      buttonLoading.value = true;
      lockTourForm();
      if (form.value.id) {
        await updateDeparture(buildSubmitForm()).finally(() => (buttonLoading.value = false));
      } else {
        await addDeparture(buildSubmitForm()).finally(() => (buttonLoading.value = false));
      }
      modal.msgSuccess('操作成功');
      closeDialog();
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: Partial<DepartureVO>) => {
  const _ids = row?.id || ids.value;
  if (!_ids || (Array.isArray(_ids) && !_ids.length)) {
    return;
  }
  await modal.confirm('是否确认删除团期编号为"' + _ids + '"的数据项？');
  await delDeparture(_ids);
  modal.msgSuccess('删除成功');
  await getList();
};

onMounted(() => {
  lockTourParams();
  getList();
});

watch(
  () => route.query.tourId,
  () => {
    lockTourParams();
    queryParams.value.pageNum = 1;
    getList();
  }
);
</script>
