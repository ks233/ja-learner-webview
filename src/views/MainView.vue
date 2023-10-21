<template>
    <div id="root">
        <ruby v-for="item in data">
            <a :href="'https://www.mojidict.com/SearchText/' + (item.basic == '*' ? item.surface : item.basic)"
                target="_blank" @click.prevent="postMessage(item.basic == '*' ? item.surface : item.basic)"
                :class="item.pos === '助詞' ? 'particle' : '' + item.pos === '名詞' ? 'noun' : ''">{{ item.surface }}</a>
            <rt @click="setKatakanaBlacklist(item.surface)" :class="{'in-blacklist': katakana_blacklist.has(item.surface)}">
                {{ item.reading === '' ? 'ㅤ' : item.reading }}
            </rt>
        </ruby>
        <div id="div-translate">{{ translationText }}</div>
    </div>
</template>


<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Kuroshiro from "kuroshiro";
import googleTranslation from "../googleTrans";
const data = ref([])
const translationText = ref("")
const translateKatakana = ref(false)

let katakana_cache = {}
let katakana_blacklist = ref(new Set())

onMounted(async () => {
    console.log('mounted');
    window.updateData = updateData
    window.clearTranslationText = clearTranslationText
    window.appendTranslationText = appendTranslationText
    window.runGoogleTrans = runGoogleTrans
    window.setTranslateKatakana = setTranslateKatakana
});

function setTranslateKatakana(value) {
    translateKatakana.value = value
    if (value === true) {
        katakanaToEnglish()
    }
}

function setKatakanaBlacklist(param) {
    if (katakana_blacklist.value.has(param)) {
        katakana_blacklist.value.delete(param)
    } else {
        katakana_blacklist.value.add(param)
    }
}

function katakanaToEnglish() {
    data.value.forEach(element => {
        if (Kuroshiro.Util.hasKatakana(element.surface) && !Kuroshiro.Util.hasHiragana(element.surface) && element.surface !== "ー") {
            if (katakana_blacklist.value.has(element.surface)) {
                console.log("blacklist")
            } else if (katakana_cache[element.surface] !== undefined) {
                element.reading = katakana_cache[element.surface]
                console.log("cache")
            } else {
                googleTranslation(element.surface, res => {
                    element.reading = res
                    katakana_cache[element.surface] = res
                    console.log(katakana_cache)
                })
            }
            console.log(katakana_cache)
        }
    })
}
async function updateData(newData) {
    clearTranslationText()
    data.value = newData
    // 遍历数组，将每个元素的reading属性转换为平假名
    data.value.forEach(element => {
        element.reading = Kuroshiro.Util.kanaToHiragna(element.reading)
        if (element.reading == element.surface) {
            element.reading = ''
        }
        console.log(element)
    });
    if (translateKatakana.value === true) {
        katakanaToEnglish()
    }
}

function clearTranslationText() {
    translationText.value = ""
}

function appendTranslationText(text) {
    translationText.value += text
}

function postMessage(message) {
    window.chrome.webview.postMessage(message)
    console.log('postMessage', message)
}

function runGoogleTrans(text) {
    googleTranslation(text, res => {
        translationText.value = res
    }, "zh-CN")
}

onUnmounted(() => {
    console.log('unmounted');
    delete window.updateData
});


</script>

<style scoped>
#root {
    flex: 1;
    text-align: left;
    /* display: flex;
    justify-content: center;
    text-align: center;
    align-items: center; */
    padding-left: 0px;
    padding-top: 0px;
}

#div-translate {
    font-size: 1.5em;
    font-weight: 600;
    text-align: left;
    word-break: break-all;
    word-wrap: break-word;
    white-space: pre-wrap;
    line-height: 2;
}

ruby {
    font-size: 2em;
    /* margin: 2px; */
    display: inline-flex;
    flex-direction: column-reverse;
    /* line-height: 1; */
    text-align: center;
    justify-content: center;
}

ruby a {
    text-decoration: none;
    font-weight: 600;
    line-height: 1;
}

rb,
rt {
    display: inline;
    line-height: 1.5;

    font-weight: 600;
    font-size: 00.7em;
}

.particle {
    color: #ff9900;
}

a:hover {
    color: #535bf2;
}

.noun {
    /* border-bottom: solid rgba(255, 255, 255, 0.5); */
    background-color: rgba(255, 255, 255, 0.1);
}

.in-blacklist {
    color: #AAAAAA;
}

@media (prefers-color-scheme: light) {
    .particle {
        color: #ff9900;
    }

    .noun {
        /* border-bottom: solid rgba(0, 195, 255, 1); */
        background-color: rgba(0, 195, 255, 0.3);
    }
}
</style>