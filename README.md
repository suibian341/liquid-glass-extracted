# Liquid glass extraction notes

The APK `D:\suibian\Downloads\base(1).apk` contains:

- `io.github.kyant0:backdrop-android:2.0.0` and `io.github.kyant0:shapes-android:1.2.0`;
- an app-specific Compose layer under `com.coolapk.market.widget.compose.liquid`;
- a rounded-rectangle refraction shader with optional chromatic dispersion;
- backdrop layer recording, blur, vibrancy, highlights and shadows.

This folder contains a portable reconstruction of the effect. It is not a binary extraction of the APK's private classes. The shader logic matches the Apache-2.0 `AndroidLiquidGlass/Backdrop` implementation identified in the APK. Keep the Apache-2.0 notice when redistributing it:

<https://github.com/Kyant0/AndroidLiquidGlass>

## What the effect is

The visual stack is:

1. Record the content behind the component into a `GraphicsLayer` (the backdrop).
2. Draw that layer through a rounded-rectangle clip.
3. Apply blur (`RenderEffect` on API 31+).
4. At the rounded edge, displace sampling along the signed-distance-field normal (refraction).
5. Optionally sample seven nearby positions and split RGB channels (chromatic aberration).
6. Add a translucent tint, vibrancy, edge highlight and shadow.

The emulator is API 28, so `RenderEffect` (API 31) and `RuntimeShader` (API 33) cannot run there. It will necessarily fall back to a translucent surface or a manually captured/blurred bitmap.

## Recommended reuse

For a new Jetpack Compose app on Android 13+ use the upstream library instead of copying APK internals:

```kotlin
implementation("io.github.kyant0:backdrop-android:2.0.0")
implementation("io.github.kyant0:shapes-android:1.2.0")
```

Then combine `rememberLayerBackdrop`, `layerBackdrop` and `drawBackdrop` as shown in `compose_example.kt`.

For Views, render the background into a bitmap (or use a blur library), then run the AGSL shader over that bitmap. A shader cannot blur or sample arbitrary views by itself; it needs a backdrop texture.

## HTML interaction demo

Open `liquid-glass-demo.html` directly. It is intentionally a focused navigation-only test page: a colorful backdrop, one translucent glass track, four tabs, and one active liquid capsule. The capsule follows the pointer 1:1, switches tabs as it crosses them, and settles with an interruptible velocity-aware spring on release or click. Its material follows the `liquid-glass-main` / v0 approach: a hidden Canvas generates an SDF-shaped displacement map, that map is fed to an SVG `feDisplacementMap` through CSS `backdrop-filter`, and the surface adds a bright rim, inset thickness, and a pressed high-transparency state. The extracted APK shader notes remain in `refraction_dispersion.agsl` and `highlight.agsl`; the article at <https://juejin.cn/post/7514618352829448244> is a secondary reference for edge-only refraction.
