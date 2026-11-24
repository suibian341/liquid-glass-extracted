/* API 28 fallback: there is no RenderEffect or RuntimeShader.
 * Capture only the region behind the glass, downsample it, blur it with
 * RenderScript/CPU/GPU, then draw the bitmap clipped to a rounded rect.
 * Add a translucent tint plus a 1dp white edge stroke/highlight. This gives
 * the blur/glass appearance, but cannot reproduce live refraction or RGB
 * dispersion without a custom OpenGL/Vulkan/Flutter shader pipeline.
 */

fun useLiquidFallback(sdk: Int): Boolean = sdk < 31

