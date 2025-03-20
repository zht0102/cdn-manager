import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import moment from 'moment';
import Resource from '../models/Resource.js';
import accessTracker from '../middleware/accessTracker.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 获取资源列表
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'uploadDate',
      order = 'desc',
      type,
      search
    } = req.query;

    // 验证分页参数
    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return res.status(400).json({ message: '无效的分页参数' });
    }

    // 验证排序参数
    const allowedSortFields = ['uploadDate', 'size', 'filename', 'accessCount'];
    if (!allowedSortFields.includes(sort)) {
      return res.status(400).json({ message: '无效的排序字段' });
    }

    // 构建查询条件
    const query = {};

    // 按文件类型筛选
    if (type) {
      query.mimeType = new RegExp(type, 'i');
    }

    // 按文件名搜索
    if (search) {
      query.$or = [
        { filename: new RegExp(search, 'i') },
        { originalName: new RegExp(search, 'i') }
      ];
    }

    // 添加未删除条件
    query.isDeleted = { $ne: true };

    // 计算总数
    const total = await Resource.countDocuments(query);

    // 获取资源列表
    const resources = await Resource
      .find(query)
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-__v');

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
    res.status(500).json({
      message: '获取资源列表失败1',
      error: error.message
    });
  }
});

// 获取资源详情
router.get('/:id', accessTracker, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).select('-__v');
    if (!resource) {
      return res.status(404).json({ message: '资源不存在' });
    }
    res.json(resource);
  } catch (error) {
    res.status(500).json({
      message: '获取资源详情失败',
      error: error.message
    });
  }
});

// 获取资源统计信息
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await Resource.aggregate([
      {
        $group: {
          _id: null,
          totalFiles: { $sum: 1 },
          totalSize: { $sum: '$size' },
          avgSize: { $avg: '$size' },
          types: { $addToSet: '$mimeType' }
        }
      },
      {
        $project: {
          _id: 0,
          totalFiles: 1,
          totalSize: 1,
          avgSize: 1,
          typeCount: { $size: '$types' }
        }
      }
    ]);

    res.json(stats[0] || {
      totalFiles: 0,
      totalSize: 0,
      avgSize: 0,
      typeCount: 0
    });
  } catch (error) {
    res.status(500).json({
      message: '获取统计信息失败',
      error: error.message
    });
  }
});

// 添加访问统计查询接口
router.get('/:id/stats', async (req, res) => {
  try {
    const { range = '7d' } = req.query;
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: '资源不存在' });
    }

    // 计算时间范围
    const rangeMap = {
      '7d': 7,
      '30d': 30,
      '90d': 90
    };
    const days = rangeMap[range] || 7;
    const startDate = moment().subtract(days, 'days').toDate();

    // 获取每日统计
    const dailyStats = await Resource.aggregate([
      { $match: { _id: resource._id } },
      { $unwind: '$accessHistory' },
      {
        $match: {
          'accessHistory.timestamp': { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$accessHistory.timestamp'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          date: '$_id',
          count: 1,
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ]);

    // 获取时段分布
    const hourlyStats = await Resource.aggregate([
      { $match: { _id: resource._id } },
      { $unwind: '$accessHistory' },
      {
        $group: {
          _id: {
            hour: { $hour: '$accessHistory.timestamp' },
            dayOfWeek: { $dayOfWeek: '$accessHistory.timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          value: ['$_id.hour', '$_id.dayOfWeek', '$count']
        }
      }
    ]);

    // 获取地域分布
    const locationStats = await Resource.aggregate([
      { $match: { _id: resource._id } },
      { $unwind: '$accessHistory' },
      {
        $group: {
          _id: '$accessHistory.location',
          value: { $sum: 1 }
        }
      },
      {
        $project: {
          type: '$_id',
          value: 1,
          _id: 0
        }
      }
    ]);

    // 获取设备分布
    const deviceStats = await Resource.aggregate([
      { $match: { _id: resource._id } },
      { $unwind: '$accessHistory' },
      {
        $group: {
          _id: '$accessHistory.userAgent',
          value: { $sum: 1 }
        }
      },
      {
        $project: {
          type: '$_id',
          value: 1,
          _id: 0
        }
      }
    ]);

    res.json({
      totalAccess: resource.accessCount,
      lastAccessed: resource.lastAccessed,
      todayAccess: dailyStats.find(
        stat => stat.date === moment().format('YYYY-MM-DD')
      )?.count || 0,
      avgDailyAccess: dailyStats.reduce((sum, stat) => sum + stat.count, 0) / days,
      dailyStats,
      hourlyStats,
      locationStats,
      deviceStats
    });
  } catch (error) {
    res.status(500).json({
      message: '获取统计数据失败',
      error: error.message
    });
  }
});

// 删除单个资源
// 删除资源
router.delete('/:id', async (req, res) => {
  try {
    // 设置删除时间和恢复期限
    const deleteDate = new Date();
    const restoreDeadline = new Date();
    restoreDeadline.setDate(deleteDate.getDate() + 30); // 30天恢复期限

    // 先查找资源
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: '资源不存在' });
    }

    // 更新为已删除状态
    await Resource.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deleteDate: deleteDate,
        restoreDeadline: restoreDeadline
      }
    );

    res.json({ message: '文件已移至回收站', resource });
  } catch (error) {
    res.status(500).json({ message: '删除失败', error: error.message });
  }
});

// 恢复已删除的资源
router.post('/:id/restore', async (req, res) => {
  try {
    const resource = await Resource.findOne({
      _id: req.params.id,
      isDeleted: true
    });

    if (!resource) {
      return res.status(404).json({ message: '资源不存在或已被彻底删除' });
    }

    await Resource.findByIdAndUpdate(req.params.id, {
      isDeleted: false,
      deleteDate: null,
      restoreDeadline: null
    });

    res.json({ message: '资源已恢复' });
  } catch (error) {
    res.status(500).json({ message: '恢复失败', error: error.message });
  }
});

// 获取回收站列表
router.get('/trash', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const total = await Resource.countDocuments({ isDeleted: true });
    const resources = await Resource
      .find({ isDeleted: true })
      .sort({ deleteDate: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      data: resources,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: '获取回收站失败', error: error.message });
  }
});

// 清空回收站中过期的资源
router.delete('/trash/cleanup', async (req, res) => {
  try {
    const expiredResources = await Resource.find({
      isDeleted: true,
      restoreDeadline: { $lt: new Date() }
    });

    // 删除物理文件
    for (const resource of expiredResources) {
      const filePath = join(__dirname, '../../', resource.path);
      await fs.unlink(filePath).catch(console.error);
    }

    // 从数据库中删除记录
    await Resource.deleteMany({
      isDeleted: true,
      restoreDeadline: { $lt: new Date() }
    });

    res.json({
      message: '回收站清理完成',
      deletedCount: expiredResources.length
    });
  } catch (error) {
    res.status(500).json({ message: '清理失败', error: error.message });
  }
});

// 添加下载接口
router.get('/:id/download', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: '资源不存在' });
    }

    const filePath = join(__dirname, '../../uploads', resource.filename);
    res.download(filePath, resource.originalName);
  } catch (error) {
    res.status(500).json({ message: '下载失败', error: error.message });
  }
});

export default router;
