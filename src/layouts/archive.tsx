import { Outlet } from "react-router-dom";

export default function ArchiveLayout() {
  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex-1 min-h-0">
        <Outlet />
      </div>
    </div>
  );
}
