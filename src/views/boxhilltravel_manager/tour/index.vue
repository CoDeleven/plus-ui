<template>
  <div class="p-2 page-shell boxhilltravel_manager-tour-page">
    <div class="search-wrap">
      <el-card shadow="hover" class="search-panel" :class="{ 'is-collapsed': !showSearch }">
        <template #header>
          <div class="panel-heading search-panel-toggle" @click.stop="showSearch = !showSearch">
            <div><h3>筛选条件</h3></div>
          </div>
        </template>
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form">
            <el-form-item label="线路代码" prop="code">
              <el-input v-model="queryParams.code" placeholder="请输入线路代码" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="线路名称" prop="name">
              <el-input v-model="queryParams.name" placeholder="请输入线路名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="旅行风格" prop="travelStyle">
              <el-select v-model="queryParams.travelStyle" placeholder="请选择旅行风格" clearable >
                <el-option v-for="dict in holidays_tour_travel_style" :key="dict.value" :label="dict.label" :value="dict.value"/>
              </el-select>
            </el-form-item>
            <el-form-item label="服务等级" prop="serviceLevel">
              <el-select v-model="queryParams.serviceLevel" placeholder="请选择服务等级" clearable >
                <el-option v-for="dict in holidays_tour_service_level" :key="dict.value" :label="dict.label" :value="dict.value"/>
              </el-select>
            </el-form-item>
            <el-form-item label="线路强度" prop="physicalRating">
              <el-select v-model="queryParams.physicalRating" placeholder="请选择线路强度" clearable >
                <el-option v-for="dict in holidays_tour_physical_rating" :key="dict.value" :label="dict.label" :value="dict.value"/>
              </el-select>
            </el-form-item>
            <el-form-item label="线路类型" prop="tripType">
              <el-select v-model="queryParams.tripType" placeholder="请选择线路类型" clearable >
                <el-option v-for="dict in holidays_tour_trip_type" :key="dict.value" :label="dict.label" :value="dict.value"/>
              </el-select>
            </el-form-item>
            <el-form-item label="上架状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="请选择上架状态" clearable >
                <el-option label="开启" :value="0" />
                <el-option label="关闭" :value="1" />
              </el-select>
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
            <h3>线路管理列表</h3>
          </div>
          <div class="toolbar-actions">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['boxhilltravel_manager:tour:add']">新增</el-button>
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['boxhilltravel_manager:tour:edit']">修改</el-button>
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['boxhilltravel_manager:tour:remove']">删除</el-button>
            <right-toolbar v-model:show-search="showSearch" :search="false" @query-table="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" border class="data-table" :data="tourList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="线路ID" align="center" prop="id" />
        <el-table-column label="线路代码(唯一)" align="center" prop="code" />
        <el-table-column label="线路名称" align="center" prop="name" min-width="200"/>
        <el-table-column label="描述" align="center" prop="description" :show-overflow-tooltip="true" />
        <el-table-column label="行程天数" align="center" prop="durationDays" />
        <el-table-column label="旅行风格" align="center" prop="travelStyle" min-width="100">
          <template #default="scope">
            <dict-tag :options="holidays_tour_travel_style" :value="scope.row.travelStyle"/>
          </template>
        </el-table-column>
        <el-table-column label="服务等级" align="center" prop="serviceLevel" min-width="100">
          <template #default="scope">
            <dict-tag :options="holidays_tour_service_level" :value="scope.row.serviceLevel"/>
          </template>
        </el-table-column>
        <el-table-column label="线路强度" align="center" prop="physicalRating" min-width="100">
          <template #default="scope">
            <dict-tag :options="holidays_tour_physical_rating" :value="scope.row.physicalRating"/>
          </template>
        </el-table-column>
        <el-table-column label="线路类型" align="center" prop="tripType" min-width="120">
          <template #default="scope">
            <dict-tag :options="holidays_tour_trip_type" :value="scope.row.tripType"/>
          </template>
        </el-table-column>
        <el-table-column label="最小年龄" align="center" prop="minAge" />
        <el-table-column label="基础价格" align="center" prop="basePrice" />
        <el-table-column label="销售价格" align="center" prop="salePrice" />
        <el-table-column label="货币" align="center" prop="currency">
          <template #default="scope">
            <dict-tag :options="holidays_currency_unit" :value="scope.row.currency"/>
          </template>
        </el-table-column>
        <el-table-column label="封面图URL" align="center" prop="coverImageUrl" width="100">
          <template #default="scope">
            <image-preview :src="scope.row.coverImageUrl" :width="50" :height="50"/>
          </template>
        </el-table-column>
        <el-table-column label="地图URL" align="center" prop="mapImageUrl" width="100">
          <template #default="scope">
            <image-preview :src="scope.row.mapImageUrl" :width="50" :height="50"/>
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" prop="status">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="statusActiveValue"
              :inactive-value="statusInactiveValue"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['boxhilltravel_manager:tour:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['boxhilltravel_manager:tour:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改线路管理对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="tourFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="线路代码(唯一)" prop="code">
          <el-input v-model="form.code" placeholder="请输入线路代码(唯一)" />
        </el-form-item>
        <el-form-item label="线路名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入线路名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
            <el-input v-model="form.description" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="行程天数" prop="durationDays">
          <el-input-number v-model="form.durationDays" controls-position="right" :min="1" />
        </el-form-item>
        <el-form-item label="旅行风格" prop="travelStyle">
          <el-select v-model="form.travelStyle" placeholder="请选择旅行风格">
            <el-option
                v-for="dict in holidays_tour_travel_style"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="服务等级" prop="serviceLevel">
          <el-select v-model="form.serviceLevel" placeholder="请选择服务等级">
            <el-option
                v-for="dict in holidays_tour_service_level"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="线路强度" prop="physicalRating">
          <el-select v-model="form.physicalRating" placeholder="请选择线路强度">
            <el-option
                v-for="dict in holidays_tour_physical_rating"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="线路类型" prop="tripType">
          <el-select v-model="form.tripType" placeholder="请选择线路类型">
            <el-option
                v-for="dict in holidays_tour_trip_type"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="最小年龄" prop="minAge">
          <el-input-number v-model="form.minAge" controls-position="right" />
        </el-form-item>
        <el-form-item label="基础价格" prop="basePrice">
          <el-input-number v-model="form.basePrice" controls-position="right" />
        </el-form-item>
        <el-form-item label="销售价格" prop="salePrice">
          <el-input-number v-model="form.salePrice" controls-position="right" />
        </el-form-item>
        <el-form-item label="货币" prop="currency">
          <el-select v-model="form.currency" placeholder="请选择货币">
            <el-option
                v-for="dict in holidays_currency_unit"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="封面图URL" prop="coverImage">
          <image-upload v-model="form.coverImage" :limit="1"/>
        </el-form-item>
        <el-form-item label="地图URL" prop="mapImage">
          <image-upload v-model="form.mapImage" :limit="1"/>
        </el-form-item>
        <el-form-item label="notes" prop="notes">
            <el-input v-model="form.notes" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="上架状态" prop="status">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
        <el-form-item label="SEO标题" prop="seoTitle">
          <el-input v-model="form.seoTitle" placeholder="请输入SEO标题" />
        </el-form-item>
        <el-form-item label="SEO描述" prop="seoDescription">
            <el-input v-model="form.seoDescription" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="SEO关键词" prop="seoKeywords">
          <el-input v-model="form.seoKeywords" placeholder="请输入SEO关键词" />
        </el-form-item>
        <el-form-item label="删除时间" prop="deletedAt">
          <el-date-picker clearable
            v-model="form.deletedAt"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择删除时间">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Tour" lang="ts">
import {
  addTour,
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

const { holidays_currency_unit, holidays_tour_physical_rating, holidays_tour_service_level, holidays_tour_trip_type, holidays_tour_travel_style } = toRefs<any>(useDict('holidays_currency_unit', 'holidays_tour_physical_rating', 'holidays_tour_service_level', 'holidays_tour_trip_type', 'holidays_tour_travel_style'));

const statusActiveValue = 1;
const statusInactiveValue = 0;

const tourList = ref<TourVO[]>([]);
const buttonLoading = ref(false);
const { loading, withLoading } = useLoading(true);
const { showSearch } = useSearchToggle();
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const tourFormRef = ref<ElFormInstance>();

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
  minAge: undefined,
  basePrice: undefined,
  salePrice: undefined,
  currency: undefined,
  coverImage: undefined,
  mapImage: undefined,
  notes: undefined,
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
      { required: true, message: "线路ID不能为空", trigger: "change" }
    ],
code: [
      { required: true, message: "线路代码(唯一)不能为空", trigger: "blur" }
    ],
name: [
      { required: true, message: "线路名称不能为空", trigger: "blur" }
    ],
durationDays: [
      { required: true, message: "行程天数不能为空", trigger: "change" }
    ],
travelStyle: [
      { required: true, message: "旅行风格不能为空", trigger: "change" }
    ],
serviceLevel: [
      { required: true, message: "服务等级不能为空", trigger: "change" }
    ],
physicalRating: [
      { required: true, message: "线路强度 1-5不能为空", trigger: "change" }
    ],
tripType: [
      { required: true, message: "线路类型不能为空", trigger: "change" }
    ],
basePrice: [
      { required: true, message: "基础价格不能为空", trigger: "change" }
    ],
salePrice: [
      { required: true, message: "销售价格不能为空", trigger: "change" }
    ],
status: [
      { required: true, message: "上架状态", trigger: "change" }
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

/** 查询线路管理列表 */
const getList = async () => {
  await withLoading(async () => {
    const res = await listTour(queryParams.value);
    tourList.value = res.data?.rows;
    total.value = res.data?.total;
  });
};

/** 取消按钮 */
const cancel = () => {
  reset();
  closeDialog();
};

/** 搜索按钮操作 */
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

/** 新增按钮操作 */
const handleAdd = () => {
  openDialog('添加线路管理');
};

/** 修改按钮操作 */
const handleUpdate = async (row?: Partial<TourVO>) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getTour(_id);
  Object.assign(form.value, res.data);
  showDialog('修改线路管理');
};

/** 提交按钮 */
const submitForm = () => {
  tourFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateTour(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addTour(form.value).finally(() => (buttonLoading.value = false));
      }
      modal.msgSuccess('操作成功');
      closeDialog();
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: Partial<TourVO>) => {
  const _ids = row?.id || ids.value;
  await modal.confirm('是否确认删除线路管理编号为"' + _ids + '"的数据项？');
  await delTour(_ids);
  modal.msgSuccess('删除成功');
  await getList();
};


/** 状态修改 */
const handleStatusChange = async (row: Partial<TourVO>) => {
  const text = row.status === statusActiveValue ? '启用' : '停用';
  try {
    await modal.confirm('确认要"' + text + '"吗?');
    await changeTourStatus(row.id, row.status);
    modal.msgSuccess(text + '成功');
  } catch (err) {
    row.status = row.status === statusActiveValue ? statusInactiveValue : statusActiveValue;
  }
};


onMounted(() => {
  getList();
});
</script>

