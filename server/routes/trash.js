import express from 'express';
import { join } from 'path';
import fs from 'fs/promises';
import Resource from '../models/Resource.js';

const router = express.Router();

// 获取回收站列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // 直接使用原始查询绕过中间件
    const resources = await Resource.collection.find({ isDeleted: true })
      .sort({ deleteDate: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit))
      .toArray();

    const total = await Resource.collection.countDocuments({ isDeleted: true });

    res.json({
      data: resources,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: '获取回收站列表失败', error: error.message });
  }
});

// 恢复文件 - 修改路由顺序和实现
router.put('/:id/restore', async (req, res) => {
  try {
    const resource = await Resource.findOneAndUpdate(
      {
        _id: req.params.id,
        isDeleted: true
      },
      {
        isDeleted: false,
        deleteDate: null,
        restoreDeadline: null
      },
      { new: true }
    );

    if (!resource) {
      return res.status(404).json({ message: '文件不存在或已被永久删除' });
    }

    res.json({ message: '文件已恢复', resource });
  } catch (error) {
    res.status(500).json({ message: '恢复失败', error: error.message });
  }
});

// 永久删除文件 - 修改实现
router.delete('/:id', async (req, res) => {
  try {
    const resource = await Resource.findOne({
      _id: req.params.id,
      isDeleted: true
    });

    if (!resource) {
      return res.status(404).json({ message: '文件不存在或已被永久删除' });
    }

    // 删除物理文件
    try {
      const filePath = join(process.cwd(), 'uploads', resource.filename);
      await fs.unlink(filePath);
    } catch (err) {
      console.error('物理文件删除失败:', err);
    }

    // 从数据库中删除记录
    await Resource.findByIdAndDelete(req.params.id);

    res.json({ message: '文件已永久删除' });
  } catch (error) {
    res.status(500).json({ message: '删除失败', error: error.message });
  }
});

// 清空回收站
router.delete('/', async (req, res) => {
  try {
    const expiredResources = await Resource.find({
      isDeleted: true,
      restoreDeadline: { $lt: new Date() }
    });

    // 删除物理文件
    for (const resource of expiredResources) {
      const filePath = join(__dirname, '../../uploads', resource.filename);
      await fs.unlink(filePath).catch(console.error);
    }

    // 从数据库中删除记录
    await Resource.deleteMany({
      isDeleted: true,
      restoreDeadline: { $lt: new Date() }
    });

    res.json({
      message: '回收站已清空',
      deletedCount: expiredResources.length
    });
  } catch (error) {
    res.status(500).json({ message: '清空失败', error: error.message });
  }
});

export default router;