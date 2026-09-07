<template>
  <div class="p-2 page-shell boxhilltravel_manager-tour_service_item-page">
    <div class="search-wrap">
      <el-card shadow="hover" class="search-panel" :class="{ 'is-collapsed': !showSearch }">
        <template #header>
          <div class="panel-heading search-panel-toggle" @click.stop="showSearch = !showSearch">
            <div><h3>{{ bt('filters') }}</h3></div>
          </div>
        </template>
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form">
            <el-form-item :label="bt('itemType')" prop="itemType">
              <el-select v-model="queryParams.itemType" :placeholder="bt('selectPlaceholder')" clearable>
                <el-option :label="bt('included')" :value="1" />
                <el-option :label="bt('excluded')" :value="2" />
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
            <h3>{{ bt('serviceItemList') }}{{ lockedTourName ? ' - ' + lockedTourName : '' }}</h3>
          </div>
          <div class="toolbar-actions">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['boxhilltravel_manager:tour_service_item:add']">{{ bt('add') }}</el-button>
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['boxhilltravel_manager:tour_service_item:edit']">{{ bt('edit') }}</el-button>
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['boxhilltravel_manager:tour_service_item:remove']">{{ bt('delete') }}</el-button>
            <right-toolbar v-model:show-search="showSearch" :search="false" @query-table="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" border class="data-table" :data="tour_service_itemList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column :label="bt('id')" align="center" prop="id" />
        <el-table-column :label="bt('itemType')" align="center" prop="itemType">
          <template #default="scope">
            <span>{{ scope.row.itemType === 1 ? bt('included') : scope.row.itemType === 2 ? bt('excluded') : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="bt('content')" align="center" prop="content" />
        <el-table-column :label="bt('sortOrder')" align="center" prop="sortOrder" />
        <el-table-column :label="bt('actions')" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip :content="bt('edit')" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['boxhilltravel_manager:tour_service_item:edit']"></el-button>
            </el-tooltip>
            <el-tooltip :content="bt('delete')" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['boxhilltravel_manager:tour_service_item:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="tour_service_itemFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item :label="bt('itemType')" prop="itemType">
          <el-radio-group v-model="form.itemType">
            <el-radio :value="1">{{ bt('included') }}</el-radio>
            <el-radio :value="2">{{ bt('excluded') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="bt('content')">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="6"
            :placeholder="bt('enterServiceItemContent')"
          />
        </el-form-item>
        <el-form-item :label="bt('sortOrder')" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" controls-position="right" :min="1"/>
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

<script setup name="Tour_service_item" lang="ts">

import { useBoxhillI18n } from '../useBoxhillI18n';
import {  addTour_service_item,
  delTour_service_item,
  getTour_service_item,
  listTour_service_item,
  updateTour_service_item
} from '@/api/boxhilltravel_manager/tour_service_item';
import { Tour_service_itemForm, Tour_service_itemQuery, Tour_service_itemVO } from '@/api/boxhilltravel_manager/tour_service_item/types';
import { useLoading } from '@/hooks/async/useLoading';
import { useFormDialog } from '@/hooks/dialog/useFormDialog';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useSearchToggle } from '@/hooks/form/useSearchToggle';
import { useTableSelection } from '@/hooks/table/useTableSelection';
import modal from '@/plugins/modal';
import { useRoute } from 'vue-router';

const { bt } = useBoxhillI18n();


const route = useRoute();
const lockedTourId = computed(() => route.query.tourId as string | number);
const lockedTourName = computed(() => route.query.tourName as string);
const hasLockedTour = computed(() => lockedTourId.value !== undefined && lockedTourId.value !== '');

const tour_service_itemList = ref<Tour_service_itemVO[]>([]);
const buttonLoading = ref(false);
const { loading, withLoading } = useLoading(true);
const { showSearch } = useSearchToggle();
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const tour_service_itemFormRef = ref<ElFormInstance>();

const initFormData: Tour_service_itemForm = {
  id: undefined,
  tourId: undefined,
  itemType: undefined,
  content: undefined,
  sortOrder: undefined,
}
const data = reactive<PageData<Tour_service_itemForm, Tour_service_itemQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    tourId: undefined,
    itemType: undefined,
    content: undefined,
    sortOrder: undefined,
    params: {
    }
  },
  rules: {
id: [
      { required: true, message: bt('text001'), trigger: "change" }
    ],
tourId: [
      { required: true, message: bt('tourIdRequired'), trigger: "change" }
    ],
itemType: [
      { required: true, message: bt('itemTypeRequired'), trigger: "change" }
    ],
content: [
      { required: true, message: bt('contentRequired'), trigger: "blur" }
    ],
sortOrder: [
      { required: true, message: bt('sortRequired'), trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);
const { ids, single, multiple, handleSelectionChange } = useTableSelection<Tour_service_itemVO>(item => item.id);
const { dialog, resetForm: reset, openDialog, showDialog, closeDialog } = useFormDialog({
  form,
  formRef: tour_service_itemFormRef,
  initialFormData: initFormData
});

const lockTourParams = () => {
  queryParams.value.tourId = lockedTourId.value;
};

const lockTourForm = () => {
  form.value.tourId = lockedTourId.value;
};


const getList = async () => {
  await withLoading(async () => {
    lockTourParams();
    if (!hasLockedTour.value) {
      tour_service_itemList.value = [];
      total.value = 0;
      return;
    }
    const res = await listTour_service_item(queryParams.value);
    tour_service_itemList.value = res.data?.rows;
    total.value = res.data?.total;
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
  initialPageSize: 10,
  resetExtras: () => {
    lockTourParams();
  },
  afterReset: () => {
    handleQuery();
  }
});


const handleAdd = () => {
  if (!hasLockedTour.value) {
    modal.msgWarning(bt('enterServiceFromTour'));
    return;
  }
  openDialog(bt('addServiceItem'));
  lockTourForm();
};


const handleUpdate = async (row?: Partial<Tour_service_itemVO>) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getTour_service_item(_id);
  Object.assign(form.value, res.data);
  lockTourForm();
  showDialog(bt('editServiceItem'));
};


const submitForm = () => {
  tour_service_itemFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      if (!hasLockedTour.value) {
        modal.msgWarning(bt('enterServiceFromTour'));
        return;
      }
      buttonLoading.value = true;
      lockTourForm();
      if (form.value.id) {
        await updateTour_service_item(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addTour_service_item(form.value).finally(() => (buttonLoading.value = false));
      }
      modal.msgSuccess(bt('operationSuccess'));
      closeDialog();
      await getList();
    }
  });
};


const handleDelete = async (row?: Partial<Tour_service_itemVO>) => {
  const _ids = row?.id || ids.value;
  await modal.confirm(bt('confirmDeleteServiceItem', { ids: _ids }));
  await delTour_service_item(_ids);
  modal.msgSuccess(bt('deleteSuccess'));
  await getList();
};




onMounted(() => {
  lockTourParams();
  getList();
});
</script>

