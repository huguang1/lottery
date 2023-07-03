import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/api/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/api/info',
    method: 'post',
    data: { token }
  })
}

export function logout() {
  return request({
    url: '/api/logout',
    method: 'post'
  })
}

// 增
export function createUser(data) {
  return request({
    url: '/api/users/',
    method: 'post',
    data
  })
}
// 删
export function delteUser(id) {
  return request({
    url: '/api/users/' + id + '/',
    method: 'delete'
  })
}
// 改
export function updateUser(id, data) {
  return request({
    url: '/api/users/' + id + '/',
    method: 'patch',
    data
  })
}
// 查
export function getUser(params) {
  return request({
    url: '/api/users/',
    params
  })
}
