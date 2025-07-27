// AnonymousCoachingScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { supabase } from '../lib/supabase';

interface Group {
  id: string;
  name: string;
  created_at: string;
}

const AnonymousCoachingScreen = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchGroups = async () => {
    const { data, error } = await supabase.from('coaching_groups').select('*').order('created_at', { ascending: false });
    if (error) console.error(error);
    else setGroups(data);
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) return;
    setLoading(true);
    const { error } = await supabase.from('coaching_groups').insert({ name: newGroupName.trim() });
    if (error) console.error(error);
    setNewGroupName('');
    await fetchGroups();
    setLoading(false);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const renderGroup = ({ item }: { item: Group }) => (
    <View style={styles.groupCard}>
      <Text style={styles.groupName}>{item.name}</Text>
      <Text style={styles.groupMeta}>Created: {new Date(item.created_at).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🤝 Anonymous Coaching Groups</Text>

      <TextInput
        placeholder="Enter new group name"
        value={newGroupName}
        onChangeText={setNewGroupName}
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={createGroup} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Group'}</Text>
      </TouchableOpacity>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={renderGroup}
        contentContainerStyle={styles.groupList}
      />
    </View>
  );
};

export default AnonymousCoachingScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#6c47ff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  groupList: { gap: 10 },
  groupCard: {
    padding: 12,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
  groupName: { fontWeight: 'bold', fontSize: 16 },
  groupMeta: { color: '#777', fontSize: 12 },
});
