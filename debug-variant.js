const mongoose = require('mongoose');

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/DATN', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    salePrice: Number,
    variants: [{
        _id: mongoose.Schema.Types.ObjectId,
        name: String,
        price: Number,
        salePrice: Number,
        stock: Number,
        color: {
            code: String,
            name: String
        },
        size: Number,
        sku: String,
        specifications: mongoose.Schema.Types.Mixed
    }]
}, { versionKey: false });

const Product = mongoose.model('Product', productSchema);

async function debugVariants() {
    try {
        console.log('🔍 Debugging variants...');

        // Tìm sản phẩm "Test Pro Max 2"
        const product = await Product.findOne({ name: { $regex: /Test Pro Max 2/i } });

        if (!product) {
            console.log('❌ Product not found');
            return;
        }

        console.log('\n📦 Product found:');
        console.log('ID:', product._id);
        console.log('Name:', product.name);
        console.log('Price:', product.price);
        console.log('Variants count:', product.variants?.length || 0);

        if (product.variants && product.variants.length > 0) {
            console.log('\n🎨 Variants:');
            product.variants.forEach((variant, index) => {
                console.log(`${index + 1}. ID: ${variant._id}`);
                console.log(`   Name: ${variant.name}`);
                console.log(`   Price: ${variant.price}`);
                console.log(`   Sale Price: ${variant.salePrice || 'N/A'}`);
                console.log(`   Stock: ${variant.stock}`);
                console.log('   ---');
            });

            // Test tìm variant bằng find()
            const firstVariant = product.variants[0];
            console.log(`\n🧪 Testing find() with variant ID: ${firstVariant._id}`);

            const foundVariant = product.variants.find(v => v._id.toString() === firstVariant._id.toString());
            console.log('Found variant:', foundVariant ? 'YES' : 'NO');

            if (foundVariant) {
                console.log('Variant name:', foundVariant.name);
                console.log('Variant price:', foundVariant.price);
            }
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        mongoose.connection.close();
    }
}

debugVariants();
