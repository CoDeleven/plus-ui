<template>
  <div class="p-2 page-shell boxhilltravel_manager-tour_itinerary_activity-page">
    <div class="search-wrap">
      <el-card shadow="hover" class="search-panel" :class="{ 'is-collapsed': !showSearch }">
        <template #header>
          <div class="panel-heading search-panel-toggle" @click.stop="showSearch = !showSearch">
            <div><h3>{{ bt('filters') }}</h3></div>
          </div>
        </template>
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form">
            <el-form-item :label="bt('title')" prop="title">
              <el-input v-model="queryParams.title" :placeholder="bt('enterTitle')" clearable @keyup.enter="handleQuery" />
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
            <h3>{{ bt('activityList') }}</h3>
          </div>
          <div class="toolbar-actions">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['boxhilltravel_manager:tour_itinerary_activity:add']">{{ bt('add') }}</el-button>
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['boxhilltravel_manager:tour_itinerary_activity:edit']">{{ bt('edit') }}</el-button>
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['boxhilltravel_manager:tour_itinerary_activity:remove']">{{ bt('delete') }}</el-button>
            <right-toolbar v-model:show-search="showSearch" :search="false" @query-table="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" border class="data-table" :data="tour_itinerary_activityList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column :label="bt('title')" align="center" prop="title" />
        <el-table-column :label="bt('description')" align="center" prop="description" :show-overflow-tooltip="true" />
        <el-table-column :label="bt('activityIcon')" align="center" prop="activityIcon">
          <template #default="scope">
            <el-tooltip v-if="scope.row.activityIcon" :content="scope.row.activityIcon" placement="top">
              <svg-icon :icon-class="scope.row.activityIcon" />
            </el-tooltip>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column :label="bt('subtitles')" align="center" prop="subtitle">
          <template #default="scope">
            <div v-if="parseSubtitleValues(scope.row.subtitle).length" class="subtitle-tags">
              <el-tag v-for="subtitle in parseSubtitleValues(scope.row.subtitle)" :key="subtitle" type="info">
                {{ subtitle }}
              </el-tag>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column :label="bt('sortOrder')" align="center" prop="sortOrder" />
        <el-table-column :label="bt('showInPreview')" align="center" prop="showInPreview">
          <template #default="scope">
            <el-switch
              v-model="scope.row.showInPreview"
              :active-value="1"
              :inactive-value="0"
              disabled
            />
          </template>
        </el-table-column>
        <el-table-column :label="bt('actions')" align="center" class-name="small-padding fixed-width" :min-width="200">
          <template #default="scope">
            <el-tooltip :content="bt('edit')" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['boxhilltravel_manager:tour_itinerary_activity:edit']"></el-button>
            </el-tooltip>
            <el-tooltip :content="bt('delete')" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['boxhilltravel_manager:tour_itinerary_activity:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body destroy-on-close @closed="handleDialogClosed">
      <el-form ref="tour_itinerary_activityFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item :label="bt('itineraryId')" prop="itineraryId">
          <el-input v-model="form.itineraryId" disabled />
        </el-form-item>
        <el-form-item :label="bt('tourId')" prop="tourId">
          <el-input v-model="form.tourId" disabled />
        </el-form-item>
        <el-form-item :label="bt('title')" prop="title">
          <el-input v-model="form.title" :placeholder="bt('enterTitle')" />
        </el-form-item>
        <el-form-item :label="bt('description')" prop="description">
            <el-input v-model="form.description" type="textarea" :placeholder="bt('enterContent')" />
        </el-form-item>
        <el-form-item :label="bt('activityIcon')" prop="activityIcon">
          <icon-select v-model="form.activityIcon" />
        </el-form-item>
        <el-form-item :label="bt('subtitles')" prop="subtitle">
          <el-select
            v-model="selectedSubtitles"
            multiple
            filterable
            allow-create
            default-first-option
            collapse-tags
            collapse-tags-tooltip
            :placeholder="bt('enterSubtitle')"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="bt('sortOrder')" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" controls-position="right" />
        </el-form-item>
        <el-form-item :label="bt('showInPreview')" prop="showInPreview">
          <el-switch
            v-model="form.showInPreview"
            :active-value="1"
            :inactive-value="0"
          />
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

<script setup name="Tour_itinerary_activity" lang="ts">

import { useBoxhillI18n } from '../useBoxhillI18n';
import {  addTour_itinerary_activity,
  delTour_itinerary_activity,
  getTour_itinerary_activity,
  listTour_itinerary_activity,
  updateTour_itinerary_activity
} from '@/api/boxhilltravel_manager/tour_itinerary_activity';
import { Tour_itinerary_activityForm, Tour_itinerary_activityQuery, Tour_itinerary_activityVO } from '@/api/boxhilltravel_manager/tour_itinerary_activity/types';
import { useLoading } from '@/hooks/async/useLoading';
import { useFormDialog } from '@/hooks/dialog/useFormDialog';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useSearchToggle } from '@/hooks/form/useSearchToggle';
import { useTableSelection } from '@/hooks/table/useTableSelection';
import modal from '@/plugins/modal';
import { useRoute } from 'vue-router';

const { bt } = useBoxhillI18n();


const route = useRoute();
const lockedItineraryId = computed(() => route.query.tour_itinerary_id as string | number);
const lockedTourId = computed(() => route.query.tourId as string | number);
const hasLockedItinerary = computed(() => lockedItineraryId.value !== undefined && lockedItineraryId.value !== '');

const tour_itinerary_activityList = ref<Tour_itinerary_activityVO[]>([]);
const buttonLoading = ref(false);
const selectedSubtitles = ref<string[]>([]);
const { loading, withLoading } = useLoading(true);
const { showSearch } = useSearchToggle();
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const tour_itinerary_activityFormRef = ref<ElFormInstance>();

const initFormData: Tour_itinerary_activityForm = {
  id: undefined,
  itineraryId: undefined,
  tourId: undefined,
  title: undefined,
  description: undefined,
  activityIcon: undefined,
  subtitle: undefined,
  sortOrder: undefined,
  showInPreview: undefined,
}
const data = reactive<PageData<Tour_itinerary_activityForm, Tour_itinerary_activityQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    itineraryId: undefined,
    tourId: undefined,
    title: undefined,
    params: {
    }
  },
  rules: {
id: [
      { required: true, message: bt('required'), trigger: "change" }
    ],
itineraryId: [
      { required: true, message: bt('itineraryIdRequired'), trigger: "change" }
    ],
tourId: [
      { required: true, message: bt('tourIdRequired'), trigger: "change" }
    ],
title: [
      { required: true, message: bt('titleRequired'), trigger: "blur" }
    ],
description: [
      { required: true, message: bt('descriptionRequired'), trigger: "blur" }
    ],
sortOrder: [
      { required: true, message: bt('required'), trigger: "change" }
    ],
showInPreview: [
      { required: true, message: bt('showInPreviewRequired'), trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);
const { ids, single, multiple, handleSelectionChange } = useTableSelection<Tour_itinerary_activityVO>(item => item.id);
const { dialog, resetForm: reset, openDialog, showDialog, closeDialog } = useFormDialog({
  form,
  formRef: tour_itinerary_activityFormRef,
  initialFormData: initFormData
});

const lockItineraryParams = () => {
  queryParams.value.itineraryId = lockedItineraryId.value;
  if (lockedTourId.value) {
    queryParams.value.tourId = lockedTourId.value;
  }
};

const lockItineraryForm = () => {
  form.value.itineraryId = lockedItineraryId.value;
  if (lockedTourId.value) {
    form.value.tourId = lockedTourId.value;
  }
};

const parseSubtitleValues = (subtitle?: string | Array<string | number> | null): string[] => {
  if (Array.isArray(subtitle)) {
    return subtitle.map(item => String(item).trim()).filter(Boolean);
  }
  if (!subtitle) {
    return [];
  }
  const subtitleText = String(subtitle).trim();
  if (!subtitleText) {
    return [];
  }
  try {
    const subtitleList = JSON.parse(subtitleText);
    if (Array.isArray(subtitleList)) {
      return subtitleList.map(item => String(item).trim()).filter(Boolean);
    }
  } catch {
    return [subtitleText];
  }
  return [subtitleText];
};

const stringifySubtitleValues = (subtitles: string[]) => JSON.stringify(subtitles.map(item => item.trim()).filter(Boolean));

const resetSelectedSubtitles = () => {
  selectedSubtitles.value = [];
};


const getList = async () => {
  await withLoading(async () => {
    lockItineraryParams();
    if (!hasLockedItinerary.value) {
      tour_itinerary_activityList.value = [];
      total.value = 0;
      return;
    }
    const res = await listTour_itinerary_activity(queryParams.value);
    tour_itinerary_activityList.value = res.data?.rows;
    total.value = res.data?.total;
  });
};


const cancel = () => {
  reset();
  resetSelectedSubtitles();
  closeDialog();
};

const handleDialogClosed = () => {
  resetSelectedSubtitles();
};


const handleQuery = () => {
  lockItineraryParams();
  queryParams.value.pageNum = 1;
  getList();
};

const { resetQuery } = useSearchReset({
  queryFormRef,
  queryParams,
  pageNumKey: 'pageNum',
  pageSizeKey: 'pageSize',
  initialPageSize: 10,
  resetExtras: () => {
    lockItineraryParams();
  },
  afterReset: () => {
    handleQuery();
  }
});


const handleAdd = () => {
  if (!hasLockedItinerary.value) {
    modal.msgWarning(bt('enterActivityFromItinerary'));
    return;
  }
  openDialog(bt('addActivity'));
  resetSelectedSubtitles();
  lockItineraryForm();
};


const handleUpdate = async (row?: Partial<Tour_itinerary_activityVO>) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getTour_itinerary_activity(_id);
  Object.assign(form.value, res.data);
  selectedSubtitles.value = parseSubtitleValues(res.data?.subtitle);
  lockItineraryForm();
  showDialog(bt('editActivity'));
};


const submitForm = () => {
  tour_itinerary_activityFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      if (!hasLockedItinerary.value) {
        modal.msgWarning(bt('enterActivityFromItinerary'));
        return;
      }
      buttonLoading.value = true;
      lockItineraryForm();
      form.value.subtitle = stringifySubtitleValues(selectedSubtitles.value);
      if (form.value.id) {
        await updateTour_itinerary_activity(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addTour_itinerary_activity(form.value).finally(() => (buttonLoading.value = false));
      }
      modal.msgSuccess(bt('operationSuccess'));
      closeDialog();
      await getList();
    }
  });
};


const handleDelete = async (row?: Partial<Tour_itinerary_activityVO>) => {
  const _ids = row?.id || ids.value;
  await modal.confirm(bt('confirmDeleteActivity', { ids: _ids }));
  await delTour_itinerary_activity(_ids);
  modal.msgSuccess(bt('deleteSuccess'));
  await getList();
};




onMounted(() => {
  lockItineraryParams();
  getList();
});
</script>

