const fs = require('fs');
const path = require('path');

// Danh sách tất cả các file cần thay thế
const filesToUpdate = [
  'src/components/admin/variants/VariantAdd.tsx',
  'src/components/admin/variants/VariantDetail.tsx',
  'src/components/admin/coupons/CouponAdd.tsx',
  'src/components/admin/coupons/CouponEdit.tsx',
  'src/components/admin/coupons/CouponList.tsx',
  'src/components/admin/vouchers/VoucherAdd.tsx',
  'src/components/admin/vouchers/VoucherEdit.tsx',
  'src/components/admin/categories/CategoryAdd.tsx',
  'src/components/admin/categories/CategoryEdit.tsx',
  'src/components/admin/categories/CategoryDetail.tsx',
  'src/components/admin/categories/CategoryList.tsx',
  'src/components/admin/Banner/BannerAdd.tsx',
  'src/components/admin/Banner/BannerEdit.tsx',
  'src/components/admin/Banner/BannerList.tsx',
  'src/components/admin/users/userEdit.tsx',
  'src/components/admin/users/userDetail.tsx',
  'src/components/admin/rating/ratinglist.tsx',
  'src/components/admin/activity/activity.tsx',
  'src/components/admin/products/ProductList.tsx',
  'src/components/admin/products/VariantManager.tsx',
  'src/components/admin/products/SpecificationEditor.tsx',
  'src/components/admin/products/api.ts',
  'src/components/admin/vouchers/api.ts'
];

function updateFile(filePath) {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // Thêm import useNotification nếu chưa có và file có message calls
    if (content.includes('message.') && !content.includes('useNotification')) {
      // Tìm vị trí import cuối cùng
      const lines = content.split('\n');
      let lastImportIndex = -1;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import')) {
          lastImportIndex = i;
        }
      }
      
      if (lastImportIndex !== -1) {
        const insertIndex = content.indexOf('\n', content.indexOf(lines[lastImportIndex])) + 1;
        content = content.slice(0, insertIndex) + 
          "import { useNotification } from \"../../hooks/useNotification\";\n" +
          content.slice(insertIndex);
        modified = true;
      }
    }

    // Thay thế message calls
    if (content.includes('message.success')) {
      content = content.replace(/message\.success/g, 'success');
      modified = true;
    }
    if (content.includes('message.error')) {
      content = content.replace(/message\.error/g, 'error');
      modified = true;
    }
    if (content.includes('message.warning')) {
      content = content.replace(/message\.warning/g, 'warning');
      modified = true;
    }
    if (content.includes('message.info')) {
      content = content.replace(/message\.info/g, 'info');
      modified = true;
    }

    // Thêm useNotification hook vào component
    if (modified && content.includes('const ') && content.includes('= () => {')) {
      const componentMatch = content.match(/const\s+(\w+):\s*React\.FC\s*=\s*\(\)\s*=>\s*\{/);
      if (componentMatch) {
        const componentName = componentMatch[1];
        const hookPattern = new RegExp(`const\\s+${componentName}:\\s*React\\.FC\\s*=\\s*\\(\\)\\s*=>\\s*\\{`);
        const match = content.match(hookPattern);
        if (match) {
          const insertPos = match.index + match[0].length;
          const nextLine = content.indexOf('\n', insertPos);
          const insertIndex = nextLine + 1;
          
          if (!content.includes('const { success, error, warning, info } = useNotification()')) {
            content = content.slice(0, insertIndex) + 
              "  const { success, error, warning, info } = useNotification();\n" +
              content.slice(insertIndex);
          }
        }
      }
    }

    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

// Chạy script
console.log('🚀 Starting comprehensive notification replacement...');
filesToUpdate.forEach(updateFile);
console.log('✅ Notification replacement completed!');
