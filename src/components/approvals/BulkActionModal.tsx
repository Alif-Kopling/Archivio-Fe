import { Button, Modal } from "@heroui/react";
import { AlertTriangle, Terminal } from "lucide-react";
import { FC } from "react";

interface BulkActionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  magicAction: "approve" | "reject" | null;
  onConfirm: () => void;
}

export const BulkActionModal: FC<BulkActionModalProps> = ({
  isOpen,
  onOpenChange,
  magicAction,
  onConfirm,
}) => (
  <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
    <Modal.Backdrop
      className="bg-gradient-to-t from-primary/20 to-black/40 z-[9999]"
      variant="blur"
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
                <Modal.Heading
                  className={
                    magicAction === "approve" ? "text-primary" : "text-danger"
                  }
                >
                  {magicAction === "approve"
                    ? "Confirm Bulk Authorization"
                    : "Confirm Bulk Rejection"}
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p className="font-medium">
                  Initializing batch command:{" "}
                  <code className="bg-default-100 px-1 rounded">
                    /bulk {magicAction}
                  </code>
                </p>
                <p className="text-default-500 text-sm">
                  Apply{" "}
                  {magicAction === "approve" ? "authorization" : "rejection"} to
                  all selected documents.
                </p>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="tertiary" onPress={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  variant={magicAction === "approve" ? "primary" : "danger"}
                  onPress={onConfirm}
                >
                  {magicAction === "approve"
                    ? "Authorize Batch"
                    : "Execute Rejection"}
                </Button>
              </Modal.Footer>
            </>
          )}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  </Modal>
);
