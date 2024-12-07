import { memo } from 'react';
import { Handle, Position } from 'reactflow';

export const AddDyesNode = memo(() => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <Handle type="target" position={Position.Top} />
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Add Dyes</h3>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-xs text-gray-500">Dye A</label>
            <input
              type="number"
              min="0"
              max="10"
              defaultValue="0"
              className="w-full px-2 py-1 text-sm border rounded"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Dye B</label>
            <input
              type="number"
              min="0"
              max="10"
              defaultValue="0"
              className="w-full px-2 py-1 text-sm border rounded"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Dye C</label>
            <input
              type="number"
              min="0"
              max="10"
              defaultValue="0"
              className="w-full px-2 py-1 text-sm border rounded"
            />
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});