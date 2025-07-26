// Tạo utility function để validate variant data trước khi gửi API
export const validateVariantData = (variants: any[]) => {
  return variants.map((variant) => {
    // Đảm bảo color luôn là object hợp lệ
    const validatedColor =
      variant.color && typeof variant.color === "object"
        ? {
            code: typeof variant.color.code === "string" ? variant.color.code : "#000000",
            name: typeof variant.color.name === "string" ? variant.color.name : "",
          }
        : { code: "#000000", name: "" }

    // Đảm bảo specifications luôn là object hợp lệ
    const validatedSpecs =
      variant.specifications && typeof variant.specifications === "object" ? { ...variant.specifications } : {}

    return {
      ...variant,
      color: validatedColor,
      specifications: validatedSpecs,
      // Đảm bảo các số được convert đúng
      price: Number(variant.price) || 0,
      salePrice: variant.salePrice ? Number(variant.salePrice) : undefined,
      stock: Number(variant.stock) || 0,
      size: Number(variant.size) || 0,
      length: Number(variant.length) || 0,
      width: Number(variant.width) || 0,
      height: Number(variant.height) || 0,
      weight: Number(variant.weight) || 0,
    }
  })
}
