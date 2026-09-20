<template>
  <div class="p-2 page-shell boxhilltravel_manager-home_banner-page">
    <div class="search-wrap">
      <el-card shadow="hover" class="search-panel" :class="{ 'is-collapsed': !showSearch }">
        <template #header>
          <div class="panel-heading search-panel-toggle" @click.stop="showSearch = !showSearch">
            <div><h3>{{ bt('filters') }}</h3></div>
          </div>
        </template>
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form">
          <el-form-item :label="bt('title')" prop="title">
            <el-input
              v-model="queryParams.title"
              :placeholder="bt('enterTitle')"
              clearable
              style="width: 220px"
              @keyup.enter="handleQuery"
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
            <h3>{{ bt('homeBannerList') }}</h3>
          </div>
          <div class="toolbar-actions">
            <el-button
              v-hasPermi="['boxhilltravel_manager:home_banner:add']"
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

      <el-table v-loading="loading" border class="data-table" :data="home_bannerList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column :label="bt('image')" align="center" prop="imageUrl" width="120">
          <template #default="scope">
            <image-preview v-if="scope.row.imageUrl" :src="scope.row.imageUrl" :width="80" :height="50" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column :label="bt('title')" align="center" prop="title" min-width="160" show-overflow-tooltip />
        <el-table-column :label="bt('altText')" align="center" prop="altText" min-width="140" show-overflow-tooltip />
        <el-table-column :label="bt('subtitle')" align="center" prop="subtitle" min-width="160" show-overflow-tooltip />
        <el-table-column :label="bt('linkUrl')" align="center" prop="linkUrl" min-width="160" show-overflow-tooltip />
        <el-table-column :label="bt('sortOrder')" align="center" prop="sortOrder" width="90" />
        <el-table-column :label="bt('status')" align="center" prop="status" width="100">
          <template #default="scope">
            <el-tag v-if="Number(scope.row.status) === 1" type="success">{{ bt('enabledStatus') }}</el-tag>
            <el-tag v-else-if="Number(scope.row.status) === 0" type="danger">{{ bt('disabledStatus') }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column :label="bt('actions')" align="center" class-name="small-padding fixed-width" width="120">
          <template #default="scope">
            <el-tooltip :content="bt('edit')" placement="top">
              <el-button
                v-hasPermi="['boxhilltravel_manager:home_banner:edit']"
                link
                type="primary"
                icon="Edit"
                @click="handleUpdate(scope.row)"
              />
            </el-tooltip>
            <el-tooltip :content="bt('delete')" placement="top">
              <el-button
                v-hasPermi="['boxhilltravel_manager:home_banner:remove']"
                link
                type="primary"
                icon="Delete"
                @click="handleDelete(scope.row)"
              />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="total"
        @pagination="getList"
      />
    </el-card>

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="560px" append-to-body>
      <el-form ref="home_bannerFormRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item :label="bt('image')" prop="image">
          <image-upload v-model="form.image" :limit="1" />
        </el-form-item>
        <el-form-item :label="bt('title')" prop="title">
          <el-input v-model="form.title" :placeholder="bt('enterTitle')" />
        </el-form-item>
        <el-form-item :label="bt('altText')" prop="altText">
          <el-input v-model="form.altText" :placeholder="bt('enterAltText')" />
        </el-form-item>
        <el-form-item :label="bt('subtitle')" prop="subtitle">
          <el-input v-model="form.subtitle" :placeholder="bt('enterBannerSubtitle')" />
        </el-form-item>
        <el-form-item :label="bt('linkUrl')" prop="linkUrl">
          <el-input v-model="form.linkUrl" :placeholder="bt('enterLinkUrl')" />
        </el-form-item>
        <el-form-item :label="bt('sortOrder')" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" controls-position="right" :min="0" />
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

<script setup name="HomeBanner" lang="ts">

import { useBoxhillI18n } from '../useBoxhillI18n';
import {
  addHome_banner,
  delHome_banner,
  getHome_banner,
  listHome_banner,
  updateHome_banner
} from '@/api/boxhilltravel_manager/home_banner';
import type { Home_bannerForm, Home_bannerQuery, Home_bannerVO } from '@/api/boxhilltravel_manager/home_banner/types';
import { useLoading } from '@/hooks/async/useLoading';
import { useFormDialog } from '@/hooks/dialog/useFormDialog';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useSearchToggle } from '@/hooks/form/useSearchToggle';
import modal from '@/plugins/modal';

const { bt } = useBoxhillI18n();

const home_bannerList = ref<Home_bannerVO[]>([]);
const buttonLoading = ref(false);
const { loading, setLoading, withLoading } = useLoading(true);
const { showSearch } = useSearchToggle();

const queryFormRef = ref<ElFormInstance>();
const home_bannerFormRef = ref<ElFormInstance>();

const initFormData: Home_bannerForm = {
  id: undefined,
  image: undefined,
  altText: undefined,
  title: undefined,
  subtitle: undefined,
  linkUrl: undefined,
  sortOrder: 0,
  status: 1
};

const data = reactive<PageData<Home_bannerForm, Home_bannerQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    title: undefined,
    status: undefined,
    params: {}
  },
  rules: {
    image: [{ required: true, message: bt('imageRequired'), trigger: 'change' }],
    sortOrder: [{ required: true, message: bt('sortRequired'), trigger: 'blur' }],
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
  formRef: home_bannerFormRef,
  initialFormData: initFormData
});

const total = ref(0);

const getList = async () => {
  await withLoading(async () => {
    const res = await listHome_banner(queryParams.value);
    home_bannerList.value = res.data?.rows || [];
    total.value = res.data?.total || 0;
  });
};

const cancel = () => {
  reset();
  closeDialog();
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const { resetQuery } = useSearchReset({
  queryFormRef,
  queryParams,
  afterReset: () => {
    handleQuery();
  }
});

const handleSelectionChange = () => {};

const handleAdd = () => {
  openDialog(bt('addHomeBanner'));
};

const handleUpdate = async (row: Partial<Home_bannerVO>) => {
  if (!row.id) {
    return;
  }
  reset();
  const res = await getHome_banner(row.id);
  Object.assign(form.value, res.data);
  showDialog(bt('editHomeBanner'));
};

const submitForm = () => {
  home_bannerFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateHome_banner(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addHome_banner(form.value).finally(() => (buttonLoading.value = false));
      }
      modal.msgSuccess(bt('operationSuccess'));
      closeDialog();
      await getList();
    }
  });
};

const handleDelete = async (row: Partial<Home_bannerVO>) => {
  if (!row.id) {
    return;
  }
  await modal.confirm(bt('confirmDeleteHomeBanner', { title: row.title || row.id }));
  setLoading(true);
  await delHome_banner(row.id).finally(() => setLoading(false));
  modal.msgSuccess(bt('deleteSuccess'));
  await getList();
};

onMounted(() => {
  getList();
});
</script>

<style scoped>
.boxhilltravel_manager-home_banner-page :deep(.el-upload--picture-card) {
  width: 120px;
  height: 80px;
}
</style>