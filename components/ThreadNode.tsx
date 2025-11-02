import React, { useState } from 'react';

type ThreadNodeProps = {
  title: string;
  children?: React.ReactNode;
};

function ThreadNode({ title, children }: ThreadNodeProps) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="ml-4 mt-1">
      <div
        onClick={() => setExpanded(!expanded)}
        className="cursor-pointer select-none font-medium text-purple-700"
      >
        {expanded ? '▼' : '▶'} {title}
      </div>
      {expanded && <div className="ml-4 border-l border-gray-300 pl-3">{children}</div>}
    </div>
  );
}

export default React.memo(ThreadNode);
