// translate router.meta.title, be used in breadcrumb sidebar tagsview
import i18n from '@/lang/index';

const routeTitleKeyMap: Record<string, string> = {
  \u9996\u9875: 'dashboard',
  \u4e2a\u4eba\u4e2d\u5fc3: 'profile',
  'Boxhill Travel': 'boxhilltravel.root',
  \u7ebf\u8def\u7ba1\u7406: 'boxhilltravel.tour',
  \u76ee\u7684\u5730\u5206\u7c7b: 'boxhilltravel.destination',
  'Destination Tag': 'boxhilltravel.destinationTag',
  'Destination Page Content': 'boxhilltravel.destinationPageContent',
  'Featured Destination': 'boxhilltravel.featuredDestination',
  \u7cbe\u9009\u7ebf\u8def: 'boxhilltravel.featuredTour',
  \u70ed\u5356\u7ebf\u8def: 'boxhilltravel.hotDealTour',
  FAQ\u5206\u7ec4: 'boxhilltravel.faqGroup',
  FAQ\u6761\u76ee: 'boxhilltravel.faqItem',
  Review: 'boxhilltravel.review',
  Order: 'boxhilltravel.order',
  'Customer User': 'boxhilltravel.customerUser',
  \u884c\u7a0b\u7ba1\u7406: 'boxhilltravel.itinerary',
  \u884c\u7a0b\u6d3b\u52a8: 'boxhilltravel.activity',
  \u7ebf\u8def\u670d\u52a1\u9879: 'boxhilltravel.serviceItem',
  \u56e2\u671f\u7ba1\u7406: 'boxhilltravel.departure'
};


export const translateRouteTitle = (title: string): string => {
  const routeTitle = routeTitleKeyMap[title] || title;
  const hasKey = i18n.global.te('route.' + routeTitle);
  if (hasKey) {
    const translatedTitle = i18n.global.t('route.' + routeTitle);
    return translatedTitle;
  }
  return title;
};
