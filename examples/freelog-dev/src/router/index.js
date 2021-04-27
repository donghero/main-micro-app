import Vue from 'vue';
import VueRouter from 'vue-router';
import Index from '../views/index'
import Home from '../views/home/home'
import Dev from '../views/dev/dev.vue'

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'index',
    component: Index,
    // redirect: '/home', // 一级默认路由
    children: [
      {
        path: 'home',
        name: 'home',
        component: Home, 
      },
      {
        path: '',
        name: 'home',
        component: Home, 
      },
      {
        path: 'concept',
        name: 'concept', 
        component: () => import(/* webpackChunkName: "concept" */ '../views/concept/concept.vue'),
      },
      {
        path: 'faq',
        name: 'faq',
        component: () => import(/* webpackChunkName: "faq" */ '../views/faq/faq.vue'),
      }
      ,
      {
        path: 'dev',
        name: 'dev', 
        component: Dev,
        children: [
          {
            path: 'guide',
            name: 'guide', 
            component: () => import(/* webpackChunkName: "guide" */ '../views/dev/guide/guide.vue'),
          },
          {
            path: 'api',
            name: 'api', 
            component: () => import(/* webpackChunkName: "api" */ '../views/dev/api/api.vue'),
          },
          {
            path: 'faqDev',
            name: 'faqDev', 
            component: () => import(/* webpackChunkName: "faqDev" */ '../views/dev/faq/faq.vue'),
          } 
        ]
      }
    ]
  }
];

export default routes;
