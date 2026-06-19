import { useState } from "react";
import { Button, Input, Label, ListBox, Modal, Select } from "@heroui/react";
import { Mail, Shield, User, UserPlus, X, KeyRound } from "lucide-react";
import { motion, type Variants } from "framer-motion";

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

const fieldVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: (i as number) * 0.06, duration: 0.2, ease: "easeOut" },
  }),
};

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

  const fields = [
    {
      id: "name" as const,
      label: "Full Name",
      icon: User,
      placeholder: "Enter full name",
      type: "text",
    },
    {
      id: "email" as const,
      label: "Email Address",
      icon: Mail,
      placeholder: "Enter email address",
      type: "email",
    },
    {
      id: "password" as const,
      label: "Password",
      icon: KeyRound,
      placeholder: "Set a secure password",
      type: "password",
    },
  ];

  return (
    <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button className="gap-2 shadow-lg shadow-primary/20" variant="primary">
          <UserPlus size={18} />
          Register User
        </Button>
      </motion.div>

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
              {fields.map(({ id, label, icon: Icon, placeholder, type }, i) => (
                <motion.div
                  key={id}
                  animate={isOpen ? "visible" : "hidden"}
                  className="space-y-1.5"
                  custom={i}
                  initial="hidden"
                  variants={fieldVariants}
                >
                  <Label
                    className="flex items-center gap-1.5 text-xs font-bold text-foreground"
                    htmlFor={`user-${id}`}
                  >
                    <Icon size={14} /> {label}
                  </Label>
                  <Input
                    className="h-10 w-full"
                    id={`user-${id}`}
                    placeholder={placeholder}
                    type={type}
                    value={formData[id]}
                    onChange={(e) => updateField(id, e.target.value)}
                  />
                </motion.div>
              ))}

              <motion.div
                animate={isOpen ? "visible" : "hidden"}
                className="space-y-1.5"
                custom={3}
                initial="hidden"
                variants={fieldVariants}
              >
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
              </motion.div>
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
