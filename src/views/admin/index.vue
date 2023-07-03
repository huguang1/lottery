<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">添加</el-button>
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
      <el-table-column label="编号" prop="id" sortable="custom" align="center" min-width="50px">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="管理账号" align="center" min-width="160px">
        <template slot-scope="scope">
          <span>{{ scope.row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="超级用户状态" align="center" min-width="70px">
        <template slot-scope="scope">
          <span><i :class="[scope.row.is_superuser===true?'el-icon-success':'el-icon-error', 'el-alert__icon']" :style="scope.row.is_superuser===true?'color: #67c23a':'color:#333333'" /></span>
        </template>
      </el-table-column>
      <el-table-column label="上次登录" align="center" min-width="195px">
        <template slot-scope="scope">
          <span>{{ scope.row.last_login | datetimeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" min-width="288px">
        <template slot-scope="scope">
          <el-button type="primary" @click="handleUpdate(scope.row, 'update')">权限</el-button>
          <el-button type="warning" @click="handleUpdate(scope.row, 'pwd')">改密</el-button>
          <el-button type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.page_size" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :model="temp" :rules="setRules" label-position="left" label-width="90px" style="width: 400px; margin-left:50px;">
        <el-form-item label="会员账号" prop="username">
          <el-input v-model="temp.username" :disabled="dialogStatus==='update' || dialogStatus==='pwd'" />
        </el-form-item>
        <el-form-item v-if="dialogStatus==='create'||dialogStatus==='update'" label="超级用户">
          <el-switch v-model="temp.is_superuser" active-color="#13ce66" inactive-color="#ff4949" />
          <i>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(超级用户自动拥有所有权限)</i>
        </el-form-item>
        <el-form-item v-if="dialogStatus==='create'||dialogStatus==='update'" label="权限">
          <el-select v-model="temp.role" multiple placeholder="选择权限">
            <el-option
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            /></el-select>
        </el-form-item>
        <el-form-item v-if="dialogStatus==='create'||dialogStatus==='pwd'" label="密码" prop="password">
          <el-input v-model="temp.password" type="password" />
        </el-form-item>
        <el-form-item v-if="dialogStatus==='create'||dialogStatus==='pwd'" label="密码确认" prop="passwordCheck">
          <el-input v-model="temp.passwordCheck" type="password" />
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
import { getUser, createUser, updateUser, delteUser } from '../../api/user'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'Admin',
  components: { Pagination },
  filters: {
    statusFilter(flag) {
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
    const checkPass = (rule, value, callback) => {
      if (this.temp.passwordCheck && !(this.temp.passwordCheck === value)) {
        callback(new Error('两次密码不一致'))
      } else if (value.length < 6) {
        callback(new Error('密码不能小于6位'))
      } else { callback() }
    }
    const checkCheck = (rule, value, callback) => {
      if (value === this.temp.password) {
        callback()
      } else {
        callback(new Error('两次密码不一致'))
      }
    }
    const checkName = (rule, value, callback) => {
      if (value.length === 0) {
        callback(new Error('用户名不能为空'))
      } else {
        callback()
      }
    }
    return {
      total: 0,
      tableKey: 0,
      list: null,
      listLoading: true,
      downloadLoading: false,
      listQuery: {
        page: 1,
        page_size: 20,
        ordering: '-id'
      },
      textMap: {
        create: '添加',
        pwd: '修改密码',
        update: '编辑'
      },
      dialogStatus: '',
      dialogFormVisible: false,
      temp: {
        id: undefined,
        username: '',
        password: undefined,
        is_superuser: undefined,
        passwordCheck: '',
        role: []
      },
      setRules: {
        password: [{ required: true, trigger: 'blur', validator: checkPass }],
        passwordCheck: [{ required: true, trigger: 'blur', validator: checkCheck }],
        username: [{ required: true, trigger: 'blur', validator: checkName }]
      },
      roleOptions: [{
        label: '奖品管理', value: '1'
      }, {
        label: '活动设置', value: '2'
      }, {
        label: '会员编辑', value: '3'
      }, {
        label: '导入名单', value: '4'
      }, {
        label: '抽奖记录', value: '5'
      }, {
        label: '系统管理', value: '6'
      }]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      getUser(this.listQuery).then(response => {
        const tempRes = response.data.results
        if (tempRes.length > 0) {
          tempRes.forEach(item => {
            item['role'] = item['role'] === '' ? [] : item['role'].split('|')
          })
        }
        this.list = tempRes
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
        username: '',
        password: undefined,
        is_superuser: undefined,
        passwordCheck: '',
        role: []
      }
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 处理更改记录
    handleUpdate(row, flag) {
      this.temp = Object.assign({}, row, { password: undefined, passwordCheck: '' }) // copy obj
      this.dialogStatus = flag
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 处理删除记录
    handleDelete(row) {
      this.$confirm(`该操作会删除账号：${row.username}，是否继续？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delteUser(row.id).then(() => {
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
          const temData = Object.assign({}, this.temp)
          temData['role'] = temData['role'] === [] ? '' : temData['role'].join('|')
          createUser(temData).then(response => {
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
          let tempData = Object.assign({}, this.temp)
          tempData['role'] = tempData['role'] === [] ? '' : tempData['role'].join('|')
          if (this.dialogStatus === 'pwd') {
            tempData = { password: tempData['password'], id: tempData['id'] }
          }
          updateUser(tempData.id, tempData).then(() => {
            this.getList()
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
    }
  }
}
</script>
