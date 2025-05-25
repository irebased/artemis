import { useState } from 'react';
import Modal from '@/components/Modal';
import InformationModal from '@/components/InformationModal';

interface WidgetWithSettingsProps {
  title: string;
  settingsComponent: React.ReactNode;
  children: React.ReactNode;
  setAnyModalOpen?: (open: boolean) => void;
  infoContent?: React.ReactNode;
}

export default function WidgetWithSettings({
  title,
  settingsComponent,
  children,
  setAnyModalOpen,
  infoContent,
}: WidgetWithSettingsProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handleOpen = () => {
    setShowSettings(true);
    setAnyModalOpen && setAnyModalOpen(true);
  };
  const handleClose = () => {
    setShowSettings(false);
    setAnyModalOpen && setAnyModalOpen(false);
  };
  const handleInfoOpen = () => {
    setShowInfo(true);
    setAnyModalOpen && setAnyModalOpen(true);
  };
  const handleInfoClose = () => {
    setShowInfo(false);
    setAnyModalOpen && setAnyModalOpen(false);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-4 flex flex-row items-center justify-between gap-2">
        <div className="flex flex-row items-center gap-2">
          <h3 className="text-lg font-semibold mb-0">{title}</h3>
          {infoContent && (
            <button
              className="widget-settings-btn widget-info-btn draggableCancel flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none w-8 h-8 min-w-[32px] min-h-[32px] rounded-full border-2 border-gray-500 dark:border-gray-400 bg-transparent text-base font-bold"
              aria-label="Info"
              onClick={handleInfoOpen}
              type="button"
              tabIndex={0}
              style={{ padding: 0, margin: 0, lineHeight: 1 }}
            >
              i
            </button>
          )}
        </div>
        <div className="flex flex-row gap-2 items-center">
          <button
            className="widget-settings-btn draggableCancel px-3 py-1 border rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={handleOpen}
            type="button"
          >
            Settings
          </button>
        </div>
      </div>
      <Modal
        isOpen={showSettings}
        onClose={handleClose}
        title={`${title} Settings`}
      >
        {settingsComponent}
      </Modal>
      {infoContent && (
        <InformationModal
          isOpen={showInfo}
          onClose={handleInfoClose}
          title={`${title} Info`}
        >
          {infoContent}
        </InformationModal>
      )}
      <div className="flex-1 w-full h-full relative">
        {children}
      </div>
    </div>
  );
}