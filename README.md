# 液态玻璃（Liquid Glass）效果还原

从 APK 里分析并还原的“液态玻璃”交互效果，包含 Android Compose 实现说明、AGSL 着色器笔记，以及一个可直接打开的 HTML 交互 Demo。

## 来源分析

反编译的 APK 中包含：

- `io.github.kyant0:backdrop-android:2.0.0` 与 `io.github.kyant0:shapes-android:1.2.0`
- `com.coolapk.market.widget.compose.liquid` 下应用自研的 Compose 层
- 圆角矩形折射着色器（可选色散）
- 背景层录制、模糊、色彩增益（vibrancy）、高光与阴影

本目录是**效果的可移植复刻**，不是对 APK 私有类的二进制提取。着色器逻辑与 Apache-2.0 的 `AndroidLiquidGlass/Backdrop` 实现一致，二次分发时请保留该许可证声明：

<https://github.com/Kyant0/AndroidLiquidGlass>

## 效果原理

视觉分层的顺序是：

1. 把组件背后的内容录进一个 `GraphicsLayer`（背景层）
2. 用圆角矩形裁剪绘制该层
3. 施加模糊（API 31+ 用 `RenderEffect`）
4. 在圆角边缘沿 SDF 法线方向偏移采样（折射）
5. 可选：采样邻近 7 个位置并拆开 RGB 通道（色散）
6. 叠加半透明着色、色彩增益、边缘高光与阴影

模拟器是 API 28，`RenderEffect`（API 31）和 `RuntimeShader`（API 33）都跑不了，会退化成半透明色块或手工截图 + 模糊的位图。

## 推荐复用方式

Android 13+ 的新项目直接用上游库，不要去抄 APK 内部实现：

```kotlin
implementation("io.github.kyant0:backdrop-android:2.0.0")
implementation("io.github.kyant0:shapes-android:1.2.0")
```

然后参考 `compose_example.kt` 组合 `rememberLayerBackdrop`、`layerBackdrop`、`drawBackdrop`。

传统 View 体系：先把背景渲染成 bitmap（或用模糊库），再让 AGSL 着色器处理这张 bitmap。着色器本身没法模糊或采样任意 View，必须给它一张背景纹理。

## HTML 交互 Demo

直接用浏览器打开 `liquid-glass-demo.html`。这是一个刻意收敛的导航测试页：彩色背景、一条半透明玻璃轨道、四个 tab、一个激活态的液态胶囊。

胶囊 1:1 跟随指针，越过 tab 时切换选中，松手/点击后以可打断、带速度感知的弹簧收束。材质走 `liquid-glass-main` / v0 的思路：隐藏的 Canvas 生成 SDF 位移图，通过 CSS `backdrop-filter` 喂给 SVG `feDisplacementMap`，表面再叠加亮边、内嵌厚度和按下时的高透状态。

APK 里提取的着色器笔记保留在 `refraction_dispersion.agsl` 和 `highlight.agsl`；边缘折射的另一种参考见 <https://juejin.cn/post/7514618352829448244>。

## 目录内容

| 文件 | 说明 |
|---|---|
| `liquid-glass-demo.html` | 可直接打开的交互 Demo |
| `compose_example.kt` | Jetpack Compose 用法示例 |
| `refraction_dispersion.agsl` | 折射 / 色散着色器笔记 |
| `highlight.agsl` | 高光着色器笔记 |
| `演示素材/` | 真机截图与录屏：抽屉拖动、滑块位移、列表滑动前后的对比，以及一段 12MB 的屏幕录制 |
| `*.png` | 效果截图（含 coolapk 液态 tab 的各个状态） |

