// Requires Android API 31 for blur and API 33 for the AGSL lens shader.
// Upstream dependency: io.github.kyant0:backdrop-android:2.0.0
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.kyant.backdrop.backdrops.layerBackdrop
import com.kyant.backdrop.backdrops.rememberLayerBackdrop
import com.kyant.backdrop.effects.blur
import com.kyant.backdrop.effects.lens
import com.kyant.backdrop.effects.vibrancy
import com.kyant.backdrop.drawBackdrop

@Composable
fun LiquidGlassDemo(content: @Composable () -> Unit) {
    val backdrop = rememberLayerBackdrop()
    val shape = remember { RoundedCornerShape(28.dp) }

    // Put this modifier on the layer that should be sampled by the glass.
    androidx.compose.foundation.layout.Box(
        Modifier.layerBackdrop(backdrop)
    ) { content() }

    androidx.compose.foundation.layout.Box(
        Modifier.drawBackdrop(
            backdrop = backdrop,
            shape = { shape },
            effects = {
                blur(radius = 18f)
                lens(
                    refractionHeight = 24f,
                    refractionAmount = 8f,
                    depthEffect = true,
                    chromaticAberration = true
                )
                vibrancy()
            }
        )
    ) {
        // Add a translucent white/colored surface and your controls here.
    }
}

