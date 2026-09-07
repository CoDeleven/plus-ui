<template>
  <div class="p-2 page-shell boxhilltravel_manager-review-page">
    <div class="search-wrap">
      <el-card shadow="hover" class="search-panel" :class="{ 'is-collapsed': !showSearch }">
        <template #header>
          <div class="panel-heading search-panel-toggle" @click.stop="showSearch = !showSearch">
            <div><h3>{{ bt('reviewFilters') }}</h3></div>
          </div>
        </template>
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form">
          <el-form-item :label="bt('tour')" prop="tourId">
            <el-select v-model="queryParams.tourId" :placeholder="bt('tour')" clearable filterable>
              <el-option v-for="tour in tourOptions" :key="tour.id" :label="tour.name" :value="tour.id" />
            </el-select>
          </el-form-item>
          <el-form-item :label="bt('keyword')" prop="keyword">
            <el-input v-model="queryParams.keyword" :placeholder="bt('titleContent')" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item :label="bt('status')" prop="status">
            <el-select v-model="queryParams.status" :placeholder="bt('status')" clearable>
              <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item :label="bt('source')" prop="source">
            <el-select v-model="queryParams.source" :placeholder="bt('source')" clearable>
              <el-option v-for="item in sourceOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item :label="bt('published')">
            <el-date-picker
              v-model="dateRange"
              value-format="YYYY-MM-DD HH:mm:ss"
              type="daterange"
              range-separator="-"
              :start-placeholder="bt('start')"
              :end-placeholder="bt('end')"
              :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
            />
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
            <h3>{{ bt('reviews') }}</h3>
          </div>
          <div class="toolbar-actions">
            <el-button v-hasPermi="['boxhilltravel_manager:review:add']" type="primary" plain icon="Plus" @click="handleAdd">{{ bt('add') }}</el-button>
            <el-button v-hasPermi="['boxhilltravel_manager:review:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()">{{ bt('edit') }}</el-button>
            <el-button v-hasPermi="['boxhilltravel_manager:review:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">{{ bt('delete') }}</el-button>
            <right-toolbar v-model:show-search="showSearch" :search="false" @query-table="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" border class="data-table" :data="reviewList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column :label="bt('avatar')" align="center" width="90">
          <template #default="scope">
            <el-avatar :size="42" :src="scope.row.userAvatar || scope.row.avatar">{{ avatarInitial(scope.row.nickname) }}</el-avatar>
          </template>
        </el-table-column>
        <el-table-column :label="bt('nickname')" align="center" prop="nickname" min-width="130" show-overflow-tooltip />
        <el-table-column :label="bt('tour')" align="center" prop="tourName" min-width="220" show-overflow-tooltip />
        <el-table-column :label="bt('title')" align="center" prop="title" min-width="180" show-overflow-tooltip />
        <el-table-column :label="bt('content')" align="center" prop="content" min-width="260" show-overflow-tooltip />
        <el-table-column :label="bt('rating')" align="center" width="150">
          <template #default="scope">
            <el-rate :model-value="scope.row.rating" disabled />
          </template>
        </el-table-column>
        <el-table-column :label="bt('source')" align="center" prop="source" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.source === 2 ? 'success' : 'info'">{{ sourceLabel(scope.row.source) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="bt('status')" align="center" prop="status" width="120">
          <template #default="scope">
            <el-tag :type="statusTagType(scope.row.status)">{{ statusLabel(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="bt('featured')" align="center" prop="featured" width="110">
          <template #default="scope">
            <el-switch
              v-model="scope.row.featured"
              :active-value="1"
              :inactive-value="0"
              :disabled="scope.row.status !== 1"
              @change="handleFeaturedChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column :label="bt('published')" align="center" prop="publishedAt" width="170">
          <template #default="scope">
            {{ scope.row.publishedAt ? parseTime(scope.row.publishedAt) : '-' }}
          </template>
        </el-table-column>
        <el-table-column :label="bt('action')" align="center" fixed="right" width="210">
          <template #default="scope">
            <el-tooltip v-if="showAuditActions(scope.row)" :content="bt('approve')" placement="top">
              <el-button
                v-hasPermi="['boxhilltravel_manager:review:audit']"
                link
                type="primary"
                icon="Check"
                :disabled="scope.row.status === 1"
                @click="handleApprove(scope.row)"
              />
            </el-tooltip>
            <el-tooltip v-if="showAuditActions(scope.row)" :content="bt('reject')" placement="top">
              <el-button
                v-hasPermi="['boxhilltravel_manager:review:audit']"
                link
                type="primary"
                icon="Close"
                :disabled="scope.row.status === 2"
                @click="handleReject(scope.row)"
              />
            </el-tooltip>
            <el-tooltip :content="bt('edit')" placement="top">
              <el-button v-hasPermi="['boxhilltravel_manager:review:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
            </el-tooltip>
            <el-tooltip :content="bt('delete')" placement="top">
              <el-button v-hasPermi="['boxhilltravel_manager:review:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
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

    <el-dialog :title="dialog.title" v-model="dialog.visible" width="720px" append-to-body>
      <el-form ref="reviewFormRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item :label="bt('tour')" prop="tourId">
          <el-select v-model="form.tourId" :placeholder="bt('tour')" filterable>
            <el-option v-for="tour in tourOptions" :key="tour.id" :label="tour.name" :value="tour.id" />
          </el-select>
        </el-form-item>
        <el-form-item :label="bt('nickname')" prop="nickname">
          <el-input v-model="form.nickname" :placeholder="bt('reviewerNickname')" />
        </el-form-item>
        <el-form-item :label="bt('avatar')" prop="avatar">
          <div v-if="isUrl(form.avatar)" class="avatar-url-editor">
            <el-avatar :size="56" :src="form.avatar">{{ avatarInitial(form.nickname) }}</el-avatar>
            <el-input v-model="form.avatar" :placeholder="bt('avatarUrl')" />
          </div>
          <image-upload v-else v-model="form.avatar" :limit="1" />
        </el-form-item>
        <el-form-item :label="bt('title')" prop="title">
          <el-input v-model="form.title" :placeholder="bt('reviewTitle')" />
        </el-form-item>
        <el-form-item :label="bt('content')" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="5" :placeholder="bt('reviewContent')" />
        </el-form-item>
        <el-form-item :label="bt('rating')" prop="rating">
          <el-rate v-model="form.rating" />
        </el-form-item>
        <el-form-item :label="bt('sort')" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item :label="bt('featured')" prop="featured">
          <el-switch v-model="form.featured" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item :label="bt('status')" prop="status">
          <el-select v-model="form.status" :placeholder="bt('status')">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item :label="bt('publishedAt')" prop="publishedAt">
          <el-date-picker
            v-model="form.publishedAt"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            :placeholder="bt('publishedTime')"
            clearable
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

<script setup name="Review" lang="ts">
import {
  addReview,
  auditReview,
  changeReviewFeatured,
  delReview,
  getReview,
  listReview,
  updateReview
} from '@/api/boxhilltravel_manager/review';
import type { ReviewForm, ReviewQuery, ReviewVO } from '@/api/boxhilltravel_manager/review/types';
import { listTour } from '@/api/boxhilltravel_manager/tour';
import type { TourVO } from '@/api/boxhilltravel_manager/tour/types';
import { useLoading } from '@/hooks/async/useLoading';
import { useFormDialog } from '@/hooks/dialog/useFormDialog';
import { useDateRangeQuery } from '@/hooks/form/useDateRangeQuery';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useSearchToggle } from '@/hooks/form/useSearchToggle';
import { useTableSelection } from '@/hooks/table/useTableSelection';
import modal from '@/plugins/modal';
import { parseTime } from '@/utils/ruoyi';
import { useBoxhillI18n } from '../useBoxhillI18n';

const { bt } = useBoxhillI18n();
const statusOptions = computed(() => [
  { label: bt('pending'), value: 0 },
  { label: bt('published'), value: 1 },
  { label: bt('rejected'), value: 2 }
]);

const sourceOptions = computed(() => [
  { label: bt('manager'), value: 1 },
  { label: bt('customer'), value: 2 }
]);

const reviewList = ref<ReviewVO[]>([]);
const tourOptions = ref<TourVO[]>([]);
const buttonLoading = ref(false);
const total = ref(0);
const queryFormRef = ref<ElFormInstance>();
const reviewFormRef = ref<ElFormInstance>();
const { loading, withLoading } = useLoading(true);
const { showSearch } = useSearchToggle();
const { dateRange, applyDateRange, resetDateRange } = useDateRangeQuery('PublishedAt');

const initFormData: ReviewForm = {
  id: undefined,
  tourId: undefined,
  orderId: undefined,
  customerUserId: undefined,
  nickname: undefined,
  avatar: undefined,
  title: undefined,
  content: undefined,
  rating: 5,
  source: 1,
  status: 1,
  featured: 0,
  sortOrder: 0,
  publishedAt: undefined,
  rejectReason: undefined
};

const data = reactive<PageData<ReviewForm, ReviewQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    tourId: undefined,
    keyword: undefined,
    status: undefined,
    source: undefined,
    params: {}
  },
  rules: {
    tourId: [{ required: true, message: bt('tourRequired'), trigger: 'change' }],
    nickname: [{ required: true, message: bt('nicknameRequired'), trigger: 'blur' }],
    title: [{ required: true, message: bt('titleRequired'), trigger: 'blur' }],
    content: [{ required: true, message: bt('contentRequired'), trigger: 'blur' }],
    rating: [{ required: true, message: bt('ratingRequired'), trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);
const { ids, single, multiple, handleSelectionChange } = useTableSelection<ReviewVO>(item => item.id);
const { dialog, resetForm: reset, openDialog, showDialog, closeDialog } = useFormDialog({
  form,
  formRef: reviewFormRef,
  initialFormData: initFormData
});

const getList = async () => {
  await withLoading(async () => {
    const res = await listReview(applyDateRange(queryParams.value));
    reviewList.value = res.data?.rows || [];
    total.value = res.data?.total || 0;
  });
};

const getTourOptions = async () => {
  const res = await listTour({ pageNum: 1, pageSize: 1000, status: 1 });
  tourOptions.value = res.data?.rows || [];
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
  resetExtras: resetDateRange,
  afterReset: handleQuery
});

const handleAdd = () => {
  openDialog(bt('addReview'));
};

const handleUpdate = async (row?: Partial<ReviewVO>) => {
  reset();
  const id = row?.id || ids.value[0];
  const res = await getReview(id);
  Object.assign(form.value, res.data);
  showDialog(bt('editReview'));
};

const submitForm = () => {
  reviewFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      if (form.value.id) {
        await updateReview(form.value);
      } else {
        await addReview(form.value);
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

const handleDelete = async (row?: Partial<ReviewVO>) => {
  const reviewIds = row?.id || ids.value;
  await modal.confirm(bt('confirmDeleteReview', { ids: reviewIds }));
  await delReview(reviewIds);
  modal.msgSuccess(bt('deleted'));
  await getList();
};

const handleApprove = async (row: ReviewVO) => {
  await modal.confirm(bt('confirmApproveReview'));
  await auditReview({ id: row.id, status: 1 });
  modal.msgSuccess(bt('approved'));
  await getList();
};

const handleReject = async (row: ReviewVO) => {
  const result = await modal.prompt(bt('rejectReason'));
  await auditReview({ id: row.id, status: 2, rejectReason: result.value });
  modal.msgSuccess(bt('rejected'));
  await getList();
};

const handleFeaturedChange = async (row: ReviewVO) => {
  try {
    await changeReviewFeatured({ id: row.id, featured: row.featured });
    modal.msgSuccess(bt('updated'));
  } catch (err) {
    row.featured = row.featured === 1 ? 0 : 1;
  }
};

const avatarInitial = (name?: string) => (name || bt('userInitial')).slice(0, 1).toUpperCase();
const isUrl = (value?: string) => Boolean(value && (/^https?:\/\//.test(value) || value.startsWith('//')));
const showAuditActions = (row: ReviewVO) => row.source !== 1;
const sourceLabel = (source?: number) => sourceOptions.value.find(item => item.value === source)?.label || '-';
const statusLabel = (status?: number) => statusOptions.value.find(item => item.value === status)?.label || '-';
const statusTagType = (status?: number) => {
  if (status === 1) return 'success';
  if (status === 2) return 'danger';
  return 'warning';
};

onMounted(() => {
  getTourOptions();
  getList();
});
</script>

<style scoped>
.boxhilltravel_manager-review-page :deep(.el-rate) {
  justify-content: center;
}

.avatar-url-editor {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  width: 100%;
}
</style>
