"use client"

// Hook để handle API calls với proper error handling
import { useState } from "react"
import { message } from "antd"
import { validateAndCleanProductData } from "../utils/productValidation"

export const useProductAPI = () => {
  const [loading, setLoading] = useState(false)

  const updateProduct = async (productId: string, productData: any) => {
    setLoading(true)
    try {
      console.log("🚀 Starting product update...")
      console.log("📝 Product ID:", productId)
      console.log("📝 Raw product data:", productData)

      // Clean and validate data
      const cleanedData = validateAndCleanProductData(productData)

      console.log("📤 Sending to API:", cleanedData)

      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update product")
      }

      const result = await response.json()
      console.log("✅ API response:", result)

      message.success("Cập nhật sản phẩm thành công!")
      return result
    } catch (error) {
      console.error("❌ Error updating product:", error)
      message.error(error instanceof Error ? error.message : "Có lỗi xảy ra khi cập nhật sản phẩm")
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createProduct = async (productData: any) => {
    setLoading(true)
    try {
      console.log("🚀 Starting product creation...")
      console.log("📝 Raw product data:", productData)

      // Clean and validate data
      const cleanedData = validateAndCleanProductData(productData)

      console.log("📤 Sending to API:", cleanedData)

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create product")
      }

      const result = await response.json()
      console.log("✅ API response:", result)

      message.success("Tạo sản phẩm thành công!")
      return result
    } catch (error) {
      console.error("❌ Error creating product:", error)
      message.error(error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo sản phẩm")
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    updateProduct,
    createProduct,
    loading,
  }
}
