import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Space, 
  Modal, 
  message, 
  Upload, 
  Popconfirm,
  Typography,
  Tooltip,
  Drawer,
  Statistic,
  Row,
  Col
} from 'antd';
import { 
  DeleteOutlined, 
  UploadOutlined, 
  EyeOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { Text } = Typography;

const ResourceList = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [statsVisible, setStatsVisible] = useState(false);
  const [currentStats, setCurrentStats] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const fetchResources = async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/resources', {
        params: {
          page: params.current || 1,
          limit: params.pageSize || 10,
          sort: params.sort,
          order: params.order
        }
      });
      
      setResources(data.data);
      setPagination({
        ...pagination,
        total: data.pagination.total
      });
    } catch (error) {
      message.error('获取资源列表失败');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const showDeleteConfirm = (ids) => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: Array.isArray(ids) 
        ? `确定要删除选中的 ${ids.length} 个资源吗？` 
        : '确定要删除这个资源吗？',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => handleDelete(ids)
    });
  };

  const handleDelete = async (ids) => {
    try {
      if (Array.isArray(ids)) {
        await axios.delete('/api/resources', { data: { ids } });
      } else {
        await axios.delete(`/api/resources/${ids}`);
      }
      message.success('删除成功');
      setSelectedRowKeys([]);
      fetchResources();
    } catch (error) {
      message.error('删除失败: ' + error.message);
    }
  };

  const showResourceStats = async (id) => {
    try {
      const { data } = await axios.get(`/api/resources/${id}/stats`);
      setCurrentStats(data);
      setStatsVisible(true);
    } catch (error) {
      message.error('获取统计信息失败');
    }
  };

  const columns = [
    {
      title: '文件名',
      dataIndex: 'originalName',
      key: 'originalName',
    },
    {
      title: '类型',
      dataIndex: 'mimeType',
      key: 'mimeType',
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      render: (size) => `${(size / 1024).toFixed(2)} KB`,
    },
    {
      title: '上传时间',
      dataIndex: 'uploadDate',
      key: 'uploadDate',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: '访问次数',
      dataIndex: 'accessCount',
      key: 'accessCount',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看文件">
            <Button 
              type="link" 
              icon={<EyeOutlined />}
              onClick={() => window.open(`/uploads/${record.filename}`)}
            />
          </Tooltip>
          <Tooltip title="查看统计">
            <Button
              type="link"
              icon={<BarChartOutlined />}
              onClick={() => showResourceStats(record._id)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个资源吗？"
            onConfirm={() => handleDelete(record._id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  return (
    <Card title="资源管理">
      <Space style={{ marginBottom: 16 }}>
        <Upload
          action="/api/upload"
          multiple
          onChange={({ file, fileList }) => {
            if (file.status === 'done') {
              message.success(`${file.name} 上传成功`);
              if (fileList.every(f => f.status === 'done')) {
                fetchResources();
              }
            }
          }}
        >
          <Button icon={<UploadOutlined />}>上传文件</Button>
        </Upload>
        
        <Button 
          danger
          icon={<DeleteOutlined />}
          disabled={selectedRowKeys.length === 0}
          onClick={() => showDeleteConfirm(selectedRowKeys)}
        >
          批量删除
        </Button>
        
        <Button 
          icon={<ReloadOutlined />}
          onClick={() => fetchResources()}
        >
          刷新
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={resources}
        rowKey="_id"
        pagination={pagination}
        loading={loading}
        onChange={fetchResources}
        rowSelection={rowSelection}
      />

      <Drawer
        title="资源访问统计"
        placement="right"
        width={500}
        onClose={() => setStatsVisible(false)}
        visible={statsVisible}
      >
        {currentStats && (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="总访问次数"
                  value={currentStats.totalAccess}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="最后访问时间"
                  value={moment(currentStats.lastAccessed).format('YYYY-MM-DD HH:mm:ss')}
                />
              </Col>
            </Row>
            {/* 这里可以添加访问趋势图表 */}
          </>
        )}
      </Drawer>
    </Card>
  );
};

export default ResourceList; 