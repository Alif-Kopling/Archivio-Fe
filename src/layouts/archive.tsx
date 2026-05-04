import { Tabs } from "@heroui/react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

export default function ArchiveLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentTab = location.pathname.split("/").pop() || "surat-masuk";

  const handleTabChange = (key: React.Key) => {
    navigate(`/archives/${key}`);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex-none">
        <h1 className="text-xl font-bold mb-2">Document Archive</h1>
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
