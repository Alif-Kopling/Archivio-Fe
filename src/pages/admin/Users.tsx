/* eslint-disable no-console */
import { useCallback, useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Chip,
  Input,
  Label,
  ListBox,
  Select,
  Spinner,
  Table,
  Tooltip,
  Modal,
  AlertDialog,
  SearchField,
} from "@heroui/react";
import {
  AlertCircle,
  Crown,
  Mail,
  Shield,
  Trash2,
  User,
  UserPlus,
  X,
} from "lucide-react";

import api from "@/lib/axios";

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  _count?: {
    documents: number;
  };
}

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

function AddMemberAction({ onSuccess }: { onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff",
  });

  const resetForm = () => {
    setFormData({ name: "", email: "", password: "", role: "staff" });
  };

  const handleSubmit = async () => {
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      alert("Missing Information: Please fill in all required fields.");

      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      alert("Invalid Entry: Please provide a valid email address.");

      return;
    }
    if (formData.password.length < 6) {
      alert("Security Requirement: Password must be at least 6 characters.");

      return;
    }

    try {
      setSubmitting(true);
      await api.post("/users", formData);
      alert("Success: The new user has been successfully registered.");
      setIsOpen(false);
      resetForm();
      onSuccess();
    } catch (error: any) {
      alert(
        `Registration Failed: ${error.response?.data?.error || error.message}`,
      );
    } finally {
      setSubmitting(false);
    }
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
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
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
                  onSelectionChange={(key) =>
                    setFormData({ ...formData, role: String(key) })
                  }
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

function DeleteMemberAction({
  user,
  onSuccess,
}: {
  user: UserData;
  onSuccess: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${user.id}`);
      alert(`User Removed: ${user.name} has been successfully deleted.`);
      setIsOpen(false);
      onSuccess();
    } catch (error: any) {
      alert(`Deletion Failed: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <AlertDialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <Tooltip delay={0}>
        <Tooltip.Trigger>
          <Button
            isIconOnly
            aria-label={`Delete ${user.name}`}
            className="rounded-md text-danger hover:bg-danger/5"
            size="sm"
            variant="ghost"
            onPress={() => setIsOpen(true)}
          >
            <Trash2 size={16} />
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>Delete User</Tooltip.Content>
      </Tooltip>

      <AlertDialog.Backdrop
        className="bg-linear-to-t from-red-950/90 via-red-950/50 to-transparent dark:from-red-950/95 dark:via-red-950/60"
        variant="blur"
      >
        <AlertDialog.Container>
          <AlertDialog.Dialog className="w-full max-w-[420px]">
            <AlertDialog.CloseTrigger className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-lg text-default-500 transition-colors hover:bg-default-100">
              <X size={16} />
            </AlertDialog.CloseTrigger>

            <AlertDialog.Header className="flex flex-col items-center gap-3 p-6 pb-2 text-center">
              <AlertDialog.Icon status="danger">
                <AlertCircle className="size-6" />
              </AlertDialog.Icon>
              <AlertDialog.Heading className="text-xl font-bold">
                Permanently delete this account?
              </AlertDialog.Heading>
            </AlertDialog.Header>

            <AlertDialog.Body className="p-6 py-2 text-center">
              <p className="text-sm leading-relaxed text-default-500">
                This action cannot be undone. All data associated with{" "}
                <strong className="text-foreground">{user.name}</strong> will be
                permanently removed from the system registry.
              </p>
            </AlertDialog.Body>

            <AlertDialog.Footer className="flex flex-col-reverse gap-3 p-6 pt-4">
              <Button
                className="w-full font-semibold"
                variant="tertiary"
                onPress={() => setIsOpen(false)}
              >
                Keep Account
              </Button>
              <Button
                className="w-full font-semibold"
                variant="danger"
                onPress={handleDelete}
              >
                Delete Forever
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/users", {
        params: { search: searchQuery },
      });

      const fetchedUsers = Array.isArray(response.data) ? response.data : [];
      const sortedUsers = [...fetchedUsers].sort((a, b) => {
        const aAdmin = a.role.toLowerCase() === "admin";
        const bAdmin = b.role.toLowerCase() === "admin";

        if (aAdmin && !bAdmin) return -1;
        if (!aAdmin && bAdmin) return 1;

        return 0;
      });

      setUsers(sortedUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    setSearchLoading(true);
    const timer = setTimeout(fetchUsers, 500);

    return () => clearTimeout(timer);
  }, [fetchUsers]);

  return (
    <div className="flex w-full flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-sm text-default-500">
              Monitor and manage system access for all registered members.
            </p>
          </div>
        </div>

        <AddMemberAction onSuccess={fetchUsers} />
      </div>

      <Card className="overflow-hidden border-none bg-content1 shadow-sm">
        <Card.Header className="flex flex-col gap-4 border-b border-divider p-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchField
            className="w-full sm:max-w-[320px]"
            value={searchQuery}
            onChange={setSearchQuery}
          >
            <SearchField.Group className="w-full">
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search by user identity..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <div className="flex items-center gap-2 text-xs font-medium italic text-default-400">
            <AlertCircle size={14} />
            Access privileges are strictly governed by assigned roles.
          </div>
        </Card.Header>

        <Card.Content className="p-0">
          <Table aria-label="User management table" className="bg-transparent">
            <Table.ScrollContainer>
              <Table.Content>
                <Table.Header>
                  <Table.Column
                    isRowHeader
                    className="border-b border-divider bg-transparent text-[10px] font-bold uppercase tracking-wider text-default-500"
                  >
                    User Profile
                  </Table.Column>
                  <Table.Column className="border-b border-divider bg-transparent text-[10px] font-bold uppercase tracking-wider text-default-500">
                    Role
                  </Table.Column>
                  <Table.Column className="border-b border-divider bg-transparent text-center text-[10px] font-bold uppercase tracking-wider text-default-500">
                    Document Count
                  </Table.Column>
                  <Table.Column className="border-b border-divider bg-transparent text-center text-[10px] font-bold uppercase tracking-wider text-default-500">
                    Actions
                  </Table.Column>
                </Table.Header>

                <Table.Body>
                  {loading ? (
                    <Table.Row>
                      <Table.Cell className="py-10 text-center" colSpan={4}>
                        <div className="flex justify-center">
                          <Spinner />
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ) : users.length === 0 ? (
                    <Table.Row>
                      <Table.Cell
                        className="py-10 text-center italic text-default-400"
                        colSpan={4}
                      >
                        No matching user records identified.
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    users.map((user) => {
                      const isAdmin = user.role.toLowerCase() === "admin";

                      return (
                        <Table.Row
                          key={user.id}
                          className="border-b border-divider/50 transition-colors hover:bg-default-50"
                        >
                          <Table.Cell className="px-4 py-3 align-middle">
                            <div className="flex items-center gap-3">
                              <Avatar
                                className="bg-primary/10 text-primary"
                                size="sm"
                              >
                                <Avatar.Fallback>
                                  {isAdmin ? (
                                    <Crown className="text-warning" size={14} />
                                  ) : (
                                    <User size={14} />
                                  )}
                                </Avatar.Fallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-foreground">
                                  {user.name}
                                </span>
                                <span className="flex items-center gap-1 text-[11px] text-default-500">
                                  <Mail size={10} />
                                  {user.email}
                                </span>
                              </div>
                            </div>
                          </Table.Cell>

                          <Table.Cell className="px-4 py-3 align-middle">
                            <Chip
                              className="h-6 border-none px-2 text-[10px] font-bold"
                              color={isAdmin ? "accent" : "default"}
                              size="sm"
                              variant="soft"
                            >
                              {user.role.toUpperCase()}
                            </Chip>
                          </Table.Cell>

                          <Table.Cell className="px-4 py-3 text-center align-middle">
                            <span className="text-sm font-semibold text-default-600">
                              {user._count?.documents || 0}
                            </span>
                          </Table.Cell>

                          <Table.Cell className="px-4 py-3 text-center align-middle">
                            <DeleteMemberAction
                              user={user}
                              onSuccess={fetchUsers}
                            />
                          </Table.Cell>
                        </Table.Row>
                      );
                    })
                  )}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        </Card.Content>
      </Card>
    </div>
  );
}
