<template>
  <div class="p-2 page-shell boxhilltravel_manager-order-page">
    <div class="search-wrap">
      <el-card shadow="hover" class="search-panel" :class="{ 'is-collapsed': !showSearch }">
        <template #header>
          <div class="panel-heading search-panel-toggle" @click.stop="showSearch = !showSearch">
            <div>
              <h3>{{ bt('orderFilters') }}</h3>
            </div>
          </div>
        </template>
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form">
          <el-form-item :label="bt('orderNo')" prop="orderNo">
            <el-input v-model="queryParams.orderNo" :placeholder="bt('orderNo')" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item :label="bt('customer')" prop="customerKeyword">
            <el-input
              v-model="queryParams.customerKeyword"
              :placeholder="bt('emailUsername')"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item :label="bt('tour')" prop="tourName">
            <el-input
              v-model="queryParams.tourName"
              :placeholder="bt('tourName')"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item :label="bt('status')" prop="status">
            <el-select v-model="queryParams.status" :placeholder="bt('status')" clearable>
              <el-option v-for="item in orderStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item :label="bt('created')">
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
            <h3>{{ bt('orders') }}</h3>
          </div>
          <div class="toolbar-actions">
            <right-toolbar v-model:show-search="showSearch" :search="false" @query-table="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" border class="data-table" :data="orderList">
        <el-table-column :label="bt('orderNo')" align="center" prop="orderNo" min-width="180" show-overflow-tooltip />
        <el-table-column :label="bt('tour')" align="center" prop="tourName" min-width="220" show-overflow-tooltip />
        <el-table-column :label="bt('departure')" align="center" prop="departureDate" width="130">
          <template #default="scope">
            <span>{{ parseTime(scope.row.departureDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="bt('customer')" align="center" min-width="210" show-overflow-tooltip>
          <template #default="scope">
            <div>{{ scope.row.customerEmail || scope.row.customerUsername }}</div>
            <div class="muted">{{ scope.row.customerUsername }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="bt('travellers')" align="center" prop="travelerCount" width="110" />
        <el-table-column :label="bt('amount')" align="center" width="140">
          <template #default="scope">
            <span>{{ formatMoney(scope.row.totalAmount, scope.row.currency) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="bt('status')" align="center" prop="status" width="150">
          <template #default="scope">
            <el-tag :type="statusTagType(scope.row.status)">{{ orderStatusLabel(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="bt('created')" align="center" prop="createTime" width="170">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="bt('action')" align="center" width="150" fixed="right">
          <template #default="scope">
            <el-tooltip :content="bt('view')" placement="top">
              <el-button
                v-hasPermi="['boxhilltravel_manager:order:query']"
                link
                type="primary"
                icon="View"
                @click="handleView(scope.row)"
              />
            </el-tooltip>
            <el-tooltip v-if="canRefund(scope.row as OrderVO)" :content="bt('refundOrder')" placement="top">
              <el-button
                v-hasPermi="['boxhilltravel_manager:order:refund']"
                link
                type="warning"
                icon="RefreshLeft"
                :aria-label="bt('refundOrder')"
                :disabled="refundOpening || refundSubmitting"
                @click="handleRefund(scope.row as OrderVO)"
              />
            </el-tooltip>
            <el-tooltip v-if="canMarkCompleted(scope.row.status)" :content="bt('markTraveled')" placement="top">
              <el-button
                v-hasPermi="['boxhilltravel_manager:order:edit']"
                link
                type="success"
                icon="Finished"
                @click="handleMarkCompleted(scope.row)"
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

    <el-drawer v-model="detailVisible" :title="bt('orderDetail')" size="72%" append-to-body destroy-on-close>
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
            <el-descriptions-item :label="bt('departure')">
              {{ parseTime(detail.departureDate, '{y}-{m}-{d}') }}
            </el-descriptions-item>
            <el-descriptions-item :label="bt('return')">
              {{ parseTime(detail.returnDate, '{y}-{m}-{d}') }}
            </el-descriptions-item>
            <el-descriptions-item :label="bt('travellers')">{{ detail.travelerCount }}</el-descriptions-item>
            <el-descriptions-item :label="bt('created')">{{ parseTime(detail.createTime) }}</el-descriptions-item>
            <el-descriptions-item :label="bt('terms')">
              {{ detail.termsAccepted ? bt('accepted') : bt('no') }}
            </el-descriptions-item>
            <el-descriptions-item :label="bt('payment')">
              {{ paymentStatusLabel(detail.payment?.status) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card shadow="never">
          <template #header>
            <h3>{{ bt('bookingAccount') }}</h3>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item :label="bt('userId')">{{ detail.customerUserId }}</el-descriptions-item>
            <el-descriptions-item :label="bt('username')">{{ detail.customerUsername }}</el-descriptions-item>
            <el-descriptions-item :label="bt('email')">{{ detail.customerEmail }}</el-descriptions-item>
            <el-descriptions-item :label="bt('contact')">{{ detail.contactName }}</el-descriptions-item>
            <el-descriptions-item :label="bt('contactEmail')">{{ detail.contactEmail }}</el-descriptions-item>
            <el-descriptions-item :label="bt('phone')">{{ detail.contactPhone }}</el-descriptions-item>
            <el-descriptions-item :label="bt('address')" :span="2">
              {{
                compact([
                  detail.contactAddress,
                  detail.contactCity,
                  detail.contactRegion,
                  detail.contactPostalCode,
                  detail.contactCountry
                ])
              }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card shadow="never">
          <template #header>
            <h3>{{ bt('priceExtras') }}</h3>
          </template>
          <el-descriptions :column="4" border>
            <el-descriptions-item :label="bt('unit')">
              {{ formatMoney(detail.unitPrice, detail.currency) }}
            </el-descriptions-item>
            <el-descriptions-item :label="bt('tour')">
              {{ formatMoney(detail.tourAmount, detail.currency) }}
            </el-descriptions-item>
            <el-descriptions-item :label="bt('extras')">
              {{ formatMoney(detail.extrasAmount, detail.currency) }}
            </el-descriptions-item>
            <el-descriptions-item :label="bt('totalAmount')">
              {{ formatMoney(detail.totalAmount, detail.currency) }}
            </el-descriptions-item>
          </el-descriptions>
          <el-table v-if="detail.extras?.length" :data="detail.extras" border class="mt-3">
            <el-table-column :label="bt('type')" prop="extraType" width="180" />
            <el-table-column :label="bt('title')" prop="title" min-width="180" show-overflow-tooltip />
            <el-table-column :label="bt('description')" prop="description" min-width="220" show-overflow-tooltip />
            <el-table-column :label="bt('amount')" width="120">
              <template #default="scope">{{ formatMoney(scope.row.amount, detail?.currency) }}</template>
            </el-table-column>
          </el-table>
        </el-card>

        <el-card v-loading="refundRefreshing" shadow="never">
          <template #header>
            <div class="detail-header">
              <h3>{{ bt('refundRecords') }}</h3>
              <div>
                <el-button
                  :loading="refundRefreshing"
                  :disabled="refundSubmitting"
                  icon="Refresh"
                  @click="refreshRefundDetail"
                >
                  {{ bt('refreshRefunds') }}
                </el-button>
                <el-button
                  v-if="canRefund(detail)"
                  v-hasPermi="['boxhilltravel_manager:order:refund']"
                  type="warning"
                  icon="RefreshLeft"
                  :disabled="refundOpening || refundSubmitting || detailRefundBalance.available <= 0"
                  @click="handleRefund(detail)"
                >
                  {{ bt('refundOrder') }}
                </el-button>
              </div>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item :label="bt('paidAmount')">
              {{ formatMoney(detail.paidAmount, orderCurrency(detail)) }}
            </el-descriptions-item>
            <el-descriptions-item :label="bt('refundedAmount')">
              {{ formatMinorMoney(detailRefundBalance.refunded, detail) }}
            </el-descriptions-item>
            <el-descriptions-item :label="bt('pendingRefundAmount')">
              {{ formatMinorMoney(detailRefundBalance.pending, detail) }}
            </el-descriptions-item>
            <el-descriptions-item :label="bt('refundableAmount')">
              {{ formatMinorMoney(detailRefundBalance.available, detail) }}
            </el-descriptions-item>
          </el-descriptions>
          <p class="muted">{{ bt('refundStatusNotice') }}</p>
          <el-table :data="detail.refunds || []" border>
            <el-table-column
              :label="bt('stripeRefundId')"
              prop="stripeRefundId"
              min-width="210"
              show-overflow-tooltip
            />
            <el-table-column :label="bt('refundAmount')" min-width="135">
              <template #default="scope">{{ formatMoney(scope.row.amount, scope.row.currency) }}</template>
            </el-table-column>
            <el-table-column :label="bt('status')" width="125">
              <template #default="scope">
                <el-tag :type="refundStatusTagType(scope.row.status)">{{ refundStatusLabel(scope.row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="bt('refundReason')" prop="reason" min-width="180" show-overflow-tooltip />
            <el-table-column :label="bt('created')" width="170">
              <template #default="scope">{{ parseTime(scope.row.createTime) }}</template>
            </el-table-column>
          </el-table>
        </el-card>

        <el-card shadow="never">
          <template #header>
            <h3>{{ bt('travellers') }}</h3>
          </template>
          <div class="traveller-layout">
            <div class="traveller-list">
              <button
                v-for="traveller in detail.travelers || []"
                :key="traveller.id"
                class="traveller-card"
                :class="{ active: selectedTraveler?.id === traveller.id }"
                @click="selectedTraveler = traveller"
              >
                <strong>{{ bt('travellerLabel', { no: traveller.travelerNo }) }} - {{ fullName(traveller) }}</strong>
                <el-tag v-if="traveller.primaryTraveler" size="small" type="primary">
                  {{ bt('primaryTraveller') }}
                </el-tag>
                <span>{{ compact([traveller.email, traveller.phone]) }}</span>
              </button>
            </div>
            <div v-if="selectedTraveler" class="traveller-detail">
              <h4>{{ bt('basic') }}</h4>
              <el-descriptions :column="2" border>
                <el-descriptions-item :label="bt('name')">{{ fullName(selectedTraveler) }}</el-descriptions-item>
                <el-descriptions-item :label="bt('birthDate')">
                  {{ parseTime(selectedTraveler.dateOfBirth, '{y}-{m}-{d}') }}
                </el-descriptions-item>
                <el-descriptions-item :label="bt('nationality')">
                  {{ selectedTraveler.nationality }}
                </el-descriptions-item>
                <el-descriptions-item :label="bt('placeOfBirth')">
                  {{ selectedTraveler.placeOfBirth || '-' }}
                </el-descriptions-item>
              </el-descriptions>
              <h4>{{ bt('contact') }}</h4>
              <el-descriptions :column="2" border>
                <el-descriptions-item :label="bt('email')">{{ selectedTraveler.email || '-' }}</el-descriptions-item>
                <el-descriptions-item :label="bt('phone')">{{ selectedTraveler.phone || '-' }}</el-descriptions-item>
              </el-descriptions>
              <h4>{{ bt('passport') }}</h4>
              <el-descriptions :column="2" border>
                <el-descriptions-item :label="bt('passportNo')">
                  {{ selectedTraveler.passportNumber || '-' }}
                </el-descriptions-item>
                <el-descriptions-item :label="bt('expiry')">
                  {{ parseTime(selectedTraveler.passportExpiryDate, '{y}-{m}-{d}') }}
                </el-descriptions-item>
              </el-descriptions>
              <h4>{{ bt('address') }}</h4>
              <el-descriptions :column="1" border>
                <el-descriptions-item :label="bt('address')">
                  {{
                    compact([
                      selectedTraveler.address,
                      selectedTraveler.city,
                      selectedTraveler.region,
                      selectedTraveler.postalCode,
                      selectedTraveler.country
                    ])
                  }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </el-card>
      </div>
    </el-drawer>

    <el-dialog
      v-model="refundDialog.visible"
      :title="refundDialog.title"
      width="560px"
      append-to-body
      destroy-on-close
      :close-on-click-modal="!refundSubmitting"
      :close-on-press-escape="!refundSubmitting"
      :show-close="!refundSubmitting"
    >
      <template v-if="refundDetail">
        <el-descriptions :column="1" border>
          <el-descriptions-item :label="bt('orderNo')">{{ refundDetail.orderNo }}</el-descriptions-item>
          <el-descriptions-item :label="bt('paidAmount')">
            {{ formatMoney(refundDetail.paidAmount, orderCurrency(refundDetail)) }}
          </el-descriptions-item>
          <el-descriptions-item :label="bt('refundedAmount')">
            {{ formatMinorMoney(refundBalance.refunded, refundDetail) }}
          </el-descriptions-item>
          <el-descriptions-item :label="bt('pendingRefundAmount')">
            {{ formatMinorMoney(refundBalance.pending, refundDetail) }}
          </el-descriptions-item>
          <el-descriptions-item :label="bt('refundableAmount')">
            {{ formatMinorMoney(refundBalance.available, refundDetail) }}
          </el-descriptions-item>
        </el-descriptions>
        <el-form
          ref="refundFormRef"
          :model="refundForm"
          :rules="refundRules"
          :disabled="refundSubmitting"
          label-position="top"
          class="mt-3"
        >
          <el-form-item :label="bt('refundMode')">
            <el-radio-group v-model="refundMode">
              <el-radio value="full">{{ bt('fullRefund') }}</el-radio>
              <el-radio value="partial">{{ bt('partialRefund') }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="bt('refundAmount')" prop="amount">
            <el-input v-model="refundForm.amount" inputmode="decimal" :readonly="refundMode === 'full'">
              <template #append>{{ orderCurrency(refundDetail) }}</template>
            </el-input>
          </el-form-item>
          <el-form-item :label="bt('refundReason')" prop="reason">
            <el-input v-model="refundForm.reason" type="textarea" :rows="3" maxlength="500" show-word-limit />
          </el-form-item>
        </el-form>
      </template>
      <template #footer>
        <el-button :disabled="refundSubmitting" @click="closeRefundDialog">{{ bt('cancel') }}</el-button>
        <el-button type="warning" :loading="refundSubmitting" @click="submitRefund">
          {{ bt('confirmRefundAction') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Order" lang="ts">
import type { FormRules, TagProps } from 'element-plus';
import type {
  OrderAmount,
  OrderQuery,
  OrderRefundForm,
  OrderTravelerVO,
  OrderVO,
  PaymentStatus,
  RefundStatus
} from '@/api/boxhilltravel_manager/order/types';
import {
  getOrder,
  listOrder,
  listOrderRefunds,
  markOrderCompleted,
  refundOrder
} from '@/api/boxhilltravel_manager/order';
import { useLoading } from '@/hooks/async/useLoading';
import { useFormDialog } from '@/hooks/dialog/useFormDialog';
import { useDateRangeQuery } from '@/hooks/form/useDateRangeQuery';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useSearchToggle } from '@/hooks/form/useSearchToggle';
import modal from '@/plugins/modal';
import { useDict } from '@/utils/dict';
import { parseTime } from '@/utils/ruoyi';
import { useBoxhillI18n } from '../useBoxhillI18n';
import { getRefundBalance, minorToAmount, moneyToMinor, refundAmountError } from './refund';

const { bt } = useBoxhillI18n();
const { holidays_currency_unit } = toRefs<any>(useDict('holidays_currency_unit'));

const ORDER_STATUS_PAID = 1;
const ORDER_STATUS_CONFIRMED = 2;
const ORDER_STATUS_COMPLETED = 3;

const orderStatusOptions = computed(() => [
  { label: bt('pendingPayment'), value: 0 },
  { label: bt('paid'), value: ORDER_STATUS_PAID },
  { label: bt('confirmed'), value: ORDER_STATUS_CONFIRMED },
  { label: bt('completed'), value: ORDER_STATUS_COMPLETED },
  { label: bt('cancelled'), value: 4 },
  { label: bt('refunded'), value: 5 }
]);

const orderList = ref<OrderVO[]>([]);
const detail = ref<OrderVO>();
const selectedTraveler = ref<OrderTravelerVO>();
const detailVisible = ref(false);
const total = ref(0);
const queryFormRef = ref<ElFormInstance>();
const refundDetail = ref<OrderVO>();
const refundFormRef = ref<ElFormInstance>();
const refundForm = ref<OrderRefundForm>({ amount: '', reason: '' });
const refundMode = ref<'full' | 'partial'>('full');
const refundOpening = ref(false);
const refundSubmitting = ref(false);
const refundRefreshing = ref(false);
const {
  dialog: refundDialog,
  openDialog: openRefundDialog,
  closeDialog: closeRefundDialog
} = useFormDialog({
  form: refundForm,
  formRef: refundFormRef,
  initialFormData: { amount: '', reason: '' }
});
const refundFractionDigits = computed(() => currencyFractionDigits(orderCurrency(refundDetail.value)));
const refundBalance = computed(() => getRefundBalance(refundDetail.value, refundFractionDigits.value));
const detailRefundBalance = computed(() =>
  getRefundBalance(detail.value, currencyFractionDigits(orderCurrency(detail.value)))
);
const refundRules = computed<FormRules<OrderRefundForm>>(() => ({
  amount: [
    {
      validator: (_rule, value, callback) => {
        const error = refundAmountError(value, refundBalance.value.available, refundFractionDigits.value);
        callback(
          error
            ? new Error(
                bt(error, {
                  digits: refundFractionDigits.value,
                  amount: formatMinorMoney(refundBalance.value.available, refundDetail.value)
                })
              )
            : undefined
        );
      },
      trigger: 'blur'
    }
  ],
  reason: [
    {
      validator: (_rule, value, callback) =>
        callback(String(value || '').trim() ? undefined : new Error(bt('refundReasonRequired'))),
      trigger: 'blur'
    }
  ]
}));
const { loading, withLoading } = useLoading(true);
const { showSearch } = useSearchToggle();
const { dateRange, applyDateRange, resetDateRange } = useDateRangeQuery('CreateTime');

const queryParams = ref<OrderQuery>({
  pageNum: 1,
  pageSize: 10,
  orderNo: '',
  customerKeyword: '',
  tourName: '',
  status: undefined,
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

const handleView = async (row: OrderVO | any) => {
  const res = await getOrder(row.id);
  detail.value = res.data;
  selectedTraveler.value = detail.value.travelers?.[0];
  detailVisible.value = true;
};

const fetchOrderWithRefunds = async (id: string | number): Promise<OrderVO> => {
  const [orderResponse, refundsResponse] = await Promise.all([getOrder(id), listOrderRefunds(id)]);
  return { ...orderResponse.data, refunds: refundsResponse.data || [] };
};

const updateOpenDetail = (order: OrderVO) => {
  if (!detailVisible.value || detail.value?.id !== order.id) return;
  const travelerId = selectedTraveler.value?.id;
  detail.value = order;
  selectedTraveler.value = order.travelers?.find(item => item.id === travelerId) || order.travelers?.[0];
};

const refreshRefundDetail = async () => {
  if (!detail.value || refundRefreshing.value) return;
  refundRefreshing.value = true;
  try {
    updateOpenDetail(await fetchOrderWithRefunds(detail.value.id));
  } finally {
    refundRefreshing.value = false;
  }
};

const canRefund = (order: OrderVO) =>
  order.status !== 5 && Number(order.paidAmount) > Number(order.refundedAmount || 0);

const handleRefund = async (row: OrderVO) => {
  if (refundOpening.value || refundSubmitting.value) return;
  refundOpening.value = true;
  try {
    const order = await fetchOrderWithRefunds(row.id);
    updateOpenDetail(order);
    refundDetail.value = order;
    if (!order.payment?.stripePaymentIntentId) {
      modal.msgWarning(bt('refundPaymentMissing'));
      return;
    }
    if (!canRefund(order) || refundBalance.value.available <= 0 || !orderCurrency(order)) {
      modal.msgWarning(bt('refundUnavailable'));
      return;
    }
    openRefundDialog(bt('refundOrder'));
    refundMode.value = 'full';
    refundForm.value.amount = minorToAmount(refundBalance.value.available, refundFractionDigits.value);
  } finally {
    refundOpening.value = false;
  }
};

watch(refundMode, mode => {
  refundForm.value.amount =
    mode === 'full' ? minorToAmount(refundBalance.value.available, refundFractionDigits.value) : '';
  refundFormRef.value?.clearValidate('amount');
});

const submitRefund = async () => {
  if (refundSubmitting.value || !refundDetail.value) return;
  const valid = await refundFormRef.value?.validate().catch(() => false);
  if (!valid || refundSubmitting.value || !refundDialog.visible) return;
  refundSubmitting.value = true;
  try {
    // Refresh the balance before confirming, in case another manager has requested a refund.
    const order = await fetchOrderWithRefunds(refundDetail.value.id);
    refundDetail.value = order;
    updateOpenDetail(order);
    if (!canRefund(order) || !order.payment?.stripePaymentIntentId || !orderCurrency(order)) {
      modal.msgWarning(bt('refundUnavailable'));
      return;
    }
    if (!(await refundFormRef.value.validate().catch(() => false))) return;
    const confirmed = await modal
      .confirm(
        bt('confirmRefund', {
          orderNo: order.orderNo,
          amount: formatMoney(refundForm.value.amount, orderCurrency(order))
        })
      )
      .then(
        () => true,
        () => false
      );
    if (!confirmed) return;
    const response = await refundOrder(order.id, {
      amount: minorToAmount(
        moneyToMinor(refundForm.value.amount, refundFractionDigits.value),
        refundFractionDigits.value
      ),
      reason: refundForm.value.reason.trim()
    });
    if (response.data) {
      const updatedOrder = {
        ...order,
        refunds: [response.data, ...(order.refunds || []).filter(item => item.id !== response.data.id)]
      };
      refundDetail.value = updatedOrder;
      updateOpenDetail(updatedOrder);
    }
    closeRefundDialog();
    modal.msgSuccess(bt('refundSubmitted'));
    await Promise.allSettled([
      getList(),
      fetchOrderWithRefunds(order.id).then(updated => {
        refundDetail.value = updated;
        updateOpenDetail(updated);
      })
    ]);
  } finally {
    refundSubmitting.value = false;
  }
};

const canMarkCompleted = (status?: number) => status === ORDER_STATUS_PAID || status === ORDER_STATUS_CONFIRMED;

const handleMarkCompleted = async (row: OrderVO | any) => {
  await modal.confirm(bt('confirmMarkTraveled', { orderNo: row.orderNo }));
  await markOrderCompleted(row.id);
  modal.msgSuccess(bt('markedAsTraveled'));
  await getList();
  if (detailVisible.value && detail.value?.id === row.id) {
    const res = await getOrder(row.id);
    detail.value = res.data;
    selectedTraveler.value = detail.value.travelers?.[0];
  }
};

const orderStatusLabel = (status?: number) =>
  orderStatusOptions.value.find(item => item.value === status)?.label || '-';

const statusTagType = (status?: number): TagProps['type'] => {
  if (status === 0) return 'warning';
  if (status === ORDER_STATUS_PAID || status === ORDER_STATUS_CONFIRMED || status === ORDER_STATUS_COMPLETED)
    return 'success';
  if (status === 4 || status === 5) return 'info';
  return undefined;
};

const resolveCurrencyCode = (currency?: string) => {
  const dictLabel = holidays_currency_unit.value?.find(
    (item: DictDataOption) => String(item.value) === String(currency)
  )?.label;
  const code = String(dictLabel || currency || '')
    .trim()
    .toUpperCase();
  return /^[A-Z]{3}$/.test(code) ? code : '';
};

const orderCurrency = (order?: OrderVO) => resolveCurrencyCode(order?.payment?.currency || order?.currency);

const currencyFractionDigits = (currency: string) =>
  currency
    ? new Intl.NumberFormat('en-AU', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits
    : 2;

const formatMinorMoney = (amount: number, order?: OrderVO) => {
  const currency = orderCurrency(order);
  return formatMoney(minorToAmount(amount, currencyFractionDigits(currency)), currency);
};

const formatMoney = (amount?: OrderAmount, currency?: string) => {
  const code = resolveCurrencyCode(currency);
  if (!code) return `${amount ?? '-'} ${currency || ''}`.trim();
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: code
  }).format(Number(amount || 0));
};

const paymentStatusLabel = (status?: PaymentStatus) => {
  const keys: Record<PaymentStatus, string> = {
    PENDING: 'pendingPayment',
    CHECKOUT_CREATED: 'pendingPayment',
    PROCESSING: 'paymentProcessing',
    PAID: 'paid',
    PAYMENT_FAILED: 'paymentFailed',
    EXPIRED: 'paymentExpired',
    PARTIALLY_REFUNDED: 'partiallyRefunded',
    REFUNDED: 'refunded'
  };
  return status ? (keys[status] ? bt(keys[status]) : status) : '-';
};

const refundStatusLabel = (status: RefundStatus) => {
  const keys: Record<RefundStatus, string> = {
    PENDING: 'refundPending',
    SUCCEEDED: 'refundSucceeded',
    FAILED: 'refundFailed',
    CANCELED: 'refundCanceled'
  };
  return keys[status] ? bt(keys[status]) : status;
};

const refundStatusTagType = (status: RefundStatus): TagProps['type'] => {
  if (status === 'SUCCEEDED') return 'success';
  if (status === 'FAILED') return 'danger';
  return status === 'CANCELED' ? 'info' : 'warning';
};

const compact = (values: Array<string | undefined>) => values.filter(Boolean).join(' / ') || '-';

const fullName = (traveller: OrderTravelerVO) => {
  return compact([traveller.title, traveller.firstName, traveller.middleName, traveller.lastName]).replaceAll(
    ' / ',
    ' '
  );
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
