<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-perm="['/sys/user/view']" ref="filterText" v-model.trim="filters[0].value" placeholder="用户名" style="width: 200px;" class="filter-item" />
      <el-select v-perm="['/sys/user/view']" v-model="filters[1].value" clearable class="filter-item">
        <el-option label="启用" value="1" />
        <el-option label="禁用" value="0" />
      </el-select>
      <el-button v-perm="['/sys/user/add']" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleCreate">添加</el-button>
    </div>

    <data-tables-server :data="list" :search-def="searchDef" :total="total" :filters="filters" :table-props="tableProps" :loading="listLoading" :page-size="20" :pagination-props="{ background: true, pageSizes: [20,50,100] }" layout="table,pagination" @query-change="fetchData">
      <el-table-column v-for="title in titles" :prop="title.prop" :label="title.label" :key="title.label" sortable="custom" />
      <el-table-column label="状态" min-width="100px">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter" size="small">{{ scope.row.status | statusChange }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="100px">
        <template slot-scope="scope">
          <el-button v-perm="['/sys/user/edit']" :size="btnsize" type="success" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button v-perm="['/sys/user/del']" :size="btnsize" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </data-tables-server>

    <el-dialog :close-on-click-modal="false" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="" label-width="90px" style="width: 400px; margin-left:50px;">
        <el-form-item label="用户名" prop="username">
          <el-input v-model.trim="temp.username" :readonly="readonly" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item v-if="dialogStatus==='create'" label="密码" prop="password">
          <el-input v-model="temp.password" :type="passwordType">
            <i slot="suffix" class="el-input__icon el-icon-eye" @click="showPwd">
              <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
            </i>
          </el-input>
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model.trim="temp.email" placeholder="请输入email" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <!-- <el-select v-model="temp.role" class="filter-item" multiple="multiple" @remove-tag="removeTag()">
            <el-option v-for="item in roleOptions" :key="item.id" :label="item.name" :value="item.id" :disabled="item.disabled" />
          </el-select> -->
          <treeselect v-model="temp.role" :multiple="true" :clearable="false" :normalizer="normalizer" :options="roleOptions" :limit="2" :required="true" :limit-text=" count => `+ ${count}`" placeholder="请选择角色..." />
        </el-form-item>

        <el-form-item v-for="(item,index) in roledept" :label="item.name" :key="index" prop="roledept">
          <treeselect
            v-model="temp.roledept[item.name+'-'+item.id]"
            :multiple="true"
            :clearable="false"
            :required="true"
            :options="deptOptions"
            :flat="true"
            :max-height="200"
            :limit="2"
            :limit-text=" count => `+ ${count}`"
            :default-expand-level="1"
            sort-value-by="LEVEL"
            placeholder="请选择该角色关联机构..." />
        </el-form-item>

        <el-form-item label="排序ID">
          <!-- onkeypress 防止录入e 及其他字符 -->
          <el-input-number v-model.trim="temp.listorder" :min="0" controls-position="right" onkeypress="return(/[\d]/.test(String.fromCharCode(event.keyCode)))" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="temp.status" inactive-color="#C0CCDA" active-value="1" inactive-value="0" />
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button :loading="updateLoading" type="primary" @click="dialogStatus==='create'?createData():updateData()">确定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import waves from '@/directive/waves' // Waves directive
import perm from '@/directive/perm/index.js' // 权限判断指令

import { createUser, updateUser, deleteUser, getUserList, getRoleOptions, getDeptOptions } from '@/api/user'

// import random from 'string-random'
// import the component
import Treeselect from '@riophae/vue-treeselect'
// import the styles
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'SysUserPhjc',
  // 所以在编写路由 router 和路由对应的 view component 的时候一定要确保 两者的 name 是完全一致的。
  // register the component Treeselect, TreeTable
  components: { Treeselect },
  directives: { waves, perm },
  filters: {
    statusFilter(status) {
      const statusMap = {
        1: 'success',
        0: 'danger'
      }
      return statusMap[status]
    },
    statusChange(status) {
      const statusMapx = {
        1: '启用',
        0: '禁用'
      }
      return statusMapx[status]
    }
  },
  data() {
    // TODO: 参考login页面 引入校验函数 参考党建app mine-password 页面修改密码强度
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('The password can not be less than 6 digits'))
      } else {
        callback()
      }
    }

    return {
      value: null,
      // define treeselect options
      TreeSelectOptions: [],
      // 自定义treeselect key id,label
      normalizer(node) {
        return {
          id: node.id,
          label: node.name,
          children: node.children
        }
      },
      passwordType: 'password',
      searchDef: {
        show: true,
        debounceTime: 3000
      },
      defaultQueryInfo: '',
      filters: [{
        prop: 'username',
        value: ''
      }, {
        prop: 'status',
        value: ''
      }],
      list: [],
      total: 0,
      listLoading: true,
      updateLoading: false,
      titles: [
        {
          prop: 'id',
          label: 'ID'
        },
        {
          prop: 'username',
          label: '用户名'
        },
        {
          prop: 'email',
          label: 'Email'
        },
        {
          prop: 'listorder',
          label: '排序'
        }
      ],
      tableProps: {
        border: false,
        stripe: true,
        highlightCurrentRow: true,
        defaultSort: {
          prop: 'listorder',
          order: 'ascending'
        }
      },
      deptOptions: [],
      roleOptions: [],
      currentUserRoles: [],
      btnsize: 'mini',
      dialogFormVisible: false,
      dialogStatus: '',
      readonly: false,
      textMap: {
        update: '编辑',
        create: '新增'
      },
      temp: {
        id: undefined,
        username: '',
        password: '',
        email: '',
        role: [],
        roledept: [], // 实际为对象?
        roledepts: [],
        status: '1',
        listorder: 1000
      },
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }],
        role: [{ required: true, message: '请选择角色', trigger: 'blur' }]
        // roledept: [{ required: true, message: '请选择角色关联', trigger: 'blur' }]
      }
    }
  },
  computed: {
    roledept() {
      // this.temp.role
      // this.roleOptions
      //  [{"id":"1","name":"超级管理员","remark":"拥有网站最高管理员权限！","status":"1","isDisabled":true,"listorder":"1"},
      //  {"id":"4","name":"测试角色","remark":"","status":"1","isDisabled":false,"listorder":"99"}]
      if (this.temp.role) {
        return this.roleOptions.filter((v) => {
          // return v.isDisabled === false
          for (let i = 0; i < this.temp.role.length; i++) {
            // 超级管员员用户<->超级管理员角色 后台自动新增删除机构
            if (v.id === this.temp.role[i] && v.isDisabled === false) {
              return v
            }
          }
        })
      } else {
        return []
      }
    }
  },
  // watch 监控变量的更改
  watch: {
    'temp.role': function(newV, oldV) {
      const arr = this.subSet(oldV, newV)
      if (arr[0]) {
        // 角色减少时，点击角色选择的X号时，查找减少的role_id
        // 并且 重置该role_id对应的this.temp.roledept 值为[] 即可
        for (let i = 0; i < this.roleOptions.length; i++) {
          if (this.roleOptions[i].id === arr[0]) {
            // console.log(this.roleOptions[i].name + '-' + this.roleOptions[i].id)
            // console.log(this.temp.roledept[this.roleOptions[i].name + '-' + this.roleOptions[i].id])
            this.temp.roledept[this.roleOptions[i].name + '-' + this.roleOptions[i].id] = []
          }
        }
      }
    },
    'temp.roledept': function(newV, oldV) {
      // console.log(oldV)
      // console.log('===>')
      // console.log(newV)
    }
  },
  created() {
    // this.fetchData()
    // this.initRoleAndDeptOptions()
  },
  mounted() {
    this.$refs.filterText.focus()
  },
  methods: {
    // ES6方式 返回数组arr1中比arr2中多出的元素，返回类型为数组
    subSet(arr1, arr2) {
      var set1 = new Set(arr1)
      var set2 = new Set(arr2)
      var subset = []
      for (const item of set1) {
        if (!set2.has(item)) {
          subset.push(item)
        }
      }
      return subset
    },
    removeTag(args) {
      // console.log('removeTag...')
      // console.log(args)
      return
    },
    // 获取数据
    fetchData(queryInfo) {
      // console.log('queryInfo', queryInfo)
      if (!queryInfo) {
        queryInfo = this.defaultQueryInfo
        // console.log(queryInfo)
      }
      // init 类型比较特殊在 created 时发射，保存默认的查询信息，更新数据后调用 fetchData 时 queryInfo为空时调用
      // if (queryInfo.type === 'init') {
      //   this.defaultQueryInfo = queryInfo
      //   console.log('defaultQueryInfo', this.defaultQueryInfo)
      // }
      // defaultQueryInfo 永远保留上次 queryInfo 更新数据后 后调用 fetchData 时，不会初始化到时init 首次页面
      this.defaultQueryInfo = queryInfo

      this.listLoading = true
      getUserList(queryInfo).then(res => {
        // console.log('getUserList', res)
        this.list = res.data.items
        this.total = res.data.total
        this.listLoading = false
      }).catch(() => { })
    },
    // 格式化成树
    formatTree(json) {
      var ret = []
      var o = {}
      function add(arr, data) {
        var obj = {
          'id': data.id,
          'pid': data.pid,
          'label': data.label,
          'children': []
        }
        o[data.id] = obj
        arr.push(obj)
      }

      json.forEach(x => {
        if (o[x.pid]) {
          add(o[x.pid].children, x)
        } else {
          add(ret, x)
        }
      })
      // 遍历 将children为空的 剔除该属性 适合treeselect组件
      this.dealnullchild(ret)
      return ret
    },
    dealnullchild(jsonTreeArr) {
      for (var i = 0; i < jsonTreeArr.length; i++) {
        if (jsonTreeArr[i].children.length === 0) {
          delete jsonTreeArr[i]['children']
        } else {
          this.dealnullchild(jsonTreeArr[i].children)
        }
      }
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        username: '',
        password: '',
        email: '',
        role: [],
        roledept: [],
        roledepts: [],
        status: '1',
        listorder: 1000
      }
      this.readonly = false
    },
    handleCreate() {
      // console.log('handleCreate...click')
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      getRoleOptions().then(res => {
        this.roleOptions = res.data
      })
      getDeptOptions().then(res => {
        this.deptOptions = this.formatTree(res.data)
      })
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        // console.log('createData valid done...', this.temp)
        // roledept全局与this.temp.role 一一 对应
        // this.temp.roldept 表单选择 ObServer 对象 for-in 遍历
        this.temp.roledepts = []
        for (var key in this.temp.roledept) {
          // 构造roledepts结构 {role_id:4,dept_id:["3","4"]}
          if (this.temp.roledept[key].length !== 0) {
            const tmpJson = {
              role_id: key.split('-')[1],
              dept_id: this.temp.roledept[key]
            }
            this.temp.roledepts = this.temp.roledepts.concat(tmpJson)
          }
        }

        if (this.temp.role.length !== this.temp.roledepts.length) {
          this.$notify({
            message: '所选的角色没有关联对应机构, 请检查',
            type: 'error'
          })
          return
        }

        if (valid) {
          // console.log('createData valid done...', this.temp)
          // 调用api创建数据入库
          this.updateLoading = true
          createUser(this.temp).then(res => {
            // 成功后 关闭窗口
            this.updateLoading = false
            // console.log('createUser...', res)
            if (res.type === 'success') {
              this.fetchData()
              this.dialogFormVisible = false
            }
            this.$notify({
              message: res.message,
              type: res.type
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      // console.log(this.temp)
      this.readonly = true // 用户名不能修改, 只能删除

      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      getRoleOptions().then(res => {
        this.roleOptions = res.data
      })
      getDeptOptions().then(res => {
        this.deptOptions = this.formatTree(res.data)
      })
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        this.temp.roledepts = [] // 需要重置一下？
        for (var key in this.temp.roledept) {
          // 构造roledepts结构 {role_id:4,dept_id:["3","4"]}
          if (this.temp.roledept[key].length !== 0) {
            const tmpJson = {
              role_id: key.split('-')[1],
              dept_id: this.temp.roledept[key]
            }
            this.temp.roledepts = this.temp.roledepts.concat(tmpJson)
          }
        }

        if (this.temp.role.length !== this.temp.roledepts.length) {
          this.$notify({
            message: '所选的角色没有关联对应机构, 请检查',
            type: 'error'
          })
          return
        }

        if (valid) {
          // 调用api编辑数据入库
          this.updateLoading = true
          updateUser(this.temp).then(res => {
            this.updateLoading = false
            if (res.type === 'success') {
              // 后台重新更新数据
              this.fetchData()
              // this.$refs.TreeTable.updateTreeNode(this.temp) // 只能更新自身以下的节点
              this.dialogFormVisible = false
            }
            this.$notify({
              //  title: '错误',
              message: res.message,
              type: res.type
            })
          })
        }
      })
    },
    handleDelete(row) {
      const h = this.$createElement
      this.$msgbox({
        title: '提示',
        message: h('p', null, [
          h('span', null, '确认删除选中记录吗？[用户:  '),
          h('i', { style: 'color: teal' }, row.username),
          h('span', null, ' ]')
        ]),
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '执行中...'

            const tempData = {
              'id': row.id,
              'username': row.username
            }
            // 调用api删除数据
            deleteUser(tempData).then(res => {
              // 如果删除成功，后台重新更新数据,否则不更新数据
              done()
              instance.confirmButtonLoading = false
              if (res.type === 'success') {
                this.fetchData()
              }
              this.$notify({
                //  title: '错误',
                message: res.message,
                type: res.type
              })
            }).catch(err => {
              console.log(err)
              instance.confirmButtonLoading = false
            })
          } else {
            done()
            console.log('click cancel.....')
            instance.confirmButtonLoading = false
          }
        }
        // }).then(action => {
      }).then(() => {
        // this.$message({
        //   type: 'info',
        //   message: 'action: ' + action // confirm
        // })
      }).catch(() => {
        // console.log(err)  // cancel
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      // this.getList()
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
    }
  }
}
</script>
