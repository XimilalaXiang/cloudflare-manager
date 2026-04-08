# Workers

管理各账户下的 Cloudflare Workers 脚本。

## 查看列表

选择账户查看所有 Workers 脚本，包括创建时间和修改时间。

## 查看代码

点击 **查看代码** 在弹窗中查看完整源码。

## 部署 Worker

1. 点击 **部署**
2. 输入脚本名称
3. 粘贴 Worker 代码
4. 如果使用模块语法，勾选 **ES Module 格式**
5. 点击 **部署**

ES Module Worker 示例：

```javascript
export default {
  async fetch(request) {
    return new Response("Hello from Cloudflare Manager!");
  }
};
```

## 版本历史

每个 Worker 会记录版本历史。点击 **版本** 查看：

- 版本号和版本 ID
- 创建和修改日期
- 作者邮箱
- 来源（API、控制台等）

## 部署状态

点击 **部署状态** 查看当前部署配置：

- 部署策略（如百分比灰度发布）
- 活跃版本及流量分配比例
- 部署说明和作者

## 删除 Worker

点击 **删除** 按钮并确认后删除 Worker 脚本。
