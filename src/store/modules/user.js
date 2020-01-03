import { loginByUsername, logout, getUserInfo, corpAuth, checkRefreshToken } from '@/api/login'
import { getToken, setToken, removeToken, getRefreshToken, setRefreshToken, removeRefreshToken } from '@/utils/auth'

const user = {
  state: {
    user: '',
    status: '',
    code: '',
    token: getToken(),
    refresh_token: getRefreshToken(),
    name: '',
    avatar: '',
    introduction: '',
    roles: [],
    role_id: '',
    depts: [],
    roleoptions: [],
    setting: {
      articlePlatform: []
    },
    ctrlperm: []
  },

  mutations: {
    SET_CODE: (state, code) => {
      state.code = code
    },
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_REFRESH_TOKEN: (state, token) => {
      state.refresh_token = token
    },
    SET_INTRODUCTION: (state, introduction) => {
      state.introduction = introduction
    },
    SET_SETTING: (state, setting) => {
      state.setting = setting
    },
    SET_STATUS: (state, status) => {
      state.status = status
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_ROLEID: (state, roles) => {
      state.role_id = roles
    },
    SET_PHONE: (state, phone) => {
      state.phone = phone
    },
    SET_IDENTIFY: (state, identify) => {
      state.identify = identify
    },
    SET_CTRLPERM: (state, ctrlperm) => {
      state.ctrlperm = ctrlperm
    },
    SET_DEPTS: (state, depts) => {
      state.depts = depts
    },
    SET_ROLEOPTIONS: (state, roleoptions) => {
      state.roleoptions = roleoptions
    }
  },

  actions: {
    // 用户名登录
    LoginByUsername({ commit }, userInfo) {
      const username = userInfo.username.trim()
      return new Promise((resolve, reject) => {
        loginByUsername(username, userInfo.password, userInfo.verify, userInfo.verifycode).then(response => {
          const data = response.data
          commit('SET_TOKEN', data.token)
          commit('SET_REFRESH_TOKEN', data.refresh_token)
          setToken(response.data.token)
          setRefreshToken(data.refresh_token)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 企业微信认证
    corpAuth({ commit }, code) {
      return new Promise((resolve, reject) => {
        corpAuth(code).then(response => {
          console.log('corpAuth response...', response)
          const data = response.data
          if (data.status === 'ok') {
            commit('SET_TOKEN', data.token)
            commit('SET_REFRESH_TOKEN', data.refresh_token)
            setToken(data.token)
            setRefreshToken(data.refresh_token)
            resolve()
          }
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetUserInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getUserInfo(state.token).then(response => {
          // 由于mockjs 不支持自定义状态码只能这样hack
          if (!response.data) {
            reject('Verification failed, please login again.')
          }
          const data = response.data

          if (data.roles && data.roles.length > 0) { // 验证返回的roles是否是一个非空数组
            commit('SET_ROLES', data.roles)
          } else {
            reject('getInfo: roles must be a non-null array!')
          }

          commit('SET_ROLEID', data.role_id)
          commit('SET_NAME', data.name)
          commit('SET_AVATAR', data.avatar)
          commit('SET_INTRODUCTION', data.introduction)
          commit('SET_PHONE', data.phone)
          commit('SET_IDENTIFY', data.identify)
          commit('SET_CTRLPERM', data.ctrlperm)
          commit('SET_DEPTS', data.depts)
          commit('SET_ROLEOPTIONS', data.roleoptions)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 第三方验证登录
    // LoginByThirdparty({ commit, state }, code) {
    //   return new Promise((resolve, reject) => {
    //     commit('SET_CODE', code)
    //     loginByThirdparty(state.status, state.email, state.code).then(response => {
    //       commit('SET_TOKEN', response.data.token)
    //       setToken(response.data.token)
    //       resolve()
    //     }).catch(error => {
    //       reject(error)
    //     })
    //   })
    // },

    // 登出
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          commit('SET_TOKEN', '')
          commit('SET_REFRESH_TOKEN', '')
          commit('SET_ROLES', [])
          removeToken()
          removeRefreshToken()
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        commit('SET_REFRESH_TOKEN', '')
        removeToken()
        removeRefreshToken()
        resolve()
      })
    },

    // accessToken超时
    handleCheckRefreshToken({ state, commit }) {
      return new Promise((resolve, reject) => {
        // console.log('state.token', state.token)
        // console.log('state.refresh_token', state.refresh_token)
        checkRefreshToken().then(res => {
          // console.log('checkRefreshToken', state.refresh_token, res)
          const data = res.data
          commit('SET_TOKEN', data.token)
          commit('SET_REFRESH_TOKEN', data.refresh_token)
          setToken(data.token)
          setRefreshToken(data.refresh_token)
          resolve()
        }).catch(() => {
          // console.log('error.......', error)
          // reject(error)
        })
      })
    },

    // 动态修改权限
    // 修改，token 不变化 只要求变化菜单及权限
    ChangeRoles({ commit, dispatch }, role) {
      return new Promise(resolve => {
        // commit('SET_TOKEN', role)
        // setToken(role)
        getUserInfo(role).then(response => {
          const data = response.data
          commit('SET_ROLES', data.roles)
          commit('SET_ROLEID', data.role_id)
          commit('SET_NAME', data.name)
          commit('SET_AVATAR', data.avatar)
          commit('SET_INTRODUCTION', data.introduction)
          commit('SET_PHONE', data.phone)
          commit('SET_IDENTIFY', data.identify)
          commit('SET_CTRLPERM', data.ctrlperm)
          commit('SET_DEPTS', data.depts)
          commit('SET_ROLEOPTIONS', data.roleoptions)
          dispatch('GenerateRoutes', data) // 动态修改权限后 重绘侧边菜单
          resolve()
        })
      })
    }

    // // 动态修改权限
    // ChangeRoles({ commit, dispatch }, role) {
    //   return new Promise(resolve => {
    //     commit('SET_TOKEN', role)
    //     setToken(role)
    //     getUserInfo(role).then(response => {
    //       const data = response.data
    //       commit('SET_ROLES', data.roles)
    //       commit('SET_NAME', data.name)
    //       commit('SET_AVATAR', data.avatar)
    //       commit('SET_INTRODUCTION', data.introduction)
    //       dispatch('GenerateRoutes', data) // 动态修改权限后 重绘侧边菜单
    //       resolve()
    //     })
    //   })
    // }

  }
}

export default user
