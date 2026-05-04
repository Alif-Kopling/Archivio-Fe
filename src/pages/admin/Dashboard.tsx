/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { FC, useEffect, useState, useCallback } from "react";
import { Card, Button, Avatar, Table, Chip, Tooltip, SearchField } from "@heroui/react";
import {
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  LayoutDashboard,
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
import { ThemeSwitch } from "@/components/theme-switch";

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
  sourceType: "incoming" | "outgoing" | "certificate";
}

const isPendingStatus = (status?: string) => {
  const normalizedStatus = status?.toLowerCase();

  return (
    normalizedStatus === "pending" ||
    normalizedStatus === "draft" ||
    normalizedStatus === "submitted" ||
    normalizedStatus === "review" ||
    normalizedStatus === "waiting"
  );
};

const isVerifiedStatus = (status?: string) => {
  const normalizedStatus = status?.toLowerCase();

  return (
    normalizedStatus === "final" ||
    normalizedStatus === "approved" ||
    normalizedStatus === "approve" ||
    normalizedStatus === "publish" ||
    normalizedStatus === "published"
  );
};

const getFileExt = (filePath?: string) => {
  if (!filePath) return "FILE";

  return filePath.split(".").pop()?.toUpperCase() || "FILE";
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
      <SearchField
        className="w-48 md:w-64"
      >
        <SearchField.Group className="w-full">
          <SearchField.SearchIcon />
          <SearchField.Input placeholder="Search..." />
        </SearchField.Group>
      </SearchField>
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

const StatsGrid: FC<{ stats: Stats }> = ({ stats }) => {
  const data = [
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
  ];

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
};

const ChartsSection: FC<{ stats: Stats }> = ({ stats }) => {
  const barData = [
    { name: "Pending", count: stats.pending, fill: "#f5a524" },
    { name: "Verified", count: stats.verified, fill: "#17c964" },
    { name: "Total", count: stats.total, fill: "#006fee" },
  ];

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
                data={[
                  { name: "Mon", v: Math.floor(stats.total * 0.2) },
                  { name: "Tue", v: Math.floor(stats.total * 0.5) },
                  { name: "Wed", v: Math.floor(stats.total * 0.3) },
                  { name: "Thu", v: Math.floor(stats.total * 0.7) },
                  { name: "Fri", v: stats.total },
                ]}
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
};

const ApprovalTable: FC<{
  documents: Document[];
  onApprove: (doc: Document) => void;
  onReject: (doc: Document) => void;
}> = ({ documents, onApprove, onReject }) => (
  <div className="mb-8">
    <div className="flex justify-between items-center mb-4">
      <h4 className="text-lg font-bold">
        Pending Approvals
        <Chip
          className="ml-2 bg-default-100 text-default-500"
          size="sm"
          variant="soft"
        >
          {documents.length}
        </Chip>
      </h4>
    </div>

    <Card className="bg-content1 border-divider shadow-none">
      <Table aria-label="Approval table" className="bg-transparent">
        <Table.ScrollContainer>
          <Table.Content>
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
                  <Table.Row
                    key={`${doc.sourceType}-${doc.id}`}
                    className="border-b border-divider/50 hover:bg-default-100/50 transition-colors"
                  >
                    <Table.Cell>
                      <div className="flex items-center gap-3 py-1">
                        <Avatar
                          className="bg-primary/10 text-primary"
                          size="sm"
                        >
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
                ))
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </Card>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    verified: 0,
  });
  const [pendingDocs, setPendingDocs] = useState<Document[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [resMasuk, resKeluar, resSertifikat] = await Promise.all([
        api.get("/surat-masuk", { params: { page: 1, limit: 1000 } }),
        api.get("/surat-keluar", { params: { page: 1, limit: 1000 } }),
        api.get("/sertifikat", { params: { page: 1, limit: 1000 } }),
      ]);

      const masukPayload = resMasuk.data ?? {};
      const keluarPayload = resKeluar.data ?? {};
      const sertifikatPayload = resSertifikat.data ?? {};

      const dataMasuk = (Array.isArray(masukPayload.data) ? masukPayload.data : []).map(
        (d: any) => ({ ...d, sourceType: "incoming" }),
      );
      const dataKeluar = (
        Array.isArray(keluarPayload.data) ? keluarPayload.data : []
      ).map((d: any) => ({ ...d, sourceType: "outgoing" }));
      const dataSertifikat = (
        Array.isArray(sertifikatPayload.data) ? sertifikatPayload.data : []
      ).map((d: any) => ({ ...d, sourceType: "certificate" }));

      const combined = [...dataMasuk, ...dataKeluar, ...dataSertifikat].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      const pending = combined.filter((d) => isPendingStatus(d.status));
      const verified = combined.filter((d) => isVerifiedStatus(d.status));

      const total =
        Number(masukPayload.total || 0) +
        Number(keluarPayload.total || 0) +
        Number(sertifikatPayload.total || 0);
      const pendingTotal =
        Number(masukPayload.stats?.pending || 0) +
        Number(keluarPayload.stats?.pending || 0) +
        Number(sertifikatPayload.stats?.pending || 0);
      const verifiedTotal =
        Number(masukPayload.stats?.verified || 0) +
        Number(keluarPayload.stats?.verified || 0) +
        Number(sertifikatPayload.stats?.verified || 0);

      setStats({
        total,
        pending: pendingTotal || pending.length,
        verified: verifiedTotal || verified.length,
      });
      setPendingDocs(pending);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async (doc: Document) => {
    try {
      const endpoint =
        doc.sourceType === "incoming"
          ? `/surat-masuk/${doc.id}/approve`
          : doc.sourceType === "outgoing"
            ? `/surat-keluar/${doc.id}/approve`
            : `/sertifikat/${doc.id}/approve`;

      await api.patch(endpoint);
      alert("Document verified successfully!");
      fetchData();
    } catch (error) {
      alert("Failed to approve document. Check backend logs.");
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
      alert("Document rejected successfully!");
      fetchData();
    } catch (error) {
      alert("Failed to reject document. Check backend logs.");
    }
  };

  return (
    <div className="p-6 overflow-y-auto h-full">
      <Header />
      <StatsGrid stats={stats} />
      <ChartsSection stats={stats} />
      <ApprovalTable
        documents={pendingDocs}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
