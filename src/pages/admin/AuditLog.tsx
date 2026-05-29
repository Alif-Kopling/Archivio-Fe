import { useCallback, useEffect, useState } from "react";
import { AlertDialog, Button, Card, Chip, Spinner, Table } from "@heroui/react";
import { History, Trash2 } from "lucide-react";

import api from "@/lib/axios";

interface AuditEntry {
  id: number;
  userId: number;
  userName: string;
  action: string;
  documentId: number | null;
  documentTitle: string | null;
  detail: string | null;
  createdAt: string;
}

interface AuditResponse {
  data: AuditEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const actionColors: Record<string, "accent" | "success" | "warning" | "danger" | "default"> = {
  create: "success",
  approve: "accent",
  reject: "danger",
  "bulk-approve": "accent",
  "bulk-reject": "danger",
  delete: "danger",
  download: "warning",
  withdraw: "warning",
  "send-email": "success",
  "empty-trash": "danger",
};

const actionLabels: Record<string, string> = {
  create: "Upload",
  approve: "Approve",
  reject: "Reject",
  "bulk-approve": "Bulk Approve",
  "bulk-reject": "Bulk Reject",
  delete: "Delete",
  download: "Download",
  withdraw: "Withdraw",
  "send-email": "Send Email",
  "empty-trash": "Empty Trash",
};

function getActionLabel(action: string): string {
  return actionLabels[action] || action
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [clearOpen, setClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const limit = 20;

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<AuditResponse>("/audit", {
        params: { page, limit },
      });
      setEntries(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleClearAll = async () => {
    try {
      setClearing(true);
      await api.delete("/audit");
      setClearOpen(false);
      setEntries([]);
      setPage(1);
      setTotalPages(1);
    } catch (err) {
      console.error("Failed to clear audit logs:", err);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <History size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Log Activity</h1>
            <p className="text-sm text-default-500">
              Track all activities done by users across the system.
            </p>
          </div>
        </div>

        <Button
          variant="danger"
          size="sm"
          isDisabled={entries.length === 0}
          onPress={() => setClearOpen(true)}
        >
          <Trash2 size={16} />
          Clear All
        </Button>
      </div>

      <AlertDialog isOpen={clearOpen} onOpenChange={setClearOpen}>
        <AlertDialog.Backdrop>
          <AlertDialog.Container>
            <AlertDialog.Dialog className="sm:max-w-[420px]">
              <AlertDialog.CloseTrigger />
              <AlertDialog.Header>
                <AlertDialog.Icon status="danger" />
                <AlertDialog.Heading>Clear all audit logs?</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <p className="text-sm text-default-500">
                  This action cannot be undone. All audit log entries will be permanently deleted.
                </p>
              </AlertDialog.Body>
              <AlertDialog.Footer className="flex justify-end gap-3">
                <Button variant="tertiary" isDisabled={clearing} onPress={() => setClearOpen(false)}>
                  Cancel
                </Button>
                <Button variant="danger" isPending={clearing} onPress={handleClearAll}>
                  {clearing ? "Deleting..." : "Delete All"}
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>

      <Card className="overflow-hidden border-none bg-content1 shadow-sm">
        <Card.Content className="p-0">
          <Table aria-label="Audit log table" className="bg-transparent">
            <Table.ScrollContainer>
              <Table.Content>
                <Table.Header>
                  <Table.Column
                    isRowHeader
                    className="border-b border-divider bg-transparent text-[10px] font-bold uppercase tracking-wider text-default-500"
                  >
                    Action
                  </Table.Column>
                  <Table.Column className="border-b border-divider bg-transparent text-[10px] font-bold uppercase tracking-wider text-default-500">
                    Detail
                  </Table.Column>
                  <Table.Column className="border-b border-divider bg-transparent text-[10px] font-bold uppercase tracking-wider text-default-500">
                    User
                  </Table.Column>
                  <Table.Column className="border-b border-divider bg-transparent text-[10px] font-bold uppercase tracking-wider text-default-500">
                    Document
                  </Table.Column>
                  <Table.Column className="border-b border-divider bg-transparent text-right text-[10px] font-bold uppercase tracking-wider text-default-500">
                    Timestamp
                  </Table.Column>
                </Table.Header>

                <Table.Body>
                  {loading ? (
                    <Table.Row>
                      <Table.Cell className="py-10 text-center" colSpan={5}>
                        <div className="flex justify-center">
                          <Spinner />
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ) : entries.length === 0 ? (
                    <Table.Row>
                      <Table.Cell className="py-10 text-center italic text-default-400" colSpan={5}>
                        Log activity records not found.
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    entries.map((entry) => (
                      <Table.Row
                        key={entry.id}
                        className="border-b border-divider/50 transition-colors hover:bg-default-50"
                      >
                        <Table.Cell>
                          <Chip
                            size="sm"
                            variant="soft"
                            color={actionColors[entry.action] || "default"}
                          >
                            {getActionLabel(entry.action)}
                          </Chip>
                        </Table.Cell>
                        <Table.Cell className="text-sm text-foreground max-w-[300px] truncate">
                          {entry.detail || "-"}
                        </Table.Cell>
                        <Table.Cell className="text-sm text-foreground font-medium">
                          {entry.userName}
                        </Table.Cell>
                        <Table.Cell className="text-sm text-default-500 max-w-[200px] truncate">
                          {entry.documentTitle || "-"}
                        </Table.Cell>
                        <Table.Cell className="text-right text-xs text-default-400 whitespace-nowrap">
                          {new Date(entry.createdAt).toLocaleString("id-ID", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Table.Cell>
                      </Table.Row>
                    ))
                  )}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        </Card.Content>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            isDisabled={page <= 1}
            size="sm"
            variant="ghost"
            onPress={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-xs text-default-500">
            Page {page} of {totalPages}
          </span>
          <Button
            isDisabled={page >= totalPages}
            size="sm"
            variant="ghost"
            onPress={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
