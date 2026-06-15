# TripCircle Android APK 构建与部署指南

> 更新时间：2026-06-10  
> 状态：**已完成** - Debug APK 构建成功

## 一、环境配置

### 1.1 前置条件

| 工具 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | >= 16.0.0 (推荐 18.x) | JavaScript 运行时 |
| npm | >= 8.0.0 | 包管理器 |
| JDK | 17 (必须) | Android 构建需要，**不要使用 JDK 21** |
| Android Studio | 最新稳定版 | Android 开发 IDE |
| Android SDK | API Level 34 | Android 平台 SDK |

### 1.2 安装 JDK 17

```bash
# 使用 Homebrew 安装 JDK 17
brew install openjdk@17

# 验证安装
/opt/homebrew/opt/openjdk@17/bin/java -version
```

### 1.3 配置 Android SDK

```bash
# 1. 安装 Android Studio
# 下载地址：https://developer.android.com/studio

# 2. 配置环境变量 (添加到 ~/.zshrc)
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# 3. 使环境变量生效
source ~/.zshrc

# 4. 在 Android Studio 中安装 SDK
# Android Studio > Settings > SDK Manager
# 安装：
# - Android SDK Platform 34
# - Android SDK Build-Tools 34.0.0
# - Android Emulator
# - Android SDK Platform-Tools
```

## 二、项目构建

### 2.1 安装依赖

```bash
cd /Users/arthurzhang/Project/meetup-app

# 安装所有依赖
npm install --legacy-peer-deps
```

### 2.2 构建 React Native Bundle

```bash
# 构建 RN bundle
npm run build:rn
```

### 2.3 构建 Debug APK

```bash
# 必须使用 JDK 17
export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"

# 进入 android 目录
cd android

# 构建 debug APK
./gradlew assembleDebug --no-daemon
```

### 2.4 APK 输出位置

```
android/app/build/outputs/apk/debug/app-debug.apk
```

## 三、安装到设备

### 3.1 模拟器

```bash
# 启动 Android 模拟器
emulator -avd <your_avd_name>

# 安装 APK
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### 3.2 真机调试

```bash
# 1. 启用开发者模式
# 设置 > 关于手机 > 连续点击"版本号" 7 次

# 2. 启用 USB 调试
# 设置 > 开发者选项 > USB 调试

# 3. 连接设备并验证
adb devices

# 4. 安装 APK
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## 四、Release APK 构建

### 4.1 生成签名密钥

```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore android/app/my-release-key.keystore \
  -alias my-key-alias \
  -keyalg RSA -keysize 2048 \
  -validity 10000
```

### 4.2 配置签名

编辑 `android/app/build.gradle`：

```gradle
android {
    signingConfigs {
        release {
            storeFile file('my-release-key.keystore')
            storePassword 'your-password'
            keyAlias 'my-key-alias'
            keyPassword 'your-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 4.3 构建 Release APK

```bash
export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
cd android
./gradlew assembleRelease --no-daemon
```

### 4.4 Release APK 输出位置

```
android/app/build/outputs/apk/release/app-release.apk
```

## 五、已知问题与注意事项

### 5.1 必须使用 JDK 17

当前项目依赖的 React Native 0.73.1 与 JDK 21 不兼容。**必须使用 JDK 17** 进行构建。

```bash
# 每次构建前都需要设置
export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
```

### 5.2 CSS 兼容性

已修复 41 个 SCSS 文件中的 `linear-gradient` + CSS 变量组合问题。所有 CSS 变量已替换为实际值。

### 5.3 Kotlin 版本

当前使用 Kotlin 1.9.24，与 React Native 0.73.1 兼容。

### 5.4 Gradle 镜像

已配置国内镜像源（阿里云），加速依赖下载。

## 六、项目配置说明

### 6.1 android/local.properties

```properties
sdk.dir=/Users/arthurzhang/Library/Android/sdk
```

### 6.2 android/build.gradle

- Kotlin 版本：1.9.24
- Android SDK：34
- 使用阿里云镜像源

### 6.3 android/app/build.gradle

- applicationId：`com.tripcircle`
- minSdkVersion：21
- targetSdkVersion：34
- 主组件名称：`trip-circle`

## 七、后续工作

| 优先级 | 任务 | 状态 |
|--------|------|------|
| P0 | Debug APK 构建 | ✅ 已完成 |
| P1 | 实现 `src/platform/rn.ts` 真实功能 | 待完成 |
| P1 | 测试 Android 模拟器运行 | 待完成 |
| P2 | Release APK 构建 | 待完成 |
| P2 | 真机调试与优化 | 待完成 |
| P3 | Google Play 发布 | 待完成 |
