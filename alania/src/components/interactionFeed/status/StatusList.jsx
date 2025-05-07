// components/interactionFeed/status/StatusList.jsx
import StatusItem from "./StatusItem.JSX";

function StatusList({ statuses, onView }) {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md mt-6">
      <h2 className="text-lg font-bold mb-4 text-gray-800">Statuts</h2>
      {statuses.length > 0 ? (
        <ul className="space-y-4">
          {statuses.map((status) => (
            <StatusItem key={status.id} status={status} onView={onView} />
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">Aucun statut disponible</p>
      )}
    </div>
  );
}

export default StatusList;