import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import Layout from '@/layout/index.vue';

export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index.vue')
      }
    ]
  },
  {
    path: '/social-callback',
    hidden: true,
    component: () => import('@/layout/components/SocialCallback/index.vue')
  },
  {
    path: '/login',
    component: () => import('@/views/login.vue'),
    hidden: true
  },
  {
    path: '/register',
    component: () => import('@/views/register.vue'),
    hidden: true
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/error/404.vue'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error/401.vue'),
    hidden: true
  },
  {
    path: '',
    component: Layout,
    redirect: '/index',
    children: [
      {
        path: '/index',
        component: () => import('@/views/index.vue'),
        name: 'Index',
        meta: { title: 'dashboard', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [
      {
        path: 'profile',
        component: () => import('@/views/system/user/profile/index.vue'),
        name: 'Profile',
        meta: { title: 'profile', icon: 'user' }
      }
    ]
  }
];

export const dynamicRoutes: RouteRecordRaw[] = [
  {
    path: '/boxhilltravel_manager',
    component: Layout,
    hidden: true,
    permissions: ['boxhilltravel_manager:tour_itinerary:list'],
    children: [
      {
        path: 'tour_itinerary',
        component: () => import('@/views/boxhilltravel_manager/tour_itinerary/index.vue'),
        name: 'TourItinerary',
        meta: { title: 'boxhilltravel.itinerary', activeMenu: '/boxhilltravel_manager/tour', noCache: true }
      }
    ]
  },
  {
    path: '/boxhilltravel_manager/tour_itinerary_activity',
    component: Layout,
    hidden: true,
    permissions: ['boxhilltravel_manager:tour_itinerary_activity:list'],
    children: [
      {
        path: '',
        component: () => import('@/views/boxhilltravel_manager/tour_itinerary_activity/index.vue'),
        name: 'TourItineraryActivity',
        meta: { title: 'boxhilltravel.activity', activeMenu: '/boxhilltravel_manager/tour', noCache: true }
      }
    ]
  },
  {
    path: '/boxhilltravel_manager/tour_service_item',
    component: Layout,
    hidden: true,
    permissions: ['boxhilltravel_manager:tour_service_item:list'],
    children: [
      {
        path: '',
        component: () => import('@/views/boxhilltravel_manager/tour_service_item/index.vue'),
        name: 'TourServiceItem',
        meta: { title: 'boxhilltravel.serviceItem', activeMenu: '/boxhilltravel_manager/tour', noCache: true }
      }
    ]
  },
  {
    path: '/boxhilltravel_manager/departure',
    component: Layout,
    hidden: true,
    permissions: ['boxhilltravel_manager:departure:list'],
    children: [
      {
        path: '',
        component: () => import('@/views/boxhilltravel_manager/departure/index.vue'),
        name: 'Departure',
        meta: { title: 'boxhilltravel.departure', activeMenu: '/boxhilltravel_manager/tour', noCache: true }
      }
    ]
  }
];


const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_APP_CONTEXT_PATH),
  routes: constantRoutes,

  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  }
});

export default router;
