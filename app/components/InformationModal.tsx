import Modal from '@/components/Modal';
import React from 'react';

interface InformationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function InformationModal({ isOpen, onClose, title = 'Information', children }: InformationModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="prose dark:prose-invert max-w-none">
        {children}
      </div>
    </Modal>
  );
}