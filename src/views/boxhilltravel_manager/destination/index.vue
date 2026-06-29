<template>
  <div class="p-2 page-shell boxhilltravel_manager-destination-page">
    <div class="search-wrap">
      <el-card shadow="hover" class="search-panel" :class="{ 'is-collapsed': !showSearch }">
        <template #header>
          <div class="panel-heading search-panel-toggle" @click.stop="showSearch = !showSearch">
            <div><h3>筛选条件</h3></div>
          </div>
        </template>
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form">
          <el-form-item label="" prop="nameEn">
            <search-select-input
              v-model="queryParams.nameEn"
              v-model:select-value="queryParams.level"
              :options="destinationLevelOptions"
              input-placeholder="请输入目的地英文名称"
              select-placeholder="范围"
              select-width="120px"
              @enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
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
            <h3>目的地分类列表</h3>
          </div>
          <div class="toolbar-actions">
            <el-button
              v-hasPermi="['boxhilltravel_manager:destination:add']"
              type="primary"
              plain
              icon="Plus"
              @click="handleAdd()"
            >
              新增
            </el-button>
            <right-toolbar v-model:show-search="showSearch" :search="false" @query-table="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        border
        class="data-table"
        :data="destinationList"
        row-key="id"
        lazy
        :load="loadDestinationChildren"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column label="目的地名称" prop="name" min-width="100" show-overflow-tooltip />
        <el-table-column label="层级" align="center" prop="level" width="120" >
           <template #default="scope">
            <span>{{ scope.row.level === 1 ? 'Continent' : scope.row.level === 2 ? 'Country' : scope.row.level === 3 ? 'City' : scope.row.parentId }}</span>
          </template>
        </el-table-column>
        <el-table-column label="封面图" align="center" prop="imageUrl" width="100">
          <template #default="scope">
            <image-preview v-if="scope.row.imageUrl" :src="scope.row.imageUrl" :width="50" :height="50" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="描述" align="center" prop="description" min-width="180" show-overflow-tooltip />
        <el-table-column label="排序" align="center" prop="sort" width="90" />
        <el-table-column label="状态" align="center" prop="status" width="100">
          <template #default="scope">
            <el-tag v-if="Number(scope.row.status) === 1" type="success">启用</el-tag>
            <el-tag v-else-if="Number(scope.row.status) === 0" type="danger">禁用</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="150">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button
                v-hasPermi="['boxhilltravel_manager:destination:edit']"
                link
                type="primary"
                icon="Edit"
                @click="handleUpdate(scope.row)"
              />
            </el-tooltip>
            <el-tooltip content="新增子级" placement="top">
              <el-button
                v-hasPermi="['boxhilltravel_manager:destination:add']"
                link
                type="primary"
                icon="Plus"
                @click="handleAdd(scope.row)"
              />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button
                v-hasPermi="['boxhilltravel_manager:destination:remove']"
                link
                type="primary"
                icon="Delete"
                @click="handleDelete(scope.row)"
              />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="destinationFormRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="目的地名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入目的地名称" />
        </el-form-item>
        <el-form-item label="英文名称" prop="nameEn">
          <el-input v-model="form.nameEn" placeholder="请输入目的地英文名称" />
        </el-form-item>
        <el-form-item label="父级目的地" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="destinationOptions"
            :props="{ label: 'label', children: 'children', isLeaf: 'isLeaf' }"
            value-key="id"
            node-key="id"
            placeholder="请选择父级目的地"
            check-strictly
            filterable
            clearable
            lazy
            :load="loadDestinationOptions"
            :cache-data="destinationCacheOptions"
          />
        </el-form-item>
        <el-form-item label="层级" prop="level">
          <el-input-number v-model="form.level" controls-position="right" />
        </el-form-item>
        <el-form-item label="封面图" prop="image">
          <image-upload v-model="form.image" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" controls-position="right" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
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

<script setup name="Destination" lang="ts">
import type { LoadFunction } from 'element-plus';
import SearchSelectInput, { type SearchSelectInputOption } from '@/components/SearchSelectInput/index.vue';
import {
  addDestination,
  delDestination,
  getDestination,
  listDestination,
  updateDestination
} from '@/api/boxhilltravel_manager/destination';
import type { DestinationForm, DestinationQuery, DestinationVO } from '@/api/boxhilltravel_manager/destination/types';
import { useLoading } from '@/hooks/async/useLoading';
import { useFormDialog } from '@/hooks/dialog/useFormDialog';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useSearchToggle } from '@/hooks/form/useSearchToggle';
import modal from '@/plugins/modal';

type DestinationTableRow = DestinationVO & {
  children?: DestinationTableRow[];
  hasChildren?: boolean;
};

type DestinationOption = {
  id: string | number;
  label: string;
  children?: DestinationOption[];
  isLeaf?: boolean;
};

const destinationList = ref<DestinationTableRow[]>([]);
const destinationOptions = ref<DestinationOption[]>([]);
const destinationCacheOptions = ref<DestinationOption[]>([]);
const buttonLoading = ref(false);
const { loading, setLoading, withLoading } = useLoading(true);
const { showSearch } = useSearchToggle();

const destinationLevelOptions: SearchSelectInputOption[] = [
  { label: '洲', value: 1 },
  { label: '国家', value: 2 },
  { label: '城市', value: 3 }
];

const queryFormRef = ref<ElFormInstance>();
const destinationFormRef = ref<ElFormInstance>();

const initFormData: DestinationForm = {
  id: undefined,
  name: undefined,
  nameEn: undefined,
  parentId: 0,
  level: undefined,
  image: undefined,
  description: undefined,
  sort: undefined,
  status: 1
};

const data = reactive<PageData<DestinationForm, DestinationQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10000,
    nameEn: undefined,
    level: undefined,
    status: undefined,
    params: {}
  },
  rules: {
    name: [{ required: true, message: '目的地名称不能为空', trigger: 'blur' }],
    parentId: [{ required: true, message: '父级目的地不能为空', trigger: 'change' }],
    level: [{ required: true, message: '层级不能为空', trigger: 'change' }],
    status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);
const {
  dialog,
  resetForm: reset,
  openDialog,
  showDialog,
  closeDialog
} = useFormDialog({
  form,
  formRef: destinationFormRef,
  initialFormData: initFormData
});

const hasChildLayer = (row: Pick<DestinationVO, 'level'>) => {
  return row.level == null || Number(row.level) < 3;
};

const normalizeDestinationRows = (rows: DestinationVO[]): DestinationTableRow[] => {
  return rows.map(row => ({
    ...row,
    hasChildren: hasChildLayer(row)
  }));
};

const getDestinationLabel = (row: Partial<DestinationVO>) => {
  return row.nameEn || row.name || String(row.id);
};

const toDestinationOption = (row: DestinationVO): DestinationOption => ({
  id: row.id,
  label: getDestinationLabel(row),
  isLeaf: !hasChildLayer(row)
});

const hasNameEnSearch = () => {
  return Boolean(String(queryParams.value.nameEn ?? '').trim());
};

const getRootQuery = (): DestinationQuery => {
  const query: DestinationQuery = {
    ...queryParams.value,
    pageNum: 1,
    pageSize: 10000
  };

  if (!hasNameEnSearch()) {
    query.parentId = 0;
    query.level = undefined;
  }

  return query;
};

const getChildLayerQuery = (parentId: string | number): DestinationQuery => ({
  parentId,
  status: queryParams.value.status,
  pageNum: 1,
  pageSize: 10000,
  params: {}
});

/** 查询目的地分类树表 */
const getList = async () => {
  await withLoading(async () => {
    const res = await listDestination(getRootQuery());
    destinationList.value = normalizeDestinationRows(res.data?.rows || []);
  });
};

/** 展开时按父级加载下一层 */
const loadDestinationChildren = async (
  row: DestinationTableRow,
  _treeNode: unknown,
  resolve: (data: DestinationTableRow[]) => void
) => {
  const res = await listDestination(getChildLayerQuery(row.id));
  resolve(normalizeDestinationRows(res.data?.rows || []));
};

/** 查询父级目的地下拉树 */
const getTreeselect = async () => {
  const res = await listDestination({
    parentId: 0,
    pageNum: 1,
    pageSize: 10000
  });
  destinationOptions.value = [
    {
      id: 0,
      label: '顶级目的地',
      children: (res.data?.rows || []).map(toDestinationOption),
      isLeaf: false
    }
  ];
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

  if (current.id === 0 && current.children?.length) {
    resolve(current.children);
    return;
  }

  const res = await listDestination({
    parentId: current.id,
    pageNum: 1,
    pageSize: 10000
  });
  resolve((res.data?.rows || []).map(toDestinationOption));
};

const cacheDestinationOption = (row?: Partial<DestinationVO>) => {
  if (!row?.id) {
    destinationCacheOptions.value = [];
    return;
  }
  destinationCacheOptions.value = [
    {
      id: row.id,
      label: getDestinationLabel(row),
      isLeaf: !hasChildLayer(row as DestinationVO)
    }
  ];
};

const cacheDestinationOptionById = async (id?: string | number) => {
  if (!id || Number(id) === 0) {
    destinationCacheOptions.value = [];
    return;
  }
  const res = await getDestination(id);
  cacheDestinationOption(res.data);
};

const cancel = () => {
  reset();
  destinationCacheOptions.value = [];
  closeDialog();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  getList();
};

const { resetQuery } = useSearchReset({
  queryFormRef,
  queryParams,
  resetExtras: () => {
    queryParams.value.pageNum = 1;
    queryParams.value.pageSize = 10000;
  },
  afterReset: () => {
    handleQuery();
  }
});

/** 新增按钮操作 */
const handleAdd = async (row?: Partial<DestinationTableRow>) => {
  openDialog('添加目的地分类');
  await getTreeselect();
  form.value.parentId = row?.id ?? 0;
  cacheDestinationOption(row);
};

/** 修改按钮操作 */
const handleUpdate = async (row: Partial<DestinationTableRow>) => {
  if (!row.id) {
    return;
  }
  reset();
  await getTreeselect();
  const res = await getDestination(row.id);
  Object.assign(form.value, res.data);
  await cacheDestinationOptionById(res.data?.parentId);
  showDialog('修改目的地分类');
};

/** 提交按钮 */
const submitForm = () => {
  destinationFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateDestination(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addDestination(form.value).finally(() => (buttonLoading.value = false));
      }
      modal.msgSuccess('操作成功');
      closeDialog();
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row: Partial<DestinationTableRow>) => {
  if (!row.id) {
    return;
  }
  await modal.confirm(`是否确认删除目的地分类"${row.name || row.id}"？`);
  setLoading(true);
  await delDestination(row.id).finally(() => setLoading(false));
  modal.msgSuccess('删除成功');
  await getList();
};

onMounted(() => {
  getList();
});
</script>
