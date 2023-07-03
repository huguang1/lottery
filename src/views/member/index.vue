<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.user" placeholder="请输入会员账号" style="width: 200px" class="filter-item" clearable @keyup.enter.native="handleFilter" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">添加</el-button>
      <el-button class="filter-item" type="danger" @click="deleteAllRecords">一键清空</el-button>
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="编号" prop="id" sortable="custom" align="center" min-width="60px">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="会员账号" align="center" min-width="160px">
        <template slot-scope="scope">
          <span>{{ scope.row.user }}</span>
        </template>
      </el-table-column>
      <el-table-column label="会员类别" align="center" min-width="80px">
        <template slot-scope="scope">
          <span>{{ scope.row.type }}</span>
        </template>
      </el-table-column>
      <el-table-column label="活动次数" align="center" min-width="60px">
        <template slot-scope="scope">
          <span>{{ scope.row.score }}</span>
        </template>
      </el-table-column>
      <el-table-column label="顺序" align="center" min-width="70px">
        <template slot-scope="scope">
          <span v-html="seqeFilter(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="添加时间" align="center" min-width="195px">
        <template slot-scope="scope">
          <span>{{ scope.row.addTime | datetimeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" min-width="228px">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.page_size" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="会员账号">
          <el-input v-model="temp.user" />
        </el-form-item>
        <el-form-item label="会员类别">
          <el-autocomplete
            v-model="temp.type"
            :fetch-suggestions="querySearch"
            placeholder="请输入分组"
          />
        </el-form-item>
        <el-form-item label="总顺序">
          <el-input v-model="temp.sequence" />
        </el-form-item>
        <el-form-item label="下次序号">
          <el-input v-model="temp.flag" />
        </el-form-item>
        <el-form-item label="次数">
          <el-input v-model="temp.score" />
        </el-form-item>
        <el-form-item label="添加时间" prop="datetime">
          <el-date-picker v-model="temp.addTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="选择时间" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { getRule, createRule, updateRule, delteRule } from '../../api/rule'
import { getPrize } from '../../api/prize'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'Member',
  components: { Pagination },
  filters: {
    datetimeFilter(time) {
      if (time) {
        return time.split('.')[0].replace('T', ' ')
      } else {
        return time
      }
    }
  },
  data() {
    return {
      total: 0,
      tableKey: 0,
      list: null,
      down: null,
      listLoading: true,
      listQuery: {
        page: 1,
        page_size: 20,
        user: undefined,
        ordering: '-id'
      },
      textMap: {
        create: '添加',
        update: '编辑'
      },
      dialogStatus: '',
      dialogFormVisible: false,
      temp: {
        id: undefined,
        user: '',
        type: '',
        score: undefined,
        sequence: undefined,
        addTime: new Date(),
        flag: undefined
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    querySearch(queryString, cb) {
      getPrize().then(response => {
        if (response.data.length === 0) {
          cb([{ value: '默认' }])
        } else {
          cb(response.data.map(item => { return { value: item['name'] } }))
        }
      })
    },
    seqeFilter(row) {
      const orderList = row.sequence.split(',')
      return orderList.map((v, i) => {
        if (i + 1 < row.flag) {
          return '<span style="color:red">' + v + '</span>'
        } else {
          return v
        }
      }).join(',')
    },
    getList() {
      this.listLoading = true
      getRule(this.listQuery).then(response => {
        this.list = response.data.results
        this.total = response.data.count
        this.listLoading = false
      })
    },
    // 处理查询请求
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    // 处理添加记录
    handleCreate() {
      this.temp = {
        id: undefined,
        user: '',
        sequence: undefined,
        addTime: new Date(),
        flag: 1
      }
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 处理更改记录
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 处理删除记录
    handleDelete(row) {
      delteRule(row.id).then(() => {
        // 删除细节  todo
        this.$notify({
          title: '成功',
          message: '删除成功',
          type: 'success',
          duration: 2000
        })
        const index = this.list.indexOf(row)
        this.list.splice(index, 1)
      })
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        if (order === 'ascending') {
          this.listQuery.ordering = 'id'
        } else {
          this.listQuery.ordering = '-id'
        }
        this.handleFilter()
      }
    },
    // 新增记录
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createRule(this.temp).then(response => {
            this.list.unshift(response.data)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    // 更新记录
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateRule(tempData.id, tempData).then(() => {
            for (const v of this.list) {
              if (v.id === this.temp.id) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, this.temp)
                break
              }
            }
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    deleteAllRecords() {
      this.$confirm('该操作会永久删除所有信息，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delteRule('all').then(() => {
          this.$message({ type: 'success', message: '删除成功' })
          this.list = null
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    }
  }
}
</script>

