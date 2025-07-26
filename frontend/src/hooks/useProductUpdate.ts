// Hook để handle product update với validation
import { validateVariantData } from "../utils/validateVariantData"

export const useProductUpdate = () => {
  const updateProduct = async (productId: string, productData: any) => {
    try {
      // Validate variants trước khi gửi
      if (productData.variants && Array.isArray(productData.variants)) {
        productData.variants = validateVariantData(productData.variants)

        // Log để debug
        console.log("Validated variants before sending:", productData.variants)
      }

      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        throw new Error("Failed to update product")
      }

      return await response.json()
    } catch (error) {
      console.error("Error updating product:", error)
      throw error
    }
  }

  return { updateProduct }
}
