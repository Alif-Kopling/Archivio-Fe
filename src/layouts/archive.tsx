import { Tabs } from "@heroui/react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

export default function ArchiveLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentTab = location.pathname.split("/").pop() || "surat-masuk";

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex-none">
        <Tabs
          className="w-full"
          selectedKey={currentTab}
          onSelectionChange={(key) => navigate(`/archives/${key}`)}
        >
          <Tabs.ListContainer>
            <Tabs.List aria-label="Archive Options">
              <Tabs.Tab id="surat-masuk">Incoming Mail</Tabs.Tab>
              <Tabs.Tab id="surat-keluar">Outgoing Mail</Tabs.Tab>
              <Tabs.Tab id="sertifikat">Certificates</Tabs.Tab>
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
