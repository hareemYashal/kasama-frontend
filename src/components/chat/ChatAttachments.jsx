import React from 'react'

 export const RenderAttachments = ({msg}) => {
    const attachments = msg.files || [];
    const attachmentUrls = msg.attachmentUrls || [];

    if (attachments.length === 0 && !msg.fileUrl) return null;

    // Handle old single file format for backward compatibility
    if (msg.fileUrl && !attachments.length) {
      return (
        <img
          src={msg.fileUrl || "/placeholder.svg"}
          className="mt-2 rounded-lg max-w-full h-auto"
          alt="Message attachment"
        />
      );
    }

    return (
      <div className="mt-2 space-y-2">
        {attachments.map((file, index) => {
          const fileUrl = attachmentUrls[index] || file.url || file.fileUrl;

          return (
            <img
              key={index}
              src={fileUrl || "/placeholder.svg"}
              className="rounded-lg max-w-full h-auto"
              alt={file.name || "Attachment"}
            />
          );
        })}
      </div>
    );
  };

