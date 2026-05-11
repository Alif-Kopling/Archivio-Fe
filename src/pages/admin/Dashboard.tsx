/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { FC, memo, useEffect, useMemo, useState, useCallback } from "react";
import {
  Card,
  Button,
  Avatar,
  Table,
  Chip,
  Tooltip,
  Input,
  Spinner,
  Modal,
} from "@heroui/react";
import {
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  LayoutDashboard,
  Search,
  X,
  Terminal,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from "recharts";

import api from "@/lib/axios";
import { ThemeSwitch } from "@/components/common/theme-switch";
import { useNotify } from "@/context/NotificationContext";

// --- Types ---
interface Stats {
  total: number;
  pending: number;
  verified: number;
}

interface Document {
  id: string | number;
  title: string;
  filePath?: string;
  status: string;
  createdAt: string;
  type: "masuk" | "keluar" | "sertifikat";
  sourceType: "incoming" | "outgoing" | "certificate";
}

const APPROVAL_PAGE_SIZE = 5;

const getFileExt = (filePath?: string) => {
  if (!filePath) return "FILE";

  return filePath.split(".").pop()?.toUpperCase() || "FILE";
};

const mapSourceType = (type: Document["type"]): Document["sourceType"] => {
  switch (type) {
    case "masuk":
      return "incoming";
    case "keluar":
      return "outgoing";
    case "sertifikat":
    default:
      return "certificate";
  }
};

const getSourceLabel = (sourceType: Document["sourceType"]) => {
  switch (sourceType) {
    case "incoming":
      return "Incoming Mail";
    case "outgoing":
      return "Outgoing Mail";
    case "certificate":
      return "Certificate";
    default:
      return "Document";
  }
};

const getSourceChipProps = (sourceType: Document["sourceType"]) => {
  switch (sourceType) {
    case "incoming":
      return {
        className:
          "bg-blue-500/10 text-blue-600 border border-blue-500/20 font-bold",
        variant: "soft" as const,
      };
    case "outgoing":
      return {
        className:
          "bg-violet-500/10 text-violet-600 border border-violet-500/20 font-bold",
        variant: "soft" as const,
      };
    case "certificate":
      return {
        className:
          "bg-amber-500/10 text-amber-600 border border-amber-500/20 font-bold",
        variant: "soft" as const,
      };
    default:
      return {
        className: "bg-default-100 text-default-600 border border-divider font-bold",
        variant: "soft" as const,
      };
  }
};

// --- Sub-components ---

const Header: FC = () => (
  <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-xl bg-primary/10 text-primary">
        <LayoutDashboard size={24} />
      </div>
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-default-500 text-sm">
          Monitor and manage all documents and approval requests.
        </p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <Button
        isIconOnly
        className="bg-default-100 text-default-500 rounded-full"
        variant="ghost"
      >
        <Bell size={18} />
      </Button>
      <ThemeSwitch />
    </div>
  </header>
);

const StatsGrid: FC<{ stats: Stats }> = memo(({ stats }) => {
  const data = useMemo(
    () => [
      {
        title: "Total Documents",
        value: stats.total.toString(),
        trend: "+5.2%",
        isUp: true,
      },
      {
        title: "Pending Approval",
        value: stats.pending.toString(),
        trend: "+2.1%",
        isUp: true,
      },
      {
        title: "Verified Archives",
        value: stats.verified.toString(),
        trend: "+12.5%",
        isUp: true,
      },
      { title: "System Active", value: "Online", trend: "Stable", isUp: true },
    ],
    [stats.pending, stats.total, stats.verified],
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {data.map((stat, idx) => (
        <Card key={idx} className="bg-content1 border-divider">
          <Card.Content className="p-4">
            <p className="text-default-500 text-xs mb-1">{stat.title}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-bold">{stat.value}</h3>
              <div
                className={`flex items-center text-xs ${stat.isUp ? "text-success" : "text-danger"} bg-default-100 px-2 py-0.5 rounded-full`}
              >
                {stat.isUp ? (
                  <ArrowUpRight className="mr-1" size={12} />
                ) : (
                  <ArrowDownRight className="mr-1" size={12} />
                )}
                {stat.trend}
              </div>
            </div>
          </Card.Content>
        </Card>
      ))}
    </div>
  );
});

StatsGrid.displayName = "StatsGrid";

const ChartsSection: FC<{ stats: Stats }> = memo(({ stats }) => {
  const barData = useMemo(
    () => [
      { name: "Pending", count: stats.pending, fill: "#f5a524" },
      { name: "Verified", count: stats.verified, fill: "#17c964" },
      { name: "Total", count: stats.total, fill: "#006fee" },
    ],
    [stats.pending, stats.total, stats.verified],
  );

  const lineData = useMemo(
    () => [
      { name: "Mon", v: Math.floor(stats.total * 0.2) },
      { name: "Tue", v: Math.floor(stats.total * 0.5) },
      { name: "Wed", v: Math.floor(stats.total * 0.3) },
      { name: "Thu", v: Math.floor(stats.total * 0.7) },
      { name: "Fri", v: stats.total },
    ],
    [stats.total],
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Bar Chart */}
      <Card className="bg-content1 border-divider shadow-sm rounded-3xl">
        <Card.Content className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="font-bold text-lg">Archive Statistics</h4>
              <p className="text-default-500 text-sm">
                Status document distribution
              </p>
            </div>
            <Chip color="default" variant="soft">
              Overview
            </Chip>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={barData}>
                <CartesianGrid
                  className="stroke-default-200"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  axisLine={false}
                  className="text-xs font-semibold"
                  dataKey="name"
                  tickLine={false}
                />
                <RechartsTooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  cursor={{ fill: "transparent" }}
                />
                <Bar barSize={50} dataKey="count" radius={[12, 12, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card.Content>
      </Card>

      {/* Line Chart */}
      <Card className="bg-content1 border-divider shadow-sm rounded-3xl">
        <Card.Content className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="font-bold text-lg">System Traffic</h4>
              <p className="text-default-500 text-sm">Weekly system activity</p>
            </div>
            <Chip color="default" variant="soft">
              Live
            </Chip>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer height="100%" width="100%">
              <LineChart
                data={lineData}
              >
                <CartesianGrid
                  className="stroke-default-200"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  axisLine={false}
                  className="text-xs font-semibold"
                  dataKey="name"
                  tickLine={false}
                />
                <RechartsTooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Line
                  dataKey="v"
                  dot={{ r: 6, fill: "#7828c8" }}
                  stroke="#7828c8"
                  strokeWidth={4}
                  type="monotone"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
});

ChartsSection.displayName = "ChartsSection";

const ApprovalSearchBar: FC<{
  searchQuery: string;
  onSearchChange: (query: string) => void;
}> = memo(({ searchQuery, onSearchChange }) => (
  <div className="flex flex-col gap-4 mb-4 lg:flex-row lg:items-end lg:justify-between">
    <div>
      <h4 className="text-lg font-bold">Pending Approvals</h4>
      <p className="text-sm text-default-500">
        Review and approve documents waiting in the queue.
      </p>
    </div>
    <div className="relative w-full lg:max-w-[320px]">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-default-400"
        size={16}
      />
      <Input
        aria-label="Search pending documents"
        className="w-full pl-10 pr-10"
        placeholder="Search pending documents..."
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      {searchQuery ? (
        <button
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-default-400 transition hover:bg-default-100 hover:text-default-600"
          type="button"
          onClick={() => onSearchChange("")}
        >
          <X size={14} />
        </button>
      ) : null}
    </div>
  </div>
));

ApprovalSearchBar.displayName = "ApprovalSearchBar";

const ApprovalRow: FC<{
  doc: Document;
  onApprove: (doc: Document) => void;
  onReject: (doc: Document) => void;
}> = memo(({ doc, onApprove, onReject }) => (
  <Table.Row
    key={`${doc.sourceType}-${doc.id}`}
    className="border-b border-divider/50 hover:bg-default-100/50 transition-colors"
  >
    <Table.Cell>
      <div className="flex items-center gap-3 py-1">
        <Avatar className="bg-primary/10 text-primary" size="sm">
          <Avatar.Fallback className="text-[10px] font-bold">
            {getFileExt(doc.filePath)}
          </Avatar.Fallback>
        </Avatar>
        <span className="font-medium text-sm text-foreground">
          {doc.title}
        </span>
      </div>
    </Table.Cell>
    <Table.Cell>
      <Chip
        className={`capitalize ${getSourceChipProps(doc.sourceType).className}`}
        size="sm"
        variant={getSourceChipProps(doc.sourceType).variant}
      >
        {getSourceLabel(doc.sourceType)}
      </Chip>
    </Table.Cell>
    <Table.Cell className="text-default-500 text-sm">
      {new Date(doc.createdAt).toLocaleDateString()}
    </Table.Cell>
    <Table.Cell>
      <div className="flex gap-2 justify-center">
        <Tooltip>
          <Tooltip.Trigger>
            <Button
              isIconOnly
              className="text-success hover:bg-success/10"
              size="sm"
              variant="ghost"
              onClick={() => onApprove(doc)}
            >
              <CheckCircle2 size={16} />
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content>Approve Document</Tooltip.Content>
        </Tooltip>
        <Tooltip>
          <Tooltip.Trigger>
            <Button
              isIconOnly
              className="text-danger hover:bg-danger/10"
              size="sm"
              variant="ghost"
              onClick={() => onReject(doc)}
            >
              <XCircle size={16} />
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content>Reject Document</Tooltip.Content>
        </Tooltip>
      </div>
    </Table.Cell>
  </Table.Row>
));

ApprovalRow.displayName = "ApprovalRow";

const ApprovalBody: FC<{
  documents: Document[];
  loading: boolean;
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onApprove: (doc: Document) => void;
  onReject: (doc: Document) => void;
  onSelectionChange: (keys: Set<string | number>) => void;
  selectedKeys: Set<string | number>;
  onBulkApprove: () => void;
  onBulkReject: () => void;
}> = memo(
  ({ documents, loading, page, totalPages, total, onPageChange, onApprove, onReject, onSelectionChange, selectedKeys }) => (
    <Card className="bg-content1 border-divider shadow-none">
      <div className="relative">
        {loading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-content1/60 backdrop-blur-[1px]">
            <Spinner />
          </div>
        ) : null}
        <Table
          aria-label="Approval table"
          className="bg-transparent"
        >
          <Table.ScrollContainer>
            <Table.Content
              selectedKeys={selectedKeys}
              selectionMode="multiple"
              onSelectionChange={(keys: string | Set<string | number>) => {
                if (keys === "all") {
                  onSelectionChange(new Set(documents.map(d => d.id)));
                } else {
                  onSelectionChange(keys as Set<string | number>);
                }
              }}
            >              <Table.Header>
                <Table.Column isRowHeader className="bg-transparent border-b border-divider text-default-500 font-semibold uppercase text-xs">
                  DOCUMENT NAME
                </Table.Column>
                <Table.Column className="bg-transparent border-b border-divider text-default-500 font-semibold uppercase text-xs">
                  SOURCE
                </Table.Column>
                <Table.Column className="bg-transparent border-b border-divider text-default-500 font-semibold uppercase text-xs">
                  UPLOAD DATE
                </Table.Column>
                <Table.Column className="bg-transparent border-b border-divider text-default-500 font-semibold uppercase text-xs text-center">
                  ACTIONS
                </Table.Column>
              </Table.Header>
              <Table.Body>
                {documents.length === 0 ? (
                  <Table.Row>
                    <Table.Cell className="py-4 text-default-400 italic">
                      No pending documents found.
                    </Table.Cell>
                    <Table.Cell> </Table.Cell>
                    <Table.Cell> </Table.Cell>
                    <Table.Cell> </Table.Cell>
                  </Table.Row>
                ) : (
                  documents.map((doc) => (
                    <ApprovalRow
                      key={`${doc.sourceType}-${doc.id}`}
                      doc={doc}
                      onApprove={onApprove}
                      onReject={onReject}
                    />
                  ))
                )}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </div>
      <div className="flex flex-col gap-3 border-t border-divider px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-default-500">
          Showing{" "}
          <span className="font-semibold text-foreground">
            {total === 0 ? 0 : (page - 1) * APPROVAL_PAGE_SIZE + 1}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-foreground">
            {Math.min(page * APPROVAL_PAGE_SIZE, total)}
          </span>{" "}
          of <span className="font-semibold text-foreground">{total}</span> pending documents
        </p>
        {totalPages > 1 ? (
          <div className="flex items-center gap-2">
            <Button
              isDisabled={page <= 1}
              size="sm"
              variant="ghost"
              onPress={() => onPageChange(page - 1)}
            >
              Previous
            </Button>
            <Button
              isDisabled={page >= totalPages}
              size="sm"
              variant="ghost"
              onPress={() => onPageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        ) : null}
      </div>
    </Card>
  ),
);

ApprovalBody.displayName = "ApprovalBody";

const ApprovalTable: FC<{
  documents: Document[];
  page: number;
  totalPages: number;
  total: number;
  loading: boolean;
  searchQuery: string;
  onPageChange: (page: number) => void;
  onSearchChange: (query: string) => void;
  onApprove: (doc: Document) => void;
  onReject: (doc: Document) => void;
  onSelectionChange: (keys: Set<string | number>) => void;
  selectedKeys: Set<string | number>;
  onBulkApprove: () => void;
  onBulkReject: () => void;
}> = ({
  documents,
  page,
  totalPages,
  total,
  loading,
  searchQuery,
  onPageChange,
  onSearchChange,
  onApprove,
  onReject,
  onSelectionChange,
  selectedKeys,
  onBulkApprove,
  onBulkReject,
}) => (
  <div className="mb-8">
    <ApprovalSearchBar
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
    />
    <ApprovalBody
      documents={documents}
      loading={loading}
      page={page}
      selectedKeys={selectedKeys}
      total={total}
      totalPages={totalPages}
      onApprove={onApprove}
      onBulkApprove={onBulkApprove}
      onBulkReject={onBulkReject}
      onPageChange={onPageChange}
      onReject={onReject}
      onSelectionChange={onSelectionChange}
    />
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    verified: 0,
  });
  const [pendingDocs, setPendingDocs] = useState<Document[]>([]);
  const [approvalSearchInput, setApprovalSearchInput] = useState("");
  const [approvalQuery, setApprovalQuery] = useState({
    search: "",
    page: 1,
  });
  const [approvalTotal, setApprovalTotal] = useState(0);
  const [approvalTotalPages, setApprovalTotalPages] = useState(1);
  const [approvalLoading, setApprovalLoading] = useState(true);
  const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(new Set());
  const [isMagicModalOpen, setIsMagicModalOpen] = useState(false);
  const [magicAction, setMagicAction] = useState<"approve" | "reject" | null>(null);
  
  const notify = useNotify();

  const fetchData = useCallback(async () => {
    try {
      setApprovalLoading(true);
      const response = await api.get("/dashboard", {
        params: {
          page: approvalQuery.page,
          limit: APPROVAL_PAGE_SIZE,
          search: approvalQuery.search,
        },
      });

      const payload = response.data ?? {};
      const data = Array.isArray(payload.data) ? payload.data : [];
      const totalPending =
        typeof payload.totalPending === "number"
          ? payload.totalPending
          : data.length;
      const totalPages =
        typeof payload.totalPages === "number" ? payload.totalPages : 1;

      setStats({
        total: Number(payload.stats?.total || 0),
        pending: Number(payload.stats?.pending || 0),
        verified: Number(payload.stats?.verified || 0),
      });
      setPendingDocs(
        data.map((doc: any) => ({
          ...doc,
          sourceType: mapSourceType(doc.type),
        })),
      );
      setApprovalTotal(totalPending);
      setApprovalTotalPages(Math.max(1, totalPages));
      setSelectedKeys(new Set());
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setApprovalLoading(false);
    }
  }, [approvalQuery.page, approvalQuery.search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmedInput = approvalSearchInput.trim().toLowerCase();
      
      // Professional command detection
      if (trimmedInput === "/bulk approve" || trimmedInput === "/bulk aprove") {
        setMagicAction("approve");
        setIsMagicModalOpen(true);
        setApprovalSearchInput("");
 
        return;
      }

      if (trimmedInput === "/bulk reject" || trimmedInput === "/bulk rejek") {
        setMagicAction("reject");
        setIsMagicModalOpen(true);
        setApprovalSearchInput("");
 
        return;
      }

      setApprovalQuery({
        search: trimmedInput,
        page: 1,
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [approvalSearchInput]);

  const handleApprovalPageChange = (page: number) => {
    setApprovalQuery((prev) => ({
      ...prev,
      page,
    }));
  };

  const handleApprove = async (doc: Document) => {
    try {
      const endpoint =
        doc.sourceType === "incoming"
          ? `/surat-masuk/${doc.id}/approve`
          : doc.sourceType === "outgoing"
            ? `/surat-keluar/${doc.id}/approve`
            : `/sertifikat/${doc.id}/approve`;

      await api.patch(endpoint);
      notify({ title: "Document Verified", status: "success" });
      fetchData();
    } catch (error) {
      notify({ title: "Approval Failed", description: "Check backend logs.", status: "danger" });
    }
  };

  const handleReject = async (doc: Document) => {
    try {
      const endpoint =
        doc.sourceType === "incoming"
          ? `/surat-masuk/${doc.id}/reject`
          : doc.sourceType === "outgoing"
            ? `/surat-keluar/${doc.id}/reject`
            : `/sertifikat/${doc.id}/reject`;

      await api.patch(endpoint);
      notify({ title: "Document Rejected", status: "danger" });
      fetchData();
    } catch (error) {
      notify({ title: "Rejection Failed", description: "Check backend logs.", status: "danger" });
    }
  };

  const handleBulkApprove = async () => {
    const idsToApprove = selectedKeys.size > 0 
      ? Array.from(selectedKeys) 
      : pendingDocs.map(d => d.id); 

    if (idsToApprove.length === 0) {
      notify({ title: "Operation Aborted", description: "No documents available for bulk authorization.", status: "warning" });
      setIsMagicModalOpen(false);

      return;
    }
    
    try {
      setApprovalLoading(true);
      await api.post("/dashboard/bulk-approve", { ids: idsToApprove });
      notify({ 
        title: "Bulk Authorization Success", 
        description: `${idsToApprove.length} documents have been batch-processed.`, 
        status: "success" 
      });
      setIsMagicModalOpen(false);
      fetchData();
    } catch (error) {
      notify({ title: "System Error", description: "Bulk processing failure. Contact system administrator.", status: "danger" });
      setApprovalLoading(false);
    }
  };

  const handleBulkReject = async () => {
    const idsToReject = selectedKeys.size > 0 
      ? Array.from(selectedKeys) 
      : pendingDocs.map(d => d.id); 

    if (idsToReject.length === 0) {
      notify({ title: "Operation Aborted", description: "No documents available for bulk rejection.", status: "warning" });
      setIsMagicModalOpen(false);

      return;
    }

    try {
      setApprovalLoading(true);
      await api.post("/dashboard/bulk-reject", { ids: idsToReject });
      notify({ 
        title: "Bulk Rejection Complete", 
        description: `${idsToReject.length} documents have been removed from the queue.`, 
        status: "success" 
      });
      setIsMagicModalOpen(false);
      fetchData();
    } catch (error) {
      notify({ title: "System Error", description: "Failed to execute bulk rejection.", status: "danger" });
      setApprovalLoading(false);
    }
  };

  return (
    <div className="p-6 overflow-y-auto h-full">
      <Header />
      <StatsGrid stats={stats} />
      <ChartsSection stats={stats} />
      <ApprovalTable
        documents={pendingDocs}
        loading={approvalLoading}
        page={approvalQuery.page}
        searchQuery={approvalSearchInput}
        selectedKeys={selectedKeys}
        total={approvalTotal}
        totalPages={approvalTotalPages}
        onApprove={handleApprove}
        onBulkApprove={handleBulkApprove}
        onBulkReject={handleBulkReject}
        onPageChange={handleApprovalPageChange}
        onReject={handleReject}
        onSearchChange={setApprovalSearchInput}
        onSelectionChange={setSelectedKeys}
      />

      <Modal>
        <Modal.Backdrop 
          className="bg-gradient-to-t from-primary/20 to-black/40 z-[9999]"
          isOpen={isMagicModalOpen} 
          variant="blur"
          onOpenChange={setIsMagicModalOpen}
        >
          <Modal.Container placement="center">
            <Modal.Dialog>
              {({}) => (
                <>
                  <Modal.Header>
                    <Modal.Icon>
                      {magicAction === "approve" ? (
                        <Terminal className="text-primary" size={20} />
                      ) : (
                        <AlertTriangle className="text-danger" size={20} />
                      )}
                    </Modal.Icon>
                    <Modal.Heading className={magicAction === "approve" ? "text-primary" : "text-danger"}>
                      {magicAction === "approve" ? "Confirm Bulk Authorization" : "Confirm Bulk Rejection"}
                    </Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    <p className="font-medium">
                      You are initializing a batch administrative command: <code className="bg-default-100 px-1 rounded">/bulk {magicAction}</code>
                    </p>
                    <p className="text-default-500 text-sm">
                      This action will apply {magicAction === "approve" ? "authorization" : "rejection"} to all <b>{pendingDocs.length}</b> visible records on this page. Do you wish to proceed?
                    </p>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="tertiary" onPress={() => setIsMagicModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      variant={magicAction === "approve" ? "primary" : "danger"} 
                      onPress={magicAction === "approve" ? handleBulkApprove : handleBulkReject}
                    >
                      {magicAction === "approve" ? "Authorize Batch" : "Execute Rejection"}
                    </Button>
                  </Modal.Footer>
                </>
              )}
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}
