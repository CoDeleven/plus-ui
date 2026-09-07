<template>
  <div class="p-2 page-shell boxhilltravel_manager-departure-page">
    <div class="search-wrap">
      <el-card shadow="hover" class="search-panel" :class="{ 'is-collapsed': !showSearch }">
        <template #header>
          <div class="panel-heading search-panel-toggle" @click.stop="showSearch = !showSearch">
            <div><h3>{{ bt('filters') }}</h3></div>
          </div>
        </template>
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form">
          <el-form-item :label="bt('status')" prop="status">
            <el-select v-model="queryParams.status" :placeholder="bt('selectStatus')" clearable>
              <el-option v-for="item in departureStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">{{ bt('search') }}</el-button>
            <el-button icon="Refresh" @click="resetQuery">{{ bt('reset') }}</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <el-card shadow="hover" class="table-panel">
      <template #header>
        <div class="toolbar-shell">
          <div class="table-heading">
            <h3>{{ bt('departureList') }}{{ lockedTourName ? ' - ' + lockedTourName : '' }}</h3>
          </div>
          <div class="toolbar-actions">
            <el-button v-hasPermi="['boxhilltravel_manager:departure:add']" type="primary" plain icon="Plus" @click="handleAdd">
              {{ bt('add') }}</el-button>
            <el-button
              v-hasPermi="['boxhilltravel_manager:departure:edit']"
              type="success"
              plain
              icon="Edit"
              :disabled="single"
              @click="handleUpdate()"
            >
              {{ bt('edit') }}</el-button>
            <el-button
              v-hasPermi="['boxhilltravel_manager:departure:remove']"
              type="danger"
              plain
              icon="Delete"
              :disabled="multiple"
              @click="handleDelete()"
            >
              {{ bt('delete') }}</el-button>
            <right-toolbar v-model:show-search="showSearch" :search="false" @query-table="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" border class="data-table" :data="departureList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column :label="bt('id')" align="center" prop="id" />
        <el-table-column :label="bt('departureDate')" align="center" prop="departureDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.departureDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="bt('returnDate')" align="center" prop="returnDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.returnDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="bt('durationDays')" align="center" prop="durationDays" />
        <el-table-column :label="bt('departureType')" align="center" prop="departureType">
          <template #default="scope">
            <span>{{ departureTypeLabel(scope.row.departureType) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="bt('capacity')" align="center" prop="maxCapacity" />
        <el-table-column :label="bt('minimumGroupSize')" align="center" prop="minCapacity" />
        <el-table-column :label="bt('bookedSeats')" align="center" prop="bookedCount" />
        <el-table-column :label="bt('remainingSeats')" align="center" prop="availableCount" />
        <el-table-column :label="bt('originalPrice')" align="center" prop="basePrice" />
        <el-table-column :label="bt('price')" align="center" prop="salePrice" />
        <el-table-column :label="bt('discountRate')" align="center" prop="discountRate" />
        <el-table-column :label="bt('status')" align="center" prop="status" width="120">
          <template #default="scope">
            <span>{{ departureStatusLabel(scope.row.status) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="bt('remark')" align="center" prop="remark" show-overflow-tooltip />
        <el-table-column :label="bt('actions')" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip :content="bt('edit')" placement="top">
              <el-button
                v-hasPermi="['boxhilltravel_manager:departure:edit']"
                link
                type="primary"
                icon="Edit"
                @click="handleUpdate(scope.row)"
              />
            </el-tooltip>
            <el-tooltip :content="bt('delete')" placement="top">
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
        <el-form-item :label="bt('departureDate')" prop="departureDate">
          <el-date-picker
            v-model="form.departureDate"
            clearable
            type="date"
            value-format="YYYY-MM-DD"
            :placeholder="bt('selectDepartureDate')"
          />
        </el-form-item>
        <el-form-item :label="bt('returnDate')" prop="returnDate">
          <el-date-picker
            v-model="form.returnDate"
            clearable
            type="date"
            value-format="YYYY-MM-DD"
            :placeholder="bt('selectReturnDate')"
          />
        </el-form-item>
        <el-form-item :label="bt('durationDays')" prop="durationDays">
          <el-input-number v-model="form.durationDays" controls-position="right" />
        </el-form-item>
        <el-form-item :label="bt('departureType')" prop="departureType">
          <el-select v-model="form.departureType" :placeholder="bt('selectDepartureType')">
            <el-option v-for="item in departureTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item :label="bt('capacity')" prop="maxCapacity">
          <el-input-number v-model="form.maxCapacity" controls-position="right" />
        </el-form-item>
        <el-form-item :label="bt('minimumGroupSize')" prop="minCapacity">
          <el-input-number v-model="form.minCapacity" controls-position="right" />
        </el-form-item>
        <el-form-item :label="bt('originalPrice')" prop="basePrice">
          <el-input-number v-model="form.basePrice" controls-position="right" />
        </el-form-item>
        <el-form-item :label="bt('price')" prop="salePrice">
          <el-input-number v-model="form.salePrice" controls-position="right" />
        </el-form-item>
        <el-form-item :label="bt('discountRate')" prop="discountRate">
          <span>{{ discountRateDisplay }}</span>
        </el-form-item>
        <el-form-item :label="bt('status')" prop="status">
          <el-select v-model="form.status" :placeholder="bt('selectStatus')">
            <el-option v-for="item in departureStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
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

<script setup name="Departure" lang="ts">

import { useBoxhillI18n } from '../useBoxhillI18n';
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

const { bt } = useBoxhillI18n();

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
  { label: bt('fixed'), value: 1 },
  { label: bt('flexible'), value: 2 }
];

const departureStatusOptions = [
  { label: bt('available'), value: 1 },
  { label: bt('full'), value: 2 },
  { label: bt('ended'), value: 3 },
  { label: bt('cancelled'), value: 4 }
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
    tourId: [{ required: true, message: bt('tourIdRequired'), trigger: 'change' }],
    departureDate: [{ required: true, message: bt('departureDateRequired'), trigger: 'blur' }],
    returnDate: [{ required: true, message: bt('returnDateRequired'), trigger: 'blur' }],
    durationDays: [{ required: true, message: bt('durationDaysRequired'), trigger: 'change' }],
    departureType: [{ required: true, message: bt('departureTypeRequired'), trigger: 'change' }],
    maxCapacity: [{ required: true, message: bt('capacityRequired'), trigger: 'change' }],
    basePrice: [{ required: true, message: bt('originalPriceRequired'), trigger: 'change' }],
    salePrice: [{ required: true, message: bt('priceRequired'), trigger: 'change' }],
    status: [{ required: true, message: bt('text004'), trigger: 'change' }]
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
  modal.msgWarning(bt('enterDepartureFromTour'));
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


const handleAdd = () => {
  if (!hasLockedTour.value) {
    warnNoLockedTour();
    return;
  }
  openDialog(bt('addDeparture'));
  lockTourForm();
};


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
  showDialog(bt('editDeparture'));
};


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
      modal.msgSuccess(bt('operationSuccess'));
      closeDialog();
      await getList();
    }
  });
};


const handleDelete = async (row?: Partial<DepartureVO>) => {
  const _ids = row?.id || ids.value;
  if (!_ids || (Array.isArray(_ids) && !_ids.length)) {
    return;
  }
  await modal.confirm(bt('confirmDeleteDeparture', { ids: _ids }));
  await delDeparture(_ids);
  modal.msgSuccess(bt('deleteSuccess'));
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
