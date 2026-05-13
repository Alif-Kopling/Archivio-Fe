/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { FC, memo, useEffect, useState, useCallback } from "react";
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
  CheckCircle2,
  XCircle,
  Search,
  X,
  Terminal,
  AlertTriangle,
  ClipboardCheck,
} from "lucide-react";

import api from "@/lib/axios";
import { ThemeSwitch } from "@/components/common/theme-switch";
import { useNotify } from "@/context/NotificationContext";

// --- Types ---
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
        <ClipboardCheck size={24} />
      </div>
      <div>
        <h1 className="text-2xl font-bold">Approval System</h1>
        <p className="text-default-500 text-sm">
          Review and verify incoming documents for the archive.
        </p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <ThemeSwitch />
    </div>
  </header>
);

const ApprovalSearchBar: FC<{
  searchQuery: string;
  onSearchChange: (query: string) => void;
}> = memo(({ searchQuery, onSearchChange }) => (
  <div className="flex flex-col gap-4 mb-4 lg:flex-row lg:items-end lg:justify-between">
    <div>
      <h4 className="text-lg font-bold">Pending Documents</h4>
      <p className="text-sm text-default-500">
        Review documents waiting in the queue.
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
        placeholder="Search documents or use /bulk commands..."
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

export default function ApprovalsPage() {
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

  const handlePageChange = (page: number) => {
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
      notify({ title: "Operation Aborted", description: "No documents selected.", status: "warning" });
      setIsMagicModalOpen(false);

      return;
    }
    
    try {
      setApprovalLoading(true);
      await api.post("/dashboard/bulk-approve", { ids: idsToApprove });
      notify({ 
        title: "Bulk Authorization Success", 
        description: `${idsToApprove.length} documents processed.`, 
        status: "success" 
      });
      setIsMagicModalOpen(false);
      fetchData();
    } catch (error) {
      notify({ title: "System Error", status: "danger" });
      setApprovalLoading(false);
    }
  };

  const handleBulkReject = async () => {
    const idsToReject = selectedKeys.size > 0 
      ? Array.from(selectedKeys) 
      : pendingDocs.map(d => d.id); 

    if (idsToReject.length === 0) {
      notify({ title: "Operation Aborted", description: "No documents selected.", status: "warning" });
      setIsMagicModalOpen(false);

      return;
    }

    try {
      setApprovalLoading(true);
      await api.post("/dashboard/bulk-reject", { ids: idsToReject });
      notify({ 
        title: "Bulk Rejection Complete", 
        description: `${idsToReject.length} documents rejected.`, 
        status: "success" 
      });
      setIsMagicModalOpen(false);
      fetchData();
    } catch (error) {
      notify({ title: "System Error", status: "danger" });
      setApprovalLoading(false);
    }
  };

  return (
    <div className="p-6 overflow-y-auto h-full">
      <Header />
      
      <div className="mb-8">
        <ApprovalSearchBar
          searchQuery={approvalSearchInput}
          onSearchChange={setApprovalSearchInput}
        />
        
        <Card className="bg-content1 border-divider shadow-none">
          <div className="relative">
            {approvalLoading ? (
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
                      onSelectionChange(new Set(pendingDocs.map(d => d.id)));
                    } else {
                      onSelectionChange(keys as Set<string | number>);
                    }
                  }}
                >
                  <Table.Header>
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
                    {pendingDocs.length === 0 ? (
                      <Table.Row>
                        <Table.Cell className="py-4 text-default-400 italic">
                          No pending documents found.
                        </Table.Cell>
                        <Table.Cell> </Table.Cell>
                        <Table.Cell> </Table.Cell>
                        <Table.Cell> </Table.Cell>
                      </Table.Row>
                    ) : (
                      pendingDocs.map((doc) => (
                        <ApprovalRow
                          key={`${doc.sourceType}-${doc.id}`}
                          doc={doc}
                          onApprove={handleApprove}
                          onReject={handleReject}
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
                {approvalTotal === 0 ? 0 : (approvalQuery.page - 1) * APPROVAL_PAGE_SIZE + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-foreground">
                {Math.min(approvalQuery.page * APPROVAL_PAGE_SIZE, approvalTotal)}
              </span>{" "}
              of <span className="font-semibold text-foreground">{approvalTotal}</span> pending documents
            </p>
            {approvalTotalPages > 1 ? (
              <div className="flex items-center gap-2">
                <Button
                  isDisabled={approvalQuery.page <= 1}
                  size="sm"
                  variant="ghost"
                  onPress={() => handlePageChange(approvalQuery.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  isDisabled={approvalQuery.page >= approvalTotalPages}
                  size="sm"
                  variant="ghost"
                  onPress={() => handlePageChange(approvalQuery.page + 1)}
                >
                  Next
                </Button>
              </div>
            ) : null}
          </div>
        </Card>
      </div>

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
                      Initializing batch command: <code className="bg-default-100 px-1 rounded">/bulk {magicAction}</code>
                    </p>
                    <p className="text-default-500 text-sm">
                      Apply {magicAction === "approve" ? "authorization" : "rejection"} to all selected documents.
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
