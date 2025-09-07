// Utility functions for product and variant validation

export interface ProductVariant {
  id: string
  name: string
  sku: string
  price: number
  salePrice?: number
  stock: number
  color?: { code: string; name: string }
  size?: number
  weight?: number
  images: string[]
  isActive: boolean
  length?: number
  width?: number
  height?: number
  specifications?: { [key: string]: string }
  imageFile?: File | null // <-- Thêm dòng này
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Validate a single variant
 */
export const validateVariant = (variant: ProductVariant, index: number): ValidationResult => {
  const errors: string[] = []

  if (!variant.name?.trim()) {
    errors.push(`Biến thể ${index + 1}: Tên không được để trống`)
  }

  if (!variant.sku?.trim()) {
    errors.push(`Biến thể ${index + 1}: SKU không được để trống`)
  }

  if (!variant.price || variant.price <= 0) {
    errors.push(`Biến thể ${index + 1}: Giá phải lớn hơn 0`)
  }

  if (variant.stock < 0) {
    errors.push(`Biến thể ${index + 1}: Tồn kho không được âm`)
  }

  if (!variant.length || variant.length <= 0) {
    errors.push(`Biến thể ${index + 1}: Chiều dài phải lớn hơn 0`)
  }

  if (!variant.width || variant.width <= 0) {
    errors.push(`Biến thể ${index + 1}: Chiều rộng phải lớn hơn 0`)
  }

  if (!variant.height || variant.height <= 0) {
    errors.push(`Biến thể ${index + 1}: Chiều cao phải lớn hơn 0`)
  }

  // Chỉ kiểm tra imageFile, không kiểm tra images bằng link
  if (!variant.imageFile) {
    errors.push("Phải upload ít nhất 1 ảnh biến thể")
  }

  // Kiểm tra trường images (link ảnh đã upload)
  //  if (!variant.images || variant.images.length === 0 || !variant.images[0]) {
  //   errors.push("Phải upload ít nhất 1 ảnh biến thể")
  //  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate all variants
 */
export function validateAllVariants(variants: any[], isEdit: boolean = false) {
  const errors: string[] = [];
  variants.forEach((variant, idx) => {
    if (!variant.name?.trim()) errors.push(`Biến thể ${idx + 1}: Tên không được để trống`);
    if (!variant.sku?.trim()) errors.push(`Biến thể ${idx + 1}: SKU không được để trống`);
    if (!variant.price || variant.price <= 0) errors.push(`Biến thể ${idx + 1}: Giá phải lớn hơn 0`);
    if (variant.stock < 0) errors.push(`Biến thể ${idx + 1}: Tồn kho không được âm`);
    // Chỉ yêu cầu ảnh khi tạo mới, không yêu cầu khi sửa
    if (!isEdit && (!variant.images || variant.images.length === 0 || !variant.images[0])) {
      errors.push(`Biến thể ${idx + 1}: Phải upload ít nhất 1 ảnh biến thể`);
    }
  });
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Clean color data to ensure it's always a valid object
 */
export const cleanColorData = (colorData: unknown): { code: string; name: string } => {
  console.log("🎨 Cleaning color data:", typeof colorData, colorData)

  // Default color
  const defaultColor = { code: "#000000", name: "Đen" }

  if (!colorData) {
    return defaultColor
  }

  // Nếu đã là object hợp lệ
  if (typeof colorData === "object" && colorData !== null && !Array.isArray(colorData)) {
    if ("code" in colorData && typeof (colorData as any).code === "string") {
      return {
        code: (colorData as any).code,
        name: typeof (colorData as any).name === "string" ? (colorData as any).name : getColorNameByCode((colorData as any).code),
      }
    }
  }

  // Nếu là string
  if (typeof colorData === "string") {
    if (colorData === "[object Object]" || colorData === "undefined" || colorData === "null") {
      return defaultColor
    }

    // Nếu là hex color
    if (colorData.startsWith("#")) {
      return {
        code: colorData,
        name: getColorNameByCode(colorData),
      }
    }
  }

  return defaultColor
}

/**
 * Get color name from hex code
 */
export const getColorNameByCode = (code: string): string => {
  const colorMap: { [key: string]: string } = {
    "#000000": "Đen",
    "#FFFFFF": "Trắng",
    "#FF0000": "Đỏ",
    "#00FF00": "Xanh lá",
    "#0000FF": "Xanh dương",
    "#FFFF00": "Vàng",
    "#FF00FF": "Tím",
    "#00FFFF": "Xanh cyan",
    "#FFA500": "Cam",
    "#800080": "Tím đậm",
    "#FFC0CB": "Hồng",
    "#A52A2A": "Nâu",
    "#808080": "Xám",
    "#C0C0C0": "Bạc",
    "#FFD700": "Vàng kim",
    "#8B4513": "Nâu đậm",
    "#4B0082": "Chàm",
    "#FF1493": "Hồng đậm",
    "#32CD32": "Xanh lime",
    "#87CEEB": "Xanh sky",
  }
  return colorMap[code] || "Màu khác"
}

/**
 * Predefined color options for selection
 */
export const COLOR_OPTIONS = [
  { code: "#000000", name: "Đen" },
  { code: "#FFFFFF", name: "Trắng" },
  { code: "#FF0000", name: "Đỏ" },
  { code: "#00FF00", name: "Xanh lá" },
  { code: "#0000FF", name: "Xanh dương" },
  { code: "#FFFF00", name: "Vàng" },
  { code: "#FF00FF", name: "Tím" },
  { code: "#00FFFF", name: "Xanh cyan" },
  { code: "#FFA500", name: "Cam" },
  { code: "#800080", name: "Tím đậm" },
  { code: "#FFC0CB", name: "Hồng" },
  { code: "#A52A2A", name: "Nâu" },
  { code: "#808080", name: "Xám" },
  { code: "#C0C0C0", name: "Bạc" },
  { code: "#FFD700", name: "Vàng kim" },
  { code: "#8B4513", name: "Nâu đậm" },
  { code: "#4B0082", name: "Chàm" },
  { code: "#FF1493", name: "Hồng đậm" },
  { code: "#32CD32", name: "Xanh lime" },
  { code: "#87CEEB", name: "Xanh sky" },
]

/**
 * Clean and validate product data before sending to API
 */
export const validateAndCleanProductData = (productData: any) => {
  console.log("🧹 Cleaning product data before sending to API...")
  console.log("📥 Raw data:", productData)

  const cleanedData = { ...productData }

  // Validate và clean variants
  if (cleanedData.variants && Array.isArray(cleanedData.variants)) {
    cleanedData.variants = cleanedData.variants.map((variant: any, index: number) => {
      console.log(`🔍 Cleaning variant ${index}:`, variant.name || "unnamed")

      // CRITICAL: Clean color data
      const cleanColor = cleanColorData(variant.color)

      // Validate specifications object
      let cleanSpecs = {}
      if (variant.specifications && typeof variant.specifications === "object" && variant.specifications !== null) {
        cleanSpecs = { ...variant.specifications }
      }

      const cleanedVariant = {
        // Loại bỏ trường id để tránh lỗi ObjectId casting
        name: variant.name || "",
        sku: variant.sku || "",
        price: Number(variant.price) || 0,
        salePrice: variant.salePrice ? Number(variant.salePrice) : undefined,
        stock: Number(variant.stock) || 0,
        color: cleanColor, // ĐẢM BẢO COLOR LÀ OBJECT HỢP LỆ
        specifications: cleanSpecs, // ĐẢM BẢO SPECS LÀ OBJECT HỢP LỆ
        size: Number(variant.size) || 0,
        length: Number(variant.length) || 0,
        width: Number(variant.width) || 0,
        height: Number(variant.height) || 0,
        weight: Number(variant.weight) || 0,
        images: Array.isArray(variant.images) ? variant.images : [],
        isActive: Boolean(variant.isActive),
      }

      console.log(`✅ Cleaned variant ${index}:`, {
        name: cleanedVariant.name,
        color: cleanedVariant.color,
        specifications: cleanedVariant.specifications,
      })

      return cleanedVariant
    })
  }

  console.log("✅ Final cleaned data ready for API:")
  console.log(
    "📤 Cleaned variants:",
    cleanedData.variants?.map((v: any) => ({
      name: v.name,
      color: v.color,
      specifications: v.specifications,
    })),
  )

  return cleanedData
}
