<template>
  <div class="p-2 page-shell boxhilltravel_manager-customer_user-page">
    <div class="search-wrap">
      <el-card shadow="hover" class="search-panel" :class="{ 'is-collapsed': !showSearch }">
        <template #header>
          <div class="panel-heading search-panel-toggle" @click.stop="showSearch = !showSearch">
            <div><h3>{{ bt('customerUserFilters') }}</h3></div>
          </div>
        </template>
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form">
          <el-form-item :label="bt('username')" prop="userName">
            <el-input v-model="queryParams.userName" :placeholder="bt('enterUsername')" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item :label="bt('nickname')" prop="nickName">
            <el-input v-model="queryParams.nickName" :placeholder="bt('enterNickname')" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item :label="bt('email')" prop="email">
            <el-input v-model="queryParams.email" :placeholder="bt('enterEmail')" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item :label="bt('phoneNumber')" prop="phoneNumber">
            <el-input v-model="queryParams.phoneNumber" :placeholder="bt('enterPhoneNumber')" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item :label="bt('status')" prop="status">
            <el-select v-model="queryParams.status" :placeholder="bt('selectStatus')" clearable>
              <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item :label="bt('registeredAt')">
            <el-date-picker
              v-model="dateRange"
              value-format="YYYY-MM-DD HH:mm:ss"
              type="daterange"
              range-separator="-"
              :start-placeholder="bt('startDate')"
              :end-placeholder="bt('endDate')"
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
            <h3>{{ bt('customerUsers') }}</h3>
            <p>{{ bt('totalPrefix') }}{{ total }} {{ bt('customerUserSummarySuffix') }}</p>
          </div>
          <div class="toolbar-actions">
            <right-toolbar v-model:show-search="showSearch" :search="false" @query-table="getList" />
          </div>
        </div>
      </template>

      <el-table v-loading="loading" border class="data-table" :data="customerUserList">
        <el-table-column :label="bt('userId')" align="center" prop="userId" width="180" />
        <el-table-column :label="bt('username')" align="center" prop="userName" min-width="180" show-overflow-tooltip>
          <template #default="scope">
            <el-link type="primary" underline="never" @click="handleView(scope.row)">{{ scope.row.userName }}</el-link>
          </template>
        </el-table-column>
        <el-table-column :label="bt('nickname')" align="center" min-width="160" show-overflow-tooltip>
          <template #default="scope">{{ scope.row.profileNickname || scope.row.nickName || '-' }}</template>
        </el-table-column>
        <el-table-column :label="bt('email')" align="center" prop="email" min-width="210" show-overflow-tooltip />
        <el-table-column :label="bt('phoneNumber')" align="center" min-width="150" show-overflow-tooltip>
          <template #default="scope">{{ scope.row.contactPhone || scope.row.phoneNumber || '-' }}</template>
        </el-table-column>
        <el-table-column :label="bt('status')" align="center" width="110">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              active-value="0"
              inactive-value="1"
              v-hasPermi="['boxhilltravel_manager:customer_user:status']"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column :label="bt('lastLogin')" align="center" prop="loginDate" width="170">
          <template #default="scope">{{ parseTime(scope.row.loginDate) || '-' }}</template>
        </el-table-column>
        <el-table-column :label="bt('registeredAt')" align="center" prop="createTime" width="170">
          <template #default="scope">{{ parseTime(scope.row.createTime) || '-' }}</template>
        </el-table-column>
        <el-table-column :label="bt('actions')" align="center" width="100" fixed="right">
          <template #default="scope">
            <el-tooltip :content="bt('view')" placement="top">
              <el-button v-hasPermi="['boxhilltravel_manager:customer_user:query']" link type="primary" icon="View" @click="handleView(scope.row)" />
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

    <el-drawer v-model="detailVisible" :title="bt('customerUserDetails')" size="64%" append-to-body destroy-on-close>
      <div v-if="detail" class="customer-detail">
        <el-card shadow="never">
          <template #header>
            <div class="detail-header">
              <div>
                <h3>{{ detail.profile?.nickname || detail.nickName || detail.userName }}</h3>
                <p>{{ detail.email || detail.userName }}</p>
              </div>
              <el-tag :type="detail.status === '0' ? 'success' : 'info'">{{ statusLabel(detail.status) }}</el-tag>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item :label="bt('userId')">{{ detail.userId }}</el-descriptions-item>
            <el-descriptions-item :label="bt('userType')">{{ detail.userType }}</el-descriptions-item>
            <el-descriptions-item :label="bt('username')">{{ detail.userName }}</el-descriptions-item>
            <el-descriptions-item :label="bt('nickname')">{{ detail.nickName || '-' }}</el-descriptions-item>
            <el-descriptions-item :label="bt('email')">{{ detail.email || '-' }}</el-descriptions-item>
            <el-descriptions-item :label="bt('phoneNumber')">{{ detail.phoneNumber || '-' }}</el-descriptions-item>
            <el-descriptions-item :label="bt('lastLoginIp')">{{ detail.loginIp || '-' }}</el-descriptions-item>
            <el-descriptions-item :label="bt('lastLogin')">{{ parseTime(detail.loginDate) || '-' }}</el-descriptions-item>
            <el-descriptions-item :label="bt('registeredAt')">{{ parseTime(detail.createTime) || '-' }}</el-descriptions-item>
            <el-descriptions-item :label="bt('updatedAt')">{{ parseTime(detail.updateTime) || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card shadow="never">
          <template #header><h3>{{ bt('profile') }}</h3></template>
          <el-descriptions :column="2" border>
            <el-descriptions-item :label="bt('profileNickname')">{{ detail.profile?.nickname || '-' }}</el-descriptions-item>
            <el-descriptions-item :label="bt('avatarUrl')">{{ detail.profile?.avatarUrl || '-' }}</el-descriptions-item>
            <el-descriptions-item :label="bt('createdAt')">{{ parseTime(detail.profile?.createdAt) || '-' }}</el-descriptions-item>
            <el-descriptions-item :label="bt('updatedAt')">{{ parseTime(detail.profile?.updatedAt) || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card shadow="never">
          <template #header><h3>{{ bt('contact') }}</h3></template>
          <el-descriptions :column="2" border>
            <el-descriptions-item :label="bt('contactEmail')">{{ detail.contactInfo?.contactEmail || '-' }}</el-descriptions-item>
            <el-descriptions-item :label="bt('phone')">{{ detail.contactInfo?.phone || '-' }}</el-descriptions-item>
            <el-descriptions-item :label="bt('city')">{{ compact([detail.contactInfo?.city, detail.contactInfo?.region, detail.contactInfo?.country]) }}</el-descriptions-item>
            <el-descriptions-item :label="bt('postalCode')">{{ detail.contactInfo?.postalCode || '-' }}</el-descriptions-item>
            <el-descriptions-item :label="bt('mailingAddress')" :span="2">
              {{ compact([detail.contactInfo?.mailingAddress, detail.contactInfo?.city, detail.contactInfo?.region, detail.contactInfo?.postalCode, detail.contactInfo?.country]) }}
            </el-descriptions-item>
            <el-descriptions-item :label="bt('createdAt')">{{ parseTime(detail.contactInfo?.createdAt) || '-' }}</el-descriptions-item>
            <el-descriptions-item :label="bt('updatedAt')">{{ parseTime(detail.contactInfo?.updatedAt) || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>
    </el-drawer>
  </div>
</template>

<script setup name="CustomerUser" lang="ts">

import { useBoxhillI18n } from '../useBoxhillI18n';
import { changeCustomerUserStatus, getCustomerUser, listCustomerUser } from '@/api/boxhilltravel_manager/customer_user';
import type { CustomerUserDetailVO, CustomerUserQuery, CustomerUserVO } from '@/api/boxhilltravel_manager/customer_user/types';
import { useLoading } from '@/hooks/async/useLoading';
import { useDateRangeQuery } from '@/hooks/form/useDateRangeQuery';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useSearchToggle } from '@/hooks/form/useSearchToggle';
import modal from '@/plugins/modal';
import { useDict } from '@/utils/dict';
import { parseTime } from '@/utils/ruoyi';

const { bt } = useBoxhillI18n();
const { sys_normal_disable } = toRefs<any>(useDict('sys_normal_disable'));

const customerUserList = ref<CustomerUserVO[]>([]);
const detail = ref<CustomerUserDetailVO>();
const detailVisible = ref(false);
const total = ref(0);
const queryFormRef = ref<ElFormInstance>();
const { loading, withLoading } = useLoading(true);
const { showSearch } = useSearchToggle();
const { dateRange, applyDateRange, resetDateRange } = useDateRangeQuery();

const queryParams = ref<CustomerUserQuery>({
  pageNum: 1,
  pageSize: 10,
  userName: '',
  nickName: '',
  email: '',
  phoneNumber: '',
  status: undefined,
  params: {}
});

const getList = async () => {
  await withLoading(async () => {
    const res = await listCustomerUser(applyDateRange(queryParams.value));
    customerUserList.value = res.data?.rows || [];
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
  resetExtras: resetDateRange,
  afterReset: handleQuery
});

const handleView = async (row: CustomerUserVO) => {
  const res = await getCustomerUser(row.userId);
  detail.value = res.data;
  detailVisible.value = true;
};

const handleStatusChange = async (row: CustomerUserVO) => {
  const nextStatus = String(row.status);
  const previousStatus = nextStatus === '0' ? '1' : '0';
  try {
    await modal.confirm(bt('confirmCustomerUserStatus', { action: nextStatus === '0' ? bt('enabledStatus') : bt('disabledStatus'), name: row.userName }));
    await changeCustomerUserStatus(row.userId, nextStatus);
    modal.msgSuccess(bt('statusUpdateSuccess'));
    await getList();
    if (detailVisible.value && detail.value?.userId === row.userId) {
      const res = await getCustomerUser(row.userId);
      detail.value = res.data;
    }
  } catch {
    row.status = previousStatus;
  }
};

const statusLabel = (status?: string) => {
  return sys_normal_disable.value.find((item: DictDataOption) => String(item.value) === String(status))?.label || '-';
};

const compact = (values: Array<string | undefined>) => values.filter(Boolean).join(' / ') || '-';

onMounted(() => {
  getList();
});
</script>

<style scoped>
.customer-detail {
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
  margin: 6px 0 0;
  color: var(--el-text-color-secondary);
}
</style>
