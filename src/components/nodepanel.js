export const NodePanel = ({ nodes = [] }) => {
  const onDragStart = (event, node) => {
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify({ label: node.data?.label, type: node.type })
    );
    event.dataTransfer.effectAllowed = "move";
  };
  return (
    <div
      style={{
        width: 220,
        height: "100vh",
        padding: 12,
        background: "#f9f9f9",
        borderRight: "1px solid #ddd",
        overflowY: "auto",
      }}
    >
      <h4 style={{ marginBottom: 12 }}>Nodes</h4>

      {nodes.map((node) => (
        <div
          key={node.data?.label}
          draggable
          onDragStart={(e) => onDragStart(e, node)}
          style={{
            padding: 8,
            marginBottom: 8,
            border: "1px solid #ccc",
            borderRadius: 4,
            background: "#fff",
            cursor: "grab",
          }}
        >
          {node.data?.label}
        </div>
      ))}
    </div>
  );
};
