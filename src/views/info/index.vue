<template>
  <div class="app-container">
    <el-form ref="infoForm" :model="list" label-width="160px" abel-position="left" style="margin-top: 30px">
      <el-form-item label="活动名称">
        <el-input v-model="list.name" style="width: 400px" />
      </el-form-item>
      <el-form-item label="是否启用">
        <el-switch v-model="list.is_open" active-color="#13ce66" inactive-color="#ff4949" />
      </el-form-item>
      <el-form-item label="关闭提示">
        <el-input v-model="list.errmsg" :autosize="{ minRows: 2, maxRows: 4}" style="width: 400px" type="textarea" clearable />
      </el-form-item>
      <el-form-item label="时间范围">
        <el-date-picker
          v-model="list.datetimerange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item label="每日范围" class="postInfo-container-item">
        <el-time-picker v-model="list.day_start" placeholder="每日开始时间" value-format="HH:mm:ss" format="HH:mm:ss" />
      </el-form-item>
      <el-form-item label="" class="postInfo-container-item">
        <el-time-picker v-model="list.day_end" placeholder="每日结束时间" value-format="HH:mm:ss" format="HH:mm:ss" />
      </el-form-item>
      <el-form-item style="margin-top: 20px;margin-left: 80px">
        <el-button size="medium" type="info" @click="getList">重置表单</el-button>
        <el-button size="medium" type="primary" @click="handleCommit">提交保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { createInfo, getInfo, updateInfo } from '../../api/info'
export default {
  name: 'Info',
  data() {
    return {
      list: {
        id: undefined,
        name: '',
        is_open: false,
        errmsg: '',
        datetimerange: [],
        day_start: '17:00:00',
        day_end: '23:59:59'
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      getInfo().then(response => {
        if (response.data.count === 0) {
          this.$notify({
            title: '提示',
            message: '请初始化活动信息',
            type: 'info',
            duration: 2000
          })
          this.list = {
            id: undefined,
            name: '',
            is_open: false,
            errmsg: '',
            datetimerange: [],
            day_start: '17:00:00',
            day_end: '23:59:59'
          }
        } else {
          const data = response.data.results.pop()
          this.list = data
          this.list.datetimerange = [data.start_time, data.end_time]
        }
      })
    },
    handleCommit() {
      const tempData = Object.assign({}, this.list)
      tempData['start_time'] = this.list.datetimerange[0]
      tempData['end_time'] = this.list.datetimerange[1]
      if (tempData['id'] === undefined) {
        createInfo(tempData).then(response => {
          this.list = response.data
          this.list.datetimerange = [response.data.start_time, response.data.end_time]
          this.$notify({
            title: '成功',
            message: '更新成功',
            type: 'success',
            duration: 2000
          })
        })
      } else {
        updateInfo(tempData['id'], tempData).then(response => {
          this.list = response.data
          this.list.datetimerange = [response.data.start_time, response.data.end_time]
          this.$notify({
            title: '成功',
            message: '更新成功',
            type: 'success',
            duration: 2000
          })
        })
      }
    }
  }
}
</script>

<style scoped>

</style>
