import request from '@/utils/request'

// 增
export function createRule(data) {
  return request({
    url: '/api/rules/',
    method: 'post',
    data
  })
}
// 删
export function delteRule(id) {
  return request({
    url: '/api/rules/' + id + '/',
    method: 'delete'
  })
}
// 改
export function updateRule(id, data) {
  return request({
    url: '/api/rules/' + id + '/',
    method: 'patch',
    data
  })
}
// 查
export function getRule(params) {
  return request({
    url: '/api/rules/',
    params
  })
}

