import { View, Text, ScrollView, Input } from '@tarojs/components'
import { useLoad, useRouter } from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { EmptyState } from '../../components'
import { budgetService } from '../../services'
import { platformService } from '../../platform'
import './index.scss'

interface BudgetItem {
  id: string
  category: string
  description: string
  amount: string
}

interface Settlement {
  from: string
  to: string
  amount: number
}

export default function TripBudgetEdit() {
  const router = useRouter()
  const [items, setItems] = useState<BudgetItem[]>([])
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [showSettlement, setShowSettlement] = useState(false)

  useLoad(() => {
    const tripId = router.params.id
    if (tripId) {
      budgetService.getBudget(tripId).then((budget) => {
        if (budget && budget.length > 0) {
          setItems(budget.map((b) => ({
            id: b.id,
            category: b.category,
            description: b.description,
            amount: b.amount.toString(),
          })))
        }
      })
    }
  })

  const handleAdd = useCallback(() => {
    const newItem: BudgetItem = {
      id: Date.now().toString(),
      category: '其他',
      description: '',
      amount: '',
    }
    setItems((prev) => [...prev, newItem])
  }, [])

  const handleRemove = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const handleUpdate = useCallback((id: string, field: keyof BudgetItem, value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }, [])

  const handleSave = useCallback(async () => {
    const tripId = router.params.id
    if (tripId) {
      try {
        for (const item of items) {
          await budgetService.addBudgetItem({
            tripId,
            category: item.category,
            description: item.description,
            amount: parseFloat(item.amount) || 0,
          })
        }
        platformService.showToast({ title: '已保存', icon: 'success' })
        platformService.navigateBack()
      } catch {
        platformService.showToast({ title: '保存失败', icon: 'error' })
      }
    }
  }, [router.params.id, items])

  const handleSettle = useCallback(async () => {
    const tripId = router.params.id
    if (!tripId) return
    try {
      const result = await budgetService.settleBudget(tripId)
      setSettlements(result)
      setShowSettlement(true)
    } catch {
      platformService.showToast({ title: '结算失败', icon: 'error' })
    }
  }, [router.params.id])

  const total = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)

  return (
    <View className='trip-budget-edit'>
      <View className='trip-budget-edit__header'>
        <Text className='trip-budget-edit__title'>编辑预算</Text>
        <View className='trip-budget-edit__header-actions'>
          <View className='trip-budget-edit__settle' onClick={handleSettle}>
            <Text className='trip-budget-edit__settle-text'>结算</Text>
          </View>
          <View className='trip-budget-edit__save' onClick={handleSave}>
            <Text className='trip-budget-edit__save-text'>保存</Text>
          </View>
        </View>
      </View>

      <View className='trip-budget-edit__total'>
        <Text className='trip-budget-edit__total-label'>预估总费用</Text>
        <Text className='trip-budget-edit__total-value'>¥{total.toFixed(0)}</Text>
      </View>

      {showSettlement && settlements.length > 0 && (
        <View className='trip-budget-edit__settlement'>
          <View className='trip-budget-edit__settlement-header'>
            <Text className='trip-budget-edit__settlement-title'>结算方案</Text>
            <View className='trip-budget-edit__settlement-close' onClick={() => setShowSettlement(false)}>
              <Text className='trip-budget-edit__settlement-close-text'>收起</Text>
            </View>
          </View>
          {settlements.map((s, index) => (
            <View key={index} className='trip-budget-edit__settlement-item'>
              <Text className='trip-budget-edit__settlement-text'>
                {s.from} → {s.to}：¥{s.amount.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {showSettlement && settlements.length === 0 && (
        <View className='trip-budget-edit__settlement'>
          <Text className='trip-budget-edit__settlement-empty'>无需结算，费用已平摊</Text>
        </View>
      )}

      <ScrollView className='trip-budget-edit__scroll' scrollY>
        {items.length === 0 ? (
          <EmptyState
            icon='💰'
            title='暂无预算项'
            description='点击下方添加费用项'
          />
        ) : (
          <View className='trip-budget-edit__list'>
            {items.map((item) => (
              <View key={item.id} className='trip-budget-edit__item'>
                <View className='trip-budget-edit__item-header'>
                  <View className='trip-budget-edit__item-category'>
                    <Text className='trip-budget-edit__item-category-text'>{item.category}</Text>
                  </View>
                  <View
                    className='trip-budget-edit__item-remove'
                    onClick={() => handleRemove(item.id)}
                  >
                    <Text className='trip-budget-edit__item-remove-text'>删除</Text>
                  </View>
                </View>
                <View className='trip-budget-edit__item-fields'>
                  <View className='trip-budget-edit__item-field'>
                    <Text className='trip-budget-edit__item-label'>描述</Text>
                    <Input
                      className='trip-budget-edit__item-input'
                      placeholder='费用说明'
                      value={item.description}
                      onInput={(e) => handleUpdate(item.id, 'description', e.detail.value)}
                    />
                  </View>
                  <View className='trip-budget-edit__item-field'>
                    <Text className='trip-budget-edit__item-label'>金额</Text>
                    <Input
                      className='trip-budget-edit__item-input'
                      type='digit'
                      placeholder='0'
                      value={item.amount}
                      onInput={(e) => handleUpdate(item.id, 'amount', e.detail.value)}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View className='trip-budget-edit__add safe-area-bottom' onClick={handleAdd}>
        <Text className='trip-budget-edit__add-text'>+ 添加费用项</Text>
      </View>
    </View>
  )
}
