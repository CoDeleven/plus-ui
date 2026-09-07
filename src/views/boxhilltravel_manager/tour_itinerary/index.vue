<template>
  <div class="p-2 page-shell boxhilltravel_manager-tour_itinerary-page">
    <el-card shadow="hover" class="table-panel">
      <template #header>
        <div class="toolbar-shell">
          <div class="table-heading flex items-center gap-2">
            <el-button link type="primary" icon="ArrowLeft" @click="handleBack">{{ bt('back') }}</el-button>
            <h3>{{ bt('itineraries') }}— {{ tourName }}</h3>
          </div>
          <div class="toolbar-actions">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['boxhilltravel_manager:tour_itinerary:add']">{{ bt('add') }}</el-button>
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['boxhilltravel_manager:tour_itinerary:edit']">{{ bt('edit') }}</el-button>
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['boxhilltravel_manager:tour_itinerary:remove']">{{ bt('delete') }}</el-button>
            <right-toolbar :search="false" @query-table="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" border class="data-table" :data="tour_itineraryList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column :label="bt('dayNumber')" align="center" prop="dayNumber" />
        <el-table-column :label="bt('title')" align="center" prop="title">
          <template #default="scope">
            <el-link type="primary" @click="handleActivity(scope.row as Tour_itineraryVO)">{{ scope.row.title }}</el-link>
          </template>
        </el-table-column>
        <el-table-column :label="bt('description')" align="center" prop="description" :show-overflow-tooltip="true" />
        <el-table-column :label="bt('fromDestination')" align="center" prop="fromDestination" />
        <el-table-column :label="bt('toDestination')" align="center" prop="toDestination" />
        <el-table-column :label="bt('mealsBld')" align="center" prop="meals">
          <template #default="scope">
            <dict-tag :options="dining" :value="parseMealValues(scope.row.meals)"/>
          </template>
        </el-table-column>
        <el-table-column :label="bt('actions')" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip :content="bt('edit')" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['boxhilltravel_manager:tour_itinerary:edit']"></el-button>
            </el-tooltip>
            <el-tooltip :content="bt('delete')" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['boxhilltravel_manager:tour_itinerary:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="tour_itineraryFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item :label="bt('dayNumber')" prop="dayNumber">
          <el-input-number v-model="form.dayNumber" controls-position="right" :min="1" />
        </el-form-item>
        <el-form-item :label="bt('title')" prop="title">
          <el-input v-model="form.title" :placeholder="bt('enterTitle')" />
        </el-form-item>
        <el-form-item :label="bt('description')" prop="description">
            <el-input v-model="form.description" type="textarea" :placeholder="bt('enterContent')" />
        </el-form-item>
        <el-form-item :label="bt('fromDestination')" prop="fromDestinationId">
          <el-tree-select
            v-model="form.fromDestinationId"
            :data="destinationOptions"
            :props="destinationTreeProps as any"
            value-key="id"
            node-key="id"
            :placeholder="bt('selectFromDestination')"
            check-strictly
            filterable
            remote
            :remote-method="remoteSearchDestinationTree"
            :loading="destinationSearching"
            clearable
            lazy
            :load="loadDestinationOptions"
            :cache-data="destinationCacheOptions"
          />
        </el-form-item>
        <el-form-item :label="bt('toDestination')" prop="toDestinationId">
          <el-tree-select
            v-model="form.toDestinationId"
            :data="destinationOptions"
            :props="destinationTreeProps as any"
            value-key="id"
            node-key="id"
            :placeholder="bt('selectToDestination')"
            check-strictly
            filterable
            remote
            :remote-method="remoteSearchDestinationTree"
            :loading="destinationSearching"
            clearable
            lazy
            :load="loadDestinationOptions"
            :cache-data="destinationCacheOptions"
          />
        </el-form-item>
        <el-form-item :label="bt('mealsBld')" prop="meals">
          <el-select v-model="selectedMeals" multiple collapse-tags collapse-tags-tooltip :placeholder="bt('selectMealsBld')">
            <el-option
                v-for="dict in dining"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
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

<script setup name="Tour_itinerary" lang="ts">

import { useBoxhillI18n } from '../useBoxhillI18n';
import type { LoadFunction } from 'element-plus';
import {  addTour_itinerary,
  delTour_itinerary,
  getTour_itinerary,
  listTour_itinerary,
  updateTour_itinerary
} from '@/api/boxhilltravel_manager/tour_itinerary';
import { getDestination, listDestination, listDestinationTree } from '@/api/boxhilltravel_manager/destination';
import type { DestinationTreeOption, DestinationVO } from '@/api/boxhilltravel_manager/destination/types';
import { Tour_itineraryForm, Tour_itineraryQuery, Tour_itineraryVO } from '@/api/boxhilltravel_manager/tour_itinerary/types';
import { useLoading } from '@/hooks/async/useLoading';
import { useFormDialog } from '@/hooks/dialog/useFormDialog';
import { useTableSelection } from '@/hooks/table/useTableSelection';
import { useDict } from '@/utils/dict';
import modal from '@/plugins/modal';
import tab from '@/plugins/tab';
import { useRoute } from 'vue-router';

const { bt } = useBoxhillI18n();

const { dining } = toRefs<any>(useDict('dining'));

const route = useRoute();

const tourId = computed(() => route.query.tourId as string | number);
const tourName = computed(() => (route.query.tourName as string) || '');

const tour_itineraryList = ref<Tour_itineraryVO[]>([]);
const buttonLoading = ref(false);
const { loading, withLoading } = useLoading(true);
const total = ref(0);
const selectedMeals = ref<string[]>([]);
type DestinationOption = {
  id: string | number;
  label: string;
  children?: DestinationOption[];
  isLeaf?: boolean;
};
const destinationOptions = ref<DestinationOption[]>([]);
const destinationCacheOptions = ref<DestinationOption[]>([]);
const destinationSearching = ref(false);
const destinationSearchTimer = ref<ReturnType<typeof setTimeout>>();
const destinationTreeProps = { value: 'id', label: 'label', children: 'children', isLeaf: 'isLeaf' };

const tour_itineraryFormRef = ref<ElFormInstance>();

const initFormData: Tour_itineraryForm = {
  id: undefined,
  tourId: undefined,
  dayNumber: undefined,
  title: undefined,
  description: undefined,
  fromDestinationId: undefined,
  toDestinationId: undefined,
  meals: undefined,
}
const data = reactive<PageData<Tour_itineraryForm, Tour_itineraryQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    tourId: tourId.value,
    params: {
    }
  },
  rules: {
dayNumber: [
      { required: true, message: bt('dayNumberRequired'), trigger: "change" }
    ],
title: [
      { required: true, message: bt('titleRequired'), trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);
const { ids, single, multiple, handleSelectionChange } = useTableSelection<Tour_itineraryVO>(item => item.id);
const { dialog, resetForm: reset, openDialog, showDialog, closeDialog } = useFormDialog({
  form,
  formRef: tour_itineraryFormRef,
  initialFormData: initFormData
});

const parseMealValues = (meals?: string | Array<string | number> | null): string[] => {
  if (Array.isArray(meals)) {
    return meals.map(String);
  }
  if (!meals) {
    return [];
  }
  const text = String(meals).trim();
  if (!text) {
    return [];
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = undefined;
  }
  if (Array.isArray(parsed)) {
    return parsed.map(String);
  }
  return text.split(',').map(item => item.trim()).filter(Boolean);
};

const stringifyMealValues = (meals: string[]) => JSON.stringify(meals);

const hasChildLayer = (row: Pick<DestinationVO, 'level'> | Pick<DestinationTreeOption, 'level'>) => row.level == null || Number(row.level) < 3;

const getDestinationLabel = (row: Partial<DestinationVO>) => row.nameEn || row.name || String(row.id);

const toDestinationOption = (row: DestinationVO): DestinationOption => ({
  id: row.id,
  label: getDestinationLabel(row),
  isLeaf: !hasChildLayer(row)
});

const toDestinationTreeOption = (row: DestinationTreeOption): DestinationOption => ({
  id: row.id,
  label: row.label || row.nameEn || row.name || String(row.id),
  isLeaf: !hasChildLayer(row),
  children: row.children?.map(toDestinationTreeOption)
});

const getDestinationChildren = async (parentId: string | number) => {
  const res = await listDestination({
    parentId,
    pageNum: 1,
    pageSize: 10000
  });
  return (res.data?.rows || []).map(toDestinationOption);
};

const loadRootDestinationOptions = async () => {
  destinationOptions.value = await getDestinationChildren(0);
};

const remoteSearchDestinationTree = (keyword: string) => {
  if (destinationSearchTimer.value) {
    clearTimeout(destinationSearchTimer.value);
  }

  const searchText = keyword.trim();
  if (!searchText) {
    loadRootDestinationOptions();
    return;
  }

  destinationSearchTimer.value = setTimeout(async () => {
    destinationSearching.value = true;
    try {
      const res = await listDestinationTree({
        nameEn: searchText,
        pageNum: 1,
        pageSize: 10000
      });
      destinationOptions.value = (res.data || []).map(toDestinationTreeOption);
    } finally {
      destinationSearching.value = false;
    }
  }, 300);
};

const loadDestinationOptions: LoadFunction = async (node, resolve) => {
  if (node.level === 0) {
    resolve(destinationOptions.value);
    return;
  }

  const current = node.data as DestinationOption | undefined;
  if (!current || current.isLeaf) {
    resolve([]);
    return;
  }

  resolve(await getDestinationChildren(current.id));
};

const cacheDestinationOptionsByIds = async (...ids: Array<string | number | undefined>) => {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean))) as Array<string | number>;
  if (!uniqueIds.length) {
    destinationCacheOptions.value = [];
    return;
  }
  const rows = await Promise.all(uniqueIds.map(id => getDestination(id).then(res => res.data)));
  destinationCacheOptions.value = rows.filter(Boolean).map(toDestinationOption);
};


const getList = async () => {
  await withLoading(async () => {

    queryParams.value.tourId = tourId.value;
    const res = await listTour_itinerary(queryParams.value);
    tour_itineraryList.value = res.data?.rows;
    total.value = res.data?.total;
  });
};


const cancel = () => {
  selectedMeals.value = [];
  reset();
  closeDialog();
};


const handleAdd = () => {
  openDialog(bt('addItinerary'));
  selectedMeals.value = [];
  destinationCacheOptions.value = [];

  form.value.tourId = tourId.value;
};


const handleUpdate = async (row?: Partial<Tour_itineraryVO>) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getTour_itinerary(_id);
  Object.assign(form.value, res.data);
  selectedMeals.value = parseMealValues(res.data?.meals);
  await cacheDestinationOptionsByIds(res.data?.fromDestinationId, res.data?.toDestinationId);
  showDialog(bt('editItinerary'));
};


const submitForm = () => {
  tour_itineraryFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      if (!form.value.id) {
        form.value.tourId = tourId.value;
      }
      form.value.meals = stringifyMealValues(selectedMeals.value);
      if (form.value.id) {
        await updateTour_itinerary(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addTour_itinerary(form.value).finally(() => (buttonLoading.value = false));
      }
      modal.msgSuccess(bt('operationSuccess'));
      closeDialog();
      await getList();
    }
  });
};


const handleDelete = async (row?: Partial<Tour_itineraryVO>) => {
  const _ids = row?.id || ids.value;
  await modal.confirm(bt('confirmDeleteItinerary', { ids: _ids }));
  await delTour_itinerary(_ids);
  modal.msgSuccess(bt('deleteSuccess'));
  await getList();
};

const handleActivity = (row: Tour_itineraryVO) => {
  tab.openPage('/boxhilltravel_manager/tour_itinerary_activity', bt('text005') + row.title, {
    tour_itinerary_id: row.id,
    tourId: row.tourId,
    itineraryTitle: row.title
  });
};


const handleBack = () => {
  tab.closePage();
};

onMounted(() => {
  getList();
  loadRootDestinationOptions();
});

onBeforeUnmount(() => {
  if (destinationSearchTimer.value) {
    clearTimeout(destinationSearchTimer.value);
  }
});
</script>
