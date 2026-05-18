import { useState } from "react";
import { Button, Input, Label, ListBox, Modal, Select } from "@heroui/react";
import { Mail, Shield, User, UserPlus, X } from "lucide-react";

import api from "@/lib/axios";
import { useNotify } from "@/context/NotificationContext";

interface RoleOption {
  id: string;
  label: string;
  textValue: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: "staff",
    label: "Staff (Restricted Access)",
    textValue: "Staff Restricted Access",
  },
  {
    id: "admin",
    label: "Administrator (Full Access)",
    textValue: "Admin Full Access",
  },
];

interface AddMemberModalProps {
  onSuccess: () => void;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  role: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function AddMemberModal({ onSuccess }: AddMemberModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    role: "staff",
  });
  const notify = useNotify();

  const resetForm = () => {
    setFormData({ name: "", email: "", password: "", role: "staff" });
  };

  const handleSubmit = async () => {
    const { name, email, password } = formData;

    if (!name.trim() || !email.trim() || !password.trim()) {
      notify({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        status: "warning",
      });

      return;
    }

    if (!validateEmail(email)) {
      notify({
        title: "Invalid Entry",
        description: "Please provide a valid email address.",
        status: "warning",
      });

      return;
    }

    if (password.length < 6) {
      notify({
        title: "Security Requirement",
        description: "Password must be at least 6 characters.",
        status: "warning",
      });

      return;
    }

    try {
      setSubmitting(true);
      await api.post("/users", formData);
      notify({
        title: "Success",
        description: "The new user has been successfully registered.",
        status: "success",
      });
      setIsOpen(false);
      resetForm();
      onSuccess();
    } catch (error: unknown) {
      const message =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { error?: string } } }).response
              ?.data?.error
          : error instanceof Error
            ? error.message
            : "Unknown error occurred";

      notify({
        title: "Registration Failed",
        description: message,
        status: "danger",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
      <Button className="gap-2 shadow-lg shadow-primary/20" variant="primary">
        <UserPlus size={18} />
        Register User
      </Button>

      <Modal.Backdrop
        className="bg-black/35 backdrop-blur-0"
        variant="transparent"
      >
        <Modal.Container placement="center" scroll="outside" size="md">
          <Modal.Dialog className="w-full max-w-[520px]">
            <Modal.CloseTrigger className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-lg text-default-500 transition-colors hover:bg-default-100">
              <X size={16} />
            </Modal.CloseTrigger>
            <Modal.Header className="flex flex-col gap-1 p-6 pb-2">
              <Modal.Heading className="text-xl font-bold">
                User Registration
              </Modal.Heading>
              <p className="text-sm text-default-500">
                Provide the details below to create a new system account.
              </p>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-4 p-6 py-2">
              <div className="space-y-1.5">
                <Label
                  className="flex items-center gap-1.5 text-xs font-bold text-foreground"
                  htmlFor="user-name"
                >
                  <User size={14} /> Full Name
                </Label>
                <Input
                  className="h-10 w-full"
                  id="user-name"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />
              </div>
              <div className="space-y-1.5 mt-2">
                <Label
                  className="flex items-center gap-1.5 text-xs font-bold text-foreground"
                  htmlFor="user-email"
                >
                  <Mail size={14} /> Email Address
                </Label>
                <Input
                  className="h-10 w-full"
                  id="user-email"
                  placeholder="Enter email address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </div>
              <div className="space-y-1.5 mt-2">
                <Label
                  className="flex items-center gap-1.5 text-xs font-bold text-foreground"
                  htmlFor="user-password"
                >
                  <Shield size={14} /> Password
                </Label>
                <Input
                  className="h-10 w-full"
                  id="user-password"
                  placeholder="Set a secure password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                />
              </div>
              <div className="space-y-1.5 mt-2">
                <Label
                  className="flex items-center gap-1.5 text-xs font-bold text-foreground"
                  htmlFor="user-role"
                >
                  <Shield size={14} /> Account Role
                </Label>
                <Select
                  aria-label="Select user role"
                  className="w-full"
                  selectedKey={formData.role}
                  onSelectionChange={(key) => updateField("role", String(key))}
                >
                  <Select.Trigger className="h-11 w-full">
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {ROLE_OPTIONS.map((option) => (
                        <ListBox.Item
                          key={option.id}
                          id={option.id}
                          textValue={option.textValue}
                        >
                          {option.label}
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>
            </Modal.Body>
            <Modal.Footer className="flex justify-end gap-3 p-6 pt-4">
              <Button
                className="font-semibold"
                variant="tertiary"
                onPress={() => {
                  setIsOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                className="font-semibold"
                variant="primary"
                onPress={handleSubmit}
              >
                {submitting ? "Processing..." : "Create Account"}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
