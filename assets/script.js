/* assets/script.js */

/* --------------------------
   ユーティリティ関数
   -------------------------- */
function el(id) { return document.getElementById(id); }

/* --------------------------
   見出しへスクロール
   -------------------------- */
function scrollToHeadingById(id, { behavior = 'smooth' } = {}) {
	if (!id) return;
	const target = document.getElementById(id);
	if (!target) return;
	target.scrollIntoView({ behavior, block: 'start' });
}

/* --------------------------
   初期化
   -------------------------- */
document.addEventListener('DOMContentLoaded', () => {
	buildLeftSidebar();
	setupMenuToggle();
	loadPage('home.md');

	// ページ内リンク用
	window.addEventListener('hashchange', () => {
		const id = location.hash.replace(/^#/, '');
		if (id) requestAnimationFrame(() => scrollToHeadingById(id));
	});

	// ✅ イースターエッグ（H押下で発動）
	const h = document.getElementById('egg-h');
	if (h) {
		h.addEventListener('click', () => {
			showEggPopup("街中で『久遠 蓮』に声をかけて<br>『猫』を語ってください。<br>いいことあるかもね");
		});
	}
});

/* --------------------------
   左サイドバー生成
   -------------------------- */
function buildLeftSidebar() {
	fetch('sidebar.json')
		.then(res => {
			if (!res.ok) throw new Error('sidebar.json を読み込めませんでした');
			return res.json();
		})
		.then(data => {
			const nav = el('nav-pages');
			nav.innerHTML = '';
			if (!Array.isArray(data.pages)) return;

			data.pages.forEach(page => {
				const li = document.createElement('li');
				const a = document.createElement('a');
				a.textContent = page.title || page.file;
				a.href = '#';
				a.setAttribute('data-file', page.file);
				a.setAttribute('data-id', page.id || page.file);
				a.addEventListener('click', (e) => {
					e.preventDefault();
					const file = e.currentTarget.getAttribute('data-file');
					loadPage(file);
					closeMobileSidebars();
					setTimeout(() => el('content')?.focus(), 300);
				});
				li.appendChild(a);
				nav.appendChild(li);
			});
		})
		.catch(err => {
			console.error(err);
			const nav = el('nav-pages');
			if (nav) nav.innerHTML = '<li>左サイドバーの読み込みエラー</li>';
		});
}

/* --------------------------
   ページを読み込む
   -------------------------- */
function loadPage(fileName) {
	const path = 'contents/' + fileName;
	const contentEl = el('content');
	contentEl.innerHTML = '<p class="loading-notice">読み込み中...</p>';

	fetch(path)
		.then(res => {
			if (!res.ok) throw new Error(path + ' を読み込めませんでした (' + res.status + ')');
			return res.text();
		})
		.then(md => {
			const html = (typeof marked !== 'undefined')
				? marked.parse(md)
				: '<pre>' + escapeHtml(md) + '</pre>';
			contentEl.innerHTML = html;

			normalizeHeadings(contentEl);
			updateRightSidebar();

			// ✅ 読み込み時は必ずトップへ戻す
			contentEl.scrollTop = 0;
			window.scrollTo({ top: 0 });
		})
		.catch(err => {
			console.error(err);
			contentEl.innerHTML = '<p>ページの読み込みに失敗しました。</p>';
		});
}

/* escape for fallback */
function escapeHtml(s) {
	return s.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

/* --------------------------
   h2 に id を振る
   -------------------------- */
function normalizeHeadings(container) {
	const map = new Map();
	const headings = container.querySelectorAll('h2');
	headings.forEach(h => {
		let raw = (h.textContent || 'heading').trim().toLowerCase();
		let base = raw.replace(/\s+/g, '-').replace(/[^\w\-]/g, '');
		if (!base || /^[0-9]/.test(base)) base = 'h-' + base;
		const count = (map.get(base) || 0) + 1;
		map.set(base, count);
		const unique = count === 1 ? base : `${base}-${count}`;
		if (!h.id) h.id = unique;
	});
}

/* --------------------------
   右サイドバー更新
   -------------------------- */
function updateRightSidebar() {
	const contentEl = el('content');
	const headings = contentEl.querySelectorAll('h2');
	const nav = el('nav-headings');
	nav.innerHTML = '';

	if (headings.length === 0) {
		nav.innerHTML = '<li><small>目次がありません</small></li>';
		return;
	}

	headings.forEach(h => {
		const li = document.createElement('li');
		const a = document.createElement('a');
		a.textContent = h.textContent;
		a.href = '#' + h.id;

		a.addEventListener('click', (e) => {
			e.preventDefault();
			const id = h.id;
			history.pushState(null, '', '#' + id);
			closeMobileSidebars();

			document.querySelectorAll('#nav-headings a').forEach(link => link.classList.remove('active'));
			a.classList.add('active');

			requestAnimationFrame(() => scrollToHeadingById(id));
		});

		li.appendChild(a);
		nav.appendChild(li);
	});

	observeHeadings();
}

/* --------------------------
   h2 観測（スクロール連動）
   -------------------------- */
function observeHeadings() {
	const content = el('content');
	const headings = content.querySelectorAll('h2');
	const navLinks = document.querySelectorAll('#nav-headings a');
	if (!headings.length || !navLinks.length) return;

	const observer = new IntersectionObserver(entries => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				const id = entry.target.id;
				navLinks.forEach(link => link.classList.remove('active'));
				const current = document.querySelector(`#nav-headings a[href="#${id}"]`);
				if (current) current.classList.add('active');
			}
		});
	}, {
		root: content,
		rootMargin: "-56px 0px -95% 0px",
		threshold: 0
	});

	headings.forEach(h => observer.observe(h));
}

/* --------------------------
   モバイルメニュートグル
   -------------------------- */
function setupMenuToggle() {
	const btn = el('menu-toggle');
	const left = el('sidebar-left');
	const right = el('sidebar-right');
	if (!btn) return;

	btn.addEventListener('click', () => {
		const expanded = btn.getAttribute('aria-expanded') === 'true';
		if (expanded) {
			btn.setAttribute('aria-expanded', 'false');
			left.classList.remove('sidebar-active');
			right.classList.remove('sidebar-active');
		} else {
			btn.setAttribute('aria-expanded', 'true');
			left.classList.add('sidebar-active');
			right.classList.add('sidebar-active');
		}
	});

	window.addEventListener('resize', () => {
		if (window.innerWidth > 768) {
			btn.setAttribute('aria-expanded', 'false');
			left.classList.remove('sidebar-active');
			right.classList.remove('sidebar-active');
		}
	});

	document.addEventListener('click', (e) => {
		if (window.innerWidth <= 768) {
			const isMenuBtn = e.target.closest('#menu-toggle');
			const inLeft = e.target.closest('#sidebar-left');
			const inRight = e.target.closest('#sidebar-right');
			if (!isMenuBtn && !inLeft && !inRight) {
				closeMobileSidebars();
			}
		}
	});
}

/* --------------------------
   サイドバー閉じる
   -------------------------- */
function closeMobileSidebars() {
	const btn = el('menu-toggle');
	const left = el('sidebar-left');
	const right = el('sidebar-right');
	if (btn) btn.setAttribute('aria-expanded', 'false');
	if (left) left.classList.remove('sidebar-active');
	if (right) right.classList.remove('sidebar-active');
}

/* --------------------------
   イースターエッグ（ポップアップ表示）
   -------------------------- */
function showEggPopup(message) {
	let overlay = document.getElementById('egg-overlay');
	if (!overlay) {
		overlay = document.createElement('div');
		overlay.id = 'egg-overlay';
		overlay.innerHTML = `
		  <div id="egg-popup">
			<div class="egg-message">${message}</div>
			<button id="egg-close">閉じる</button>
		  </div>
		`;
		document.body.appendChild(overlay);
	}
	overlay.style.display = 'block';
	requestAnimationFrame(() => overlay.classList.add('show'));

	overlay.querySelector('#egg-close').addEventListener('click', () => {
		overlay.classList.remove('show');
		setTimeout(() => overlay.style.display = 'none', 200);
	});

	overlay.addEventListener('click', (e) => {
		if (e.target.id === 'egg-overlay') {
			overlay.classList.remove('show');
			setTimeout(() => overlay.style.display = 'none', 200);
		}
	});
}
