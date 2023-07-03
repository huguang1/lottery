import request from '@/utils/request'
// 增
export function createInfo(data) {
  return request({
    url: '/api/settings/',
    method: 'post',
    data
  })
}
// 查
export function getInfo() {
  return request({
    url: '/api/settings/'
  })
}
// 改
export function updateInfo(id, data) {
  return request({
    url: '/api/settings/' + id + '/',
    method: 'patch',
    data
  })
}
