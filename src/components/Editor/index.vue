<template>
    <MapboxGLInit @mapboxGLLoaded="mapboxGLLoadedFunc" :center="center" :zoom="zoom" :loadDEM="false"></MapboxGLInit>
    <div class="translate-mode">
        <div class="mode-item" v-for="(item, index) in modeList" :key="index" @click="changeTransfromMode(item)">{{ item.name }}</div>
    </div>
</template>

<script setup>
import mapboxgl from 'mapbox-gl';
import { onMounted, onUnmounted, ref } from 'vue';
import MapboxGLInit from '../Map/MapboxGLInit.vue';
import MapboxThreeLayer from './lib/MapboxThreeLayer';

let instance;
const center = ref([103.8, 30]);
const zoom = ref(12);
const modeList = ref([
    { name: '选定', value: 'default' },
    { name: '平移', value: 'translate' },
    { name: '伸缩', value: 'scale' },
    { name: '旋转', value: 'rotate' },
])

window.mapboxgl = mapboxgl;

const mapboxGLLoadedFunc = (map) => {
    window.mapIns = map;
    addRadarLayer(map);
}


const addRadarLayer = (map) => {
    if (!instance) {
        instance = new MapboxThreeLayer('mapbox-three', map);
    }
    return instance.render()
}

const changeTransfromMode = (item) => {
    if (instance && instance.control) {
        if (item.value) {
            instance.setMode(item.value);
        }
    }
}

onMounted(() => {

})

onUnmounted(() => {
    if(instance) instance.dispose();
})
    
</script>

<style scoped lang="scss">
.translate-mode {
    position: fixed;
    top: 20px;
    right: 40px;
    display: flex;
    column-gap: 10px;
    border-radius: 2px;
    width: max-content;

    .mode-item {
        padding: 0px 10px;
        width: max-content;
        height: 32px;
        line-height: 32px;
        cursor: pointer;
        background: #2f5cc7;
        color: #fff;
        font-size: 14px;
    }

    .mode-item:hover {
        background: #206fd5;
    }
}
</style>
  