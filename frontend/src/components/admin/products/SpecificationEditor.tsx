"use client"

import React from "react"
import { Button, Input, Row, Col, message } from "antd"
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons"

interface SpecificationEditorProps {
  value: Record<string, string>
  onChange: (specs: Record<string, string>) => void
}

const SpecificationEditor: React.FC<SpecificationEditorProps> = ({ value = {}, onChange }) => {
  const [specs, setSpecs] = React.useState<{ key: string; value: string }[]>([])
  const [initialized, setInitialized] = React.useState(false)
  const isUpdatingFromParent = React.useRef(false)

  console.log("🔍 SpecificationEditor received value:", value);

  // Khởi tạo từ value prop
  React.useEffect(() => {
    if (!initialized) {
      console.log("🔍 useEffect triggered:", { value, initialized });
      const entries = Object.entries(value || {})
      console.log("🔍 Entries:", entries);
      if (entries.length > 0) {
        const newSpecs = entries.map(([key, val]) => ({ key, value: val }))
        console.log("🔍 Setting specs from value:", newSpecs);
        setSpecs(newSpecs)
      } else {
        console.log("🔍 Setting empty specs");
        setSpecs([{ key: "", value: "" }])
      }
      setInitialized(true)
    }
  }, [initialized])

  // Cập nhật specs khi value prop thay đổi từ bên ngoài
  React.useEffect(() => {
    console.log("🔍 useEffect for value change triggered:", { 
      initialized, 
      isUpdatingFromParent: isUpdatingFromParent.current, 
      value 
    });
    if (initialized && !isUpdatingFromParent.current) {
      console.log("🔍 value prop changed, updating specs:", value);
      const entries = Object.entries(value || {})
      const newSpecs = entries.length > 0 
        ? entries.map(([key, val]) => ({ key, value: val }))
        : [{ key: "", value: "" }]
      console.log("🔍 setting newSpecs from value:", newSpecs);
      setSpecs(newSpecs)
    } else {
      console.log("🔍 Skipping update because:", { 
        initialized, 
        isUpdatingFromParent: isUpdatingFromParent.current 
      });
    }
  }, [value, initialized])

  // Thêm useEffect để reset flag sau khi render
  React.useEffect(() => {
    if (isUpdatingFromParent.current) {
      console.log("🔍 Resetting isUpdatingFromParent after render");
      isUpdatingFromParent.current = false
    }
  })

  const updateParent = (newSpecs: { key: string; value: string }[]) => {
    console.log("🔍 updateParent called with:", newSpecs);
    // Chỉ gửi những specs có cả key và value không rỗng
    const validSpecs = newSpecs.filter((s) => s.key.trim() && s.value.trim())
    const newSpecsObject = Object.fromEntries(
      validSpecs.map((s) => [s.key.trim(), s.value.trim()])
    )
    console.log("🔍 newSpecsObject to parent:", newSpecsObject);
    console.log("🔍 isUpdatingFromParent before:", isUpdatingFromParent.current);
    
    // Đánh dấu rằng đang cập nhật từ parent để tránh vòng lặp
    isUpdatingFromParent.current = true
    console.log("🔍 isUpdatingFromParent after setting true:", isUpdatingFromParent.current);
    onChange(newSpecsObject)
  }

  const handleChange = (idx: number, field: "key" | "value", val: string) => {
    console.log("🔍 handleChange called:", { idx, field, val, currentSpecs: specs });
    const newSpecs = [...specs]
    newSpecs[idx][field] = val
    console.log("🔍 newSpecs after change:", newSpecs);
    setSpecs(newSpecs)
    updateParent(newSpecs)
  }

  const handleAdd = () => {
    console.log("🔍 handleAdd called, current specs:", specs);
    const newSpecs = [...specs, { key: "", value: "" }]
    console.log("🔍 newSpecs after add:", newSpecs);
    setSpecs(newSpecs)
    updateParent(newSpecs)
  }

  const handleRemove = (idx: number) => {
    if (specs.length <= 1) {
      const newSpecs = [{ key: "", value: "" }]
      setSpecs(newSpecs)
      updateParent(newSpecs)
    } else {
      const newSpecs = specs.filter((_, i) => i !== idx)
      setSpecs(newSpecs)
      updateParent(newSpecs)
    }
  }

  const validateKey = (key: string, idx: number) => {
    if (!key.trim()) return true
    const duplicateIndex = specs.findIndex((s, i) => s.key.trim() === key.trim() && i !== idx)
    if (duplicateIndex !== -1) {
      message.error("Tên thông số bị trùng!")
      return false
    }
    return true
  }

  console.log("🔍 Rendering with specs:", specs);
  
  return (
    <div style={{ marginTop: 8 }}>
      {specs.map((spec, idx) => (
        <Row gutter={8} key={idx} align="middle" className="mb-2">
          <Col span={10}>
            <Input
              placeholder="Tên thông số (VD: RAM, CPU)"
              value={spec.key}
              onChange={(e) => handleChange(idx, "key", e.target.value)}
              onBlur={(e) => validateKey(e.target.value, idx)}
            />
          </Col>
          <Col span={12}>
            <Input
              placeholder="Giá trị (VD: 8GB, Intel i7)"
              value={spec.value}
              onChange={(e) => handleChange(idx, "value", e.target.value)}
            />
          </Col>
          <Col span={2}>
            <Button
              icon={<DeleteOutlined />}
              danger
              size="small"
              onClick={() => handleRemove(idx)}
              title="Xóa thông số này"
            />
          </Col>
        </Row>
      ))}

      <Button icon={<PlusOutlined />} onClick={handleAdd} type="dashed" block size="small" style={{ marginTop: 8 }}>
        Thêm thông số kỹ thuật
      </Button>

      {specs.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
          Đã có {specs.filter((s) => s.key.trim() && s.value.trim()).length} thông số
        </div>
      )}
    </div>
  )
}

export default SpecificationEditor