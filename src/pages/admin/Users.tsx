import { useCallback, useEffect, useState } from "react";
import { Card, Spinner, Table } from "@heroui/react";
import { Shield } from "lucide-react";

import api from "@/lib/axios";
import {
  AddMemberModal,
  UserSearchHeader,
  UserTableRow,
  UserData,
} from "@/components/users";

function sortUsersByRole(users: UserData[]): UserData[] {
  return [...users].sort((a, b) => {
    const aIsAdmin = a.role.toLowerCase() === "admin";
    const bIsAdmin = b.role.toLowerCase() === "admin";

    if (aIsAdmin && !bIsAdmin) return -1;
    if (!aIsAdmin && bIsAdmin) return 1;

    return 0;
  });
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/users", {
        params: { search: searchQuery },
      });

      const fetchedUsers = Array.isArray(response.data) ? response.data : [];

      setUsers(sortUsersByRole(fetchedUsers));
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 500);

    return () => clearTimeout(timer);
  }, [fetchUsers]);

  return (
    <div className="flex w-full flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-sm text-default-500">
              Monitor and manage system access for all registered members.
            </p>
          </div>
        </div>

        <AddMemberModal onSuccess={fetchUsers} />
      </div>

      <Card className="overflow-hidden border-none bg-content1 shadow-sm">
        <UserSearchHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <Card.Content className="p-0">
          <Table aria-label="User management table" className="bg-transparent">
            <Table.ScrollContainer>
              <Table.Content>
                <Table.Header>
                  <Table.Column
                    isRowHeader
                    className="border-b border-divider bg-transparent text-[10px] font-bold uppercase tracking-wider text-default-500"
                  >
                    User Profile
                  </Table.Column>
                  <Table.Column className="border-b border-divider bg-transparent text-[10px] font-bold uppercase tracking-wider text-default-500">
                    Role
                  </Table.Column>
                  <Table.Column className="border-b border-divider bg-transparent text-center text-[10px] font-bold uppercase tracking-wider text-default-500">
                    Document Count
                  </Table.Column>
                  <Table.Column className="border-b border-divider bg-transparent text-center text-[10px] font-bold uppercase tracking-wider text-default-500">
                    Actions
                  </Table.Column>
                </Table.Header>

                <Table.Body>
                  {loading ? (
                    <Table.Row>
                      <Table.Cell className="py-10 text-center" colSpan={4}>
                        <div className="flex justify-center">
                          <Spinner />
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ) : users.length === 0 ? (
                    <Table.Row>
                      <Table.Cell
                        className="py-10 text-center italic text-default-400"
                        colSpan={4}
                      >
                        No matching user records identified.
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    users.map((user) => (
                      <UserTableRow
                        key={user.id}
                        user={user}
                        onUserDeleted={fetchUsers}
                      />
                    ))
                  )}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        </Card.Content>
      </Card>
    </div>
  );
}
