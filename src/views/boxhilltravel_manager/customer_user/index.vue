<template>
  <div class="p-2 page-shell boxhilltravel_manager-customer_user-page">
    <div class="search-wrap">
      <el-card shadow="hover" class="search-panel" :class="{ 'is-collapsed': !showSearch }">
        <template #header>
          <div class="panel-heading search-panel-toggle" @click.stop="showSearch = !showSearch">
            <div><h3>客户用户筛选</h3></div>
          </div>
        </template>
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form">
          <el-form-item label="用户名" prop="userName">
            <el-input v-model="queryParams.userName" placeholder="请输入用户名" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="昵称" prop="nickName">
            <el-input v-model="queryParams.nickName" placeholder="请输入昵称" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="queryParams.email" placeholder="请输入邮箱" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="手机号" prop="phoneNumber">
            <el-input v-model="queryParams.phoneNumber" placeholder="请输入手机号" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
              <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="注册时间">
            <el-date-picker
              v-model="dateRange"
              value-format="YYYY-MM-DD HH:mm:ss"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
            />
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
            <h3>客户用户</h3>
            <p>共 {{ total }} 条记录，仅支持查看详情和账号启用/禁用。</p>
          </div>
          <div class="toolbar-actions">
            <right-toolbar v-model:show-search="showSearch" :search="false" @query-table="getList" />
          </div>
        </div>
      </template>

      <el-table v-loading="loading" border class="data-table" :data="customerUserList">
        <el-table-column label="用户ID" align="center" prop="userId" width="180" />
        <el-table-column label="用户名" align="center" prop="userName" min-width="180" show-overflow-tooltip>
          <template #default="scope">
            <el-link type="primary" underline="never" @click="handleView(scope.row)">{{ scope.row.userName }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="昵称" align="center" min-width="160" show-overflow-tooltip>
          <template #default="scope">{{ scope.row.profileNickname || scope.row.nickName || '-' }}</template>
        </el-table-column>
        <el-table-column label="邮箱" align="center" prop="email" min-width="210" show-overflow-tooltip />
        <el-table-column label="手机号" align="center" min-width="150" show-overflow-tooltip>
          <template #default="scope">{{ scope.row.contactPhone || scope.row.phoneNumber || '-' }}</template>
        </el-table-column>
        <el-table-column label="状态" align="center" width="110">
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
        <el-table-column label="最近登录" align="center" prop="loginDate" width="170">
          <template #default="scope">{{ parseTime(scope.row.loginDate) || '-' }}</template>
        </el-table-column>
        <el-table-column label="注册时间" align="center" prop="createTime" width="170">
          <template #default="scope">{{ parseTime(scope.row.createTime) || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="100" fixed="right">
          <template #default="scope">
            <el-tooltip content="查看" placement="top">
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

    <el-drawer v-model="detailVisible" title="客户用户详情" size="64%" append-to-body destroy-on-close>
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
            <el-descriptions-item label="用户ID">{{ detail.userId }}</el-descriptions-item>
            <el-descriptions-item label="用户类型">{{ detail.userType }}</el-descriptions-item>
            <el-descriptions-item label="用户名">{{ detail.userName }}</el-descriptions-item>
            <el-descriptions-item label="昵称">{{ detail.nickName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ detail.email || '-' }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ detail.phoneNumber || '-' }}</el-descriptions-item>
            <el-descriptions-item label="最近登录IP">{{ detail.loginIp || '-' }}</el-descriptions-item>
            <el-descriptions-item label="最近登录">{{ parseTime(detail.loginDate) || '-' }}</el-descriptions-item>
            <el-descriptions-item label="注册时间">{{ parseTime(detail.createTime) || '-' }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ parseTime(detail.updateTime) || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card shadow="never">
          <template #header><h3>Profile</h3></template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="Profile 昵称">{{ detail.profile?.nickname || '-' }}</el-descriptions-item>
            <el-descriptions-item label="头像 URL">{{ detail.profile?.avatarUrl || '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ parseTime(detail.profile?.createdAt) || '-' }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ parseTime(detail.profile?.updatedAt) || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card shadow="never">
          <template #header><h3>Contact</h3></template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="联系邮箱">{{ detail.contactInfo?.contactEmail || '-' }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ detail.contactInfo?.phone || '-' }}</el-descriptions-item>
            <el-descriptions-item label="城市">{{ compact([detail.contactInfo?.city, detail.contactInfo?.region, detail.contactInfo?.country]) }}</el-descriptions-item>
            <el-descriptions-item label="邮编">{{ detail.contactInfo?.postalCode || '-' }}</el-descriptions-item>
            <el-descriptions-item label="邮寄地址" :span="2">
              {{ compact([detail.contactInfo?.mailingAddress, detail.contactInfo?.city, detail.contactInfo?.region, detail.contactInfo?.postalCode, detail.contactInfo?.country]) }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ parseTime(detail.contactInfo?.createdAt) || '-' }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ parseTime(detail.contactInfo?.updatedAt) || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>
    </el-drawer>
  </div>
</template>

<script setup name="CustomerUser" lang="ts">
import { changeCustomerUserStatus, getCustomerUser, listCustomerUser } from '@/api/boxhilltravel_manager/customer_user';
import type { CustomerUserDetailVO, CustomerUserQuery, CustomerUserVO } from '@/api/boxhilltravel_manager/customer_user/types';
import { useLoading } from '@/hooks/async/useLoading';
import { useDateRangeQuery } from '@/hooks/form/useDateRangeQuery';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useSearchToggle } from '@/hooks/form/useSearchToggle';
import modal from '@/plugins/modal';
import { useDict } from '@/utils/dict';
import { parseTime } from '@/utils/ruoyi';

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
    await modal.confirm(`确认${nextStatus === '0' ? '启用' : '禁用'}客户用户 "${row.userName}"？`);
    await changeCustomerUserStatus(row.userId, nextStatus);
    modal.msgSuccess('状态更新成功');
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
