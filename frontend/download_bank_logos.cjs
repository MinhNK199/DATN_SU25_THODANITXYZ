const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BANK_LOGO_DIR = path.join(__dirname, 'public/images/banks');

async function downloadBankLogos() {
  if (!fs.existsSync(BANK_LOGO_DIR)) {
    fs.mkdirSync(BANK_LOGO_DIR, { recursive: true });
  }
  const { data } = await axios.get('https://api.vietqr.io/v2/banks');
  for (const bank of data.data) {
    const logoUrl = bank.logo;
    const fileName = `${bank.code.toLowerCase()}.png`;
    const filePath = path.join(BANK_LOGO_DIR, fileName);
    try {
      const response = await axios.get(logoUrl, { responseType: 'arraybuffer' });
      fs.writeFileSync(filePath, response.data);
      console.log(`Downloaded: ${fileName}`);
    } catch (err) {
      console.error(`Failed: ${fileName} - ${logoUrl}`);
    }
  }
  console.log('Done!');
}

downloadBankLogos(); 