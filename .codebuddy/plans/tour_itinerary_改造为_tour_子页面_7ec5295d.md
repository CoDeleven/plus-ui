---
name: tour_itinerary 改造为 tour 子页面
overview: 将 CRUD 模板生成的 tour_itinerary 页面改造为 tour 的子页面：点击线路名称进入，行程列表锁定当前线路（不可查询其他线路），支持增删改查并自动回填 tourId。
todos:
  - id: register-route
    content: 在 src/router/index.ts 的 dynamicRoutes 注册行程内页隐藏路由（含 permissions、hidden、activeMenu、noCache）
    status: completed
  - id: add-tourid-query
    content: 在 tour_itinerary/types.ts 的 Tour_itineraryQuery 增加 tourId 字段
    status: completed
  - id: transform-itinerary-page
    content: 改造 tour_itinerary/index.vue 为子页：读取路由 tourId/tourName、标题展示线路名、列表与重置锁定 tourId、移除新增对话框线路ID输入并自动回填、加返回按钮调用 tab.closePage
    status: completed
    dependencies:
      - register-route
      - add-tourid-query
  - id: tour-name-link
    content: 在 tour/index.vue 将线路名称列改为可点击链接，新增 handleItinerary 用 tab.openPage 携带 tourId/tourName 跳转
    status: completed
    dependencies:
      - register-route
---

## 产品概述

将 CRUD 模板生成的 `tour_itinerary`（行程）页面改造为线路 `tour` 的子页面：用户在「线路管理」列表中点击「线路名称」即可跳转到该线路专属的行程管理内页，内页内支持行程的增删改查，且全程锁定当前线路，不允许查询或操作其他线路的行程。

## 核心功能

- 线路列表「线路名称」列改为可点击链接，点击后通过路由 query（携带 `tourId`、`tourName`）打开行程内页
- 行程内页注册为隐藏路由，不出现在侧边栏；进入时侧边栏仍高亮「线路管理」
- 行程内页标题展示当前线路名称，并提供「返回」按钮回到线路列表
- 行程列表始终按当前 `tourId` 过滤，重置搜索、分页、刷新均不丢失 `tourId`
- 新增行程时自动回填当前 `tourId`，移除/禁用「线路ID」输入项，杜绝跨线路
- 编辑行程时保留原 `tourId`，不允许修改
- 行程内页复用已生成的 API 与类型，仅做必要字段补充

## 技术栈

- 前端框架：Vue 3 + TypeScript + Vite（项目既有）
- UI 库：Element Plus（项目既有）
- 路由：vue-router，隐藏子页通过 `dynamicRoutes` 注册（需带 `permissions` 才会被 `filterDynamicRoutes` 注册）
- 状态/工具：复用既有 hooks（`useFormDialog`、`useSearchReset`、`useTableSelection`、`useLoading`）与 `tab` 插件（`openPage`/`closePage`）

## 实现方案

### 路由跳转与注册

- 父页 `tour/index.vue` 点击线路名称调用 `tab.openPage('/boxhilltravel_manager/tour_itinerary', '行程管理 - ' + name, { tourId: id, tourName: name })`，利用 `tab.openPage` 原生支持 query 且会写入 title 用于多标签页标题。
- 子页路由注册到 `src/router/index.ts` 的 `dynamicRoutes`：`{ path: '/boxhilltravel_manager', component: Layout, hidden: true, permissions: ['boxhilltravel_manager:tour_itinerary:list'], children: [{ path: 'tour_itinerary', name: 'TourItinerary', component: () => import('@/views/.../index.vue'), meta: { title: '行程管理', activeMenu: '/boxhilltravel_manager/tour', noCache: true } }] }`。
- 关键依据：`permission.ts` 的 `filterDynamicRoutes` 仅注册带 `permissions`/`roles` 且校验通过的路由（无 else），故必须带 `permissions`。
- `hidden: true` 不入侧边栏；`activeMenu` 指向 tour 列表路径保持高亮（路径需与后端菜单一致，若不符需用户核对调整）；`noCache: true` 避免不同线路共用缓存导致数据串线。
- `name: 'TourItinerary'` 与 `keep-alive` 配合，需唯一且与组件 `name` 解耦（组件 name 仍为生成时的 `Tour_itinerary`）。

### 行程锁定（不允许跨线路）

- 子页通过 `useRoute().query.tourId` 读取线路 ID，转为只读常量贯穿整个生命周期。
- `Tour_itineraryQuery` 类型新增 `tourId?: string | number` 字段，使列表请求可携带过滤条件。
- `queryParams.tourId` 初始化即赋值；`getList` 前确保 `queryParams.tourId` 为当前值；`useSearchReset` 的 `resetExtras` 中回填 `tourId`，保证重置后仍锁定。
- 新增对话框移除「线路ID」表单项；`handleAdd` 打开后立即 `form.value.tourId = tourId`（因 `openDialog` 内部会 `resetForm` 清空，需在打开后回填）。
- 编辑 `handleUpdate` 使用 `showDialog`（不 reset），`Object.assign` 后 `tourId` 自然保留为该行程原值，无需额外处理。

### 返回机制

- 内页头部「返回」按钮调用 `tab.closePage()`（关闭当前 tab 并自动回到上一个 tab），符合框架既有交互。

## 实现要点

- `openDialog`（即 `openFormDialog`）内部先 `resetForm()` 再开窗，故新增回填 `tourId` 必须在其之后执行；`showDialog` 不 reset，编辑安全。
- `useSearchReset` 默认会重置 `queryParams` 到初始值，但 `tourId` 在 reactive 初始即赋值，仍需在 `resetExtras` 显式回填以防初始值被覆盖时序问题。
- 后端依赖：行程列表查询 BO 必须支持按 `tourId` 等值过滤，否则前端传参无效（需用户确认后端已支持；若不支持，需后端在 Query BO 增加 `tourId` 查询条件）。
- `activeMenu` 路径需与后端「线路管理」菜单的 `path` 一致，假设为 `/boxhilltravel_manager/tour`，不符则调整。

## 目录结构

改造涉及 4 个文件（就地修改，不新建）：

```
src/
├── router/
│   └── index.ts                                    # [MODIFY] dynamicRoutes 注册行程内页隐藏路由
├── api/boxhilltravel_manager/tour_itinerary/
│   └── types.ts                                    # [MODIFY] Tour_itineraryQuery 增加 tourId 字段
├── views/boxhilltravel_manager/
│   ├── tour/
│   │   └── index.vue                               # [MODIFY] 线路名称列改可点击链接 + handleItinerary
│   └── tour_itinerary/
│       └── index.vue                               # [MODIFY] 改造为 tour 子页：锁定 tourId、移除跨线路输入、加返回按钮
```

## Agent Extensions

### SubAgent

- **code-explorer**
- Purpose: 在改造前快速核验 `activeMenu` 路径与后端菜单路径是否一致、以及 `useSearchReset`/`useFormDialog` 在该项目的精确调用约定，避免遗漏细节
- Expected outcome: 确认路由高亮路径与 hooks 行为，确保改造一次到位、无回归