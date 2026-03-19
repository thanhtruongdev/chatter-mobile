# Cấu trúc dự án Chatter (Modular Architecture)

Dự án sử dụng **React Native với Expo Router**. Để đảm bảo ứng dụng dễ bảo trì, dễ mở rộng và chống phình to code, dự án áp dụng kiến trúc **Modular Architecture (Chia theo Module nghiệp vụ)**.

## Sơ đồ thư mục

```text
Chatter/
├── app/                        # 🚦 EXPO ROUTER: Chỉ dùng để map Route
│   ├── (auth)/                 # Route Authentication
│   │   ├── login.tsx           # -> export default từ src/modules/auth/screens/LoginScreen
│   │   └── _layout.tsx
│   ├── (tabs)/                 # Route Tabs (Điều hướng chính)
│   │   ├── _layout.tsx
│   │   ├── index.tsx           # -> export default từ src/modules/chat/screens/ChatListScreen
│   │   └── contacts.tsx        # -> export default từ src/modules/contacts/screens/ContactScreen
│   ├── chat/                   # Route Chat chi tiết
│   │   └── [id].tsx            # -> export default từ src/modules/chat/screens/ChatRoomScreen
│   └── _layout.tsx
│
├── src/                        # 📦 SOURCE CODE
│   ├── core/                   # 🛠 Phần Lõi dùng chung cho mọi modules (Core)
│   │   ├── api/                # Cấu hình Axios/Fetch chung, Interceptors
│   │   ├── components/         # UI Elements nguyên thủy (Button, Input, Text...)
│   │   ├── hooks/              # Global Hooks (VD: useKeyboard, useAppState)
│   │   ├── store/              # Global State (Zustand: Theme, Ngôn ngữ, Auth State)
│   │   ├── theme/              # Typography, Colors, Spacing
│   │   └── utils/              # Helper functions (Format ngày tháng, Validator...)
│   │
│   └── modules/                # ✨ CÁC MODULE NGHIỆP VỤ ĐỘC LẬP
│       │
│       ├── auth/               # 🔐 MODULE 1: XÁC THỰC
│       │   ├── components/     # Các component chỉ dùng cho Auth (SocialLoginButton, LoginForm)
│       │   ├── hooks/          # useAuth, useRegister...
│       │   ├── screens/        # Nơi chứa các màn hình (LoginScreen, RegisterScreen)
│       │   ├── services/       # File gọi API (login, verifyOTP)
│       │   ├── store/          # Zustand store lưu thông tin tạm thời của quá trình auth
│       │   ├── types.ts        # TypeScript model (User, Tokens)
│       │   └── index.ts        # Public API: export ra những component/logic cho phép module khác gọi
│       │
│       ├── chat/               # 💬 MODULE 2: NHẮN TIN
│       │   ├── components/     # MessageBubble, ChatInputBox, TypingIndicator, ConversationItem
│       │   ├── hooks/          # useChatSubscription, useSendMessage, useSockets
│       │   ├── screens/        # ChatListScreen, ChatRoomScreen
│       │   ├── services/       # Socket.io events, API fetch messages
│       │   ├── store/          # Zustand slice lưu cấu trúc chat room, messages (Global caching)
│       │   ├── types.ts        # Models: Message, Room, Attachment
│       │   └── index.ts        # Public API
│       │
│       ├── contacts/           # 👥 MODULE 3: DANH BẠ
│       │   ├── components/     # ContactItem, SearchBar, FriendRequestButton
│       │   ├── screens/        # ContactScreen, FriendRequestScreen
│       │   ├── services/       # API lấy danh bạ, kết bạn
│       │   └── index.ts        
│       │
│       └── media/              # 🖼 MODULE 4: TÀI LIỆU & ĐA PHƯƠNG TIỆN
│           ├── components/     # ImagePreview, VideoPlayer
│           ├── services/       # Logic Upload file, upload ảnh lên S3/Firebase
│           └── index.ts
│
├── assets/                     # Ảnh tĩnh, Fonts, Lottie animation...
└── constants/                  # Hằng số toàn cục (API_URL, KEYS)
```

## Nguyên tắc viết code (Rules)

1. **Expo Router làm nhiệm vụ điều hướng thuần túy:** Thư mục `app/` KHÔNG chứa logic nghiệp vụ, KHÔNG chứa UI phức tạp. Các file định tuyến trong `app/` chỉ gọi `export default` các Component Screen nằm trong `src/modules/.../screens`.
2. **Giới hạn truy cập (Encapsulation):** Các module không can thiệp trực tiếp sâu vào file của nhau. Mọi giao tiếp giữa các module (ví dụ Module Chat muốn gọi một component nhỏ của Module Auth) PHẢI gọi thông qua file `index.ts` của Module đó.
3. **Tách biệt UI và Data Fetching:** UI Components (trong thư mục `components/`) làm nhiệm vụ hiển thị và nhận dữ liệu qua Props. Logic gọi API, gọi Socket được code trong thư mục `services/` sau đó được đẩy vào các State hoặc Custom Hooks (trong thư mục `hooks/`). Cuối cùng Component gọi Hooks để lấy data render.
4. **Chia sẻ Component hợp lý:** Component dùng chung cho toàn dự án nằm ở `src/core/components`. Component đặc thù của tính năng nào thì chỉ được nằm ở thư mục `components` của module đó.
