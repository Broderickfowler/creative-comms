export async function copyToClipboard(text: string): Promise<void> {
  if (!text.trim()) throw new Error("Add a message before copying.");
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      /* Try the browser's user-initiated fallback. */
    }
  }
  const field = document.createElement("textarea");
  field.value = text;
  field.readOnly = true;
  field.style.position = "fixed";
  field.style.opacity = "0";
  const focused = document.activeElement;
  document.body.appendChild(field);
  try {
    field.select();
    if (!document.execCommand("copy"))
      throw new Error(
        "Copy failed. Select and copy the editable message manually.",
      );
  } finally {
    field.remove();
    if (focused instanceof HTMLElement) focused.focus();
  }
}
