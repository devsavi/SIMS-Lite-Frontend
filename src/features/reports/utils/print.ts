export function triggerPrint(): void {
  if (typeof window !== "undefined") {
    window.print();
  }
}
