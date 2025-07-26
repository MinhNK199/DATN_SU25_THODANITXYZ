"use client"

import type React from "react"
import { Select, Space } from "antd"

const { Option } = Select

// Định nghĩa các màu sẵn có
const PREDEFINED_COLORS = [
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

interface ColorSelectorProps {
  value?: { code: string; name: string }
  onChange: (color: { code: string; name: string }) => void
  placeholder?: string
}

const ColorSelector: React.FC<ColorSelectorProps> = ({
  value = { code: "#000000", name: "Đen" },
  onChange,
  placeholder = "Chọn màu",
}) => {
  const handleChange = (selectedValue: string) => {
    const selectedColor = PREDEFINED_COLORS.find((color) => color.code === selectedValue)
    if (selectedColor) {
      console.log("🎨 Color selected:", selectedColor)
      onChange(selectedColor)
    }
  }

  return (
    <Select
      value={value?.code}
      onChange={handleChange}
      placeholder={placeholder}
      style={{ width: "100%" }}
      optionLabelProp="label"
    >
      {PREDEFINED_COLORS.map((color) => (
        <Option
          key={color.code}
          value={color.code}
          label={
            <Space>
              <div
                style={{
                  width: 16,
                  height: 16,
                  backgroundColor: color.code,
                  border: "1px solid #d9d9d9",
                  borderRadius: 2,
                  display: "inline-block",
                }}
              />
              {color.name}
            </Space>
          }
        >
          <Space>
            <div
              style={{
                width: 20,
                height: 20,
                backgroundColor: color.code,
                border: "1px solid #d9d9d9",
                borderRadius: 4,
              }}
            />
            <span>{color.name}</span>
            <span style={{ color: "#999", fontSize: "12px" }}>({color.code})</span>
          </Space>
        </Option>
      ))}
    </Select>
  )
}

export default ColorSelector
