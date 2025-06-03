import axios from 'axios';


function googleTranslation(text, callback, tl = "en") {
    // tl: 目标语言
    // q: 待翻译文本
    // sl: 源语言
    // console.log("googleTranslation")
    axios.get('googletrans/t', {
        params: {
            tl: tl,
            q: text,
            sl: "auto",
            client: "dict-chrome-ex",
        },
    }).then((res) => {
        callback(res.data[0][0]);
    }).catch((err) => {
        console.log(err);
    });
}

function googleTransTk(text, callback, tl = "en") {
    // console.log("googleTransTk")
    tl = tl.toLowerCase();
    var headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
    }
    // /translate_a/t?anno=3&client=te&v=1.0&format=html&sl=auto&tl=zh-cn&tk=
    axios.post('googletrans_api/translate_a/t', {
        q: text
    }, {
        params: {
            anno: 3,
            client: "te",
            v: "1.0",
            format: "html",
            sl: "auto",
            tl: tl,
            tk: calcHash(text),
        }, headers: headers,
    }).then((res) => {
        // console.log(res.data);
        var result = res.data[0][0]
        result = transformTkResult(result);

        callback(result);
    }).catch((err) => {
        console.log(err);
    });
}

let auth = ''

const alternativeKey = new TextDecoder().decode(
    new Uint8Array([
        65, 73, 122, 97, 83, 121, 65, 84, 66, 88, 97, 106, 118, 122, 81,
        76, 84, 68, 72, 69, 81, 98, 99, 112, 113, 48, 73, 104, 101, 48,
        118, 87, 68, 72, 109, 79, 53, 50, 48,
    ])
);

async function getAuth() {
    console.log("getAuth")
    const authResp = await axios.get(
        "googletrans_api/_/translate_http/_/js/k=translate_http.tr.en_US.YusFYy3P_ro.O/am=AAg/d=1/exm=el_conf/ed=1/rs=AN8SPfq1Hb8iJRleQqQc8zhdzXmF9E56eQ/m=el_main"
    );
    let authMatch = authResp.data.match(
        /['"]x\-goog\-api\-key['"]\s*\:\s*['"](\w{39})['"]/i
    );
    if (!authMatch) {
        auth = alternativeKey
    } else {
        auth = authMatch[1];
    }
}

async function googleTransV2(text, callback, tl = "en") {
    console.log('alt', alternativeKey)
    console.log('v2');
    try {
        // 获取 auth key
        if (auth == '') {
            await getAuth()
        }
        console.log("Auth Key:", auth);
        // 使用 auth key 调用翻译接口
        const headers = {
            'Content-Type': 'application/application/json+protobuf',
            'X-goog-api-key': auth
        };
        const payload = [[text, "auto", tl], "te"];
        const response = await axios.post('goog_v2', payload, { headers });

        let result = response.data[0][0];
        result = transformTkResult(result); // 假设你已定义此函数
        callback(result);
    } catch (err) {
        console.error("Translation error:", err);
    }
}

function transformTkResult(result) {
    // 使用正则表达式匹配所有位于<b></b>标签之间的内容
    const regex = /<b>(.*?)<\/b>/g;
    let concatenatedString = '';

    result.replace(regex, (match, capturedContent) => {
        // 使用捕获组的内容，即不包含<b></b>标签的内容
        concatenatedString += capturedContent;
    });

    // 如果没有匹配到<b>标签，直接返回原字符串
    if (concatenatedString === '') {
        return result;
    }

    return concatenatedString;
}

/**
 *
 * @param {number} num
 * @param {string} optString
 * @returns {number}
 */
function shiftLeftOrRightThenSumOrXor(num, optString) {
    for (let i = 0; i < optString.length - 2; i += 3) {
        /** @type {string|number} */
        let acc = optString.charAt(i + 2);
        if ("a" <= acc) {
            acc = acc.charCodeAt(0) - 87;
        } else {
            acc = Number(acc);
        }
        if (optString.charAt(i + 1) == "+") {
            acc = num >>> acc;
        } else {
            acc = num << acc;
        }
        if (optString.charAt(i) == "+") {
            num += acc & 4294967295;
        } else {
            num ^= acc;
        }
    }
    return num;
}

/**
 *
 * @param {string} query
 * @returns {Array<number>}
 */
function transformQuery(query) {
    /** @type {Array<number>} */
    const bytesArray = [];
    let idx = 0;
    for (let i = 0; i < query.length; i++) {
        let charCode = query.charCodeAt(i);

        if (128 > charCode) {
            bytesArray[idx++] = charCode;
        } else {
            if (2048 > charCode) {
                bytesArray[idx++] = (charCode >> 6) | 192;
            } else {
                if (
                    55296 == (charCode & 64512) &&
                    i + 1 < query.length &&
                    56320 == (query.charCodeAt(i + 1) & 64512)
                ) {
                    charCode =
                        65536 +
                        ((charCode & 1023) << 10) +
                        (query.charCodeAt(++i) & 1023);
                    bytesArray[idx++] = (charCode >> 18) | 240;
                    bytesArray[idx++] = ((charCode >> 12) & 63) | 128;
                } else {
                    bytesArray[idx++] = (charCode >> 12) | 224;
                }
                bytesArray[idx++] = ((charCode >> 6) & 63) | 128;
            }
            bytesArray[idx++] = (charCode & 63) | 128;
        }
    }
    return bytesArray;
}

/**
 * Calculates the hash (TK) of a query for google translator.
 * @param {string} query
 * @returns {string}
 */
function calcHash(query) {
    const windowTkk = "448487.932609646";
    const tkkSplited = windowTkk.split(".");
    const tkkIndex = Number(tkkSplited[0]) || 0;
    const tkkKey = Number(tkkSplited[1]) || 0;

    const bytesArray = transformQuery(query);

    let encondingRound = tkkIndex;
    for (const item of bytesArray) {
        encondingRound += item;
        encondingRound = shiftLeftOrRightThenSumOrXor(
            encondingRound,
            "+-a^+6"
        );
    }
    encondingRound = shiftLeftOrRightThenSumOrXor(
        encondingRound,
        "+-3^+b+-f"
    );

    encondingRound ^= tkkKey;
    if (encondingRound <= 0) {
        encondingRound = (encondingRound & 2147483647) + 2147483648;
    }

    const normalizedResult = encondingRound % 1000000;
    return normalizedResult.toString() + "." + (normalizedResult ^ tkkIndex);
}




export { googleTranslation, googleTransTk, googleTransV2 };