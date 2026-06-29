<template>
  <div class="p-2 page-shell boxhilltravel_manager-featured_tour-page">
    <div class="search-wrap">
      <el-card shadow="hover" class="search-panel" :class="{ 'is-collapsed': !showSearch }">
        <template #header>
          <div class="panel-heading search-panel-toggle" @click.stop="showSearch = !showSearch">
            <div><h3>Filter</h3></div>
          </div>
        </template>
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form">
          <el-form-item label="Tour ID" prop="tourId">
            <el-input v-model="queryParams.tourId" placeholder="Please enter tour ID" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">Search</el-button>
            <el-button icon="Refresh" @click="resetQuery">Reset</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <el-card shadow="hover" class="table-panel">
      <template #header>
        <div class="toolbar-shell">
          <div class="table-heading">
            <h3>Featured Tours</h3>
          </div>
          <div class="toolbar-actions">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['boxhilltravel_manager:featured_tour:add']">Add Tours</el-button>
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['boxhilltravel_manager:featured_tour:edit']">Edit Sort</el-button>
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['boxhilltravel_manager:featured_tour:remove']">Delete</el-button>
            <right-toolbar v-model:show-search="showSearch" :search="false" @query-table="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" border class="data-table" :data="featured_tourList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="Sort Order" align="center" prop="sortOrder" width="110" />
        <el-table-column label="Tour Code" align="center" min-width="140">
          <template #default="scope">
            {{ scope.row.tour?.code || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="Tour Name" align="center" min-width="220" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.tour?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="Cover" align="center" width="100">
          <template #default="scope">
            <image-preview v-if="scope.row.tour?.coverImageUrl" :src="scope.row.tour.coverImageUrl" :width="50" :height="50" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="Days" align="center" width="90">
          <template #default="scope">
            {{ scope.row.tour?.durationDays ?? '-' }}
          </template>
        </el-table-column>
        <el-table-column label="Base Price" align="center" width="120">
          <template #default="scope">
            {{ scope.row.tour?.basePrice ?? '-' }}
          </template>
        </el-table-column>
        <el-table-column label="Sale Price" align="center" width="120">
          <template #default="scope">
            {{ scope.row.tour?.salePrice ?? '-' }}
          </template>
        </el-table-column>
        <el-table-column label="Status" align="center" width="130">
          <template #default="scope">
            <el-switch
              v-if="scope.row.tour"
              v-model="scope.row.tour.status"
              :active-value="statusPublishedValue"
              :inactive-value="statusUnpublishedValue"
              :loading="tourStatusLoadingIds.includes(String(scope.row.tour.id))"
              active-text="On"
              inactive-text="Off"
              inline-prompt
              @change="handleTourStatusChange(scope.row.tour)"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="Actions" align="center" class-name="small-padding fixed-width" width="120">
          <template #default="scope">
            <el-tooltip content="Edit Sort" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['boxhilltravel_manager:featured_tour:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="Delete" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['boxhilltravel_manager:featured_tour:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <el-dialog title="Select Tours" v-model="tourSelectVisible" width="980px" append-to-body @closed="handleTourSelectClosed">
      <el-form :model="tourSelectQuery" :inline="true" class="query-form">
        <el-form-item label="Tour Code">
          <el-input v-model="tourSelectQuery.code" placeholder="Please enter tour code" clearable @keyup.enter="handleTourSelectQuery" />
        </el-form-item>
        <el-form-item label="Tour Name">
          <el-input v-model="tourSelectQuery.name" placeholder="Please enter tour name" clearable @keyup.enter="handleTourSelectQuery" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleTourSelectQuery">Search</el-button>
          <el-button icon="Refresh" @click="resetTourSelectQuery">Reset</el-button>
        </el-form-item>
      </el-form>

      <el-table
        v-loading="tourSelectLoading"
        border
        class="data-table"
        :data="tourSelectList"
        row-key="id"
        @selection-change="handleTourSelectChange"
      >
        <el-table-column type="selection" width="55" align="center" :selectable="isTourSelectable" />
        <el-table-column label="Tour Code" align="center" prop="code" min-width="140" />
        <el-table-column label="Tour Name" align="center" prop="name" min-width="220" show-overflow-tooltip />
        <el-table-column label="Cover" align="center" width="100">
          <template #default="scope">
            <image-preview v-if="scope.row.coverImageUrl" :src="scope.row.coverImageUrl" :width="50" :height="50" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="Days" align="center" prop="durationDays" width="90" />
        <el-table-column label="Base Price" align="center" prop="basePrice" width="120" />
        <el-table-column label="Sale Price" align="center" prop="salePrice" width="120" />
        <el-table-column label="Status" align="center" width="110">
          <template #default="scope">
            <el-tag :type="scope.row.status === statusPublishedValue ? 'success' : 'info'">
              {{ scope.row.status === statusPublishedValue ? 'Published' : 'Unpublished' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="tourSelectTotal > 0"
        :total="tourSelectTotal"
        v-model:page="tourSelectQuery.pageNum"
        v-model:limit="tourSelectQuery.pageSize"
        @pagination="getTourSelectList"
      />

      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="tourAddLoading" type="primary" @click="confirmAddTours">Add Selected</el-button>
          <el-button @click="tourSelectVisible = false">Cancel</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="featured_tourFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="Tour Code">
          <el-input :model-value="getFormTour()?.code || '-'" disabled />
        </el-form-item>
        <el-form-item label="Tour Name">
          <el-input :model-value="getFormTour()?.name || '-'" disabled />
        </el-form-item>
        <el-form-item label="Sort Order" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" controls-position="right" :min="1" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">Confirm</el-button>
          <el-button @click="cancel">Cancel</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Featured_tour" lang="ts">
import {
  addFeatured_tour,
  delFeatured_tour,
  getFeatured_tour,
  listFeatured_tour,
  updateFeatured_tour
} from '@/api/boxhilltravel_manager/featured_tour';
import type { Featured_tourForm, Featured_tourQuery, Featured_tourVO } from '@/api/boxhilltravel_manager/featured_tour/types';
import { changeTourStatus, getTour, listTour } from '@/api/boxhilltravel_manager/tour';
import type { TourQuery, TourVO } from '@/api/boxhilltravel_manager/tour/types';
import { useLoading } from '@/hooks/async/useLoading';
import { useFormDialog } from '@/hooks/dialog/useFormDialog';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useSearchToggle } from '@/hooks/form/useSearchToggle';
import { useTableSelection } from '@/hooks/table/useTableSelection';
import modal from '@/plugins/modal';
import { parseTime } from '@/utils/ruoyi';

type FeaturedTourRow = Featured_tourVO & {
  tour?: TourVO;
};

type TourSelectQuery = TourQuery & {
  pageNum: number;
  pageSize: number;
};

const statusPublishedValue = 1;
const statusUnpublishedValue = 2;

const featured_tourList = ref<FeaturedTourRow[]>([]);
const buttonLoading = ref(false);
const tourSelectVisible = ref(false);
const tourSelectLoading = ref(false);
const tourAddLoading = ref(false);
const tourSelectList = ref<TourVO[]>([]);
const selectedTours = ref<TourVO[]>([]);
const tourSelectTotal = ref(0);
const tourMap = ref<Record<string, TourVO>>({});
const existingFeaturedRows = ref<Featured_tourVO[]>([]);
const existingFeaturedTourIds = ref<Set<string>>(new Set());
const tourStatusLoadingIds = ref<string[]>([]);
const tourStatusSnapshot = ref<Record<string, number>>({});
const { loading, withLoading } = useLoading(true);
const { showSearch } = useSearchToggle();
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const featured_tourFormRef = ref<ElFormInstance>();

const initFormData: Featured_tourForm = {
  id: undefined,
  tourId: undefined,
  sortOrder: undefined
};

const data = reactive<PageData<Featured_tourForm, Featured_tourQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    tourId: undefined,
    params: {}
  },
  rules: {
    sortOrder: [{ required: true, message: 'Sort order is required', trigger: 'change' }]
  }
});

const tourSelectQuery = reactive<TourSelectQuery>({
  pageNum: 1,
  pageSize: 10,
  code: undefined,
  name: undefined,
  params: {}
});

const { queryParams, form, rules } = toRefs(data);
const { ids, single, multiple, handleSelectionChange } = useTableSelection<FeaturedTourRow>(item => item.id);
const { dialog, resetForm: reset, showDialog, closeDialog } = useFormDialog({
  form,
  formRef: featured_tourFormRef,
  initialFormData: initFormData
});

const setTourInMap = (tour?: TourVO) => {
  if (!tour?.id) {
    return;
  }
  tourMap.value[String(tour.id)] = tour;
  tourStatusSnapshot.value[String(tour.id)] = tour.status;
};

const getFormTour = () => {
  if (!form.value.tourId) {
    return undefined;
  }
  return tourMap.value[String(form.value.tourId)];
};

const getAllTourList = async () => {
  const res = await listTour({ pageNum: 1, pageSize: 10000, params: {} });
  return res.data?.rows || [];
};

const loadToursForRows = async (rows: Featured_tourVO[]) => {
  if (!rows.length) {
    return [];
  }
  const tours = await getAllTourList();
  tours.forEach(setTourInMap);

  const missingTourIds = rows
    .map(item => item.tourId)
    .filter(tourId => tourId && !tourMap.value[String(tourId)]);

  for (const tourId of missingTourIds) {
    const res = await getTour(tourId);
    setTourInMap(res.data);
  }

  return rows.map(item => ({
    ...item,
    tour: tourMap.value[String(item.tourId)]
  }));
};

/** Query featured tour list. */
const getList = async () => {
  await withLoading(async () => {
    const res = await listFeatured_tour(queryParams.value);
    const rows = res.data?.rows || [];
    featured_tourList.value = await loadToursForRows(rows);
    total.value = res.data?.total || 0;
  });
};

/** Cancel edit dialog. */
const cancel = () => {
  reset();
  closeDialog();
};

/** Search. */
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
  afterReset: () => {
    handleQuery();
  }
});

const loadExistingFeaturedTourIds = async () => {
  const res = await listFeatured_tour({ pageNum: 1, pageSize: 10000, params: {} });
  const rows = res.data?.rows || [];
  existingFeaturedRows.value = rows;
  existingFeaturedTourIds.value = new Set(rows.map(item => String(item.tourId)));
};

const getTourSelectList = async () => {
  tourSelectLoading.value = true;
  try {
    const res = await listTour(tourSelectQuery);
    tourSelectList.value = res.data?.rows || [];
    tourSelectList.value.forEach(setTourInMap);
    tourSelectTotal.value = res.data?.total || 0;
  } finally {
    tourSelectLoading.value = false;
  }
};

const handleTourSelectQuery = () => {
  tourSelectQuery.pageNum = 1;
  getTourSelectList();
};

const resetTourSelectQuery = () => {
  tourSelectQuery.pageNum = 1;
  tourSelectQuery.pageSize = 10;
  tourSelectQuery.code = undefined;
  tourSelectQuery.name = undefined;
  getTourSelectList();
};

const handleTourSelectChange = (selection: TourVO[]) => {
  selectedTours.value = selection;
};

const isTourSelectable = (row: TourVO) => !existingFeaturedTourIds.value.has(String(row.id));

const handleTourSelectClosed = () => {
  selectedTours.value = [];
};

/** Open tour selection dialog. */
const handleAdd = async () => {
  selectedTours.value = [];
  tourSelectVisible.value = true;
  await loadExistingFeaturedTourIds();
  await getTourSelectList();
};

const getNextSortOrder = () => {
  const sortOrders = existingFeaturedRows.value.map(item => Number(item.sortOrder) || 0);
  return Math.max(0, ...sortOrders) + 1;
};

const confirmAddTours = async () => {
  const selected = selectedTours.value.filter(tour => !existingFeaturedTourIds.value.has(String(tour.id)));
  if (!selected.length) {
    modal.msgWarning('Please select tours that are not already in featured tours');
    return;
  }

  tourAddLoading.value = true;
  try {
    let nextSortOrder = getNextSortOrder();
    for (const tour of selected) {
      await addFeatured_tour({
        tourId: tour.id,
        sortOrder: nextSortOrder
      });
      nextSortOrder += 1;
    }
    modal.msgSuccess('Added successfully');
    tourSelectVisible.value = false;
    await getList();
  } finally {
    tourAddLoading.value = false;
  }
};

/** Edit sort order. */
const handleUpdate = async (row?: Partial<Featured_tourVO>) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getFeatured_tour(_id);
  Object.assign(form.value, res.data);
  if (form.value.tourId && !tourMap.value[String(form.value.tourId)]) {
    const tourRes = await getTour(form.value.tourId);
    setTourInMap(tourRes.data);
  }
  showDialog('Edit Featured Tour');
};

/** Submit edit. */
const submitForm = () => {
  featured_tourFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      await updateFeatured_tour(form.value).finally(() => (buttonLoading.value = false));
      modal.msgSuccess('Updated successfully');
      closeDialog();
      await getList();
    }
  });
};

/** Delete. */
const handleDelete = async (row?: Partial<Featured_tourVO>) => {
  const _ids = row?.id || ids.value;
  await modal.confirm('Confirm deleting featured tour ID "' + _ids + '"?');
  await delFeatured_tour(_ids);
  modal.msgSuccess('Deleted successfully');
  await getList();
};

const addTourStatusLoading = (tourId: string) => {
  tourStatusLoadingIds.value = [...tourStatusLoadingIds.value, tourId];
};

const removeTourStatusLoading = (tourId: string) => {
  tourStatusLoadingIds.value = tourStatusLoadingIds.value.filter(item => item !== tourId);
};

/** Publish or unpublish the linked tour. */
const handleTourStatusChange = async (tour: TourVO) => {
  const tourId = String(tour.id);
  const oldStatus = tourStatusSnapshot.value[tourId] ?? statusUnpublishedValue;
  const text = tour.status === statusPublishedValue ? 'publish' : 'unpublish';
  addTourStatusLoading(tourId);
  try {
    await modal.confirm('Confirm to ' + text + ' this tour?');
    await changeTourStatus(tour.id, tour.status);
    tourStatusSnapshot.value[tourId] = tour.status;
    modal.msgSuccess('Status updated successfully');
  } catch (err) {
    tour.status = oldStatus;
  } finally {
    removeTourStatusLoading(tourId);
  }
};

onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
.boxhilltravel_manager-featured_tour-page {
  :deep(.el-dialog__body .pagination-container) {
    padding-bottom: 0;
  }
}
</style>
