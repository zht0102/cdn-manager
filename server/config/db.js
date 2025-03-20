import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const {
  MONGODB_HOST = 'localhost',
  MONGODB_PORT = '27017',
  MONGODB_USER = 'cdn_admin',
  MONGODB_PASSWORD = 'cdn_password_123',
  MONGODB_DATABASE = 'cdn_manager',
} = process.env;

const MONGODB_URI = `mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}`;

class DatabaseManager {
  constructor() {
    this.isConnected = false;
    this.retryCount = 0;
    this.maxRetries = 5;
    this.retryInterval = 5000;
  }

  async connect() {
    try {
      await mongoose.connect(MONGODB_URI, {
        authSource: MONGODB_DATABASE,
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

  getConnection() {
    return mongoose.connection;
  }
}

const dbManager = new DatabaseManager();

export default dbManager;