import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, Radio } from 'antd';
import { Line, Pie } from '@ant-design/charts';
import ReactEcharts from 'echarts-for-react';
import moment from 'moment';

const ResourceStats = ({ resourceId }) => {
  const [loading, setLoading] = useState(false);
  const [statsData, setStatsData] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/resources/${resourceId}/stats`, {
        params: { range: timeRange }
      });
      setStatsData(data);
    } catch (error) {
      message.error('获取统计数据失败');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, [resourceId, timeRange]);

  if (loading || !statsData) return <Spin />;

  // 访问趋势配置
  const visitTrendConfig = {
    data: statsData.dailyStats,
    xField: 'date',
    yField: 'count',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'wave-in',
        duration: 1500
      }
    }
  };

  // 访问时段热力图配置
  const heatmapOption = {
    tooltip: {
      position: 'top'
    },
    grid: {
      height: '50%',
      top: '10%'
    },
    xAxis: {
      type: 'category',
      data: ['00', '03', '06', '09', '12', '15', '18', '21'],
      splitArea: {
        show: true
      }
    },
    yAxis: {
      type: 'category',
      data: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: 0,
      max: 10,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '15%'
    },
    series: [{
      name: '访问热度',
      type: 'heatmap',
      data: statsData.hourlyStats,
      label: {
        show: true
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  return (
    <div>
      <Card>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="总访问次数"
              value={statsData.totalAccess}
              suffix="次"
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="今日访问"
              value={statsData.todayAccess}
              suffix="次"
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="平均每日访问"
              value={statsData.avgDailyAccess}
              precision={2}
              suffix="次"
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="最后访问时间"
              value={moment(statsData.lastAccessed).fromNow()}
            />
          </Col>
        </Row>
      </Card>

      <Card
        title="访问趋势"
        style={{ marginTop: 16 }}
        extra={
          <Radio.Group 
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
          >
            <Radio.Button value="7d">7天</Radio.Button>
            <Radio.Button value="30d">30天</Radio.Button>
            <Radio.Button value="90d">90天</Radio.Button>
          </Radio.Group>
        }
      >
        <Line {...visitTrendConfig} />
      </Card>

      <Card title="访问时段分布" style={{ marginTop: 16 }}>
        <ReactEcharts option={heatmapOption} style={{ height: '400px' }} />
      </Card>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="访问者地域分布">
            <Pie
              data={statsData.locationStats}
              angleField='value'
              colorField='type'
              radius={0.8}
              label={{
                type: 'outer'
              }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="访问者设备分布">
            <Pie
              data={statsData.deviceStats}
              angleField='value'
              colorField='type'
              radius={0.8}
              label={{
                type: 'outer'
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ResourceStats; 