import { Avatar, Button, Chip, Table, Tooltip } from "@heroui/react";
import { CheckCircle2, XCircle } from "lucide-react";
import { FC, memo } from "react";

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
}

export const ApprovalRow: FC<ApprovalRowProps> = memo(
  ({ doc, onApprove, onReject }) => {
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
            <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
              {doc.title}
            </span>
          </div>
        </Table.Cell>
        <Table.Cell>
          <Chip
            className={`capitalize border-none ${getSourceChipProps(doc.sourceType).className}`}
            size="sm"
            variant="flat"
          >
            {getSourceLabel(doc.sourceType)}
          </Chip>
        </Table.Cell>
        <Table.Cell>
          <Chip
            className="font-bold border-none h-6 px-3 text-[10px] shadow-sm backdrop-blur-md"
            color={color as any}
            size="sm"
            variant="solid"
          >
            {label}
          </Chip>
        </Table.Cell>
        <Table.Cell className="text-default-500 text-sm">
          {new Date(doc.createdAt).toLocaleDateString()}
        </Table.Cell>
        <Table.Cell>
          <div className="flex gap-2 justify-center opacity-60 group-hover:opacity-100 transition-opacity">
            <Tooltip>
              <Tooltip.Trigger>
                <Button
                  isIconOnly
                  className="text-success bg-success/10 hover:bg-success/20 backdrop-blur-sm"
                  isDisabled={approvedCount >= totalCount && totalCount > 0}
                  size="sm"
                  variant="flat"
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
                  variant="flat"
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
    );
  },
);

ApprovalRow.displayName = "ApprovalRow";
