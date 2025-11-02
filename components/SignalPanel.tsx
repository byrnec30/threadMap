'use client';

export default function SignalPanel() {
  return (
    <div className="p-4 text-sm text-gray-600">
      <h2 className="font-semibold mb-2">Signal Panel</h2>
      <ul className="space-y-1">
        <li>Render count: —</li>
        <li>Latency: — ms</li>
        <li>FPS: —</li>
      </ul>
    </div>
  );
}
