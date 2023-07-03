<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.user" placeholder="请输入会员账号" style="width: 200px" class="filter-item" clearable @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.isSend" clearable placeholder="是否派送" class="filter-item">
        <el-option
          v-for="item in sendOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-button :icon="listQuery.user?'el-icon-search':'el-icon-refresh'" class="filter-item" type="primary" @click="handleFilter">{{ listQuery.user?'搜索':'刷新' }}</el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">添加</el-button>
      <el-button :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">下载</el-button>
      <el-button class="filter-item" type="primary" @click="changeAllRecords('lock')">选中锁定</el-button>
      <el-button class="filter-item" type="primary" @click="changeAllRecords('send')">选中派送</el-button>
      <el-button v-if="roles.includes('6')" class="filter-item" type="danger" @click="deleteAllRecords">一键清空</el-button>
      <el-button class="filter-item" type="danger" @click="deleteBulkRecords">批量删除</el-button>
      <el-select v-model="freshTime" class="filter-item" size="small" style="width: 100px" placeholder="刷新时间">
        <el-option
          v-for="item in times"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
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
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="35px"
      />
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
      <el-table-column label="中奖ID" align="center" min-width="70px">
        <template slot-scope="scope">
          <span>{{ scope.row.prizeId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="中奖礼品" align="center" min-width="195px">
        <template slot-scope="scope">
          <span>{{ scope.row.prizeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="中奖时间" align="center" min-width="160px">
        <template slot-scope="scope">
          <span>{{ scope.row.datetime | datetimeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="抽奖方式" class-name="status-col" min-width="86px">
        <template slot-scope="scope">
          <el-tag :type="scope.row.type | typeToColor" size="mini">{{ scope.row.type | typeToText }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="抽奖IP" align="center" min-width="130px">
        <template slot-scope="scope">
          <span>{{ scope.row.ip }}</span>
        </template>
      </el-table-column>
      <el-table-column label="发送时间" align="center" min-width="160px">
        <template slot-scope="scope">
          <span v-if="scope.row.isSend === 1">{{ scope.row.sendTime | datetimeFilter }}</span>
          <el-tag v-else :type="scope.row.isSend === 0 ? 'warning': 'danger'" size="mini" disable-transitions>{{ scope.row.isSend| sendToText }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" min-width="228px">
        <template slot-scope="scope">
          <el-button v-if="scope.row.isSend===0" size="mini" type="warning" @click="handleSend(scope.$index, scope.row.id, 2)">锁定</el-button>
          <el-button v-else-if="scope.row.isSend === 2 && scope.row.censor === name" size="mini" type="primary" @click="handleSend(scope.$index, scope.row.id, 1)">派送</el-button>
          <el-button v-else disabled size="mini" type="primary">派送</el-button>
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
        <el-form-item label="礼品名称">
          <el-input v-model="temp.prizeName" />
        </el-form-item>
        <el-form-item v-if="dialogStatus === 'create'" label="中奖时间" prop="datetime">
          <el-date-picker v-model="temp.datetime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="选择时间" />
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
import { getRecord, createRecord, updateRecord, delteRecord } from '../../api/record'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { mapGetters } from 'vuex'

export default {
  name: 'Record',
  components: { Pagination },
  filters: {
    typeToColor(type) {
      const types = ['success', 'info', 'danger']
      return types[parseInt(type)]
    },
    typeToText(type) {
      const types = ['自然抽奖', '内定抽奖', '后台添加']
      return types[parseInt(type)]
    },
    sendToColor(status) {
      const types = ['warning', 'success']
      return types[parseInt(status)]
    },
    sendToText(status) {
      const types = ['未送出', '已送出', '处理中']
      return types[parseInt(status)]
    },
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
      multipleSelection: [],
      freshTime: 0,
      sendOptions: [
        { value: 0, label: '未派发' },
        { value: 1, label: '已派发' },
        { value: undefined, label: '全部' }
      ],
      times: [
        { value: 0, label: '自动刷新' },
        { value: 5, label: '每5秒' },
        { value: 15, label: '每15秒' },
        { value: 30, label: '每30秒' },
        { value: 60, label: '每1分钟' },
        { value: 600, label: '每10分钟' },
        { value: -1, label: '关闭刷新' }
      ],
      lastRunTime: undefined,
      isPlaying: false,
      currentTime: undefined,
      intervalid1: undefined,
      intervalid2: undefined,
      currentId: 0,
      total: 0,
      tableKey: 0,
      list: null,
      down: null,
      listLoading: true,
      listQuery: {
        page: 1,
        page_size: 20,
        user: undefined,
        ordering: '-id',
        isSend: undefined
      },
      downloadLoading: false,
      textMap: {
        create: '添加',
        update: '编辑'
      },
      dialogStatus: '',
      dialogFormVisible: false,
      temp: {
        id: undefined,
        user: '',
        prizeName: undefined,
        datetime: new Date()
      }
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'roles'
    ])
  },
  watch: {
    freshTime: function(newTime, oldTime) {
      if (newTime === 0 || newTime === -1) {
        clearInterval(this.intervalid2)
        this.intervalid2 = undefined
      } else {
        clearInterval(this.intervalid2)
        this.intervalid2 = setInterval(() => {
          this.getList()
        }, newTime * 1000)
      }
    }
  },
  created() {
    this.getList()
    this.intervalid1 = setInterval(() => {
      this.freshList()
    }, 2500)
  },
  mounted() {
    this.freshList()
  },
  beforeDestroy() {
    clearInterval(this.intervalid1)
    clearInterval(this.intervalid2)
  },
  methods: {
    deleteBulkRecords() {
      this.$confirm(`该操作会永久删除${this.multipleSelection.length}条信息，是否继续？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delteRecord('bulk', this.multipleSelection).then(() => {
          this.$message({ type: 'success', message: '删除成功' })
          this.getList()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val.map(item => item.id)
    },
    play() {
      this.lastRunTime = Date.now()
      const audio = document.querySelector('#audio')
      if (!this.isPlaying) {
        audio.play()
        this.isPlaying = true
      }
      const timeOut = setTimeout(() => {
        this.stop(timeOut)
      }, 3000)
    },
    stop(timeOut) {
      this.currentTime = Date.now()
      const audio = document.querySelector('#audio')
      if (this.currentTime - this.lastRunTime > 2999) {
        if (this.isPlaying) {
          audio.currentTime = 0
          audio.pause()
          this.isPlaying = false
        }
      }
      clearTimeout(timeOut)
    },
    freshList() {
      const query = {
        min_rec: this.currentId,
        ordering: '-id'
      }
      if (!(this.currentId === 0)) {
        getRecord(query).then(response => {
          if (response.data.count > 0) {
            this.play()
            if (this.freshTime === 0) {
              this.getList()
            }
            response.data.results.forEach((item, index) => {
              if (index === 0) {
                this.currentId = item.id
              }
              this.$notify({
                title: `新的记录${item.id}`,
                message: `用户 ${item.user} 砸中 ${item.prizeName}`,
                type: 'warning',
                duration: 2000
              })
            })
          }
        }).catch(err => {
          console.log(err)
          clearInterval(this.intervalid1)
        })
      }
    },
    getList() {
      this.listLoading = true
      getRecord(this.listQuery).then(response => {
        this.list = response.data.results
        if (this.list.length > 0) {
          if (this.listQuery.ordering === '-id') {
            const newId = this.list[0].id
            this.currentId = newId > this.currentId ? newId : this.currentId
          } else {
            const newId = response.data.results.pop().id
            this.currentId = newId > this.currentId ? newId : this.currentId
          }
        }
        this.total = response.data.count
        this.listLoading = false
      }).catch(err => {
        console.log(err)
        this.freshTime = 0
        this.listLoading = false
        clearInterval(this.intervalid2)
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
        prizeId: undefined,
        datetime: new Date()
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
      this.$confirm('删除这条记录，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delteRecord(row.id).then(() => {
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
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 处理下载Excel请求
    handleDownload() {
      this.downloadLoading = true
      const title = '抽奖' + new Date().toDateString()
      getRecord({ page_size: 5000, isSend: this.listQuery.isSend }).then(response => {
        this.down = response.data.results
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['会员账号', '中奖礼品', '中奖时间', '抽奖IP', '是否发送']
          const filterVal = ['user', 'prizeName', 'datetime', 'ip', 'isSend']
          const data = this.formatJson(filterVal, this.down)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: title
          })
          this.downloadLoading = false
        })
      })
    },
    formatJson(filterVal, jsonData) {
      const types = ['未送出', '已送出']
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'isSend') {
          return types[v[j]]
        } else {
          return v[j]
        }
      }))
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
          createRecord(this.temp).then(response => {
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
          updateRecord(tempData.id, tempData).then(() => {
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
    // 处理派送
    handleSend(index, id, status) {
      const data = {
        isSend: status,
        sendTime: status === 1 ? new Date() : undefined
      }
      const message = {
        1: '派送成功',
        2: '锁定成功'
      }
      updateRecord(id, data).then(response => {
        if (response.data.code && response.data.code === 1) {
          for (const v of this.list) {
            if (v.id === id) {
              const index = this.list.indexOf(v)
              this.list.splice(index, 1, response.data.data)
              break
            }
          }
          this.$notify({
            title: '提示',
            message: '操作失败：记录被锁定',
            type: 'warning',
            duration: 2000
          })
        } else {
          for (const v of this.list) {
            if (v.id === id) {
              const index = this.list.indexOf(v)
              this.list.splice(index, 1, response.data)
              break
            }
          }
          this.$notify({
            title: '成功',
            message: message[status],
            type: 'success',
            duration: 2000
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
        delteRecord('all').then(() => {
          this.$message({ type: 'success', message: '删除成功' })
          this.list = null
          this.total = 0
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    changeAllRecords(flag) {
      const operate = flag === 'send' ? '派送' : '锁定'
      this.$confirm(`该操作会${operate}选中记录，是否继续？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        updateRecord(flag, this.multipleSelection).then(() => {
          this.$message({ type: 'success', message: `${operate}成功` })
          this.getList()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: `已取消${operate}`
        })
      })
    }
  }
}
</script>
