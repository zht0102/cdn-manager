import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import multer from 'multer';
import fs from 'fs';
import resourcesRouter from './routes/resources.js';
import uploadRouter from './routes/upload.js';
import trashRouter from './routes/trash.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
dotenv.config({ path: join(__dirname, '../.env') });

// 数据库连接管理类
class DatabaseManager {
  constructor() {
    this.isConnected = false;
    this.retryCount = 0;
    this.maxRetries = 5;
    this.retryInterval = 5000;
  }

  async connect() {
    try {
      await mongoose.connect('mongodb://root:example@localhost:27017/cdn_manager?authSource=admin', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      this.isConnected = true;
      this.retryCount = 0;
      console.log('MongoDB 连接成功');

      mongoose.connection.on('error', this.handleError.bind(this));
      mongoose.connection.on('disconnected', this.handleDisconnect.bind(this));
    } catch (error) {
      this.handleError(error);
    }
  }

  async handleError(error) {
    console.error('MongoDB 连接错误:', error);
    this.isConnected = false;
    await this.attemptReconnect();
  }

  async handleDisconnect() {
    console.log('MongoDB 连接断开');
    this.isConnected = false;
    await this.attemptReconnect();
  }

  async attemptReconnect() {
    if (this.retryCount >= this.maxRetries) {
      console.error(`MongoDB 重连失败，已达到最大重试次数 ${this.maxRetries}`);
      return;
    }

    this.retryCount++;
    console.log(`尝试重新连接 MongoDB (${this.retryCount}/${this.maxRetries})...`);

    setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        console.error('重连失败:', error);
      }
    }, this.retryInterval);
  }

  async disconnect() {
    if (this.isConnected) {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('MongoDB 连接已关闭');
    }
  }
}

// 创建数据库管理实例
const dbManager = new DatabaseManager();

// 确保上传目录存在
const uploadsDir = join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件服务
app.use('/uploads', express.static(uploadsDir));

// 文件上传配置
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// 路由
app.use('/api/resources', resourcesRouter);
app.use('/api/upload', uploadRouter);

// 添加回收站路由
app.use('/api/trash', trashRouter);

app.get('/', (req, res) => {
  res.send('CDN Manager API');
});

// 启动服务器和数据库连接
const PORT = process.env.PORT || 5002;

// 优雅关闭处理
process.on('SIGINT', async () => {
  await dbManager.disconnect();
  process.exit(0);
});

// 启动应用
async function startServer() {
  try {
    await dbManager.connect();
    app.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
}

startServer();