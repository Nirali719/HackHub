
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [editingUser, setEditingUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState("participant");
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState("");
    const navigate = useNavigate();

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/admin/users");
            setUsers(response.data.users || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load users. Please check your login and backend."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        const query = search.trim().toLowerCase();

        return users.filter((user) => {
            const matchesSearch =
                !query ||
                user.name?.toLowerCase().includes(query) ||
                user.email?.toLowerCase().includes(query) ||
                user.college?.toLowerCase().includes(query);

            const matchesRole =
                roleFilter === "all" || user.role === roleFilter;

            return matchesSearch && matchesRole;
        });
    }, [users, search, roleFilter]);

    const openEdit = (user) => {
        setEditingUser(user);
        setSelectedRole(user.role);
    };

    const saveRole = async () => {
        if (!editingUser) return;

        try {
            setSaving(true);

            const response = await api.put(
                `/admin/users/${editingUser._id}/role`,
                { role: selectedRole }
            );

            setUsers((previous) =>
                previous.map((user) =>
                    user._id === editingUser._id
                        ? { ...user, ...response.data.user }
                        : user
                )
            );

            setEditingUser(null);
            window.alert("User role updated successfully.");
        } catch (err) {
            window.alert(
                err.response?.data?.message || "Unable to update user role."
            );
        } finally {
            setSaving(false);
        }
    };

    const removeUser = async (user) => {
        if (!window.confirm(
            `Delete the account for ${user.name} (${user.email})? This action cannot be undone.`
        )) {
            return;
        }

        try {
            setDeletingId(user._id);

            await api.delete(`/admin/users/${user._id}`);

            setUsers((previous) =>
                previous.filter((item) => item._id !== user._id)
            );
        } catch (err) {
            window.alert(
                err.response?.data?.message || "Unable to delete user."
            );
        } finally {
            setDeletingId("");
        }
    };

    const counts = {
        all: users.length,
        participant: users.filter((user) => user.role === "participant").length,
        mentor: users.filter((user) => user.role === "mentor").length,
        judge: users.filter((user) => user.role === "judge").length,
        admin: users.filter((user) => user.role === "admin").length,
    };

    if (loading) {
        return <div className="admin-users-page"><p>Loading users...</p></div>;
    }

    return (
        <div className="admin-users-page">
            <div className="admin-users-heading">
                <div>
                    <p className="admin-users-eyebrow">ADMINISTRATION</p>
                    <h1>Users Management</h1>
                    <p>View users and manage their account roles.</p>
                </div>

                <button className="users-refresh-button" onClick={loadUsers}>
                    Refresh
                </button>
            </div>

            {error && (
                <div className="users-error">
                    {error}
                    <button onClick={loadUsers}>Try again</button>
                </div>
            )}

            <div className="users-stat-grid">
                {[
                    ["Total Users", counts.all],
                    ["Participants", counts.participant],
                    ["Mentors", counts.mentor],
                    ["Judges", counts.judge],
                    ["Admins", counts.admin],
                ].map(([label, count]) => (
                    <div className="users-stat-card" key={label}>
                        <span>{label}</span>
                        <strong>{count}</strong>
                    </div>
                ))}
            </div>

            <section className="users-table-panel">
                <div className="users-toolbar">
                    <input
                        type="search"
                        placeholder="Search name, email, or college..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />

                    <select
                        value={roleFilter}
                        onChange={(event) => setRoleFilter(event.target.value)}
                    >
                        <option value="all">All roles</option>
                        <option value="participant">Participants</option>
                        <option value="mentor">Mentors</option>
                        <option value="judge">Judges</option>
                        <option value="admin">Admins</option>
                    </select>
                </div>

                <div className="users-table-wrapper">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>College</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user._id}>
                                    <td>
                                        <div className="users-identity">
                                            <div className="users-avatar">
                                                {user.name?.charAt(0)?.toUpperCase() || "U"}
                                            </div>
                                            <div>
                                                <strong>{user.name}</strong>
                                                <span>{user.email}</span>
                                            </div>
                                        </div>
                                    </td>

                                    <td>{user.college || "—"}</td>

                                    <td>
                                        <span className={`users-role role-${user.role}`}>
                                            {user.role}
                                        </span>
                                    </td>

                                    <td>
                                        {user.createdAt
                                            ? new Date(user.createdAt).toLocaleDateString()
                                            : "—"}
                                    </td>

                                    <td>
                                        <div className="users-actions">
                                            <button
                                                className="users-edit-button"
                                                onClick={() => openEdit(user)}
                                            >
                                                Edit Role
                                            </button>

                                            <button
                                                className="users-delete-button"
                                                disabled={deletingId === user._id}
                                                onClick={() => removeUser(user)}
                                            >
                                                {deletingId === user._id
                                                    ? "Deleting..."
                                                    : "Delete"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="users-empty">
                                        No users match your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="users-table-footer">
                    Showing {filteredUsers.length} of {users.length} users
                </div>
            </section>

            {editingUser && (
                <div
                    className="users-modal-backdrop"
                    onClick={() => !saving && setEditingUser(null)}
                >
                    <div
                        className="users-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h2>Edit User Role</h2>
                        <p>
                            Change the role for <strong>{editingUser.name}</strong>.
                        </p>

                        <label htmlFor="user-role">Role</label>
                        <select
                            id="user-role"
                            value={selectedRole}
                            onChange={(event) => setSelectedRole(event.target.value)}
                        >
                            <option value="participant">Participant</option>
                            <option value="mentor">Mentor</option>
                            <option value="judge">Judge</option>
                            <option value="admin">Admin</option>
                        </select>

                        <div className="users-modal-actions">
                            <button
                                className="users-cancel-button"
                                disabled={saving}
                                onClick={() => setEditingUser(null)}
                            >
                                Cancel
                            </button>

                            <button
                                className="users-save-button"
                                disabled={saving}
                                onClick={saveRole}
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
