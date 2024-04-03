<template>
  <div :id="props.id" class="mapbox-container"></div>
</template>

<script >
import { onMounted } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { accessToken } from './token'

mapboxgl.accessToken = accessToken;

export default {
    name: 'MapboxGLInit',
    emits: ['mapboxGLLoaded'],
    props: {
        id: {
            type: String,
            default: 'mapbox-gl-' + Date.now()
        },
        center: {
            type: Array,
            default: () => [104, 30]
        },
        zoom: {
            type: Number,
            default: 10
        }
    },

    setup (props, { emit }) {
        const initMapbox = () => {
            const map = new mapboxgl.Map({
                container: props.id,
                // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
                style: 'mapbox://styles/mapbox/streets-v12',
                zoom: props.zoom,
                center: props.center,
                pitch: 45,
                projection: 'mercator',
                useWebGL2: true,
                antialias: true // create the gl context with MSAA antialiasing, so custom layers are antialiased
            });


            map.on('style.load', () => {
                emit('mapboxGLLoaded', map)
            });
        }

        onMounted(() => {
            initMapbox()
        })

        return {
            props
        }
    }
}
    
</script>

<style scoped>
body {
    margin: 0; padding: 0; 
}

.mapbox-container {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%; 
}
</style>
  