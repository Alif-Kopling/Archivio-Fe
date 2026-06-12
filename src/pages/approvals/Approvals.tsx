/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Card,
  Table,
  Spinner,
} from "@heroui/react";
import { Clock, CheckCircle2, FileText } from "lucide-react";
import { motion } from "framer-motion";

import api from "@/lib/axios";
import { useNotify } from "@/context/NotificationContext";
import {
  ApprovalHeader,
  ApprovalRow,
  ApprovalSearchBar,
  BulkActionModal,
  ApprovalPagination,
  ApprovalPreviewModal,
  mapSourceType,
  type ApprovalDocument,
} from "@/components/approvals";

const APPROVAL_PAGE_SIZE = 5;

export default function ApprovalsPage() {
  const [pendingDocs, setPendingDocs] = useState<ApprovalDocument[]>([]);
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
  const [previewDoc, setPreviewDoc] = useState<ApprovalDocument | null>(null);
  const [sourceFilter, setSourceFilter] = useState("all");

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

  const filteredDocs = useMemo(() => {
    if (sourceFilter === "all") return pendingDocs;
    return pendingDocs.filter((d) => d.sourceType === sourceFilter);
  }, [pendingDocs, sourceFilter]);

  const sourceStats = useMemo(() => ({
    incoming: pendingDocs.filter((d) => d.sourceType === "incoming").length,
    outgoing: pendingDocs.filter((d) => d.sourceType === "outgoing").length,
    certificate: pendingDocs.filter((d) => d.sourceType === "certificate").length,
  }), [pendingDocs]);

  const handlePageChange = (page: number) => {
    setApprovalQuery((prev) => ({
      ...prev,
      page,
    }));
  };

  const handleApprove = async (doc: ApprovalDocument) => {
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

  const handlePreview = (doc: ApprovalDocument) => {
    setPreviewDoc(doc);
  };

  const handleReject = async (doc: ApprovalDocument) => {
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-6 overflow-y-auto h-full space-y-6"
    >
      <ApprovalHeader total={approvalTotal} />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Pending Review", value: pendingDocs.length, Icon: Clock, color: "text-warning", bg: "bg-warning/10" },
          { label: "Total Documents", value: approvalTotal, Icon: FileText, color: "text-primary", bg: "bg-primary/10" },
          { label: "Resolved", value: Math.max(0, approvalTotal - pendingDocs.length), Icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
        ].map(({ label, value, Icon, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.25 }}
            className="flex items-center gap-3 rounded-xl border border-divider bg-content1 p-3.5 shadow-sm"
          >
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center ${color}`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-xs text-default-400 font-medium">{label}</p>
              <p className="text-lg font-bold text-foreground">{value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <ApprovalSearchBar
        searchQuery={approvalSearchInput}
        onSearchChange={setApprovalSearchInput}
        sourceFilter={sourceFilter}
        onSourceFilterChange={setSourceFilter}
        stats={sourceStats}
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
                    setSelectedKeys(new Set(pendingDocs.map(d => d.id)));
                  } else {
                    setSelectedKeys(keys as Set<string | number>);
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
                    STATUS
                  </Table.Column>
                  <Table.Column className="bg-transparent border-b border-divider text-default-500 font-semibold uppercase text-xs">
                    UPLOAD DATE
                  </Table.Column>
                  <Table.Column className="bg-transparent border-b border-divider text-default-500 font-semibold uppercase text-xs text-center">
                    ACTIONS
                  </Table.Column>
                </Table.Header>
                <Table.Body>
                  {filteredDocs.length === 0 ? (
                    <Table.Row>
                      <Table.Cell className="py-4 text-default-400 italic">
                        No pending documents found.
                      </Table.Cell>
                      <Table.Cell> </Table.Cell>
                      <Table.Cell> </Table.Cell>
                      <Table.Cell> </Table.Cell>
                      <Table.Cell> </Table.Cell>
                    </Table.Row>
                  ) : (
                    filteredDocs.map((doc, idx) => (
                      <ApprovalRow
                        key={`${doc.sourceType}-${doc.id}`}
                        doc={doc}
                        index={idx}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onPreview={handlePreview}
                      />
                    ))
                  )}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        </div>

        <ApprovalPagination
          currentPage={approvalQuery.page}
          pageSize={APPROVAL_PAGE_SIZE}
          total={approvalTotal}
          totalPages={approvalTotalPages}
          onPageChange={handlePageChange}
        />
      </Card>

      <BulkActionModal
        isOpen={isMagicModalOpen}
        magicAction={magicAction}
        onConfirm={magicAction === "approve" ? handleBulkApprove : handleBulkReject}
        onOpenChange={setIsMagicModalOpen}
      />

      <ApprovalPreviewModal
        doc={previewDoc}
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
      />
    </motion.div>
  );
}