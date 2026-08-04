<template>
  <div class="p-2 page-shell boxhilltravel_manager-faq_item-page">
    <div class="search-wrap">
      <el-card shadow="hover" class="search-panel" :class="{ 'is-collapsed': !showSearch }">
        <template #header>
          <div class="panel-heading search-panel-toggle" @click.stop="showSearch = !showSearch">
            <div><h3>FAQ Item filters</h3></div>
          </div>
        </template>
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form">
          <el-form-item label="Module" prop="module">
            <el-select v-model="queryParams.module" placeholder="Module" clearable @change="handleQueryModuleChange">
              <el-option v-for="dict in holidays_faq_module" :key="dict.value" :label="dict.label" :value="toModuleValue(dict.value)" />
            </el-select>
          </el-form-item>
          <el-form-item label="Group" prop="groupId">
            <el-select v-model="queryParams.groupId" placeholder="Group" clearable filterable>
              <el-option v-for="group in queryGroupOptions" :key="group.id" :label="group.groupName" :value="group.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="Question" prop="question">
            <el-input v-model="queryParams.question" placeholder="Question" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="Status" prop="status">
            <el-select v-model="queryParams.status" placeholder="Status" clearable>
              <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
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
            <h3>FAQ Items</h3>
          </div>
          <div class="toolbar-actions">
            <el-button v-hasPermi="['boxhilltravel_manager:faq_item:add']" type="primary" plain icon="Plus" @click="handleAdd">Add</el-button>
            <el-button v-hasPermi="['boxhilltravel_manager:faq_item:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()">Edit</el-button>
            <el-button v-hasPermi="['boxhilltravel_manager:faq_item:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">Delete</el-button>
            <right-toolbar v-model:show-search="showSearch" :search="false" @query-table="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" border class="data-table" :data="faqItemList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="Module" align="center" prop="module" width="150">
          <template #default="scope">
            <dict-tag :options="holidays_faq_module" :value="scope.row.module" />
          </template>
        </el-table-column>
        <el-table-column label="Group" align="center" prop="groupName" min-width="160" show-overflow-tooltip />
        <el-table-column label="Question" align="center" prop="question" min-width="240" show-overflow-tooltip />
        <el-table-column label="Answer" align="center" prop="answer" min-width="280" show-overflow-tooltip />
        <el-table-column label="Sort" align="center" prop="sortOrder" width="90" />
        <el-table-column label="Status" align="center" prop="status" width="110">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="statusActiveValue"
              :inactive-value="statusInactiveValue"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="Remark" align="center" prop="remark" min-width="150" show-overflow-tooltip />
        <el-table-column label="Actions" align="center" fixed="right" width="130">
          <template #default="scope">
            <el-tooltip content="Edit" placement="top">
              <el-button v-hasPermi="['boxhilltravel_manager:faq_item:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
            </el-tooltip>
            <el-tooltip content="Delete" placement="top">
              <el-button v-hasPermi="['boxhilltravel_manager:faq_item:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="720px" append-to-body>
      <el-form ref="faqItemFormRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="Group" prop="groupId">
          <el-select v-model="form.groupId" placeholder="Group" filterable @change="handleFormGroupChange">
            <el-option v-for="group in formGroupOptions" :key="group.id" :label="formatGroupLabel(group)" :value="group.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="Question" prop="question">
          <el-input v-model="form.question" type="textarea" :rows="2" maxlength="500" show-word-limit placeholder="Question" />
        </el-form-item>
        <el-form-item label="Answer" prop="answer">
          <el-input v-model="form.answer" type="textarea" :rows="6" placeholder="Answer, HTML supported" />
        </el-form-item>
        <el-form-item label="Sort" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="Status" prop="status">
          <el-switch v-model="form.status" :active-value="statusActiveValue" :inactive-value="statusInactiveValue" />
        </el-form-item>
        <el-form-item label="Remark" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="Remark" />
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

<script setup name="FaqItem" lang="ts">
import {
  addFaq_item,
  changeFaq_itemStatus,
  delFaq_item,
  getFaq_item,
  listFaq_item,
  updateFaq_item
} from '@/api/boxhilltravel_manager/faq_item';
import type { Faq_itemForm, Faq_itemQuery, Faq_itemVO } from '@/api/boxhilltravel_manager/faq_item/types';
import { listEnabledFaq_group } from '@/api/boxhilltravel_manager/faq_group';
import type { Faq_groupVO } from '@/api/boxhilltravel_manager/faq_group/types';
import { useLoading } from '@/hooks/async/useLoading';
import { useFormDialog } from '@/hooks/dialog/useFormDialog';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useSearchToggle } from '@/hooks/form/useSearchToggle';
import { useTableSelection } from '@/hooks/table/useTableSelection';
import modal from '@/plugins/modal';
import { useDict } from '@/utils/dict';

const { holidays_faq_module } = toRefs<any>(useDict('holidays_faq_module'));

const defaultModule = 1;
const statusActiveValue = '1';
const statusInactiveValue = '0';
const statusOptions = [
  { label: 'Enabled', value: statusActiveValue },
  { label: 'Disabled', value: statusInactiveValue }
];

const faqItemList = ref<Faq_itemVO[]>([]);
const queryGroupOptions = ref<Faq_groupVO[]>([]);
const formGroupOptions = ref<Faq_groupVO[]>([]);
const buttonLoading = ref(false);
const total = ref(0);
const { loading, withLoading } = useLoading(true);
const { showSearch } = useSearchToggle();

const queryFormRef = ref<ElFormInstance>();
const faqItemFormRef = ref<ElFormInstance>();

const toModuleValue = (value: string | number) => Number(value);
const getModuleOptions = () => {
  const moduleOptions = holidays_faq_module.value
    ?.map((dict: any) => toModuleValue(dict.value))
    .filter((value: number) => Number.isFinite(value));
  return moduleOptions?.length ? moduleOptions : [defaultModule, 2, 3];
};
const getModuleLabel = (module?: number) => {
  const matched = holidays_faq_module.value?.find((dict: any) => toModuleValue(dict.value) === Number(module));
  return matched?.label || '';
};
const formatGroupLabel = (group: Faq_groupVO) => {
  const moduleLabel = getModuleLabel(group.module);
  return moduleLabel ? `${moduleLabel} - ${group.groupName}` : group.groupName;
};

const initFormData: Faq_itemForm = {
  id: undefined,
  module: defaultModule,
  groupId: undefined,
  question: undefined,
  answer: undefined,
  sortOrder: 0,
  status: statusActiveValue,
  remark: undefined
};

const data = reactive<PageData<Faq_itemForm, Faq_itemQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    module: defaultModule,
    groupId: undefined,
    question: undefined,
    status: undefined,
    params: {}
  },
  rules: {
    groupId: [{ required: true, message: 'Group is required', trigger: 'change' }],
    question: [{ required: true, message: 'Question is required', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);
const { ids, single, multiple, handleSelectionChange } = useTableSelection<Faq_itemVO>(item => item.id);
const { dialog, resetForm: reset, openDialog, showDialog, closeDialog } = useFormDialog({
  form,
  formRef: faqItemFormRef,
  initialFormData: initFormData
});

const getList = async () => {
  await withLoading(async () => {
    const res = await listFaq_item(queryParams.value);
    faqItemList.value = res.data?.rows || [];
    total.value = res.data?.total || 0;
  });
};

const loadQueryGroupOptions = async () => {
  if (queryParams.value.module) {
    const res = await listEnabledFaq_group(queryParams.value.module);
    queryGroupOptions.value = res.data || [];
    return;
  }
  queryGroupOptions.value = await loadAllGroupOptions();
};

const loadAllGroupOptions = async () => {
  const results = await Promise.all(getModuleOptions().map(module => listEnabledFaq_group(module)));
  return results.flatMap(res => res.data || []);
};

const loadFormGroupOptions = async () => {
  formGroupOptions.value = await loadAllGroupOptions();
};

const syncFormModuleByGroup = () => {
  const selectedGroup = formGroupOptions.value.find(group => String(group.id) === String(form.value.groupId));
  form.value.module = selectedGroup?.module ?? undefined;
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const handleQueryModuleChange = async () => {
  queryParams.value.groupId = undefined;
  await loadQueryGroupOptions();
  handleQuery();
};

const handleFormGroupChange = () => {
  syncFormModuleByGroup();
};

const { resetQuery } = useSearchReset({
  queryFormRef,
  queryParams,
  pageNumKey: 'pageNum',
  pageSizeKey: 'pageSize',
  initialPageSize: 10,
  resetExtras: () => {
    queryParams.value.module = defaultModule;
    queryParams.value.groupId = undefined;
    loadQueryGroupOptions();
  },
  afterReset: handleQuery
});

const handleAdd = async () => {
  openDialog('Add FAQ Item');
  await loadFormGroupOptions();
};

const handleUpdate = async (row?: Partial<Faq_itemVO>) => {
  reset();
  const id = row?.id || ids.value[0];
  const res = await getFaq_item(id);
  Object.assign(form.value, res.data);
  await loadFormGroupOptions();
  syncFormModuleByGroup();
  showDialog('Edit FAQ Item');
};

const submitForm = () => {
  faqItemFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    syncFormModuleByGroup();
    buttonLoading.value = true;
    try {
      if (form.value.id) {
        await updateFaq_item(form.value);
      } else {
        await addFaq_item(form.value);
      }
      modal.msgSuccess('Saved');
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

const handleDelete = async (row?: Partial<Faq_itemVO>) => {
  const selectedIds = row?.id || ids.value;
  await modal.confirm('Delete selected FAQ item(s): ' + selectedIds + '?');
  await delFaq_item(selectedIds);
  modal.msgSuccess('Deleted');
  await getList();
};

const handleStatusChange = async (row: Partial<Faq_itemVO>) => {
  const text = row.status === statusActiveValue ? 'enable' : 'disable';
  try {
    await modal.confirm('Confirm to ' + text + ' this FAQ item?');
    await changeFaq_itemStatus(row.id, row.status);
    modal.msgSuccess('Updated');
  } catch (err) {
    row.status = row.status === statusActiveValue ? statusInactiveValue : statusActiveValue;
  }
};

onMounted(() => {
  loadQueryGroupOptions();
  getList();
});
</script>
