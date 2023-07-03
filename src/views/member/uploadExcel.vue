<template>
  <div class="app-container">
    <el-button type="primary"><a href="/static/excel/sample.xlsx" download="砸金蛋上传模板.xlsx">点击下载模板</a></el-button>
    <upload-excel-component :on-success="handleSuccess" :before-upload="beforeUpload" />
    <div v-show="commit" class="upload-commit">
      <el-button class="filter-item" type="primary" size="medium" @click="handleReset">重置</el-button>
      <el-button class="filter-item" type="primary" size="medium" @click="handleUpload">提交</el-button>
    </div>
    <el-table :data="tableData" border highlight-current-row style="width: 100%;margin-top:20px;">
      <el-table-column v-for="item of tableHeader" :key="item" :prop="item" :label="item" />
    </el-table>
  </div>
</template>

<script>
import UploadExcelComponent from '@/components/UploadExcel/index.vue'
import { createRule } from '../../api/rule'

export default {
  name: 'UploadExcel',
  components: { UploadExcelComponent },
  data() {
    return {
      tableData: [{ user: '示例', sequence: '1,2,?,3', score: 0, type: '默认' }],
      tableHeader: ['user', 'sequence', 'score', 'type'],
      commit: false
    }
  },
  methods: {
    beforeUpload(file) {
      const isLt1M = file.size / 1024 / 1024 < 1

      if (isLt1M) {
        return true
      }

      this.$message({
        message: '上传文件大小应小于1M.',
        type: 'warning'
      })
      return false
    },
    handleSuccess({ results, header }) {
      this.tableData = results
      this.tableHeader = header
      this.commit = true
    },
    handleUpload() {
      createRule(this.tableData).then(() => {
        this.$notify({
          title: '成功',
          message: '导入成功',
          type: 'success',
          duration: 2000
        })
        this.tableData = []
        this.tableHeader = []
        this.commit = false
      })
    },
    handleReset() {
      this.tableData = []
      this.tableHeader = []
      this.commit = false
    }
  }
}
</script>

<style scoped>
.upload-commit{
  margin-top: 10px;
  text-align: center;
}
</style>
