<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-perm="['/sys/role/view']" ref="filterText" v-model.trim="filters[0].value" placeholder="角色名称" style="width: 200px;" class="filter-item" />
      <el-select v-perm="['/sys/role/view']" v-model="filters[1].value" class="filter-item" multiple="multiple">
        <el-option label="启用" value="1" />
        <el-option label="禁用" value="0" />
      </el-select>
      <!-- <el-button v-waves v-perm="['/sys/role/view']" class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button> -->
      <el-button v-perm="['/sys/role/add']" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleCreate">{{ $t('table.add') }}</el-button>

      <!-- <el-input placeholder="名称" v-model="listQuery.title" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" :size="btnsize" icon="el-icon-search" v-perm="['/sys/role/view']" @click="handleFilter">查询</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" :size="btnsize" icon="el-icon-plus" v-perm="['/sys/role/add']" @click="handleCreate">{{ $t('table.add') }}</el-button> -->
    </div>

    <data-tables :data="list" :filters="filters" :loading="listLoading" :table-props="tableProps" :pagination-props="{ pageSizes: [5, 10, 15,20] }" layout="table,pagination" @current-change="handleRoleSelectChange">
      <el-table-column v-for="title in titles" :prop="title.prop" :label="title.label" :key="title.label" sortable="custom" />

      <el-table-column label="状态" min-width="100px">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter" size="small">{{ scope.row.status | statusChange }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="100px">
        <template slot-scope="scope">
          <el-button v-perm="['/sys/role/edit']" :size="btnsize" type="success" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button v-perm="['/sys/role/edit']" :size="btnsize" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </data-tables>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="" label-width="90px" style="width: 400px; margin-left:50px;">

        <el-form-item label="角色名称" prop="name">
          <el-input v-model.trim="temp.name" placeholder="请输入角色名" />
        </el-form-item>
        <el-form-item label="角色说明" prop="remark">
          <el-input v-model.trim="temp.remark" placeholder="请输入角色备注" />
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

    <!--角色菜单，表格树内容栏-->
    <div class="menu-container">
      <div class="menu-header">
        <span>
          <h2>角色授权</h2>
        </span>
      </div>
      <el-tabs v-model="activeName" tab-position="top" type="card" style="height: 200px;" @tab-click="handleTabClick">
        <el-tab-pane label="菜单类" name="menu">
          <el-tree
            v-loading="menuLoading"
            ref="menuTree"
            :data="menuData"
            :props="defaultProps"
            :render-content="renderContent"
            :check-strictly="true"
            show-checkbox
            node-key="id"
            size="mini"
            style="width: 100%;pading-top:20px;"
            element-loading-text="拼命加载中"
            @check-change="handleMenuCheckChange" />
        </el-tab-pane>
        <el-tab-pane label="角色类" name="role">
          <data-tables ref="roleTable" :data="roleData" :table-props="tableProps" :loading="roleLoading" :pagination-props="{ pageSizes: [10,20] }">
            <el-table-column type="selection" width="55" />
            <el-table-column v-for="title in rtitles" :prop="title.prop" :label="title.label" :key="title.label" sortable="custom" />
            <el-table-column label="状态" min-width="100px">
              <template slot-scope="scope">
                <el-tag :type="scope.row.status | statusFilter" size="small">{{ scope.row.status | statusChange }}</el-tag>
              </template>
            </el-table-column>
          </data-tables>
        </el-tab-pane>

        <el-tab-pane label="文件类" name="file">todo:文件类授权</el-tab-pane>

        <div style="float:left;padding-left:24px;padding-top:12px;padding-bottom:4px;">
          <el-checkbox v-if="activeName==='menu'" v-model="checkAll" :disabled="selectRole.id == null" @change="handleCheckAll">
            <b>全选</b>
          </el-checkbox>
        </div>
        <div style="float:right;padding-right:15px;padding-top:4px;padding-bottom:4px;">
          <el-button v-perm="['/sys/role/edit']" v-waves :disabled="selectRole.id == null" :size="btnsize" type="primary" @click="resetSelection">重置</el-button>
          <el-button v-perm="['/sys/role/edit']" v-waves :loading="authLoading" :disabled="selectRole.id == null" :size="btnsize" type="primary" @click="submitAuthForm">提交</el-button>
        </div>
      </el-tabs>
    </div>

  </div>
</template>

<script>
import waves from '@/directive/waves' // Waves directive
import perm from '@/directive/perm/index.js' // 权限判断指令

import { createRole, updateRole, deleteRole, getRoleList, getAllMenus, getAllRoles, getRoleMenu, getRoleRole, saveRolePerms } from '@/api/role'

// import random from 'string-random'

export default {
  name: 'SysRoleCkoF',
  // 所以在编写路由 router 和路由对应的 view component 的时候一定要确保 两者的 name 是完全一致的。
  // register the component Treeselect, TreeTable
  components: {},
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
    return {
      filters: [{
        prop: 'name',
        value: ''
      }, {
        prop: 'status',
        value: ''
      }],
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10
      },
      titles: [
        {
          prop: 'id',
          label: 'ID'
        },
        {
          prop: 'name',
          label: '角色名称'
        },
        {
          prop: 'remark',
          label: '说明'
        },
        // {
        //   prop: 'status',
        //   label: '状态'
        // },
        {
          prop: 'listorder',
          label: '排序'
        }
      ],
      rtitles: [
        // {
        //   prop: 'perm_id',
        //   label: '权限ID'
        // },
        {
          prop: 'id',
          label: 'ID'
        },
        {
          prop: 'name',
          label: '角色名称'
        },
        {
          prop: 'remark',
          label: '说明'
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
      selectRole: {},
      menuData: [],
      menuLoading: false,
      roleData: [],
      roleLoading: false,
      authLoading: false,
      updateLoading: false,
      checkAll: false,
      currentRoleMenus: [], // 服务端获取当前角色的菜单类权限
      currentRoleRoles: [], // 服务端获取当前角色的角色类权限
      defaultProps: {
        children: 'children',
        label: 'title'
      },
      tabMapOptions: [
        { label: '菜单类', key: 'menu' },
        { label: '角色类', key: 'role' },
        { label: '文件类', key: 'file' }
      ],
      activeName: 'menu',

      // 'href': windows.location.href,
      // path: this.$route.path,
      // params: this.$route.params,
      btnsize: 'mini',
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '新增'
      },
      temp: {
        id: undefined,
        name: '',
        remark: '',
        status: '1',
        listorder: 99
      },
      rules: {
        name: [{ required: true, message: '请输入角色名', trigger: 'blur' }]
      }
    }
  },

  created() {
    this.fetchData()
  },
  mounted() {
    this.$refs.filterText.focus()
  },
  methods: {
    // 获取数据
    fetchData() {
      this.listLoading = true
      this.menuLoading = true
      this.roleLoading = true
      getRoleList().then(res => {
        // console.log('getRoleList', res)
        this.list = res.data.items
        this.total = res.data.total
        this.listLoading = false
      })

      // 菜单类权限列表
      getAllMenus().then(res => {
        // console.log('getAllMenus', res)
        this.menuData = res.data
        this.menuLoading = false
      })
      // 角色类权限列表
      getAllRoles().then(res => {
        this.roleData = res.data.items
        this.roleLoading = false
      })
    },
    handleTabClick(tab, event) {
      // console.log(tab, event);
    },
    // 角色选择改变监听
    handleRoleSelectChange(val) {
      // console.log(val)
      if (val === null || val.id === null) {
        return
      }
      this.selectRole = val
      getRoleMenu({ 'roleId': this.selectRole.id }).then((res) => {
        this.currentRoleMenus = res.data
        this.$refs.menuTree.setCheckedNodes(res.data)
      })

      getRoleRole({ 'roleId': this.selectRole.id }).then((res) => {
        this.currentRoleRoles = res.data
        // console.log('currentRoleRoles', this.currentRoleRoles)
        this.$refs.roleTable.$refs.elTable.clearSelection()
        for (let i = 0; i < this.currentRoleRoles.length; i++) {
          for (let index = 0; index < this.roleData.length; index++) {
            if (this.currentRoleRoles[i].perm_id === this.roleData[index].perm_id) { // 服务端返回需选中项的id
              this.$refs.roleTable.$refs.elTable.toggleRowSelection(this.roleData[index], true) // row.ndex 选中
            }
          }
        }
      })
    },
    // 树节点选择监听
    handleMenuCheckChange(data, check, subCheck) {
      if (check) {
        // 节点选中时同步选中父节点
        const parentId = data.pid
        this.$refs.menuTree.setChecked(parentId, true, false)
      } else {
        // 节点取消选中时同步取消选中子节点
        if (data.children != null) {
          data.children.forEach(element => {
            this.$refs.menuTree.setChecked(element.id, false, false)
          })
        }
      }
    },
    // 重置选择
    resetSelection() {
      this.checkAll = false
      // 重置当前菜单类权限
      this.$refs.menuTree.setCheckedNodes(this.currentRoleMenus)
      // 重置当前角色类权限 先清空赋值
      this.$refs.roleTable.$refs.elTable.clearSelection()
      for (let i = 0; i < this.currentRoleRoles.length; i++) {
        for (let index = 0; index < this.roleData.length; index++) {
          if (this.currentRoleRoles[i].perm_id === this.roleData[index].perm_id) {
            this.$refs.roleTable.$refs.elTable.toggleRowSelection(this.roleData[index], true)
          }
        }
      }
    },
    // 全选操作
    handleCheckAll() {
      if (this.checkAll) {
        const allMenus = []
        this.checkAllMenu(this.menuData, allMenus)
        this.$refs.menuTree.setCheckedNodes(allMenus)
      } else {
        this.$refs.menuTree.setCheckedNodes([])
      }
    },
    // 递归全选
    checkAllMenu(menuData, allMenus) {
      menuData.forEach(menu => {
        allMenus.push(menu)
        if (menu.children) {
          this.checkAllMenu(menu.children, allMenus)
        }
      })
    },
    // 角色菜单授权提交
    submitAuthForm() {
      const roleId = this.selectRole.id
      if (roleId === 1) {
        this.$message({ message: '超级管理员角色拥有所有权限，不允许修改！', type: 'error' })
        return
      }

      this.authLoading = true
      const rolePerms = []
      // 获取选中的菜单类权限
      const checkedNodes = this.$refs.menuTree.getCheckedNodes(false, true)
      for (let i = 0, len = checkedNodes.length; i < len; i++) {
        const rolePerm = { role_id: roleId, perm_id: checkedNodes[i].perm_id }
        rolePerms.push(rolePerm)
      }
      // 获取选中的角色类权限
      // 在使用Element前端库时候,需要获得表格选中行的时候 查看源码,发现有个store属性,保存了选中的行数据.
      const roleSelections = this.$refs.roleTable.$refs.elTable.store.states.selection
      for (let i = 0, len = roleSelections.length; i < len; i++) {
        const rolePerm = { role_id: roleId, perm_id: roleSelections[i].perm_id }
        rolePerms.push(rolePerm)
      }

      // console.log('rolePerms', rolePerms)
      // return
      saveRolePerms(roleId, rolePerms).then((res) => {
        // console.log('saveRolePerms...', res)
        this.$notify({
          //  title: '错误',
          message: res.message,
          type: res.type
        })
        this.authLoading = false
      })
    },
    renderContent(h, { node, data, store }) {
      return (
        <div class='column-container'>
          <span style='text-algin:center;margin-right:200px;'>{data.title}</span>
          <span style='text-algin:center;margin-right:200px;'>
            <el-tag type={data.type === 0 ? '' : data.type === 1 ? 'success' : 'info'} size='small'>
              {data.type === 0 ? '目录' : data.type === 2 ? '功能' : '菜单'}
            </el-tag>
          </span>
          <span style='text-algin:center;margin-right:80px;'> <svg-icon icon-class={data.icon} /> </span>
          <span style='text-algin:center;margin-right:80px;'>{data.path ? data.path : '\t'}</span>
        </div>)
      // <span style='text-algin:center;margin-right:200px;'>id:{data.id} - pid:{data.pid} - perm_id: {data.perm_id}</span>
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        name: '',
        remark: '',
        status: '1',
        listorder: 99
      }
    },
    handleCreate() {
      // console.log('handleCreate...click')
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // console.log('createData valid done...', this.temp)

          // 调用api创建数据入库
          this.updateLoading = true
          createRole(this.temp).then(res => {
            // 成功后 关闭窗口
            this.updateLoading = false
            // console.log('createRole...', res)
            this.fetchData()
            this.dialogFormVisible = false
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
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // 调用api编辑数据入库
          this.updateLoading = true
          updateRole(this.temp).then(res => {
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
      this.$confirm('确认删除选中记录吗？[角色: ' + row.name + ']', '提示', {
        type: 'warning'
      }).then(() => {
        const tempData = {
          'id': row.id,
          'name': row.name
        }

        // 调用api删除数据
        deleteRole(tempData).then(res => {
          // 如果删除成功，后台重新更新数据,否则不更新数据
          if (res.type === 'success') {
            this.fetchData()
          }
          this.dialogFormVisible = false
          this.$notify({
            //  title: '错误',
            message: res.message,
            type: res.type
          })
        })
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      // this.getList()
    }
  }
}
</script>
 <style scoped>
.menu-container {
  margin-top: 10px;
}
.menu-header {
  padding-left: 8px;
  padding-bottom: 5px;
  text-align: left;
  font-size: 16px;
  color: rgb(20, 89, 121);
}
</style>
