<template>
  <div class="p-2 page-shell boxhilltravel_manager-faq_group-page">
    <div class="search-wrap">
      <el-card shadow="hover" class="search-panel" :class="{ 'is-collapsed': !showSearch }">
        <template #header>
          <div class="panel-heading search-panel-toggle" @click.stop="showSearch = !showSearch">
            <div><h3>{{ bt('faqGroupFilters') }}</h3></div>
          </div>
        </template>
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form">
          <el-form-item :label="bt('module')" prop="module">
            <el-select v-model="queryParams.module" :placeholder="bt('module')" clearable>
              <el-option v-for="dict in holidays_faq_module" :key="dict.value" :label="dict.label" :value="toModuleValue(dict.value)" />
            </el-select>
          </el-form-item>
          <el-form-item :label="bt('groupName')" prop="groupName">
            <el-input v-model="queryParams.groupName" :placeholder="bt('groupName')" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item :label="bt('status')" prop="status">
            <el-select v-model="queryParams.status" :placeholder="bt('status')" clearable>
              <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
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
            <h3>{{ bt('faqGroups') }}</h3>
          </div>
          <div class="toolbar-actions">
            <el-button v-hasPermi="['boxhilltravel_manager:faq_group:add']" type="primary" plain icon="Plus" @click="handleAdd">{{ bt('add') }}</el-button>
            <el-button v-hasPermi="['boxhilltravel_manager:faq_group:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()">{{ bt('edit') }}</el-button>
            <el-button v-hasPermi="['boxhilltravel_manager:faq_group:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">{{ bt('delete') }}</el-button>
            <right-toolbar v-model:show-search="showSearch" :search="false" @query-table="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" border class="data-table" :data="faqGroupList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column :label="bt('module')" align="center" prop="module" width="150">
          <template #default="scope">
            <dict-tag :options="holidays_faq_module" :value="scope.row.module" />
          </template>
        </el-table-column>
        <el-table-column :label="bt('groupName')" align="center" prop="groupName" min-width="180" show-overflow-tooltip />
        <el-table-column :label="bt('icon')" align="center" prop="icon" width="100" />
        <el-table-column :label="bt('sort')" align="center" prop="sortOrder" width="100" />
        <el-table-column :label="bt('status')" align="center" prop="status" width="110">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="statusActiveValue"
              :inactive-value="statusInactiveValue"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column :label="bt('remark')" align="center" prop="remark" min-width="160" show-overflow-tooltip />
        <el-table-column :label="bt('actions')" align="center" fixed="right" width="130">
          <template #default="scope">
            <el-tooltip :content="bt('edit')" placement="top">
              <el-button v-hasPermi="['boxhilltravel_manager:faq_group:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
            </el-tooltip>
            <el-tooltip :content="bt('delete')" placement="top">
              <el-button v-hasPermi="['boxhilltravel_manager:faq_group:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="560px" append-to-body>
      <el-form ref="faqGroupFormRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item :label="bt('module')" prop="module">
          <el-select v-model="form.module" :placeholder="bt('module')">
            <el-option v-for="dict in holidays_faq_module" :key="dict.value" :label="dict.label" :value="toModuleValue(dict.value)" />
          </el-select>
        </el-form-item>
        <el-form-item :label="bt('groupName')" prop="groupName">
          <el-input v-model="form.groupName" :placeholder="bt('groupName')" maxlength="128" show-word-limit />
        </el-form-item>
        <el-form-item :label="bt('icon')" prop="icon">
          <el-input v-model="form.icon" :placeholder="bt('emojiOrIconText')" maxlength="32" />
        </el-form-item>
        <el-form-item :label="bt('sort')" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item :label="bt('status')" prop="status">
          <el-switch v-model="form.status" :active-value="statusActiveValue" :inactive-value="statusInactiveValue" />
        </el-form-item>
        <el-form-item :label="bt('remark')" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" :placeholder="bt('remark')" />
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

<script setup name="FaqGroup" lang="ts">
import {
  addFaq_group,
  changeFaq_groupStatus,
  delFaq_group,
  getFaq_group,
  listFaq_group,
  updateFaq_group
} from '@/api/boxhilltravel_manager/faq_group';
import type { Faq_groupForm, Faq_groupQuery, Faq_groupVO } from '@/api/boxhilltravel_manager/faq_group/types';
import { useLoading } from '@/hooks/async/useLoading';
import { useFormDialog } from '@/hooks/dialog/useFormDialog';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useSearchToggle } from '@/hooks/form/useSearchToggle';
import { useTableSelection } from '@/hooks/table/useTableSelection';
import modal from '@/plugins/modal';
import { useDict } from '@/utils/dict';

const { holidays_faq_module } = toRefs<any>(useDict('holidays_faq_module'));

const { bt } = useBoxhillI18n();
const defaultModule = 1;
const statusActiveValue = '1';
const statusInactiveValue = '0';
const statusOptions = computed(() => [
  { label: bt('enabled'), value: statusActiveValue },
  { label: bt('disabled'), value: statusInactiveValue }
]);

const faqGroupList = ref<Faq_groupVO[]>([]);
const buttonLoading = ref(false);
const total = ref(0);
const { loading, withLoading } = useLoading(true);
const { showSearch } = useSearchToggle();

const queryFormRef = ref<ElFormInstance>();
const faqGroupFormRef = ref<ElFormInstance>();

const toModuleValue = (value: string | number) => Number(value);

const initFormData: Faq_groupForm = {
  id: undefined,
  module: defaultModule,
  groupName: undefined,
  icon: undefined,
  sortOrder: 0,
  status: statusActiveValue,
  remark: undefined
};

const data = reactive<PageData<Faq_groupForm, Faq_groupQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    module: undefined,
    groupName: undefined,
    status: undefined,
    params: {}
  },
  rules: {
    module: [{ required: true, message: bt('moduleRequired'), trigger: 'change' }],
    groupName: [{ required: true, message: bt('groupNameRequired'), trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);
const { ids, single, multiple, handleSelectionChange } = useTableSelection<Faq_groupVO>(item => item.id);
const { dialog, resetForm: reset, openDialog, showDialog, closeDialog } = useFormDialog({
  form,
  formRef: faqGroupFormRef,
  initialFormData: initFormData
});

const getList = async () => {
  await withLoading(async () => {
    const res = await listFaq_group(queryParams.value);
    faqGroupList.value = res.data?.rows || [];
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

const handleAdd = () => {
  openDialog(bt('addFaqGroup'));
};

const handleUpdate = async (row?: Partial<Faq_groupVO>) => {
  reset();
  const id = row?.id || ids.value[0];
  const res = await getFaq_group(id);
  Object.assign(form.value, res.data);
  showDialog(bt('editFaqGroup'));
};

const submitForm = () => {
  faqGroupFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      if (form.value.id) {
        await updateFaq_group(form.value);
      } else {
        await addFaq_group(form.value);
      }
      modal.msgSuccess(bt('saved'));
      closeDialog();
      await getList();
    } finally {
      buttonLoading.value = false;
    }
  });
};

const cancel = () => {
  reset();
  closeDialog();
};

const handleDelete = async (row?: Partial<Faq_groupVO>) => {
  const selectedIds = row?.id || ids.value;
  await modal.confirm(bt('confirmDeleteFaqGroup', { ids: selectedIds }));
  await delFaq_group(selectedIds);
  modal.msgSuccess(bt('deleted'));
  await getList();
};

const handleStatusChange = async (row: Partial<Faq_groupVO>) => {
  const text = row.status === statusActiveValue ? bt('enableAction') : bt('disableAction');
  try {
    await modal.confirm(bt('confirmFaqGroupStatus', { action: text }));
    await changeFaq_groupStatus(row.id, row.status);
    modal.msgSuccess(bt('updated'));
  } catch (err) {
    row.status = row.status === statusActiveValue ? statusInactiveValue : statusActiveValue;
  }
};

onMounted(() => {
  getList();
});
</script>
