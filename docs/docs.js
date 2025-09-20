document.addEventListener("DOMContentLoaded", async () => {
  const contentEl = document.getElementById("content");
  const tocEl = document.getElementById("toc");

  let mdPath = "";
  let path = window.location.pathname;

  // URL 正規化
  if (path.endsWith("/")) {
    path += "index.html";
  }

  if (path.endsWith("docs/index.html")) {
    mdPath = "md/home/home.md";   // docs/index.html → docs/md/home/home.md
  } else if (path.includes("/html/")) {
    const relative = path.split("/html/")[1].replace(".html", ".md");
    mdPath = "../../md/" + relative;   // docs/html/... → docs/md/...
  }

  try {
    const res = await fetch(mdPath);
    if (!res.ok) throw new Error(res.statusText);
    const md = await res.text();
    contentEl.innerHTML = marked.parse(md);

    // 目次生成
    tocEl.innerHTML = "";
    document.querySelectorAll(".content h2, .content h3").forEach(h => {
      const id = h.textContent.trim()
        .toLowerCase()
        .replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9faf\s]/gi, "")
        .replace(/\s+/g, "-");
      h.id = id;

      const li = document.createElement("li");
      li.innerHTML = `<a href="#${id}">${h.textContent}</a>`;
      tocEl.appendChild(li);
    });
  } catch (err) {
    contentEl.innerHTML = `<p>コンテンツを読み込めませんでした (${mdPath})</p>`;
    console.error("Markdown 読み込みエラー:", err);
  }
});
