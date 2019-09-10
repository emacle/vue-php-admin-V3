const treemenu = [
  {
    id: 0,
    pid: -1,
    title: '顶级菜单',
    children: [
      {
        id: 1,
        pid: 0,
        title: '系统管理',
        children: [
          {
            id: 2,
            title: '菜单管理',
            pid: 1

          },
          {
            id: 3,
            title: '用户管理',
            pid: 1

          },
          {
            id: 4,
            title: '图标管理',
            pid: 1

          }
        ]
      },
      {
        id: 6,
        title: '其他管理',
        pid: 0

      }
    ]
  }

]
export default treemenu

