/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import type { DateValue } from "@internationalized/date";

import { FC, ReactNode, useRef, useState, useEffect, useCallback } from "react";
import { Upload, X, FileText, Trash2, FileUp } from "lucide-react";
import { parseDate } from "@internationalized/date";
import {
  Calendar,
  Button,
  Card,
  DateField,
  DatePicker,
  Input,
  Label,
  TextField,
  Tabs,
  Select,
  ListBox,
} from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";

import {
  DocumentUploadFormState,
  BulkFileItem,
  UploadMode,
} from "@/types/document";
import { userService } from "@/services/user.service";

interface User {
  id: number;
  name: string;
  role: string;
}

interface DocumentUploadDialogProps {
  open: boolean;
  title: string;
  description: string;
  badgeClassName: string;
  badgeIcon: ReactNode;
  loading: boolean;
  submitLabel: string;
  form: DocumentUploadFormState;
  bulkFiles: BulkFileItem[];
  uploadMode: UploadMode;
  onClose: () => void;
  onFieldChange: (
    field: keyof Omit<DocumentUploadFormState, "file">,
    value: string | string[],
  ) => void;
  onFileChange: (file: File | null) => void;
  onBulkFileChange: (files: FileList | null) => void;
  onBulkItemChange: (id: string, field: string, value: string) => void;
  onBulkItemRemove: (id: string) => void;
  onModeChange: (mode: UploadMode) => void;
  onSubmit: () => void;
  onBulkSubmit: () => void;
  acceptedFormats?: string;
  acceptedFormatsLabel?: string;
}

const ACCEPTED_FORMATS = ".pdf,.docx,.doc,.jpg,.jpeg,.png";
const DEFAULT_ACCEPTED_FORMATS_LABEL = "PDF, DOCX, DOC, JPG, JPEG, PNG";

const stripFileExtension = (fileName: string) => {
  const baseName = fileName.split(/[\\/]/).pop() || fileName;
  const lastDotIndex = baseName.lastIndexOf(".");

  if (lastDotIndex <= 0) {
    return baseName;
  }

  return baseName.slice(0, lastDotIndex);
};

const toDateValue = (value: string): DateValue | null => {
  if (!value) {
    return null;
  }

  try {
    return parseDate(value);
  } catch {
    return null;
  }
};

export const DocumentUploadDialog: FC<DocumentUploadDialogProps> = ({
  open,
  title,
  description,
  badgeClassName,
  badgeIcon,
  loading,
  submitLabel,
  form,
  bulkFiles,
  uploadMode,
  onClose,
  onFieldChange,
  onFileChange,
  onBulkFileChange,
  onBulkItemChange,
  onBulkItemRemove,
  onModeChange,
  onSubmit,
  onBulkSubmit,
  acceptedFormats = ACCEPTED_FORMATS,
  acceptedFormatsLabel = DEFAULT_ACCEPTED_FORMATS_LABEL,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const bulkDropZoneRef = useRef<HTMLDivElement>(null);
  const [bulkSenderTemplate, setBulkSenderTemplate] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isBulkDragging, setIsBulkDragging] = useState(false);

  useEffect(() => {
    if (open) {
      userService
        .getAll()
        .then((data) => setUsers(data.filter((u: User) => u.role === "staff")));
    }
  }, [open]);

  const canSubmitSingle =
    Boolean(form.title.trim()) &&
    Boolean(form.documentDate) &&
    Boolean(form.sender.trim()) &&
    Boolean(form.file) &&
    !loading;

  const canSubmitBulk =
    bulkFiles.length > 0 && bulkFiles.every((f) => f.isValid) && !loading;

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleBulkPickFile = () => {
    bulkFileInputRef.current?.click();
  };

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;

    if (selectedFile) {
      onFieldChange("title", stripFileExtension(selectedFile.name));
    }

    onFileChange(selectedFile);
  };

  const handleBulkFileSelection = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    onBulkFileChange(event.target.files);
    event.target.value = "";
  };

  const handleApplySenderToAll = () => {
    const sender = bulkSenderTemplate.trim();

    if (!sender || bulkFiles.length === 0) {
      return;
    }

    bulkFiles.forEach((item) => {
      onBulkItemChange(item.id, "sender", sender);
    });
  };

  // Drag & Drop handlers for Single mode
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0] ?? null;
      if (file) {
        onFieldChange("title", stripFileExtension(file.name));
        onFileChange(file);
      }
    },
    [onFieldChange, onFileChange],
  );

  // Drag & Drop handlers for Bulk mode
  const handleBulkDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleBulkDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBulkDragging(true);
  }, []);

  const handleBulkDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (bulkDropZoneRef.current && !bulkDropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsBulkDragging(false);
    }
  }, []);

  const handleBulkDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsBulkDragging(false);
      if (e.dataTransfer.files?.length) {
        onBulkFileChange(e.dataTransfer.files);
      }
    },
    [onBulkFileChange],
  );

  if (!open) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 sm:p-4 backdrop-blur-sm"
      role="dialog"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-3xl border-none bg-content1 shadow-2xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto rounded-none sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <Card.Header className="flex items-start justify-between gap-4 px-6 pt-6 pb-2">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl ${badgeClassName}`}
            >
              {badgeIcon}
            </div>
            <div>
              <Card.Title className="text-lg font-bold text-foreground">
                {title}
              </Card.Title>
              <Card.Description className="mt-1 text-xs text-default-500">
                {description}
              </Card.Description>
            </div>
          </div>
          <Button
            isIconOnly
            aria-label="Close upload dialog"
            size="sm"
            variant="ghost"
            onClick={onClose}
          >
            <X size={18} />
          </Button>
        </Card.Header>

        <Card.Content className="space-y-4 px-6 pb-6 pt-3">
          {/* Mode Toggle */}
          <Tabs
            className="w-full flex flex-col gap-4 lg:flex-row lg:items-start"
            orientation="vertical"
            selectedKey={uploadMode}
            variant="secondary"
            onSelectionChange={(key) => onModeChange(key as UploadMode)}
          >
            <Tabs.ListContainer className="w-full lg:w-44 shrink-0">
              <Tabs.List aria-label="Upload mode" className="w-full">
                <Tabs.Tab className="justify-between" id="single">
                  Single Upload
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab className="justify-between" id="bulk">
                  Bulk Upload
                  <Tabs.Indicator />
                </Tabs.Tab>
              </Tabs.List>
            </Tabs.ListContainer>

            <Tabs.Panel className="flex-1 space-y-4" id="single">
              <div className="space-y-4">
                <TextField className="md:col-span-2" name="title">
                  <Label className="text-xs font-bold text-foreground">
                    Nama Surat
                  </Label>
                  <Input
                    placeholder="Contoh: Surat Undangan Rapat"
                    value={form.title}
                    onChange={(event) =>
                      onFieldChange("title", event.target.value)
                    }
                  />
                </TextField>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <DatePicker
                      isRequired
                      className="w-full"
                      value={toDateValue(form.documentDate)}
                      onChange={(date) =>
                        onFieldChange(
                          "documentDate",
                          date ? date.toString() : "",
                        )
                      }
                    >
                      <Label className="text-xs font-bold text-foreground">
                        Tanggal
                      </Label>
                      <DateField.Group fullWidth>
                        <DateField.Input>
                          {(segment) => <DateField.Segment segment={segment} />}
                        </DateField.Input>
                        <DateField.Suffix>
                          <DatePicker.Trigger>
                            <DatePicker.TriggerIndicator />
                          </DatePicker.Trigger>
                        </DateField.Suffix>
                      </DateField.Group>
                      <DatePicker.Popover>
                        <Calendar aria-label="Pilih tanggal">
                          <Calendar.Header>
                            <Calendar.YearPickerTrigger>
                              <Calendar.YearPickerTriggerHeading />
                              <Calendar.YearPickerTriggerIndicator />
                            </Calendar.YearPickerTrigger>
                            <Calendar.NavButton slot="previous" />
                            <Calendar.NavButton slot="next" />
                          </Calendar.Header>
                          <Calendar.Grid>
                            <Calendar.GridHeader>
                              {(day) => (
                                <Calendar.HeaderCell>{day}</Calendar.HeaderCell>
                              )}
                            </Calendar.GridHeader>
                            <Calendar.GridBody>
                              {(date) => <Calendar.Cell date={date} />}
                            </Calendar.GridBody>
                          </Calendar.Grid>
                          <Calendar.YearPickerGrid>
                            <Calendar.YearPickerGridBody>
                              {({ year }) => (
                                <Calendar.YearPickerCell year={year} />
                              )}
                            </Calendar.YearPickerGridBody>
                          </Calendar.YearPickerGrid>
                        </Calendar>
                      </DatePicker.Popover>
                    </DatePicker>
                  </div>

                  <TextField name="sender">
                    <Label className="text-xs font-bold text-foreground">
                      Pengirim
                    </Label>
                    <Input
                      placeholder="Contoh: PT Maju Bersama"
                      value={form.sender}
                      onChange={(event) =>
                        onFieldChange("sender", event.target.value)
                      }
                    />
                  </TextField>
                </div>

                <TextField name="approver">
                  <Label className="text-xs font-bold text-foreground">
                    Pilih Approver
                  </Label>
                  <Select
                    key={`single-${open}`}
                    placeholder="Pilih user untuk approve"
                    selectionMode="multiple"
                    onChange={(value: any) => {
                      if (Array.isArray(value)) {
                        onFieldChange("approverIds", value.map(String));
                      }
                    }}
                  >
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox selectionMode="multiple">
                        {users.map((user) => (
                          <ListBox.Item
                            key={String(user.id)}
                            id={String(user.id)}
                            textValue={user.name}
                          >
                            {user.name}
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </TextField>

                {/* Drag & Drop Zone for Single */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground">
                    Upload File
                  </Label>
                  <input
                    ref={fileInputRef}
                    accept={acceptedFormats}
                    className="hidden"
                    type="file"
                    onChange={handleFileSelection}
                  />
                  <div
                    ref={dropZoneRef}
                    className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 transition-all duration-200 cursor-pointer ${
                      isDragging
                        ? "border-primary bg-primary/5 scale-[1.02]"
                        : form.file
                          ? "border-success/40 bg-success/5"
                          : "border-divider bg-default-50/70 hover:border-primary/40 hover:bg-primary/5"
                    }`}
                    onClick={handlePickFile}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <AnimatePresence mode="wait">
                      {isDragging ? (
                        <motion.div
                          key="dragging"
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center gap-2"
                          exit={{ opacity: 0, scale: 0.9 }}
                          initial={{ opacity: 0, scale: 0.9 }}
                        >
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <FileUp
                              className="text-primary"
                              size={24}
                            />
                          </div>
                          <p className="text-sm font-bold text-primary">
                            Drop file here
                          </p>
                        </motion.div>
                      ) : form.file ? (
                        <motion.div
                          key="selected"
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center gap-2"
                          exit={{ opacity: 0, scale: 0.9 }}
                          initial={{ opacity: 0, scale: 0.9 }}
                        >
                          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                            <FileText
                              className="text-success"
                              size={24}
                            />
                          </div>
                          <p className="text-sm font-semibold text-foreground truncate max-w-[260px]">
                            {form.file.name}
                          </p>
                          <p className="text-[11px] text-default-400">
                            {(form.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-[10px] font-semibold text-default-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                onFileChange(null);
                                onFieldChange("title", "");
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="empty"
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center gap-2"
                          exit={{ opacity: 0, scale: 0.9 }}
                          initial={{ opacity: 0, scale: 0.9 }}
                        >
                          <div className="w-12 h-12 rounded-full bg-default-100 flex items-center justify-center">
                            <Upload
                              className="text-default-400"
                              size={22}
                            />
                          </div>
                          <p className="text-sm font-semibold text-foreground">
                            Drop file here or click to browse
                          </p>
                          <p className="text-xs text-default-400">
                            Accepted: {acceptedFormatsLabel}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </Tabs.Panel>

            <Tabs.Panel className="flex-1 space-y-4" id="bulk">
              <TextField name="approver">
                <Label className="text-xs font-bold text-foreground">
                  Pilih Approver
                </Label>
                <Select
                  key={`bulk-${open}`}
                  placeholder="Pilih user untuk approve"
                  selectionMode="multiple"
                  onChange={(value: any) => {
                    if (Array.isArray(value)) {
                      onFieldChange("approverIds", value.map(String));
                    }
                  }}
                >
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox selectionMode="multiple">
                      {users.map((user) => (
                        <ListBox.Item
                          key={String(user.id)}
                          id={String(user.id)}
                          textValue={user.name}
                        >
                          {user.name}
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </TextField>

              {/* Drag & Drop Zone for Bulk */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">
                  Upload Multiple Files
                </Label>
                <input
                  ref={bulkFileInputRef}
                  multiple
                  accept={acceptedFormats}
                  className="hidden"
                  type="file"
                  onChange={handleBulkFileSelection}
                />
                <div
                  ref={bulkDropZoneRef}
                  className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 transition-all duration-200 cursor-pointer ${
                    isBulkDragging
                      ? "border-primary bg-primary/5 scale-[1.02]"
                      : bulkFiles.length > 0
                        ? "border-success/40 bg-success/5"
                        : "border-divider bg-default-50/70 hover:border-primary/40 hover:bg-primary/5"
                  }`}
                  onClick={handleBulkPickFile}
                  onDragEnter={handleBulkDragEnter}
                  onDragLeave={handleBulkDragLeave}
                  onDragOver={handleBulkDragOver}
                  onDrop={handleBulkDrop}
                >
                  <AnimatePresence mode="wait">
                    {isBulkDragging ? (
                      <motion.div
                        key="bulk-dragging"
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-1"
                        exit={{ opacity: 0, scale: 0.9 }}
                        initial={{ opacity: 0, scale: 0.9 }}
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <FileUp className="text-primary" size={20} />
                        </div>
                        <p className="text-sm font-bold text-primary">
                          Drop files here
                        </p>
                        <p className="text-xs text-default-400">
                          Drop multiple files at once
                        </p>
                      </motion.div>
                    ) : bulkFiles.length > 0 ? (
                      <motion.div
                        key="bulk-selected"
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-1"
                        exit={{ opacity: 0, scale: 0.9 }}
                        initial={{ opacity: 0, scale: 0.9 }}
                      >
                        <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                          <FileText className="text-success" size={20} />
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          {bulkFiles.length} files selected
                        </p>
                        <p className="text-xs text-default-400">
                          Click or drag more to add
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="bulk-empty"
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-1"
                        exit={{ opacity: 0, scale: 0.9 }}
                        initial={{ opacity: 0, scale: 0.9 }}
                      >
                        <div className="w-10 h-10 rounded-full bg-default-100 flex items-center justify-center">
                          <Upload className="text-default-400" size={20} />
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          Drop files or click to browse
                        </p>
                        <p className="text-xs text-default-400">
                          Accepted: {acceptedFormatsLabel}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="space-y-1.5 rounded-2xl border border-divider bg-default-50/70 p-4">
                <Label className="text-xs font-bold text-foreground">
                  Sender template
                </Label>
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <Input
                    className="flex-1"
                    placeholder="Apply one sender to all files"
                    value={bulkSenderTemplate}
                    onChange={(event) =>
                      setBulkSenderTemplate(event.target.value)
                    }
                  />
                  <Button
                    className="shrink-0 font-semibold"
                    isDisabled={
                      !bulkSenderTemplate.trim() || bulkFiles.length === 0
                    }
                    variant="secondary"
                    onClick={handleApplySenderToAll}
                  >
                    Apply sender to all
                  </Button>
                </div>
                <p className="text-xs text-default-500">
                  Use this when most files share the same sender. You can still
                  edit each file afterward.
                </p>
              </div>

              {bulkFiles.length > 0 && (
                <div className="max-h-80 space-y-3 overflow-y-auto rounded-2xl border border-divider bg-default-50/70 p-4">
                  <div className="mb-2 text-xs font-bold text-foreground">
                    Files to Upload ({bulkFiles.length})
                  </div>
                  {bulkFiles.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 rounded-xl border border-divider bg-content1 p-3"
                    >
                      <FileText
                        className="mt-1 shrink-0 text-primary"
                        size={18}
                      />
                      <div className="min-w-0 flex-1 space-y-2">
                        <p className="truncate text-xs font-semibold">
                          {item.file.name}
                        </p>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                          <Input
                            placeholder="Title"
                            value={item.title}
                            onChange={(e) =>
                              onBulkItemChange(item.id, "title", e.target.value)
                            }
                          />
                          <Input
                            placeholder="Sender"
                            value={item.sender}
                            onChange={(e) =>
                              onBulkItemChange(
                                item.id,
                                "sender",
                                e.target.value,
                              )
                            }
                          />
                          <DatePicker
                            className="w-full"
                            value={toDateValue(item.documentDate)}
                            onChange={(date) =>
                              onBulkItemChange(
                                item.id,
                                "documentDate",
                                date ? date.toString() : "",
                              )
                            }
                          >
                            <DateField.Group fullWidth>
                              <DateField.Input>
                                {(segment) => (
                                  <DateField.Segment segment={segment} />
                                )}
                              </DateField.Input>
                              <DateField.Suffix>
                                <DatePicker.Trigger>
                                  <DatePicker.TriggerIndicator />
                                </DatePicker.Trigger>
                              </DateField.Suffix>
                            </DateField.Group>
                          </DatePicker>
                        </div>
                        {!item.isValid && (
                          <p className="text-xs text-danger">
                            Sender and date are required
                          </p>
                        )}
                      </div>
                      <Button
                        isIconOnly
                        className="text-danger"
                        size="sm"
                        variant="ghost"
                        onClick={() => onBulkItemRemove(item.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Tabs.Panel>
          </Tabs>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onClose} isDisabled={loading}>
              Cancel
            </Button>
            {uploadMode === "single" ? (
              <Button
                className="font-semibold"
                isDisabled={!canSubmitSingle}
                variant="primary"
                onClick={onSubmit}
              >
                {loading ? "Uploading..." : submitLabel}
              </Button>
            ) : (
              <Button
                className="font-semibold"
                isDisabled={!canSubmitBulk}
                variant="primary"
                onClick={onBulkSubmit}
              >
                {loading ? "Uploading..." : `Upload All (${bulkFiles.filter((f) => f.isValid).length})`}
              </Button>
            )}
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};