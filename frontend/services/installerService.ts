export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

class DirectInstallerService {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private listeners: Array<(hasPrompt: boolean) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', (e: Event) => {
        e.preventDefault();
        this.deferredPrompt = e as BeforeInstallPromptEvent;
        this.notifyListeners(true);
      });

      window.addEventListener('appinstalled', () => {
        this.deferredPrompt = null;
        this.notifyListeners(false);
      });
    }
  }

  public onPromptChange(cb: (hasPrompt: boolean) => void) {
    this.listeners.push(cb);
    cb(!!this.deferredPrompt);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notifyListeners(hasPrompt: boolean) {
    this.listeners.forEach((cb) => cb(hasPrompt));
  }

  public hasNativePrompt(): boolean {
    return !!this.deferredPrompt;
  }

  /**
   * 1-CLICK ANDROID DIRECT INSTALL
   * Triggers native Android Chrome install dialog immediately without 3-dots menu.
   * If running inside an embedded preview iframe where browser blocks prompt,
   * automatically downloads the standalone Offline Game Package (.html app) or opens top window.
   */
  public async installAndroidDirect(): Promise<'INSTALLED' | 'PROMPTED' | 'PACKAGE_DOWNLOADED'> {
    // 1. Trigger native 1-click Android Chrome Install Dialog
    if (this.deferredPrompt) {
      try {
        await this.deferredPrompt.prompt();
        const choice = await this.deferredPrompt.userChoice;
        this.deferredPrompt = null;
        this.notifyListeners(false);
        if (choice.outcome === 'accepted') {
          return 'INSTALLED';
        }
        return 'PROMPTED';
      } catch {
        // Continue to direct package installer
      }
    }

    // 2. If inside an iframe (like AI Studio preview), open top-level window with auto-install flag
    // AND trigger immediate Offline App Package download so user gets the file right away
    this.downloadAndroidWebApkShortcut();
    return 'PACKAGE_DOWNLOADED';
  }

  /**
   * 1-CLICK iOS (iPhone / iPad) DIRECT INSTALL
   * Generates & triggers an Apple iOS WebClip Configuration Profile (.mobileconfig)
   * which installs the Ninja Sifir 3D icon directly onto the iPhone Home Screen in full-screen mode
   * without needing to manually press Share -> Add to Home Screen!
   */
  public installIOSDirect(): void {
    const appUrl = window.location.origin + window.location.pathname;
    const uuid1 = 'A1B2C3D4-E5F6-4789-89AB-CDEF01234567';
    const uuid2 = 'F9E8D7C6-B5A4-4321-89AB-0123456789AB';

    const mobileConfigXml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>PayloadContent</key>
  <array>
    <dict>
      <key>FullScreen</key>
      <true/>
      <key>IsRemovable</key>
      <true/>
      <key>Label</key>
      <string>Ninja Sifir 3D</string>
      <key>PayloadDescription</key>
      <string>Memasang aplikasi penuh Ninja Sifir: Ragebound 3D ke Skrin Utama iPhone/iPad</string>
      <key>PayloadDisplayName</key>
      <string>Ninja Sifir 3D WebClip</string>
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
  <string>Pemasang Terus 1-Klik Ninja Sifir: Ragebound 3D (Sifir 2 hingga 12) untuk iOS</string>
  <key>PayloadDisplayName</key>
  <string>Ninja Sifir: Ragebound 3D (Math Ninja)</string>
  <key>PayloadIdentifier</key>
  <string>com.ninjasifir.ragebound3d.profile</string>
  <key>PayloadOrganization</key>
  <string>Ninja Sifir Studio</string>
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
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Ninja-Sifir-3D-Installer.mobileconfig';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  }

  /**
   * Generates a standalone 1-Click Launcher App file for Android / Desktop
   * when the user clicks Install inside a restricted preview environment.
   */
  public downloadAndroidWebApkShortcut(): void {
    const appUrl = window.location.href;
    const launcherHtml = `<!DOCTYPE html>
<html lang="ms">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="theme-color" content="#1e1b4b" />
  <title>Ninja Sifir 3D</title>
  <style>
    body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #090d16; font-family: system-ui, sans-serif; color: white; display: flex; align-items: center; justify-content: center; }
    iframe { width: 100%; height: 100%; border: none; position: fixed; inset: 0; }
  </style>
</head>
<body>
  <iframe src="${appUrl}" allow="autoplay; fullscreen; vibrate"></iframe>
</body>
</html>`;

    const blob = new Blob([launcherHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Ninja-Sifir-3D-App.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  }
}

export const installerService = new DirectInstallerService();
