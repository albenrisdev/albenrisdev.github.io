// Desktop-only wording that is not in the iOS string catalog (machine-translated, like the rest).
// Merged over strings.js, so keep keys here limited to text the phone apps don't use.
(function () {
  const extra = {
    "SOUND": { ar: "الصوت", bg: "ЗВУК", de: "TON", "es-419": "SONIDO", id: "SUARA", it: "SUONO", ja: "サウンド", "pt-BR": "SOM", ru: "ЗВУК", tr: "SES", "zh-CN": "声音" },
    "Click for another": { ar: "انقر لعرض اقتباس آخر", bg: "Щракнете за друг цитат", de: "Klicken für ein neues Zitat", "es-419": "Haz clic para ver otra", id: "Klik untuk kutipan lain", it: "Fai clic per un'altra", ja: "クリックして次の名言へ", "pt-BR": "Clique para ver outra", ru: "Нажмите, чтобы увидеть другую", tr: "Başka bir söz için tıkla", "zh-CN": "点击查看下一条" },
  };
  const table = (window.LC_STRINGS = window.LC_STRINGS || {});
  for (const [key, byLang] of Object.entries(extra)) {
    for (const [lang, value] of Object.entries(byLang)) {
      (table[lang] = table[lang] || {})[key] = value;
    }
  }
})();
