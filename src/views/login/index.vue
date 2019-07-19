<template>
  <div class="login-container">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on" label-position="left">
      <div class="title-container">
        <h3 class="title">
          {{ $t('login.title') }}
        </h3>
        <lang-select class="set-language" />
      </div>

      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input v-model="loginForm.username" :placeholder="$t('login.username')" name="username" type="text" auto-complete="on" />
      </el-form-item>

      <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input v-model="loginForm.password" :type="passwordType" :placeholder="$t('login.password')" name="password" auto-complete="on" @keyup.enter.native="handleLogin" />
        <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>
      <!--  background:#2d3a4b -->
      <el-form-item prop="verifycode" style=" border: 1px;color: #454545; background:#2d3a4b; position: relative;">
        <el-input v-model="loginForm.verifycode" placeholder="请输入验证码" style="width:363px; background: rgba(0, 0, 0, 0.1);" />
        <!-- fit="fill"  fits: ['fill', 'contain', 'cover', 'none', 'scale-down'], -->
        <img :src="VerificationImg" style="position: absolute;top:5px;margin-right:20px" @click="clickVerification">
      </el-form-item>

      <drag-verify
        v-show="!vSuccess"
        ref="Verify"
        :height="39"
        :width="450"
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
          <!-- <span>{{ $t('login.password') }} : {{ $t('login.any') }}</span> -->
          <span>{{ $t('login.password') }} : admin</span>

        </div>
        <div class="tips">
          <span style="margin-right:18px;">
            普通{{ $t('login.username') }} : qiaokun
          </span>
          <span>{{ $t('login.password') }} : qiaokun</span>
        </div>

        <el-button class="thirdparty-button" type="primary" @click="showDialog=true">
          {{ $t('login.thirdparty') }}
        </el-button>
      </div>
    </el-form>

    <el-dialog :title="$t('login.thirdparty')" :visible.sync="showDialog">
      {{ $t('login.thirdpartyTips') }}
      <br>
      <br>
      <br>
      <social-sign />
    </el-dialog>

    <div id="wx_qrcode" />
  </div>
</template>

<script>
import { validUsername } from '@/utils/validate'
import LangSelect from '@/components/LangSelect'
import SocialSign from './socialsignin'
import dragVerify from 'vue-drag-verify'
import random from 'string-random'

export default {
  name: 'Login',
  components: { LangSelect, SocialSign, dragVerify },
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
      showDialog: false,
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
      this.VerificationImg = 'http://www.cirest.com:8889/api/v3/sys/user/verifycode?verify=' + this.verify
    },

    afterQRScan() {
      // const hash = window.location.hash.slice(1)
      // const hashObj = getQueryObject(hash)
      // const originUrl = window.location.origin
      // history.replaceState({}, '', originUrl)
      // const codeMap = {
      //   wechat: 'code',
      //   tencent: 'code'
      // }
      // const codeName = hashObj[codeMap[this.auth_type]]
      // if (!codeName) {
      //   alert('第三方登录失败')
      // } else {
      //   this.$store.dispatch('LoginByThirdparty', codeName).then(() => {
      //     this.$router.push({ path: '/' })
      //   })
      // }
    }
  }

}
</script>

<style rel="stylesheet/scss" lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg: #283443;
$light_gray: #eee;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
    &::first-line {
      color: $light_gray;
    }
  }
}
// drag verify
.drag_verify {
  border-radius: 4px !important;
  .dv_progress_bar {
    border-radius: 4px !important;
  }
  .dv_handler {
    border-radius: 4px !important;
    top: 1px !important;
  }
  .dv_text {
    background: -webkit-gradient(
      linear,
      left top,
      right top,
      color-stop(0, #4d4d4d),
      color-stop(0.4, #4d4d4d),
      color-stop(0.5, white),
      color-stop(0.6, #4d4d4d),
      color-stop(1, #4d4d4d)
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    -webkit-text-size-adjust: none;
    -webkit-animation: slidetounlock 5s infinite;
  }
  @-webkit-keyframes slidetounlock {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: 200px 0;
    }
  }
}
/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;
    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;
      &:-webkit-autofill {
        -webkit-box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }
  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

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
