
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, Timestamp} 
from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
  
    // Your web app's Firebase configuration
    const firebaseConfig = {
        apiKey: "",
        authDomain: "",
        projectId: "",
        storageBucket: "",
        messagingSenderId: "",
        appId: ""
        }; 
  
    // Initialize Firebase
    // Firestore
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const messagesRef = collection(db, "messages");

    //const app = initializeApp(firebaseConfig);
    //const db = getDatabase(app);
    //const dbRef = ref(db,"chat");

    
    // メッセージ送信イベント
    window.$("#send").on("click", async function () {
      const $textarea = $("#text"); // ←text定義
      const text = $("#text").val();
      const uname = $("#uname").val();
  
    if (text.trim() === "") return;
  
    await addDoc(messagesRef, {
      uname: uname || "名無し",
      text: text,
      createdAt: Timestamp.now()
    });
  
    $("#text").val("");
    $textarea.height('auto');
    const lineHeight = parseInt($textarea.css('line-height')) || 20;
    $textarea.height(lineHeight);
    $textarea.css('overflow-y', 'hidden');
  });
  
  // メッセージ表示キーワード抽出
  const q = query(messagesRef, orderBy("createdAt"));

  // 日本語判定
function containsJapanese(text) {
  return /[\u3040-\u30FF\u4E00-\u9FFF]/.test(text);
}

// 日本語用キーワード抽出（2文字以上の連続した日本語文字を抽出）
function extractJapaneseKeywords(messages) {
  const segmenter = new window.TinySegmenter(); //追加
  const wordCount = {};
  const allText = messages.join('');
  const words = segmenter.segment(allText);
  //const words = allText.match(/[\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF]{2,}/g);
  //if (!words) return wordCount;

  words.forEach(word => {
    if (word.length > 1) { //追加
    wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });
  return wordCount;
  }

// 英語用キーワード抽出（単語単位で小文字化し3文字以上をカウント）
function extractEnglishKeywords(messages) {
  const wordCount = {};
  messages.join(' ').split(/\W+/).forEach(word => {
    const lower = word.toLowerCase();
    if (lower.length > 2) {
      wordCount[lower] = (wordCount[lower] || 0) + 1;
    }
  });
  return wordCount;
}

// メインのキーワード抽出関数（日本語が含まれていたら日本語モード、それ以外は英語モード）
function extractKeywordsWithCounts(messages) {
  const allText = messages.join('');
  if (containsJapanese(allText)) {
    return extractJapaneseKeywords(messages);
  } else {
    return extractEnglishKeywords(messages);
  }
}

  
  onSnapshot(q, (snapshot) => {
    $('#output').empty();
    const texts = [];
  
    snapshot.forEach((doc) => {
      const msg = doc.data();
      const text = msg.text;
      const uname = msg.uname;
      const time = msg.createdAt?.toDate().toLocaleString() || "日時なし";
      
  
      window.$('#output').append(`
        <div>
          <strong>${uname}</strong>（${time}）<br>
          ${text}
          <hr>
        </div>
      `);
  
      texts.push(text);
      $('#output').scrollTop($('#output')[0].scrollHeight);
    });  
    console.log("texts 配列の中身:", texts); // ← 追加
      // キーワード頻度を計算してクラウドタグに変換
const wordCount = extractKeywordsWithCounts(texts);

console.log("wordCount 結果:", wordCount); // ← 追加


// 最も多く登場したキーワードの頻度（サイズ計算の基準）
const maxFreq = Math.max(...Object.values(wordCount), 1); // 0除算防止に1を追加

const keywordTags = Object.entries(wordCount).map(([word, count]) => {
const freqLevel = Math.ceil((count / maxFreq) * 5); // 1〜5段階にする
const top = Math.floor(Math.random() * 60) + 20;  // 安全のため90%までに20%から80%に変更
const left = Math.floor(Math.random() * 90) + 5; //追加
return `<span class="keyword-tag freq-${freqLevel}" style="top:${top}%; left:${left}%; transform: translate(-50%, -50%);">${word}</span>`; //>${word}</span>`;
}).join(' ');

// HTMLにタグを挿入
window.$('#keywords').html(keywordTags);
});
      
    //テキストエリアの仕様
    window.$(document).ready(function () {
        $('#text').on('input', function () {
          $(this).height('auto'); // 高さリセット
          $(this).height(this.scrollHeight + 'px'); // コンテンツの高さに合わせる
        });
      });


      const keywordTags = Object.entries(wordCount).map(([word, count]) => {
        const freqLevel = Math.ceil((count / maxFreq) * 5);
        const top = Math.floor(Math.random() * 100);
        const left = Math.floor(Math.random() * 100);
        const delay = Math.random() * 1; // 0〜5秒のランダム遅延
        return `<span class="keyword-tag freq-${freqLevel}" style="top:${top}%; left:${left}%; transform: translate(-50%, -50%);">${word}</span>`;
      }).join('');

   
    
      
