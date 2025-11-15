import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5050';

class SocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        upgrade: true,
      });

      this.socket.on('connect', () => {
        console.log('Connected to server:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
      });
    }

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Student methods
  joinStudentRoom(studentId: string): void {
    if (this.socket) {
      this.socket.emit('join-student-room', studentId);
    }
  }

  // Admin methods
  joinAdminRoom(): void {
    if (this.socket) {
      this.socket.emit('join-admin-room');
    }
  }

  // Listen for new announcements
  onNewAnnouncement(callback: (announcement: any) => void): void {
    if (this.socket) {
      this.socket.on('new-announcement', callback);
    }
  }

  // Admin announcement confirmation
  onAnnouncementSent(callback: (announcement: any) => void): void {
    if (this.socket) {
      this.socket.on('announcement-sent', callback);
    }
  }

  // Send announcement (admin only)
  sendAnnouncement(announcementData: any): void {
    if (this.socket) {
      this.socket.emit('send-announcement', announcementData);
    }
  }

  // Remove listeners
  off(event: string, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }
}

export const socketService = new SocketService();
export default socketService;