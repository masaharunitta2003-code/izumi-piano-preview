// いずみピアノ教室（試作）

// 狭い幅のメニュー（☰ で開くプルダウン）
(function () {
  var button = document.querySelector(".menu-button");
  var nav = document.getElementById("mobile-nav");
  if (!button || !nav) return;

  function setOpen(open) {
    button.setAttribute("aria-expanded", String(open));
    button.querySelector(".label").textContent = open ? "閉じる" : "メニュー";
    nav.classList.toggle("is-open", open);
  }

  button.addEventListener("click", function () {
    setOpen(button.getAttribute("aria-expanded") !== "true");
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && button.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      button.focus();
    }
  });
})();

// お問い合わせのフォーム：試作なので送らずに、その旨の札だけ出す
// （ページの中に onsubmit を書かないのは、公開版で入れる CSP がページ内のスクリプトを止めるため）
(function () {
  var form = document.querySelector("#form form");
  if (!form) return;
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var note = form.querySelector(".proto-note");
    if (note) note.hidden = false;
  });
})();

// 試作だけ：デザイン（基本／お花）と色の案の切り替え（本番では消す）
// ?design=floral のように URL で開いても切り替わる
(function () {
  var root = document.documentElement;
  var groups = [
    { attr: "data-motif", key: "proto-motif", label: "デザイン", fallback: "basic",
      options: { basic: "基本", floral: "お花" } },
    { attr: "data-color", key: "proto-color", label: "色", fallback: "pink",
      options: { pink: "ピンク", cream: "クリーム", mint: "ミント", sunflower: "ひまわり" } }
  ];
  // 共有用のページでは、デザインを固定して切り替えを出さない（html に data-lock-motif）
  if (root.hasAttribute("data-lock-motif")) groups = groups.slice(1);
  var params = new URLSearchParams(location.search);

  // 決まった値だけを受け付ける（"constructor" など、どのオブジェクトにもある名前ははじく）
  function isOption(g, value) {
    return typeof value === "string" && Object.prototype.hasOwnProperty.call(g.options, value);
  }

  groups.forEach(function (g) {
    var value = null;
    try { value = params.get(g.attr === "data-motif" ? "design" : "color"); } catch (e) {}
    if (!isOption(g, value)) {
      try { value = localStorage.getItem(g.key); } catch (e) {}
    }
    if (isOption(g, value)) {
      root.setAttribute(g.attr, value);
      try { localStorage.setItem(g.key, value); } catch (e) {}
    }
  });

  var bar = document.createElement("div");
  bar.className = "proto-switch";
  bar.innerHTML = groups.map(function (g, i) {
    return '<span class="proto-group"><span>' + g.label + "</span>" + Object.keys(g.options).map(function (value) {
      return '<button type="button" data-group="' + i + '" data-value="' + value + '">' + g.options[value] + "</button>";
    }).join("") + "</span>";
  }).join("");
  document.body.appendChild(bar);

  function sync() {
    bar.querySelectorAll("button").forEach(function (b) {
      var g = groups[b.dataset.group];
      var current = root.getAttribute(g.attr) || g.fallback;
      b.setAttribute("aria-pressed", String(b.dataset.value === current));
    });
  }
  bar.addEventListener("click", function (event) {
    var b = event.target.closest("button");
    if (!b) return;
    var g = groups[b.dataset.group];
    if (!g || !isOption(g, b.dataset.value)) return;
    root.setAttribute(g.attr, b.dataset.value);
    try { localStorage.setItem(g.key, b.dataset.value); } catch (e) {}
    sync();
  });
  sync();
})();
