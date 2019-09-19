<template>
  <div class="app-container">
    <h2>websocket test</h2>
    <el-input ref="websockTxt" v-model="websockTxt" placeholder="请输入文本消息" style="width: 200px;" class="filter-item" @keyup.enter.native="sendMessage" />
    <el-button class="filter-item" style="margin-left: 10px;" type="primary" @click="sendMessage">发送</el-button>
    <li v-for="v in websockMsgList" :key="v.nickname">
      <el-tag type="success">{{ v.nickname }}</el-tag>
      <el-tag type="info">{{ v.message }}</el-tag>
    </li>
    <hr>

    <el-link href="https://www.jianshu.com/p/33c6787de842" icon="el-icon-s-opportunity" type="primary" target="_blank">Vue--使用vue-qr生成二维码、canvas合成二维码+下方文字标题、jsZip批量压缩图片、FileSaver下载压缩图片</el-link>
    <div id="1">
      <vue-qr :correct-level="3" :size="200" :margin="5" :dot-scale="1" text="http://www.sina.com.cn" style="margin: 0px" />
    </div>
    <canvas id="box" style="display: none;background: #FFFFFF;" width="250px" height="280px" />
    <Button @click="paintCanvas(1,'single')">合并图片说明并下载</Button>

    <hr>
    <div style="margin-left: 10px;margin-top: 10px;margin-bottom: 10px">
      <el-row>
        <el-col :span="18">
          <el-button @click="onCreate">create 1 row</el-button>
          <el-button @click="onCreate100">create 100 row</el-button>
          <el-button @click="bulkDelete">bulk delete</el-button>
        </el-col>

        <el-col :span="4">
          <el-input v-model="filters[0].value" placeholder="search NO." />
        </el-col>
      </el-row>
    </div>

    <data-tables :search-def="searchDef" :data="data" :action-col="actionCol" :filters="filters" layout="pagination, tool, table" @selection-change="handleSelectionChange">
      <el-row slot="tool" style="margin: 10px 0">
        <el-col :span="5" :offset="4">
          <el-input v-model="filters[0].value" />
        </el-col>
      </el-row>

      <el-table-column type="selection" width="55" />
      <el-table-column v-for="title in titles" :prop="title.prop" :label="title.label" :key="title.prop" sortable="custom" />
    </data-tables>

    <data-tables ref="multipleTable" :data="tableData" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column v-for="title in rtitles" :prop="title.prop" :label="title.label" :key="title.prop" sortable="custom" />
    </data-tables>
    <div style="margin-top: 20px">
      <el-button @click="toggleSelection(tableData)">全选</el-button>
      <el-button @click="toggleSelection([tableData[1], tableData[2]])">切换第二、第三行的选中状态</el-button>

      <el-button @click="toggleSelection()">取消选择</el-button>
    </div>
    <el-alert>
      vue-data-tables - 基于element-ui的Vue2.0数据表 本库导出了2个组件 data-tables 和 data-tables-server. 在一些业务场景中，数据量并不大（比如500条数据）， 可以把所有数据加载到前台，甚至于直接写在前台代码里， 此时数据分页和过滤均发生在前台，data-tables 适用于这种场景。
    </el-alert>
    <el-alert>
      在另外的业务场景中，数据量很大，不可能一次性的返回给前台，此时数据分页和过滤均发生在后台， data-tables-server 则适用于这种场景。
    </el-alert>
    <el-alert>
      正如前文中提到的，本库依赖于 element-ui 的 el-table, el-table-column, el-button 和 el-pagination 组件 ， 所以在引入 vue-data-tables 之前, 我们需要先完整的引入 element-ui 或者按需引入 el-table, el-table-column, el-button 和 el-pagination 这4个组件。
    </el-alert>
    <el-alert>
      # npm install vue-data-tables main.js 里 _在引入 element-ui 后面 引入_ // 同时使用 DataTables 和 DataTablesServer import VueDataTables from 'vue-data-tables' Vue.use(VueDataTables)
    </el-alert>
    <el-tag>
      引用方法时 使用双层$refs 来引用el-table的方法： this.$refs.multipleTable.$refs.elTable.toggleRowSelection(row);
    </el-tag>

    <password-validator/>

    <div>
      <el-form ref="loginForm" auto-complete="on" label-position="left" label-width="90px" style="width: 400px; margin-left:50px;">
        <el-form-item label="username" prop="username">

          <el-input v-model="user.email" name="email" type="text" auto-complete="on" />
        </el-form-item>

        <el-form-item label="password" prop="password">

          <el-input v-model="user.password" :type="passwordType" name="password" auto-complete="on">
            <i slot="suffix" class="el-input__icon el-icon-eye" @click="showPwd">
              <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
            </i>
          </el-input>
          <!-- <span class="show-pwd" @click="showPwd">
            <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
          </span> -->
        </el-form-item>
      </el-form>
    </div>

  </div>
</template>

<script>
import PasswordValidator from 'vue-password-validator'
import VuePassword from 'vue-password'
import VueQr from 'vue-qr' // 引入VueQr

export default {
  components: {
    PasswordValidator,
    VuePassword,
    VueQr
  },
  data() {
    return {
      websockTxt: '',
      websockMsgList: [],
      dataUrls: [],
      passwordType: 'password',
      strengthMessages: ['非常差', '差', 'Medium', 'Strong', 'Very Strong'],
      user: {
        email: '',
        password: ''
      },
      searchDef: {
        show: true,
        debounceTime: 5000
      },
      data: [],
      titles: [
        {
          prop: 'flow_no',
          label: 'No.'
        },
        {
          prop: 'content',
          label: '内容'
        },
        {
          prop: 'flow_type',
          label: '类型'
        }
      ],
      rtitles: [
        {
          prop: 'date',
          label: 'date.'
        },
        {
          prop: 'name',
          label: 'name'
        },
        {
          prop: 'address',
          label: 'address'
        }
      ],
      filters: [{
        prop: 'flow_no',
        value: ''
      }],
      actionCol: {
        props: {
          label: '操作'
        },
        buttons: [{
          props: {
            type: 'primary'
          },
          handler: row => {
            this.$message('Edit clicked')
            row.flow_no = 'hello word' + Math.random()
            row.content = Math.random() > 0.5 ? 'Water flood' : 'Lock broken'
            row.flow_type = Math.random() > 0.5 ? 'Repair' : 'Help'
          },
          label: '编辑'
        }, {
          handler: row => {
            this.data.splice(this.data.indexOf(row), 1)
            this.$message('delete success')
          },
          label: '删除'
        }]
      },
      selectedRow: [],
      tableData: [{
        date: '2016-05-03',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-02',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-04',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-01',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-08',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-06',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-07',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }],
      multipleSelection: []
    }
  },
  mounted: function() {
    this.initWebSocket()
  },
  beforeDestroy: function() {
    // 页面离开时断开连接
    this.websocketclose()
  },
  methods: {
    initWebSocket() { // 初始化weosocket
      const wsuri = 'ws://127.0.0.1:8181' // 这个地址由后端童鞋提供
      this.websock = new WebSocket(wsuri)
      this.websock.onopen = this.websocketonopen
      this.websock.onmessage = this.websocketonmessage
      this.websock.onerror = this.websocketonerror
      this.websock.onclose = this.websocketclose
    },
    websocketonopen() {
      console.log('Connection to server opened')
      // todo: this.websock.send(this.websockTxt) // 可以做一些消息发送
    },
    websocketonerror() { // 连接建立失败重连
      this.initWebSocket()
    },
    websocketonmessage(e) {
      var data = JSON.parse(e.data)
      console.log('接收服务器消息', data)
      console.log('ID: [%s] = %s', data.id, data.message)
      this.websockMsgList.push({ 'nickname': data.nickname, 'message': data.message })
      console.log(this.websockMsgList)
    },
    websocketclose(e) { // 关闭
      this.websock.close()
    },
    // 发送消息
    sendMessage() {
      if (this.websock.readyState === WebSocket.OPEN) {
        if (this.websockTxt.trim() !== '') {
          this.websock.send(this.websockTxt)
          this.websockTxt = ''
          this.$refs.websockTxt.focus()
        }
      }
    },
    paintCanvas(id, type) { // id表示对应的二维码标签的id   type表示画布的类型
      const c = document.getElementById('box') // 获取canvas画布 画布大小和canvas大小一致
      const picName = '测试图片' + id
      const ctx = c.getContext('2d')
      c.height = c.height// 清空画布，重新绘制
      let div = null // 设置div变量
      console.log(id, type)
      // 判断类型：single 单张  batch  批量
      if (type !== 'single') {
        div = document.getElementById('batch' + id) // 获取到需要绘制到canvas的div即二维码div
      } else {
        div = document.getElementById(id) // 获取到需要绘制到canvas的div即二维码div
      }
      const img = div.getElementsByTagName('img')[0] // 获取二维码
      console.log(img)
      ctx.drawImage(img, 25, 25, 200, 200) // 参数依次为：绘制图片， 左，上，宽，高
      ctx.font = '20px bold 微软雅黑' // 设置字体大小  这里文字的加粗一直无效，至今没搞清楚原因 有能解决的朋友可以私聊
      // 多画几次，让字体加粗  解决文字无法加粗问题
      for (let i = 0; i < 10; i++) {
        ctx.fillText('ID:000001', 50, 250) // 使用偏移量加粗字体
      }
      console.log(ctx)
      const dataUrl = c.toDataURL() // 获取返回的base64的信息
      this.dataUrls.push({ picData: dataUrl, fileName: picName }) // 把数据存进数组里面
      // 如果类型是单张（single）则下载合成好的图片
      if (type === 'single') {
        const link = document.createElement('a')
        link.download = '测试合成图片.jpg'
        link.href = dataUrl
        link.click()
      }
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
    },
    toggleSelection(rows) {
      console.log('rows', rows)
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.$refs.elTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.$refs.elTable.clearSelection()
      }
    },
    handleSelectionChange(val) {
      this.selectedRow = val
    },
    onCreate() {
      this.data.push({
        content: 'new created',
        flow_no: 'FW201601010003' + Math.floor(Math.random() * 100),
        flow_type: 'Help',
        flow_type_code: 'help'
      })
    },
    onCreate100() {
      [...new Array(100)].map(_ => {
        this.onCreate()
      })
    },
    bulkDelete() {
      this.selectedRow.map(row => {
        this.data.splice(this.data.indexOf(row), 1)
      })
      this.$message('bulk delete success')
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;
  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }
  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;
    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }
  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }
  .title-container {
    position: relative;
    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
    .set-language {
      color: #fff;
      position: absolute;
      top: 3px;
      font-size: 18px;
      right: 0px;
      cursor: pointer;
    }
  }
  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
  .thirdparty-button {
    position: absolute;
    right: 0;
    bottom: 6px;
  }
}
</style>
