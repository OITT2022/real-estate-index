interface Props {
  onLoadSample: () => void;
}

export function Toolbar({ onLoadSample }: Props) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
      <button onClick={onLoadSample}>Load Sample Project</button>
    </div>
  );
}
