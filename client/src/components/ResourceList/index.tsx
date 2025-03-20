import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Table, Space, Button, message, Tooltip } from 'antd';
import { EyeOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';

interface Resource {
  _id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadDate: string;
  accessCount: number;
}

export interface ResourceListRef {
  refresh: () => void;
}

const ResourceList = forwardRef<ResourceListRef>((props, ref) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // 暴露 refresh 方法给父组件
  useImperativeHandle(ref, () => ({
    refresh: fetchResources
  }));

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/resources', {
        params: {
          page: pagination.current,
          limit: pagination.pageSize
        }
      });
      setResources(data.data);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total
      }));
    } catch (error) {
      message.error('获取资源列表失败');
    }
    setLoading(false);
  }, [pagination.current, pagination.pageSize])

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/resources/${id}`);
      message.success('删除成功');
      fetchResources();
    } catch (error) {
      message.error('删除失败');
    }
  };

    const handlePreview = (record: Resource) => {
        // 判断文件类型
        if (record.mimeType.startsWith('image/')) {
            // 图片直接在新窗口打开
            window.open(`/uploads/${record.filename}`);
        } else if (record.mimeType === 'application/pdf') {
            // PDF 使用浏览器内置查看器
            window.open(`/uploads/${record.filename}`);
        } else {
            // 其他类型提示下载
            message.info('此类型文件不支持预览，请下载后查看');
        }
    };

    const handleDownload = async (record: Resource) => {
        try {
            const response = await axios.get(`/api/resources/${record._id}/download`, {
                responseType: 'blob'
            });

            // 创建下载链接
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', record.originalName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            message.error('下载失败');
        }
    };

  const columns: ColumnsType<Resource> = [
    {
      title: '文件名',
      dataIndex: 'originalName',
      key: 'originalName',
      ellipsis: true
    },
    {
      title: '类型',
      dataIndex: 'mimeType',
      key: 'mimeType',
      width: 120
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: 120,
      render: (size: number) => {
        const sizeInKB = size / 1024;
        if (sizeInKB >= 1024) {
          return `${(sizeInKB / 1024).toFixed(2)} MB`;
        }
        return `${sizeInKB.toFixed(2)} KB`;
      }
    },
    {
      title: '上传时间',
      dataIndex: 'uploadDate',
      key: 'uploadDate',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: '访问次数',
      dataIndex: 'accessCount',
      key: 'accessCount',
      width: 100
    },

  {
    title: '操作',
    key: 'action',
    width: 180,
    render: (_, record) => (
      <Space>
        <Tooltip title="预览">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record)}
          />
        </Tooltip>
        <Tooltip title="下载">
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record)}
          />
        </Tooltip>
        <Tooltip title="删除">
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          />
        </Tooltip>
      </Space>
    )
  }
  ];

  return (
    <Table
      columns={columns}
      dataSource={resources}
      rowKey="_id"
      pagination={pagination}
      loading={loading}
      onChange={(pagination) => setPagination(pagination)}
    />
  );
});

export default ResourceList;
