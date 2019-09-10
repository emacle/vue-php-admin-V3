<template>
  <div class="login-container pull-height" @keyup.enter.native="handleLogin">
    <div class="login-info text-white animated fadeInLeft">
      <div class="logo" style="margin-top:-426px">
        <img src="https://upload.wikimedia.org/wikipedia/commons/6/66/Openlogo-debianV2.svg" width="160px" height="160px" alt="logo" style="vertical-align: middle;">
      </div>
      <h2 class="login-info-title">VUE-ELEMENT-ADMIN</h2>
      <ul class="login-info-list">
        <li class="login-info-item">
          <i class="el-icon-check" />VUE-ELEMENT-ADMIN 是一个基于XXXX工程可视化管理平台，采用token交互验证方式。
        </li>
        <li class="login-info-item">
          <i class="el-icon-check" />您可以VUE-ELEMENT-ADMIN为基础，不只限制于vue的页面，你可以嵌入任意第三方网站，基于iframe框架。
        </li>
        <li class="login-info-item">
          <i class="el-icon-check" />VUE-ELEMENT-ADMIN 构建简单上手快，最大程度上帮助企业节省时间成本和费用开支。
        </li>
      </ul>
    </div>
    <div class="login-border animated fadeInRight">
      <div class="login-main">
        <h4 class="login-title">登录VUE-ELEMENT-ADMIN</h4>
        <el-tabs v-model="activeName">
          <el-tab-pane label="用户密码" name="user">
            <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on" label-position="left">
              <el-form-item prop="username">
                <el-input v-model="loginForm.username" :placeholder="$t('login.username')" name="username" type="text" auto-complete="on">
                  <i slot="prefix" class="el-icon-user" />
                </el-input>
              </el-form-item>
              <el-form-item prop="password">
                <el-input v-model="loginForm.password" :type="passwordType" :placeholder="$t('login.password')" name="password" auto-complete="on" @keyup.enter.native="handleLogin">
                  <i slot="prefix" class="el-icon-lock" />
                  <i slot="suffix">
                    <span class="show-pwd" @click="showPwd">
                      <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
                    </span>
                  </i>
                </el-input>

              </el-form-item>

              <el-form-item prop="verifycode">
                <el-input v-model="loginForm.verifycode" placeholder="请输入验证码">
                  <template slot="append">
                    <img :src="VerificationImg" @click="clickVerification">
                  </template>
                </el-input>
              </el-form-item>

              <drag-verify
                v-show="!vSuccess"
                ref="Verify"
                :height="39"
                :circle="true"
                style="width:100%;margin-bottom:30px;"
                handler-icon="el-icon-d-arrow-right"
                success-icon="el-icon-check"
                text="拖动滑块到右侧完成验证"
                success-text="验证成功"
                background="#ccc"
                color="#ffffff"
                progress-bar-bg="#FFFF99"
                completed-bg="#66cc66"
                handler-bg="#fff"
                text-size="16px"
                @passcallback="passcallback" />
              <el-button v-if="vSuccess" :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="handleLogin">
                {{ $t('login.logIn') }}
              </el-button>

              <div style="position:relative">
                <div class="tips">
                  <span>超级{{ $t('login.username') }} : admin</span>
                  <span>{{ $t('login.password') }} : admin</span>
                </div>
                <div class="tips">
                  <span>
                    普通{{ $t('login.username') }} : qiaokun
                  </span>
                  <span>{{ $t('login.password') }} : qiaokun</span>
                </div>
              </div>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="企业微信扫码" name="code">
            <div id="wx_qrcode" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

  </div>
</template>

<script>
import { validUsername } from '@/utils/validate'
import LangSelect from '@/components/LangSelect'
import SocialSign from './socialsignin'
import dragVerify from 'vue-drag-verify'
import random from 'string-random'
import animated from 'animate.css'

export default {
  name: 'Login',
  components: { LangSelect, SocialSign, dragVerify, animated },
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('Please enter the correct user name'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 5) {
        callback(new Error('The password can not be less than 5 digits'))
      } else {
        callback()
      }
    }
    return {
      activeName: 'user',
      VerificationImg: '', // 图形验证码链接
      verify: '', // 图形验证码链接参数 r=100015015015
      loginForm: {
        username: 'admin',
        password: 'admin',
        verify: '',
        verifycode: ''
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      passwordType: 'password',
      loading: false,
      redirect: undefined,
      vSuccess: false
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  created() {
    // window.addEventListener('hashchange', this.afterQRScan)
    this.wxLogin()
  },
  destroyed() {
    // window.removeEventListener('hashchange', this.afterQRScan)
  },
  mounted() {
    this.clickVerification()
    // https://blog.csdn.net/msllws/article/details/81223949 修改默认样式
    window.WwLogin({
      'id': 'wx_qrcode',
      // "appid": "xxxxxxx",
      // "agentid": "1000000",
      // "redirect_uri": encodeURIComponent('http://yw.xxx.com/ksh/get-corp-weixin-code.html?redirect_uri='),  // yw.xxx.com 是企业微信里的回调域名
      'state': random(16, { specials: false, numbers: true, letters: false }),
      // href 自定义二维码样式 可微调大小 TODO
      'href': 'data:text/css;base64,LmltcG93ZXJCb3ggLnFyY29kZSB7d2lkdGg6IDIwMHB4O30NCi5pbXBvd2VyQm94IC50aXRsZSB7ZGlzcGxheTogbm9uZTt9DQouaW1wb3dlckJveCAuaW5mbyB7d2lkdGg6IDIwMHB4O30NCi5zdGF0dXNfaWNvbiB7ZGlzcGxheTogbm9uZX0NCi5pbXBvd2VyQm94IC5zdGF0dXMge3RleHQtYWxpZ246IGNlbnRlcjt9',
      'style': 'black'
    })
  },
  methods: {
    // 获取当前 location.href 里的参数值
    getUrlParms(name) {
      var reg = new RegExp('(^|\\?|&)' + name + '=([^&]*)(\\s|&|$)', 'i')
      // console.log('getvl', location.href)
      // http://localhost:9527/?code=8xpU6UL2kEiJngHmjOD87ZBbI2gC_bU1uGOMXvyVmn0&state=4924807670805111#/login?redirect=%2Fdashboard
      if (reg.test(location.href)) { return unescape(RegExp.$2.replace(/\+/g, ' ')) }
      return ''
    },
    wxLogin() {
      console.log('location与windows.location好像是一样...', location)
      if (location.search && location.search.indexOf('code=') >= 0 && location.search.indexOf('state=') >= 0) {
        this.activeName = 'code'
        const code = this.getUrlParms('code')
        this.loading = true
        this.$store.dispatch('corpAuth', code).then(() => {
          this.loading = false
          this.$router.push({ path: '/' })
        }).catch(() => {
          this.loading = false
        })
      }
    },
    passcallback() {
      this.vSuccess = true
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
    },
    resetVerify() {
      // 恢复滑动到原点
      console.log('恢复滑动到原点')
      this.$refs.Verify.isMoving = false
      this.$refs.Verify.x = 0
      this.$refs.Verify.isPassing = false
      var handler = this.$refs.Verify.$refs.handler
      handler.style.left = '0'
      // className https://github.com/AshleyLv/vue-drag-verify/issues/2
      handler.children[0].className = 'el-icon-d-arrow-right'
      this.$refs.Verify.$refs.progressBar.style.width = '0'
    },
    handleLogin() {
      if (!this.$refs.Verify.isPassing) {
        this.$message({
          message: '滑动滑块完成验证',
          type: 'error'
        })
        return
      }
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('LoginByUsername', this.loginForm).then(() => {
            this.loading = false
            this.$router.push({ path: this.redirect || '/' })
          }).catch(() => {
            this.loading = false
            this.vSuccess = false
            // 恢复滑动到原点
            this.resetVerify()
            this.clickVerification()
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    // 获取验证码
    clickVerification() {
      // var num = Math.random();
      this.verify = new Date().getTime()
      this.loginForm.verify = this.verify
      // console.log(this.loginForm)
      this.VerificationImg = process.env.BASE_API + '/sys/user/verifycode?verify=' + this.verify
    }
  }

}
</script>

<style lang="scss" scoped>
/* 使用方法：在样式代码的前面添加/deep/标示即可 */
/*  修改element-ui的 el-input-group__append 组件 使验证码显示合适 */
/deep/ .el-input-group__append {
  padding: 0 0px;
  background-color: #ffffff;
  border: 0px;
}
/deep/ #wx_qrcode > iframe {
  width: 265px;
  height: 288px;
}
.login-container {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: rgba(0, 0, 0, 0.2);
  position: relative;
  height: 900px;
}
.login-container::before {
  z-index: -999;
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-image: url("../../assets/images/login.png");
  background-size: cover;
}
.login-info {
  padding-left: 60px;
}
.login-info-title {
  line-height: 90px;
  color: #409eff;
}
.login-info-item {
  font-size: 14px;
  color: rgb(241, 125, 58);
}
.login-border {
  display: flex;
  justify-content: center;
  flex-direction: column;
  padding: 30px 50px 25px 50px;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 1px 1px 2px #eee;
}
.login-main {
  border-radius: 3px;
  box-sizing: border-box;
  background-color: #fff;
}
.login-main > h3 {
  margin-bottom: 20px;
}
.login-main > p {
  color: #76838f;
}
.login-title {
  margin: 0 0 20px;
  text-align: center;
  color: #409eff;
  letter-spacing: 3px;
}
.login-submit {
  margin-top: 20px;
  width: 100%;
  border-radius: 28px;
}
.login-form {
  margin: 10px 0;
  .el-form-item__content {
    width: 270px;
  }
  .el-form-item {
    margin-bottom: 20px;
  }
  .el-input {
    input {
      text-indent: 5px;
      border-color: #dcdcdc;
      border-radius: 3px;
    }
    .el-input__prefix {
      i {
        padding: 0 5px;
        font-size: 16px !important;
      }
    }
  }
}
.login-code {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin: 0 0 0 10px;
}
.login-code-img {
  margin-top: 2px;
  width: 100px;
  height: 32px;
  background-color: #fdfdfd;
  border: 1px solid #f0f0f0;
  color: #333;
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 5px;
  line-height: 32px;
  text-indent: 5px;
  text-align: center;
}
</style>
