<template>
    <div id="root" @dblclick="postMessage('DBLCLICK')" @mousedown.ctrl="postMessage('MOUSEDOWN')">
        <ruby v-for="item in data">
            <a :href="'https://www.mojidict.com/SearchText/' + (item.basic == '*' ? item.surface : item.basic)"
                target="_blank"
                @click.exact.prevent="postMessage(item.basic == '*' || item.basic == '' ? item.surface : item.basic)"
                @click.shift.prevent="postMessage('APPEND' + item.surface)"
                :class="item.pos === '助詞' ? 'particle' : '' + item.pos === '名詞' ? 'noun' : ''" class="unselectable">{{
                    item.surface }}</a>
            <rt @click="setKatakanaBlacklist(item)" :class="{ 'in-blacklist': katakana_blacklist.has(item.surface) }"
                class="unselectable">
                {{ itemRuby(item) }}
            </rt>
        </ruby>
        <div id="div-translate">{{ translationText }}</div>
    </div>
</template>


<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Kuroshiro from "kuroshiro";
import { googleTranslation, googleTransTk } from "../googleTrans";
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
    window.runGoogleTransTk = runGoogleTransTk
    window.setTranslateKatakana = setTranslateKatakana
});

function setTranslateKatakana(value) {
    translateKatakana.value = value
    if (value === true) {
        katakanaToEnglish()
    }
}

function setKatakanaBlacklist(item) {
    if (!onlyHasKatakana(item.surface)) {
        return
    }
    if (katakana_blacklist.value.has(item.surface)) {
        katakana_blacklist.value.delete(item.surface)
        if (translateKatakana.value === true) {
            itemKatakanaToEnglish(item)
        }
    } else {
        katakana_blacklist.value.add(item.surface)
    }
}

function itemRuby(item) {
    if (item.english !== '' && translateKatakana.value === true && !katakana_blacklist.value.has(item.surface)) return item.english
    return item.reading === '' ? 'ㅤ' : item.reading
}

function itemKatakanaToEnglish(item) {
    var surface = item.surface
    if (onlyHasKatakana(surface) && item.english === '') {
        if (katakana_blacklist.value.has(surface)) {
            console.log("blacklist")
        } else if (katakana_cache[surface] !== undefined) {
            item.english = katakana_cache[surface]
        } else {
            googleTransTk(surface, res => {
                item.english = res
                katakana_cache[surface] = res
                return res
            })
        }
    }
}

function onlyHasKatakana(text) {
    return Kuroshiro.Util.hasKatakana(text) && !Kuroshiro.Util.hasHiragana(text) && !Kuroshiro.Util.hasKanji(text) && text !== "ー"
}

function katakanaToEnglish() {
    data.value.forEach(element => {
        itemKatakanaToEnglish(element)
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
        element.english = ''
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

function runGoogleTransTk(text) {
    // console.log(text)
    googleTransTk(text, res => {
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
    padding: 5px;
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
    padding: 0;
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

    text-align: center;
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

.unselectable {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
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