import { Tabs } from "@heroui/react";
import { Inbox, SendHorizonal, Award } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const tabBase =
  "flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] " +
  "text-default-500 hover:text-foreground hover:bg-white/10 dark:hover:bg-white/5 " +
  "data-[selected]:bg-white/30 dark:data-[selected]:bg-white/15 " +
  "data-[selected]:text-primary data-[selected]:shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_2px_4px_rgba(0,0,0,0.1)] " +
  "border border-transparent data-[selected]:border-white/30 dark:data-[selected]:border-white/10";

export const TabsNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentTab = location.pathname.split("/").pop() || "surat-masuk";

  return (
    <Tabs
      className="w-full"
      selectedKey={currentTab}
      variant="primary"
      disableAnimation={false} // Pastikan animasi diaktifkan
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1],
            },
          },
          exit: {
            y: -10,
            opacity: 0,
            transition: {
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
            },
          },
        },
      }}
      onSelectionChange={(key) => navigate(`/archives/${key}`)}
    >
      <Tabs.ListContainer>
        <Tabs.List
          aria-label="Archive Options"
          className="gap-0 p-1 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 dark:bg-black/20 dark:border-white/10 shadow-lg"
        >
          <Tabs.Tab
            className={tabBase}
            id="surat-masuk"
          >
            <Inbox size={16} />
            Incoming Mail
          </Tabs.Tab>
          <Tabs.Tab
            className={tabBase}
            id="surat-keluar"
          >
            <SendHorizonal size={16} />
            Outgoing Mail
          </Tabs.Tab>
          <Tabs.Tab
            className={tabBase}
            id="sertifikat"
          >
            <Award size={16} />
            Certificates
          </Tabs.Tab>
        </Tabs.List>
      </Tabs.ListContainer>
    </Tabs>
  );
};
