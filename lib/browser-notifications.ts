export type BrowserPermissionStatus = "default" | "granted" | "denied" | "unsupported";

/**
 * Checks if browser Web Notifications API is supported
 */
export function isBrowserNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

/**
 * Get current browser notification permission status
 */
export function getBrowserNotificationPermission(): BrowserPermissionStatus {
  if (!isBrowserNotificationSupported()) {
    return "unsupported";
  }
  return Notification.permission as BrowserPermissionStatus;
}

/**
 * Request user permission for browser notifications
 */
export async function requestBrowserNotificationPermission(): Promise<BrowserPermissionStatus> {
  if (!isBrowserNotificationSupported()) {
    return "unsupported";
  }

  try {
    const permission = await Notification.requestPermission();
    return permission as BrowserPermissionStatus;
  } catch (err) {
    console.warn("Notification.requestPermission error:", err);
    return "denied";
  }
}

/**
 * Send a native browser desktop notification if permission is granted
 */
export function sendBrowserNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: any;
    onClickUrl?: string;
  }
): boolean {
  if (!isBrowserNotificationSupported() || Notification.permission !== "granted") {
    return false;
  }

  try {
    const notif = new Notification(title, {
      body: options?.body,
      icon: options?.icon || "/favicon.ico",
      badge: options?.badge,
      tag: options?.tag,
    });

    if (options?.onClickUrl && typeof window !== "undefined") {
      notif.onclick = () => {
        window.focus();
        window.location.href = options.onClickUrl!;
        notif.close();
      };
    }

    return true;
  } catch (err) {
    console.warn("Failed to dispatch browser notification:", err);
    return false;
  }
}
