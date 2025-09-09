// Markdownファイルを読み込んで <main> に反映
fetch("contents/sample.md")
  .then(response => response.text())
  .then(text => {
    document.getElementById("content").innerHTML = marked.parse(text);
  })
  .catch(error => console.error("読み込みエラー:", error));
