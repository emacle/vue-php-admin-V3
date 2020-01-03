# vue-php-admin-V3 项目说明

**V3 版本加入动态切换角色功能，不同角色功能不同，同时也可归属不同的部门**

**v3版本前后端均使用 develop 分支,token设计存储在数据库表sys_user_token中, 使用时需要 checkout develop, 开启jwt分支用于以php-jwt生成jwt-token重构**

基于 vue-element-admin 和 PHP CodeIgniter RESTful 实现，
采用前后端分离架构的权限管理系统，PHP快速开发平台，目标是搭建一
套简洁易用的快速解决方案，可以帮助用户有效降低项目开发难度和成本。

以vue-element-admin@3.10.0 前端模板为基础，修改动态路由部分，实现菜单路由
可根据后端角色进行动态加载。

将vue-element-admin前端原来样例模板除首页、文档外，其余样例模板
归档集中在样例模板下，见 @router/index.js constantRouterMap，
其余组件如 tags-views等，全部未做变化，可根据需要具体需求进行删减。 

## demo地址
 [vue-php-admin-V3](http://222.40.42.139:7002/)
 [vue-php-admin](http://172.30.3.11:7000/)

## 功能介绍
1. 系统登录：系统用户登录，系统登录认证（token方式），**企业微信扫码登录（测试success）**
2. 用户管理：新建用户，修改用户，删除用户，查询用户
3. 角色管理：新建角色，修改角色，删除角色，查询角色
4. 菜单管理：新建菜单，修改菜单，删除菜单，查询菜单
5. 图标管理：vue-element-admin 原有封装组件
6. 机构管理：新建机构，修改机构，删除机构，查询机构

## 开发环境 
- phpstudy  php 5.6.27 nts + Apache
- vue.js

## 后端开发框架 
 - 后端 [PHP CI 3.1.10 RESTful](https://github.com/chriskacerguis/codeigniter-restserver)
 - 前端 [vue-element-admin](https://github.com/PanJiaChen/vue-element-admin/)

## 使用说明

### 前端
1. 下载前端代码解压 [vue-php-admin-V3](https://github.com/emacle/vue-php-admin-V3.git)
2. 修改接口配置

    cat config/dev.env.js
    ```html
        module.exports = {
          NODE_ENV: '"development"',
          ENV_CONFIG: '"dev"',
          // BASE_API: '"https://api-dev"' 根据后端实际接口配置
          BASE_API: '"http://www.cirest.com:8889/api/v3/"'
        }
    ```
3. 运行
    ```html
       npm run dev
    ```

### 后端
1. 下载后端代码解压  [CodeIgniter-3.1.10](https://github.com/emacle/CodeIgniter-3.1.10.git)
2. 创建数据库 vueadmin, 导入 **vueadmin-v3.sql** 文件，navcat-for-mysql导入有时会出错时, 修改 mysql my.ini配置文件参数 mysqld 节点下添加 max_allowed_packet = 500M
3. 后端数据库连接配置 修改配置文件

    cat application\config\database.php
    
    ```php
     $db['default'] = array(
        'dsn'	=> '',
        'hostname' => 'localhost',
        'username' => 'root',
        'password' => 'root',
        'database' => 'vueadmin',
        ...
    ```
4. 使用 phpstudy 配置站点域名管理, 同时修改hosts文件（可选）

    www.cirest.com:8889  **注意与前端接口配置一致** BASE_API: '"http://www.cirest.com:8889/api/v3/"'

    接口调用使用示例：
    ```html
    http://www.cirest.com:8889/api/v2/sys/menu/testapi
    http://www.cirest.com:8889/index.php/api/v2/sys/menu/testapi
    
    request header 配置 X-API-KEY: oocwo8cs88g4c8w8c08ow00ss844cc4osko0s0ks  
    ```
    带有 index.php 若要去掉 修改根目录下 CodeIgniter-3.1.10/.htaccess 文件(Apache), 注意不是 CodeIgniter-3.1.10/application/ 目录下
    Nginx的话需要对应的配置
    
    cat CodeIgniter-3.1.10/.htaccess
    
    ```html
      <IfModule mod_rewrite.c>
        RewriteEngine on
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteRule ^(.*)$ /index.php?/$1 [QSA,PT,L]
      </IfModule>
    ```

## 编辑器 
 - phpstrom
 - vscode

## 企业微信登录效果
![角色切换](static/screenshot/weixin_login.gif)

## 截图
 ![角色切换](static/screenshot/role_switch.png)
 ![角色切换](static/screenshot/role_switch.png)
 ![菜单](static/screenshot/menu.png)
 ![菜单新增](static/screenshot/menu_add.png)
 ![菜单查询](static/screenshot/menu_search.png) 
 ![角色/授权](static/screenshot/role.png)
 ![角色新增](static/screenshot/role2.png)
 ![用户管理](static/screenshot/user.png)
 ![用户新增](static/screenshot/user_add.png)
 ![机构管理](static/screenshot/dept.png)
