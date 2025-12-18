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

export const Workflow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

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
    return apiNodes.map((node, index) => ({
      id: node[1].nodeId,
      type: node[1].nodeType,
      position: {
        x: 10,
        y: 200 * index,
      },
      data: {
        label: node[1].nodeName,
        params: node[1].nodeParams,
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
    fetch("https://rubik.valyx.com/workflows/twflow_b210db0a85")
      .then((res) => res.json())
      .then((data) => {
        if (Object.keys(data.definition.nodes).length === 0) {
          setNodes([
            {
              id: "node-1",
              type: "default",
              position: { x: 50, y: 100 },
              data: { label: "Node 1" },
            },
            {
              id: "node-2",
              type: "default",
              position: { x: 50, y: 200 },
              data: { label: "Node 2" },
            },
            {
              id: "node-3",
              type: "default",
              position: { x: 50, y: 300 },
              data: { label: "Node 3" },
            },
          ]);
          setEdges([]);
        } else {
          transformAndSetWorkflow(data.definition);
        }
      });
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const rawData = event.dataTransfer.getData("application/reactflow");
      if (!rawData) return; // nothing to parse

      let data;
      try {
        data = JSON.parse(rawData);
      } catch (err) {
        console.error("Failed to parse drag data", err, rawData);
        return;
      }

      if (!reactFlowInstance) return;

      const bounds = event.target.getBoundingClientRect();
      const position = reactFlowInstance.project({
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
        display: "flex", // horizontal layout
        height: "100vh", // full viewport height
        width: "100vw", // optional, full width
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
