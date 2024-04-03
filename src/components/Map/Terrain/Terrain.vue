<template>
    <MapboxGLInit @mapboxGLLoaded="mapboxGLLoadedFunc" :center="center" :zoom="zoom"></MapboxGLInit>
</template>

<script setup>
import mapboxgl from 'mapbox-gl';
import { onMounted, onUnmounted, ref } from 'vue';
import MapboxGLInit from '../MapboxGLInit.vue';
import TerrainRenderClass from './TerrainRenderClass';

window.mapboxgl = mapboxgl;

let instance;
const mapboxGLLoadedFunc = (map) => {
    window.mapIns = map;
    instance = new TerrainRenderClass('instance', map);
    instance.init();
}

const center = ref([104.1465432836781, 30.867102559661133]);
const zoom = ref(5);


onMounted(() => {

})

onUnmounted(() => {
    if(instance) instance.dispose();
})
    
</script>

<style scoped>
</style>
  