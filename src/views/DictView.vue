<template>
    <div id="root">
        <div id="main">
            <div style="display: flex; ">
                <input id="searchbox" v-model="searchText" type="text" @keydown.enter="search(searchText)"
                    @dblclick="searchText = ''">
            </div>

            <div style="margin-top: 10px;">
                <a :href="'https://www.mojidict.com/searchText/' + searchText" target="_blank">MOJi</a>
                <span> / </span>
                <a :href="'https://www.weblio.jp/content/' + searchText" target="_blank">Weblio</a>
                <span> / </span>
                <a :href="'https://dic.nicovideo.jp/a/' + searchText" target="_blank">ニコニコ</a>

                <template v-if="ankiEnabled">
                    <span> / </span>
                    <a @click="ankiAddNote(searchText, currentText, '')" href="#" style="color:orangered">添加到Anki</a>
                </template>
            </div>

            <div v-if="ankiEnabled && ankiStatus != ''">{{ ankiStatus }}</div>
            <div v-for="item in searchResult">
                <hr>
                <h2 style="font-size: 1.7em; margin-bottom: 10px; margin-top: 2px;">
                    {{ item.title }} {{ item.detail?.[0]?.tags }}
                </h2>
                <span class="explain">
                    <h3 v-if="!item.detail">{{ item.excerpt }}</h3>
                    <ol v-else>
                        <template v-for="i in item.detail" :key="item.relaId">
                            <li v-if="i.main != null && i.sub != null" style="font-size: 1.2em; margin: 4px 0px; font-weight: 800;">
                                {{ i.main }}<span v-if="i.sub != ''" style="font-weight: 500;">（{{ i.sub }}）</span>
                            </li>
                        </template>
                    </ol>
                </span>
                <div style="margin-top: 8px;">



                    <!-- <a @click="fetchMojiDetail(item.targetId)" href="#" style="color:orangered">debug</a>
                    <br> -->
                    <a :href="'https://www.mojidict.com/details/' + item.targetId" target="_blank">MOJi</a>
                    <span> / </span>
                    <!-- 
                    item.title 格式长这样：
                    寿司 | すし ②①
                    split 之后：
                    寿司
                -->
                    <a :href="'https://www.weblio.jp/content/' + item.title.split(' |')[0]" target="_blank">Weblio</a>
                    <span> / </span>
                    <a :href="'https://dic.nicovideo.jp/a/' + item.title.split(' |')[0]" target="_blank">ニコニコ</a>
                    <template v-if="ankiEnabled">
                        <span> / </span>
                        <a @click="ankiAddNote(item.title, currentText, itemExplain(item))" href="#"
                            style="color:orangered">添加到Anki</a>
                    </template>

                </div>
            </div>
        </div>
        <template v-if="ankiEnabled">
            <hr style="width: 100%;">
            <div id="bottom">
                添加Anki卡片时的例句：
                <textarea type="text" id="current-text" v-model="currentText"></textarea>

            </div>
        </template>

    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';

import axios from 'axios';

const app_id = 'E62VyFVLMiW7kvbtVq3p';

const searchResult = ref([])
const searchText = ref('')
const currentText = ref('')

const ankiEnabled = ref(false)
window.setAnkiEnabled = function (enabled) {
    ankiEnabled.value = enabled
}

const ankiStatus = ref('')

onMounted(() => {
    window.chrome.webview.postMessage("ANKI_INIT")
})

const cahce_search = {}

let appendMode = false

async function search(text) {
    if (text.trim() == "") {
        searchResult.value.splice(0, searchResult.value.length)
        return
    }
    if (text.startsWith("APPEND")) {
        if (appendMode) {
            searchText.value += text.slice(6)
        } else {
            searchText.value = text.slice(6)
        }
        appendMode = true
    } else {
        appendMode = false
        searchText.value = text
    }
    let response = null
    if (cahce_search[searchText.value]) {
        console.log("cache search hit")
        response = cahce_search[searchText.value]
    } else {
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
            g_ver: "v4.8.7.20240716",
            _ApplicationId: app_id
        };
        response = await axios.post(url, payload)
    }
    if (response.status === 200) {
        cahce_search[searchText.value] = response
        let result = response.data.result.results['search-all'].result.word.searchResult
        searchResult.value = result
        searchResult.value.forEach(async (x) => {
            x.detail = await fetchMojiDetail(x.targetId)
        })
        // console.log(searchResult.value)
    } else {
        console.error('请求失败:', response.data.error);
    }
}
function setCurrentText(text) {
    currentText.value = text
}

window.searchText = search
window.setCurrentText = setCurrentText



function itemExplain(item) {
    if (item.detail) {
        let explain = ""
        const keys = Object.keys(item.detail)
        if (keys.length == 1) {
            if (item.detail[keys[0]].sub != "") {
                return `<li><b>${item.detail[keys[0]].main}</b>（${item.detail[keys[0]].sub}）</li>`
            } else {
                return `<li><b>${item.detail[keys[0]].main}</b></li>`
            }
        }
        explain = "<ol>"
        keys.forEach((key) => {
            explain += `<li><b>${item.detail[key].main}</b>`
            if (item.detail[key].sub != '') {
                explain += `（${item.detail[key].sub}）`
            }
            explain += '</li>'
        })
        explain += "</ol>"
        return explain
    } else {
        return item.excerpt
    }
}

const cache_detail = {}

async function fetchMojiDetail(obj_id) {
    let response = {}
    if (cache_detail[obj_id]) {
        console.log("cache detail hit")
        response = cache_detail[obj_id]
    }
    else {
        const url = 'mojiapi/parse/functions/web-word-fetchLatest';
        const payload = {
            itemsJson: [
                {
                    objectId: obj_id
                }
            ],
            skipAccessories: false,
            _ApplicationId: app_id
        };

        response = await axios.post(url, payload)
    }
    // console.log(response.data)
    let result = {};
    try {
        // console.log(response.data.result["104"])
        response.data.result["104"].filter((x) => x.lang == "zh-CN").forEach((x) => {
            result[x.relaId] = { main: x.title, sub: "" }
        })
        response.data.result["104"].filter((x) => x.lang != "zh-CN").forEach((x) => {
            if (result[x.relaId]) {
                result[x.relaId].sub = x.title
            } else {
                result[x.relaId] = { main: x.title, sub: "" }
            }
        })
        result[0] = { tags: response.data.result.result[0].tags };
        cache_detail[obj_id] = response
    } catch (error) {
        console.log(error)
        result = null
    }
    // console.log(result)
    return result
}

async function invokeAnki(action, version, params = {}) {
    try {
        const response = await axios.post('ankiconnect', {
            action,
            version,
            params,
        });

        if (Object.getOwnPropertyNames(response.data).length !== 2) {
            throw 'response has an unexpected number of fields';
        }
        if (!response.data.hasOwnProperty('error')) {
            throw 'response is missing required error field';
        }
        if (!response.data.hasOwnProperty('result')) {
            throw 'response is missing required result field';
        }
        if (response.data.error) {
            throw response.data.error;
        }

        return response.data.result;
    } catch (error) {
        throw error;
    }
}

const ankiConfig = {
    DeckName: "",
    ModelName: "",
    FieldNames: {
        Word: "",
        Example: "",
        Explain: ""
    }
}

function checkAnkiConfig() {
    if (ankiConfig.DeckName == "") return false
    if (ankiConfig.ModelName == "") return false
    if (ankiConfig.FieldNames.Word == "") return false
    if (ankiConfig.FieldNames.Example == "") return false
    if (ankiConfig.FieldNames.Explain == "") return false
    return true
}
window.setAnkiConfig = function (deck, model, word, example, explain) {
    ankiConfig.DeckName = deck
    ankiConfig.ModelName = model
    ankiConfig.FieldNames.Word = word
    ankiConfig.FieldNames.Example = example
    ankiConfig.FieldNames.Explain = explain
}

async function ankiAddNote(word, example, explain) {
    const params = {
        "note": {
            "deckName": ankiConfig.DeckName,
            "modelName": ankiConfig.ModelName,

            "fields": {
                [ankiConfig.FieldNames.Word]: word,
                [ankiConfig.FieldNames.Example]: example,
                [ankiConfig.FieldNames.Explain]: explain
            },
            "options": {
                "allowDuplicate": false,
                "duplicateScope": "deck",
                "duplicateScopeOptions": {
                    "deckName": ankiConfig.Deck,
                    "checkChildren": false,
                    "checkAllModels": false
                }
            },
        },
    }
    // console.log(params)
    try {
        const result = await invokeAnki('addNote', 6, params);
        ankiStatus.value = "正在添加单词卡片。。。"
        console.log(params)
        ankiMessage('添加成功：' + result);
    } catch (error) {
        ankiMessage('添加失败：' + error);
    }
}

function ankiMessage(msg) {
    ankiStatus.value = msg
    setTimeout(() => {
        ankiStatus.value = ''
    }, 3000)
}

</script>

<style scoped>
#root {
    flex: 1;
    padding: 8px;
    text-align: left;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    scrollbar-width: none;

}

#main {
    flex: 5;
    overflow: auto;
    scrollbar-width: thin;
}

#bottom {
    flex: 1;
    display: flex;
    flex-direction: column;
}

#searchbox {
    text-align: center;
    font-size: 2em;
    border-radius: 20px;
    padding: 8px;
    width: 100%;
}

#current-text {
    flex: 1;
    font-size: 1.2em;
    resize: none;
    /* border: none; */
    outline: none;
    overflow: auto;
}
</style>