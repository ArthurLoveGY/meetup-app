import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useCallback } from 'react'
import { EmptyState, LoadingView } from '../../components'
import { platformService } from '../../platform'
import './index.scss'

interface Report {
  id: string
  type: 'user' | 'trip' | 'comment'
  targetId: string
  targetName: string
  reason: string
  reporterId: string
  reporterName: string
  status: 'pending' | 'resolved' | 'dismissed'
  createdAt: string
}

export default function ReportManagement() {
  const [reports, setReports] = useState<Report[]>([
    {
      id: 'rpt_1',
      type: 'comment',
      targetId: 'comment_1',
      targetName: '不当评论内容',
      reason: 'inappropriate',
      reporterId: 'user_2',
      reporterName: '小红',
      status: 'pending',
      createdAt: '2026-06-08T10:00:00Z',
    },
    {
      id: 'rpt_2',
      type: 'user',
      targetId: 'user_10',
      targetName: '可疑用户',
      reason: 'spam',
      reporterId: 'user_3',
      reporterName: '小刚',
      status: 'pending',
      createdAt: '2026-06-07T15:00:00Z',
    },
  ])
  const [isLoading] = useState(false)

  const handleResolve = useCallback((reportId: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'resolved' as const } : r))
    )
    platformService.showToast({ title: '已处理', icon: 'success' })
  }, [])

  const handleDismiss = useCallback((reportId: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'dismissed' as const } : r))
    )
    platformService.showToast({ title: '已驳回', icon: 'success' })
  }, [])

  const getReasonLabel = (reason: string): string => {
    const map: Record<string, string> = {
      spam: '垃圾信息',
      inappropriate: '不当内容',
      harassment: '骚扰行为',
      fake: '虚假信息',
      other: '其他',
    }
    return map[reason] || reason
  }

  const getTypeLabel = (type: string): string => {
    const map: Record<string, string> = { user: '用户', trip: '行程', comment: '评论' }
    return map[type] || type
  }

  const pendingReports = reports.filter((r) => r.status === 'pending')

  if (isLoading) {
    return <LoadingView text='加载举报...' />
  }

  return (
    <View className='report-management'>
      <View className='report-management__header'>
        <Text className='report-management__title'>举报管理</Text>
        <Text className='report-management__count'>{pendingReports.length}条待处理</Text>
      </View>

      <ScrollView className='report-management__scroll' scrollY>
        {reports.length === 0 ? (
          <EmptyState
            icon='✅'
            title='暂无举报'
            description='所有举报都已处理'
          />
        ) : (
          <View className='report-management__list'>
            {reports.map((report) => (
              <View key={report.id} className='report-management__item'>
                <View className='report-management__item-header'>
                  <View className='report-management__item-type'>
                    <Text className='report-management__item-type-text'>{getTypeLabel(report.type)}</Text>
                  </View>
                  <View className={`report-management__item-status report-management__item-status--${report.status}`}>
                    <Text className='report-management__item-status-text'>
                      {report.status === 'pending' ? '待处理' : report.status === 'resolved' ? '已处理' : '已驳回'}
                    </Text>
                  </View>
                </View>
                <Text className='report-management__item-target'>{report.targetName}</Text>
                <Text className='report-management__item-reason'>原因：{getReasonLabel(report.reason)}</Text>
                <Text className='report-management__item-reporter'>举报人：{report.reporterName}</Text>
                <Text className='report-management__item-time'>{new Date(report.createdAt).toLocaleString()}</Text>
                {report.status === 'pending' && (
                  <View className='report-management__item-actions'>
                    <View
                      className='report-management__action report-management__action--resolve'
                      onClick={() => handleResolve(report.id)}
                    >
                      <Text className='report-management__action-text'>处理</Text>
                    </View>
                    <View
                      className='report-management__action report-management__action--dismiss'
                      onClick={() => handleDismiss(report.id)}
                    >
                      <Text className='report-management__action-text'>驳回</Text>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}
