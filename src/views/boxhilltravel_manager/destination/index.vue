<template>
  <div class="p-2 page-shell boxhilltravel_manager-destination-page">
    <div class="search-wrap">
      <el-card shadow="hover" class="search-panel" :class="{ 'is-collapsed': !showSearch }">
        <template #header>
          <div class="panel-heading search-panel-toggle" @click.stop="showSearch = !showSearch">
            <div><h3>{{ bt('filters') }}</h3></div>
          </div>
        </template>
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form">
          <el-form-item label="" prop="nameEn">
            <search-select-input
              v-model="queryParams.nameEn"
              v-model:select-value="queryParams.level"
              :options="destinationLevelOptions"
              :input-placeholder="bt('enterDestinationEnglishName')"
              :select-placeholder="bt('scope')"
              select-width="120px"
              @enter="handleQuery"
            />
          </el-form-item>
          <el-form-item :label="bt('status')" prop="status">
            <el-select v-model="queryParams.status" :placeholder="bt('selectStatus')" clearable>
              <el-option :label="bt('enabledStatus')" :value="1" />
              <el-option :label="bt('disabledStatus')" :value="0" />
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
            <h3>{{ bt('destinationList') }}</h3>
          </div>
          <div class="toolbar-actions">
            <el-button
              v-hasPermi="['boxhilltravel_manager:destination:add']"
              type="primary"
              plain
              icon="Plus"
              @click="handleAdd()"
            >
              {{ bt('add') }}</el-button>
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
        <el-table-column :label="bt('destinationName')" prop="name" min-width="100" show-overflow-tooltip />
        <el-table-column :label="bt('level')" align="center" prop="level" width="120" >
           <template #default="scope">
            <span>{{ scope.row.level === 1 ? 'Continent' : scope.row.level === 2 ? 'Country' : scope.row.level === 3 ? 'City' : scope.row.parentId }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="bt('coverImage')" align="center" prop="imageUrl" width="100">
          <template #default="scope">
            <image-preview v-if="scope.row.imageUrl" :src="scope.row.imageUrl" :width="50" :height="50" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column :label="bt('description')" align="center" prop="description" min-width="180" show-overflow-tooltip />
        <el-table-column :label="bt('sortOrder')" align="center" prop="sort" width="90" />
        <el-table-column :label="bt('status')" align="center" prop="status" width="100">
          <template #default="scope">
            <el-tag v-if="Number(scope.row.status) === 1" type="success">{{ bt('enabledStatus') }}</el-tag>
            <el-tag v-else-if="Number(scope.row.status) === 0" type="danger">{{ bt('disabledStatus') }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column :label="bt('actions')" align="center" class-name="small-padding fixed-width" width="150">
          <template #default="scope">
            <el-tooltip :content="bt('edit')" placement="top">
              <el-button
                v-hasPermi="['boxhilltravel_manager:destination:edit']"
                link
                type="primary"
                icon="Edit"
                @click="handleUpdate(scope.row)"
              />
            </el-tooltip>
            <el-tooltip :content="bt('addChild')" placement="top">
              <el-button
                v-hasPermi="['boxhilltravel_manager:destination:add']"
                link
                type="primary"
                icon="Plus"
                @click="handleAdd(scope.row)"
              />
            </el-tooltip>
            <el-tooltip :content="bt('delete')" placement="top">
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

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="600px" append-to-body>
      <el-form ref="destinationFormRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item :label="bt('destinationName')" prop="name">
          <el-input v-model="form.name" :placeholder="bt('enterDestinationName')" />
        </el-form-item>
        <el-form-item :label="bt('englishName')" prop="nameEn">
          <el-input v-model="form.nameEn" :placeholder="bt('enterDestinationEnglishName')" />
        </el-form-item>
        <el-form-item :label="bt('parentDestination')" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="destinationOptions"
            :props="{ label: 'label', children: 'children', isLeaf: 'isLeaf' }"
            value-key="id"
            node-key="id"
            :placeholder="bt('selectParentDestination')"
            check-strictly
            filterable
            clearable
            lazy
            :load="loadDestinationOptions"
            :cache-data="destinationCacheOptions"
          />
        </el-form-item>
        <el-form-item :label="bt('level')" prop="level">
          <div class="level-segmented" role="radiogroup" :aria-label="bt('level')">
            <el-button
              :type="form.level === 1 ? 'primary' : 'default'"
              :class="{ 'is-active': form.level === 1 }"
              @click="form.level = 1"
            >
              {{ bt('continent') }}</el-button>
            <el-button
              :type="form.level === 2 ? 'primary' : 'default'"
              :class="{ 'is-active': form.level === 2 }"
              @click="form.level = 2"
            >
              {{ bt('country') }}</el-button>
            <el-button
              :type="form.level === 3 ? 'primary' : 'default'"
              :class="{ 'is-active': form.level === 3 }"
              @click="form.level = 3"
            >
              {{ bt('city') }}</el-button>
          </div>
        </el-form-item>
        <el-form-item :label="bt('coverImage')" prop="image">
          <image-upload v-model="form.image" />
        </el-form-item>
        <el-form-item :label="bt('description')" prop="description">
          <el-input v-model="form.description" type="textarea" :placeholder="bt('enterDescription')" />
        </el-form-item>
        <el-form-item :label="bt('sortOrder')" prop="sort">
          <el-input-number v-model="form.sort" controls-position="right" />
        </el-form-item>
        <el-form-item :label="bt('status')" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">{{ bt('enabledStatus') }}</el-radio>
            <el-radio :value="0">{{ bt('disabledStatus') }}</el-radio>
          </el-radio-group>
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

<script setup name="Destination" lang="ts">

import { useBoxhillI18n } from '../useBoxhillI18n';
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

const { bt } = useBoxhillI18n();

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
  { label: bt('continent'), value: 1 },
  { label: bt('country'), value: 2 },
  { label: bt('city'), value: 3 }
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
    name: [{ required: true, message: bt('destinationNameRequired'), trigger: 'blur' }],
    parentId: [{ required: true, message: bt('parentDestinationRequired'), trigger: 'change' }],
    level: [{ required: true, message: bt('levelRequired'), trigger: 'change' }],
    status: [{ required: true, message: bt('text004'), trigger: 'change' }]
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


const getList = async () => {
  await withLoading(async () => {
    const res = await listDestination(getRootQuery());
    destinationList.value = normalizeDestinationRows(res.data?.rows || []);
  });
};


const loadDestinationChildren = async (
  row: DestinationTableRow,
  _treeNode: unknown,
  resolve: (data: DestinationTableRow[]) => void
) => {
  const res = await listDestination(getChildLayerQuery(row.id));
  resolve(normalizeDestinationRows(res.data?.rows || []));
};


const getTreeselect = async () => {
  const res = await listDestination({
    parentId: 0,
    pageNum: 1,
    pageSize: 10000
  });
  destinationOptions.value = [
    {
      id: 0,
      label: bt('topDestination'),
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


const handleAdd = async (row?: Partial<DestinationTableRow>) => {
  openDialog(bt('addDestination'));
  await getTreeselect();
  form.value.parentId = row?.id ?? 0;
  cacheDestinationOption(row);
};


const handleUpdate = async (row: Partial<DestinationTableRow>) => {
  if (!row.id) {
    return;
  }
  reset();
  await getTreeselect();
  const res = await getDestination(row.id);
  Object.assign(form.value, res.data);
  await cacheDestinationOptionById(res.data?.parentId);
  showDialog(bt('editDestination'));
};


const submitForm = () => {
  destinationFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateDestination(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addDestination(form.value).finally(() => (buttonLoading.value = false));
      }
      modal.msgSuccess(bt('operationSuccess'));
      closeDialog();
      await getList();
    }
  });
};


const handleDelete = async (row: Partial<DestinationTableRow>) => {
  if (!row.id) {
    return;
  }
  await modal.confirm(bt('confirmDeleteDestination', { name: row.name || row.id }));
  setLoading(true);
  await delDestination(row.id).finally(() => setLoading(false));
  modal.msgSuccess(bt('deleteSuccess'));
  await getList();
};

onMounted(() => {
  getList();
});
</script>

<style scoped>
.level-segmented {
  display: inline-flex;
  overflow: hidden;
}

.level-segmented :deep(.el-button) {
  margin: 0;
  border-radius: 0 !important;
}

.level-segmented :deep(.el-button + .el-button) {
  margin-left: -1px;
}

.level-segmented :deep(.el-button:first-child) {
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
}

.level-segmented :deep(.el-button:last-child) {
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}
</style>
