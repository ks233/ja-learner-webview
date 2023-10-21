import axios from 'axios';


function googleTranslation(text, callback, tl="en"){
    // tl: 目标语言
    // q: 待翻译文本
    // sl: 源语言
    console.log("googleTranslation")
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


export default googleTranslation;