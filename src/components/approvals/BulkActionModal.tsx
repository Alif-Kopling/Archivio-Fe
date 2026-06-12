import { Button, Modal } from "@heroui/react";
import { AlertTriangle, Terminal, Zap } from "lucide-react";
import { FC } from "react";
import { motion } from "framer-motion";

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
}) => {
  const isApprove = magicAction === "approve";

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop
        className={isApprove
          ? "bg-gradient-to-t from-primary/20 to-black/40"
          : "bg-gradient-to-t from-danger/20 to-black/40"
        }
        variant="blur"
      >
        <Modal.Container placement="center">
          <Modal.Dialog>
            {() => (
              <>
                <Modal.Header>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Modal.Icon>
                      {isApprove ? (
                        <Terminal className="text-primary" size={20} />
                      ) : (
                        <AlertTriangle className="text-danger" size={20} />
                      )}
                    </Modal.Icon>
                  </motion.div>
                  <Modal.Heading
                    className={isApprove ? "text-primary" : "text-danger"}
                  >
                    {isApprove
                      ? "Confirm Bulk Authorization"
                      : "Confirm Bulk Rejection"}
                  </Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-default-50 dark:bg-default-100/5">
                    <Zap size={18} className={`mt-0.5 ${isApprove ? "text-primary" : "text-danger"}`} />
                    <div>
                      <p className="font-medium text-sm">
                        Batch command:{" "}
                        <code className="bg-default-100 px-1 rounded text-xs font-mono">
                          /bulk {magicAction}
                        </code>
                      </p>
                      <p className="text-default-500 text-xs mt-1">
                        Apply {isApprove ? "authorization" : "rejection"} to
                        all selected documents.
                      </p>
                    </div>
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="tertiary" onPress={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      variant={isApprove ? "primary" : "danger"}
                      onPress={onConfirm}
                    >
                      {isApprove ? "Authorize Batch" : "Execute Rejection"}
                    </Button>
                  </motion.div>
                </Modal.Footer>
              </>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};