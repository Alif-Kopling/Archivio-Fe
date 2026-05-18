export { default as AddMemberModal } from "./AddMemberModal";
export { default as DeleteUserDialog } from "./DeleteUserDialog";
export { default as UserTableRow } from "./UserTableRow";
export { default as UserSearchHeader } from "./UserSearchHeader";

export interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  _count?: {
    documents: number;
  };
}
