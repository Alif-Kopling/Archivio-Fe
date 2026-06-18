/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertDialog, Button, Card, Spinner } from "@heroui/react";
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

import { useSettings } from "@/hooks/useSettings";
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 28 },
  },
};

const contentVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 28 },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.12 } },
};

const categories: SettingCategory[] = [
  { id: "general", label: "General", icon: <Building2 size={20} />, description: "Agency information and identity" },
  { id: "documents", label: "Documents", icon: <FileText size={20} />, description: "Document and archive settings" },
  { id: "storage", label: "Storage", icon: <HardDrive size={20} />, description: "Upload and file storage settings" },
  { id: "notifications", label: "Notifications", icon: <Bell size={20} />, description: "Email and system notifications" },
  { id: "security", label: "Security", icon: <Shield size={20} />, description: "System access and sessions" },
  { id: "trash", label: "Trash", icon: <Trash2 size={20} />, description: "Rejected document cleanup" },
  { id: "display", label: "Display", icon: <Palette size={20} />, description: "Language and themes" },
];

export default function Settings() {
  const { setTheme } = useTheme();
  const [searchParams] = useSearchParams();
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);

  const {
    settings: serverSettings,
    isLoading: fetching,
    trashStats,
    updateSetting,
    emptyTrash,
    isTrashing
  } = useSettings();

  const [localSettings, setLocalSettings] = useState<any>(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [hasChanges, setHasChanges] = useState(false);
  const [activeCategory, setActiveCategory] = useState(searchParams.get("tab") || "general");
  const [savingCategory, setSavingCategory] = useState("");
  const [trashDialogOpen, setTrashDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync server settings to local state on load or reset
  useEffect(() => {
    if (serverSettings) {
      setLocalSettings(serverSettings);
      setHasChanges(false);
    }
  }, [serverSettings]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && categories.some((c) => c.id === tab)) {
      setActiveCategory(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!trashDialogOpen) return;

    const AudioContextCtor = window.AudioContext ?? (window as any).webkitAudioContext;
    if (!AudioContextCtor) return;

    const ctx = audioContextRef.current ?? new AudioContextCtor();
    audioContextRef.current = ctx;

    const startLoop = async () => {
      if (ctx.state === "suspended") await ctx.resume();
      if (!bufferRef.current) {
        try {
          const res = await fetch(alarmDanger);
          bufferRef.current = await ctx.decodeAudioData(await res.arrayBuffer());
        } catch { return; }
      }

      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);

      const source = ctx.createBufferSource();
      source.buffer = bufferRef.current;
      source.loop = true;
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
    if (isSaving) return;
    setSavingCategory(activeCategory);
    setIsSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const value = localSettings[key];
      await updateSetting({ key, value: String(value) });

      if (key === "default_theme") setTheme(value);

      setMessage({ type: "success", text: "Settings saved successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setIsSaving(false);
      setSavingCategory("");
    }
  };

  const handleSaveAll = async () => {
    if (isSaving || !localSettings) return;
    setIsSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const updates = Object.entries(localSettings).map(([key, value]) =>
        updateSetting({ key, value: String(value) }),
      );

      await Promise.all(updates);
      setTheme(localSettings.default_theme);

      setMessage({ type: "success", text: "All settings saved successfully!" });
      setHasChanges(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (key: string, value: any) => {
    setLocalSettings((prev: any) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleEmptyRejectedTrash = async () => {
    if (isTrashing) return;
    try {
      const response = await emptyTrash();
      const deleted = Number(response.data?.deleted || 0);
      setTrashDialogOpen(false);
      setMessage({ type: "success", text: `Removed ${deleted} rejected documents.` });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: "Failed to empty rejected trash" });
    }
  };

  const renderContent = () => {
    if (!localSettings) return <div className="flex justify-center p-12"><Spinner /></div>;

    switch (activeCategory) {
      case "general":
        return (
          <GeneralSettings
            loading={isSaving}
            savingCategory={savingCategory}
            settings={localSettings}
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
            loading={isSaving}
            savingCategory={savingCategory}
            settings={localSettings}
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
            loading={isSaving}
            savingCategory={savingCategory}
            settings={localSettings}
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
            settings={localSettings}
            onChange={handleChange}
            onSave={handleSave}
          />
        );
      case "security":
        return (
          <SecuritySettings
            loading={isSaving}
            savingCategory={savingCategory}
            settings={localSettings}
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
            trashRejectedCount={trashStats?.rejected || 0}
            onEmptyTrash={() => setTrashDialogOpen(true)}
          />
        );
      case "display":
        return (
          <DisplaySettings
            loading={isSaving}
            savingCategory={savingCategory}
            settings={localSettings}
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
    <div className="relative h-screen flex flex-col p-6">
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-warning/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <motion.div className="flex flex-col flex-1 min-h-0" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants}>
          <SettingsHeader
            hasChanges={hasChanges}
            loading={isSaving || fetching}
            onReset={() => setLocalSettings(serverSettings)}
            onSaveAll={handleSaveAll}
          />
        </motion.div>

        <div className="flex-1 flex gap-6 min-h-0">
          <motion.div variants={itemVariants} className="h-fit">
            <CategorySidebar activeCategory={activeCategory} categories={categories} onCategoryChange={setActiveCategory} />
          </motion.div>

          <motion.div variants={itemVariants} className="flex-1 overflow-y-auto">
            <Card className="p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-foreground">{categories.find((c) => c.id === activeCategory)?.label}</h2>
                <p className="text-foreground text-sm mt-1">{categories.find((c) => c.id === activeCategory)?.description}</p>
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={activeCategory} variants={contentVariants} initial="initial" animate="animate" exit="exit">
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {message.text && (
        <motion.div className="fixed bottom-6 right-6 z-50 w-full max-w-sm" initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}>
          <Alert status={message.type === "error" ? "danger" : "success"}>
            <Alert.Indicator>{message.type === "error" ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}</Alert.Indicator>
            <Alert.Content><Alert.Title>{message.text}</Alert.Title></Alert.Content>
          </Alert>
        </motion.div>
      )}

      <AlertDialog isOpen={trashDialogOpen} onOpenChange={setTrashDialogOpen}>
        <AlertDialog.Backdrop>
          <AlertDialog.Container>
            <AlertDialog.Dialog className="sm:max-w-[420px]">
              <AlertDialog.CloseTrigger />
              <AlertDialog.Header>
                <AlertDialog.Icon status="danger"><AlertCircle className="size-6" /></AlertDialog.Icon>
                <AlertDialog.Heading>Empty rejected trash?</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <p className="text-sm text-default-500">
                  You are about to permanently delete <strong className="text-foreground">{trashStats?.rejected || 0}</strong> rejected documents. Their files will also be removed from storage.
                </p>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button variant="ghost" onPress={() => setTrashDialogOpen(false)}>Cancel</Button>
                <Button className="font-semibold bg-danger text-white shadow-lg shadow-danger/20" isDisabled={isTrashing} variant="danger" onPress={handleEmptyRejectedTrash}>
                  {isTrashing ? "Deleting..." : "Delete All"}
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </div>
  );
}
