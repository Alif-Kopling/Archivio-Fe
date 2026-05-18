import { useEffect, useRef, useState } from "react";
import { AlertDialog, Button, Tooltip } from "@heroui/react";
import { AlertCircle, Trash2, X } from "lucide-react";

import api from "@/lib/axios";
import { useNotify } from "@/context/NotificationContext";
import alarmDanger from "@/assets/alarm-danger-danger.mp3";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface DeleteUserDialogProps {
  user: User;
  onSuccess: () => void;
}

async function loadAndDecodeAudio(
  context: AudioContext,
  url: string,
): Promise<AudioBuffer> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();

  return context.decodeAudioData(arrayBuffer);
}

function stopAudioPlayback(
  context: AudioContext,
  source: AudioBufferSourceNode | null,
  gain: GainNode | null,
) {
  if (source && gain) {
    const now = context.currentTime;

    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.3);
    source.stop(now + 0.35);
  } else {
    source?.stop();
  }

  source?.disconnect();
  gain?.disconnect();
}

export default function DeleteUserDialog({
  user,
  onSuccess,
}: DeleteUserDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const notify = useNotify();

  const isAdmin = user.role.toLowerCase() === "admin";

  useEffect(() => {
    if (!isOpen || !isAdmin) return;

    const AudioContextCtor =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextCtor) return;

    const ctx = audioContextRef.current ?? new AudioContextCtor();

    audioContextRef.current = ctx;

    let cancelled = false;

    const startLoop = async () => {
      if (ctx.state === "suspended") await ctx.resume();

      if (!bufferRef.current) {
        try {
          bufferRef.current = await loadAndDecodeAudio(ctx, alarmDanger);
        } catch {
          return;
        }
      }

      if (cancelled || !bufferRef.current) return;

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
      cancelled = true;
      stopAudioPlayback(ctx, sourceRef.current, gainRef.current);
      sourceRef.current = null;
      gainRef.current = null;
    };
  }, [isOpen, isAdmin]);

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${user.id}`);
      notify({
        title: "User Removed",
        description: `${user.name} has been successfully deleted.`,
        status: "success",
      });
      setIsOpen(false);
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
        title: "Deletion Failed",
        description: message,
        status: "danger",
      });
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
