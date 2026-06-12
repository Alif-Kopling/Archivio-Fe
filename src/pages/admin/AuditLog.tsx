import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertDialog, Button, Card, Chip, SearchField, Spinner, Table } from "@heroui/react";
import {
  History,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CalendarDays,
  Activity,
  Search,
  FileUp,
  CheckCircle,
  XCircle,
  Trash2 as TrashIcon,
  Download,
} from "lucide-react";
import { motion } from "framer-motion";

import api from "@/lib/axios";
import { AuditTimelineRow, type AuditEntry } from "@/components/audit";

interface AuditResponse {
  data: AuditEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const actionFilters = [
  { id: "all", label: "All", icon: Activity },
  { id: "create", label: "Upload", icon: FileUp },
  { id: "approve", label: "Approve", icon: CheckCircle },
  { id: "reject", label: "Reject", icon: XCircle },
  { id: "delete", label: "Delete", icon: TrashIcon },
  { id: "download", label: "Download", icon: Download },
];

const summaryCards = [
  { label: "Today", key: "today", Icon: Clock, color: "text-primary", bg: "bg-primary/10" },
  { label: "This Week", key: "week", Icon: CalendarDays, color: "text-warning", bg: "bg-warning/10" },
  { label: "Total", key: "total", Icon: Activity, color: "text-success", bg: "bg-success/10" },
];

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [clearOpen, setClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const limit = 20;

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<AuditResponse>("/audit", {
        params: { page, limit },
      });

      setEntries(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredEntries = useMemo(() => {
    let result = entries;

    if (actionFilter !== "all") {
      result = result.filter((e) => e.action === actionFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (e) =>
          e.userName.toLowerCase().includes(q) ||
          e.detail?.toLowerCase().includes(q) ||
          e.documentTitle?.toLowerCase().includes(q),
      );
    }

    return result;
  }, [entries, actionFilter, searchQuery]);

  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const today = entries.filter((e) => new Date(e.createdAt) >= todayStart).length;
    const week = entries.filter((e) => new Date(e.createdAt) >= weekStart).length;

    return { today, week, total };
  }, [entries, total]);

  const handleClearAll = async () => {
    try {
      setClearing(true);
      await api.delete("/audit");
      setClearOpen(false);
      setEntries([]);
      setPage(1);
      setTotalPages(1);
      setTotal(0);
    } catch (err) {
      console.error("Failed to clear audit logs:", err);
    } finally {
      setClearing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex w-full flex-col gap-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary relative overflow-hidden">
            <History size={22} />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Log Activity</h1>
            <p className="text-sm text-default-500">
              Track all activities done by users across the system.
            </p>
          </div>
        </div>

        <AlertDialog isOpen={clearOpen} onOpenChange={setClearOpen}>
          <AlertDialog.Trigger>
            <Button
              isDisabled={entries.length === 0}
              size="sm"
              variant="danger"
              className="font-semibold"
            >
              <Trash2 size={16} />
              Clear All
            </Button>
          </AlertDialog.Trigger>
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
                    This action cannot be undone. All audit log entries will be
                    permanently deleted.
                  </p>
                </AlertDialog.Body>
                <AlertDialog.Footer className="flex justify-end gap-3">
                  <Button
                    isDisabled={clearing}
                    variant="tertiary"
                    onPress={() => setClearOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    isPending={clearing}
                    variant="danger"
                    className="font-semibold"
                    onPress={handleClearAll}
                  >
                    {clearing ? "Deleting..." : "Delete All"}
                  </Button>
                </AlertDialog.Footer>
              </AlertDialog.Dialog>
            </AlertDialog.Container>
          </AlertDialog.Backdrop>
        </AlertDialog>
      </div>

      {/* Summary Stats */}
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        {summaryCards.map(({ label, Icon, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.04 }}
            className="flex items-center gap-3 rounded-xl border border-divider bg-content1 p-3.5 shadow-sm"
          >
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center ${color}`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-xs text-default-400 font-medium">{label}</p>
              <p className="text-lg font-bold text-foreground">
                {label === "Today" ? stats.today : label === "This Week" ? stats.week : stats.total}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Search + Filters */}
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.12 }}
        className="flex flex-col gap-3"
      >
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <SearchField
            aria-label="Search audit logs"
            className="w-full sm:max-w-[300px]"
            value={searchQuery}
            onChange={setSearchQuery}
          >
            <SearchField.Group className="w-full">
              <SearchField.SearchIcon>
                <Search size={14} />
              </SearchField.SearchIcon>
              <SearchField.Input placeholder="Search by user, action, document..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {actionFilters.map(({ id, label, icon: Icon }) => (
            <Chip
              key={id}
              className={`cursor-pointer transition-all duration-150 h-7 px-2.5 text-[10px] font-bold gap-1 ${
                actionFilter === id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-default-100 text-default-500 hover:bg-default-200"
              }`}
              size="sm"
              variant={actionFilter === id ? "primary" : "soft"}
              onClick={() => { setActionFilter(id); setPage(1); }}
            >
              {actionFilter === id && <Icon size={10} />}
              {label}
            </Chip>
          ))}
        </div>
      </motion.div>

      {/* Table */}
      <Card className="overflow-hidden border-none bg-content1 shadow-sm">
        <Card.Content className="p-0">
          <Table aria-label="Audit log table" className="bg-transparent">
            <Table.ScrollContainer>
              <Table.Content>
                <Table.Header>
                  <Table.Column className="border-b border-divider bg-transparent text-[10px] font-bold uppercase tracking-wider text-default-500 w-12">
                    <span className="sr-only">Timeline</span>
                  </Table.Column>
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
                      <Table.Cell className="py-10 text-center" colSpan={6}>
                        <div className="flex justify-center">
                          <Spinner />
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ) : filteredEntries.length === 0 ? (
                    <Table.Row>
                      <Table.Cell
                        className="py-10 text-center italic text-default-400"
                        colSpan={6}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Search size={24} className="text-default-300" />
                          Log activity records not found.
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    filteredEntries.map((entry, idx) => (
                      <AuditTimelineRow
                        key={entry.id}
                        entry={entry}
                        index={idx}
                      />
                    ))
                  )}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        </Card.Content>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-divider px-4 py-3">
            <span className="text-xs text-default-400">
              Page {page} of {totalPages} ({filteredEntries.length} entries)
            </span>
            <div className="flex items-center gap-2">
              <Button
                isDisabled={page <= 1}
                size="sm"
                variant="ghost"
                className="h-8 text-xs font-semibold"
                onPress={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={14} />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let p: number;
                  if (totalPages <= 7) {
                    p = i + 1;
                  } else if (page <= 4) {
                    p = i + 1;
                  } else if (page >= totalPages - 3) {
                    p = totalPages - 6 + i;
                  } else {
                    p = page - 3 + i;
                  }
                  return (
                    <button
                      key={p}
                      className={`w-7 h-7 rounded-lg text-[10px] font-bold transition-all duration-150 ${
                        p === page
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-default-400 hover:bg-default-100"
                      }`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
              <Button
                isDisabled={page >= totalPages}
                size="sm"
                variant="ghost"
                className="h-8 text-xs font-semibold"
                onPress={() => setPage((p) => p + 1)}
              >
                Next
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}