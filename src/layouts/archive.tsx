import { Tabs } from "@heroui/react";
import { Inbox, SendHorizonal, Award } from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const headerConfig: Record<
  string,
  { icon: React.ReactNode; title: string; desc: string; color: string }
> = {
  "surat-masuk": {
    icon: <Inbox size={24} />,
    title: "Incoming Mail",
    desc: "Manage and upload incoming digital archives.",
    color: "bg-accent/10 text-accent",
  },
  "surat-keluar": {
    icon: <SendHorizonal size={24} />,
    title: "Outgoing Mail",
    desc: "Manage and upload outgoing digital archives.",
    color: "bg-violet-500/10 text-violet-500",
  },
  sertifikat: {
    icon: <Award size={24} />,
    title: "Certificates",
    desc: "Manage and upload digital certificates.",
    color: "bg-amber-500/10 text-amber-600",
  },
};

export default function ArchiveLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentTab = location.pathname.split("/").pop() || "surat-masuk";
  const header = headerConfig[currentTab] || headerConfig["surat-masuk"];

  const handleTabChange = (key: React.Key) => {
    navigate(`/archives/${key}`);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${header.color}`}>{header.icon}</div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{header.title}</h1>
          <p className="text-sm text-default-500">{header.desc}</p>
        </div>
      </div>

      <div className="flex-none">
        <Tabs
          className="w-full"
          selectedKey={currentTab}
          onSelectionChange={handleTabChange}
        >
          <Tabs.ListContainer>
            <Tabs.List aria-label="Archive Options">
              <Tabs.Tab id="surat-masuk">
                Incoming Mail
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="surat-keluar">
                Outgoing Mail
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="sertifikat">
                Certificates
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>
      </div>

      <div className="flex-1 min-h-0 pt-2">
        <Outlet />
      </div>
    </div>
  );
}
