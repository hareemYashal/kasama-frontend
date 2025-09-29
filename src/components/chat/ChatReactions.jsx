export const RenderReactions = ({messageId}) => {
     const getUserReaction = (messageId) => {
    const messageReactions = reactions[messageId] || [];
    return messageReactions.find((r) => r.userId === authUerId);
  };

  const getReactionCounts = (messageId) => {
    const messageReactions = reactions[messageId] || [];
    const counts = {};
    messageReactions.forEach((reaction) => {
      counts[reaction.type] = (counts[reaction.type] || 0) + 1;
    });
    return counts;
  };

    const reactionCounts = getReactionCounts(messageId);
    const userReaction = getUserReaction(messageId);

    if (Object.keys(reactionCounts).length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1">
        {Object.entries(reactionCounts).map(([reactionType, count]) => (
          <button
            key={reactionType}
            onClick={() => {
              if (userReaction && userReaction.type === reactionType) {
                handleRemoveReaction(messageId, reactionType);
              } else {
                handleAddReaction(messageId, reactionType);
              }
            }}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors bg-blue-100 hover:bg-gray-200

            `}
          >
            <span>{reactionType}</span>
            <span className="font-medium">{count}</span>
          </button>
        ))}
      </div>
    );
  };