<template>
  <div class="dashboard-container">
    <!-- <div class="dashboard-text">name:{{ name }}</div>
    <div class="dashboard-text">roles:
      <span v-for="role in roles" :key="role">{{ role }}</span>
    </div>
    <hr>
    <hr> -->

    <div>
      <h1 v-if="goods.length==0">没商品云购物
        <a href="jd.com">去购物吧</a>
      </h1>
      <div v-if="goods.length>0">
        <h1>购物车</h1>
        <el-table :data="goods" stripe height="250" style="width: 100%">
          <el-table-column prop="id" label="编号" width="50" />
          <el-table-column prop="title" label="名称" width="150" />
          <el-table-column prop="price" label="价格" />
          <el-table-column prop="num" label="数量">
            <template slot-scope="scope">
              <!-- onkeypress 防止录入e 及其他字符 -->
              <el-input v-model.number="scope.row.num" size="small" onkeypress="return(/[\d]/.test(String.fromCharCode(event.keyCode)))" />
            </template>
          </el-table-column>
          <el-table-column prop="totalPrice" label="合计" />
          <el-table-column fixed="right" label="操作">
            <template slot-scope="scope">
              <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row, goods)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

      </div>
    </div>

    <div v-if="totalPrice>0">
      <h1 class="footerCart"> 总计: {{ totalPrice }}</h1>
    </div>
    <h3>
      mapGetters 辅助函数 相当于 this.$store.getters.valueName对派生出来的状态进行访问。或者直接使用辅助函数mapGetters将其映射到本地计算属性中去。 getters里面的方法里获取得到对应的属性，可以在组件中使用，类型的还有 mapMutations,mapState 等 vuex调试时出现 在vuex bindings里面
    </h3>
    <h3>
      计算属性与data()一样， 操作store里的数据时使用计算属性 会发生变化 这是计算属性的特性 计算机属性里的数组 相当于初次 将store里的变量进行了绑定，修改计算机属性里的数据时，相当于修改store里的数据会同时发生更改
    </h3>
    <h3>
      return this.$store.state.goods.goods this.$store.state.goods.goods 里面没有单一商品总价 但是初始挂载的时候却能计算到得到 并没有使用getters里的goodsx函数获取 ？？？？？？？？？？？？？ this.$store.getters.goods 此函数添加了一项单一商品总价 return this.$store.getters.goodsx
    </h3>

    <h1>表格合并行或列</h1>

    <h3> el-table  :span-method="objectSpanMethod" 有规律的 可以写活，否则需要写死，指定每行每列合并行,相当于js写死的方法，与html写死一样 </h3>
    <el-table :data="tableData" :span-method="objectSpanMethod" border stripe style="width: 100%; margin-top: 20px">
      <el-table-column prop="name" label="" />
      <el-table-column prop="amount1" label="" />
      <el-table-column prop="amount2" label="其中：劳动合同制员工">
        <template slot-scope="scope">
          <!-- onkeypress 防止录入e 及其他字符 -->
          <el-input v-model.number="scope.row.amount2" size="small" onkeypress="return(/[\d]/.test(String.fromCharCode(event.keyCode)))" />
        </template>
      </el-table-column>
      <el-table-column prop="amount3" label="劳务派遣制人员">
        <template slot-scope="scope">
          <el-input v-model.number="scope.row.amount3" size="small" onkeypress="return(/[\d]/.test(String.fromCharCode(event.keyCode)))" />
        </template>
      </el-table-column>
      <el-table-column prop="amount3" label="合作外包企业人员">
        <template slot-scope="scope">
          <el-input v-model.number="scope.row.amount3" size="small" onkeypress="return(/[\d]/.test(String.fromCharCode(event.keyCode)))" />
        </template>
      </el-table-column>
      <el-table-column prop="amount3" label="其中：劳动合同制员工">
        <template slot-scope="scope">
          <el-input v-model.number="scope.row.amount3" size="small" onkeypress="return(/[\d]/.test(String.fromCharCode(event.keyCode)))" />
        </template>
      </el-table-column>
      <el-table-column prop="amount3" label="劳务派遣制人员">
        <template slot-scope="scope">
          <el-input v-model.number="scope.row.amount3" size="small" onkeypress="return(/[\d]/.test(String.fromCharCode(event.keyCode)))" />
        </template>
      </el-table-column>
      <el-table-column prop="amount3" label="合作外包企业人员">
        <template slot-scope="scope">
          <el-input v-model.number="scope.row.amount3" size="small" onkeypress="return(/[\d]/.test(String.fromCharCode(event.keyCode)))" />
        </template>
      </el-table-column>
    </el-table>

    <el-table :data="tableData3" :span-method="objectSpanMethod2" border style="width: 100%; margin-top: 20px">
      <el-table-column prop="name" label="" />
      <el-table-column prop="amount1" label="" />
      <el-table-column prop="amount2" label="其中：劳动合同制员工">
        <template slot-scope="scope">
          <!-- onkeypress 防止录入e 及其他字符 -->
          <el-input v-model.number="scope.row.amount2" size="small" onkeypress="return(/[\d]/.test(String.fromCharCode(event.keyCode)))" />
        </template>
      </el-table-column>
      <el-table-column prop="amount2" label="ssss">
        <template slot-scope="scope">
          <!-- onkeypress 防止录入e 及其他字符 -->
          <el-input v-model.number="scope.row.amount2" size="small" onkeypress="return(/[\d]/.test(String.fromCharCode(event.keyCode)))" />
        </template>
      </el-table-column>
    </el-table>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'SysxXiangjunAles',
  data() {
    return {
      tableData: [{
        name: '现场授课',
        amount1: '人次',
        amount2: '1',
        amount3: 10
      }, {
        name: '现场授课',
        amount1: '学时',
        amount2: '4.43',
        amount3: 12
      }, {
        name: '视频会议',
        amount1: '人次',
        amount2: '1.9',
        amount3: 9
      }, {
        name: '视频会议',
        amount1: '学时',
        amount2: '2.2',
        amount3: 17
      },
      {
        name: '培训经费使用情况',
        amount1: '年度培训经费总额（元）',
        amount2: '4.1',
        amount3: 15
      },
      {
        name: '培训经费使用情况',
        amount1: '当期使用培训费用(元)',
        amount2: '4.1',
        amount3: 15
      }, {
        name: '技能认证情况',
        amount1: '其中：社会认证',
        amount2: '4.1',
        amount3: 15
      },
      {
        name: '技能认证情况',
        amount1: '移动认证',
        amount2: '4.1',
        amount3: 15
      },
      {
        name: '技能认证情况',
        amount1: '公司认证',
        amount2: 300,
        amount3: 15
      }
      ],

      tableData3: [{
        name: '培训兑现情况',
        amount1: '当期列入计划的培训班次',
        amount2: '1',
        amount3: 10
      }, {
        name: '培训兑现情况',
        amount1: '当期完成的培训班次',
        amount2: '4.43',
        amount3: 12
      }, {
        name: '培训兑现情况',
        amount1: '其中：工程类',
        amount2: '1.9',
        amount3: 9
      }, {
        name: '培训兑现情况',
        amount1: '维护类',
        amount2: '2.2',
        amount3: 17
      },
      {
        name: '培训兑现情况',
        amount1: '市场类',
        amount2: '4.1',
        amount3: 15
      },
      {
        name: '培训兑现情况',
        amount1: '管理类',
        amount2: '4.1',
        amount3: 15
      }, {
        name: '培训兑现情况',
        amount1: '其他类',
        amount2: '4.1',
        amount3: 15
      }
      ]
    }
  },
  computed: {
    // mapGetters 辅助函数 相当于 this.$store.getters.valueName对派生出来的状态进行访问。或者直接使用辅助函数mapGetters将其映射到本地计算属性中去。
    // getters里面的方法里获取得到对应的属性，可以在组件中使用，类型的还有 mapMutations,mapState 等 vuex调试时出现 在vuex bindings里面
    ...mapGetters([
      'name',
      'roles',
      'phone',
      'identify'
    ]),
    // 计算属性与data()一样， 操作store里的数据时使用计算属性 会发生变化 这是计算属性的特性
    // 计算机属性里的数组 相当于初次 将store里的变量进行了绑定，修改计算机属性里的数据时，相当于修改store里的数据会同时发生更改
    totalPrice() {
      return this.$store.getters.totalPrice
    },
    goods() {
      console.log('goods computed.....', this.$store.state.goods.goods)
      // return this.$store.state.goods.goods
      // this.$store.state.goods.goods 里面没有单一商品总价
      //  但是初始挂载的时候却能计算到得到 并没有使用getters里的goodsx函数获取 ？？？？？？？？？？？？？
      // this.$store.getters.goods 此函数添加了一项单一商品总价
      return this.$store.getters.goodsx
    }
  },
  mounted() {
    console.log('xiangjun mounted')
    // mounted组件加载时 只执行一次，异步获取goods数据
    this.$store.dispatch('loadGoods')
    // console.log(this.$store.state.goods.goods)
  },
  methods: {
    handleDelete(index, rows, tabledata) {
      console.log(index)
      console.log(rows)
      console.log(rows.id)
      tabledata.splice(index, 1) // 直接删除 计算属性里的 goods数组的元素 与 mutations使用效果一样
      // 调用$store里的mutations里的方法 使用commit
      // 也可以在actions里定义函数，此处使用this.$store.dispatch 调用，在actions里直接使用 commit 提交 这种可能比较标准
      // this.$store.commit('DEL_GOODS', { id: id })
    },
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      // 有规律的 可以写活，否则需要写死，指定每行，每列
      // 第1列 合并行
      if (columnIndex === 0) {
        if (rowIndex === 0) { // 行索引为0的 占2行，1列，行向后数
          return {
            rowspan: 2,
            colspan: 1
          }
        }
        if (rowIndex === 1) { // 行索引为1的 被合并隐藏
          return {
            rowspan: 0,
            colspan: 0
          }
        }
        if (rowIndex === 2) { // 行索引为0的 占2行，1列，行向后数
          return {
            rowspan: 2,
            colspan: 1
          }
        }
        if (rowIndex === 3) { // 行索引为3的 被合并隐藏
          return {
            rowspan: 0,
            colspan: 0
          }
        }
        if (rowIndex === 4) { // 行索引为4的 占2行，1列，行向后数
          return {
            rowspan: 2,
            colspan: 1
          }
        }
        if (rowIndex === 5) { // 行索引为5的 被合并隐藏
          return {
            rowspan: 0,
            colspan: 0
          }
        }
        if (rowIndex === 6) { // 行索引为6的 占3行，1列，行向后数
          return {
            rowspan: 3,
            colspan: 1
          }
        }
        if (rowIndex > 6) { // 行索引大于6 被合并隐藏
          return {
            rowspan: 0,
            colspan: 0
          }
        }
      }

      // 第9行的第3列合并列 rowIndex=8，columnIndex=2
      if (rowIndex === 8) {
        if (columnIndex === 2) { // 该列占1行6列，向后数
          return {
            rowspan: 1,
            colspan: 6
          }
        } else if (columnIndex < 2) { // 前面的列，不合并，占1行1列
          return {
            rowspan: 1,
            colspan: 1
          }
        } else { // 后面的列，不显示，占0行，0列，数据应该会存在 只是不展示
          return {
            rowspan: 0,
            colspan: 0
          }
        }
      }

      // 第8行的第3列合并列 rowIndex=8，columnIndex=2
      if (rowIndex === 7) {
        if (columnIndex === 2) { // 该列占1行6列，向后数
          return {
            rowspan: 1,
            colspan: 6
          }
        } else if (columnIndex < 2) { // 前面的列，不合并，占1行1列
          return {
            rowspan: 1,
            colspan: 1
          }
        } else { // 后面的列，不显示，占0行，0列，数据应该会存在 只是不展示
          return {
            rowspan: 0,
            colspan: 0
          }
        }
      }
    },
    objectSpanMethod2({ row, column, rowIndex, columnIndex }) {
      // 合并行
      if (columnIndex === 0) {
        if (rowIndex === 0) {
          return {
            rowspan: 7,
            colspan: 1
          }
        } else {
          return {
            rowspan: 0,
            colspan: 0
          }
        }
      }

      // 合并列
      if (rowIndex === 6) {
        if (columnIndex === 2) {
          return {
            rowspan: 1,
            colspan: 2
          }
        } else if (columnIndex < 2) {
          return {
            rowspan: 1,
            colspan: 1
          }
        } else {
          return {
            rowspan: 0,
            colspan: 0
          }
        }
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
.footerCart {
  background: #999;
  color: #fff;
}
</style>
