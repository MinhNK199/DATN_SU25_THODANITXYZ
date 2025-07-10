const axios = require('axios');
const fs = require('fs');
const path = require('path');

const WALLET_LOGO_DIR = path.join(__dirname, 'public/images/wallets');

const wallets = [
  { code: 'momo', url: 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png' },
  { code: 'zalopay', url: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/ZaloPay_Logo.png' },
  { code: 'vnpay', url: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Logo_VNPAY.png' },
  { code: 'shopeepay', url: 'https://upload.wikimedia.org/wikipedia/commons/2/29/ShopeePay_logo.png' },
  { code: 'viettelmoney', url: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Viettel_Money_logo.png' },
  { code: 'onepay', url: 'https://www.onepay.vn/images/logo.png' },
  { code: 'neox', url: 'https://neox.vn/wp-content/uploads/2022/11/cropped-logo-neox-1.png' },
];

async function downloadWalletLogos() {
  if (!fs.existsSync(WALLET_LOGO_DIR)) {
    fs.mkdirSync(WALLET_LOGO_DIR, { recursive: true });
  }
  for (const wallet of wallets) {
    const filePath = path.join(WALLET_LOGO_DIR, `${wallet.code}.png`);
    try {
      const response = await axios.get(wallet.url, { responseType: 'arraybuffer' });
      fs.writeFileSync(filePath, response.data);
      console.log(`Downloaded: ${wallet.code}.png`);
    } catch (err) {
      console.error(`Failed: ${wallet.code} - ${wallet.url}`);
    }
  }
}
downloadWalletLogos(); 