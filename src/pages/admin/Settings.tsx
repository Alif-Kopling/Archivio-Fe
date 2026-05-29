/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { useSearchParams } from "react-router-dom";
import { Alert, AlertDialog, Button, Card } from "@heroui/react";
import {
  Building2,
  FileText,
  HardDrive,
  Bell,
  Shield,
  Palette,
  AlertCircle,
  CheckCircle2,
  Trash2,
} from "lucide-react";

import {
  emptyRejectedTrash,
  getSettings,
  getTrashStats,
  updateSetting,
} from "@/services/setting.service";
import {
  CategorySidebar,
  DisplaySettings,
  DocumentSettings,
  GeneralSettings,
  NotificationSettings,
  SecuritySettings,
  SettingsHeader,
  StorageSettings,
  TrashSettings,
  type SettingCategory,
} from "@/components/settings";

import alarmDanger from "@/assets/alarm-danger-danger.mp3";

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
    } finally {
      setLoading(false);
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
      // skip trailing silence in mp3 loop
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

  const renderContent = () => {
    switch (activeCategory) {
      case "general":
        return (
          <GeneralSettings
            loading={loading}
            savingCategory={savingCategory}
            settings={settings}
            onChange={handleChange}
            onSave={() => {
              setSavingCategory("general");
              handleSave("instansi_name");
              handleSave("logo_url");
            }}
          />
        );
      case "documents":
        return (
          <DocumentSettings
            loading={loading}
            savingCategory={savingCategory}
            settings={settings}
            onChange={handleChange}
            onSave={() => {
              setSavingCategory("documents");
              handleSave("items_per_page");
              handleSave("date_format");
              handleSave("retention_period");
            }}
          />
        );
      case "storage":
        return (
          <StorageSettings
            loading={loading}
            savingCategory={savingCategory}
            settings={settings}
            onChange={handleChange}
            onSave={() => {
              setSavingCategory("storage");
              handleSave("max_file_size");
              handleSave("allowed_file_types");
            }}
          />
        );
      case "notifications":
        return (
          <NotificationSettings
            settings={settings}
            onChange={handleChange}
            onSave={handleSave}
          />
        );
      case "security":
        return (
          <SecuritySettings
            loading={loading}
            savingCategory={savingCategory}
            settings={settings}
            onChange={handleChange}
            onSave={() => {
              setSavingCategory("security");
              handleSave("session_timeout");
            }}
          />
        );
      case "trash":
        return (
          <TrashSettings
            trashRejectedCount={trashRejectedCount}
            onEmptyTrash={() => setTrashDialogOpen(true)}
          />
        );
      case "display":
        return (
          <DisplaySettings
            loading={loading}
            savingCategory={savingCategory}
            settings={settings}
            onChange={handleChange}
            onSave={() => {
              setSavingCategory("display");
              handleSave("language");
              handleSave("default_theme");
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col p-6">
      <SettingsHeader
        hasChanges={hasChanges}
        loading={loading}
        onReset={fetchSettings}
        onSaveAll={handleSaveAll}
      />

      <div className="flex-1 flex gap-6 min-h-0">
        <CategorySidebar
          activeCategory={activeCategory}
          categories={categories}
          onCategoryChange={setActiveCategory}
        />

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
