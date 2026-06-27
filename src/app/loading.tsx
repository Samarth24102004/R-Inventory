export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <iframe 
        src="https://lottie.host/embed/092a0821-d7cf-48c1-bdc9-96f409a15629/VTQyxFR2t2.lottie" 
        style={{ width: '300px', height: '300px', border: 'none', background: 'transparent' }} 
        className="brightness-0 invert pointer-events-none"
      />
    </div>
  );
}
