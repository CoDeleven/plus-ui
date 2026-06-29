<template>
  <div class="p-2 page-shell boxhilltravel_manager-tour_itinerary_activity-page">
    <div class="search-wrap">
      <el-card shadow="hover" class="search-panel" :class="{ 'is-collapsed': !showSearch }">
        <template #header>
          <div class="panel-heading search-panel-toggle" @click.stop="showSearch = !showSearch">
            <div><h3>筛选条件</h3></div>
          </div>
        </template>
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form">
            <el-form-item label="标题" prop="title">
              <el-input v-model="queryParams.title" placeholder="请输入标题" clearable @keyup.enter="handleQuery" />
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
            <h3>行程活动列表</h3>
          </div>
          <div class="toolbar-actions">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['boxhilltravel_manager:tour_itinerary_activity:add']">新增</el-button>
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['boxhilltravel_manager:tour_itinerary_activity:edit']">修改</el-button>
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['boxhilltravel_manager:tour_itinerary_activity:remove']">删除</el-button>
            <right-toolbar v-model:show-search="showSearch" :search="false" @query-table="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" border class="data-table" :data="tour_itinerary_activityList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="标题" align="center" prop="title" />
        <el-table-column label="描述" align="center" prop="description" :show-overflow-tooltip="true" />
        <el-table-column label="活动图标" align="center" prop="activityIcon">
          <template #default="scope">
            <el-tooltip v-if="scope.row.activityIcon" :content="scope.row.activityIcon" placement="top">
              <svg-icon :icon-class="scope.row.activityIcon" />
            </el-tooltip>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="副标签列表" align="center" prop="subtitle">
          <template #default="scope">
            <div v-if="parseSubtitleValues(scope.row.subtitle).length" class="subtitle-tags">
              <el-tag v-for="subtitle in parseSubtitleValues(scope.row.subtitle)" :key="subtitle" type="info">
                {{ subtitle }}
              </el-tag>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="排序" align="center" prop="sortOrder" />
        <el-table-column label="是否在预览时展示" align="center" prop="showInPreview">
          <template #default="scope">
            <el-switch
              v-model="scope.row.showInPreview"
              :active-value="1"
              :inactive-value="0"
              disabled
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" :min-width="200">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['boxhilltravel_manager:tour_itinerary_activity:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['boxhilltravel_manager:tour_itinerary_activity:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改行程活动对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body destroy-on-close @closed="handleDialogClosed">
      <el-form ref="tour_itinerary_activityFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="行程ID" prop="itineraryId">
          <el-input v-model="form.itineraryId" disabled />
        </el-form-item>
        <el-form-item label="线路ID" prop="tourId">
          <el-input v-model="form.tourId" disabled />
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
            <el-input v-model="form.description" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="活动图标" prop="activityIcon">
          <icon-select v-model="form.activityIcon" />
        </el-form-item>
        <el-form-item label="副标签列表" prop="subtitle">
          <el-select
            v-model="selectedSubtitles"
            multiple
            filterable
            allow-create
            default-first-option
            collapse-tags
            collapse-tags-tooltip
            placeholder="请输入副标签并回车"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" controls-position="right" />
        </el-form-item>
        <el-form-item label="是否在预览时展示" prop="showInPreview">
          <el-switch
            v-model="form.showInPreview"
            :active-value="1"
            :inactive-value="0"
          />
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

<script setup name="Tour_itinerary_activity" lang="ts">
import {
  addTour_itinerary_activity,
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
      { required: true, message: "不能为空", trigger: "change" }
    ],
itineraryId: [
      { required: true, message: "行程ID不能为空", trigger: "change" }
    ],
tourId: [
      { required: true, message: "线路ID不能为空", trigger: "change" }
    ],
title: [
      { required: true, message: "标题不能为空", trigger: "blur" }
    ],
description: [
      { required: true, message: "描述不能为空", trigger: "blur" }
    ],
sortOrder: [
      { required: true, message: "不能为空", trigger: "change" }
    ],
showInPreview: [
      { required: true, message: "是否在预览时展示：0不展示，1展示不能为空", trigger: "change" }
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

/** 查询行程活动列表 */
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

/** 取消按钮 */
const cancel = () => {
  reset();
  resetSelectedSubtitles();
  closeDialog();
};

const handleDialogClosed = () => {
  resetSelectedSubtitles();
};

/** 搜索按钮操作 */
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

/** 新增按钮操作 */
const handleAdd = () => {
  if (!hasLockedItinerary.value) {
    modal.msgWarning('请先从行程列表进入活动管理');
    return;
  }
  openDialog('添加行程活动');
  resetSelectedSubtitles();
  lockItineraryForm();
};

/** 修改按钮操作 */
const handleUpdate = async (row?: Partial<Tour_itinerary_activityVO>) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getTour_itinerary_activity(_id);
  Object.assign(form.value, res.data);
  selectedSubtitles.value = parseSubtitleValues(res.data?.subtitle);
  lockItineraryForm();
  showDialog('修改行程活动');
};

/** 提交按钮 */
const submitForm = () => {
  tour_itinerary_activityFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      if (!hasLockedItinerary.value) {
        modal.msgWarning('请先从行程列表进入活动管理');
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
      modal.msgSuccess('操作成功');
      closeDialog();
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: Partial<Tour_itinerary_activityVO>) => {
  const _ids = row?.id || ids.value;
  await modal.confirm('是否确认删除行程活动编号为"' + _ids + '"的数据项？');
  await delTour_itinerary_activity(_ids);
  modal.msgSuccess('删除成功');
  await getList();
};




onMounted(() => {
  lockItineraryParams();
  getList();
});
</script>

