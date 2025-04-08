import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/admin.service';

const BulkCreateUsers: React.FC = () => {
  const [userText, setUserText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{
    created: Array<{ email: string; username: string }>;
    skipped: Array<{ email: string; reason: string }>;
  } | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Parse the text input
      const users = userText.split('\n')
        .map(line => {
          const [email, username, password] = line.split(',').map(s => s.trim());
          return { email, username, password };
        })
        .filter(user => user.email && user.username && user.password);

      const response = await adminService.bulkCreateUsers(users);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Bulk Create Users</h1>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="text-indigo-600 hover:text-indigo-900"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-medium text-gray-900">Instructions</h2>
            <p className="text-gray-600">
              Enter one user per line in the format: email,username,password
            </p>
            <p className="text-gray-600">
              Example:<br />
              student1@example.com,Student One,password123<br />
              student2@example.com,Student Two,password456
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <textarea
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
                rows={10}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 font-mono"
                placeholder="Enter user data here..."
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !userText.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Creating Users...' : 'Create Users'}
            </button>
          </form>

          {result && (
            <div className="space-y-4">
              <div className="rounded-md bg-green-50 p-4">
                <h3 className="text-lg font-medium text-green-800 mb-2">Results</h3>
                <p className="text-green-700">
                  Successfully created {result.created.length} users
                </p>
                {result.skipped.length > 0 && (
                  <p className="text-amber-700 mt-2">
                    Skipped {result.skipped.length} users
                  </p>
                )}
              </div>

              {result.created.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Created Users:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {result.created.map((user, i) => (
                      <li key={i}>
                        {user.username} ({user.email})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.skipped.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Skipped Users:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {result.skipped.map((user, i) => (
                      <li key={i}>
                        {user.email} - {user.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkCreateUsers;
