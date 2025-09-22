function DebugPanel({ data }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "10px",
        right: "10px",
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "10px",
        maxWidth: "300px",
        maxHeight: "200px",
        overflow: "auto",
        fontSize: "12px",
        borderRadius: "8px",
        zIndex: 9999
      }}
    >
      <strong>Data Debug:</strong>
      <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
export default DebugPanel;