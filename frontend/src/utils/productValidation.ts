// Utility để validate và clean product data trước khi gửi API
export const validateAndCleanProductData = (productData: any) => {
  console.log("🧹 Cleaning product data before sending to API...")
  console.log("📥 Raw data:", productData)

  const cleanedData = { ...productData }

  // Validate và clean variants
  if (cleanedData.variants && Array.isArray(cleanedData.variants)) {
    cleanedData.variants = cleanedData.variants.map((variant: any, index: number) => {
      console.log(`🔍 Cleaning variant ${index}:`, variant.name || "unnamed")
      console.log(`📥 Raw variant ${index}:`, variant)

      // Validate color object - ĐÂY LÀ PHẦN QUAN TRỌNG NHẤT
      let cleanColor = { code: "#000000", name: "" }
      if (variant.color) {
        console.log(`🎨 Processing color for variant ${index}:`, typeof variant.color, variant.color)

        if (typeof variant.color === "object" && variant.color !== null && !Array.isArray(variant.color)) {
          // Nếu là object hợp lệ
          cleanColor = {
            code:
              typeof variant.color.code === "string" && variant.color.code !== "[object Object]"
                ? variant.color.code
                : "#000000",
            name: typeof variant.color.name === "string" ? variant.color.name : "",
          }
          console.log(`✅ Color processed as object:`, cleanColor)
        } else if (typeof variant.color === "string") {
          // Nếu là string
          if (variant.color === "[object Object]" || variant.color === "undefined" || variant.color === "null") {
            console.log(`⚠️ Invalid color string detected: ${variant.color}`)
            cleanColor = { code: "#000000", name: "" }
          } else if (variant.color.startsWith("#") || variant.color.startsWith("rgb")) {
            // Nếu là hex color hoặc rgb hợp lệ
            cleanColor = { code: variant.color, name: "" }
            console.log(`✅ Color processed as valid string:`, cleanColor)
          } else {
            console.log(`⚠️ Unknown color string format: ${variant.color}`)
            cleanColor = { code: "#000000", name: "" }
          }
        } else {
          console.log(`⚠️ Invalid color type: ${typeof variant.color}`)
          cleanColor = { code: "#000000", name: "" }
        }
      }

      // Validate specifications object
      let cleanSpecs = {}
      if (variant.specifications && typeof variant.specifications === "object" && variant.specifications !== null) {
        cleanSpecs = { ...variant.specifications }
        console.log(`✅ Specs processed:`, cleanSpecs)
      } else {
        console.log(`⚠️ Invalid specs, using empty object`)
      }

      const cleanedVariant = {
        _id: variant._id,
        id: variant.id,
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

  // Validate main specifications
  if (
    cleanedData.specifications &&
    typeof cleanedData.specifications === "object" &&
    cleanedData.specifications !== null
  ) {
    cleanedData.specifications = { ...cleanedData.specifications }
  } else {
    cleanedData.specifications = {}
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
  console.log("📤 Cleaned main specs:", cleanedData.specifications)

  return cleanedData
}
