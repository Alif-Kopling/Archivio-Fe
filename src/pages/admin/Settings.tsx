/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { useSearchParams } from "react-router-dom";
import {
  Alert,
  AlertDialog,
  Button,
  Card,
  Chip,
  Input,
  Label,
  ListBox,
  Select,
  Switch,
  TextField,
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

import {
  emptyRejectedTrash,
  getSettings,
  getTrashStats,
  updateSetting,
} from "../../services/setting.service";

import alarmDanger from "@/assets/alarm-danger-danger.mp3";

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
  const [searchParams] = useSearchParams();
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
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
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get("tab") || "general",
  );
  const [savingCategory, setSavingCategory] = useState("");
  const [trashRejectedCount, setTrashRejectedCount] = useState(0);
  const [trashDialogOpen, setTrashDialogOpen] = useState(false);
  const [trashing, setTrashing] = useState(false);

  useEffect(() => {
    const tab = searchParams.get("tab");

    if (tab && categories.some((c) => c.id === tab)) {
      setActiveCategory(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchSettings();
  }, [activeCategory]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
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
    if (!trashDialogOpen) return;

    const AudioContextCtor =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextCtor) return;

    const ctx = audioContextRef.current ?? new AudioContextCtor();

    audioContextRef.current = ctx;

    const startLoop = async () => {
      if (ctx.state === "suspended") await ctx.resume();

      if (!bufferRef.current) {
        try {
          const res = await fetch(alarmDanger);

          bufferRef.current = await ctx.decodeAudioData(
            await res.arrayBuffer(),
          );
        } catch {
          return;
        }
      }

      const gain = ctx.createGain();

      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);

      const source = ctx.createBufferSource();

      source.buffer = bufferRef.current;
      source.loop = true;
      // Trim slightly at the end to avoid MP3 padding silence
      source.loopStart = 0;
      source.loopEnd = bufferRef.current.duration - 0.05;
      source.connect(gain);
      source.start(0);
      sourceRef.current = source;
      gainRef.current = gain;
    };

    startLoop();

    return () => {
      const { current: gain } = gainRef;
      const { current: source } = sourceRef;

      if (gain && source) {
        const now = ctx.currentTime;

        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        source.stop(now + 0.35);
      } else {
        source?.stop();
      }

      source?.disconnect();
      gain?.disconnect();
      sourceRef.current = null;
      gainRef.current = null;
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
        <TextField name="instansi_name">
          <Label className="block text-sm font-semibold mb-2 text-foreground">
            Agency Name
          </Label>
          <Input
            className="w-full h-12"
            placeholder="Enter agency name"
            value={settings.instansi_name}
            onChange={(e) => handleChange("instansi_name", e.target.value)}
          />
        </TextField>
        <p className="text-xs text-foreground mt-1.5">
          Agency name will be displayed in headers and reports
        </p>
      </div>
      <div>
        <TextField name="logo_url">
          <Label className="block text-sm font-semibold mb-2 text-foreground">
            Logo URL
          </Label>
          <Input
            className="w-full h-12"
            placeholder="https://example.com/logo.png"
            value={settings.logo_url}
            onChange={(e) => handleChange("logo_url", e.target.value)}
          />
        </TextField>
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
        <TextField name="retention_period" type="number">
          <Label className="block text-sm font-semibold mb-2 text-foreground">
            Retention Period (Years)
          </Label>
          <Input
            className="w-full h-12"
            placeholder="5"
            value={settings.retention_period}
            onChange={(e) => handleChange("retention_period", e.target.value)}
          />
        </TextField>
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
        <TextField name="max_file_size" type="number">
          <Label className="block text-sm font-semibold mb-2 text-foreground">
            Max File Size (MB)
          </Label>
          <Input
            className="w-full h-12"
            placeholder="10"
            value={settings.max_file_size}
            onChange={(e) => handleChange("max_file_size", e.target.value)}
          />
        </TextField>
        <p className="text-xs text-foreground mt-1.5">
          Maximum file size that can be uploaded
        </p>
      </div>
      <div>
        <TextField name="allowed_file_types">
          <Label className="block text-sm font-semibold mb-2 text-foreground">
            Allowed File Types
          </Label>
          <Input
            className="w-full h-12"
            placeholder="pdf,doc,docx,jpg,png"
            value={settings.allowed_file_types}
            onChange={(e) => handleChange("allowed_file_types", e.target.value)}
          />
        </TextField>
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
        <Switch
          isSelected={settings.email_notification}
          onChange={(checked) => {
            handleChange("email_notification", checked);
            handleSave("email_notification");
          }}
        >
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
        </Switch>
      </div>
      <div className="flex items-center justify-between p-4 rounded-lg bg-default-50 hover:bg-default-100 transition-colors">
        <div className="flex-1">
          <p className="font-semibold text-foreground">Auto Archive</p>
          <p className="text-sm text-foreground mt-0.5">
            Automatically archive documents after retention period
          </p>
        </div>
        <Switch
          isSelected={settings.auto_archive}
          onChange={(checked) => {
            handleChange("auto_archive", checked);
            handleSave("auto_archive");
          }}
        >
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
        </Switch>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <TextField name="session_timeout" type="number">
          <Label className="block text-sm font-semibold mb-2 text-foreground">
            Session Timeout (Minutes)
          </Label>
          <Input
            className="w-full h-12"
            placeholder="30"
            value={settings.session_timeout}
            onChange={(e) => handleChange("session_timeout", e.target.value)}
          />
        </TextField>
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
              Rejected documents are kept here until you permanently remove
              them. Deleting them will also remove the stored file from disk.
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
              <Button
                key={cat.id}
                className={`w-full flex items-center gap-3 px-3 py-2.5 justify-start text-left ${
                  activeCategory === cat.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-default-50 text-default-600"
                }`}
                variant="ghost"
                onPress={() => setActiveCategory(cat.id)}
              >
                <div
                  className={activeCategory === cat.id ? "text-primary" : ""}
                >
                  {cat.icon}
                </div>
                <span className="font-medium text-sm">{cat.label}</span>
              </Button>
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
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm">
          <Alert status={message.type === "error" ? "danger" : "success"}>
            <Alert.Indicator>
              {message.type === "error" ? (
                <AlertCircle size={20} />
              ) : (
                <CheckCircle2 size={20} />
              )}
            </Alert.Indicator>
            <Alert.Content>
              <Alert.Title>{message.text}</Alert.Title>
            </Alert.Content>
          </Alert>
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
                <AlertDialog.Heading>Empty rejected trash?</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <p className="text-sm text-default-500">
                  You are about to permanently delete{" "}
                  <strong className="text-foreground">
                    {trashRejectedCount}
                  </strong>{" "}
                  rejected documents. Their files will also be removed from
                  storage.
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
