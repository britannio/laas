'use client';

import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  NodeTypes,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface NodeData {
  label: string;
  action?: string;
  condition?: string;
  output?: string | null;
  isExecuting: boolean;
}

const DecisionNode = ({ data }: { data: NodeData }) => (
  <div className="p-4 rounded-lg border-2 border-orange-500 bg-orange-100 min-w-[150px]">
    <Handle type="target" position={Position.Top} className="w-3 h-3" />
    <div className="font-bold text-orange-700">{data.label}</div>
    <div className="text-sm text-orange-600">{data.condition}</div>
    {data.isExecuting && (
      <div className="mt-2 text-xs bg-orange-500 text-white px-2 py-1 rounded">
        Evaluating...
      </div>
    )}
    <Handle 
      type="source" 
      position={Position.Bottom} 
      id="true" 
      className="w-3 h-3 -ml-6" 
    />
    <Handle 
      type="source" 
      position={Position.Bottom} 
      id="false" 
      className="w-3 h-3 ml-6" 
    />
  </div>
);

const ActionNode = ({ data }: { data: NodeData }) => (
  <div className="p-4 rounded-lg border-2 border-blue-500 bg-blue-100 min-w-[150px]">
    <Handle type="target" position={Position.Top} className="w-3 h-3" />
    <div className="font-bold text-blue-700">{data.label}</div>
    <div className="text-sm text-blue-600">{data.action}</div>
    {data.output && (
      <div className="mt-2 text-xs bg-blue-200 text-blue-700 px-2 py-1 rounded">
        Output: {data.output}
      </div>
    )}
    {data.isExecuting && (
      <div className="mt-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">
        Executing...
      </div>
    )}
    <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
  </div>
);

const nodeTypes: NodeTypes = {
  decision: DecisionNode,
  action: ActionNode,
};

export default function WorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ 
      ...params, 
      markerEnd: { type: MarkerType.ArrowClosed },
      animated: false
    }, eds)),
    [setEdges]
  );

  const addActionNode = () => {
    const newNode: Node<NodeData> = {
      id: `action-${Date.now()}`,
      type: 'action',
      position: { x: Math.random() * 300, y: Math.random() * 300 },
      data: {
        label: 'New Action',
        action: 'Custom action',
        output: null,
        isExecuting: false,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const addDecisionNode = () => {
    const newNode: Node<NodeData> = {
      id: `decision-${Date.now()}`,
      type: 'decision',
      position: { x: Math.random() * 300, y: Math.random() * 300 },
      data: {
        label: 'New Decision',
        condition: 'Custom condition',
        isExecuting: false,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div className="w-full h-[600px]">
      <div className="mb-4 flex gap-2">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={addActionNode}
        >
          Add Action Node
        </button>
        <button
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          onClick={addDecisionNode}
        >
          Add Decision Node
        </button>
      </div>
      <div className="h-[500px] border border-gray-200 rounded">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          snapToGrid
          snapGrid={[15, 15]}
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
}