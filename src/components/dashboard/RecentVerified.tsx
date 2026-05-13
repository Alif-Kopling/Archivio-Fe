import { FC } from "react";
import { Card } from "@heroui/react";
import { FileCheck, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface RecentDoc {
  id: string | number;
  title: string;
  createdAt: string;
  type: string;
}

interface RecentVerifiedProps {
  docs: RecentDoc[];
}

export const RecentVerified: FC<RecentVerifiedProps> = ({ docs }) => (
  <Card className="bg-content1 border-divider shadow-sm rounded-3xl h-full">
    <Card.Content className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <FileCheck className="text-success" size={20} />
          <h4 className="font-bold text-lg">Recently Verified</h4>
        </div>
        <Link
          className="text-xs text-primary font-bold flex items-center gap-1 hover:underline"
          to="/archives"
        >
          View All <ChevronRight size={14} />
        </Link>
      </div>
      <div className="space-y-4">
        {docs.length === 0 ? (
          <p className="text-sm text-default-400 italic py-4">
            No recently verified documents.
          </p>
        ) : (
          docs.slice(0, 4).map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-default-50 border border-divider/50"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10 text-success">
                  <FileCheck size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold truncate max-w-[150px]">
                    {doc.title}
                  </p>
                  <p className="text-[10px] text-default-400 uppercase font-bold">
                    {doc.type}
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-default-400 font-medium">
                {new Date(doc.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </Card.Content>
  </Card>
);
