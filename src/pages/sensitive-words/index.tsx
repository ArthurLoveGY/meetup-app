import { View, Text, ScrollView, Input } from '@tarojs/components'
import { useState, useCallback } from 'react'
import { EmptyState } from '../../components'
import { platformService } from '../../platform'
import './index.scss'

export default function SensitiveWords() {
  const [words, setWords] = useState<string[]>([
    '垃圾', '骗子', '广告', '代购', '刷单',
  ])
  const [newWord, setNewWord] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const handleAdd = useCallback(() => {
    if (!newWord.trim()) {
      platformService.showToast({ title: '请输入敏感词', icon: 'error' })
      return
    }
    if (words.includes(newWord.trim())) {
      platformService.showToast({ title: '该词已存在', icon: 'error' })
      return
    }
    setWords((prev) => [...prev, newWord.trim()])
    setNewWord('')
    setShowAdd(false)
    platformService.showToast({ title: '已添加', icon: 'success' })
  }, [newWord, words])

  const handleRemove = useCallback((word: string) => {
    setWords((prev) => prev.filter((w) => w !== word))
    platformService.showToast({ title: '已删除', icon: 'success' })
  }, [])

  const handleNewWordChange = useCallback((e: { detail: { value: string } }) => {
    setNewWord(e.detail.value)
  }, [])

  return (
    <View className='sensitive-words'>
      <View className='sensitive-words__header'>
        <Text className='sensitive-words__title'>敏感词管理</Text>
        <View className='sensitive-words__add' onClick={() => setShowAdd(true)}>
          <Text className='sensitive-words__add-text'>+ 添加</Text>
        </View>
      </View>

      <ScrollView className='sensitive-words__scroll' scrollY>
        {words.length === 0 ? (
          <EmptyState
            icon='✅'
            title='暂无敏感词'
            description='添加敏感词可以过滤不当内容'
            actionText='添加敏感词'
            onAction={() => setShowAdd(true)}
          />
        ) : (
          <View className='sensitive-words__list'>
            {words.map((word) => (
              <View key={word} className='sensitive-words__item'>
                <Text className='sensitive-words__item-text'>{word}</Text>
                <View
                  className='sensitive-words__item-remove'
                  onClick={() => handleRemove(word)}
                >
                  <Text className='sensitive-words__item-remove-text'>删除</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {showAdd && (
        <View className='sensitive-words__mask' onClick={() => setShowAdd(false)}>
          <View className='sensitive-words__modal' onClick={(e) => e.stopPropagation()}>
            <Text className='sensitive-words__modal-title'>添加敏感词</Text>
            <Input
              className='sensitive-words__modal-input'
              placeholder='输入敏感词'
              value={newWord}
              onInput={handleNewWordChange}
            />
            <View className='sensitive-words__modal-actions'>
              <View
                className='sensitive-words__modal-btn sensitive-words__modal-btn--cancel'
                onClick={() => setShowAdd(false)}
              >
                <Text className='sensitive-words__modal-btn-text'>取消</Text>
              </View>
              <View
                className='sensitive-words__modal-btn sensitive-words__modal-btn--add'
                onClick={handleAdd}
              >
                <Text className='sensitive-words__modal-btn-text'>添加</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
