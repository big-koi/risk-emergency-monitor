import Vue from 'vue'
import Router from 'vue-router'
import layout from '../layout/index'
import login from '../views/login'

Vue.use(Router)

export default new Router({
  routes: [
    {
      name: 'login',
      path: '/login',
      component: login
    },
    {
      path: '/',
      name: 'layout',
      component: layout,
      redirect: '/rapidAnalysis',
      children: [
        {
          path: '/rapidAnalysis',
          name: 'rapidAnalysis', // 快速评估
          component: () => import('../views/rapidAnalysis/index')
        }
      ]
    },
    {
      path: '/integration',
      name: 'integration',
      component: () => import('../views/integration/index')
    }
  ]
})
