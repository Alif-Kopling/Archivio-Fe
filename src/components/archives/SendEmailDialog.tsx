import { Button, Card, Input } from "@heroui/react";
import { FC } from "react";

export interface EmailFormState {
  to: string;
  subject: string;
  message: string;
}

interface SendEmailDialogProps {
  document: { title: string } | null;
  form: EmailFormState;
  sending: boolean;
  onChange: (field: keyof EmailFormState, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export const SendEmailDialog: FC<SendEmailDialogProps> = ({
  document,
  form,
  sending,
  onChange,
  onClose,
  onSubmit,
}) => {
  if (!document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]">
      <Card className="w-full max-w-lg border-none bg-content1 shadow-2xl">
        <Card.Header className="flex items-start justify-between gap-4 px-6 pt-6 pb-2">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Send Document via Email
            </h3>
            <p className="mt-1 text-xs text-default-500">
              Document:{" "}
              <span className="font-semibold text-foreground">
                {document.title}
              </span>
            </p>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Close
          </Button>
        </Card.Header>
        <Card.Content className="space-y-4 px-6 pb-6 pt-3">
          <div className="space-y-1.5">
            <label
              className="text-xs font-bold text-foreground"
              htmlFor="send-email-to"
            >
              Recipient Email
            </label>
            <Input
              id="send-email-to"
              placeholder="name@email.com"
              type="email"
              value={form.to}
              onChange={(e) => onChange("to", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label
              className="text-xs font-bold text-foreground"
              htmlFor="send-email-subject"
            >
              Subject
            </label>
            <Input
              id="send-email-subject"
              placeholder="Email subject"
              value={form.subject}
              onChange={(e) => onChange("subject", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label
              className="text-xs font-bold text-foreground"
              htmlFor="send-email-message"
            >
              Message
            </label>
            <textarea
              className="min-h-32 w-full rounded-xl border border-default-200 bg-transparent px-3 py-2 text-sm outline-none transition focus:border-violet-500"
              id="send-email-message"
              placeholder="Write your email message here..."
              value={form.message}
              onChange={(e) => onChange("message", e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button isDisabled={sending} variant="tertiary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="bg-violet-500 text-white"
              isDisabled={sending || !form.to.trim()}
              onClick={onSubmit}
            >
              {sending ? "Sending..." : "Send Email"}
            </Button>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};
