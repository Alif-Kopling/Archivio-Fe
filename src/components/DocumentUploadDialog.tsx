/* eslint-disable jsx-a11y/click-events-have-key-events */
import type { DateValue } from "@internationalized/date";

import { FC, ReactNode, ChangeEvent, useRef } from "react";
import { Upload, X } from "lucide-react";
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
} from "@heroui/react";

export interface DocumentUploadFormState {
  title: string;
  documentDate: string;
  sender: string;
  file: File | null;
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
  onClose: () => void;
  onFieldChange: (
    field: keyof Omit<DocumentUploadFormState, "file">,
    value: string,
  ) => void;
  onFileChange: (file: File | null) => void;
  onSubmit: () => void;
}

const ACCEPTED_FORMATS = ".pdf,.docx,.doc";

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
  onClose,
  onFieldChange,
  onFileChange,
  onSubmit,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) {
    return null;
  }

  const canSubmit =
    Boolean(form.title.trim()) &&
    Boolean(form.documentDate) &&
    Boolean(form.sender.trim()) &&
    Boolean(form.file) &&
    !loading;

  const fileName = form.file?.name ?? "No file selected";

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;

    if (selectedFile) {
      onFieldChange("title", stripFileExtension(selectedFile.name));
    }

    onFileChange(selectedFile);
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
      role="dialog"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-2xl border-none bg-content1 shadow-2xl"
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextField className="md:col-span-2" name="title">
              <Label className="text-xs font-bold text-foreground">
                Nama Surat
              </Label>
              <Input
                placeholder="Contoh: Surat Undangan Rapat"
                value={form.title}
                onChange={(event) => onFieldChange("title", event.target.value)}
              />
            </TextField>

            <div className="space-y-1.5">
              <DatePicker
                isRequired
                className="w-full"
                value={toDateValue(form.documentDate)}
                onChange={(date) =>
                  onFieldChange("documentDate", date ? date.toString() : "")
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
                        {({ year }) => <Calendar.YearPickerCell year={year} />}
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

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">
              Upload File
            </Label>
            <input
              ref={fileInputRef}
              accept={ACCEPTED_FORMATS}
              className="hidden"
              type="file"
              onChange={handleFileSelection}
            />
            <div className="flex flex-col gap-3 rounded-2xl border border-divider bg-default-50/70 p-4 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  Pilih file dokumen
                </p>
                <p className="text-xs text-default-500">
                  Format yang diterima: PDF, DOCX, atau DOC.
                </p>
                <p className="mt-2 truncate text-xs text-default-400">
                  {fileName}
                </p>
              </div>
              <Button
                className="shrink-0 font-semibold"
                variant="outline"
                onClick={handlePickFile}
              >
                <Upload size={16} />
                Choose File
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="font-semibold"
              isDisabled={!canSubmit}
              variant="primary"
              onClick={onSubmit}
            >
              {submitLabel}
            </Button>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};
