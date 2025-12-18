import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import { useCallback, useEffect, useState } from "react";
import { NodePanel } from "./nodepanel.js";
import { DEFAULT_NODES, DEFAULT_EDGES } from "../constants/defaultNodes";
import { WORKFLOW_API_BASE, DEFAULT_WORKFLOW_ID } from "../constants/api";
import { NODE_DROP_TYPE } from "../constants/reactflow";

export const Workflow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const NODE_X_POSITION = 10;
  const NODE_Y_SPACING = 200;
  const fetchWorkflow = async (workflowId) => {
    try {
      const res = await fetch(`${WORKFLOW_API_BASE}/${workflowId}`);
      const data = await res.json();
      return data.definition;
    } catch (err) {
      console.error("Failed to fetch workflow:", err);
      return { nodes: {}, edges: [] };
    }
  };

  const onConnect = useCallback((connection) => {
    setEdges((prev) =>
      addEdge(
        {
          ...connection,
          animated: true,
          id: `e-${prev.length + 1}`,
        },
        prev
      )
    );
  }, []);

  const uniquePanelNodes = Array.from(
    new Map(nodes.map((node) => [node.data.label, node])).values()
  );
  const transformNodes = (apiNodes) => {
    return apiNodes.map(([_, node], index) => ({
      id: node.nodeId,
      type: "default",
      position: {
        x: NODE_X_POSITION,
        y: NODE_Y_SPACING * index,
      },
      data: {
        label: node.nodeName,
        params: node.nodeParams,
      },
    }));
  };

  const transformEdges = (apiEdges) => {
    return apiEdges.map((edge) => ({
      id: edge.edgeName,
      source: edge.fromNodeId,
      target: edge.toNodeId,
      animated: true,
    }));
  };

  const transformAndSetWorkflow = (data) => {
    const rfNodes = transformNodes(Object.entries(data.nodes));
    const rfEdges = transformEdges(data.edges);
    setNodes(rfNodes);
    setEdges(rfEdges);
  };

  useEffect(() => {
    const loadWorkflow = async () => {
      const definition = await fetchWorkflow(DEFAULT_WORKFLOW_ID);

      if (!definition || Object.keys(definition.nodes).length === 0) {
        setNodes(DEFAULT_NODES);
        setEdges(DEFAULT_EDGES);
      } else {
        transformAndSetWorkflow(definition);
      }
    };

    loadWorkflow();
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const rawData = event.dataTransfer.getData(NODE_DROP_TYPE);
      if (!rawData) return;

      let data;
      try {
        data = JSON.parse(rawData);
      } catch (err) {
        console.error("Failed to parse drag data", err, rawData);
        return;
      }

      if (!reactFlowInstance) return;

      const bounds = event.target.getBoundingClientRect();
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      setNodes((nds) =>
        nds.concat({
          id: `${Date.now()}`,
          type: data.type || "default",
          position,
          data: { label: data.label },
        })
      );
    },
    [reactFlowInstance, setNodes]
  );

  return (
    <div
      className="box"
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
      }}
    >
      <NodePanel nodes={uniquePanelNodes} />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onInit={setReactFlowInstance}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};
