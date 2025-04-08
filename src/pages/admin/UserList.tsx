import React from 'react';

    const UserList: React.FC = () => {
      // TODO: Fetch and display list of users from /api/admin/users
      return (
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">User Management</h1>
          <p>List of registered users will be displayed here.</p>
          {/* Add table or list to display users */}
        </div>
      );
    };

    export default UserList;
