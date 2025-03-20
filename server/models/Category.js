const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  path: String, // 存储完整分类路径，如：'根分类/子分类/当前分类'
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 更新 Resource 模型，添加分类字段
const resourceSchema = mongoose.Schema({
  // ... existing fields ...
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }]
});

module.exports = mongoose.model('Category', categorySchema); 