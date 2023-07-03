import request from '@/utils/request'

// 增
export function createPrize(data) {
  return request({
    url: '/api/prizes/',
    method: 'post',
    data
  })
}
// 删
export function deltePrize(id) {
  return request({
    url: '/api/prizes/' + id + '/',
    method: 'delete'
  })
}
// 改
export function updatePrize(id, data) {
  return request({
    url: '/api/prizes/' + id + '/',
    method: 'patch',
    data
  })
}
// 查
export function getPrize() {
  return request({
    url: '/api/prizes/?type=category'
  })
}

