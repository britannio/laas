import { memo } from 'react';
import { Handle, Position } from 'reactflow';

export const GetColorNode = memo(() => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <Handle type="target" position={Position.Top} />
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Get Color</h3>
        <div className="h-4 w-full bg-gray-100 rounded" />
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});