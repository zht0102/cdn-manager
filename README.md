# CDN静态资源管理系统

这是一个基于React和Node.js的CDN静态资源管理系统。

## 技术栈

- 前端：React + Ant Design
- 后端：Node.js + Express
- 数据库：MongoDB
- 文件存储：本地文件系统

## 功能特点

- 文件上传和管理
- 资源分类和标签
- 资源访问权限控制
- 资源预览
- 资源搜索

## 安装说明

1. 安装依赖
```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd client
npm install
```

2. 配置环境变量
- 复制 `.env.example` 到 `.env`
- 根据需要修改配置

3. 启动MongoDB
```bash
# 确保MongoDB服务已启动
```

4. 启动应用
```bash
# 开发模式（同时启动前端和后端）
npm run dev:full

# 仅启动后端
npm run dev

# 仅启动前端
npm run client
```

## 项目结构

```
cdn-manager/
├── client/          # React前端项目
├── server/          # Node.js后端项目
│   ├── models/      # 数据模型
│   ├── routes/      # API路由
│   └── index.js     # 服务器入口
├── uploads/         # 文件上传目录
└── package.json     # 项目配置文件
``` 