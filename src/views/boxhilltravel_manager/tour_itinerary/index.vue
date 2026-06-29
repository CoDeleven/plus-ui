<template>
  <div class="p-2 page-shell boxhilltravel_manager-tour_itinerary-page">
    <el-card shadow="hover" class="table-panel">
      <template #header>
        <div class="toolbar-shell">
          <div class="table-heading flex items-center gap-2">
            <el-button link type="primary" icon="ArrowLeft" @click="handleBack">返回</el-button>
            <h3>行程管理 — {{ tourName }}</h3>
          </div>
          <div class="toolbar-actions">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['boxhilltravel_manager:tour_itinerary:add']">新增</el-button>
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['boxhilltravel_manager:tour_itinerary:edit']">修改</el-button>
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['boxhilltravel_manager:tour_itinerary:remove']">删除</el-button>
            <right-toolbar :search="false" @query-table="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" border class="data-table" :data="tour_itineraryList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="第几天" align="center" prop="dayNumber" />
        <el-table-column label="标题" align="center" prop="title">
          <template #default="scope">
            <el-link type="primary" @click="handleActivity(scope.row as Tour_itineraryVO)">{{ scope.row.title }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="描述" align="center" prop="description" :show-overflow-tooltip="true" />
        <el-table-column label="起始destination" align="center" prop="fromDestination" />
        <el-table-column label="结束destination" align="center" prop="toDestination" />
        <el-table-column label="餐食 B/L/D" align="center" prop="meals">
          <template #default="scope">
            <dict-tag :options="dining" :value="parseMealValues(scope.row.meals)"/>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['boxhilltravel_manager:tour_itinerary:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['boxhilltravel_manager:tour_itinerary:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改行程对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="tour_itineraryFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="第几天" prop="dayNumber">
          <el-input-number v-model="form.dayNumber" controls-position="right" :min="1" />
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
            <el-input v-model="form.description" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="起始destination" prop="fromDestinationId">
          <el-tree-select
            v-model="form.fromDestinationId"
            :data="destinationOptions"
            :props="destinationTreeProps as any"
            value-key="id"
            placeholder="请选择起始destination"
            check-strictly
            filterable
            clearable
          />
        </el-form-item>
        <el-form-item label="结束destination" prop="toDestinationId">
          <el-tree-select
            v-model="form.toDestinationId"
            :data="destinationOptions"
            :props="destinationTreeProps as any"
            value-key="id"
            placeholder="请选择结束destination"
            check-strictly
            filterable
            clearable
          />
        </el-form-item>
        <el-form-item label="餐食 B/L/D" prop="meals">
          <el-select v-model="selectedMeals" multiple collapse-tags collapse-tags-tooltip placeholder="请选择餐食 B/L/D">
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
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Tour_itinerary" lang="ts">
import {
  addTour_itinerary,
  delTour_itinerary,
  getTour_itinerary,
  listTour_itinerary,
  updateTour_itinerary
} from '@/api/boxhilltravel_manager/tour_itinerary';
import { listDestinationTree } from '@/api/boxhilltravel_manager/destination';
import type { DestinationTreeOption } from '@/api/boxhilltravel_manager/destination/types';
import { Tour_itineraryForm, Tour_itineraryQuery, Tour_itineraryVO } from '@/api/boxhilltravel_manager/tour_itinerary/types';
import { useLoading } from '@/hooks/async/useLoading';
import { useFormDialog } from '@/hooks/dialog/useFormDialog';
import { useTableSelection } from '@/hooks/table/useTableSelection';
import { useDict } from '@/utils/dict';
import modal from '@/plugins/modal';
import tab from '@/plugins/tab';
import { useRoute } from 'vue-router';

const { dining } = toRefs<any>(useDict('dining'));

const route = useRoute();
// 当前线路ID（只读，全程锁定，不允许跨线路操作）
const tourId = computed(() => route.query.tourId as string | number);
const tourName = computed(() => (route.query.tourName as string) || '');

const tour_itineraryList = ref<Tour_itineraryVO[]>([]);
const buttonLoading = ref(false);
const { loading, withLoading } = useLoading(true);
const total = ref(0);
const selectedMeals = ref<string[]>([]);
const destinationOptions = ref<DestinationTreeOption[]>([]);
const destinationTreeProps = { value: 'id', label: 'label', children: 'children' };

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
      { required: true, message: "第几天不能为空", trigger: "change" }
    ],
title: [
      { required: true, message: "标题不能为空", trigger: "blur" }
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

const loadDestinationOptions = async () => {
  const res = await listDestinationTree();
  destinationOptions.value = res.data ?? [];
};

/** 查询行程列表 */
const getList = async () => {
  await withLoading(async () => {
    // 始终锁定当前线路，防止跨线路查询
    queryParams.value.tourId = tourId.value;
    const res = await listTour_itinerary(queryParams.value);
    tour_itineraryList.value = res.data?.rows;
    total.value = res.data?.total;
  });
};

/** 取消按钮 */
const cancel = () => {
  selectedMeals.value = [];
  reset();
  closeDialog();
};

/** 新增按钮操作 */
const handleAdd = () => {
  openDialog('添加行程');
  selectedMeals.value = [];
  // openDialog 内部会 resetForm 清空 tourId，此处回填当前线路
  form.value.tourId = tourId.value;
};

/** 修改按钮操作 */
const handleUpdate = async (row?: Partial<Tour_itineraryVO>) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getTour_itinerary(_id);
  Object.assign(form.value, res.data);
  selectedMeals.value = parseMealValues(res.data?.meals);
  showDialog('修改行程');
};

/** 提交按钮 */
const submitForm = () => {
  tour_itineraryFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      // 新增时强制锁定当前线路（编辑保留原值）
      if (!form.value.id) {
        form.value.tourId = tourId.value;
      }
      form.value.meals = stringifyMealValues(selectedMeals.value);
      if (form.value.id) {
        await updateTour_itinerary(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addTour_itinerary(form.value).finally(() => (buttonLoading.value = false));
      }
      modal.msgSuccess('操作成功');
      closeDialog();
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: Partial<Tour_itineraryVO>) => {
  const _ids = row?.id || ids.value;
  await modal.confirm('是否确认删除行程编号为"' + _ids + '"的数据项？');
  await delTour_itinerary(_ids);
  modal.msgSuccess('删除成功');
  await getList();
};

const handleActivity = (row: Tour_itineraryVO) => {
  tab.openPage('/boxhilltravel_manager/tour_itinerary_activity', '行程活动 - ' + row.title, {
    tour_itinerary_id: row.id,
    tourId: row.tourId,
    itineraryTitle: row.title
  });
};

/** 返回线路列表 */
const handleBack = () => {
  tab.closePage();
};

onMounted(() => {
  getList();
  loadDestinationOptions();
});
</script>
