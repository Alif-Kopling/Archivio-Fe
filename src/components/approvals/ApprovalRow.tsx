import { Avatar, Button, Chip, Table, Tooltip } from "@heroui/react";
import { CheckCircle2, XCircle, Eye, Users } from "lucide-react";
import { FC, memo } from "react";
import { motion } from "framer-motion";

import {
  ApprovalDocument,
  getFileExt,
  getSourceChipProps,
  getSourceLabel,
} from "./types";

import { getStatusInfo, getApprovalProgress } from "@/utils/document";

interface ApprovalRowProps {
  doc: ApprovalDocument;
  onApprove: (doc: ApprovalDocument) => void;
  onReject: (doc: ApprovalDocument) => void;
  onPreview: (doc: ApprovalDocument) => void;
  index?: number;
}

export const ApprovalRow: FC<ApprovalRowProps> = memo(
  ({ doc, onApprove, onReject, onPreview, index = 0 }) => {
    const { label, color } = getStatusInfo(
      doc.status,
      doc.approverIds,
      doc.approvedByIds,
    );
    const { approvedCount, totalCount } = getApprovalProgress(
      doc.approverIds,
      doc.approvedByIds,
    );

    return (
      <Table.Row
        key={`${doc.sourceType}-${doc.id}`}
        className="group border-b border-white/10 hover:bg-white/5 transition-all duration-300"
        style={{ animation: `fadeIn 0.25s ease-out ${index * 30}ms both` }}
      >
        <Table.Cell>
          <div className="flex items-center gap-3 py-1">
            <Avatar
              className="bg-primary/20 text-primary backdrop-blur-sm"
              size="sm"
            >
              <Avatar.Fallback className="text-[10px] font-bold">
                {getFileExt(doc.filePath)}
              </Avatar.Fallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors truncate">
                {doc.title}
              </span>
              {totalCount > 0 && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-16 h-1 rounded-full bg-default-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-warning transition-all duration-500"
                      style={{ width: `${(approvedCount / totalCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-medium text-default-400 flex items-center gap-0.5">
                    <Users size={8} />
                    {approvedCount}/{totalCount}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Table.Cell>
        <Table.Cell>
          <Chip
            className={`capitalize border-none ${getSourceChipProps(doc.sourceType).className}`}
            size="sm"
            variant="soft"
          >
            {getSourceLabel(doc.sourceType)}
          </Chip>
        </Table.Cell>
        <Table.Cell>
          <Chip
            className="font-bold border-none h-6 px-3 text-[10px] shadow-sm backdrop-blur-md"
            color={color as any}
            size="sm"
            variant="soft"
          >
            {label}
          </Chip>
        </Table.Cell>
        <Table.Cell className="text-default-500 text-sm">
          {new Date(doc.createdAt).toLocaleDateString()}
        </Table.Cell>
        <Table.Cell>
          <motion.div
            className="flex gap-2 justify-center opacity-60 group-hover:opacity-100 transition-opacity"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.03 + 0.1 }}
          >
            <Tooltip>
              <Tooltip.Trigger>
                <Button
                  isIconOnly
                  className="text-primary bg-primary/10 hover:bg-primary/20 backdrop-blur-sm"
                  size="sm"
                  variant="ghost"
                  onClick={() => onPreview(doc)}
                >
                  <Eye size={16} />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>Preview Document</Tooltip.Content>
            </Tooltip>
            <Tooltip>
              <Tooltip.Trigger>
                <Button
                  isIconOnly
                  className="text-success bg-success/10 hover:bg-success/20 backdrop-blur-sm"
                  isDisabled={approvedCount >= totalCount && totalCount > 0}
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
                  className="text-danger bg-danger/10 hover:bg-danger/20 backdrop-blur-sm"
                  size="sm"
                  variant="ghost"
                  onClick={() => onReject(doc)}
                >
                  <XCircle size={16} />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>Reject Document</Tooltip.Content>
            </Tooltip>
          </motion.div>
        </Table.Cell>
      </Table.Row>
    );
  },
);

ApprovalRow.displayName = "ApprovalRow";