<template>
    <div id="root">
        <div v-for="item in searchResult">
            <h2>{{ item.title }}</h2>
            <h3>{{ item.excerpt }}</h3>
            <hr/>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';

import axios from 'axios';

const app_id = 'E62VyFVLMiW7kvbtVq3p';

const searchResult = ref([])

function search(text) {
    const url = 'mojiapi/parse/functions/union-api';

    const payload = {
        functions: [
            {
                name: 'search-all',
                params: {
                    text: text,
                    types: [102, 106, 103]
                }
            }
        ],
        _ApplicationId: app_id
    };

    axios
        .post(url, payload)
        .then(response => {
            // 处理响应
            if (response.status === 200) {
                let result = response.data.result.results['search-all'].result.word.searchResult
                searchResult.value = result 
                // 请求成功，格式化输出JSON
                const formatted_json = JSON.stringify(response.data, null, 2);
                console.log(response.data);
                // 对每个单词搜索详细结果
                // result.forEach(element => {
                //     getDescription(element.targetId)
                // });
            } else {
                // 请求失败
                console.log('请求失败:', response.status);
            }
        })
        .catch(error => {
            console.error('请求失败:', error);
        });
}

window.searchText = search

function getDescription(obj_id) {
    const url = 'mojiapi/parse/functions/nlt-fetchManyLatestWords';
    const payload = {
        itemsJson: [
            {
                objectId: obj_id
            }
        ],
        skipAccessories: false,
        _ApplicationId: app_id
    };

    axios
        .post(url, payload)
        .then(response => {
            // 处理响应
            if (response.status === 200) {
                // 请求成功，格式化输出JSON
                const formatted_json = JSON.stringify(response.data, null, 2);
                console.log(formatted_json);
            } else {
                // 请求失败
                console.log('请求失败:', response.status);
            }
        })
        .catch(error => {
            console.error('请求失败:', error);
        });
}

function getMoji() {

}

function updateWord() {

}

</script>

<style scoped>

#root{
    padding: 20px;
    text-align: left;
}

</style>