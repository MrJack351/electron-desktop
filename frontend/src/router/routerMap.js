const constantRouterMap = [
  {
    path: '/login',
    name: 'LoginIndex',
    component: () => import('@/views/login/Index.vue')
  },
  {
    path: '/',
    redirect: { name: 'LoginIndex' } // 根路径重定向到 /login
  },
  {
    path: '/home',
    name: 'HomeIndex',
    component: () => import('@/views/home/Index.vue')
  },
];

export default constantRouterMap;
