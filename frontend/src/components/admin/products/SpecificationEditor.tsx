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

  console.log("🔍 SpecificationEditor received value:", value);

  // Khởi tạo từ value prop
  React.useEffect(() => {
    console.log("🔍 useEffect triggered:", { value, initialized });
    const entries = Object.entries(value || {})
    console.log("🔍 Entries:", entries);
    if (entries.length > 0) {
      const newSpecs = entries.map(([key, val]) => ({ key, value: val }))
      console.log("🔍 Setting specs from value:", newSpecs);
      setSpecs(newSpecs)
    } else if (specs.length === 0) {
      console.log("🔍 Setting empty specs");
      setSpecs([{ key: "", value: "" }])
    }
    setInitialized(true)
  }, [value, specs.length])

  const updateParent = (newSpecs: { key: string; value: string }[]) => {
    const newSpecsObject = Object.fromEntries(
      newSpecs
        .filter((s) => s.key.trim() && s.value.trim())
        .map((s) => [s.key.trim(), s.value.trim()])
    )
    onChange(newSpecsObject)
  }

  const handleChange = (idx: number, field: "key" | "value", val: string) => {
    const newSpecs = [...specs]
    newSpecs[idx][field] = val
    setSpecs(newSpecs)
    updateParent(newSpecs)
  }

  const handleAdd = () => {
    const newSpecs = [...specs, { key: "", value: "" }]
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