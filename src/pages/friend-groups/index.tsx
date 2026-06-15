import { View, Text, ScrollView, Input } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { EmptyState, LoadingView } from '../../components'
import { useFriendStore } from '../../stores'
import { platformService } from '../../platform'
import './index.scss'

export default function FriendGroups() {
  const { groups, isLoading, fetchGroups, createGroup, updateGroup, deleteGroup } = useFriendStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [editingGroup, setEditingGroup] = useState<{ id: string; name: string } | null>(null)

  useLoad(() => {
    fetchGroups()
  })

  const handleAdd = useCallback(() => {
    setEditingGroup(null)
    setNewGroupName('')
    setShowAddModal(true)
  }, [])

  const handleEdit = useCallback((groupId: string, name: string) => {
    setEditingGroup({ id: groupId, name })
    setNewGroupName(name)
    setShowAddModal(true)
  }, [])

  const handleDelete = useCallback(async (groupId: string, name: string) => {
    const confirmed = await platformService.showModal({
      title: '删除分组',
      content: `确定删除分组「${name}」吗？分组内的好友不会被删除。`,
    })
    if (confirmed) {
      await deleteGroup(groupId)
      platformService.showToast({ title: '已删除', icon: 'success' })
    }
  }, [deleteGroup])

  const handleSave = useCallback(async () => {
    if (!newGroupName.trim()) {
      platformService.showToast({ title: '请输入分组名称', icon: 'error' })
      return
    }
    if (editingGroup) {
      await updateGroup(editingGroup.id, newGroupName)
      platformService.showToast({ title: '已更新', icon: 'success' })
    } else {
      await createGroup(newGroupName)
      platformService.showToast({ title: '已创建', icon: 'success' })
    }
    setShowAddModal(false)
    setNewGroupName('')
    setEditingGroup(null)
  }, [newGroupName, editingGroup, createGroup, updateGroup])

  const handleNameChange = useCallback((e: { detail: { value: string } }) => {
    setNewGroupName(e.detail.value)
  }, [])

  if (isLoading) {
    return <LoadingView text='加载分组...' />
  }

  return (
    <View className='friend-groups'>
      <View className='friend-groups__header'>
        <Text className='friend-groups__title'>好友分组</Text>
        <View className='friend-groups__add' onClick={handleAdd}>
          <Text className='friend-groups__add-text'>+ 新建</Text>
        </View>
      </View>

      <ScrollView className='friend-groups__scroll' scrollY>
        {groups.length === 0 ? (
          <EmptyState
            icon='📁'
            title='暂无分组'
            description='创建分组来管理你的好友'
            actionText='新建分组'
            onAction={handleAdd}
          />
        ) : (
          <View className='friend-groups__list'>
            {groups.map((group) => (
              <View key={group.id} className='friend-groups__item'>
                <View className='friend-groups__item-info'>
                  <Text className='friend-groups__item-name'>{group.name}</Text>
                </View>
                <View className='friend-groups__item-actions'>
                  <View
                    className='friend-groups__action'
                    onClick={() => handleEdit(group.id, group.name)}
                  >
                    <Text className='friend-groups__action-text'>编辑</Text>
                  </View>
                  <View
                    className='friend-groups__action friend-groups__action--delete'
                    onClick={() => handleDelete(group.id, group.name)}
                  >
                    <Text className='friend-groups__action-text'>删除</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {showAddModal && (
        <View className='friend-groups__mask' onClick={() => setShowAddModal(false)}>
          <View className='friend-groups__modal' onClick={(e) => e.stopPropagation()}>
            <Text className='friend-groups__modal-title'>
              {editingGroup ? '编辑分组' : '新建分组'}
            </Text>
            <Input
              className='friend-groups__modal-input'
              placeholder='输入分组名称'
              value={newGroupName}
              onInput={handleNameChange}
              maxlength={20}
            />
            <View className='friend-groups__modal-actions'>
              <View
                className='friend-groups__modal-btn friend-groups__modal-btn--cancel'
                onClick={() => setShowAddModal(false)}
              >
                <Text className='friend-groups__modal-btn-text'>取消</Text>
              </View>
              <View
                className='friend-groups__modal-btn friend-groups__modal-btn--save'
                onClick={handleSave}
              >
                <Text className='friend-groups__modal-btn-text'>保存</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
