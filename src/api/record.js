import request from '@/utils/request'

// 增
export function createRecord(data) {
  return request({
    url: '/api/records/',
    method: 'post',
    data
  })
}
// 删
export function delteRecord(id, data = []) {
  return request({
    url: '/api/records/' + id + '/',
    method: 'delete',
    data: data
  })
}
// 改
export function updateRecord(id, data) {
  return request({
    url: '/api/records/' + id + '/',
    method: 'patch',
    data
  })
}
// 查
export function getRecord(params) {
  return request({
    url: '/api/records/',
    params
  })
}

