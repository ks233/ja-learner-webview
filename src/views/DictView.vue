<template>
    <div id="root">
        <div style="display: flex;">
            <input id="searchbox" v-model="searchText" type="text" @keydown.enter="search(searchText)"
                @dblclick="searchText = ''">
        </div>
        <div style="margin-top: 10px;">
            <a :href="'https://www.mojidict.com/details/' + searchText" target="_blank">MOJi辞書</a>
            <span> / </span>
            <a :href="'https://www.weblio.jp/content/' + searchText" target="_blank">Weblio辞書</a>
            <span> / </span>
            <a :href="'https://dic.nicovideo.jp/a/' + searchText" target="_blank">ニコニコ大百科</a>
            <hr />
        </div>
        <div v-for="item in searchResult">
            <h2>{{ item.title }}</h2>
            <h3>{{ item.excerpt }}</h3>
            <a :href="'https://www.mojidict.com/details/' + item.targetId" target="_blank">MOJi辞書</a>
            <span> / </span>
            <a :href="'https://www.weblio.jp/content/' + item.title" target="_blank">Weblio辞書</a>
            <span> / </span>
            <a :href="'https://dic.nicovideo.jp/a/' + item.title" target="_blank">ニコニコ大百科</a>
            <hr />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';

import axios from 'axios';

const app_id = 'E62VyFVLMiW7kvbtVq3p';

const searchResult = ref([])
const searchText = ref([])

function search(text) {
    if (text.trim() == "") {
        searchResult.value.splice(0, searchResult.value.length)
        return
    }
    if (text.startsWith("APPEND")) {
        searchText.value += text.slice(6)

    } else {
        searchText.value = text
    }
    const url = 'mojiapi/parse/functions/union-api';

    const payload = {
        functions: [
            {
                name: 'search-all',
                params: {
                    text: searchText.value,
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
                // 对每个单词搜索详细结果
                // result.forEach(element => {
                //     getDescription(element.targetId)
                // });
                console.log(searchResult.value)
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
#root {
    flex: 1;
    padding: 10px;
    text-align: left;
}

#searchbox {
    text-align: center;
    font-size: 2em;
    border-radius: 20px;
    padding: 8px;
    width: 100%;
}
</style>