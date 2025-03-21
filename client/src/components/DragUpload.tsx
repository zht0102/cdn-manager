import { useState } from 'react';
import { Upload, message, Progress, Card } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps, UploadFile } from 'antd';
import type { FC } from 'react';
import axios from 'axios';

const { Dragger } = Upload;

interface DragUploadProps {
  onUploadSuccess?: (data: any) => void;
}

interface UploadProgressType {
  [key: string]: number;
}

const DragUpload: FC<DragUploadProps> = ({ onUploadSuccess }) => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgressType>({});

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    action: '/api/upload',
    customRequest: async ({ 
      file, 
      onSuccess, 
      onError, 
      onProgress 
    }: any) => {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (event) => {
            if (event.total) {
              const percent = Math.floor((event.loaded / event.total) * 100);
              setUploadProgress(prev => ({
                ...prev,
                [file.uid]: percent
              }));
              onProgress({ percent });
            }
          },
        });

        onSuccess?.(response.data);
        onUploadSuccess?.(response.data);
        message.success(`${file.name} 上传成功`);
      } catch (error) {
        onError?.(error);
        message.error(`${file.name} 上传失败`);
      } finally {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.uid];
          return newProgress;
        });
      }
    },
    beforeUpload(file: UploadFile) {
      const isLt20M = file.size ? file.size / 1024 / 1024 < 20 : false;
      if (!isLt20M) {
        message.error('文件大小不能超过 20MB！');
        return false;
      }
      return true;
    },
  };

  return (
    <Card>
      <Dragger {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          点击或拖拽文件到此区域上传
        </p>
        <p className="ant-upload-hint">
          支持单个或批量上传，文件大小不超过 20MB
        </p>
      </Dragger>
      {Object.entries(uploadProgress).map(([uid, progress]) => (
        <Progress
          key={uid}
          percent={progress}
          size="small"
          style={{ marginTop: 8 }}
        />
      ))}
    </Card>
  );
};

export default DragUpload;
