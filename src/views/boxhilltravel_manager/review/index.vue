<template>
  <div class="p-2 page-shell boxhilltravel_manager-review-page">
    <div class="search-wrap">
      <el-card shadow="hover" class="search-panel" :class="{ 'is-collapsed': !showSearch }">
        <template #header>
          <div class="panel-heading search-panel-toggle" @click.stop="showSearch = !showSearch">
            <div><h3>Review filters</h3></div>
          </div>
        </template>
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form">
          <el-form-item label="Tour" prop="tourId">
            <el-select v-model="queryParams.tourId" placeholder="Tour" clearable filterable>
              <el-option v-for="tour in tourOptions" :key="tour.id" :label="tour.name" :value="tour.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="Keyword" prop="keyword">
            <el-input v-model="queryParams.keyword" placeholder="Title / content" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="Status" prop="status">
            <el-select v-model="queryParams.status" placeholder="Status" clearable>
              <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="Source" prop="source">
            <el-select v-model="queryParams.source" placeholder="Source" clearable>
              <el-option v-for="item in sourceOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="Published">
            <el-date-picker
              v-model="dateRange"
              value-format="YYYY-MM-DD HH:mm:ss"
              type="daterange"
              range-separator="-"
              start-placeholder="Start"
              end-placeholder="End"
              :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
            />
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
            <h3>Reviews</h3>
          </div>
          <div class="toolbar-actions">
            <el-button v-hasPermi="['boxhilltravel_manager:review:add']" type="primary" plain icon="Plus" @click="handleAdd">Add</el-button>
            <el-button v-hasPermi="['boxhilltravel_manager:review:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()">Edit</el-button>
            <el-button v-hasPermi="['boxhilltravel_manager:review:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">Delete</el-button>
            <right-toolbar v-model:show-search="showSearch" :search="false" @query-table="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" border class="data-table" :data="reviewList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="Avatar" align="center" width="90">
          <template #default="scope">
            <el-avatar :size="42" :src="scope.row.userAvatar || scope.row.avatar">{{ avatarInitial(scope.row.nickname) }}</el-avatar>
          </template>
        </el-table-column>
        <el-table-column label="Nickname" align="center" prop="nickname" min-width="130" show-overflow-tooltip />
        <el-table-column label="Tour" align="center" prop="tourName" min-width="220" show-overflow-tooltip />
        <el-table-column label="Title" align="center" prop="title" min-width="180" show-overflow-tooltip />
        <el-table-column label="Content" align="center" prop="content" min-width="260" show-overflow-tooltip />
        <el-table-column label="Rating" align="center" width="150">
          <template #default="scope">
            <el-rate :model-value="scope.row.rating" disabled />
          </template>
        </el-table-column>
        <el-table-column label="Source" align="center" prop="source" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.source === 2 ? 'success' : 'info'">{{ sourceLabel(scope.row.source) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Status" align="center" prop="status" width="120">
          <template #default="scope">
            <el-tag :type="statusTagType(scope.row.status)">{{ statusLabel(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Featured" align="center" prop="featured" width="110">
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
        <el-table-column label="Published" align="center" prop="publishedAt" width="170">
          <template #default="scope">
            {{ scope.row.publishedAt ? parseTime(scope.row.publishedAt) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="Action" align="center" fixed="right" width="210">
          <template #default="scope">
            <el-tooltip v-if="showAuditActions(scope.row)" content="Approve" placement="top">
              <el-button
                v-hasPermi="['boxhilltravel_manager:review:audit']"
                link
                type="primary"
                icon="Check"
                :disabled="scope.row.status === 1"
                @click="handleApprove(scope.row)"
              />
            </el-tooltip>
            <el-tooltip v-if="showAuditActions(scope.row)" content="Reject" placement="top">
              <el-button
                v-hasPermi="['boxhilltravel_manager:review:audit']"
                link
                type="primary"
                icon="Close"
                :disabled="scope.row.status === 2"
                @click="handleReject(scope.row)"
              />
            </el-tooltip>
            <el-tooltip content="Edit" placement="top">
              <el-button v-hasPermi="['boxhilltravel_manager:review:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
            </el-tooltip>
            <el-tooltip content="Delete" placement="top">
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
        <el-form-item label="Tour" prop="tourId">
          <el-select v-model="form.tourId" placeholder="Tour" filterable>
            <el-option v-for="tour in tourOptions" :key="tour.id" :label="tour.name" :value="tour.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="Nickname" prop="nickname">
          <el-input v-model="form.nickname" placeholder="Reviewer nickname" />
        </el-form-item>
        <el-form-item label="Avatar" prop="avatar">
          <div v-if="isUrl(form.avatar)" class="avatar-url-editor">
            <el-avatar :size="56" :src="form.avatar">{{ avatarInitial(form.nickname) }}</el-avatar>
            <el-input v-model="form.avatar" placeholder="Avatar URL" />
          </div>
          <image-upload v-else v-model="form.avatar" :limit="1" />
        </el-form-item>
        <el-form-item label="Title" prop="title">
          <el-input v-model="form.title" placeholder="Review title" />
        </el-form-item>
        <el-form-item label="Content" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="5" placeholder="Review content" />
        </el-form-item>
        <el-form-item label="Rating" prop="rating">
          <el-rate v-model="form.rating" />
        </el-form-item>
        <el-form-item label="Sort" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="Featured" prop="featured">
          <el-switch v-model="form.featured" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="Status" prop="status">
          <el-select v-model="form.status" placeholder="Status">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
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

const statusOptions = [
  { label: 'Pending', value: 0 },
  { label: 'Published', value: 1 },
  { label: 'Rejected', value: 2 }
];

const sourceOptions = [
  { label: 'Manager', value: 1 },
  { label: 'Customer', value: 2 }
];

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
    tourId: [{ required: true, message: 'Tour is required', trigger: 'change' }],
    nickname: [{ required: true, message: 'Nickname is required', trigger: 'blur' }],
    title: [{ required: true, message: 'Title is required', trigger: 'blur' }],
    content: [{ required: true, message: 'Content is required', trigger: 'blur' }],
    rating: [{ required: true, message: 'Rating is required', trigger: 'change' }]
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
  openDialog('Add review');
};

const handleUpdate = async (row?: Partial<ReviewVO>) => {
  reset();
  const id = row?.id || ids.value[0];
  const res = await getReview(id);
  Object.assign(form.value, res.data);
  showDialog('Edit review');
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

const handleDelete = async (row?: Partial<ReviewVO>) => {
  const reviewIds = row?.id || ids.value;
  await modal.confirm('Delete selected review(s): ' + reviewIds + '?');
  await delReview(reviewIds);
  modal.msgSuccess('Deleted');
  await getList();
};

const handleApprove = async (row: ReviewVO) => {
  await modal.confirm('Approve this review?');
  await auditReview({ id: row.id, status: 1 });
  modal.msgSuccess('Approved');
  await getList();
};

const handleReject = async (row: ReviewVO) => {
  const result = await modal.prompt('Reject reason');
  await auditReview({ id: row.id, status: 2, rejectReason: result.value });
  modal.msgSuccess('Rejected');
  await getList();
};

const handleFeaturedChange = async (row: ReviewVO) => {
  try {
    await changeReviewFeatured({ id: row.id, featured: row.featured });
    modal.msgSuccess('Updated');
  } catch (err) {
    row.featured = row.featured === 1 ? 0 : 1;
  }
};

const avatarInitial = (name?: string) => (name || 'U').slice(0, 1).toUpperCase();
const isUrl = (value?: string) => Boolean(value && (/^https?:\/\//.test(value) || value.startsWith('//')));
const showAuditActions = (row: ReviewVO) => row.source !== 1;
const sourceLabel = (source?: number) => sourceOptions.find(item => item.value === source)?.label || '-';
const statusLabel = (status?: number) => statusOptions.find(item => item.value === status)?.label || '-';
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
