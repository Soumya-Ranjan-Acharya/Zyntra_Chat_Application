import { socketService } from './socketService';

export const initSocket = () => socketService.initSocket();
export const getSocket = () => socketService.getSocket();
export const joinChatRoom = (roomId) => socketService.joinChatRoom(roomId);
export const leaveChatRoom = (roomId) => socketService.leaveChatRoom(roomId);
export const emitSocketMessage = (data) => socketService.sendMessage(data);
export const emitTyping = (roomId, userName, userId, isTyping) => socketService.emitTyping(roomId, isTyping);
export const emitReaction = (messageId, emoji, userId, chatId) => socketService.sendReaction(messageId, emoji, chatId);
export const emitAvatarUpdate = (username, avatar) => socketService.emitAvatarUpdate(username, avatar);

export default socketService;
