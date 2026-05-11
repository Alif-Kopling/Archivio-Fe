import { FC, ReactNode } from "react";
import { Card, Button, Separator } from "@heroui/react";

interface UploadPanelProps {
  loading: boolean;
  onUploadClick: () => void;
  icon: ReactNode;
  title: string;
  description: string;
  acceptedFormats: string;
  badgeColor?: string;
  buttonColor?: string;
  buttonShadow?: string;
}

export const SidebarUploadPanel: FC<UploadPanelProps> = ({
  loading,
  onUploadClick,
  icon,
  title,
  description,
  acceptedFormats,
  badgeColor = "bg-primary/10 text-primary",
  buttonColor = "bg-primary text-primary-foreground",
  buttonShadow = "shadow-primary/20",
}) => (
  <Card className="border-none bg-content1 shadow-sm h-fit">
    <Card.Header className="flex flex-col items-start px-4 pt-4 pb-1 gap-2">
      <div className={`p-2.5 ${badgeColor} rounded-xl`}>{icon}</div>
      <div className="space-y-0.5">
        <h3 className="font-bold text-base tracking-tight text-foreground">
          {title}
        </h3>
        <p className="text-default-400 text-[10px] leading-tight">
          {description}
        </p>
      </div>
    </Card.Header>
    <Card.Content className="px-4 pb-4 pt-1 flex flex-col gap-3">
      <Separator className="opacity-30" />
      <p className="text-[11px] text-default-600 leading-snug bg-default-50/50 p-3 rounded-lg border border-default-100 italic">
        Accepted formats:{" "}
        <span className="font-bold text-foreground">{acceptedFormats}</span>.
      </p>
      <Button
        className={`w-full font-bold shadow-md ${buttonShadow} h-9 text-[11px] ${buttonColor} rounded-lg flex items-center justify-center gap-2`}
        onClick={onUploadClick}
      >
        Upload Document
      </Button>
    </Card.Content>
  </Card>
);
