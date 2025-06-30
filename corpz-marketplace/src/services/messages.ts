import { supabase } from './supabase';
import { Database } from './supabase';

type Message = Database['public']['Tables']['messages']['Row'];
type MessageInsert = Database['public']['Tables']['messages']['Insert'];

export const messagesService = {
  async sendMessage(receiverId: string, message: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        message,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getConversations() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .rpc('get_user_conversations', { user_id: user.id });

    if (error) {
      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(id, name, profile_pic),
          receiver:users!messages_receiver_id_fkey(id, name, profile_pic)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('timestamp', { ascending: false });

      if (msgError) throw msgError;

      const conversations = new Map();
      messages?.forEach(msg => {
        const otherUser = msg.sender_id === user.id ? msg.receiver : msg.sender;
        const key = otherUser.id;
        
        if (!conversations.has(key)) {
          conversations.set(key, {
            user: otherUser,
            lastMessage: msg.message,
            timestamp: msg.timestamp,
            unread: msg.receiver_id === user.id && !msg.read,
          });
        }
      });

      return Array.from(conversations.values());
    }

    return data;
  },

  async getMessages(otherUserId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, name, profile_pic),
        receiver:users!messages_receiver_id_fkey(id, name, profile_pic)
      `)
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
      .order('timestamp', { ascending: true });

    if (error) throw error;

    await supabase
      .from('messages')
      .update({ read: true })
      .eq('receiver_id', user.id)
      .eq('sender_id', otherUserId);

    return data;
  },

  async markAsRead(messageId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', messageId)
      .eq('receiver_id', user.id);

    if (error) throw error;
  },

  async getUnreadCount() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  },

  subscribeToMessages(otherUserId: string, onMessage: (message: any) => void) {
    const userId = supabase.auth.getUser().then(({ data: { user } }) => user?.id);
    if (!userId) return () => {};

    userId.then((id) => {
      if (!id) return;
      
      const subscription = supabase
        .channel(`messages:${id}:${otherUserId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `or(and(sender_id.eq.${id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${id}))`,
          },
          (payload) => {
            onMessage(payload.new);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    });

    return () => {};
  },
}; 