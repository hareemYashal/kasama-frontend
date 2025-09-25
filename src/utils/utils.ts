  export const formatTime = (date) => {
    return new Date(date).toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  // Format date for grouping (e.g., "Today", "Yesterday", "April 15, 2024")
  export const formatDateForGroup = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  // Group messages by date
  export const groupMessagesByDate = (messages) => {
    const grouped = {};

    messages.forEach((message) => {
      const dateKey = formatDateForGroup(
        message.timestamp || message.createdAt
      );

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      grouped[dateKey].push(message);
    });

    return grouped;
  };

  export   const fileToBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const buffer = new Uint8Array(arrayBuffer);
        resolve({
          buffer: Array.from(buffer),
          name: file.name,
          type: file.type,
          size: file.size,
        });
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };
   export const bufferToUrl = (bufferData, type) => {
    const uint8Array = new Uint8Array(bufferData.buffer);
    const blob = new Blob([uint8Array], {type});
    return URL.createObjectURL(blob);
  };