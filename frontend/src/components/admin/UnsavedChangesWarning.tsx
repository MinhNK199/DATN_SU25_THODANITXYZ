import React from 'react';
import { Modal, Button, Space } from 'antd';
import { ExclamationCircleOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import '../../styles/unsaved-changes-modal.css';

interface UnsavedChangesWarningProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onSave?: () => void;
  onDiscard?: () => void;
  title?: string;
  content?: string;
  showSaveOption?: boolean;
}

const UnsavedChangesWarning: React.FC<UnsavedChangesWarningProps> = ({
  visible,
  onConfirm,
  onCancel,
  onSave,
  onDiscard,
  title = 'Có thay đổi chưa được lưu',
  content = 'Bạn có thay đổi chưa được lưu. Bạn có muốn lưu trước khi rời khỏi trang không?',
  showSaveOption = true
}) => {
  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <ExclamationCircleOutlined className="text-orange-500 text-xl" />
          <span className="text-lg font-semibold text-gray-800">{title}</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={480}
      centered
      className="unsaved-changes-modal"
    >
      <div className="py-4">
        <p className="text-gray-600 text-base leading-relaxed mb-6">
          {content}
        </p>
        
        <div className="info-box">
          <div className="flex items-start gap-3">
            <div className="info-icon"></div>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Lưu ý:</p>
              <p>Dữ liệu của bạn đã được tự động lưu tạm thời. Nếu bạn rời khỏi trang mà không lưu, dữ liệu sẽ được khôi phục khi bạn quay lại.</p>
            </div>
          </div>
        </div>

        <Space className="w-full justify-end" size="middle">
          <Button 
            onClick={onCancel}
            icon={<CloseOutlined />}
            size="large"
            className="px-6"
          >
            Ở lại trang
          </Button>
          
          {showSaveOption && onSave && (
            <Button 
              onClick={onSave}
              icon={<SaveOutlined />}
              type="primary"
              size="large"
              className="px-6 bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
            >
              Lưu và rời khỏi
            </Button>
          )}
          
          {onDiscard && (
            <Button 
              onClick={onDiscard}
              type="default"
              size="large"
              className="px-6 text-gray-600 hover:text-gray-800"
            >
              Hủy thay đổi
            </Button>
          )}
          
          <Button 
            onClick={onConfirm}
            danger
            size="large"
            className="px-6"
          >
            Rời khỏi trang
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default UnsavedChangesWarning;
