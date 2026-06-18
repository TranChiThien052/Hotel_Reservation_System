import { useState } from 'react';
import { FormModalModes, type FormModalMode } from '@/shared/types/type-form-mode';

export const useFormModal = <T>() => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<FormModalMode>(FormModalModes.CREATE);
  const [selectedRecord, setSelectedRecord] = useState<T | null>(null);

  const openCreate = () => {
    setMode(FormModalModes.CREATE);
    setSelectedRecord(null);
    setOpen(true);
  };

  const openView = (item: T) => {
    setMode(FormModalModes.VIEW);
    setSelectedRecord(item);
    setOpen(true);
  };

  const openEdit = (item: T) => {
    setMode(FormModalModes.UPDATE);
    setSelectedRecord(item);
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
  };

  return {
    open,
    mode,
    selectedRecord,

    openCreate,
    openView,
    openEdit,
    close,

    setSelectedRecord,
  };
};