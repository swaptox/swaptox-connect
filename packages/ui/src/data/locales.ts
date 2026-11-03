export const supported = [
	'en', 
	'zh-Hans', 
	'zh-Hant', 
	'ja', 
	'ko', 
	'th',
	'pt-BR',//葡萄牙语（pt-BR）
	'id',//印尼语（id）
	'vi',//越南语（vi）
] as const;
export type SupportedLang = (typeof supported)[number];

export const defaultLang: SupportedLang = 'en';

const baseLangsMap: Record<string, SupportedLang> = {};
const langsMap: Record<string, SupportedLang> = {};

for (const lang of supported) {
	const lowerLang = lang.toLowerCase();
	langsMap[lowerLang] = lang;
	const base = lowerLang.split('-')[0];
	if (!baseLangsMap[base]) {
		baseLangsMap[base] = lang;
	}
}

function normalizeLocale(lang: string): string {
	return lang.trim().replace('_', '-').toLowerCase();
}

function resolveLocale(lang?: string): SupportedLang | undefined {
	if (!lang) return undefined;
	const normalized = normalizeLocale(lang);
	return langsMap[normalized] ?? baseLangsMap[normalized.split('-')[0]];
}

function detectLang(): SupportedLang {
	if (typeof navigator === 'undefined') {
		return defaultLang;
	}

	const nav = navigator as Navigator & { userLanguage?: string };
	const candidates = [
		...(Array.isArray(nav.languages) ? nav.languages : []),
		nav.language,
		nav.userLanguage,
	];

	for (const lang of candidates) {
		const resolved = resolveLocale(lang);
		if (resolved) return resolved;
	}

	return defaultLang;
}

export const currentLang = detectLang();

export const languagePack: Record<SupportedLang, Record<string, string>> = {
	en: {
		'last-used': 'Last Used',
		'universal-qr': 'Universal QR',
		installed: 'Installed',
		qr: 'QR',
		plugin: 'Extension',
		open: 'Open',
		get: 'Get',
		retry: 'Retry',
		refresh: 'Refresh',
		'qr-expired': 'QR code expired',
		'assist-official': 'Need the official {name} popup?',
		'assist-get-wallet': "Don't have {name}?",
		'connect-coinbase': 'Connect Coinbase Wallet',
		'confirm-extension': 'Confirm connection in the extension',
		'get-wallet': 'Get {name}',
		'add-to-browser': 'Add {name} to {browser}',
		'add-wallet-extension': 'Add the wallet extension to your browser',
		'add-extension': 'Add extension',
		'connect-name': 'Connect {name}',
		'open-wallet-app': 'Open and continue in the wallet app',
		'open-app': 'Open App',
	},
	'zh-Hans': {
		'last-used': '上次使用',
		'universal-qr': '通用二维码',
		installed: '已安装',
		qr: '二维码',
		plugin: '扩展',
		open: '打开',
		get: '获取',
		retry: '重试',
		refresh: '刷新',
		'qr-expired': '二维码已过期',
		'assist-official': '需要打开官方 {name} 弹窗？',
		'assist-get-wallet': '还没有 {name}？',
		'connect-coinbase': '连接 Coinbase Wallet',
		'confirm-extension': '请在扩展中确认连接',
		'get-wallet': '获取 {name}',
		'add-to-browser': '将 {name} 添加到 {browser}',
		'add-wallet-extension': '为浏览器添加钱包扩展',
		'add-extension': '添加扩展',
		'connect-name': '连接 {name}',
		'open-wallet-app': '打开钱包 App 并继续操作',
		'open-app': '打开 App',
	},
	'zh-Hant': {
		'last-used': '上次使用',
		'universal-qr': '通用 QR 碼',
		installed: '已安裝',
		qr: 'QR 碼',
		plugin: '擴充功能',
		open: '開啟',
		get: '取得',
		retry: '重試',
		refresh: '重新整理',
		'qr-expired': 'QR 碼已過期',
		'assist-official': '需要開啟官方 {name} 彈窗嗎？',
		'assist-get-wallet': '還沒有 {name} 嗎？',
		'connect-coinbase': '連接 Coinbase Wallet',
		'confirm-extension': '請在擴充功能中確認連接',
		'get-wallet': '取得 {name}',
		'add-to-browser': '將 {name} 加到 {browser}',
		'add-wallet-extension': '為瀏覽器加入錢包擴充功能',
		'add-extension': '加入擴充功能',
		'connect-name': '連接 {name}',
		'open-wallet-app': '開啟錢包 App 並繼續操作',
		'open-app': '開啟 App',
	},
	ja: {
		'last-used': '前回使用',
		'universal-qr': '汎用 QR',
		installed: 'インストール済み',
		qr: 'QR',
		plugin: '拡張機能',
		open: '開く',
		get: '入手',
		retry: '再試行',
		refresh: '更新',
		'qr-expired': 'QR コードの有効期限が切れました',
		'assist-official': '公式の {name} ポップアップを開きますか？',
		'assist-get-wallet': '{name} をお持ちではありませんか？',
		'connect-coinbase': 'Coinbase Wallet に接続',
		'confirm-extension': '拡張機能で接続を確認してください',
		'get-wallet': '{name} を入手',
		'add-to-browser': '{name} を {browser} に追加',
		'add-wallet-extension': 'ブラウザーにウォレット拡張機能を追加',
		'add-extension': '拡張機能を追加',
		'connect-name': '{name} に接続',
		'open-wallet-app': 'ウォレットアプリを開いて続行',
		'open-app': 'アプリを開く',
	},
	ko: {
		'last-used': '최근 사용',
		'universal-qr': '범용 QR',
		installed: '설치됨',
		qr: 'QR',
		plugin: '확장 프로그램',
		open: '열기',
		get: '받기',
		retry: '다시 시도',
		refresh: '새로고침',
		'qr-expired': 'QR 코드가 만료되었습니다',
		'assist-official': '공식 {name} 팝업을 여시겠습니까?',
		'assist-get-wallet': '{name} 지갑이 없으신가요?',
		'connect-coinbase': 'Coinbase Wallet 연결',
		'confirm-extension': '확장 프로그램에서 연결을 확인하세요',
		'get-wallet': '{name} 받기',
		'add-to-browser': '{browser}에 {name} 추가',
		'add-wallet-extension': '브라우저에 지갑 확장 프로그램 추가',
		'add-extension': '확장 프로그램 추가',
		'connect-name': '{name} 연결',
		'open-wallet-app': '지갑 앱을 열고 계속 진행',
		'open-app': '앱 열기',
	},
	th: {
		'last-used': 'ใช้ล่าสุด',
		'universal-qr': 'QR สากล',
		installed: 'ติดตั้งแล้ว',
		qr: 'QR',
		plugin: 'ส่วนขยาย',
		open: 'เปิด',
		get: 'รับ',
		retry: 'ลองอีกครั้ง',
		refresh: 'รีเฟรช',
		'qr-expired': 'QR หมดอายุแล้ว',
		'assist-official': 'ต้องการเปิดหน้าต่างป๊อปอัปอย่างเป็นทางการของ {name} หรือไม่?',
		'assist-get-wallet': 'ยังไม่มี {name} ใช่ไหม?',
		'connect-coinbase': 'เชื่อมต่อ Coinbase Wallet',
		'confirm-extension': 'โปรดยืนยันการเชื่อมต่อในส่วนขยาย',
		'get-wallet': 'รับ {name}',
		'add-to-browser': 'เพิ่ม {name} ไปยัง {browser}',
		'add-wallet-extension': 'เพิ่มส่วนขยายกระเป๋าเงินไปยังเบราว์เซอร์ของคุณ',
		'add-extension': 'เพิ่มส่วนขยาย',
		'connect-name': 'เชื่อมต่อ {name}',
		'open-wallet-app': 'เปิดแอปกระเป๋าเงินเพื่อดำเนินการต่อ',
		'open-app': 'เปิดแอป',
	},
	'pt-BR': {
		'last-used': 'Usado recentemente',
		'universal-qr': 'QR Code universal',
		installed: 'Instalado',
		qr: 'QR Code',
		plugin: 'Extensão',
		open: 'Abrir',
		get: 'Obter',
		retry: 'Tentar novamente',
		refresh: 'Atualizar',
		'qr-expired': 'QR Code expirado',
		'assist-official': 'Precisa abrir a janela oficial do {name}?',
		'assist-get-wallet': 'Ainda não tem o {name}?',
		'connect-coinbase': 'Conectar à Coinbase Wallet',
		'confirm-extension': 'Confirme a conexão na extensão',
		'get-wallet': 'Obter {name}',
		'add-to-browser': 'Adicionar {name} ao {browser}',
		'add-wallet-extension': 'Adicione a extensão da carteira ao seu navegador',
		'add-extension': 'Adicionar extensão',
		'connect-name': 'Conectar {name}',
		'open-wallet-app': 'Abra o aplicativo da carteira para continuar',
		'open-app': 'Abrir aplicativo',
	},
	id: {
		'last-used': 'Terakhir digunakan',
		'universal-qr': 'Kode QR universal',
		installed: 'Terinstal',
		qr: 'Kode QR',
		plugin: 'Ekstensi',
		open: 'Buka',
		get: 'Dapatkan',
		retry: 'Coba lagi',
		refresh: 'Muat ulang',
		'qr-expired': 'Kode QR telah kedaluwarsa',
		'assist-official': 'Ingin membuka jendela pop-up resmi {name}?',
		'assist-get-wallet': 'Belum punya {name}?',
		'connect-coinbase': 'Hubungkan Coinbase Wallet',
		'confirm-extension': 'Konfirmasi koneksi di ekstensi',
		'get-wallet': 'Dapatkan {name}',
		'add-to-browser': 'Tambahkan {name} ke {browser}',
		'add-wallet-extension': 'Tambahkan ekstensi dompet ke browser Anda',
		'add-extension': 'Tambahkan ekstensi',
		'connect-name': 'Hubungkan {name}',
		'open-wallet-app': 'Buka aplikasi dompet untuk melanjutkan',
		'open-app': 'Buka aplikasi',
	},
	vi: {
		'last-used': 'Đã dùng gần đây',
		'universal-qr': 'Mã QR đa năng',
		installed: 'Đã cài đặt',
		qr: 'Mã QR',
		plugin: 'Tiện ích mở rộng',
		open: 'Mở',
		get: 'Tải',
		retry: 'Thử lại',
		refresh: 'Làm mới',
		'qr-expired': 'Mã QR đã hết hạn',
		'assist-official': 'Bạn muốn mở cửa sổ bật lên chính thức của {name}?',
		'assist-get-wallet': 'Bạn chưa có {name}?',
		'connect-coinbase': 'Kết nối Coinbase Wallet',
		'confirm-extension': 'Xác nhận kết nối trong tiện ích mở rộng',
		'get-wallet': 'Tải {name}',
		'add-to-browser': 'Thêm {name} vào {browser}',
		'add-wallet-extension': 'Thêm tiện ích ví vào trình duyệt của bạn',
		'add-extension': 'Thêm tiện ích mở rộng',
		'connect-name': 'Kết nối {name}',
		'open-wallet-app': 'Mở ứng dụng ví để tiếp tục',
		'open-app': 'Mở ứng dụng',
	}
};







