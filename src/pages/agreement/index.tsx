import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useMemo, useCallback } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'

type AgreementType = 'user-agreement' | 'privacy-policy'

export default function Agreement() {
  const [type] = useState<AgreementType>(() => {
    const instance = Taro.getCurrentInstance()
    const params = instance.router?.params || {}
    return (params.type as AgreementType) || 'user-agreement'
  })

  const content = useMemo(() => {
    if (type === 'privacy-policy') {
      return {
        title: '隐私政策',
        updatedAt: '2025年7月2日',
        sections: PRIVACY_POLICY_SECTIONS,
      }
    }
    return {
      title: '用户服务协议',
      updatedAt: '2025年7月2日',
      sections: USER_AGREEMENT_SECTIONS,
    }
  }, [type])

  const handleBack = useCallback(() => {
    Taro.navigateBack()
  }, [])

  return (
    <View className='agreement'>
      <View className='agreement__header'>
        <View className='agreement__back' onClick={handleBack}>
          <Text className='agreement__back-text'>返回</Text>
        </View>
        <Text className='agreement__title'>{content.title}</Text>
      </View>
      <ScrollView className='agreement__body' scrollY>
        <View className='agreement__updated'>
          <Text className='agreement__updated-text'>
            更新日期：{content.updatedAt}
          </Text>
        </View>
        <View className='agreement__intro'>
          <Text className='agreement__intro-text'>
            欢迎您使用 TripCircle（行程朋友圈）。请您在使用本服务前，仔细阅读并充分理解以下{content.title}的全部内容。如您不同意本{content.title}的任何内容，请您停止使用本服务。
          </Text>
        </View>
        {content.sections.map((section, idx) => (
          <View key={idx} className='agreement__section'>
            <Text className='agreement__section-title'>
              {idx + 1}. {section.title}
            </Text>
            {section.paragraphs.map((para, pIdx) => (
              <Text key={pIdx} className='agreement__paragraph'>
                {para}
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

interface AgreementSection {
  title: string
  paragraphs: string[]
}

const USER_AGREEMENT_SECTIONS: AgreementSection[] = [
  {
    title: '协议的接受',
    paragraphs: [
      '请您仔细阅读本协议。您一旦勾选并点击"同意"或开始使用本服务，即视为您已充分阅读、理解并接受本协议的全部内容。如您不同意本协议的任何内容，请停止使用本服务。',
    ],
  },
  {
    title: '服务说明',
    paragraphs: [
      'TripCircle 是一款行程管理与社交分享的应用，提供行程创建、好友邀请、行程动态分享、消息通知、投票、预算管理等功能。我们致力于为用户提供便捷的行程协作与社交体验。',
    ],
  },
  {
    title: '账号注册与管理',
    paragraphs: [
      '您可通过微信授权或手机号验证码方式注册和登录本应用。您应确保注册信息的真实性、准确性，并对账号及密码的安全负责。',
      '您不得将账号转让、出借给他人使用。如因您保管不善导致账号泄露，由此产生的一切损失由您自行承担。',
      '如您连续12个月未登录使用本服务，我们有权回收或注销您的账号。',
    ],
  },
  {
    title: '用户行为规范',
    paragraphs: [
      '您在使用本服务时，应遵守中华人民共和国相关法律法规，不得发布、传播以下内容：违反宪法确定的基本原则的；危害国家安全、泄露国家秘密、颠覆国家政权、破坏国家统一的；损害国家荣誉和利益的；煽动民族仇恨、民族歧视的；破坏民族团结的；破坏国家宗教政策、宣扬邪教和封建迷信的；散布谣言、扰乱社会秩序、破坏社会稳定的；散布淫秽、色情、赌博、暴力、凶杀、恐怖或教唆犯罪的；侮辱或诽谤他人、侵害他人合法权益的；其他法律法规禁止的内容。',
      '您不得利用本服务进行任何可能损害、攻击、破坏本服务或影响本服务正常运行的行为，包括但不限于：发送或传播垃圾信息、病毒、恶意代码；未经授权访问系统；干扰其他用户正常使用等。',
      '您发布的内容应确保拥有合法权利，不得侵犯他人知识产权、肖像权、隐私权等合法权益。',
    ],
  },
  {
    title: '知识产权',
    paragraphs: [
      '本应用的软件、界面设计、图标、代码、文档等知识产权归本应用运营方所有，受相关法律法规保护。未经书面许可，您不得复制、修改、传播或用于其他商业用途。',
      '您在本应用发布的内容，您享有相应知识产权。您发布内容即视为授权本应用在服务范围内使用、存储、展示您的相关内容。',
    ],
  },
  {
    title: '免责声明',
    paragraphs: [
      '本服务按"现状"提供，我们不保证服务的不中断性、安全性、无差错性。在法律允许的范围内，我们不对因使用或无法使用本服务导致的任何直接或间接损失承担责任。',
      '您应自行判断通过本服务获取的行程信息、用户内容的真实性和可靠性，我们不对其他用户发布的内容承担责任。',
    ],
  },
  {
    title: '协议变更',
    paragraphs: [
      '我们可能根据法律法规变化或业务发展需要修订本协议。修订后的协议将在应用内公示，自公示之日起生效。如您不同意修订后的协议，请停止使用本服务；继续使用即视为您接受修订后的协议。',
    ],
  },
  {
    title: '联系方式',
    paragraphs: [
      '如您对本协议有任何疑问，可通过应用内的"意见反馈"功能与我们联系。',
    ],
  },
]

const PRIVACY_POLICY_SECTIONS: AgreementSection[] = [
  {
    title: '引言',
    paragraphs: [
      '本隐私政策旨在向您说明 TripCircle（行程朋友圈）如何收集、使用、存储、保护您的个人信息。请您在使用本服务前，仔细阅读并充分理解本隐私政策的全部内容。',
      '本隐私政策适用于您通过微信小程序、App等平台使用本服务的全部场景。',
    ],
  },
  {
    title: '我们收集的个人信息',
    paragraphs: [
      '为实现服务功能，我们在您使用本服务过程中可能收集以下信息：',
      '1. 账号信息：包括您的微信OpenID、UnionID、手机号码（如您选择手机号登录）、昵称、头像等。其中，微信OpenID/UnionID用于身份识别，手机号用于登录验证和账号找回，昵称和头像用于展示。',
      '2. 行程信息：您主动创建的行程名称、时间、地点、参与人员、预算、时间线、清单等信息。',
      '3. 社交信息：您与好友的互动记录、评论、投票、聊天消息等。',
      '4. 设备信息：设备型号、操作系统版本等，用于保障服务的正常运行和安全。',
      '5. 位置信息：在您主动授权后，获取您的地理位置，用于展示附近的行程和行程定位功能。',
      '6. 图片信息：在您主动上传时，获取相册或相机图片，用于头像、行程图片等场景。',
    ],
  },
  {
    title: '信息的使用',
    paragraphs: [
      '我们收集的信息将用于以下目的：',
      '1. 提供行程创建、管理、分享等核心服务功能；',
      '2. 提供好友社交功能，包括好友添加、消息通知、评论互动等；',
      '3. 为您提供投票、预算管理、行程清单等协作工具；',
      '4. 保障账号安全，进行身份验证和异常检测；',
      '5. 改善和优化服务体验，进行必要的数据统计与分析；',
      '6. 在法律法规允许的范围内，向您提供服务通知和必要的信息推送。',
    ],
  },
  {
    title: '信息的存储与保护',
    paragraphs: [
      '您的个人信息存储在安全的服务器中，我们采取合理的技术和管理措施保护您的信息安全，防止信息泄露、丢失、篡改或被未授权访问。',
      '我们仅在为实现服务目的所必需的最短期限内保留您的个人信息。在超出保留期限或您注销账号后，我们将删除或匿名化处理您的个人信息。',
      '如发生个人信息安全事件，我们将及时启动应急预案，并在法定时限内告知您。',
    ],
  },
  {
    title: '信息的共享与披露',
    paragraphs: [
      '我们不会向第三方出售您的个人信息。在以下情形下，我们可能共享或披露您的信息：',
      '1. 获得您的明确同意后；',
      '2. 为完成行程协作功能，向行程参与成员展示您在行程中产生的相关内容；',
      '3. 与为我们提供技术服务的受托方共享必要信息（该方不得用于其他用途）；',
      '4. 根据法律法规规定或行政、司法机关的合法要求。',
    ],
  },
  {
    title: '您的权利',
    paragraphs: [
      '您对个人信息享有以下权利：',
      '1. 查阅与复制：您可在"我的"页面查看个人资料，并可申请获取个人信息副本；',
      '2. 更正与补充：您可随时在应用内修改昵称、头像等个人资料；',
      '3. 删除：您可删除自行发布的行程、评论等内容；申请注销账号后，我们将删除您的个人信息；',
      '4. 撤回授权：您可通过系统设置撤回位置、相册等权限授权；',
      '5. 注销账号：您可在"设置-账号与安全"中申请注销账号，注销后我们将按本政策处理您的信息。',
    ],
  },
  {
    title: '未成年人保护',
    paragraphs: [
      '如您为未满14周岁的未成年人，请在监护人的陪同下阅读本隐私政策，并在取得监护人同意后使用本服务。我们不会主动收集未成年人个人信息用于商业营销。',
    ],
  },
  {
    title: '隐私政策的更新',
    paragraphs: [
      '本隐私政策可能适时修订。修订后的政策将在应用内公示，自公示之日起生效。如您不同意修订后的隐私政策，请停止使用本服务。',
    ],
  },
  {
    title: '联系我们',
    paragraphs: [
      '如您对本隐私政策有任何疑问、意见或建议，可通过应用内的"意见反馈"功能与我们联系，我们将在收到您的反馈后尽快处理并回复。',
    ],
  },
]
