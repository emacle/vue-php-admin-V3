import request from '@/utils/request'

export function loginByUsername(username, password, verify, verifycode) {
  const data = {
    username,
    password,
    verify,
    verifycode
  }
  return request({
    // url: 'http://localhost:8889/api/v2/sys/user/login', // 带有http的 会忽略@/utils/request 里的 BaseURL 直接更换了接口
    url: '/sys/user/login',
    method: 'post',
    data
  })
}

export function logout() {
  return request({
    url: '/sys/user/logout',
    method: 'post'
  })
}

export function getUserInfo(token) {
  return request({
    url: '/sys/user/info',
    method: 'get',
    params: { token }
  })
}

// 企业微信认证
export function corpAuth(code) {
  return request({
    url: '/sys/user/corpauth',
    method: 'get',
    params: { code }
  })
}
