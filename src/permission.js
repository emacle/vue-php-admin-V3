import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css'// progress bar style
import { getToken } from '@/utils/auth' // getToken from cookie

NProgress.configure({ showSpinner: false })// NProgress Configuration

// permission judge function
function hasPermission(roles, permissionRoles) {
  if (roles.indexOf('admin') >= 0) return true // admin permission passed directly
  if (!permissionRoles) return true
  return roles.some(role => permissionRoles.indexOf(role) >= 0)
}

// 获取当前 location.href 里的参数值
function getUrlParms(name) {
  var reg = new RegExp('(^|\\?|&)' + name + '=([^&]*)(\\s|&|$)', 'i')
  console.log('getvl', location.href)
  // http://localhost:9527/?code=8xpU6UL2kEiJngHmjOD87ZBbI2gC_bU1uGOMXvyVmn0&state=4924807670805111#/login?redirect=%2Fdashboard
  if (reg.test(location.href)) { return unescape(RegExp.$2.replace(/\+/g, ' ')) }
  return ''
}

const whiteList = ['/login', '/auth-redirect']// no redirect whitelist

router.beforeEach((to, from, next) => {
  NProgress.start() // start progress bar
  // console.log('router.beforeEach', location.href, location.search)
  // router.beforeEach http://localhost:9528/?code=n4uPVrJnUocs8j5VY7R8URpn1oP6a2nXkRPDwkScEkc&state=3962010581621585
  // location.search ?code=n4uPVrJnUocs8j5VY7R8URpn1oP6a2nXkRPDwkScEkc&state=3962010581621585
  if (location.search && location.search.indexOf('code=') >= 0 && location.search.indexOf('state=') >= 0) {
    const code = getUrlParms('code')
    // console.log('weixin code: ', code)
    store.state.user.code = code
    // console.log(store.state.user)  // 该code 在store/modules/user.js 里定义有 作为第三方登录使用 参见其中 LoginByThirdparty
  }
  if (to.meta.title) {
    document.title = to.meta.title + ' - Vue Element Admin'
  }
  if (getToken()) { // determine if there has token
    /* has token*/
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done() // if current page is dashboard will not trigger	afterEach hook, so manually handle it
    } else {
      // console.log('permissions.js window.location...', location)
      // hash: "#/dashboard"
      // search: "?code=0v3XiK9oMVHDMT0AIdE3FpPKNfJmNIjntJraR0rvqQk&state=8479171645418553"
      // 微信扫码登录去掉?code state参数
      // if (location.search.indexOf('code=') >= 0 && location.search.indexOf('state=') >= 0) {
      //   window.location.replace(window.location.origin + '/' + window.location.hash)
      //   // TODO: 成功登录后 去掉 ?code=xxxxx 好像多跳转了几次
      //   // window.location.replace(window.location.origin)
      // }
      if (store.getters.roles.length === 0) { // 判断当前用户是否已拉取完user_info信息
        store.dispatch('GetUserInfo').then(res => { // 拉取user_info
          // const roles = res.data.roles // note: roles must be a array! such as: ['editor','develop']
          const asyncRouterMap = res.data.asyncRouterMap
          // console.log('asyncRouterMap', asyncRouterMap)
          store.dispatch('GenerateRoutes', { asyncRouterMap }).then(() => { // 根据roles权限生成可访问的路由表
            router.addRoutes(store.getters.addRouters) // 动态添加可访问路由表
            next({ ...to, replace: true }) // hack方法 确保addRoutes已完成 ,set the replace: true so the navigation will not leave a history record
          })
        }).catch((err) => {
          store.dispatch('FedLogOut').then(() => {
            Message.error(err)
            next({ path: '/' })
          })
        })
      } else {
        // 没有动态改变权限的需求可直接next() 删除下方权限判断 ↓
        if (hasPermission(store.getters.roles, to.meta.roles)) {
          next()
        } else {
          next({
            path: '/401', replace: true, query: { noGoBack: true }
          })
        }
        // 可删 ↑
      }
    }
  } else {
    /* has no token*/
    if (whiteList.indexOf(to.path) !== -1) { // 在免登录白名单，直接进入
      next()
    } else {
      next(`/login?redirect=${to.path}`) // 否则全部重定向到登录页
      NProgress.done() // if current page is login will not trigger afterEach hook, so manually handle it
    }
  }
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})
