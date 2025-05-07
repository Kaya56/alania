// components/PlaceholderContent.jsx
function PlaceholderContent({ label }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-gray-600">
      <p>{label} : En cours de développement</p>
    </div>
  );
}

export default PlaceholderContent;