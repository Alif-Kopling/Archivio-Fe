import { Tabs } from "@heroui/react";
import { Inbox, SendHorizonal, Award } from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

export default function ArchiveLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentTab = location.pathname.split("/").pop() || "surat-masuk";

  const tabIcon: Record<string, React.ReactNode> = {
    "surat-masuk": <Inbox size={16} />,
    "surat-keluar": <SendHorizonal size={16} />,
    sertifikat: <Award size={16} />,
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex-none">
        <Tabs
          className="w-full"
          selectedKey={currentTab}
          variant="primary"
          onSelectionChange={(key) => navigate(`/archives/${key}`)}
        >
          <Tabs.ListContainer>
            <Tabs.List aria-label="Archive Options" className="gap-0">
              <Tabs.Tab id="surat-masuk" className="flex items-center gap-1.5 px-4 py-2 font-semibold data-[selected]:text-primary data-[selected]:bg-primary/5 rounded-lg">
                {tabIcon["surat-masuk"]}
                Incoming Mail
              </Tabs.Tab>
              <Tabs.Tab id="surat-keluar" className="flex items-center gap-1.5 px-4 py-2 font-semibold data-[selected]:text-violet-500 data-[selected]:bg-violet-500/5 rounded-lg">
                {tabIcon["surat-keluar"]}
                Outgoing Mail
              </Tabs.Tab>
              <Tabs.Tab id="sertifikat" className="flex items-center gap-1.5 px-4 py-2 font-semibold data-[selected]:text-amber-500 data-[selected]:bg-amber-500/5 rounded-lg">
                {tabIcon["sertifikat"]}
                Certificates
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>
      </div>

      <div className="flex-1 min-h-0">
        <Outlet />
      </div>
    </div>
  );
}
