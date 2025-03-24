"use client"

import React, { useCallback } from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "react-bootstrap"
import { X, Check, CheckAll, ChevronDown } from "react-bootstrap-icons"
import { CSSTransition } from "react-transition-group"
import styles from "./index.module.scss"
import EmojiPicker, { SkinTones } from 'emoji-picker-react';
import emojiRegex from 'emoji-regex';
import { useSocket } from '../context/socketContext';
import Link from 'next/link';
import usePublicAuth from '@/hooks/usePublicAuth'; // 引入認證 hook
import { useRouter } from 'next/navigation'; // 使用 Next.js 13+ 的新路由系統

// 檢查兩個日期是否是同一天
const isSameDay = (date1, date2) => {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
};

// 根據時間差異格式化訊息時間
const formatMessageTime = (timestamp) => {
  const now = new Date();
  const messageDate = new Date(timestamp);

  // 檢查是否同一年
  const isSameYear = now.getFullYear() === messageDate.getFullYear();

  // 檢查是否同一天
  const isSameYearAndDay = isSameYear &&
    now.getMonth() === messageDate.getMonth() &&
    now.getDate() === messageDate.getDate();

  // 格式化時間
  const hours = messageDate.getHours().toString().padStart(2, '0');
  const minutes = messageDate.getMinutes().toString().padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  if (isSameYearAndDay) {
    return timeStr;
  } else if (isSameYear) {
    const month = messageDate.getMonth() + 1;
    const day = messageDate.getDate();
    return `${month}月${day}日 ${timeStr}`;
  } else {
    const year = messageDate.getFullYear();
    const month = messageDate.getMonth() + 1;
    const day = messageDate.getDate();
    return `${year}年${month}月${day}日 ${timeStr}`;
  }
};

const captureEmojiRegex = new RegExp(`(${emojiRegex().source})`, 'gu');

export default function ChatWidget() {
  // 使用 hook 取得登入狀態
  const { token, user } = usePublicAuth();
  const isAuthenticated = !!token;

  // 現有的狀態和 context
  const socketContext = useSocket();

  const {
    messages = [],
    sendMessage: socketSendMessage = () => { },
    markAsRead = () => { },
    isConnected = false,
    typingUsers = {},
    notifyTyping = () => { },
    setMessages = () => { }
  } = socketContext || {};

  // 其他原有狀態保持不變...
  const [isOpen, setIsOpen] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef(null)
  const chatBodyRef = useRef(null)
  const nodeRef = useRef(null)
  const buttonRef = useRef(null)
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [isEmojiHovered, setIsEmojiHovered] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = useRef(null);

  const [enlargeImage, setEnlargeImage] = useState(null);
  const [uploading, setUploading] = useState(false); // 添加上傳狀態
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = useCallback(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (chatBodyRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatBodyRef.current;
      const bottom = scrollHeight - scrollTop - clientHeight < 20;
      setIsNearBottom(bottom);
      setShowScrollButton(!bottom);
    }
  }, []);

  useEffect(() => {
    if (isOpen && messages.some(msg => !msg.read)) {
      markAsRead(); 
    }
  }, [messages]);

  useEffect(() => {
    const chatBody = chatBodyRef.current;
    if (chatBody) {
      chatBody.addEventListener('scroll', handleScroll);
      return () => chatBody.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // 分離滾動邏輯
  useEffect(() => {
    if (messages.length > 0) {
      // 只有當用戶在底部附近或新增用戶訊息時才滾動
      const lastMessageIsNew = messages[messages.length - 1].id === Date.now().toString();
      const lastMessageIsFromUser = messages[messages.length - 1].sender === 'user';

      if (isNearBottom && (lastMessageIsNew || lastMessageIsFromUser)) {
        scrollToBottom();
      }
    }
  }, [messages, isNearBottom, scrollToBottom]);


  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 300);
    }
  }, [isOpen, scrollToBottom]);

  // 修改 toggleChat 函數
  const toggleChat = () => {
    if (!isOpen) {
      // 先顯示聊天窗口
      setIsOpen(true);
      // 聊天窗口顯示後，滾動到底部
      setTimeout(scrollToBottom, 500);
    } else {
      // 關閉聊天窗口
      setIsOpen(false);
    }
  };

  // 顯示登入提示模態框的狀態和函數
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  // 顯示登入提示
  const showAuthModal = () => {
    // 這裡可以導航到登入頁面或顯示登入模態框
    // 目前簡單地設置狀態讓提示訊息出現
    setShowAuthPrompt(true);
  };

  // 修改訊息發送函數，增加登入檢查
  const handleSendMessage = (e) => {
    e.preventDefault();

    // 未登入時顯示提示
    if (!isAuthenticated) {
      showAuthModal();
      return;
    }

    // 原有的訊息發送邏輯...
    const hasText = newMessage.trim() !== "";
    const hasFiles = selectedFiles.length > 0;

    if (!hasText && !hasFiles) return;

    if (hasText) {
      const messageData = {
        message: {
          text: newMessage,
        }
      };

      socketSendMessage(messageData);
      setNewMessage("");
    }

    if (hasFiles) {
      selectedFiles.forEach(fileObj => {
        sendFileMessage(fileObj);
      });

      setSelectedFiles([]);
      setIsPreviewOpen(false);
    }

    setTimeout(scrollToBottom, 100);
  };

  const handleFileSelect = (e) => {
    if (!isAuthenticated) {
      showAuthModal();
      return;
    }

    const files = Array.from(e.target.files);

    // 檢查並處理文件
    const validFiles = files.filter(file => {
      // 驗證文件類型
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      // 如果是影片，檢查是否已有影片文件
      if (isVideo && (selectedFiles.some(f => f.type.startsWith('video/')) || files.filter(f => f.type.startsWith('video/')).length > 1)) {
        alert('一次只能上傳一個影片');
        return false;
      }

      return isImage || isVideo;
    });

    // 為每個文件添加 URL 和 ID
    const filesWithPreview = validFiles.map(file => ({
      file,
      id: Date.now() + Math.random().toString(36).substring(2),
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'video'
    }));

    setSelectedFiles(prev => [...prev, ...filesWithPreview]);
    setIsPreviewOpen(true);

    // 清空 input 以便重複選擇相同文件
    e.target.value = null;
  };

  const removeFile = (id) => {
    setSelectedFiles(prev => {
      const filtered = prev.filter(file => file.id !== id);
      if (filtered.length === 0) {
        setIsPreviewOpen(false);
      }
      return filtered;
    });
  };

  // 發送文件消息函數
  const sendFileMessage = async (fileObj) => {
    const isImage = fileObj.type === 'image';

    try {
      setUploading(true); // 添加上傳狀態

      // 創建 FormData 對象
      const formData = new FormData();
      formData.append('file', fileObj.file); // 添加文件

      // 發送到服務器
      const response = await fetch('https://lenstudio.onrender.com/api/uploads', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.status === 'success') {
        // 成功上傳後，發送消息
        const messageData = {
          message: {
            // text: isImage ? '圖片訊息' : '影片訊息',
            fileUrl: result.file.url, // 使用服務器返回的 URL
            fileType: result.file.type
          }
        };

        socketSendMessage(messageData);

      } else {
        console.error('文件上傳失敗:', result.message);
        alert('文件上傳失敗，請重試');
      }
    } catch (error) {
      console.error('上傳檔案時出錯:', error);
      alert('檔案上傳出錯，請重試');
    } finally {
      setUploading(false);
    }

    // 重置選擇的文件
    setSelectedFiles(prev => prev.filter(file => file.id !== fileObj.id));
    if (selectedFiles.length <= 1) {
      setIsPreviewOpen(false);
    }
  };

  const handleImageClick = (imageUrl) => {
    setEnlargeImage(imageUrl);
  };

  const closeImageViewer = () => {
    setEnlargeImage(null);
  };

  const onEmojiClick = (emojiData) => {
    // 在游標位置插入 emoji
    setNewMessage(prev =>
      prev.substring(0, document.getElementById('messageInput').selectionStart) +
      emojiData.emoji +
      prev.substring(0, document.getElementById('messageInput').selectionEnd)
    );
  };

  const toggleEmojiPicker = (e) => {
    if (!isAuthenticated) {
      showAuthModal();
      return;
    }

    // 原有的表情選擇器邏輯...
    setShowEmojiPicker(!showEmojiPicker);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target) &&
        !e.target.classList.contains(styles.emojiButton) &&
        !e.target.closest(`.${styles.emojiButton}`)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // 處理輸入中顯示
  const handleInputFocus = () => {
    notifyTyping(true);
  };

  const handleInputBlur = () => {
    notifyTyping(false);
  };

  // 在現有函數中添加這個函數
  const renderMessageContent = (message) => {
    // 如果消息包含文件URL
    if (message.fileUrl) {
      if (message.fileType === 'image') {
        return (
          <div className={styles.imageContainer}>
            <img
              src={message.fileUrl}
              alt="圖片消息"
              className={styles.messageImage}
              onClick={() => handleImageClick(message.fileUrl)} // 改為使用預覽功能
            />
            {message.text && <div className={styles.imageCaption}>{message.text}</div>}
          </div>
        );
      } else if (message.fileType === 'video') {
        return (
          <div className={styles.videoContainer}>
            <video
              src={message.fileUrl}
              controls
              className={styles.messageVideo}
              onError={(e) => console.error("影片加載錯誤", e)}
            />
            {message.text && <div className={styles.videoCaption}>{message.text}</div>}
          </div>
        );
      }
    }

    // 處理文本消息，支持表情符號
    return (
      <div>
        {message.text.split(captureEmojiRegex).map((part, index) => {
          return captureEmojiRegex.test(part) ? (
            <span key={index} className={styles.emoji}>{part}</span>
          ) : (
            <span key={index}>{part}</span>
          );
        })}
      </div>
    );
  };

  useEffect(() => {
    if (!socketContext || !socketContext.socket) return;
  
    const handleMessagesRead = (payload) => {
      console.log('收到訊息已讀更新(user端):', payload);
      // 統一取得 messageIds (如果 payload 是陣列，直接使用；如果是物件則取 payload.messageIds)
      const messageIds = Array.isArray(payload) ? payload : payload.messageIds;
      if (!messageIds) return;
      setMessages(prevMessages => prevMessages.map(msg =>
        messageIds.includes(msg.id) ? { ...msg, read: true } : msg
      ));
    };
  
    socketContext.socket.on('messages_read', handleMessagesRead);
  
    return () => {
      socketContext.socket.off('messages_read', handleMessagesRead);
    };
  }, [socketContext, setMessages]);

  // 添加在 useEffect 裡，當用戶打開聊天室或訊息更新時自動標記已讀

  // 在聊天窗口打開時自動標記已讀
  useEffect(() => {
    if (isOpen && messages.some(msg => !msg.read)) {
      setTimeout(() => {
        markAsRead(); // 此函式會發送 socket.emit('mark_as_read', { messageIds, userId })
      }, 300);
    }
  }, [isOpen, messages, markAsRead]);

  // 添加滾動監聽，當用戶查看訊息時標記為已讀
  useEffect(() => {
    const handleScroll = () => {
      if (chatBodyRef.current) {
        // 使用 IntersectionObserver 或類似技術可以更精確判斷
        // 這裡簡單實作：當滾動發生時標記訊息
        if (isOpen && markAsRead) {
          markAsRead();
        }
      }
    };

    const chatBody = chatBodyRef.current;
    if (chatBody) {
      chatBody.addEventListener('scroll', handleScroll);
      return () => chatBody.removeEventListener('scroll', handleScroll);
    }
  }, [isOpen, markAsRead]);

  const router = useRouter();

  const handleLoginRedirect = () => {
    router.push('/login');
    // 使用 setTimeout 確保導航完成後再滾動
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  };

  return (
    <div className={styles.chatWidgetContainer}>
      <CSSTransition
        in={isOpen}
        timeout={450}  // 增加總時間，包含延遲
        classNames={{
          enter: styles.chatWindowEnter,
          enterActive: styles.chatWindowEnterActive,
          exit: styles.chatWindowExit,
          exitActive: styles.chatWindowExitActive,
        }}
        unmountOnExit
        nodeRef={nodeRef}
      >
        <div ref={nodeRef} className={styles.chatWindow}>
          <div className={styles.mainChat}>
            <div className={styles.chatHeader}>
              <div className={styles.headerUserInfo}>
                <div className={styles.userName}>客服中心</div>
              </div>
              <button className={styles.iconButton} onClick={toggleChat}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.chatBody} ref={chatBodyRef} onScroll={handleScroll}>
              <div className={styles.messagesContainer}>
                {messages.map((message, index) => {
                  const isPrevSameSender = index > 0 && messages[index - 1].sender === message.sender;
                  const isNextSameSender = index < messages.length - 1 && messages[index + 1].sender === message.sender;

                  // 檢查是否需要顯示時間標記 - 當發送者改變時
                  const isPrevDifferentSender = index > 0 && messages[index - 1].sender !== message.sender;

                  // 檢查是否與前一則訊息日期不同 - 跨天顯示
                  const isPrevDifferentDay = index > 0 &&
                    !isSameDay(new Date(messages[index - 1].timestamp), new Date(message.timestamp));

                  // 顯示時間的條件：發送者變更或跨天
                  const shouldShowTime = isPrevDifferentSender || isPrevDifferentDay;

                  // 決定氣泡類型
                  let bubblePosition = '';
                  if (!isPrevSameSender && !isNextSameSender) {
                    bubblePosition = 'single';
                  } else if (!isPrevSameSender && isNextSameSender) {
                    bubblePosition = 'first';
                  } else if (isPrevSameSender && isNextSameSender) {
                    bubblePosition = 'middle';
                  } else {
                    bubblePosition = 'last';
                  }

                  const showAvatar = !isNextSameSender;

                  const regex = emojiRegex();

                  return (
                    <React.Fragment key={message.id}>
                      {/* 時間標記 */}
                      {shouldShowTime && (
                        <div className={styles.timeLabel}>
                          {formatMessageTime(message.timestamp)}
                        </div>
                      )}

                      {/* 原本的訊息行 */}
                      <div
                        className={`${styles.messageRow} ${message.sender === "user" ? styles.userMessageRow : styles.agentMessageRow}`}
                      >
                        {message.sender === "agent" && showAvatar && (
                          <div className={styles.avatarContainer}>
                            <img
                              src={message.avatar || "/images/chatRoom/server.jpg"}
                              alt="Agent"
                              className={styles.avatar}
                            />
                          </div>
                        )}

                        <div
                          className={`${styles.message} ${message.sender === "user" ? styles.userMessage : styles.agentMessage} ${styles[`bubble-${bubblePosition}`]}`}
                        >
                          {/* 已讀標誌放在這裡，直接在訊息行內部 */}
                          {message.sender === "user" && (
                            <div className={styles.messageStatus}>
                              {message.read ? (
                                <CheckAll size={18} className={styles.readIcon} />
                              ) : (
                                <Check size={18} className={styles.unreadIcon} />
                              )}
                            </div>
                          )}
                          <div className={styles.messageContent}>
                            {message.fileType ? (
                              message.fileType === 'image' ? (
                                <img
                                  src={message.fileUrl}
                                  alt="圖片訊息"
                                  className={styles.messageImage}
                                  onClick={() => handleImageClick(message.fileUrl)} // 確保這裡也使用預覽功能
                                />
                              ) : (
                                <video controls className={styles.messageVideo}>
                                  <source src={message.fileUrl} type="video/mp4" />
                                  您的瀏覽器不支持影片播放
                                </video>
                              )
                            ) : (
                              <div className={styles.messageText}>
                                {renderMessageContent(message)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}

                {/* 如果未登入，顯示登入提示 */}
                {!isAuthenticated && (
                  <div className={styles.authPromptContainer}>
                    <div className={styles.authPrompt}>
                      <p>登入後才能發送訊息</p>
                      <button
                        className={styles.loginButton}
                        onClick={handleLoginRedirect}
                      >
                        立即登入
                      </button>
                    </div>
                  </div>
                )}

                {showScrollButton && (
                  <button
                    className={`${styles.scrollToBottomButton} ${styles.visible}`}
                    onClick={scrollToBottom}
                    aria-label="滾動到底部"
                  >
                    <ChevronDown />
                  </button>
                )}
                <div ref={messagesEndRef} />
                {Object.keys(typingUsers).length > 0 && (
                  <div className={styles.typingIndicator}>
                    <div className={styles.typingDots}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span>客服人員正在輸入...</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.chatFooter}>
              {isPreviewOpen && (
                <div className={styles.filePreviewArea}>
                  {selectedFiles.map((fileObj) => (
                    <div key={fileObj.id} className={styles.filePreviewItem}>
                      <button
                        className={styles.removeFileButton}
                        onClick={() => removeFile(fileObj.id)}
                      >
                        <X size={14} />
                      </button>
                      {fileObj.type === 'image' ? (
                        <img src={fileObj.url} alt="預覽" />
                      ) : (
                        <video>
                          <source src={fileObj.url} type={fileObj.file.type} />
                          您的瀏覽器不支持影片預覽
                        </video>
                      )}
                      {/* 移除單獨的發送按鈕 */}
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={handleSendMessage} className={styles.messageForm}>
                <div className={styles.inputContainer}>
                  <input
                    id="messageInput"
                    type="text"
                    placeholder={isAuthenticated ? "輸入訊息..." : "請先登入後再發送訊息"}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    className={`${styles.messageInput} ${!isAuthenticated ? styles.disabledInput : ''}`}
                    autoComplete="off"
                    disabled={!isAuthenticated} // 未登入時禁用輸入
                  />
                </div>
                <div className="image-send-emoji-btn d-flex align-items-center">
                  <div className={styles.emojiButtonContainer}>
                    <button
                      type="button"
                      className={`${styles.emojiButton} ${!isAuthenticated ? styles.disabledButton : ''}`}
                      onMouseEnter={() => setIsEmojiHovered(true)}
                      onMouseLeave={() => setIsEmojiHovered(false)}
                      onClick={toggleEmojiPicker}
                      disabled={!isAuthenticated} // 未登入時禁用
                    >
                      <img
                        src={isEmojiHovered && isAuthenticated
                          ? "/images/chatRoom/emoji-active.svg"
                          : "/images/chatRoom/emoji-origin.svg"}
                        alt=""
                      />
                    </button>
                    {showEmojiPicker && (
                      <div className={styles.emojiPickerContainer} ref={emojiPickerRef}>
                        <EmojiPicker
                          onEmojiClick={onEmojiClick}
                          width={300}
                          height={400}
                          defaultSkinTone={SkinTones.MEDIUM}
                          searchDisabled
                          previewConfig={{ showPreview: false }}
                          theme="light" // 或 'dark' 或 'auto'
                          emojiStyle="native"
                          categories={['smileys_people', 'animals_nature', 'food_drink', 'travel_places', 'activities', 'objects', 'symbols', 'flags']}
                        />
                      </div>
                    )}
                  </div>
                  <>
                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                      disabled={!isAuthenticated} // 未登入時禁用
                    />
                    <button
                      type="button"
                      className={`${styles.imageButton} ${!isAuthenticated ? styles.disabledButton : ''}`}
                      onMouseEnter={() => setIsImageHovered(true)}
                      onMouseLeave={() => setIsImageHovered(false)}
                      onClick={() => isAuthenticated && fileInputRef.current.click()}
                      disabled={!isAuthenticated} // 未登入時禁用
                    >
                      <img
                        src={isImageHovered && isAuthenticated
                          ? "/images/chatRoom/image-update-active.svg"
                          : "/images/chatRoom/image-update-origin.svg"}
                        alt="上傳圖片或影片"
                      />
                    </button>
                  </>
                  <button
                    type="submit"
                    className={`${styles.sendButton} ${!isAuthenticated ? styles.disabledButton : ''}`}
                    disabled={!isAuthenticated || (newMessage.trim() === "" && selectedFiles.length === 0)} // 未登入時禁用
                  >
                    <img src="/images/chatRoom/send-origin.svg" alt="" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </CSSTransition>

      <div className={styles.chatButtonWrapper}>
        <CSSTransition
          in={!isOpen}
          timeout={300}
          classNames={{
            enter: styles.chatButtonEnter,
            enterActive: styles.chatButtonEnterActive,
            exit: styles.chatButtonExit,
            exitActive: styles.chatButtonExitActive,
          }}
          unmountOnExit
          nodeRef={buttonRef}
        >
          <Button ref={buttonRef} variant="primary" className={styles.chatButton} onClick={toggleChat}>
            <img src="/images/chatRoom/server-origin.svg" alt="" />
          </Button>
        </CSSTransition>
      </div>

      {enlargeImage && (
        <div className={styles.imageViewerOverlay} onClick={closeImageViewer}>
          <div className={styles.imageViewerContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.imageViewerClose} onClick={closeImageViewer}>
              <X size={24} />
            </button>
            <img src={enlargeImage} alt="放大圖片" className={styles.enlargedImage} />
          </div>
        </div>
      )}
    </div>
  )
}

