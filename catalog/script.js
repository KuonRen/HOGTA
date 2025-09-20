document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("car-grid");
  const searchInput = document.getElementById("search");
  const typeFilters = document.querySelectorAll(".filter-type");
  const sortSelect = document.getElementById("sort");

  // モーダル要素（画像のみ）
  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modal-img");

  // JSONから車両データ取得
  const res = await fetch("cars.json");
  const cars = await res.json();

  const categories = ["スーパー", "スポーツ", "マッスル", "バイク", "その他"];

  // レンダリング関数（カテゴリごとにまとめる）
  function renderCars(list) {
    grid.innerHTML = "";

    categories.forEach(category => {
      const carsInCategory = list.filter(car => car.model === category);
      if (carsInCategory.length === 0) return;

      const block = document.createElement("div");
      block.className = "category-block";

      const title = document.createElement("h2");
      title.className = "category-title";
      title.textContent = category;
      block.appendChild(title);

      const container = document.createElement("div");
      container.className = "category-cars";

      carsInCategory.forEach(car => {
        const card = document.createElement("div");
        card.className = "car-card";
        card.innerHTML = `
          <h3>${car.name}</h3>
          <p class="car-model">車種: ${car.model}</p>
          <p class="car-price">価格: ${car.price}</p>
        `;

        // カードにカーソルが乗ったら即モーダル表示
        card.addEventListener("mouseenter", () => {
          modalImg.src = car.image;
          modal.classList.add("show");
        });

        // カードからカーソルが外れたら即閉じる
        card.addEventListener("mouseleave", () => {
          modal.classList.remove("show");
        });

        container.appendChild(card);
      });

      block.appendChild(container);
      grid.appendChild(block);
    });
  }

  // フィルタリング + ソート適用
  function applyFilters() {
    const keyword = searchInput.value.toLowerCase();
    const selectedTypes = [...typeFilters].filter(cb => cb.checked).map(cb => cb.value);
    const sortOrder = sortSelect.value;

    let filtered = cars.filter(car =>
      car.name.toLowerCase().includes(keyword) ||
      car.model.toLowerCase().includes(keyword) ||
      car.price.toLowerCase().includes(keyword)
    );

    if (selectedTypes.length > 0) {
      filtered = filtered.filter(car => selectedTypes.includes(car.model));
    }

    // ソート（価格昇順/降順）
    filtered.sort((a, b) => {
      const priceA = parseInt(a.price.replace(/[^0-9]/g, ""));
      const priceB = parseInt(b.price.replace(/[^0-9]/g, ""));
      return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
    });

    renderCars(filtered);
  }

  // 初期表示
  applyFilters();

  // イベントリスナー
  searchInput.addEventListener("input", applyFilters);
  typeFilters.forEach(cb => cb.addEventListener("change", applyFilters));
  sortSelect.addEventListener("change", applyFilters);
});
