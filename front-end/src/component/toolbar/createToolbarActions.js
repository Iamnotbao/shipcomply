const action = (actionKey, label, onClick, options = {}) => ({
  actionKey,
  label,
  onClick,
  ...options,
});

export const createBaseToolbarActions = ({
  getControlLabel,
  onSearch,
  onAdd,
  onEdit,
  onConfirm,
  onUnconfirm,
  onPDF,
  onCancel,
  onClose,
}) => [
  action("search", getControlLabel("btn_search", "Search"), onSearch),
  action("add", getControlLabel("btn_add", "Add"), onAdd),
  action("edit", getControlLabel("btn_edit", "Edit"), onEdit),
  action("confirm", getControlLabel("btn_confirm", "Confirm"), onConfirm),
  action(
    "unconfirm",
    getControlLabel("btn_unconfirm", "Unconfirm"),
    onUnconfirm,
  ),
  action("export", getControlLabel("btn_export", "Export"), onPDF),
  action("cancel", getControlLabel("btn_cancel", "Cancel"), onCancel),
  action("close", getControlLabel("btn_close", "Close"), onClose),
];

export const filterHiddenToolbarActions = (actions, hiddenLabels = []) =>
  actions.filter((item) => !hiddenLabels.includes(item.label));

export const createToolbarAction = action;
