import * as React from "react";
import { usePageTitleStore } from "@/stores/page-title.store";

/**
 * Sets the dynamic page title shown in the AppHeader for detail/sub pages.
 * Automatically clears the title when the component unmounts.
 *
 * @param title - The display name to show (e.g. product name, supplier name).
 *                Pass `null` or `undefined` to skip setting (e.g. while loading).
 */
export function usePageTitle(title: string | null | undefined) {
  const setDynamicTitle = usePageTitleStore((s) => s.setDynamicTitle);

  React.useEffect(() => {
    if (title) {
      setDynamicTitle(title);
    }
    return () => {
      setDynamicTitle(null);
    };
  }, [title, setDynamicTitle]);
}
