import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useChat } from '../../context/ChatContext';

/**
 * "Message this person" from anywhere in the app.
 *
 * Screens live in different tab stacks, so the navigate call targets the Chat
 * tab explicitly and lets React Navigation bubble it up to the tab navigator.
 *
 * `initial: false` matters: without it, jumping straight to Conversation makes
 * it the *only* screen in the Chat stack, so Back falls through to whichever
 * tab you came from instead of the conversation list.
 */
const toConversation = (conversationId) => ({
  screen: 'Conversation',
  params: { conversationId },
  initial: false,
});

export default function useOpenChat() {
  const navigation = useNavigation();
  const { openDirectConversation } = useChat();

  /**
   * `context` is optional and describes why the chat is being opened — an event
   * they're going to, or one they posted. Messaging from a profile passes none.
   */
  const openDirectMessage = useCallback(
    (userId, context = null) => {
      if (!userId) return;
      const conversationId = openDirectConversation(userId, context);
      navigation.navigate('Chat', toConversation(conversationId));
    },
    [navigation, openDirectConversation]
  );

  const openConversation = useCallback(
    (conversationId) => {
      if (!conversationId) return;
      navigation.navigate('Chat', toConversation(conversationId));
    },
    [navigation]
  );

  return { openDirectMessage, openConversation };
}
