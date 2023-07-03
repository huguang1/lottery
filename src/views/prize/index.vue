<!--suppress ALL -->
<template>
  <div class="app-container">
    <el-button type="success" @click="addPrize">添加礼品</el-button>
    <el-tabs v-if="Data" v-model="tabName" type="border-card" style="margin-top: 20px">
      <el-tab-pane
        v-for="item in category"
        :key="item.name"
        :label="item.name"
        :name="item.name"
      >
        <el-table
          v-loading="prizeLoading"
          :data="item.prizes"
          element-loading-text="获取中"
          border
          fit
          highlight-current-row
          style="margin-top: 20px"
        >
          <el-table-column align="center" label="礼品编号" min-width="12.5%">
            <template slot-scope="scope">
              {{ scope.row.code }}
            </template>
          </el-table-column>
          <el-table-column align="center" label="礼品名称" min-width="37.5%">
            <template slot-scope="scope">
              {{ scope.row.prize_name }}
            </template>
          </el-table-column>
          <el-table-column align="center" label="中奖权重" min-width="12.5%">
            <template slot-scope="scope">
              {{ scope.row.probability }}
            </template>
          </el-table-column>
          <el-table-column label="中奖率" min-width="12.5%" align="center">
            <template slot-scope="scope">
              {{ scope.row.probability/totalProb(item.prizes) | toPer }}
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作" min-width="25%">
            <template slot-scope="scope">
              <el-button type="primary" @click="editPrize(scope.row)">编辑</el-button>
              <el-button type="danger" @click="deletePrize(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
    <div v-else style="margin-top: 20px">暂无数据</div>
    <el-dialog
      :title="titleMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
    >
      <el-form :model="form">
        <el-form-item label="分组">
          <el-autocomplete
            v-model="form.grade"
            :fetch-suggestions="querySearch"
            placeholder="请输入分组"
          />
        </el-form-item>
        <el-form-item label="礼品编号">
          <el-input v-model="form.code" />
        </el-form-item>
        <el-form-item label="礼品名称">
          <el-input v-model="form.prize_name" />
        </el-form-item>
        <el-form-item label="中奖权重">
          <el-input v-model="form.probability" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button @click="dialogConfirm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getPrize, updatePrize, deltePrize, createPrize } from '../../api/prize'

export default {
  name: 'Prize',
  filters: {
    toPer(point) {
      if (point === 0) {
        return 0
      } else {
        let str = Number(point * 100).toFixed(2)
        str += '%'
        return str
      }
    }
  },
  data() {
    return {
      category: [],
      Data: true,
      tabName: undefined,
      prizes: null,
      prizeLoading: true,
      titleMap: {
        addPrize: '新增礼品',
        editPrize: '编辑礼品'
      },
      dialogStatus: '',
      dialogFormVisible: false,
      form: {
        grade: '',
        code: '',
        prize_name: '',
        probability: ''
      }
    }
  },
  created() {
    this.fetchPrizes()
  },
  methods: {
    totalProb(prizes) {
      let total = 0
      prizes.forEach(function(value, index, array) {
        total += parseFloat(value.probability)
      })
      return total
    },
    querySearch(queryString, cb) {
      getPrize().then(response => {
        if (response.data.length === 0) {
          cb([{ value: '默认' }])
        } else {
          cb(response.data.map(item => { return { value: item['name'] } }))
        }
      })
    },
    fetchPrizes() {
      this.prizeLoading = true
      // api: /prizes
      getPrize().then(response => {
        this.category = response.data
        if (response.data.length === 0) { this.Data = false; return } else { this.Data = true }
        if (this.tabName === '0' || response.data.map(item => item['name']).indexOf(this.tabName) === -1) {
          this.tabName = response.data[0]['name']
        }
      })
      this.prizeLoading = false
    },
    addPrize() {
      this.dialogFormVisible = true
      this.dialogStatus = 'addPrize'
      this.form = {
        grade: '',
        code: '',
        prize_name: '',
        probability: ''
      }
    },
    deletePrize(row) {
      deltePrize(row.id).then(() => {
        this.$notify({
          title: '成功',
          message: '删除成功',
          type: 'success',
          duration: 2000
        })
        this.fetchPrizes()
      })
    },
    editPrize(row) {
      this.form = Object.assign({}, row)
      this.dialogFormVisible = true
      this.dialogStatus = 'editPrize'
    },
    dialogConfirm() {
      if (this.dialogStatus === 'editPrize') {
        const tempData = Object.assign({}, this.form)
        updatePrize(tempData.id, tempData).then(() => {
          this.fetchPrizes()
          this.dialogFormVisible = false
          this.$notify({
            title: '成功',
            message: '更新成功',
            type: 'success',
            duration: 2000
          })
        })
      } else {
        createPrize(this.form).then(response => {
          this.fetchPrizes()
          this.dialogFormVisible = false
          this.$notify({
            title: '成功',
            message: '创建成功',
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

