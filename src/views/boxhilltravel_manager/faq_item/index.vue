<template>
  <div class="p-2 page-shell boxhilltravel_manager-faq_item-page">
    <div class="search-wrap">
      <el-card shadow="hover" class="search-panel" :class="{ 'is-collapsed': !showSearch }">
        <template #header>
          <div class="panel-heading search-panel-toggle" @click.stop="showSearch = !showSearch">
            <div><h3>筛选条件</h3></div>
          </div>
        </template>
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form">
            <el-form-item label="分组" prop="groupId">
              <el-select v-model="queryParams.groupId" placeholder="请选择分组" clearable>
                <el-option v-for="group in groupOptions" :key="group.id" :label="group.groupName" :value="group.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="问题" prop="question">
              <el-input v-model="queryParams.question" placeholder="请输入问题" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="请选择状态" clearable >
                <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
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
            <h3>FAQ条目列表</h3>
          </div>
          <div class="toolbar-actions">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['boxhilltravel_manager:faq_item:add']">新增</el-button>
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['boxhilltravel_manager:faq_item:edit']">修改</el-button>
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['boxhilltravel_manager:faq_item:remove']">删除</el-button>
            <right-toolbar v-model:show-search="showSearch" :search="false" @query-table="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" border class="data-table" :data="faq_itemList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="分组" align="center" prop="groupName" />
        <el-table-column label="问题" align="center" prop="question" />
        <el-table-column label="答案(支持HTML)" align="center" prop="answer" />
        <el-table-column label="排序" align="center" prop="sortOrder" />
        <el-table-column label="状态" align="center" prop="status">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="statusActiveValue"
              :inactive-value="statusInactiveValue"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['boxhilltravel_manager:faq_item:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['boxhilltravel_manager:faq_item:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改FAQ条目对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="faq_itemFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="分组" prop="groupId">
          <el-select v-model="form.groupId" placeholder="请选择分组" clearable>
            <el-option v-for="group in groupOptions" :key="group.id" :label="group.groupName" :value="group.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="问题" prop="question">
            <el-input v-model="form.question" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="答案(支持HTML)" prop="answer">
            <el-input v-model="form.answer" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" controls-position="right" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="form.status"
            :active-value="statusActiveValue"
            :inactive-value="statusInactiveValue"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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

<script setup name="Faq_item" lang="ts">
import {
  addFaq_item,
  changeFaq_itemStatus,
  delFaq_item,
  getFaq_item,
  listFaq_item,
  updateFaq_item
} from '@/api/boxhilltravel_manager/faq_item';
import { Faq_itemForm, Faq_itemQuery, Faq_itemVO } from '@/api/boxhilltravel_manager/faq_item/types';
import { listEnabledFaq_group } from '@/api/boxhilltravel_manager/faq_group';
import { Faq_groupVO } from '@/api/boxhilltravel_manager/faq_group/types';
import { useLoading } from '@/hooks/async/useLoading';
import { useFormDialog } from '@/hooks/dialog/useFormDialog';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useSearchToggle } from '@/hooks/form/useSearchToggle';
import { useTableSelection } from '@/hooks/table/useTableSelection';
import modal from '@/plugins/modal';


const statusActiveValue = '1';
const statusInactiveValue = '0';
const statusOptions = [
  { label: '启用', value: statusActiveValue },
  { label: '停用', value: statusInactiveValue }
];

const faq_itemList = ref<Faq_itemVO[]>([]);
const groupOptions = ref<Faq_groupVO[]>([]);
const buttonLoading = ref(false);
const { loading, withLoading } = useLoading(true);
const { showSearch } = useSearchToggle();
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const faq_itemFormRef = ref<ElFormInstance>();

const initFormData: Faq_itemForm = {
  id: undefined,
  groupId: undefined,
  question: undefined,
  answer: undefined,
  sortOrder: undefined,
  status: statusActiveValue,
  remark: undefined,
}
const data = reactive<PageData<Faq_itemForm, Faq_itemQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    groupId: undefined,
    question: undefined,
    status: undefined,
    params: {
    }
  },
  rules: {
groupId: [
      { required: true, message: "分组不能为空", trigger: "change" }
    ],
question: [
      { required: true, message: "问题不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);
const { ids, single, multiple, handleSelectionChange } = useTableSelection<Faq_itemVO>(item => item.id);
const { dialog, resetForm: reset, openDialog, showDialog, closeDialog } = useFormDialog({
  form,
  formRef: faq_itemFormRef,
  initialFormData: initFormData
});

/** 查询FAQ条目列表 */
const getList = async () => {
  await withLoading(async () => {
    const res = await listFaq_item(queryParams.value);
    faq_itemList.value = res.data?.rows;
    total.value = res.data?.total;
  });
};

/** 查询启用FAQ分组 */
const getEnabledGroupList = async () => {
  const res = await listEnabledFaq_group();
  groupOptions.value = res.data || [];
};

/** 取消按钮 */
const cancel = () => {
  reset();
  closeDialog();
};

/** 搜索按钮操作 */
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
  resetExtras: () => {
  },
  afterReset: () => {
    handleQuery();
  }
});

/** 新增按钮操作 */
const handleAdd = () => {
  openDialog('添加FAQ条目');
};

/** 修改按钮操作 */
const handleUpdate = async (row?: Partial<Faq_itemVO>) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getFaq_item(_id);
  Object.assign(form.value, res.data);
  showDialog('修改FAQ条目');
};

/** 提交按钮 */
const submitForm = () => {
  faq_itemFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateFaq_item(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addFaq_item(form.value).finally(() => (buttonLoading.value = false));
      }
      modal.msgSuccess('操作成功');
      closeDialog();
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: Partial<Faq_itemVO>) => {
  const _ids = row?.id || ids.value;
  await modal.confirm('是否确认删除FAQ条目编号为"' + _ids + '"的数据项？');
  await delFaq_item(_ids);
  modal.msgSuccess('删除成功');
  await getList();
};


/** 状态修改 */
const handleStatusChange = async (row: Partial<Faq_itemVO>) => {
  const text = row.status === statusActiveValue ? '启用' : '停用';
  try {
    await modal.confirm('确认要"' + text + '"吗?');
    await changeFaq_itemStatus(row.id, row.status);
    modal.msgSuccess(text + '成功');
  } catch (err) {
    row.status = row.status === statusActiveValue ? statusInactiveValue : statusActiveValue;
  }
};


onMounted(() => {
  getEnabledGroupList();
  getList();
});
</script>

