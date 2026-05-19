import { Avatar, Button, Chip, Table, Tooltip } from "@heroui/react";
import { CheckCircle2, XCircle } from "lucide-react";
import { FC, memo } from "react";

import {
  ApprovalDocument,
  getFileExt,
  getSourceChipProps,
  getSourceLabel,
} from "./types";

interface ApprovalRowProps {
  doc: ApprovalDocument;
  onApprove: (doc: ApprovalDocument) => void;
  onReject: (doc: ApprovalDocument) => void;
}

export const ApprovalRow: FC<ApprovalRowProps> = memo(
  ({ doc, onApprove, onReject }) => (
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
  ),
);

ApprovalRow.displayName = "ApprovalRow";
