<template>
  <div class="p-2 page-shell boxhilltravel_manager-contact_us-page">
    <div class="search-wrap">
      <el-card shadow="hover" class="search-panel" :class="{ 'is-collapsed': !showSearch }">
        <template #header>
          <div class="panel-heading search-panel-toggle" @click.stop="showSearch = !showSearch">
            <div><h3>{{ bt('contactUsFilters') }}</h3></div>
          </div>
        </template>
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form">
          <el-form-item :label="bt('fullName')" prop="fullName">
            <el-input v-model="queryParams.fullName" :placeholder="bt('fullName')" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item :label="bt('emailAddress')" prop="emailAddress">
            <el-input v-model="queryParams.emailAddress" :placeholder="bt('emailAddress')" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item :label="bt('phoneNumber')" prop="phoneNumber">
            <el-input v-model="queryParams.phoneNumber" :placeholder="bt('phoneNumber')" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item :label="bt('enquiryType')" prop="enquiryType">
            <el-input v-model="queryParams.enquiryType" :placeholder="bt('enquiryType')" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item :label="bt('readStatus')" prop="readStatus">
            <el-select v-model="queryParams.readStatus" :placeholder="bt('selectReadStatus')" clearable>
              <el-option v-for="item in readStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item :label="bt('createdAt')">
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
            <h3>{{ bt('contactUsRecords') }}</h3>
            <p>{{ bt('totalPrefix') }}{{ total }} {{ bt('contactUsSummarySuffix') }}</p>
          </div>
          <div class="toolbar-actions">
            <el-button v-hasPermi="['boxhilltravel_manager:contact_us:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">
              {{ bt('delete') }}
            </el-button>
            <right-toolbar v-model:show-search="showSearch" :search="false" @query-table="getList" />
          </div>
        </div>
      </template>

      <el-table v-loading="loading" border class="data-table" :data="contactUsList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column :label="bt('id')" align="center" prop="id" width="100" />
        <el-table-column :label="bt('fullName')" align="center" prop="fullName" min-width="160" show-overflow-tooltip>
          <template #default="scope">
            <el-link type="primary" underline="never" @click="handleView(scope.row)">{{ scope.row.fullName }}</el-link>
          </template>
        </el-table-column>
        <el-table-column :label="bt('emailAddress')" align="center" prop="emailAddress" min-width="200" show-overflow-tooltip />
        <el-table-column :label="bt('phoneNumber')" align="center" prop="phoneNumber" min-width="150" show-overflow-tooltip />
        <el-table-column :label="bt('enquiryType')" align="center" prop="enquiryType" min-width="150" show-overflow-tooltip />
        <el-table-column :label="bt('yourMessage')" align="center" prop="message" min-width="280" show-overflow-tooltip>
          <template #default="scope">
            <span>{{ scope.row.message }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="bt('ipAddress')" align="center" prop="ipAddress" width="150" show-overflow-tooltip />
        <el-table-column :label="bt('readStatus')" align="center" width="120">
          <template #default="scope">
            <el-switch
              v-model="scope.row.readStatus"
              :active-value="1"
              :inactive-value="0"
              v-hasPermi="['boxhilltravel_manager:contact_us:edit']"
              @change="value => handleReadStatusChange(scope.row, value)"
            />
          </template>
        </el-table-column>
        <el-table-column :label="bt('readTime')" align="center" prop="readTime" width="170">
          <template #default="scope">
            {{ parseTime(scope.row.readTime) || '-' }}
          </template>
        </el-table-column>
        <el-table-column :label="bt('createdAt')" align="center" prop="createTime" width="170">
          <template #default="scope">
            {{ parseTime(scope.row.createTime) || '-' }}
          </template>
        </el-table-column>
        <el-table-column :label="bt('actions')" align="center" width="120" fixed="right">
          <template #default="scope">
            <el-tooltip :content="bt('view')" placement="top">
              <el-button v-hasPermi="['boxhilltravel_manager:contact_us:query']" link type="primary" icon="View" @click="handleView(scope.row)" />
            </el-tooltip>
            <el-tooltip :content="bt('delete')" placement="top">
              <el-button v-hasPermi="['boxhilltravel_manager:contact_us:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
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

    <el-drawer v-model="detailVisible" :title="bt('contactUsDetails')" size="64%" append-to-body destroy-on-close>
      <div v-if="detail" class="contact-us-detail">
        <el-card shadow="never">
          <template #header>
            <div class="detail-header">
              <div>
                <h3>{{ detail.fullName }}</h3>
                <p>{{ detail.emailAddress }}</p>
              </div>
              <el-tag :type="readStatusTagType(detail.readStatus)">{{ readStatusLabel(detail.readStatus) }}</el-tag>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item :label="bt('id')">{{ detail.id }}</el-descriptions-item>
            <el-descriptions-item :label="bt('fullName')">{{ detail.fullName }}</el-descriptions-item>
            <el-descriptions-item :label="bt('emailAddress')">{{ detail.emailAddress }}</el-descriptions-item>
            <el-descriptions-item :label="bt('phoneNumber')">{{ detail.phoneNumber }}</el-descriptions-item>
            <el-descriptions-item :label="bt('enquiryType')">{{ detail.enquiryType }}</el-descriptions-item>
            <el-descriptions-item :label="bt('ipAddress')">{{ detail.ipAddress || '-' }}</el-descriptions-item>
            <el-descriptions-item :label="bt('readTime')">{{ parseTime(detail.readTime) || '-' }}</el-descriptions-item>
            <el-descriptions-item :label="bt('createdAt')">{{ parseTime(detail.createTime) || '-' }}</el-descriptions-item>
            <el-descriptions-item :label="bt('updatedAt')">{{ parseTime(detail.updateTime) || '-' }}</el-descriptions-item>
            <el-descriptions-item :label="bt('yourMessage')" :span="2">
              <div class="message-box">{{ detail.message }}</div>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>
    </el-drawer>
  </div>
</template>

<script setup name="CustomerContactUs" lang="ts">
import {
  changeCustomerContactUsStatus,
  delCustomerContactUs,
  getCustomerContactUs,
  listCustomerContactUs
} from '@/api/boxhilltravel_manager/contact_us';
import type { CustomerContactUsQuery, CustomerContactUsVO } from '@/api/boxhilltravel_manager/contact_us/types';
import { useLoading } from '@/hooks/async/useLoading';
import { useDateRangeQuery } from '@/hooks/form/useDateRangeQuery';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useSearchToggle } from '@/hooks/form/useSearchToggle';
import { useTableSelection } from '@/hooks/table/useTableSelection';
import modal from '@/plugins/modal';
import { parseTime } from '@/utils/ruoyi';
import { useBoxhillI18n } from '../useBoxhillI18n';

const { bt } = useBoxhillI18n();

const contactUsList = ref<CustomerContactUsVO[]>([]);
const detail = ref<CustomerContactUsVO>();
const detailVisible = ref(false);
const total = ref(0);
const queryFormRef = ref<ElFormInstance>();
const { loading, withLoading } = useLoading(true);
const { showSearch } = useSearchToggle();
const { dateRange, applyDateRange, resetDateRange } = useDateRangeQuery();
const { ids, multiple, handleSelectionChange } = useTableSelection<CustomerContactUsVO>(item => item.id);

const readStatusOptions = computed(() => [
  { label: bt('unread'), value: 0 },
  { label: bt('read'), value: 1 }
]);

const queryParams = ref<CustomerContactUsQuery>({
  pageNum: 1,
  pageSize: 10,
  fullName: '',
  emailAddress: '',
  phoneNumber: '',
  enquiryType: '',
  readStatus: undefined,
  params: {}
});

const getList = async () => {
  await withLoading(async () => {
    const res = await listCustomerContactUs(applyDateRange(queryParams.value));
    contactUsList.value = res.data?.rows || [];
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
  resetExtras: resetDateRange,
  afterReset: handleQuery
});

const handleView = async (row: CustomerContactUsVO) => {
  const res = await getCustomerContactUs(row.id);
  detail.value = res.data;
  detailVisible.value = true;
};

const handleReadStatusChange = async (row: CustomerContactUsVO, value: string | number | boolean) => {
  const nextStatus = Number(value);
  const previousStatus = nextStatus === 1 ? 0 : 1;
  try {
    await changeCustomerContactUsStatus({ id: row.id, readStatus: nextStatus });
    modal.msgSuccess(bt('statusUpdateSuccess'));
    if (detailVisible.value && detail.value?.id === row.id) {
      const res = await getCustomerContactUs(row.id);
      detail.value = res.data;
    }
  } catch {
    row.readStatus = previousStatus;
  }
};

const handleDelete = async (row?: Partial<CustomerContactUsVO>) => {
  const contactUsIds = row?.id || ids.value;
  if (!contactUsIds || (Array.isArray(contactUsIds) && contactUsIds.length === 0)) {
    return;
  }
  await modal.confirm(bt('confirmDeleteContactUs', { ids: contactUsIds }));
  await delCustomerContactUs(contactUsIds as string | number | Array<string | number>);
  modal.msgSuccess(bt('deleteSuccess'));
  const deletedIds = Array.isArray(contactUsIds) ? contactUsIds : [contactUsIds];
  if (detailVisible.value && detail.value?.id && deletedIds.some(id => String(id) === String(detail.value?.id))) {
    detailVisible.value = false;
    detail.value = undefined;
  }
  await getList();
};

const readStatusLabel = (status?: number) => readStatusOptions.value.find(item => item.value === status)?.label || '-';

const readStatusTagType = (status?: number) => {
  if (status === 1) return 'success';
  if (status === 0) return 'info';
  return 'warning';
};

onMounted(() => {
  getList();
});
</script>

<style scoped>
.contact-us-detail {
  display: grid;
  gap: 16px;
}

.detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.detail-header h3 {
  margin: 0;
  font-size: 18px;
}

.detail-header p {
  margin: 4px 0 0;
  color: var(--el-text-color-secondary);
}

.message-box {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.7;
}
</style>
