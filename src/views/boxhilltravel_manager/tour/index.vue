<template>
  <div class="p-2 page-shell boxhilltravel_manager-tour-page">
    <div class="search-wrap">
      <el-card shadow="hover" class="search-panel" :class="{ 'is-collapsed': !showSearch }">
        <template #header>
          <div class="panel-heading search-panel-toggle" @click.stop="showSearch = !showSearch">
            <div><h3>{{ bt('filters') }}</h3></div>
          </div>
        </template>
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form">
            <el-form-item :label="bt('tourCode')" prop="code">
              <el-input v-model="queryParams.code" :placeholder="bt('enterTourCode')" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item :label="bt('tourName')" prop="name">
              <el-input v-model="queryParams.name" :placeholder="bt('enterTourName')" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item :label="bt('countriesVisited')" prop="countryName">
              <el-input v-model="queryParams.countryName" :placeholder="bt('enterCountryName')" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item :label="bt('travelStyle')" prop="travelStyle">
              <el-select v-model="queryParams.travelStyle" :placeholder="bt('selectTravelStyle')" clearable >
                <el-option v-for="dict in holidays_tour_travel_style" :key="dict.value" :label="dict.label" :value="dict.value"/>
              </el-select>
            </el-form-item>
            <el-form-item :label="bt('serviceLevel')" prop="serviceLevel">
              <el-select v-model="queryParams.serviceLevel" :placeholder="bt('selectServiceLevel')" clearable >
                <el-option v-for="dict in holidays_tour_service_level" :key="dict.value" :label="dict.label" :value="dict.value"/>
              </el-select>
            </el-form-item>
            <el-form-item :label="bt('physicalRating')" prop="physicalRating">
              <el-select v-model="queryParams.physicalRating" :placeholder="bt('selectPhysicalRating')" clearable >
                <el-option v-for="dict in holidays_tour_physical_rating" :key="dict.value" :label="dict.label" :value="dict.value"/>
              </el-select>
            </el-form-item>
            <el-form-item :label="bt('tourType')" prop="tripType">
              <el-select v-model="queryParams.tripType" :placeholder="bt('selectTourType')" clearable >
                <el-option v-for="dict in holidays_tour_trip_type" :key="dict.value" :label="dict.label" :value="dict.value"/>
              </el-select>
            </el-form-item>
            <el-form-item :label="bt('publishStatus')" prop="status">
              <el-select v-model="queryParams.status" :placeholder="bt('selectPublishStatus')" clearable >
                <el-option :label="bt('enabled')" :value="0" />
                <el-option :label="bt('disabled')" :value="1" />
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
            <h3>{{ bt('tourList') }}</h3>
          </div>
          <div class="toolbar-actions">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['boxhilltravel_manager:tour:add']">{{ bt('add') }}</el-button>
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['boxhilltravel_manager:tour:edit']">{{ bt('edit') }}</el-button>
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['boxhilltravel_manager:tour:remove']">{{ bt('delete') }}</el-button>
            <el-button type="info" plain icon="Top" @click="handleImport" v-hasPermi="['boxhilltravel_manager:tour:add']">批量导入</el-button>
            <right-toolbar v-model:show-search="showSearch" :search="false" @query-table="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" border class="data-table" :data="tourList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column :label="bt('tourId')" align="center" prop="id" />
        <el-table-column :label="bt('tourCodeUnique')" align="center" prop="code" />
        <el-table-column :label="bt('tourName')" align="center" prop="name" min-width="200">
          <template #default="scope">
            <a class="text-blue-500 cursor-pointer hover:underline hover:text-blue-700" @click.prevent="handleItinerary(scope.row)">{{ scope.row.name }}</a>
          </template>
        </el-table-column>
        <el-table-column :label="bt('durationDays')" align="center" prop="durationDays" />
        <el-table-column :label="bt('travelStyle')" align="center" prop="travelStyle" min-width="100">
          <template #default="scope">
            <dict-tag :options="holidays_tour_travel_style" :value="scope.row.travelStyle"/>
          </template>
        </el-table-column>
        <el-table-column :label="bt('serviceLevel')" align="center" prop="serviceLevel" min-width="100">
          <template #default="scope">
            <dict-tag :options="holidays_tour_service_level" :value="scope.row.serviceLevel"/>
          </template>
        </el-table-column>
        <el-table-column :label="bt('physicalRating')" align="center" prop="physicalRating" min-width="100">
          <template #default="scope">
            <dict-tag :options="holidays_tour_physical_rating" :value="scope.row.physicalRating"/>
          </template>
        </el-table-column>
        <el-table-column :label="bt('tourType')" align="center" prop="tripType" min-width="120">
          <template #default="scope">
            <dict-tag :options="holidays_tour_trip_type" :value="scope.row.tripType"/>
          </template>
        </el-table-column>
        <el-table-column :label="bt('collectionTag')" align="center" prop="collectionTag" min-width="120">
          <template #default="scope">
            <dict-tag :options="holidays_tour_collection" :value="scope.row.collectionTag"/>
          </template>
        </el-table-column>
        <el-table-column :label="bt('countriesVisited')" align="center" prop="countryNames" min-width="160">
          <template #default="scope">
            <el-tooltip
              v-if="scope.row.countryNames?.length"
              placement="top"
              effect="dark"
              popper-class="tour-country-tooltip"
            >
              <template #content>
                <div class="tour-country-tooltip-content">
                  <div v-for="country in scope.row.countryNames" :key="country">{{ country }}</div>
                </div>
              </template>
              <span class="tour-country-summary">
                <span>{{ scope.row.countryNames[0] }}</span>
                <el-tag v-if="scope.row.countryNames.length > 1" size="small" class="tour-country-more">
                  +{{ scope.row.countryNames.length - 1 }}
                </el-tag>
              </span>
            </el-tooltip>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column :label="bt('minAge')" align="center" prop="minAge" />
        <el-table-column :label="bt('basePrice')" align="center" prop="basePrice" />
        <el-table-column :label="bt('salePrice')" align="center" prop="salePrice" />
        <el-table-column :label="bt('singleSupplement')" align="center" prop="singleSupplement" min-width="150" />
        <el-table-column :label="bt('currency')" align="center" prop="currency">
          <template #default="scope">
            <dict-tag :options="holidays_currency_unit" :value="scope.row.currency"/>
          </template>
        </el-table-column>
        <el-table-column :label="bt('coverImageUrl')" align="center" prop="coverImageUrl" width="100">
          <template #default="scope">
            <image-preview :src="scope.row.coverImageUrl" :width="50" :height="50"/>
          </template>
        </el-table-column>
        <el-table-column :label="bt('mapUrl')" align="center" prop="mapImageUrl" width="100">
          <template #default="scope">
            <image-preview :src="scope.row.mapImageUrl" :width="50" :height="50"/>
          </template>
        </el-table-column>
        <el-table-column :label="bt('status')" align="center" prop="status">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="statusActiveValue"
              :inactive-value="statusInactiveValue"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column :label="bt('actions')" align="center" class-name="small-padding fixed-width" :min-width="200">
          <template #default="scope">
            <el-tooltip :content="bt('details')" placement="top">
              <el-button link type="primary" icon="View" @click="handleDetail(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip :content="bt('serviceItems')" placement="top">
              <el-button link type="primary" icon="Tickets" @click="handleServiceItem(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip :content="bt('departures')" placement="top">
              <el-button link type="primary" icon="Calendar" @click="handleDeparture(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip :content="bt('edit')" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['boxhilltravel_manager:tour:edit']"></el-button>
            </el-tooltip>
            <el-tooltip :content="bt('delete')" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['boxhilltravel_manager:tour:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="750px" append-to-body>
      <el-form ref="tourFormRef" :model="form" :rules="rules" label-width="180px">
        <el-form-item :label="bt('tourCodeUnique')" prop="code">
          <el-input v-model="form.code" :placeholder="bt('enterUniqueTourCode')" />
        </el-form-item>
        <el-form-item :label="bt('tourName')" prop="name">
          <el-input v-model="form.name" :placeholder="bt('enterTourName')" />
        </el-form-item>
        <el-form-item :label="bt('description')" prop="description">
            <el-input v-model="form.description" type="textarea" :placeholder="bt('enterContent')" />
        </el-form-item>
        <el-form-item :label="bt('durationDays')" prop="durationDays">
          <el-input-number v-model="form.durationDays" controls-position="right" :min="1" />
        </el-form-item>
        <el-form-item :label="bt('travelStyle')" prop="travelStyle">
          <el-select v-model="form.travelStyle" :placeholder="bt('selectTravelStyle')">
            <el-option
                v-for="dict in holidays_tour_travel_style"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="bt('serviceLevel')" prop="serviceLevel">
          <el-select v-model="form.serviceLevel" :placeholder="bt('selectServiceLevel')">
            <el-option
                v-for="dict in holidays_tour_service_level"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="bt('physicalRating')" prop="physicalRating">
          <el-select v-model="form.physicalRating" :placeholder="bt('selectPhysicalRating')">
            <el-option
                v-for="dict in holidays_tour_physical_rating"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="bt('tourType')" prop="tripType">
          <el-select v-model="form.tripType" :placeholder="bt('selectTourType')">
            <el-option
                v-for="dict in holidays_tour_trip_type"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="bt('tag')" prop="collectionTag">
          <el-select v-model="form.collectionTag" :placeholder="bt('selectCollectionTag')" clearable>
            <el-option
                v-for="dict in holidays_tour_collection"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="bt('minAge')" prop="minAge">
          <el-input-number v-model="form.minAge" controls-position="right" />
        </el-form-item>
        <el-form-item :label="bt('basePrice')" prop="basePrice">
          <el-input-number v-model="form.basePrice" controls-position="right" />
        </el-form-item>
        <el-form-item :label="bt('salePrice')" prop="salePrice">
          <el-input-number v-model="form.salePrice" controls-position="right" />
        </el-form-item>
        <el-form-item :label="bt('singleSupplement')" prop="singleSupplement">
          <el-input-number v-model="form.singleSupplement" controls-position="right" :min="0" :precision="2" :step="0.01" />
        </el-form-item>
        <el-form-item :label="bt('currency')" prop="currency">
          <el-select v-model="form.currency" :placeholder="bt('selectCurrency')">
            <el-option
                v-for="dict in holidays_currency_unit"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="bt('coverImageUrl')" prop="coverImage">
          <image-upload v-model="form.coverImage" :limit="1"/>
        </el-form-item>
        <el-form-item :label="bt('mapUrl')" prop="mapImage">
          <image-upload v-model="form.mapImage" :limit="1"/>
        </el-form-item>
        <el-form-item :label="bt('notes')" prop="notes">
            <el-input v-model="form.notes" type="textarea" :placeholder="bt('enterContent')" />
        </el-form-item>
        <el-form-item :label="bt('latestArrivalTime')" prop="latestArrivalTime">
          <el-time-picker
            v-model="form.latestArrivalTime"
            value-format="HH:mm:ss"
            :placeholder="bt('selectLatestArrivalTime')"
          />
        </el-form-item>
        <el-form-item :label="bt('earliestLeaveTime')" prop="earliestDepartureTime">
          <el-time-picker
            v-model="form.earliestDepartureTime"
            value-format="HH:mm:ss"
            :placeholder="bt('selectEarliestLeaveTime')"
          />
        </el-form-item>
        <el-form-item :label="bt('publishStatus')" prop="status">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
        <el-form-item :label="bt('seoTitle')" prop="seoTitle">
          <el-input v-model="form.seoTitle" :placeholder="bt('enterSeoTitle')" />
        </el-form-item>
        <el-form-item :label="bt('seoDescription')" prop="seoDescription">
            <el-input v-model="form.seoDescription" type="textarea" :placeholder="bt('enterContent')" />
        </el-form-item>
        <el-form-item :label="bt('seoKeywords')" prop="seoKeywords">
          <el-input v-model="form.seoKeywords" :placeholder="bt('enterSeoKeywords')" />
        </el-form-item>
        <el-form-item :label="bt('deletedAt')" prop="deletedAt">
          <el-date-picker clearable
            v-model="form.deletedAt"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            :placeholder="bt('selectDeletedAt')">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">{{ bt('confirm') }}</el-button>
          <el-button @click="cancel">{{ bt('cancel') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog :title="bt('tourDetails')" v-model="detailVisible" width="720px" append-to-body @closed="handleDetailClosed">
      <el-descriptions v-loading="detailLoading" class="tour-detail-descriptions" :column="2" border>
        <el-descriptions-item :label="bt('tourId')">{{ detailForm.id ?? '-' }}</el-descriptions-item>
        <el-descriptions-item :label="bt('tourCode')">{{ detailForm.code || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="bt('tourName')" :span="2">{{ detailForm.name || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="bt('durationDays')">{{ detailForm.durationDays ?? '-' }}</el-descriptions-item>
        <el-descriptions-item :label="bt('minAge')">{{ detailForm.minAge ?? '-' }}</el-descriptions-item>
        <el-descriptions-item :label="bt('travelStyle')">
          <dict-tag v-if="hasDetailValue(detailForm.travelStyle)" :options="holidays_tour_travel_style" :value="detailForm.travelStyle"/>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item :label="bt('serviceLevel')">
          <dict-tag v-if="hasDetailValue(detailForm.serviceLevel)" :options="holidays_tour_service_level" :value="detailForm.serviceLevel"/>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item :label="bt('physicalRating')">
          <dict-tag v-if="hasDetailValue(detailForm.physicalRating)" :options="holidays_tour_physical_rating" :value="detailForm.physicalRating"/>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item :label="bt('tourType')">
          <dict-tag v-if="hasDetailValue(detailForm.tripType)" :options="holidays_tour_trip_type" :value="detailForm.tripType"/>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item :label="bt('collectionTag')">
          <dict-tag v-if="hasDetailValue(detailForm.collectionTag)" :options="holidays_tour_collection" :value="detailForm.collectionTag"/>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item :label="bt('countriesVisited')" :span="2">
          {{ detailForm.countryNames?.length ? detailForm.countryNames.join(' / ') : '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="bt('basePrice')">{{ detailForm.basePrice ?? '-' }}</el-descriptions-item>
        <el-descriptions-item :label="bt('salePrice')">{{ detailForm.salePrice ?? '-' }}</el-descriptions-item>
        <el-descriptions-item :label="bt('singleSupplement')">{{ detailForm.singleSupplement ?? '-' }}</el-descriptions-item>
        <el-descriptions-item :label="bt('currency')">
          <dict-tag v-if="hasDetailValue(detailForm.currency)" :options="holidays_currency_unit" :value="detailForm.currency"/>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item :label="bt('status')">
          <el-tag :type="detailForm.status === statusActiveValue ? 'success' : 'info'">
            {{ detailForm.status === statusActiveValue ? bt('enabledStatus') : bt('disableAction') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="bt('coverImage')" :span="1">
          <image-preview v-if="detailForm.coverImageUrl" :src="detailForm.coverImageUrl" :width="70" :height="70"/>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item :label="bt('mapImage')" :span="1">
          <image-preview v-if="detailForm.mapImageUrl" :src="detailForm.mapImageUrl" :width="70" :height="70"/>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item :label="bt('description')" :span="2">{{ detailForm.description || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="bt('notes')" :span="2">{{ detailForm.notes || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="bt('latestArrivalTime')">{{ detailForm.latestArrivalTime || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="bt('earliestLeaveTime')">{{ detailForm.earliestDepartureTime || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="bt('seoTitle')" :span="2">{{ detailForm.seoTitle || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="bt('seoDescription')" :span="2">{{ detailForm.seoDescription || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="bt('seoKeywords')" :span="2">{{ detailForm.seoKeywords || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="bt('deletedAt')" :span="2">{{ detailForm.deletedAt ? parseTime(detailForm.deletedAt) : '-' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailVisible = false">{{ bt('close') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 线路批量导入对话框 -->
    <el-dialog
      v-model="upload.open"
      :title="upload.title"
      width="450px"
      append-to-body
      :close-on-click-modal="false"
      :show-close="!upload.isUploading"
    >
      <div v-loading="upload.isUploading" element-loading-text="正在导入，请稍候…">
        <el-upload
          ref="uploadRef"
          :limit="1"
          accept=".xlsx, .xls"
          :headers="upload.headers"
          :action="upload.url"
          :disabled="upload.isUploading"
          :on-progress="handleFileUploadProgress"
          :on-success="handleFileSuccess"
          :on-error="handleFileError"
          :auto-upload="false"
          drag
        >
          <el-icon class="el-icon--upload">
            <UploadFilled />
          </el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或
            <em>点击上传</em>
          </div>
          <template #tip>
            <div class="text-center el-upload__tip">
              <span>请使用批量导入模板，一次可导入多个线路（含目的地、行程、服务项与团期）</span>
              <br />
              <el-link
                type="primary"
                underline="never"
                style="font-size: 12px; vertical-align: baseline"
                @click="importTemplate"
              >
                下载模板
              </el-link>
            </div>
          </template>
        </el-upload>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" :loading="upload.isUploading" @click="submitFileForm">确 定</el-button>
          <el-button :disabled="upload.isUploading" @click="upload.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Tour" lang="ts">

import { useBoxhillI18n } from '../useBoxhillI18n';
import {  addTour,
  changeTourStatus,
  delTour,
  getTour,
  listTour,
  updateTour
} from '@/api/boxhilltravel_manager/tour';
import { TourForm, TourQuery, TourVO } from '@/api/boxhilltravel_manager/tour/types';
import { useLoading } from '@/hooks/async/useLoading';
import { useFormDialog } from '@/hooks/dialog/useFormDialog';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useSearchToggle } from '@/hooks/form/useSearchToggle';
import { useTableSelection } from '@/hooks/table/useTableSelection';
import { useDict } from '@/utils/dict';
import { parseTime } from '@/utils/ruoyi';
import modal from '@/plugins/modal';
import tab from '@/plugins/tab';
import { globalHeaders, download as requestDownload } from '@/utils/request';

const { bt } = useBoxhillI18n();

const { holidays_currency_unit, holidays_tour_collection, holidays_tour_physical_rating, holidays_tour_service_level, holidays_tour_trip_type, holidays_tour_travel_style } = toRefs<any>(useDict('holidays_currency_unit', 'holidays_tour_collection', 'holidays_tour_physical_rating', 'holidays_tour_service_level', 'holidays_tour_trip_type', 'holidays_tour_travel_style'));

const statusActiveValue = 1;
const statusInactiveValue = 0;

const tourList = ref<TourVO[]>([]);
const buttonLoading = ref(false);
const detailVisible = ref(false);
const detailLoading = ref(false);
const detailForm = ref<Partial<TourVO>>({});
const { loading, withLoading } = useLoading(true);
const { showSearch } = useSearchToggle();
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const tourFormRef = ref<ElFormInstance>();
const uploadRef = ref<ElUploadInstance>();

/*** 线路批量导入参数 */
const upload = reactive<ImportOption>({
  // 是否显示弹出层（线路导入）
  open: false,
  // 弹出层标题（线路导入）
  title: '',
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的数据（此导入不支持更新，字段保留仅为满足类型约束）
  updateSupport: 0,
  // 设置上传的请求头部
  headers: globalHeaders(),
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + '/boxhilltravel_manager/tour/importData'
});

const initFormData: TourForm = {
  id: undefined,
  code: undefined,
  name: undefined,
  description: undefined,
  durationDays: undefined,
  travelStyle: undefined,
  serviceLevel: undefined,
  physicalRating: undefined,
  tripType: undefined,
  collectionTag: undefined,
  minAge: undefined,
  basePrice: undefined,
  salePrice: undefined,
  singleSupplement: undefined,
  currency: undefined,
  coverImage: undefined,
  mapImage: undefined,
  notes: undefined,
  latestArrivalTime: undefined,
  earliestDepartureTime: undefined,
  status: undefined,
  seoTitle: undefined,
  seoDescription: undefined,
  seoKeywords: undefined,
  deletedAt: undefined,
}
const data = reactive<PageData<TourForm, TourQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    code: undefined,
    name: undefined,
    countryName: undefined,
    travelStyle: undefined,
    serviceLevel: undefined,
    physicalRating: undefined,
    tripType: undefined,
    status: undefined,
    params: {
    }
  },
  rules: {
id: [
      { required: true, message: bt('tourIdRequired'), trigger: "change" }
    ],
code: [
      { required: true, message: bt('tourCodeRequired'), trigger: "blur" }
    ],
name: [
      { required: true, message: bt('tourNameRequired'), trigger: "blur" }
    ],
durationDays: [
      { required: true, message: bt('durationDaysRequired'), trigger: "change" }
    ],
travelStyle: [
      { required: true, message: bt('travelStyleRequired'), trigger: "change" }
    ],
serviceLevel: [
      { required: true, message: bt('serviceLevelRequired'), trigger: "change" }
    ],
physicalRating: [
      { required: true, message: bt('physicalRatingRequired'), trigger: "change" }
    ],
tripType: [
      { required: true, message: bt('tourTypeRequired'), trigger: "change" }
    ],
basePrice: [
      { required: true, message: bt('basePriceRequired'), trigger: "change" }
    ],
salePrice: [
      { required: true, message: bt('salePriceRequired'), trigger: "change" }
    ],
status: [
      { required: true, message: bt('publishStatus'), trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);
const { ids, single, multiple, handleSelectionChange } = useTableSelection<TourVO>(item => item.id);
const { dialog, resetForm: reset, openDialog, showDialog, closeDialog } = useFormDialog({
  form,
  formRef: tourFormRef,
  initialFormData: initFormData
});

const hasDetailValue = (value: unknown) => value !== undefined && value !== null && value !== '';


const getList = async () => {
  await withLoading(async () => {
    const res = await listTour(queryParams.value);
    tourList.value = res.data?.rows;
    total.value = res.data?.total;
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
  pageNumKey: 'pageNum',
  pageSizeKey: 'pageSize',
  initialPageSize: 10,
  resetExtras: () => {
  },
  afterReset: () => {
    handleQuery();
  }
});


const handleAdd = () => {
  openDialog(bt('addTour'));
};


const handleUpdate = async (row?: Partial<TourVO>) => {
  reset();
  const selectedId = row?.id || ids.value[0];
  const res = await getTour(selectedId);
  Object.assign(form.value, res.data);
  showDialog(bt('editTour'));
};


const handleDetail = async (row: Partial<TourVO>) => {
  if (!row.id) {
    return;
  }
  detailVisible.value = true;
  detailLoading.value = true;
  try {
    const res = await getTour(row.id);
    detailForm.value = res.data || {};
  } finally {
    detailLoading.value = false;
  }
};

const handleDetailClosed = () => {
  detailForm.value = {};
};


const submitForm = () => {
  tourFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateTour(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addTour(form.value).finally(() => (buttonLoading.value = false));
      }
      modal.msgSuccess(bt('operationSuccess'));
      closeDialog();
      await getList();
    }
  });
};


const handleDelete = async (row?: Partial<TourVO>) => {
  const selectedIds = row?.id || ids.value;
  await modal.confirm(bt('confirmDeleteTour', { ids: selectedIds }));
  await delTour(selectedIds);
  modal.msgSuccess(bt('deleteSuccess'));
  await getList();
};



const handleStatusChange = async (row: Partial<TourVO>) => {
  const text = row.status === statusActiveValue ? bt('enabledStatus') : bt('disableAction');
  try {
    await modal.confirm(bt('confirmTourStatus', { action: text }));
    await changeTourStatus(row.id, row.status);
    modal.msgSuccess(text + bt('successSuffix'));
  } catch (err) {
    row.status = row.status === statusActiveValue ? statusInactiveValue : statusActiveValue;
  }
};



const handleItinerary = (row: Partial<TourVO>) => {
  tab.openPage('/boxhilltravel_manager/tour_itinerary', bt('text006') + row.name, { tourId: row.id, tourName: row.name });
};


const handleServiceItem = (row: Partial<TourVO>) => {
  tab.openPage('/boxhilltravel_manager/tour_service_item', bt('text003') + row.name, { tourId: row.id, tourName: row.name });
};


const handleDeparture = (row: Partial<TourVO>) => {
  tab.openPage('/boxhilltravel_manager/departure', bt('text002') + row.name, { tourId: row.id, tourName: row.name });
};

/** 批量导入按钮操作 */
const handleImport = () => {
  upload.title = '线路批量导入';
  upload.open = true;
};

/** 下载导入模板 */
const importTemplate = () => {
  requestDownload('boxhilltravel_manager/tour/importTemplate', {}, `tours_import_template_${new Date().getTime()}.xlsx`);
};

/** 文件上传中处理 */
const handleFileUploadProgress = () => {
  upload.isUploading = true;
};

const formatImportResultMessage = (message: unknown) => {
  return String(message ?? '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&nbsp;/gi, ' ')
    .replace(/<[^>]+>/g, '');
};

/** 文件上传成功处理 */
const handleFileSuccess = (response: any, file: UploadFile) => {
  upload.open = false;
  upload.isUploading = false;
  uploadRef.value?.handleRemove(file);
  ElMessageBox.alert(formatImportResultMessage(response.msg), '导入结果', {
    customClass: 'import-result-box'
  });
  getList();
};

/** 文件上传失败处理 */
const handleFileError = (error: any) => {
  upload.isUploading = false;
  const message = error?.message ? formatImportResultMessage(error.message) : '导入失败，请稍后重试';
  modal.msgError(message);
};

/** 提交上传文件 */
const submitFileForm = () => {
  uploadRef.value?.submit();
};

onMounted(() => {
  getList();
});
</script>

<style scoped>
.tour-country-summary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  max-width: 100%;
}

.tour-country-more {
  flex-shrink: 0;
}

.tour-detail-descriptions :deep(.el-descriptions__label) {
  width: 120px !important;
  min-width: 120px;
}
</style>

<style>
.tour-country-tooltip-content {
  line-height: 1.8;
  white-space: nowrap;
}
</style>
