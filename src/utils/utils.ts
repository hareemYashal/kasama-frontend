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
    const dateKey = formatDateForGroup(message.timestamp || message.createdAt);

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }

    grouped[dateKey].push(message);
  });

  return grouped;
};

export const fileToBuffer = (file) => {
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
export const uploadToS3 = async ({
  file,
  BASE_URL,
  token,
  folder = "chat-uploads",
}) => {
  try {
    const form = new FormData();
    form.append("file", file);
    // You can optionally pass folder via query or body. Using query here:
    const endpoint = `${BASE_URL}/files/upload?folder=${encodeURIComponent(
      folder
    )}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: token ? {Authorization: `Bearer ${token}`} : undefined,
      body: form,
    });

    if (!res.ok) {
      console.warn("[uploadToS3] Upload failed with status:", res.status);
      return null;
    }
    const json = await res.json();
    if (json?.success && json?.data?.url) {
      return json.data;
    }
    return null;
  } catch (e) {
    console.error("[uploadToS3] Error:", e);
    return null;
  }
};


  export const availableReactions = ["❤️", "😂", "😮", "😢", "😡", "👍", "👎", "🔥"];
