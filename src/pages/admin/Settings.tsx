/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import {
  AlertDialog,
  Button,
  Card,
  Chip,
  Label,
  ListBox,
  Select,
} from "@heroui/react";
import {
  Building2,
  FileText,
  HardDrive,
  Bell,
  Shield,
  Palette,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Settings as SettingsIcon,
  Trash2,
  AlertTriangle,
} from "lucide-react";

import alarmDanger from "@/assets/alarm-danger-danger.mp3";
import {
  emptyRejectedTrash,
  getSettings,
  getTrashStats,
  updateSetting,
} from "../../services/setting.service";

interface SettingCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const categories: SettingCategory[] = [
  {
    id: "general",
    label: "General",
    icon: <Building2 size={20} />,
    description: "Agency information and identity",
  },
  {
    id: "documents",
    label: "Documents",
    icon: <FileText size={20} />,
    description: "Document and archive settings",
  },
  {
    id: "storage",
    label: "Storage",
    icon: <HardDrive size={20} />,
    description: "Upload and file storage settings",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: <Bell size={20} />,
    description: "Email and system notifications",
  },
  {
    id: "security",
    label: "Security",
    icon: <Shield size={20} />,
    description: "System access and sessions",
  },
  {
    id: "trash",
    label: "Trash",
    icon: <Trash2 size={20} />,
    description: "Rejected document cleanup",
  },
  {
    id: "display",
    label: "Display",
    icon: <Palette size={20} />,
    description: "Language and themes",
  },
];

export default function Settings() {
  const { setTheme } = useTheme();
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const [settings, setSettings] = useState({
    instansi_name: "",
    logo_url: "",
    items_per_page: "10",
    date_format: "DD/MM/YYYY",
    retention_period: "5",
    auto_archive: false,
    email_notification: true,
    max_file_size: "10",
    allowed_file_types: "pdf,doc,docx,jpg,png",
    session_timeout: "30",
    language: "id",
    default_theme: "system",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [hasChanges, setHasChanges] = useState(false);
  const [activeCategory, setActiveCategory] = useState("general");
  const [savingCategory, setSavingCategory] = useState("");
  const [trashRejectedCount, setTrashRejectedCount] = useState(0);
  const [trashDialogOpen, setTrashDialogOpen] = useState(false);
  const [trashing, setTrashing] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const [{ data }, trashResponse] = await Promise.all([
        getSettings(),
        getTrashStats(),
      ]);
      const newSettings = { ...settings };

      data.forEach((s: any) => {
        if (s.key in newSettings) {
          const value =
            s.key.includes("auto_") || s.key.includes("email_")
              ? s.value === "true"
              : s.value;

          (newSettings as any)[s.key] = value;
        }
      });
      setSettings(newSettings);
      setTrashRejectedCount(Number(trashResponse.data?.rejected || 0));
    } catch (error: any) {
      setMessage({ type: "error", text: "Failed to load settings" });
    }
  };

  useEffect(() => {
    if (!trashDialogOpen) {
      return;
    }

    const playSeamlessLoop = async () => {
      if (!audioContextRef.current) {
        const AudioContextCtor =
          window.AudioContext ??
          (window as Window & { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;

        if (!AudioContextCtor) {
          console.warn("Web Audio API is not supported in this browser.");
          return;
        }

        audioContextRef.current = new AudioContextCtor();
      }

      if (!bufferRef.current) {
        try {
          const response = await fetch(alarmDanger);
          const arrayBuffer = await response.arrayBuffer();

          bufferRef.current = await audioContextRef.current.decodeAudioData(arrayBuffer);
        } catch (error) {
          console.error("Failed to load alarm sound:", error);

          return;
        }
      }

      const source = audioContextRef.current.createBufferSource();

      source.buffer = bufferRef.current;
      source.loop = true;
      source.connect(audioContextRef.current.destination);
      source.start(0);
      sourceRef.current = source;
    };

    playSeamlessLoop();

    return () => {
      if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
    };
  }, [trashDialogOpen]);

  const handleSave = async (key: string) => {
    if (loading) return;
    setSavingCategory(activeCategory);
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const value = (settings as any)[key];

      await updateSetting(key, String(value));

      if (key === "default_theme") {
        setTheme(value);
      }

      setMessage({ type: "success", text: "Settings saved successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setLoading(false);
      setSavingCategory("");
    }
  };

  const handleSaveAll = async () => {
    if (loading) return;
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const updates = Object.entries(settings).map(([key, value]) =>
        updateSetting(key, String(value)),
      );

      await Promise.all(updates);

      setTheme(settings.default_theme);

      setMessage({
        type: "success",
        text: "All settings saved successfully!",
      });
      setHasChanges(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleEmptyRejectedTrash = async () => {
    if (trashing) return;

    setTrashing(true);
    try {
      const response = await emptyRejectedTrash();
      const deleted = Number(response.data?.deleted || 0);

      setTrashRejectedCount(0);
      setTrashDialogOpen(false);
      setMessage({
        type: "success",
        text: `Removed ${deleted} rejected documents.`,
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: "Failed to empty rejected trash" });
    } finally {
      setTrashing(false);
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <Label className="block text-sm font-semibold mb-2 text-foreground">
          Agency Name
        </Label>
        <input
          className="w-full h-12 px-4 rounded-lg border border-divider bg-default-100 focus:outline-none focus:ring-2 focus:ring-primary text-base"
          placeholder="Enter agency name"
          type="text"
          value={settings.instansi_name}
          onChange={(e) => handleChange("instansi_name", e.target.value)}
        />
        <p className="text-xs text-foreground mt-1.5">
          Agency name will be displayed in headers and reports
        </p>
      </div>
      <div>
        <Label className="block text-sm font-semibold mb-2 text-foreground">
          Logo URL
        </Label>
        <input
          className="w-full h-12 px-4 rounded-lg border border-divider bg-default-100 focus:outline-none focus:ring-2 focus:ring-primary text-base"
          placeholder="https://example.com/logo.png"
          type="text"
          value={settings.logo_url}
          onChange={(e) => handleChange("logo_url", e.target.value)}
        />
        <p className="text-xs text-foreground mt-1.5">
          Logo will be displayed in sidebar and header
        </p>
      </div>
      <div className="flex justify-end pt-4 border-t border-divider">
        <Button
          className="bg-primary text-white font-medium px-6"
          isDisabled={loading && savingCategory === "general"}
          onClick={() => {
            setSavingCategory("general");
            handleSave("instansi_name");
            handleSave("logo_url");
          }}
        >
          {savingCategory === "general" ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );

  const renderDocumentSettings = () => (
    <div className="space-y-6">
      <div>
        <Label className="block text-sm font-semibold mb-2 text-foreground">
          Items per Page
        </Label>
        <Select
          className="w-full"
          selectedKey={settings.items_per_page}
          onSelectionChange={(key) => handleChange("items_per_page", key)}
        >
          <Select.Trigger className="h-12">
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="10" textValue="10 items per page">
                10 items per page
              </ListBox.Item>
              <ListBox.Item id="25" textValue="25 items per page">
                25 items per page
              </ListBox.Item>
              <ListBox.Item id="50" textValue="50 items per page">
                50 items per page
              </ListBox.Item>
              <ListBox.Item id="100" textValue="100 items per page">
                100 items per page
              </ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>
      </div>
      <div>
        <Label className="block text-sm font-semibold mb-2 text-foreground">
          Date Format
        </Label>
        <Select
          className="w-full"
          selectedKey={settings.date_format}
          onSelectionChange={(key) => handleChange("date_format", key)}
        >
          <Select.Trigger className="h-12">
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="DD/MM/YYYY" textValue="DD/MM/YYYY">
                DD/MM/YYYY
              </ListBox.Item>
              <ListBox.Item id="MM/DD/YYYY" textValue="MM/DD/YYYY">
                MM/DD/YYYY
              </ListBox.Item>
              <ListBox.Item id="YYYY-MM-DD" textValue="YYYY-MM-DD">
                YYYY-MM-DD
              </ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>
      </div>
      <div>
        <Label className="block text-sm font-semibold mb-2 text-foreground">
          Retention Period (Years)
        </Label>
        <input
          className="w-full h-12 px-4 rounded-lg border border-divider bg-default-100 focus:outline-none focus:ring-2 focus:ring-primary text-base"
          placeholder="5"
          type="number"
          value={settings.retention_period}
          onChange={(e) => handleChange("retention_period", e.target.value)}
        />
        <p className="text-xs text-foreground mt-1.5">
          Documents will be archived after the retention period ends
        </p>
      </div>
      <div className="flex justify-end pt-4 border-t border-divider">
        <Button
          className="bg-primary text-white font-medium px-6"
          isDisabled={loading && savingCategory === "documents"}
          onClick={() => {
            setSavingCategory("documents");
            handleSave("items_per_page");
            handleSave("date_format");
            handleSave("retention_period");
          }}
        >
          {savingCategory === "documents" ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );

  const renderStorageSettings = () => (
    <div className="space-y-6">
      <div>
        <Label className="block text-sm font-semibold mb-2 text-foreground">
          Max File Size (MB)
        </Label>
        <input
          className="w-full h-12 px-4 rounded-lg border border-divider bg-default-100 focus:outline-none focus:ring-2 focus:ring-primary text-base"
          placeholder="10"
          type="number"
          value={settings.max_file_size}
          onChange={(e) => handleChange("max_file_size", e.target.value)}
        />
        <p className="text-xs text-foreground mt-1.5">
          Maximum file size that can be uploaded
        </p>
      </div>
      <div>
        <Label className="block text-sm font-semibold mb-2 text-foreground">
          Allowed File Types
        </Label>
        <input
          className="w-full h-12 px-4 rounded-lg border border-divider bg-default-100 focus:outline-none focus:ring-2 focus:ring-primary text-base"
          placeholder="pdf,doc,docx,jpg,png"
          type="text"
          value={settings.allowed_file_types}
          onChange={(e) => handleChange("allowed_file_types", e.target.value)}
        />
        <p className="text-xs text-foreground mt-1.5">
          Separate with commas (e.g.: pdf,doc,docx)
        </p>
      </div>
      <div className="flex justify-end pt-4 border-t border-divider">
        <Button
          className="bg-primary text-white font-medium px-6"
          isDisabled={loading && savingCategory === "storage"}
          onClick={() => {
            setSavingCategory("storage");
            handleSave("max_file_size");
            handleSave("allowed_file_types");
          }}
        >
          {savingCategory === "storage" ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 rounded-lg bg-default-50 hover:bg-default-100 transition-colors">
        <div className="flex-1">
          <p className="font-semibold text-foreground">Email Notifications</p>
          <p className="text-sm text-foreground mt-0.5">
            Send email for documents that need verification
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            checked={settings.email_notification}
            className="sr-only peer"
            type="checkbox"
            onChange={(e) => {
              handleChange("email_notification", e.target.checked);
              handleSave("email_notification");
            }}
          />
          <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
        </label>
      </div>
      <div className="flex items-center justify-between p-4 rounded-lg bg-default-50 hover:bg-default-100 transition-colors">
        <div className="flex-1">
          <p className="font-semibold text-foreground">Auto Archive</p>
          <p className="text-sm text-foreground mt-0.5">
            Automatically archive documents after retention period
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            checked={settings.auto_archive}
            className="sr-only peer"
            type="checkbox"
            onChange={(e) => {
              handleChange("auto_archive", e.target.checked);
              handleSave("auto_archive");
            }}
          />
          <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
        </label>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <Label className="block text-sm font-semibold mb-2 text-foreground">
          Session Timeout (Minutes)
        </Label>
        <input
          className="w-full h-12 px-4 rounded-lg border border-divider bg-default-100 focus:outline-none focus:ring-2 focus:ring-primary text-base"
          placeholder="30"
          type="number"
          value={settings.session_timeout}
          onChange={(e) => handleChange("session_timeout", e.target.value)}
        />
        <p className="text-xs text-foreground mt-1.5">
          Session will end after a period of inactivity
        </p>
      </div>
      <div className="flex justify-end pt-4 border-t border-divider">
        <Button
          className="bg-primary text-white font-medium px-6"
          isDisabled={loading && savingCategory === "security"}
          onClick={() => {
            setSavingCategory("security");
            handleSave("session_timeout");
          }}
        >
          {savingCategory === "security" ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );

  const renderTrashSettings = () => (
    <div className="space-y-6">
      <div className="rounded-2xl border border-danger/20 bg-danger/5 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-danger">
              <AlertTriangle size={18} />
              <p className="text-sm font-semibold uppercase tracking-wide">
                Rejected documents
              </p>
            </div>
            <h3 className="text-xl font-bold text-foreground">
              Trash bin for rejected files
            </h3>
            <p className="text-sm text-foreground/80 max-w-2xl">
              Rejected documents are kept here until you permanently remove them.
              Deleting them will also remove the stored file from disk.
            </p>
          </div>

          <div className="min-w-[160px] rounded-2xl border border-divider bg-content1 p-4 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-default-500">
              In Trash
            </p>
            <p className="mt-2 text-4xl font-bold text-danger">
              {trashRejectedCount}
            </p>
            <p className="text-xs text-default-500">rejected files</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            className="bg-danger text-white font-medium px-6"
            isDisabled={trashRejectedCount === 0}
            onClick={() => setTrashDialogOpen(true)}
          >
            Empty Trash
          </Button>
          <p className="text-xs text-default-500">
            This action is permanent and cannot be undone.
          </p>
        </div>
      </div>
    </div>
  );

  const renderDisplaySettings = () => (
    <div className="space-y-6">
      <div>
        <Label className="block text-sm font-semibold mb-2 text-foreground">
          Language
        </Label>
        <Select
          className="w-full"
          selectedKey={settings.language}
          onSelectionChange={(key) => handleChange("language", key)}
        >
          <Select.Trigger className="h-12">
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="id" textValue="Indonesian">
                Indonesian
              </ListBox.Item>
              <ListBox.Item id="en" textValue="English">
                English
              </ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>
      </div>
      <div>
        <Label className="block text-sm font-semibold mb-2 text-foreground">
          Default Theme
        </Label>
        <Select
          className="w-full"
          selectedKey={settings.default_theme}
          onSelectionChange={(key) => handleChange("default_theme", key)}
        >
          <Select.Trigger className="h-12">
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="system" textValue="System Default">
                System Default
              </ListBox.Item>
              <ListBox.Item id="light" textValue="Light">
                Light
              </ListBox.Item>
              <ListBox.Item id="dark" textValue="Dark">
                Dark
              </ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>
      </div>
      <div className="flex justify-end pt-4 border-t border-divider">
        <Button
          className="bg-primary text-white font-medium px-6"
          isDisabled={loading && savingCategory === "display"}
          onClick={() => {
            setSavingCategory("display");
            handleSave("language");
            handleSave("default_theme");
          }}
        >
          {savingCategory === "display" ? "Saving ..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeCategory) {
      case "general":
        return renderGeneralSettings();
      case "documents":
        return renderDocumentSettings();
      case "storage":
        return renderStorageSettings();
      case "notifications":
        return renderNotificationSettings();
      case "security":
        return renderSecuritySettings();
      case "trash":
        return renderTrashSettings();
      case "display":
        return renderDisplaySettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="h-screen flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <SettingsIcon size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Manage Archivio configurations
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <Chip color="warning" size="sm" variant="soft">
              Unsaved changes
            </Chip>
          )}
          <Button isDisabled={loading} variant="ghost" onClick={fetchSettings}>
            <RefreshCw className="mr-2" size={16} />
            Reset
          </Button>
          <Button
            className="bg-primary text-white font-medium px-6"
            isDisabled={!hasChanges || loading}
            onClick={handleSaveAll}
          >
            {loading ? (
              <RefreshCw className="animate-spin mr-2" size={16} />
            ) : (
              <Save className="mr-2" size={16} />
            )}
            {loading ? "Saving..." : "Save All"}
          </Button>
        </div>
      </div>

      {/* Main Content - Sidebar + Content */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Sidebar Navigation */}
        <Card className="w-60 flex-shrink-0 p-2 h-fit">
          <nav className="space-y-0.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  activeCategory === cat.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-default-50 text-default-600"
                }`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <div
                  className={activeCategory === cat.id ? "text-primary" : ""}
                >
                  {cat.icon}
                </div>
                <span className="font-medium text-sm">{cat.label}</span>
              </button>
            ))}
          </nav>
        </Card>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <Card className="p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-foreground">
                {categories.find((c) => c.id === activeCategory)?.label}
              </h2>
              <p className="text-foreground text-sm mt-1">
                {categories.find((c) => c.id === activeCategory)?.description}
              </p>
            </div>
            {renderContent()}
          </Card>
        </div>
      </div>

      {/* Message Toast */}
      {message.text && (
        <div
          className={`fixed bottom-6 right-6 p-4 rounded-xl shadow-lg flex items-center gap-3 z-50 ${
            message.type === "error"
              ? "bg-danger text-white"
              : "bg-success text-white"
          }`}
        >
          {message.type === "error" ? (
            <AlertCircle size={20} />
          ) : (
            <CheckCircle2 size={20} />
          )}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      <AlertDialog isOpen={trashDialogOpen} onOpenChange={setTrashDialogOpen}>
        <AlertDialog.Backdrop>
          <AlertDialog.Container>
            <AlertDialog.Dialog className="sm:max-w-[420px]">
              <AlertDialog.CloseTrigger />
              <AlertDialog.Header>
                <AlertDialog.Icon status="danger">
                  <AlertCircle className="size-6" />
                </AlertDialog.Icon>
                <AlertDialog.Heading>
                  Empty rejected trash?
                </AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <p className="text-sm text-default-500">
                  You are about to permanently delete{" "}
                  <strong className="text-foreground">{trashRejectedCount}</strong>{" "}
                  rejected documents. Their files will also be removed from storage.
                </p>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button
                  variant="ghost"
                  onPress={() => setTrashDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="font-semibold bg-danger text-white shadow-lg shadow-danger/20"
                  isDisabled={trashing}
                  variant="danger"
                  onPress={handleEmptyRejectedTrash}
                >
                  {trashing ? "Deleting..." : "Delete All"}
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </div>
  );
}
