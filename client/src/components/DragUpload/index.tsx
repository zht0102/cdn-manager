import React, { useState } from 'react';
import { Upload, message, Progress, Card } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import axios from 'axios';

const { Dragger } = Upload;

interface DragUploadProps {
  onUploadSuccess?: () => void;
}

import { Upload, message } from 'antd';
import type { UploadProps } from 'antd';

// 定义允许的文件类型
const allowedFileTypes = [
  // 图片
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
  // 文档
  '.pdf', '.doc', '.docx',
  // 音视频
  '.mp4', '.mp3', '.wav',
  // 压缩文件
  '.zip', '.rar'
];

const DragUpload: React.FC<{ onUploadSuccess: () => void }> = ({ onUploadSuccess }) => {
  const props: UploadProps = {
    name: 'file',
    multiple: false,
    action: '/api/upload',
    accept: allowedFileTypes.join(','),
    beforeUpload: (file) => {
      const isAllowedType = allowedFileTypes.some(type => 
        file.name.toLowerCase().endsWith(type)
      );
      const isLt50M = file.size / 1024 / 1024 < 50;

      if (!isAllowedType) {
        message.error('不支持的文件类型！');
        return false;
      }
      if (!isLt50M) {
        message.error('文件大小不能超过 50MB！');
        return false;
      }
      return true;
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 上传成功`);
        onUploadSuccess();
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 上传失败`);
      }
    },
  };

  return (
    <Upload.Dragger {...props}>
      <p className="ant-upload-drag-icon">📁</p>
      <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
      <p className="ant-upload-hint">
        支持的文件类型：图片、文档、音视频、压缩文件，单文件最大 50MB
      </p>
    </Upload.Dragger>
  );
};

export default DragUpload;