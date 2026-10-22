export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface Window {
    __deferredPwaPrompt?: BeforeInstallPromptEvent | null;
    __ninjaIcon512Png?: string;
  }
}

class DirectInstallerService {
  private listeners: Array<(hasPrompt: boolean) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', (e: Event) => {
        e.preventDefault();
        window.__deferredPwaPrompt = e as BeforeInstallPromptEvent;
        this.notifyListeners(true);
      });

      window.addEventListener('pwa-prompt-ready', () => {
        this.notifyListeners(!!window.__deferredPwaPrompt);
      });

      window.addEventListener('appinstalled', () => {
        window.__deferredPwaPrompt = null;
        this.notifyListeners(false);
      });
    }
  }

  public onPromptChange(cb: (hasPrompt: boolean) => void) {
    this.listeners.push(cb);
    cb(this.hasNativePrompt());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notifyListeners(hasPrompt: boolean) {
    this.listeners.forEach((cb) => cb(hasPrompt));
  }

  public hasNativePrompt(): boolean {
    return typeof window !== 'undefined' && !!window.__deferredPwaPrompt;
  }

  public isRunningInIframe(): boolean {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  }

  public isInAppBrowser(): boolean {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    return /FBAN|FBAV|Instagram|WhatsApp|Telegram|Line|TikTok|Wv/i.test(ua);
  }

  /**
   * Forces an Android phone to open the current URL directly inside the native
   * Google Chrome app (escaping iframes, WhatsApp, Telegram, or WebViews).
   */
  public openInNativeAndroidChrome(): void {
    const targetUrl = new URL(window.location.href);
    targetUrl.searchParams.set('autoinstall', 'android');
    const cleanUrlNoProtocol = targetUrl.toString().replace(/^https?:\/\//i, '');
    const scheme = window.location.protocol === 'http:' ? 'http' : 'https';

    // Official Android Chrome Intent URI
    const chromeIntentUrl = `intent://${cleanUrlNoProtocol}#Intent;scheme=${scheme};package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(
      targetUrl.toString()
    )};end`;

    const ua = navigator.userAgent.toLowerCase();
    if (/android/.test(ua)) {
      window.location.href = chromeIntentUrl;
    } else {
      window.open(targetUrl.toString(), '_blank', 'noopener,noreferrer');
    }
  }

  /**
   * 1-CLICK ANDROID INSTALL TO HOME SCREEN
   */
  public async installToAndroidHomeScreen(): Promise<
    'INSTALLED' | 'PROMPT_SHOWN' | 'LAUNCHED_CHROME_INTENT' | 'SHOW_INSTANT_MODAL'
  > {
    const promptEvent = typeof window !== 'undefined' ? window.__deferredPwaPrompt : null;

    // 1. If native Android Chrome WebAPK prompt is ready, trigger it immediately!
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        window.__deferredPwaPrompt = null;
        this.notifyListeners(false);
        if (choice.outcome === 'accepted') {
          return 'INSTALLED';
        }
        return 'PROMPT_SHOWN';
      } catch {
        // Fallback below
      }
    }

    // 2. If user is inside an iframe (like AI Studio Preview) or In-App Browser (WhatsApp/Telegram)
    // on an Android phone, automatically jump into native Google Chrome via Android Intent!
    const isAndroid = /android/i.test(navigator.userAgent);
    if (isAndroid && (this.isRunningInIframe() || this.isInAppBrowser())) {
      this.openInNativeAndroidChrome();
      return 'LAUNCHED_CHROME_INTENT';
    }

    return 'SHOW_INSTANT_MODAL';
  }

  /**
   * 1-CLICK iOS (iPhone / iPad) HOME SCREEN ICON INSTALLER (.mobileconfig WebClip)
   */
  public installToIOSHomeScreen(): 'PROFILE_TRIGGERED' | 'OPENED_TOP_WINDOW' {
    if (this.isRunningInIframe()) {
      const targetUrl = new URL(window.location.href);
      targetUrl.searchParams.set('autoinstall', 'ios');
      window.open(targetUrl.toString(), '_blank', 'noopener,noreferrer');
      return 'OPENED_TOP_WINDOW';
    }

    const appUrl = window.location.origin + window.location.pathname;
    const uuid1 = 'A1B2C3D4-E5F6-4789-89AB-CDEF01234567';
    const uuid2 = 'F9E8D7C6-B5A4-4321-89AB-0123456789AB';

    const rawPng = (window.__ninjaIcon512Png || '').replace(/^data:image\/png;base64,/, '');
    const iconTag = rawPng ? `<key>Icon</key>\n      <data>${rawPng}</data>` : '';

    const mobileConfigXml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>PayloadContent</key>
  <array>
    <dict>
      <key>FullScreen</key>
      <true/>
      ${iconTag}
      <key>IsRemovable</key>
      <true/>
      <key>Label</key>
      <string>Ninja Sifir 3D</string>
      <key>PayloadDescription</key>
      <string>Memasang Ikon Aplikasi Ninja Sifir 3D ke Skrin Utama iPhone/iPad</string>
      <key>PayloadDisplayName</key>
      <string>Ninja Sifir 3D Home Screen App</string>
      <key>PayloadIdentifier</key>
      <string>com.ninjasifir.ragebound3d.webclip</string>
      <key>PayloadType</key>
      <string>com.apple.webClip.managed</string>
      <key>PayloadUUID</key>
      <string>${uuid1}</string>
      <key>PayloadVersion</key>
      <integer>1</integer>
      <key>Precomposed</key>
      <true/>
      <key>URL</key>
      <string>${appUrl}</string>
    </dict>
  </array>
  <key>PayloadDescription</key>
  <string>Memasang ikon aplikasi penuh Ninja Sifir 3D terus ke Skrin Utama (Home Screen) supaya boleh diklik dan terus dimainkan.</string>
  <key>PayloadDisplayName</key>
  <string>Install Ikon Ninja Sifir 3D</string>
  <key>PayloadIdentifier</key>
  <string>com.ninjasifir.ragebound3d.profile</string>
  <key>PayloadOrganization</key>
  <string>Ninja Sifir 3D</string>
  <key>PayloadRemovalDisallowed</key>
  <false/>
  <key>PayloadType</key>
  <string>Configuration</string>
  <key>PayloadUUID</key>
  <string>${uuid2}</string>
  <key>PayloadVersion</key>
  <integer>1</integer>
</dict>
</plist>`;

    const blob = new Blob([mobileConfigXml], { type: 'application/x-apple-aspen-config' });
    const url = URL.createObjectURL(blob);
    window.location.assign(url);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return 'PROFILE_TRIGGERED';
  }
}

export const installerService = new DirectInstallerService();
