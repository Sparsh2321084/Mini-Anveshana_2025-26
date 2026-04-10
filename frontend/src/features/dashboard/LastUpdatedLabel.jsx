import { useEffect, useState } from 'react';

function formatTimeSince(timestamp) {
  if (!timestamp) return 'Never';

  const diffSeconds = Math.max(0, Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000));

  if (diffSeconds < 60) return `${diffSeconds}s ago`;

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  return `${diffHours}h ago`;
}

function LastUpdatedLabel({ timestamp }) {
  const [label, setLabel] = useState(() => formatTimeSince(timestamp));

  useEffect(() => {
    setLabel(formatTimeSince(timestamp));

    const timer = window.setInterval(() => {
      setLabel(formatTimeSince(timestamp));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [timestamp]);

  return <span>{label}</span>;
}

export default LastUpdatedLabel;
