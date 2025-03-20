import express from 'express';
import multer from 'multer';
import path from 'path';
import Resource from '../models/Resource.js';

const router = express.Router();

// 定义允许的文件类型
const allowedMimeTypes = [
  // 图片
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // 文档
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // 音视频
  'video/mp4',
  'audio/mpeg',
  'audio/wav',
  // 压缩文件
  'application/zip',
  'application/x-rar-compressed'
];

// 文件过滤器
const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`不支持的文件类型：${file.mimetype}`), false);
  }
};

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 限制文件大小为 50MB
  }
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;

    const resource = new Resource({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimeType: file.mimetype
    });

    await resource.save();
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: '上传失败', error: error.message });
  }
});

export default router;
