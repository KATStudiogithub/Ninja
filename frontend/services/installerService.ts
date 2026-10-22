export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

class DirectInstallerService {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private listeners: Array<(hasPrompt: boolean) => void> = [];
  private icon512Base64: string = '';

  constructor() {
    if (typeof window !== 'undefined') {
      // 1. Capture native Android/Chrome WebAPK Install Prompt
      window.addEventListener('beforeinstallprompt', (e: Event) => {
        e.preventDefault();
        this.deferredPrompt = e as BeforeInstallPromptEvent;
        this.notifyListeners(true);
      });

      window.addEventListener('appinstalled', () => {
        this.deferredPrompt = null;
        this.notifyListeners(false);
      });

      // 2. Generate real PNG 192x192 & 512x512 icons so Android Chrome WebAPK
      // & iOS WebClip get a real Home Screen icon
      this.prepareRealPngManifestAndIcons();
    }
  }

  /**
   * Renders the Ninja Sifir 3D icon into real 192x192 and 512x512 PNG Data URLs.
   * Android Chrome requires PNG icons (not just SVG) to trigger the native
   * 1-Click "Add to Home Screen / Install App" WebAPK dialog.
   */
  private prepareRealPngManifestAndIcons() {
    const drawIconCanvas = (size: number): string => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      const s = size / 512;

      // Rounded App Icon Background
      const bgGrad = ctx.createLinearGradient(0, 0, size, size);
      bgGrad.addColorStop(0, '#1e1b4b');
      bgGrad.addColorStop(0.5, '#311042');
      bgGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.roundRect(0, 0, size, size, 115 * s);
      ctx.fill();

      // Ninja Hood Circle
      const hoodGrad = ctx.createLinearGradient(0, 80 * s, 0, 415 * s);
      hoodGrad.addColorStop(0, '#2563eb');
      hoodGrad.addColorStop(1, '#1e3a8a');
      ctx.fillStyle = hoodGrad;
      ctx.beginPath();
      ctx.arc(256 * s, 250 * s, 165 * s, 0, Math.PI * 2);
      ctx.fill();

      // Face Opening
      ctx.fillStyle = '#ffedd5';
      ctx.beginPath();
      ctx.roundRect(136 * s, 185 * s, 240 * s, 95 * s, 45 * s);
      ctx.fill();

      // Red Ninja Headband
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(96 * s, 172 * s, 320 * s, 38 * s);

      // Silver Headband Plate
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(216 * s, 174 * s, 80 * s, 34 * s, 10 * s);
      ctx.fill();

      // Left & Right Pixar Eyes
      const drawEye = (cx: number) => {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(cx * s, 235 * s, 24 * s, 28 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.ellipse(cx * s, 235 * s, 16 * s, 20 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.arc(cx * s, 235 * s, 10 * s, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc((cx - 7) * s, 226 * s, 5 * s, 0, Math.PI * 2);
        ctx.fill();
      };
      drawEye(195);
      drawEye(317);

      // Gold Sifir Badge at bottom
      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6 * s;
      ctx.beginPath();
      ctx.roundRect(136 * s, 382 * s, 240 * s, 76 * s, 24 * s);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = `900 ${Math.round(44 * s)}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('7 × 8', 256 * s, 422 * s);

      return canvas.toDataURL('image/png');
    };

    try {
      const icon192 = drawIconCanvas(192);
      const icon512 = drawIconCanvas(512);
      this.icon512Base64 = icon512.replace(/^data:image\/png;base64,/, '');

      // Update apple-touch-icon with real PNG so iOS Home Screen shows the exact 3D Ninja icon
      const appleIconLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement | null;
      if (appleIconLink && icon192) {
        appleIconLink.href = icon192;
      }
    } catch {
      // Ignore canvas error if SSR
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

  public isRunningInIframe(): boolean {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  }

  /**
   * 1-CLICK ANDROID INSTALL TO HOME SCREEN
   * 1. If native `beforeinstallprompt` is ready, immediately triggers the official Android system
   *    "Install App" dialog that places the Ninja Sifir 3D icon onto the phone's Home Screen.
   * 2. If user is clicking inside an embedded preview iframe (which browsers block from installing),
   *    automatically opens the top-level standalone URL with `?autoinstall=android` so the native
   *    install prompt fires immediately.
   * 3. If browser is still warming up the prompt, returns 'SHOW_INSTANT_MODAL' so user can complete
   *    home-screen placement without downloading any raw HTML file.
   */
  public async installToAndroidHomeScreen(): Promise<'INSTALLED' | 'OPENED_TOP_WINDOW' | 'SHOW_INSTANT_MODAL'> {
    if (this.deferredPrompt) {
      try {
        await this.deferredPrompt.prompt();
        const choice = await this.deferredPrompt.userChoice;
        this.deferredPrompt = null;
        this.notifyListeners(false);
        if (choice.outcome === 'accepted') {
          return 'INSTALLED';
        }
      } catch {
        // Fallback below
      }
    }

    // If inside an iframe (like AI Studio preview), break out to top window so Android Chrome
    // can display the real "Install to Home Screen" prompt!
    if (this.isRunningInIframe()) {
      const targetUrl = new URL(window.location.href);
      targetUrl.searchParams.set('autoinstall', 'android');
      window.open(targetUrl.toString(), '_blank', 'noopener,noreferrer');
      return 'OPENED_TOP_WINDOW';
    }

    return 'SHOW_INSTANT_MODAL';
  }

  /**
   * 1-CLICK iOS (iPhone / iPad) HOME SCREEN ICON INSTALLER
   * Generates & opens an Apple iOS WebClip Configuration Profile (.mobileconfig)
   * complete with embedded Base64 PNG App Icon (`Icon` key), `FullScreen: true`,
   * and `Precomposed: true`. When installed on iPhone, it places the real Ninja Sifir 3D
   * app icon directly on the iPhone Home Screen!
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

    const iconTag = this.icon512Base64
      ? `<key>Icon</key>\n      <data>${this.icon512Base64}</data>`
      : '';

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
