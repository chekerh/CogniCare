import { useState, useEffect } from 'react';
import { supabase, Group, User } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Plus, Search, Settings } from 'lucide-react';
import { CreateGroupModal } from './CreateGroupModal';
import { GroupFeed } from './GroupFeed';

export function GroupsManager() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<(Group & { memberCount: number; isMember: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  useEffect(() => {
    loadGroups();
  }, [user]);

  const loadGroups = async () => {
    try {
      // Load all public groups and groups user is member of
      const { data: allGroups, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (groupsError) throw groupsError;

      // Get membership info
      const groupsWithMembership = await Promise.all(
        (allGroups || []).map(async (group) => {
          const { count } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          const { data: membership } = await supabase
            .from('group_members')
            .select('*')
            .eq('group_id', group.id)
            .eq('user_id', user!.id)
            .single();

          return {
            ...group,
            memberCount: count || 0,
            isMember: !!membership,
          };
        })
      );

      setGroups(groupsWithMembership);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async (groupId: string) => {
    try {
      const { error } = await supabase.from('group_members').insert({
        group_id: groupId,
        user_id: user!.id,
        role: 'member',
      });

      if (error) throw error;
      loadGroups();
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const leaveGroup = async (groupId: string) => {
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user!.id);

      if (error) throw error;
      loadGroups();
      if (selectedGroup?.id === groupId) {
        setSelectedGroup(null);
      }
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedGroup) {
    return (
      <GroupFeed
        group={selectedGroup}
        onBack={() => setSelectedGroup(null)}
        onLeave={() => leaveGroup(selectedGroup.id)}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2 space-x-reverse">
            <Users className="w-6 h-6 text-teal-600" />
            <span>المجموعات</span>
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 space-x-reverse bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>إنشاء مجموعة</span>
          </button>
        </div>

        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث عن مجموعة..."
            className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            dir="rtl"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <div
            key={group.id}
            className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => setSelectedGroup(group)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              {group.isMember && (
                <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full">
                  عضو
                </span>
              )}
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">{group.name}</h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{group.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 space-x-reverse text-sm text-gray-500">
                <Users className="w-4 h-4" />
                <span>{group.memberCount} عضو</span>
              </div>
              {!group.isMember ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    joinGroup(group.id);
                  }}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
                >
                  انضم
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    leaveGroup(group.id);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                >
                  اترك
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadGroups();
          }}
        />
      )}
    </div>
  );
}

