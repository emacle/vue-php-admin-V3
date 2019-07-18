/** When your routing table is too long, you can split it into small modules**/

// import Layout from '@/views/layout/Layout'

const treeTableRouter = {
  path: '/tree-table',
  // component: Layout,
  // 作为二级嵌套路由指定上 具体组件， Layout与父组件冲突 indexs 是因为 index已经被使用，
  component: () => import('@/views/tree-table/indexs'),
  redirect: '/table/complex-table',
  name: 'TreeTable',
  meta: {
    title: 'treeTable',
    icon: 'table'
  },
  children: [
    {
      path: 'index',
      component: () => import('@/views/tree-table/index'),
      name: 'TreeTableDemo',
      meta: { title: 'treeTable' }
    },
    {
      path: 'custom',
      component: () => import('@/views/tree-table/custom'),
      name: 'CustomTreeTableDemo',
      meta: { title: 'customTreeTable' }
    }
  ]
}
export default treeTableRouter
