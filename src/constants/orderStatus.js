export const ORDER_STATUSES = [
  { id: 'pending', label: 'અંદાજિત', english: 'Pending', badgeClass: 'status-pending' },
  { id: 'confirmed', label: 'કન્ફર્મ', english: 'Confirmed', badgeClass: 'status-confirmed' },
  { id: 'done', label: 'કામ પૂર્ણ', english: 'Done', badgeClass: 'status-done' },
];

export function getStatusMeta(statusId) {
  return (
    ORDER_STATUSES.find((s) => s.id === statusId) || ORDER_STATUSES[0]
  );
}
