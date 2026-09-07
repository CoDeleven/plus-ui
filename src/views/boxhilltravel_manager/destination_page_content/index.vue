<template>
  <div class="p-2 destination-page-content-page">
    <el-card v-show="showSearch" shadow="hover" class="mb-3">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item :label="bt('country')" prop="destinationName">
          <el-input v-model="queryParams.destinationName" :placeholder="bt('searchCountry')" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item :label="bt('status')" prop="status">
          <el-select v-model="queryParams.status" :placeholder="bt('all')" clearable class="!w-36">
            <el-option :label="bt('draft')" :value="0" />
            <el-option :label="bt('published')" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">{{ bt('search') }}</el-button>
          <el-button icon="Refresh" @click="resetQuery">{{ bt('reset') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-base font-semibold">{{ bt('destinationPageContent') }}</span>
          <div class="flex items-center gap-2">
            <el-button v-hasPermi="['boxhilltravel_manager:destination_page_content:add']" type="primary" plain icon="Plus" @click="handleAdd">{{ bt('add') }}</el-button>
            <el-button
              v-hasPermi="['boxhilltravel_manager:destination_page_content:remove']"
              type="danger"
              plain
              icon="Delete"
              :disabled="multiple"
              @click="handleDelete()"
            >
              Delete
            </el-button>
            <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="contentList" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column :label="bt('cover')" align="center" width="88">
          <template #default="scope">
            <image-preview v-if="scope.row.destinationImageUrl" :src="scope.row.destinationImageUrl" :width="52" :height="52" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column :label="bt('country')" min-width="180" show-overflow-tooltip>
          <template #default="scope">
            <div class="font-medium text-gray-900">{{ scope.row.destinationNameEn || scope.row.destinationName || '-' }}</div>
            <div class="text-xs text-gray-500">{{ scope.row.regionNameEn || scope.row.regionName || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="bt('currency')" min-width="110" show-overflow-tooltip>
          <template #default="scope">{{ getDictLabel(currencyOptions, scope.row.currencyDictValue) }}</template>
        </el-table-column>
        <el-table-column :label="bt('language')" min-width="120" show-overflow-tooltip>
          <template #default="scope">{{ getDictLabel(languageOptions, scope.row.languageDictValue) }}</template>
        </el-table-column>
        <el-table-column :label="bt('timeZone')" min-width="120" show-overflow-tooltip>
          <template #default="scope">{{ getDictLabel(timeZoneOptions, scope.row.timeZoneDictValue) }}</template>
        </el-table-column>
        <el-table-column :label="bt('status')" align="center" width="105">
          <template #default="scope">
            <el-tag :type="Number(scope.row.status) === 1 ? 'success' : 'info'">{{ Number(scope.row.status) === 1 ? bt('published') : bt('draft') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="bt('completeness')" align="center" width="150">
          <template #default="scope">
            <el-tooltip :content="getMissingText(toRow(scope.row))" placement="top">
              <el-progress :percentage="scope.row.completeness || 0" :stroke-width="8" />
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column :label="bt('updated')" align="center" prop="updateTime" width="165">
          <template #default="scope">{{ parseTime(scope.row.updateTime, '{y}-{m}-{d} {h}:{i}') }}</template>
        </el-table-column>
        <el-table-column :label="bt('actions')" align="center" width="170" fixed="right">
          <template #default="scope">
            <el-tooltip :content="bt('edit')" placement="top">
              <el-button v-hasPermi="['boxhilltravel_manager:destination_page_content:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
            </el-tooltip>
            <el-tooltip :content="Number(scope.row.status) === 1 ? bt('unpublish') : bt('publish')" placement="top">
              <el-button
                v-hasPermi="['boxhilltravel_manager:destination_page_content:edit']"
                link
                type="primary"
                :icon="Number(scope.row.status) === 1 ? 'Close' : 'Promotion'"
                @click="handleChangeStatus(toRow(scope.row))"
              />
            </el-tooltip>
            <el-tooltip :content="bt('delete')" placement="top">
              <el-button v-hasPermi="['boxhilltravel_manager:destination_page_content:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="980px" append-to-body destroy-on-close>
      <el-form ref="contentFormRef" :model="form" :rules="rules" label-width="130px">
        <el-tabs v-model="activeTab">
          <el-tab-pane :label="bt('overview')" name="overview">
            <div class="grid grid-cols-1 gap-x-6 md:grid-cols-2">
              <el-form-item :label="bt('country')" prop="destinationId">
                <el-select
                  v-model="form.destinationId"
                  filterable
                  remote
                  clearable
                  reserve-keyword
                  :placeholder="bt('selectCountry')"
                  :remote-method="searchDestinationOptions"
                  :loading="destinationLoading"
                >
                  <el-option v-for="item in destinationOptions" :key="item.id" :label="getDestinationOptionLabel(item)" :value="item.id" />
                </el-select>
              </el-form-item>
              <el-form-item :label="bt('currency')">
                <el-select v-model="form.currencyDictValue" :placeholder="bt('selectCurrency')" filterable clearable>
                  <el-option v-for="item in currencyOptions" :key="item.dictValue" :label="item.dictLabel" :value="item.dictValue" />
                </el-select>
              </el-form-item>
              <el-form-item :label="bt('language')">
                <el-select v-model="form.languageDictValue" :placeholder="bt('selectLanguage')" filterable clearable>
                  <el-option v-for="item in languageOptions" :key="item.dictValue" :label="item.dictLabel" :value="item.dictValue" />
                </el-select>
              </el-form-item>
              <el-form-item :label="bt('timeZone')">
                <el-select v-model="form.timeZoneDictValue" :placeholder="bt('selectTimeZone')" filterable clearable>
                  <el-option v-for="item in timeZoneOptions" :key="item.dictValue" :label="item.dictLabel" :value="item.dictValue" />
                </el-select>
              </el-form-item>
              <el-form-item :label="bt('visa')">
                <el-input v-model="form.visa" maxlength="100" :placeholder="bt('shortVisaValue')" />
              </el-form-item>
              <el-form-item :label="bt('visaTitle')">
                <el-input v-model="form.visaTitle" maxlength="200" :placeholder="bt('visaTitle')" />
              </el-form-item>
              <el-form-item :label="bt('visaNote')" class="md:col-span-2">
                <el-input v-model="form.visaNote" type="textarea" :rows="3" maxlength="1000" show-word-limit :placeholder="bt('visaNote')" />
              </el-form-item>
            </div>

            <div class="content-section">
              <div class="section-title">
                <span>{{ bt('introduction') }}</span>
                <el-button type="primary" link icon="Plus" @click="addIntroduction">{{ bt('add') }}</el-button>
              </div>
              <div v-for="(_, index) in form.introduction" :key="index" class="dynamic-row">
                <el-input v-model="form.introduction![index]" type="textarea" :rows="2" :placeholder="bt('paragraph')" />
                <row-actions :index="index" :length="form.introduction?.length || 0" @move-up="moveIntroduction(index, -1)" @move-down="moveIntroduction(index, 1)" @remove="removeIntroduction(index)" />
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane :label="bt('highlights')" name="highlights">
            <div class="content-section">
              <div class="section-title">
                <span>{{ bt('highlights') }}</span>
                <el-button type="primary" link icon="Plus" @click="addHighlight">{{ bt('add') }}</el-button>
              </div>
              <div v-for="(item, index) in form.highlights" :key="index" class="dynamic-row three-col">
                <el-select v-model="item.icon" :placeholder="bt('emoji')" filterable allow-create default-first-option clearable>
                  <el-option v-for="emoji in emojiOptions" :key="emoji.value" :label="`${emoji.value} ${emoji.label}`" :value="emoji.value" />
                </el-select>
                <el-input v-model="item.title" :placeholder="bt('title')" />
                <el-input v-model="item.description" type="textarea" :rows="2" :placeholder="bt('description')" />
                <row-actions :index="index" :length="form.highlights?.length || 0" @move-up="moveHighlight(index, -1)" @move-down="moveHighlight(index, 1)" @remove="removeHighlight(index)" />
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane :label="bt('citiesAttractions')" name="cities">
            <div class="content-section">
              <div class="section-title">
                <span>{{ bt('citiesAttractions') }}</span>
                <el-button type="primary" link icon="Plus" @click="addCity">{{ bt('add') }}</el-button>
              </div>
              <div v-for="(item, index) in form.cities" :key="index" class="dynamic-row city-row">
                <el-input v-model="item.label" :placeholder="bt('label')" />
                <el-input v-model="item.name" :placeholder="bt('name')" />
                <image-upload v-model="item.image" :limit="1" />
                <el-input v-model="item.description" type="textarea" :rows="2" :placeholder="bt('description')" />
                <row-actions :index="index" :length="form.cities?.length || 0" @move-up="moveCity(index, -1)" @move-down="moveCity(index, 1)" @remove="removeCity(index)" />
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane :label="bt('practicalInfo')" name="practical">
            <div class="content-section">
              <div class="section-title">
                <span>{{ bt('practicalInfo') }}</span>
                <el-button type="primary" link icon="Plus" @click="addPracticalInfo">{{ bt('add') }}</el-button>
              </div>
              <div v-for="(item, index) in form.practicalInfo" :key="index" class="dynamic-row two-col">
                <el-input v-model="item.title" :placeholder="bt('title')" />
                <el-input v-model="item.content" type="textarea" :rows="2" :placeholder="bt('content')" />
                <row-actions :index="index" :length="form.practicalInfo?.length || 0" @move-up="movePracticalInfo(index, -1)" @move-down="movePracticalInfo(index, 1)" @remove="removePracticalInfo(index)" />
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" @click="submitForm(0)">{{ bt('saveDraft') }}</el-button>
          <el-button :loading="buttonLoading" type="primary" @click="submitForm(1)">{{ bt('publish') }}</el-button>
          <el-button @click="cancel">{{ bt('cancel') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="DestinationPageContent" lang="ts">
import { ElButton, ElTooltip } from 'element-plus';
import { defineComponent, h } from 'vue';
import {
  addDestinationPageContent,
  changeDestinationPageContentStatus,
  delDestinationPageContent,
  getDestinationPageContent,
  listDestinationPageContent,
  updateDestinationPageContent
} from '@/api/boxhilltravel_manager/destination_page_content';
import type {
  DestinationPageCity,
  DestinationPageContentForm,
  DestinationPageContentQuery,
  DestinationPageContentVO,
  DestinationPageHighlight,
  DestinationPagePracticalInfo
} from '@/api/boxhilltravel_manager/destination_page_content/types';
import { listDestination } from '@/api/boxhilltravel_manager/destination';
import type { DestinationVO } from '@/api/boxhilltravel_manager/destination/types';
import { getDicts } from '@/api/system/dict/data';
import type { DictDataVO } from '@/api/system/dict/data/types';
import { useLoading } from '@/hooks/async/useLoading';
import { useFormDialog } from '@/hooks/dialog/useFormDialog';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useSearchToggle } from '@/hooks/form/useSearchToggle';
import { useTableSelection } from '@/hooks/table/useTableSelection';
import modal from '@/plugins/modal';
import { parseTime } from '@/utils/ruoyi';
import { useBoxhillI18n } from '../useBoxhillI18n';

const { bt } = useBoxhillI18n();
const contentList = ref<DestinationPageContentVO[]>([]);
const destinationOptions = ref<DestinationVO[]>([]);
const currencyOptions = ref<DictDataVO[]>([]);
const languageOptions = ref<DictDataVO[]>([]);
const timeZoneOptions = ref<DictDataVO[]>([]);
const emojiOptions = [
  { value: '🏙️', label: 'City' },
  { value: '🍽️', label: 'Cuisine' },
  { value: '🏛️', label: 'Culture' },
  { value: '🌿', label: 'Nature' },
  { value: '🧭', label: 'Discovery' },
  { value: '✨', label: 'Moment' },
  { value: '🏖️', label: 'Beach' },
  { value: '⛰️', label: 'Mountain' },
  { value: '🎭', label: 'Arts' },
  { value: '🛍️', label: 'Shopping' },
  { value: '🚄', label: 'Journey' },
  { value: '📸', label: 'Photo' }
];
const destinationLoading = ref(false);
const buttonLoading = ref(false);
const activeTab = ref('overview');
const total = ref(0);
const { loading, withLoading } = useLoading(true);
const { showSearch } = useSearchToggle();

const queryFormRef = ref<ElFormInstance>();
const contentFormRef = ref<ElFormInstance>();
const { ids, multiple, handleSelectionChange } = useTableSelection<DestinationPageContentVO>(item => item.id);

const initFormData: DestinationPageContentForm = {
  id: undefined,
  destinationId: undefined,
  currencyDictValue: undefined,
  languageDictValue: undefined,
  timeZoneDictValue: undefined,
  visa: undefined,
  visaTitle: undefined,
  visaNote: undefined,
  introduction: [],
  highlights: [],
  cities: [],
  practicalInfo: [],
  status: 0
};

const data = reactive<PageData<DestinationPageContentForm, DestinationPageContentQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    destinationName: undefined,
    status: undefined,
    params: {}
  },
  rules: {
    destinationId: [{ required: true, message: bt('countryRequired'), trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);
const { dialog, resetForm: reset, showDialog, closeDialog } = useFormDialog({
  form,
  formRef: contentFormRef,
  initialFormData: initFormData
});

const RowActions = defineComponent({
  props: {
    index: { type: Number, required: true },
    length: { type: Number, required: true }
  },
  emits: ['moveUp', 'moveDown', 'remove'],
  setup(props, { emit }) {
    return () =>
      h('div', { class: 'row-actions' }, [
        h(ElTooltip, { content: bt('moveUp'), placement: 'top' }, () =>
          h(ElButton, { icon: 'ArrowUp', circle: true, disabled: props.index === 0, onClick: () => emit('moveUp') })
        ),
        h(ElTooltip, { content: bt('moveDown'), placement: 'top' }, () =>
          h(ElButton, { icon: 'ArrowDown', circle: true, disabled: props.index >= props.length - 1, onClick: () => emit('moveDown') })
        ),
        h(ElTooltip, { content: bt('remove'), placement: 'top' }, () =>
          h(ElButton, { icon: 'Delete', circle: true, type: 'danger', onClick: () => emit('remove') })
        )
      ]);
  }
});

const loadDictOptions = async () => {
  const [currencyRes, languageRes, timeZoneRes] = await Promise.all([
    getDicts('holidays_currency_unit'),
    getDicts('holidays_destination_language'),
    getDicts('holidays_destination_time_zone')
  ]);
  currencyOptions.value = currencyRes.data || [];
  languageOptions.value = languageRes.data || [];
  timeZoneOptions.value = timeZoneRes.data || [];
};

const getDictLabel = (options: DictDataVO[], value?: string) => {
  if (!value) return '-';
  return options.find(item => String(item.dictValue) === String(value))?.dictLabel || value;
};

const getMissingText = (row: DestinationPageContentVO) => {
  const items = row.missingItems || [];
  return items.length ? bt('missingItems', { items: items.join(', ') }) : bt('readyToPublish');
};

const getDestinationOptionLabel = (row: DestinationVO) => `${row.nameEn || row.name} / ${row.name}`;

const searchDestinationOptions = async (keyword = '') => {
  destinationLoading.value = true;
  try {
    const res = await listDestination({ pageNum: 1, pageSize: 100, nameEn: keyword || undefined, status: 1, level: 2, params: {} });
    destinationOptions.value = res.data?.rows || [];
  } finally {
    destinationLoading.value = false;
  }
};

const ensureDestinationOption = async (row?: DestinationPageContentVO) => {
  if (!row?.destinationId) return;
  if (destinationOptions.value.some(item => String(item.id) === String(row.destinationId))) return;
  destinationOptions.value.unshift({
    id: row.destinationId,
    name: row.destinationName || '',
    nameEn: row.destinationNameEn || '',
    parentId: row.regionId || 0,
    level: 2,
    image: row.destinationImage || '',
    imageUrl: row.destinationImageUrl || '',
    description: '',
    sort: 0,
    status: 1
  });
};

const toRow = (row: unknown) => row as DestinationPageContentVO;

const normalizeFormArrays = () => {
  form.value.introduction ||= [];
  form.value.highlights ||= [];
  form.value.cities ||= [];
  form.value.practicalInfo ||= [];
};

const getList = async () => {
  await withLoading(async () => {
    const res = await listDestinationPageContent(queryParams.value);
    contentList.value = res.data?.rows || [];
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
  resetExtras: () => {},
  afterReset: handleQuery
});

const cancel = () => {
  reset();
  closeDialog();
};

const handleAdd = async () => {
  reset();
  activeTab.value = 'overview';
  normalizeFormArrays();
  await Promise.all([searchDestinationOptions(), loadDictOptions()]);
  showDialog(bt('addDestinationPageContent'));
};

const handleUpdate = async (row: unknown) => {
  reset();
  activeTab.value = 'overview';
  const current = toRow(row);
  const res = await getDestinationPageContent(current.id);
  Object.assign(form.value, res.data);
  normalizeFormArrays();
  await Promise.all([ensureDestinationOption(res.data), loadDictOptions()]);
  showDialog(bt('editDestinationPageContent'));
};

const submitForm = (status: number) => {
  contentFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    const payload = { ...form.value, status };
    const request = payload.id ? updateDestinationPageContent(payload) : addDestinationPageContent(payload);
    await request.finally(() => (buttonLoading.value = false));
    modal.msgSuccess(status === 1 ? bt('published') : bt('saved'));
    closeDialog();
    await getList();
  });
};

const handleChangeStatus = async (row: DestinationPageContentVO) => {
  const nextStatus = Number(row.status) === 1 ? 0 : 1;
  await changeDestinationPageContentStatus(row.id, nextStatus);
  modal.msgSuccess(nextStatus === 1 ? bt('published') : bt('unpublished'));
  await getList();
};

const handleDelete = async (row?: unknown) => {
  const current = row ? toRow(row) : undefined;
  const selectedIds = current?.id || ids.value;
  await modal.confirm(bt('confirmDeleteDestinationPageContent', { ids: selectedIds }));
  await delDestinationPageContent(selectedIds);
  modal.msgSuccess(bt('deleted'));
  await getList();
};

const moveItem = <T,>(list: T[] | undefined, index: number, offset: number) => {
  if (!list) return;
  const target = index + offset;
  if (target < 0 || target >= list.length) return;
  const [item] = list.splice(index, 1);
  list.splice(target, 0, item);
};

const addIntroduction = () => form.value.introduction?.push('');
const removeIntroduction = (index: number) => form.value.introduction?.splice(index, 1);
const moveIntroduction = (index: number, offset: number) => moveItem(form.value.introduction, index, offset);

const addHighlight = () => form.value.highlights?.push({ icon: '', title: '', description: '' });
const removeHighlight = (index: number) => form.value.highlights?.splice(index, 1);
const moveHighlight = (index: number, offset: number) => moveItem<DestinationPageHighlight>(form.value.highlights, index, offset);

const addCity = () => form.value.cities?.push({ label: '', name: '', image: '', description: '' });
const removeCity = (index: number) => form.value.cities?.splice(index, 1);
const moveCity = (index: number, offset: number) => moveItem<DestinationPageCity>(form.value.cities, index, offset);

const addPracticalInfo = () => form.value.practicalInfo?.push({ title: '', content: '' });
const removePracticalInfo = (index: number) => form.value.practicalInfo?.splice(index, 1);
const movePracticalInfo = (index: number, offset: number) => moveItem<DestinationPagePracticalInfo>(form.value.practicalInfo, index, offset);

onMounted(() => {
  getList();
  searchDestinationOptions();
  loadDictOptions();
});
</script>

<style scoped>
.content-section {
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 16px;
}

.section-title {
  align-items: center;
  display: flex;
  font-weight: 600;
  justify-content: space-between;
  margin-bottom: 12px;
}

.dynamic-row {
  align-items: flex-start;
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(0, 1fr) auto;
  margin-bottom: 12px;
}

.dynamic-row.two-col {
  grid-template-columns: minmax(140px, 220px) minmax(0, 1fr) auto;
}

.dynamic-row.three-col {
  grid-template-columns: 96px minmax(140px, 220px) minmax(0, 1fr) auto;
}

.dynamic-row.city-row {
  grid-template-columns: 120px minmax(140px, 200px) 180px minmax(0, 1fr) auto;
}

:deep(.row-actions) {
  display: flex;
  gap: 6px;
}

@media (max-width: 900px) {
  .dynamic-row,
  .dynamic-row.two-col,
  .dynamic-row.three-col,
  .dynamic-row.city-row {
    grid-template-columns: 1fr;
  }

  :deep(.row-actions) {
    justify-content: flex-end;
  }
}
</style>
