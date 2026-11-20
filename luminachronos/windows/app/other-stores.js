// "Also on iPhone and Android" panel in Settings (same idea as PrismClimb's Windows app).
// Only the Windows app has it: the App Store doesn't allow the iOS app to name other platforms.
// To remove the panel, empty `stores`. After changing a URL, update it in scripts/make-qr.swift too
// and run `swift Windows/scripts/make-qr.swift` to redraw the QR codes.
window.LC_OTHER_STORES = {
  button: "Also on iPhone and Android",
  hint: "Free",
  title: "Get it on your phone",
  text: "Point your phone's camera at a code, or click a store to open its page.",
  close: "Close",
  stores: [
    { name: "App Store", note: "iPhone and iPad", url: "https://apps.apple.com/app/id6779196533", qr: "qr/app-store.svg" },
    { name: "Google Play", note: "Android", url: "https://play.google.com/store/apps/details?id=com.albenrisdev.luminachronos", qr: "qr/google-play.svg" },
  ],
  // Machine-written, adapted from PrismClimb's panel. `notes` follow the order of `stores`.
  translations: {
    ar: { button: "متوفر أيضًا على iPhone و Android", hint: "مجانًا", title: "احصل عليه على هاتفك", text: "وجّه كاميرا هاتفك نحو أحد الرمزين، أو انقر على أحد المتجرين لفتح صفحته.", close: "إغلاق", notes: ["iPhone و iPad", "Android"] },
    bg: { button: "Също за iPhone и Android", hint: "Безплатно", title: "Вземи го на телефона си", text: "Насочи камерата на телефона към код или щракни върху магазин, за да отвориш страницата му.", close: "Затвори", notes: ["iPhone и iPad", "Android"] },
    de: { button: "Auch für iPhone und Android", hint: "Kostenlos", title: "Hol es dir aufs Handy", text: "Richte die Handykamera auf einen Code oder klicke auf einen Store, um seine Seite zu öffnen.", close: "Schließen", notes: ["iPhone und iPad", "Android"] },
    "es-419": { button: "También en iPhone y Android", hint: "Gratis", title: "Obtenlo en tu teléfono", text: "Apunta la cámara de tu teléfono a un código o haz clic en una tienda para abrir su página.", close: "Cerrar", notes: ["iPhone y iPad", "Android"] },
    id: { button: "Juga di iPhone dan Android", hint: "Gratis", title: "Pasang di ponselmu", text: "Arahkan kamera ponsel ke kode, atau klik salah satu toko untuk membuka halamannya.", close: "Tutup", notes: ["iPhone dan iPad", "Android"] },
    it: { button: "Anche su iPhone e Android", hint: "Gratis", title: "Scaricalo sul telefono", text: "Inquadra un codice con la fotocamera del telefono o fai clic su uno store per aprirne la pagina.", close: "Chiudi", notes: ["iPhone e iPad", "Android"] },
    ja: { button: "iPhone・Android版もあります", hint: "無料", title: "スマホでも使おう", text: "スマホのカメラをコードに向けるか、ストアをクリックしてページを開いてください。", close: "閉じる", notes: ["iPhone・iPad", "Android"] },
    "pt-BR": { button: "Também para iPhone e Android", hint: "Grátis", title: "Baixe no celular", text: "Aponte a câmera do celular para um código ou clique em uma loja para abrir a página.", close: "Fechar", notes: ["iPhone e iPad", "Android"] },
    ru: { button: "Также на iPhone и Android", hint: "Бесплатно", title: "Установите на телефон", text: "Наведите камеру телефона на код или нажмите на магазин, чтобы открыть его страницу.", close: "Закрыть", notes: ["iPhone и iPad", "Android"] },
    tr: { button: "iPhone ve Android'de de var", hint: "Ücretsiz", title: "Telefonunuza indirin", text: "Telefonunuzun kamerasını bir koda tutun veya sayfasını açmak için bir mağazaya tıklayın.", close: "Kapat", notes: ["iPhone ve iPad", "Android"] },
    "zh-CN": { button: "也有 iPhone 和 Android 版", hint: "免费", title: "在手机上使用", text: "用手机相机扫描二维码，或点击商店打开其页面。", close: "关闭", notes: ["iPhone 和 iPad", "Android"] },
  },
};
