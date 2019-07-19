<template>
  <div class="icons-container">
    <p class="warn-content">
      <a href="https://panjiachen.github.io/vue-element-admin-site/guide/advanced/icon.html" target="_blank">Add and use
      </a>
      从
      <a href="https://www.iconfont.cn/" target="_blank">iconfont
      </a> 直接下载svg 图标 放入 @icons/svg 目录下, 如plane 单击图标 复制样式即可使用。
    </p>
    <el-tabs type="border-card">
      <el-tab-pane label="svgIcons">
        <div class="icons-wrapper">
          <div v-for="item of svgIcons" :key="item" @click="handleClipboard(generateIconCode(item),$event)">
            <el-tooltip placement="top">
              <div slot="content">
                {{ generateIconCode(item) }}
              </div>
              <div class="icon-item">
                <svg-icon :icon-class="item" class-name="disabled" />
                <span>{{ item }}</span>
              </div>
            </el-tooltip>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="Element-UI v2.10.1 Icons">
        <div v-for="item of elementIcons" :key="item" @click="handleClipboard(generateElementIconCode(item),$event)">
          <el-tooltip placement="top">
            <div slot="content">
              {{ generateElementIconCode(item) }}
            </div>
            <div class="icon-item">
              <i :class="'el-icon-' + item" />
              <span>{{ item }}</span>
            </div>
          </el-tooltip>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import svgIcons from './svg-icons'
import clipboard from '@/utils/clipboard'
import elementIcons from './element-icons'

export default {
  name: 'Icons',
  data() {
    return {
      svgIcons,
      elementIcons
    }
  },
  methods: {
    generateIconCode(symbol) {
      return `<svg-icon icon-class="${symbol}" />`
    },
    generateElementIconCode(symbol) {
      return `<i class="el-icon-${symbol}" />`
    },
    handleClipboard(text, event) {
      clipboard(text, event)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.icons-container {
  margin: 10px 20px 0;
  overflow: hidden;
  .icons-wrapper {
    margin: 0 auto;
  }
  .icon-item {
    margin: 20px;
    height: 110px;
    text-align: center;
    width: 110px;
    float: left;
    font-size: 30px;
    color: #24292e;
    cursor: pointer;
  }
  span {
    display: block;
    font-size: 24px;
    margin-top: 10px;
  }
  .disabled {
    pointer-events: none;
  }
}
</style>
