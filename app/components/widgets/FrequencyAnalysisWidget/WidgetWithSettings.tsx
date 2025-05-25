import { useState } from 'react';
import Modal from '@/components/Modal';

interface WidgetWithSettingsProps {
  title: string;
  settingsComponent: React.ReactNode;
  children: React.ReactNode;
  setAnyModalOpen?: (open: boolean) => void;
}

export default function WidgetWithSettings({
  title,
  settingsComponent,
  children,
  setAnyModalOpen,
}: WidgetWithSettingsProps) {
  const [showSettings, setShowSettings] = useState(false);

  const handleOpen = () => {
    setShowSettings(true);
    setAnyModalOpen && setAnyModalOpen(true);
  };
  const handleClose = () => {
    setShowSettings(false);
    setAnyModalOpen && setAnyModalOpen(false);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-4 flex flex-row items-center justify-between gap-2">
        <h3 className="text-lg font-semibold mb-0">{title}</h3>
        <button
          className="widget-settings-btn px-3 py-1 border rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={handleOpen}
        >
          Settings
        </button>
      </div>
      <Modal
        isOpen={showSettings}
        onClose={handleClose}
        title={`${title} Settings`}
      >
        {settingsComponent}
      </Modal>
      <div className="flex-1 w-full h-full relative">
        {children}
      </div>
    </div>
  );
}