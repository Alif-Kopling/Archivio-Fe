import { useMemo, useState } from "react";
import { Card, Spinner, Table } from "@heroui/react";
import { Shield, Users, UserCog, UserRound, Search } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

import api from "@/lib/axios";
import { useDebounce } from "@/hooks/useDebounce";
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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

export default function UserManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [roleFilter, setRoleFilter] = useState("all");

  const { data: users = [], isLoading: loading, refetch } = useQuery<UserData[]>({
    queryKey: ["users", { search: debouncedSearch }],
    queryFn: async () => {
      const response = await api.get("/users", {
        params: { search: debouncedSearch },
      });
      const fetchedUsers = Array.isArray(response.data) ? response.data : [];
      return sortUsersByRole(fetchedUsers);
    },
  });

  const filteredUsers = useMemo(() => {
    if (roleFilter === "all") return users;
    return users.filter((u) => u.role.toLowerCase() === roleFilter);
  }, [users, roleFilter]);

  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role.toLowerCase() === "admin").length;
    const staff = total - admins;
    return { total, admins, staff };
  }, [users]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex w-full flex-col gap-6"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="relative p-2.5 rounded-xl bg-primary/10 text-primary overflow-hidden">
            <Shield size={22} />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">User Management</h1>
            <p className="text-sm text-default-500">
              Monitor and manage system access for all registered members.
            </p>
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <AddMemberModal onSuccess={() => refetch()} />
        </motion.div>
      </motion.div>

      {/* Role Distribution Summary */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Total Members", value: stats.total, Icon: Users, color: "text-primary", bg: "bg-primary/10" },
          { label: "Administrators", value: stats.admins, Icon: UserCog, color: "text-warning", bg: "bg-warning/10" },
          { label: "Staff Members", value: stats.staff, Icon: UserRound, color: "text-default-500", bg: "bg-default-100" },
        ].map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="flex items-center gap-3 rounded-xl border border-divider bg-content1 p-3.5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center ${color}`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-xs text-default-400 font-medium">{label}</p>
              <p className="text-lg font-bold text-foreground">{value}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Table Card */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden border-none bg-content1 shadow-sm">
          <UserSearchHeader
            roleFilter={roleFilter}
            searchQuery={searchQuery}
            onRoleFilterChange={setRoleFilter}
            onSearchChange={setSearchQuery}
            stats={stats}
          />

          <Card.Content className="p-0">
            <Table aria-label="User management table" className="bg-transparent">
              <Table.ScrollContainer>
                <Table.Content>
                  <Table.Header>
                    <Table.Column className="border-b border-divider bg-transparent text-[10px] font-bold uppercase tracking-wider text-default-500">
                      User Profile
                    </Table.Column>
                    <Table.Column className="border-b border-divider bg-transparent text-[10px] font-bold uppercase tracking-wider text-default-500">
                      Role
                    </Table.Column>
                    <Table.Column className="border-b border-divider bg-transparent text-center text-[10px] font-bold uppercase tracking-wider text-default-500">
                      Documents
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
                    ) : filteredUsers.length === 0 ? (
                      <Table.Row>
                        <Table.Cell
                          className="py-10 text-center italic text-default-400"
                          colSpan={4}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Search size={24} className="text-default-300" />
                            {searchQuery.trim()
                              ? `"${searchQuery.trim()}" not found`
                              : "No matching user records identified."}
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ) : (
                      filteredUsers.map((user, idx) => (
                        <UserTableRow
                          key={user.id}
                          user={user}
                          index={idx}
                          onUserDeleted={() => refetch()}
                        />
                      ))
                    )}
                  </Table.Body>
                </Table.Content>
              </Table.ScrollContainer>
            </Table>
          </Card.Content>
        </Card>
      </motion.div>
    </motion.div>
  );
}