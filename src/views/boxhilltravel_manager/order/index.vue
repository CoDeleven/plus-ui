<template>
  <div class="p-2 page-shell boxhilltravel_manager-order-page">
    <div class="search-wrap">
      <el-card shadow="hover" class="search-panel" :class="{ 'is-collapsed': !showSearch }">
        <template #header>
          <div class="panel-heading search-panel-toggle" @click.stop="showSearch = !showSearch">
            <div><h3>Order filters</h3></div>
          </div>
        </template>
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form">
          <el-form-item label="Order No" prop="orderNo">
            <el-input v-model="queryParams.orderNo" placeholder="Order No" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="Customer" prop="customerKeyword">
            <el-input v-model="queryParams.customerKeyword" placeholder="Email / username" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="Tour" prop="tourName">
            <el-input v-model="queryParams.tourName" placeholder="Tour name" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="Status" prop="status">
            <el-select v-model="queryParams.status" placeholder="Status" clearable>
              <el-option v-for="item in orderStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="Created">
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
            <h3>Orders</h3>
          </div>
          <div class="toolbar-actions">
            <right-toolbar v-model:show-search="showSearch" :search="false" @query-table="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" border class="data-table" :data="orderList">
        <el-table-column label="Order No" align="center" prop="orderNo" min-width="180" show-overflow-tooltip />
        <el-table-column label="Tour" align="center" prop="tourName" min-width="220" show-overflow-tooltip />
        <el-table-column label="Departure" align="center" prop="departureDate" width="130">
          <template #default="scope">
            <span>{{ parseTime(scope.row.departureDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Customer" align="center" min-width="210" show-overflow-tooltip>
          <template #default="scope">
            <div>{{ scope.row.customerEmail || scope.row.customerUsername }}</div>
            <div class="muted">{{ scope.row.customerUsername }}</div>
          </template>
        </el-table-column>
        <el-table-column label="Travellers" align="center" prop="travelerCount" width="110" />
        <el-table-column label="Amount" align="center" width="140">
          <template #default="scope">
            <span>{{ formatMoney(scope.row.totalAmount, scope.row.currency) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Status" align="center" prop="status" width="150">
          <template #default="scope">
            <el-tag :type="statusTagType(scope.row.status)">{{ orderStatusLabel(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Created" align="center" prop="createTime" width="170">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Action" align="center" width="90" fixed="right">
          <template #default="scope">
            <el-tooltip content="View" placement="top">
              <el-button v-hasPermi="['boxhilltravel_manager:order:query']" link type="primary" icon="View" @click="handleView(scope.row)" />
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

    <el-drawer v-model="detailVisible" title="Order detail" size="72%" append-to-body destroy-on-close>
      <div v-if="detail" class="order-detail">
        <el-card shadow="never">
          <template #header>
            <div class="detail-header">
              <div>
                <h3>{{ detail.orderNo }}</h3>
                <p>{{ detail.tourName }}</p>
              </div>
              <el-tag :type="statusTagType(detail.status)">{{ orderStatusLabel(detail.status) }}</el-tag>
            </div>
          </template>
          <el-descriptions :column="3" border>
            <el-descriptions-item label="Departure">{{ parseTime(detail.departureDate, '{y}-{m}-{d}') }}</el-descriptions-item>
            <el-descriptions-item label="Return">{{ parseTime(detail.returnDate, '{y}-{m}-{d}') }}</el-descriptions-item>
            <el-descriptions-item label="Travellers">{{ detail.travelerCount }}</el-descriptions-item>
            <el-descriptions-item label="Created">{{ parseTime(detail.createTime) }}</el-descriptions-item>
            <el-descriptions-item label="Terms">{{ detail.termsAccepted ? 'Accepted' : 'No' }}</el-descriptions-item>
            <el-descriptions-item label="Payment">{{ detail.payment?.status || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card shadow="never">
          <template #header><h3>Booking account</h3></template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="User ID">{{ detail.customerUserId }}</el-descriptions-item>
            <el-descriptions-item label="Username">{{ detail.customerUsername }}</el-descriptions-item>
            <el-descriptions-item label="Email">{{ detail.customerEmail }}</el-descriptions-item>
            <el-descriptions-item label="Contact">{{ detail.contactName }}</el-descriptions-item>
            <el-descriptions-item label="Contact email">{{ detail.contactEmail }}</el-descriptions-item>
            <el-descriptions-item label="Phone">{{ detail.contactPhone }}</el-descriptions-item>
            <el-descriptions-item label="Address" :span="2">
              {{ compact([detail.contactAddress, detail.contactCity, detail.contactRegion, detail.contactPostalCode, detail.contactCountry]) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card shadow="never">
          <template #header><h3>Price & extras</h3></template>
          <el-descriptions :column="4" border>
            <el-descriptions-item label="Unit">{{ formatMoney(detail.unitPrice, detail.currency) }}</el-descriptions-item>
            <el-descriptions-item label="Tour">{{ formatMoney(detail.tourAmount, detail.currency) }}</el-descriptions-item>
            <el-descriptions-item label="Extras">{{ formatMoney(detail.extrasAmount, detail.currency) }}</el-descriptions-item>
            <el-descriptions-item label="Total">{{ formatMoney(detail.totalAmount, detail.currency) }}</el-descriptions-item>
          </el-descriptions>
          <el-table v-if="detail.extras?.length" :data="detail.extras" border class="mt-3">
            <el-table-column label="Type" prop="extraType" width="180" />
            <el-table-column label="Title" prop="title" min-width="180" show-overflow-tooltip />
            <el-table-column label="Description" prop="description" min-width="220" show-overflow-tooltip />
            <el-table-column label="Amount" width="120">
              <template #default="scope">{{ formatMoney(scope.row.amount, detail?.currency) }}</template>
            </el-table-column>
          </el-table>
        </el-card>

        <el-card shadow="never">
          <template #header><h3>Travellers</h3></template>
          <div class="traveller-layout">
            <div class="traveller-list">
              <button
                v-for="traveller in detail.travelers || []"
                :key="traveller.id"
                class="traveller-card"
                :class="{ active: selectedTraveler?.id === traveller.id }"
                @click="selectedTraveler = traveller"
              >
                <strong>Traveller {{ traveller.travelerNo }} · {{ fullName(traveller) }}</strong>
                <el-tag v-if="traveller.primaryTraveler" size="small" type="primary">Primary traveller</el-tag>
                <span>{{ compact([traveller.email, traveller.phone]) }}</span>
              </button>
            </div>
            <div v-if="selectedTraveler" class="traveller-detail">
              <h4>Basic</h4>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="Name">{{ fullName(selectedTraveler) }}</el-descriptions-item>
                <el-descriptions-item label="Birth date">{{ parseTime(selectedTraveler.dateOfBirth, '{y}-{m}-{d}') }}</el-descriptions-item>
                <el-descriptions-item label="Nationality">{{ selectedTraveler.nationality }}</el-descriptions-item>
                <el-descriptions-item label="Place of birth">{{ selectedTraveler.placeOfBirth || '-' }}</el-descriptions-item>
              </el-descriptions>
              <h4>Contact</h4>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="Email">{{ selectedTraveler.email || '-' }}</el-descriptions-item>
                <el-descriptions-item label="Phone">{{ selectedTraveler.phone || '-' }}</el-descriptions-item>
              </el-descriptions>
              <h4>Passport</h4>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="Passport No">{{ selectedTraveler.passportNumber || '-' }}</el-descriptions-item>
                <el-descriptions-item label="Expiry">{{ parseTime(selectedTraveler.passportExpiryDate, '{y}-{m}-{d}') }}</el-descriptions-item>
              </el-descriptions>
              <h4>Address</h4>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="Address">
                  {{ compact([selectedTraveler.address, selectedTraveler.city, selectedTraveler.region, selectedTraveler.postalCode, selectedTraveler.country]) }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </el-card>
      </div>
    </el-drawer>
  </div>
</template>

<script setup name="Order" lang="ts">
import { getOrder, listOrder } from '@/api/boxhilltravel_manager/order';
import type { OrderQuery, OrderTravelerVO, OrderVO } from '@/api/boxhilltravel_manager/order/types';
import { useLoading } from '@/hooks/async/useLoading';
import { useDateRangeQuery } from '@/hooks/form/useDateRangeQuery';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useSearchToggle } from '@/hooks/form/useSearchToggle';
import { useDict } from '@/utils/dict';
import { parseTime } from '@/utils/ruoyi';

const { holidays_currency_unit } = toRefs<any>(useDict('holidays_currency_unit'));

const orderStatusOptions = [
  { label: 'Pending payment', value: 'PENDING_PAYMENT' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'Refunded', value: 'REFUNDED' }
];

const orderList = ref<OrderVO[]>([]);
const detail = ref<OrderVO>();
const selectedTraveler = ref<OrderTravelerVO>();
const detailVisible = ref(false);
const total = ref(0);
const queryFormRef = ref<ElFormInstance>();
const { loading, withLoading } = useLoading(true);
const { showSearch } = useSearchToggle();
const { dateRange, applyDateRange, resetDateRange } = useDateRangeQuery('CreateTime');

const queryParams = ref<OrderQuery>({
  pageNum: 1,
  pageSize: 10,
  orderNo: '',
  customerKeyword: '',
  tourName: '',
  status: '',
  params: {}
});

const getList = async () => {
  await withLoading(async () => {
    const res = await listOrder(applyDateRange(queryParams.value));
    orderList.value = res.data?.rows || [];
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

const handleView = async (row: OrderVO) => {
  const res = await getOrder(row.id);
  detail.value = res.data;
  selectedTraveler.value = detail.value.travelers?.[0];
  detailVisible.value = true;
};

const orderStatusLabel = (status?: string) => orderStatusOptions.find(item => item.value === status)?.label || status || '-';

const statusTagType = (status?: string) => {
  if (status === 'PENDING_PAYMENT') return 'warning';
  if (status === 'PAID' || status === 'CONFIRMED') return 'success';
  if (status === 'CANCELLED' || status === 'REFUNDED') return 'info';
  return '';
};

const resolveCurrencyCode = (currency?: string) => {
  const dictLabel = holidays_currency_unit.value.find((item: DictDataOption) => String(item.value) === String(currency))?.label;
  const code = dictLabel || currency || 'AUD';
  return /^[A-Z]{3}$/.test(code) ? code : 'AUD';
};

const formatMoney = (amount?: number, currency = 'AUD') => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: resolveCurrencyCode(currency)
  }).format(Number(amount || 0));
};

const compact = (values: Array<string | undefined>) => values.filter(Boolean).join(' / ') || '-';

const fullName = (traveller: OrderTravelerVO) => {
  return compact([traveller.title, traveller.firstName, traveller.middleName, traveller.lastName]).replaceAll(' / ', ' ');
};

onMounted(() => {
  getList();
});
</script>

<style scoped>
.muted {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.order-detail {
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

.traveller-layout {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 16px;
}

.traveller-list {
  display: grid;
  gap: 10px;
  align-content: start;
}

.traveller-card {
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: #fff;
  padding: 12px;
  text-align: left;
  display: grid;
  gap: 6px;
  cursor: pointer;
}

.traveller-card.active {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.traveller-card span {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.traveller-detail {
  display: grid;
  gap: 12px;
}

.traveller-detail h4 {
  margin: 8px 0 0;
}

.mt-3 {
  margin-top: 12px;
}

@media (max-width: 1100px) {
  .traveller-layout {
    grid-template-columns: 1fr;
  }
}
</style>
