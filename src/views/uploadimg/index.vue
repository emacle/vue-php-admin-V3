<template>
  <div class="dashboard-container">
    <div class="dashboard-text">name:{{ name }}</div>
    <div class="dashboard-text">roles:
      <span v-for="role in roles" :key="role">{{ role }}</span>
    </div>

    <hr>
    <el-form ref="form" :model="form" label-width="120px">
      <el-form-item label="身份证">
        <el-input v-model="identify" :readonly="true" />
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="phone" :readonly="true" />
      </el-form-item>

      <el-form-item label="证件上传">
        <vue-dropzone id="dropzone" ref="myVueDropzone" :options="dropzoneOptions" :destroy-dropzone="false" />
        <li v-for="v in this.$store.state.uploadimg.fileLists" :key="v.fileName">
          {{ v.fileName }} - {{ v.serverFileName }}
        </li>
      </el-form-item>
      <el-form-item label="说明">
        <b>上传必须按顺序上传 身份证、银行卡</b>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">提交审核</el-button>
        <el-button @click="onCancel">Cancel</el-button>
      </el-form-item>
    </el-form>
  </div>

</template>

<script>
import { mapGetters } from 'vuex'

import vue2Dropzone from 'vue2-dropzone'
import 'vue2-dropzone/dist/vue2Dropzone.min.css'

import { rmvupfile, onsubmit } from '@/api/uploadimg'

export default {
  name: 'SysxUploadimgRafb',
  components: {
    vueDropzone: vue2Dropzone
  },

  data() {
    const apikey = this.$store.state.app.apikey
    console.log(apikey)
    const id = this.$store.state.user.identify
    // 定义全局数组 存储照片路径
    const fileList = []
    return {
      fileList: [],
      form: {
        name: '',
        region: '',
        identify: '',
        phone: ''
      },
      dropzoneOptions: {
        // url: 'http://www.cirest.com:8889/api/v2/uploadimg/upload',
        url: 'http://www.cirest.com:8889/api/example/chevereto',
        // 最大文件大小，单位是 MB
        maxFilesize: 10,
        dictFileTooBig: '图片最大10M',
        maxFiles: 2,
        // dictMaxFilesExceeded: '只能上传一个图片',
        maxfilesexceeded: file => {
          // 到达最大文件数时，不显示该文件预览图
          file.previewElement.remove()
          this.$message({
            message: '只能上传2图片',
            type: 'error'
          })
        },
        // 检测文件重复时 不上传
        accept: this.checkDupl,
        acceptedFiles: '.jpg,.jpeg,.png,.gif',
        addRemoveLinks: true, // 是否有删除图片的功能
        dictRemoveFileConfirmation: '确定删除文件？',
        dictRemoveFile: '删除文件', // 删除图片的文字
        dictCancelUpload: '取消上传',
        dictDefaultMessage: '单击或拖拽上传',
        params: { 'identify': id },
        headers: { 'X-API-KEY': apikey },
        queuecomplete: file => {
          console.log(file)
        },
        success: (file, response) => {
          console.log(file)
          console.log('File ' + file.name + ' uploaded')
          // console.log(file)
          var res = JSON.parse(response)
          console.log(res)
          var fileinfo = {
            'serverFileName': res.filepath,
            'fileName': file.name
          }
          fileList.push(fileinfo)
          console.log(fileList)
          this.$store.dispatch('SetFileLists', fileList)
          // this.$store.state.uploadimg.fileLists = fileList
          console.log(this.$store.state.uploadimg.fileLists)
          this.$message(res.message) // uploadimg_post 接口返回信息格式
          // if(res.status_code == 200){ // chevereto_post 接口返回信息格式
          //    this.$message(res.success.message)
          // } else {
          //    this.$message(res.error.message)
          // }
        },
        removedfile: file => {
          file.previewElement.remove()
          var rmvFile = ''
          // 查找对应的serverFileName 同时将该文件从全局文件数组里删除
          for (var f = 0; f < fileList.length; f++) {
            if (fileList[f].fileName === file.name) {
              rmvFile = fileList[f].serverFileName
              fileList.splice(f, 1)
              f--
            }
          }
          console.log(fileList)
          this.$store.dispatch('SetFileLists', fileList)
          // this.$store.state.uploadimg.fileLists = fileList
          console.log(this.$store.state.uploadimg.fileLists)

          // console.log(rmvFile) // /uploads/image/T410000000000000000/201903/20190304015631_70938.png
          // rmvupfile axios 从服务器删除
          if (rmvFile) {
            rmvupfile(rmvFile, file.name).then(response => {
              console.log(response)
              this.$message(response.data)
            }).catch(error => {
              console.log(error)
            })
          }
          // 文件类型出错时,点击删除清除预览
          if (file.status === 'error') {
            file.previewElement.remove()
          }
        }
      }
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'roles',
      'phone',
      'identify'
    ])
  },
  // 离开当前页面后执行
  destroyed() {
    console.log('uploadimg destroyed....')
    this.$store.state.uploadimg.fileLists = []
    console.log(this.$store.state.uploadimg.fileLists)
  },
  methods: {
    onSubmit() {
      if (this.$store.state.uploadimg.fileLists.length !== 2) {
        this.$message({
          message: '必须上传4张证件照',
          type: 'error'
        })
        return
      }

      // ajax 提交前判断 是否审核状态，如果后台数据库记录已提交 则不能重复提交

      this.form.phone = this.phone
      this.form.identify = this.identify
      this.form.idinfo = this.$store.state.uploadimg.fileLists[0].serverFileName
      this.form.bankinfo = this.$store.state.uploadimg.fileLists[1].serverFileName
      console.log(this.form)
      onsubmit(this.form).then(response => {
        console.log(response)
        this.$message(response.message)
        // 提交成功后 退出提交界面
        // <vue-dropzone id="dropzone" :destroyDropzone="false" 定义时加入destroyDropzone 属性为false 关闭页面或卸载compent时，不会触发removedfiles事件
        // <vue-dropzone id="dropzone" :destroy-dropzone="false" 使用驼峰命名变量 eslint检测会报错
        // this.$store.dispatch('LogOut').then(() => {
        //  location.reload() // 为了重新实例化vue-router对象 避免bug
        // })
      })
    },
    checkDupl(file, done) {
      const v = this.$refs.myVueDropzone
      // use "let v = this.$refs.myVueDropzone;" instead if you are not using typescript
      const files = v.getAcceptedFiles()
      const item = files.find(el => el.upload.filename === file.name)
      if (item) {
        done('duplicate file!')
        this.$message({
          message: '上传文件重复',
          type: 'error'
        })
        file.previewElement.remove()
      } else {
        done()
      }
    },
    onCancel() {
      this.$message({
        message: 'cancel!',
        type: 'warning'
      })
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
</style>
