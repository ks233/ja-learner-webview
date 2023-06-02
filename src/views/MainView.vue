<template>
    <div>
        <ruby v-for="item in data">
            <a :href="'https://www.mojidict.com/SearchText/'+item.basic" target="_blank">{{ item.surface }}</a>
            <rt>
                {{ item.reading }}
            </rt>
        </ruby>
    </div>
</template>


<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Kuroshiro from "kuroshiro";
const data = ref([])

onMounted(async () => {
    console.log('mounted');
    window.updateData = updateData
});


async function updateData (newData){
    data.value=newData
    // 遍历数组，将每个元素的reading属性转换为平假名
    data.value.forEach(element => {
        element.reading = Kuroshiro.Util.kanaToHiragna(element.reading)
        if (element.reading == element.surface){
            element.reading = ''
        }
    });
}

onUnmounted(() => {
    console.log('unmounted');
    delete window.updateData
});


</script>

<style scoped>
ruby {
    font-size: 15vh;
}

ruby a {
    text-decoration: none;
}

</style>