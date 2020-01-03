<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-perm="['/sys/dept/view']" ref="filterText" v-model.trim="filterText" placeholder="机构名称" style="width: 200px;" class="filter-item" />
      <el-button v-perm="['/sys/dept/add']" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleCreate">{{ $t('table.add') }}</el-button>
    </div>

    <el-tree
      ref="tree2"
      :data="data"
      :props="defaultProps"
      :default-expand-all="false"
      :default-expanded-keys="treeExpandedKeys"
      :filter-node-method="filterNode"
      :expand-on-click-node="false"
      node-key="id"
      class="filter-tree"
      accordion
      highlight-current
      @node-expand="treeExpand"
      @node-collapse="treeCollapse">
      <span slot-scope="{ node, data }" class="custom-tree-node">
        <span>{{ node.label }}</span>
        <span>
          <el-button v-perm="['/sys/dept/edit']" :size="btnsize" type="text" @click="() => handleUpdate(data)">
            编辑
          </el-button>
          <el-button v-perm="['/sys/dept/del']" :size="btnsize" type="text" @click="() => handleDelete(node, data)">
            删除
          </el-button>
        </span>
      </span>
    </el-tree>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="" label-width="90px" style="width: 400px; margin-left:50px;">

        <el-form-item label="机构名称" prop="name">
          <el-input v-model.trim="temp.name" :readonly="readonly" placeholder="请输入机构名称" />
        </el-form-item>
        <el-form-item label="机构别名" prop="aliasname">
          <el-input v-model.trim="temp.aliasname" placeholder="请输入机构别名" />
        </el-form-item>
        <el-form-item label="上级机构">
          <treeselect v-model="temp.pid" :multiple="false" :clearable="false" :disable-branch-nodes="false" :show-count="true" :options="TreeSelectOptions" :normalizer="normalizer" placeholder="请选择上级机构..." />
        </el-form-item>
        <el-form-item label="排序ID">
          <!-- onkeypress 防止录入e 及其他字符 -->
          <el-input-number v-model.trim="temp.listorder" :min="0" controls-position="right" onkeypress="return(/[\d]/.test(String.fromCharCode(event.keyCode)))" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="temp.status" inactive-color="#ff4949" active-value="1" inactive-value="0" />
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

import { createDept, updateDept, deleteDept, getDeptList } from '@/api/dept'

// import random from 'string-random'
// import the component
import Treeselect from '@riophae/vue-treeselect'
// import the styles
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'SysDeptPifo',
  // 所以在编写路由 router 和路由对应的 view component 的时候一定要确保 两者的 name 是完全一致的。
  // register the component Treeselect, TreeTable
  components: { Treeselect },
  directives: { waves, perm },
  filters: {},
  data() {
    return {
      // 'href': windows.location.href,
      // path: this.$route.path,
      // params: this.$route.params,
      filterText: '',
      listLoading: false,
      updateLoading: false,
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
        pid: 0,
        name: '',
        aliasname: '',
        listorder: 99,
        status: '1'
      },
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
      data: [],
      treeExpandedKeys: [1], // 记录打开节点的数组 默认打开节点为id=1
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      rules: {
        name: [{ required: true, message: '请输入机构名称', trigger: 'blur' }],
        aliasname: [{ required: true, message: '请输入机构别名', trigger: 'blur' }]
      }
    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree2.filter(val)
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
      getDeptList().then(res => {
        this.data = res.data
        this.TreeSelectOptions = [{
          id: 0,
          pid: -1,
          name: '顶级机构',
          children: res.data
        }]
        this.listLoading = false
      })
    },
    filterNode(value, data) {
      if (!value) return true
      // data.name 根据实际修改
      return data.name.indexOf(value) !== -1
    },

    // 当节点打开时，记录下打开节点的id
    treeExpand(data, node, self) {
      this.treeExpandedKeys.push(data.id)
    },
    // 当节点折叠时，移除节点的id
    treeCollapse(data) {
      const index = this.treeExpandedKeys.indexOf(data.id)
      if (index > -1) {
        this.treeExpandedKeys.splice(index, 1)
      }
    },

    resetTemp() {
      this.temp = {
        id: undefined,
        pid: 0,
        name: '',
        aliasname: '',
        listorder: 99,
        status: '1'
      }
      this.readonly = false
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
          createDept(this.temp).then(res => {
            // 成功后 关闭窗口
            this.updateLoading = false
            // console.log('createDept...', res)
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

    handleUpdate(data) {
      this.temp = Object.assign({}, data) // copy obj
      // this.readonly = false // 机构名不能修改, 只能删除?

      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      if (this.temp.id === this.temp.pid) {
        this.$notify({
          message: this.temp.name + ' - 上级机构不能为自己',
          type: 'error'
        })
        return
      }
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // 调用api编辑数据入库
          this.updateLoading = true
          updateDept(this.temp).then(res => {
            this.updateLoading = false
            if (res.type === 'success') {
              // 后台重新更新数据
              this.fetchData()
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

    handleDelete(node, data) {
      this.$confirm('确认删除选中记录吗？[机构: ' + data.name + ']', '提示', {
        type: 'warning'
      }).then(() => {
        const tempData = {
          'id': data.id,
          'name': data.name
        }
        // 调用api删除数据
        deleteDept(tempData).then(res => {
          // 如果删除成功，后台重新更新数据,否则不更新数据
          if (res.type === 'success') {
            const parent = node.parent
            const children = parent.data.children || parent.data
            const index = children.findIndex(d => d.id === data.id)
            children.splice(index, 1)
          }
          this.dialogFormVisible = false
          this.$notify({
            //  title: '错误',
            message: res.message,
            type: res.type
          })
        })
      })
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
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>
